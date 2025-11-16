'use client';

export function EmptyFileList() {
  return (
    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="max-w-md mx-auto px-4">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Files Yet
        </h3>
        <p className="text-gray-600 mb-6">
          Upload your first PDF document using the upload area above
        </p>

        {/* Quick Tips */}
        <div className="bg-white border border-blue-200 rounded-lg p-4 text-left">
          <div className="flex items-start gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">Quick Tips</h4>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-700 ml-7">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Each file can be up to 10MB in size</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>You can upload up to 10 files per knowledge base</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Processing typically takes less than a minute</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Once ready, you can chat with your documents!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
