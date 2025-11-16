'use client';

import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center space-y-6 max-w-2xl">
        {/* Illustration */}
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-2">
          <svg
            className="w-12 h-12 text-blue-600"
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
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">
            Welcome to Your Knowledge Base Hub
          </h3>
          <p className="text-lg text-gray-600">
            Create your first knowledge base to unlock the power of AI-assisted document management
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-left">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Upload Documents</h4>
            <p className="text-sm text-gray-600">Upload PDF files up to 10MB each</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 text-left">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Chat with AI</h4>
            <p className="text-sm text-gray-600">Ask questions and get instant answers</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 text-left">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Stay Organized</h4>
            <p className="text-sm text-gray-600">Manage up to 5 knowledge bases</p>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <Button onClick={onCreateClick} size="lg" className="px-8">
            Create Your First Knowledge Base
          </Button>
          <p className="text-sm text-gray-500 mt-3">
            Get started in seconds - no credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
