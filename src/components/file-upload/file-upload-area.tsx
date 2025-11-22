'use client';

import { useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface FileUploadAreaProps {
  knowledgeBaseId: string;
  currentFileCount: number;
  maxFiles: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = {
  // Documents
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/plain': ['.txt'],
  'application/json': ['.json'],
  'text/markdown': ['.md'],
  'text/csv': ['.csv'],
  // Programming languages
  'text/javascript': ['.js'],
  'application/javascript': ['.jsx'],
  'text/x-python': ['.py'],
  'text/x-java': ['.java'],
  'text/x-c': ['.c'],
  'text/x-c++': ['.cpp'],
  'text/x-csharp': ['.cs'],
  'text/x-go': ['.go'],
  'text/x-rust': ['.rs'],
  'text/x-typescript': ['.ts', '.tsx'],
  'text/html': ['.html'],
  'text/css': ['.css'],
  'application/xml': ['.xml'],
  'text/xml': ['.xml'],
};

interface UploadingFile {
  name: string;
  progress: number;
  abortController: AbortController;
}

interface FailedFile {
  file: File;
  error: string;
}

export function FileUploadArea({
  knowledgeBaseId,
  currentFileCount,
  maxFiles,
}: FileUploadAreaProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(new Map());
  const [failedFiles, setFailedFiles] = useState<FailedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cancelUpload = useCallback((filename: string) => {
    const file = uploadingFiles.get(filename);
    if (file) {
      file.abortController.abort();
      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        newMap.delete(filename);
        return newMap;
      });
      toast.info(`Upload cancelled: ${filename}`);
    }
  }, [uploadingFiles]);

  const uploadFile = useCallback(async (file: File) => {
    const abortController = new AbortController();

    // Add to uploading files
    setUploadingFiles((prev) => {
      const newMap = new Map(prev);
      newMap.set(file.name, {
        name: file.name,
        progress: 0,
        abortController,
      });
      return newMap;
    });

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Upload file with abort signal
      const response = await fetch(
        `/api/knowledge-bases/${knowledgeBaseId}/files`,
        {
          method: 'POST',
          body: formData,
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to upload ${file.name}`);
      }

      // Update progress to 100%
      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(file.name);
        if (existing) {
          newMap.set(file.name, { ...existing, progress: 100 });
        }
        return newMap;
      });

      // Remove from uploading files after a short delay
      setTimeout(() => {
        setUploadingFiles((prev) => {
          const newMap = new Map(prev);
          newMap.delete(file.name);
          return newMap;
        });
      }, 1000);

      return { success: true };
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Upload was cancelled
        setUploadingFiles((prev) => {
          const newMap = new Map(prev);
          newMap.delete(file.name);
          return newMap;
        });
        return { success: false, cancelled: true };
      }

      // Upload failed
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        newMap.delete(file.name);
        return newMap;
      });

      return { success: false, error: errorMessage, file };
    }
  }, [knowledgeBaseId]);

  const retryUpload = useCallback(async (failedFile: FailedFile) => {
    // Remove from failed files list
    setFailedFiles((prev) => prev.filter((f) => f.file.name !== failedFile.file.name));

    const result = await uploadFile(failedFile.file);

    if (result.success) {
      toast.success(`Successfully uploaded ${failedFile.file.name}`);
      router.refresh();
    } else if (!result.cancelled) {
      toast.error(`Failed to upload ${failedFile.file.name}`);
      setFailedFiles((prev) => [...prev, { file: failedFile.file, error: result.error || 'Unknown error' }]);
    }
  }, [uploadFile, router]);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      // Check file limit
      if (currentFileCount + acceptedFiles.length > maxFiles) {
        const errorMsg = `Cannot upload ${acceptedFiles.length} file(s). You can only have ${maxFiles} files per knowledge base.`;
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const reasons = rejectedFiles.map((file) => {
          const errors = file.errors.map((e: any) => e.message).join(', ');
          return `${file.file.name}: ${errors}`;
        });
        const errorMsg = `Some files were rejected:\n${reasons.join('\n')}`;
        setError(errorMsg);
        toast.error('Some files were rejected. Please check file requirements.');
        return;
      }

      if (acceptedFiles.length === 0) {
        return;
      }

      setIsUploading(true);
      let successCount = 0;
      const newFailedFiles: FailedFile[] = [];

      try {
        for (const file of acceptedFiles) {
          const result = await uploadFile(file);

          if (result.success) {
            successCount++;
          } else if (!result.cancelled) {
            newFailedFiles.push({ file: result.file!, error: result.error || 'Unknown error' });
            toast.error(`Failed to upload ${file.name}`);
          }
        }

        // Show success message
        if (successCount > 0) {
          toast.success(`Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}`);
          router.refresh();
        }

        // Add to failed files list
        if (newFailedFiles.length > 0) {
          setFailedFiles((prev) => [...prev, ...newFailedFiles]);
          setError(`Failed to upload ${newFailedFiles.length} file${newFailedFiles.length > 1 ? 's' : ''}. You can retry below.`);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [uploadFile, currentFileCount, maxFiles, router]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: isUploading || currentFileCount >= maxFiles,
  });

  const isDisabled = isUploading || currentFileCount >= maxFiles;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transition-colors
          ${isDragActive && !isDragReject ? 'border-blue-400 bg-blue-500/10' : ''}
          ${isDragReject ? 'border-red-400 bg-red-500/10' : ''}
          ${!isDragActive && !isDisabled ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50' : ''}
          ${isDisabled ? 'border-slate-800 bg-slate-900/50 cursor-not-allowed opacity-60' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="space-y-3 sm:space-y-4">
          {/* Upload Icon */}
          <div className="flex justify-center">
            <svg
              className={`w-10 h-10 sm:w-12 sm:h-12 ${isDragActive ? 'text-blue-400' : 'text-slate-400'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {/* Instructions */}
          <div>
            {isDisabled ? (
              <p className="text-sm sm:text-base text-slate-400">
                {currentFileCount >= maxFiles
                  ? 'Maximum file limit reached. Delete files to upload more.'
                  : 'Uploading...'}
              </p>
            ) : (
              <>
                <p className="text-base sm:text-lg font-medium text-white">
                  {isDragActive
                    ? isDragReject
                      ? 'Invalid file type'
                      : 'Drop files here'
                    : 'Drag and drop your files here'}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  or click to browse (PDF, Word, Text, Code files, etc.)
                </p>
              </>
            )}
          </div>

          {/* Restrictions */}
          {!isDisabled && (
            <div className="text-xs text-slate-400 space-y-1">
              <p className="hidden sm:block">• Supported: PDF, Word (.docx), Text (.txt, .md), JSON, CSV, and code files (.js, .py, .java, etc.)</p>
              <p className="sm:hidden">• PDF, Word, Text, Code files</p>
              <p>• Maximum file size: 10MB</p>
              <p>• Maximum {maxFiles} files per knowledge base</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.size > 0 && (
        <div className="space-y-2">
          {Array.from(uploadingFiles.values()).map((file) => (
            <div key={file.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white truncate flex-1">{file.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{file.progress}%</span>
                  <button
                    onClick={() => cancelUpload(file.name)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Cancel upload"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${file.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-red-900/20 border border-red-800/50 p-4">
          <p className="text-sm text-red-200 whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Failed Files with Retry */}
      {failedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white">Failed Uploads</h3>
          {failedFiles.map((failedFile) => (
            <div
              key={failedFile.file.name}
              className="flex items-center justify-between p-3 border border-red-800/50 rounded-xl bg-red-900/20"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {failedFile.file.name}
                </p>
                <p className="text-xs text-red-300 mt-1">{failedFile.error}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => retryUpload(failedFile)}
                  className="text-blue-400 hover:text-blue-300 border-blue-500/50"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Retry
                </Button>
                <button
                  onClick={() => setFailedFiles((prev) => prev.filter((f) => f.file.name !== failedFile.file.name))}
                  className="text-slate-400 hover:text-slate-300 p-1"
                  title="Remove from list"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
