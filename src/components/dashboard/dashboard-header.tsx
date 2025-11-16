'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpModal } from '@/components/help/help-modal';

export function DashboardHeader() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Help
          </button>
          <Link
            href="/dashboard/usage"
            data-tour="usage-link"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            View Usage & Limits
          </Link>
        </div>
      </div>

      <HelpModal open={showHelp} onOpenChange={setShowHelp} />
    </>
  );
}
