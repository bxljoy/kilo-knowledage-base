/**
 * Usage tracking utilities for database-backed usage monitoring
 */

import { createClient } from '@/lib/supabase/server';

export interface UsageStats {
  dailyQueries: number;
  totalQueries: number;
  queryResetAt: Date;
  fileUploads: number;
  storageUsed: number;
  queriesRemaining: number;
}

/**
 * Get usage statistics for a user from the database
 */
export async function getUserUsageStats(userId: string): Promise<UsageStats | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_user_usage', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error getting user usage stats:', error);
    return null;
  }

  if (!data || data.length === 0) {
    // Return default stats if no record exists
    return {
      dailyQueries: 0,
      totalQueries: 0,
      queryResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      fileUploads: 0,
      storageUsed: 0,
      queriesRemaining: 100,
    };
  }

  const stats = data[0];
  return {
    dailyQueries: stats.daily_queries,
    totalQueries: Number(stats.total_queries),
    queryResetAt: new Date(stats.query_reset_at),
    fileUploads: stats.file_uploads,
    storageUsed: Number(stats.storage_used),
    queriesRemaining: stats.queries_remaining,
  };
}

/**
 * Increment query count in the database
 */
export async function incrementDatabaseQueryCount(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_query_count', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error incrementing query count:', error);
    return false;
  }

  return true;
}

/**
 * Increment file upload count in the database
 */
export async function incrementFileUploadCount(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_file_upload_count', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error incrementing file upload count:', error);
    return false;
  }

  return true;
}

/**
 * Update storage usage in the database
 * @param userId - User ID
 * @param storageDelta - Change in storage (positive for add, negative for remove)
 */
export async function updateStorageUsage(userId: string, storageDelta: number): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('update_storage_usage', {
    p_user_id: userId,
    p_storage_delta: storageDelta,
  });

  if (error) {
    console.error('Error updating storage usage:', error);
    return false;
  }

  return true;
}

/**
 * Check if user has reached daily query limit (from database)
 */
export async function checkDatabaseQueryLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetDate: Date;
}> {
  const stats = await getUserUsageStats(userId);

  if (!stats) {
    // If we can't get stats, allow the request but log the error
    console.error('Could not get usage stats for user:', userId);
    return {
      allowed: true,
      remaining: 100,
      resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  return {
    allowed: stats.queriesRemaining > 0,
    remaining: stats.queriesRemaining,
    resetDate: stats.queryResetAt,
  };
}

/**
 * Constants for quota limits
 */
export const QUOTA_LIMITS = {
  DAILY_QUERIES: 100,
  FILES_PER_KNOWLEDGE_BASE: 10,
  MAX_KNOWLEDGE_BASES: 3,
  MAX_FILE_SIZE_MB: 10,
  MAX_STORAGE_MB: 100,
} as const;

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Calculate percentage used
 */
export function calculatePercentage(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((used / total) * 100);
}
