/**
 * Google Gemini File Search API Integration
 * Handles FileSearchStore management and file uploads
 */

import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

/**
 * File validation constants
 */
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  MAX_PAGES: 200,
  ALLOWED_MIME_TYPES: ['application/pdf'],
  MAX_FILES_PER_KB: 10,
} as const;

/**
 * Validate file before upload
 */
export async function validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
  // Check file type
  if (!(FILE_LIMITS.ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return {
      valid: false,
      error: 'Only PDF files are allowed',
    };
  }

  // Check file size
  if (file.size > FILE_LIMITS.MAX_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${FILE_LIMITS.MAX_SIZE / 1024 / 1024}MB`,
    };
  }

  // TODO: Add PDF page count validation using a PDF parser library
  // For now, we'll validate this server-side after upload

  return { valid: true };
}

/**
 * File state enum matching Gemini API states
 */
export enum FileState {
  PROCESSING = 'PROCESSING',
  ACTIVE = 'ACTIVE',
  FAILED = 'FAILED',
}

/**
 * Upload file to Gemini
 * Returns the uploaded file metadata
 */
export async function uploadFileToGemini(
  file: File,
  displayName: string,
  onProgress?: (progress: number) => void
): Promise<{ fileId: string; uri: string; state: string }> {
  try {
    // Validate file before upload
    const validation = await validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Upload file using Gemini Files API
    const uploadResult = await genAI.files.upload({
      file: file,
      config: {
        displayName,
        mimeType: file.type,
      },
    });

    if (!uploadResult.name) {
      throw new Error('Upload failed: missing file name in response');
    }

    // Simulate progress (Gemini SDK doesn't provide native progress events)
    if (onProgress) {
      onProgress(100);
    }

    // Wait for file to be processed
    let fileData = await genAI.files.get({ name: uploadResult.name });
    while (fileData.state === FileState.PROCESSING) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
      fileData = await genAI.files.get({ name: uploadResult.name });
    }

    if (fileData.state === FileState.FAILED) {
      throw new Error('File processing failed');
    }

    if (!fileData.name) {
      throw new Error('Invalid file response: missing file name');
    }

    return {
      fileId: fileData.name,
      uri: fileData.uri || '',
      state: (fileData.state as string) || FileState.ACTIVE,
    };
  } catch (error) {
    console.error('Error uploading file to Gemini:', error);
    throw error;
  }
}

/**
 * Delete file from Gemini
 */
export async function deleteFileFromGemini(fileId: string): Promise<void> {
  try {
    await genAI.files.delete({ name: fileId });
  } catch (error) {
    console.error('Error deleting file from Gemini:', error);
    throw error;
  }
}

/**
 * Get file metadata from Gemini
 */
export async function getFileMetadata(fileId: string) {
  try {
    const fileData = await genAI.files.get({ name: fileId });
    return fileData;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
}

/**
 * List all files for a user (from Gemini)
 */
export async function listGeminiFiles() {
  try {
    const files: any[] = [];
    const listResponse = await genAI.files.list({ config: { pageSize: 100 } });
    for await (const file of listResponse) {
      files.push(file);
    }
    return files;
  } catch (error) {
    console.error('Error listing Gemini files:', error);
    throw error;
  }
}

/**
 * Check if API key is valid
 */
export async function validateGeminiApiKey(): Promise<boolean> {
  try {
    await genAI.files.list({ config: { pageSize: 1 } });
    return true;
  } catch (error) {
    console.error('Invalid Gemini API key:', error);
    return false;
  }
}

/**
 * Error handling wrapper with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && error?.message?.includes('rate limit')) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
}

/**
 * Create a new FileSearchStore for a knowledge base
 */
export async function createFileSearchStore(displayName: string): Promise<{ storeId: string }> {
  try {
    const store = await genAI.beta.createFileSearchStore({
      displayName,
    });

    if (!store.name) {
      throw new Error('Failed to create FileSearchStore: missing store name');
    }

    return {
      storeId: store.name,
    };
  } catch (error) {
    console.error('Error creating FileSearchStore:', error);
    throw error;
  }
}

/**
 * Delete a FileSearchStore
 */
export async function deleteFileSearchStore(storeId: string): Promise<void> {
  try {
    await genAI.beta.deleteFileSearchStore({ name: storeId });
  } catch (error) {
    console.error('Error deleting FileSearchStore:', error);
    throw error;
  }
}

/**
 * Add file to FileSearchStore
 */
export async function addFileToStore(storeId: string, fileId: string): Promise<void> {
  try {
    await genAI.beta.batchUpdateFiles({
      files: [{ name: fileId }],
      updateMask: { paths: ['fileSearchStore'] },
      fileSearchStore: storeId,
    });
  } catch (error) {
    console.error('Error adding file to store:', error);
    throw error;
  }
}

/**
 * Remove file from FileSearchStore
 */
export async function removeFileFromStore(storeId: string, fileId: string): Promise<void> {
  try {
    await genAI.beta.batchUpdateFiles({
      files: [{ name: fileId }],
      updateMask: { paths: ['fileSearchStore'] },
      fileSearchStore: null,
    });
  } catch (error) {
    console.error('Error removing file from store:', error);
    throw error;
  }
}
