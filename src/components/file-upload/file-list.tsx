'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Database } from '@/types/database';
import { DeleteFileDialog } from './delete-file-dialog';

type File = Database['public']['Tables']['files']['Row'];

interface FileListProps {
  files: File[];
}

type SortOption = 'date' | 'name' | 'size' | 'pages';
type FilterStatus = 'all' | 'ready' | 'processing' | 'uploading' | 'failed';

export function FileList({ files }: FileListProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteClick = (file: File) => {
    setSelectedFile(file);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (fileId: string) => {
    setIsDeleting(true);
    const filename = selectedFile?.file_name || 'file';

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete file');
      }

      toast.success(`Successfully deleted ${filename}`);
      // Refresh the page to update the file list
      router.refresh();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error(
        error instanceof Error ? error.message : `Failed to delete ${filename}`
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      uploading: { color: 'bg-blue-100 text-blue-800', label: 'Uploading' },
      processing: { color: 'bg-yellow-100 text-yellow-800', label: 'Processing' },
      ready: { color: 'bg-green-100 text-green-800', label: 'Ready' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ready;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Filter and sort files
  const filteredAndSortedFiles = files
    .filter((file) => {
      // Filter by status
      if (filterStatus !== 'all' && file.status !== filterStatus) {
        return false;
      }

      // Filter by search query
      if (searchQuery && !file.file_name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.file_name.localeCompare(b.file_name);
        case 'size':
          return (b.file_size || 0) - (a.file_size || 0);
        case 'pages':
          return (b.page_count || 0) - (a.page_count || 0);
        case 'date':
        default:
          return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
      }
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Files</h2>
        <span className="text-sm text-gray-500">
          {filteredAndSortedFiles.length} {filteredAndSortedFiles.length === 1 ? 'file' : 'files'}
        </span>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="size">Sort by Size</option>
          <option value="pages">Sort by Pages</option>
        </select>

        {/* Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="ready">Ready</option>
          <option value="processing">Processing</option>
          <option value="uploading">Uploading</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* File List */}
      {filteredAndSortedFiles.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            {searchQuery || filterStatus !== 'all'
              ? 'No files match your filters'
              : 'No files uploaded yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAndSortedFiles.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* File Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* PDF Icon */}
              <div className="flex-shrink-0">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* File Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{file.file_name}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span>{formatFileSize(file.file_size)}</span>
                  <span>•</span>
                  <span>{file.page_count || 0} pages</span>
                  <span>•</span>
                  <span>{formatDate(file.uploaded_at)}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                {getStatusBadge(file.status)}
              </div>
            </div>

            {/* Delete Action */}
            <div className="flex-shrink-0 ml-4">
              <button
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete file"
                onClick={() => handleDeleteClick(file)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      <DeleteFileDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        file={selectedFile}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
