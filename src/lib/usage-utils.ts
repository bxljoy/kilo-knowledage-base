/**
 * Usage utility functions that can be used in both client and server components
 */

/**
 * Constants for quota limits
 */
export const QUOTA_LIMITS = {
  DAILY_QUERIES: 100,
  FILES_PER_KNOWLEDGE_BASE: 10,
  MAX_KNOWLEDGE_BASES: 5,
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
