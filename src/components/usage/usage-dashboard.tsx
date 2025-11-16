'use client';

import { useEffect, useState } from 'react';
import { formatBytes, calculatePercentage } from '@/lib/usage-utils';

interface UsageData {
  queries: {
    used: number;
    limit: number;
    remaining: number;
    resetAt: string;
  };
  knowledgeBases: {
    used: number;
    limit: number;
    remaining: number;
  };
  storage: {
    used: number;
    limit: number;
    remaining: number;
  };
  totalFileUploads: number;
  totalQueries: number;
}

interface ProgressBarProps {
  used: number;
  limit: number;
  label: string;
  unit?: string;
  formatValue?: (value: number) => string;
}

function ProgressBar({ used, limit, label, unit = '', formatValue }: ProgressBarProps) {
  const percentage = calculatePercentage(used, limit);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const displayValue = formatValue ? formatValue(used) : used.toString();
  const displayLimit = formatValue ? formatValue(limit) : limit.toString();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">
          {displayValue} / {displayLimit} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isAtLimit
              ? 'bg-red-600'
              : isNearLimit
              ? 'bg-yellow-500'
              : 'bg-blue-600'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{percentage}% used</span>
        <span>
          {formatValue
            ? formatValue(limit - used)
            : (limit - used).toString()}{' '}
          {unit} remaining
        </span>
      </div>
    </div>
  );
}

export function UsageDashboard() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    try {
      setError(null);
      const response = await fetch('/api/usage');

      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }

      const data = await response.json();
      setUsage(data);
    } catch (err) {
      console.error('Error fetching usage:', err);
      setError(err instanceof Error ? err.message : 'Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-gray-600">
          <svg
            className="animate-spin h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading usage data...</span>
        </div>
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 mb-1">
              Error loading usage data
            </p>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchUsage}
              className="mt-3 text-sm font-medium text-red-700 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const resetDate = new Date(usage.queries.resetAt);
  const now = new Date();
  const hoursUntilReset = Math.max(
    0,
    Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60))
  );

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Usage & Limits</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track your resource usage and remaining quotas
          </p>
        </div>
        <button
          onClick={fetchUsage}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Daily Queries */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Daily Queries</h3>
        </div>
        <ProgressBar
          used={usage.queries.used}
          limit={usage.queries.limit}
          label="AI Chat Queries"
          unit="queries"
        />
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Resets in {hoursUntilReset} {hoursUntilReset === 1 ? 'hour' : 'hours'}
            </span>
          </div>
        </div>
      </div>

      {/* Knowledge Bases */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Knowledge Bases</h3>
        </div>
        <ProgressBar
          used={usage.knowledgeBases.used}
          limit={usage.knowledgeBases.limit}
          label="Active Knowledge Bases"
          unit="bases"
        />
      </div>

      {/* Storage */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Storage</h3>
        </div>
        <ProgressBar
          used={usage.storage.used}
          limit={usage.storage.limit}
          label="File Storage"
          formatValue={formatBytes}
        />
      </div>

      {/* Lifetime Statistics */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Lifetime Statistics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total Queries</div>
            <div className="text-2xl font-bold text-blue-600">
              {usage.totalQueries.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total File Uploads</div>
            <div className="text-2xl font-bold text-purple-600">
              {usage.totalFileUploads.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1 text-sm text-blue-800">
            <p className="font-medium mb-1">About Usage Limits</p>
            <p>
              These limits help ensure fair usage across all users. Daily query
              limits reset every 24 hours at midnight UTC. Need higher limits?
              Contact support for upgrade options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
