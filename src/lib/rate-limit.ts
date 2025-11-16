/**
 * Rate limiting utility for tracking and enforcing query limits
 * Uses in-memory storage with automatic daily resets
 */

interface UserUsage {
  queryCount: number;
  resetDate: Date;
}

// In-memory storage for user query counts
// In production, this should use Redis/Vercel KV for persistence across instances
const userUsageMap = new Map<string, UserUsage>();

const DAILY_QUERY_LIMIT = 100;

/**
 * Get the start of the next day (midnight UTC)
 */
function getNextResetDate(): Date {
  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  return tomorrow;
}

/**
 * Check if the usage data needs to be reset
 */
function shouldReset(resetDate: Date): boolean {
  return new Date() >= resetDate;
}

/**
 * Get current usage for a user
 */
export function getUserUsage(userId: string): { queryCount: number; limit: number; resetDate: Date } {
  let usage = userUsageMap.get(userId);

  // Initialize or reset if needed
  if (!usage || shouldReset(usage.resetDate)) {
    usage = {
      queryCount: 0,
      resetDate: getNextResetDate(),
    };
    userUsageMap.set(userId, usage);
  }

  return {
    queryCount: usage.queryCount,
    limit: DAILY_QUERY_LIMIT,
    resetDate: usage.resetDate,
  };
}

/**
 * Check if user has remaining queries available
 */
export function checkRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
  resetDate: Date;
  limit: number;
} {
  const usage = getUserUsage(userId);
  const allowed = usage.queryCount < DAILY_QUERY_LIMIT;
  const remaining = Math.max(0, DAILY_QUERY_LIMIT - usage.queryCount);

  return {
    allowed,
    remaining,
    resetDate: usage.resetDate,
    limit: DAILY_QUERY_LIMIT,
  };
}

/**
 * Increment the query count for a user
 * Returns false if limit is exceeded
 */
export function incrementQueryCount(userId: string): boolean {
  const rateLimit = checkRateLimit(userId);

  if (!rateLimit.allowed) {
    return false;
  }

  const usage = userUsageMap.get(userId);
  if (usage) {
    usage.queryCount++;
  }

  return true;
}

/**
 * Reset usage for a specific user (for testing or admin purposes)
 */
export function resetUserUsage(userId: string): void {
  userUsageMap.delete(userId);
}

/**
 * Clean up expired usage data (run periodically)
 */
export function cleanupExpiredUsage(): number {
  let cleaned = 0;
  const now = new Date();

  for (const [userId, usage] of userUsageMap.entries()) {
    if (shouldReset(usage.resetDate)) {
      userUsageMap.delete(userId);
      cleaned++;
    }
  }

  return cleaned;
}

// Run cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredUsage, 60 * 60 * 1000);
}
