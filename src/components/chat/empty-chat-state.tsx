'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EmptyChatStateProps {
  knowledgeBaseName: string;
  knowledgeBaseId: string;
}

export function EmptyChatState({
  knowledgeBaseName,
  knowledgeBaseId,
}: EmptyChatStateProps) {
  return (
    <div className="text-center max-w-lg px-4">
      {/* Illustration */}
      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-10 h-10 text-purple-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>

      {/* Heading */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Ready to Start Chatting?
      </h3>
      <p className="text-gray-600 mb-6 text-lg">
        Upload PDF documents to <span className="font-semibold text-gray-900">{knowledgeBaseName}</span> and start asking questions
      </p>

      {/* Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
        <h4 className="font-semibold text-gray-900 mb-3 text-center">Getting Started is Easy</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
              1
            </div>
            <p className="text-sm text-gray-700 pt-0.5">
              Upload PDF documents (up to 10MB each)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
              2
            </div>
            <p className="text-sm text-gray-700 pt-0.5">
              Wait for processing to complete (usually under a minute)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
              3
            </div>
            <p className="text-sm text-gray-700 pt-0.5">
              Ask questions and get instant AI-powered answers
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link href={`/dashboard/knowledge-bases/${knowledgeBaseId}`}>
        <Button size="lg" className="px-8">
          Upload Your First Document
        </Button>
      </Link>
      <p className="text-sm text-gray-500 mt-3">
        Supports PDF files with text content
      </p>
    </div>
  );
}
