/**
 * Quota enforcement utilities for managing user limits
 */

import { createClient } from '@/lib/supabase/server';
import { QUOTA_LIMITS, getUserUsageStats } from '@/lib/usage-tracking';

export interface QuotaCheckResult {
  allowed: boolean;
  message?: string;
  current: number;
  limit: number;
  remaining: number;
}

/**
 * Check if user can upload more files to a knowledge base
 */
export async function checkFileUploadQuota(
  userId: string,
  knowledgeBaseId: string
): Promise<QuotaCheckResult> {
  const supabase = await createClient();

  // Count existing files in the knowledge base
  const { count, error } = await supabase
    .from('files')
    .select('*', { count: 'exact', head: true })
    .eq('knowledge_base_id', knowledgeBaseId)
    .in('status', ['ready', 'processing', 'uploading']);

  if (error) {
    console.error('Error checking file count:', error);
    return {
      allowed: false,
      message: 'Error checking file quota',
      current: 0,
      limit: QUOTA_LIMITS.FILES_PER_KNOWLEDGE_BASE,
      remaining: 0,
    };
  }

  const fileCount = count || 0;
  const remaining = Math.max(0, QUOTA_LIMITS.FILES_PER_KNOWLEDGE_BASE - fileCount);
  const allowed = fileCount < QUOTA_LIMITS.FILES_PER_KNOWLEDGE_BASE;

  return {
    allowed,
    message: allowed
      ? undefined
      : `You've reached the limit of ${QUOTA_LIMITS.FILES_PER_KNOWLEDGE_BASE} files per knowledge base. Please delete some files before uploading new ones.`,
    current: fileCount,
    limit: QUOTA_LIMITS.FILES_PER_KNOWLEDGE_BASE,
    remaining,
  };
}

/**
 * Check if user can create more knowledge bases
 */
export async function checkKnowledgeBaseQuota(userId: string): Promise<QuotaCheckResult> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('knowledge_bases')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error checking knowledge base count:', error);
    return {
      allowed: false,
      message: 'Error checking knowledge base quota',
      current: 0,
      limit: QUOTA_LIMITS.MAX_KNOWLEDGE_BASES,
      remaining: 0,
    };
  }

  const kbCount = count || 0;
  const remaining = Math.max(0, QUOTA_LIMITS.MAX_KNOWLEDGE_BASES - kbCount);
  const allowed = kbCount < QUOTA_LIMITS.MAX_KNOWLEDGE_BASES;

  return {
    allowed,
    message: allowed
      ? undefined
      : `You've reached the limit of ${QUOTA_LIMITS.MAX_KNOWLEDGE_BASES} knowledge bases. Please delete a knowledge base before creating a new one.`,
    current: kbCount,
    limit: QUOTA_LIMITS.MAX_KNOWLEDGE_BASES,
    remaining,
  };
}

/**
 * Check if file size is within limits
 */
export function checkFileSizeQuota(fileSizeBytes: number): QuotaCheckResult {
  const maxSizeBytes = QUOTA_LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024;
  const allowed = fileSizeBytes <= maxSizeBytes;

  return {
    allowed,
    message: allowed
      ? undefined
      : `File size exceeds the maximum limit of ${QUOTA_LIMITS.MAX_FILE_SIZE_MB}MB. Please upload a smaller file.`,
    current: fileSizeBytes,
    limit: maxSizeBytes,
    remaining: Math.max(0, maxSizeBytes - fileSizeBytes),
  };
}

/**
 * Check if user's total storage is within limits
 */
export async function checkStorageQuota(
  userId: string,
  additionalBytes: number = 0
): Promise<QuotaCheckResult> {
  const stats = await getUserUsageStats(userId);

  if (!stats) {
    return {
      allowed: false,
      message: 'Error checking storage quota',
      current: 0,
      limit: QUOTA_LIMITS.MAX_STORAGE_MB * 1024 * 1024,
      remaining: 0,
    };
  }

  const maxStorageBytes = QUOTA_LIMITS.MAX_STORAGE_MB * 1024 * 1024;
  const currentStorage = stats.storageUsed;
  const projectedStorage = currentStorage + additionalBytes;
  const allowed = projectedStorage <= maxStorageBytes;

  return {
    allowed,
    message: allowed
      ? undefined
      : `Adding this file would exceed your storage limit of ${QUOTA_LIMITS.MAX_STORAGE_MB}MB. Please delete some files to free up space.`,
    current: currentStorage,
    limit: maxStorageBytes,
    remaining: Math.max(0, maxStorageBytes - currentStorage),
  };
}

/**
 * Check daily query quota
 */
export async function checkQueryQuota(userId: string): Promise<QuotaCheckResult> {
  const stats = await getUserUsageStats(userId);

  if (!stats) {
    return {
      allowed: false,
      message: 'Error checking query quota',
      current: 0,
      limit: QUOTA_LIMITS.DAILY_QUERIES,
      remaining: 0,
    };
  }

  const allowed = stats.queriesRemaining > 0;
  const resetTime = new Date(stats.queryResetAt).toLocaleString('en-US', {
    timeZone: 'UTC',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return {
    allowed,
    message: allowed
      ? undefined
      : `You've reached your daily limit of ${QUOTA_LIMITS.DAILY_QUERIES} queries. Your limit will reset at ${resetTime} UTC.`,
    current: stats.dailyQueries,
    limit: QUOTA_LIMITS.DAILY_QUERIES,
    remaining: stats.queriesRemaining,
  };
}

/**
 * Get all quota information for a user
 */
export async function getAllQuotas(userId: string) {
  const [stats, kbQuota] = await Promise.all([
    getUserUsageStats(userId),
    checkKnowledgeBaseQuota(userId),
  ]);

  if (!stats) {
    return null;
  }

  const maxStorageBytes = QUOTA_LIMITS.MAX_STORAGE_MB * 1024 * 1024;

  return {
    queries: {
      used: stats.dailyQueries,
      limit: QUOTA_LIMITS.DAILY_QUERIES,
      remaining: stats.queriesRemaining,
      resetAt: stats.queryResetAt,
    },
    knowledgeBases: {
      used: kbQuota.current,
      limit: QUOTA_LIMITS.MAX_KNOWLEDGE_BASES,
      remaining: kbQuota.remaining,
    },
    storage: {
      used: stats.storageUsed,
      limit: maxStorageBytes,
      remaining: Math.max(0, maxStorageBytes - stats.storageUsed),
    },
    totalFileUploads: stats.fileUploads,
    totalQueries: stats.totalQueries,
  };
}
