/**
 * Knowledge Base File Management
 * Integrates Gemini file operations with Supabase database
 */

import { createClient as createServerClient } from '@/lib/supabase/server';
import {
  uploadFileToGemini,
  deleteFileFromGemini,
  getFileMetadata,
  FileState,
} from './gemini';
import type { Database } from '@/types/database';

type FileRow = Database['public']['Tables']['files']['Row'];
type FileInsert = Database['public']['Tables']['files']['Insert'];
type FileUpdate = Database['public']['Tables']['files']['Update'];

/**
 * Upload file to knowledge base
 * Uploads to Gemini and creates database record
 */
export async function uploadFileToKnowledgeBase(
  knowledgeBaseId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<FileRow> {
  const supabase = await createServerClient();

  try {
    // Upload to Gemini first
    const geminiFile = await uploadFileToGemini(
      file,
      file.name,
      onProgress
    );

    // Create database record
    const fileRecord: FileInsert = {
      knowledge_base_id: knowledgeBaseId,
      file_name: file.name,
      file_size: file.size,
      gemini_file_id: geminiFile.fileId,
      status: geminiFile.state === FileState.ACTIVE ? 'ready' : 'processing',
    };

    const result = await supabase
      .from('files')
      .insert(fileRecord as any)
      .select()
      .single();

    if (result.error || !result.data) {
      // Rollback: delete from Gemini if database insert fails
      await deleteFileFromGemini(geminiFile.fileId).catch(console.error);
      throw new Error(`Failed to save file record: ${result.error?.message || 'Unknown error'}`);
    }

    return (result as any).data;
  } catch (error) {
    console.error('Error uploading file to knowledge base:', error);
    throw error;
  }
}

/**
 * Delete file from knowledge base
 * Removes from both Gemini and database
 */
export async function deleteFileFromKnowledgeBase(
  fileId: string
): Promise<void> {
  const supabase = await createServerClient();

  try {
    // Get file record to find Gemini file ID
    const result = await supabase
      .from('files')
      .select('gemini_file_id')
      .eq('id', fileId)
      .single();

    if (result.error || !result.data) {
      throw new Error(`Failed to find file: ${result.error?.message || 'File not found'}`);
    }

    // Delete from Gemini
    await deleteFileFromGemini((result as any).data.gemini_file_id);

    // Delete from database
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);

    if (deleteError) {
      throw new Error(`Failed to delete file record: ${deleteError.message}`);
    }
  } catch (error) {
    console.error('Error deleting file from knowledge base:', error);
    throw error;
  }
}

/**
 * List all files in a knowledge base
 */
export async function listKnowledgeBaseFiles(
  knowledgeBaseId: string
): Promise<FileRow[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('knowledge_base_id', knowledgeBaseId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }

  return data || [];
}

/**
 * Get file by ID
 */
export async function getKnowledgeBaseFile(
  fileId: string
): Promise<FileRow> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .single();

  if (error) {
    throw new Error(`Failed to get file: ${error.message}`);
  }

  return data;
}

/**
 * Update file status
 * Syncs file status from Gemini to database
 */
export async function updateFileStatus(
  fileId: string
): Promise<FileRow> {
  const supabase = await createServerClient();

  try {
    // Get file record
    const result = await supabase
      .from('files')
      .select('gemini_file_id')
      .eq('id', fileId)
      .single();

    if (result.error || !result.data) {
      throw new Error(`Failed to find file: ${result.error?.message || 'File not found'}`);
    }

    // Get status from Gemini
    const geminiFile = await getFileMetadata((result as any).data.gemini_file_id);

    // Map Gemini state to our status
    let status: 'uploading' | 'processing' | 'ready' | 'failed';
    if (geminiFile.state === FileState.PROCESSING) {
      status = 'processing';
    } else if (geminiFile.state === FileState.FAILED) {
      status = 'failed';
    } else {
      status = 'ready';
    }

    // Update database
    const updateData: FileUpdate = {
      status,
      processed_at: status === 'ready' ? new Date().toISOString() : undefined,
    };

    const updateResult = await (supabase
      .from('files') as any)
      .update(updateData)
      .eq('id', fileId)
      .select()
      .single();

    if (updateResult.error || !updateResult.data) {
      throw new Error(`Failed to update file status: ${updateResult.error?.message || 'Unknown error'}`);
    }

    return updateResult.data;
  } catch (error) {
    console.error('Error updating file status:', error);
    throw error;
  }
}

/**
 * Get knowledge base statistics
 */
export async function getKnowledgeBaseStats(knowledgeBaseId: string) {
  const supabase = await createServerClient();

  const result = await supabase
    .from('files')
    .select('file_size, status')
    .eq('knowledge_base_id', knowledgeBaseId);

  if (result.error || !result.data) {
    throw new Error(`Failed to get stats: ${result.error?.message || 'Unknown error'}`);
  }

  const files = result.data;
  const totalFiles = files.length;
  const totalSize = files.reduce((sum, file) => sum + (file as any).file_size, 0);
  const readyFiles = files.filter((f) => (f as any).status === 'ready').length;
  const processingFiles = files.filter((f) => (f as any).status === 'processing').length;
  const failedFiles = files.filter((f) => (f as any).status === 'failed').length;

  return {
    totalFiles,
    totalSize,
    readyFiles,
    processingFiles,
    failedFiles,
  };
}

/**
 * Delete all files from a knowledge base
 * Used when deleting a knowledge base
 */
export async function deleteAllKnowledgeBaseFiles(
  knowledgeBaseId: string
): Promise<void> {
  const files = await listKnowledgeBaseFiles(knowledgeBaseId);

  // Delete files in parallel
  await Promise.all(
    files.map((file) => deleteFileFromKnowledgeBase(file.id))
  );
}
