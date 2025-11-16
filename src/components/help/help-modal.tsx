'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<'getting-started' | 'features' | 'faq'>('getting-started');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Help & Documentation</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('getting-started')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'getting-started'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Getting Started
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'features'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Features
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'faq'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              FAQ
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'getting-started' && <GettingStartedContent />}
          {activeTab === 'features' && <FeaturesContent />}
          {activeTab === 'faq' && <FAQContent />}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Got it, thanks!
          </Button>
        </div>
      </div>
    </div>
  );
}

function GettingStartedContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Start Guide</h3>
        <p className="text-gray-600 mb-4">
          Follow these simple steps to start chatting with your documents:
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
            1
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Create a Knowledge Base</h4>
            <p className="text-sm text-gray-600">
              Click "New Knowledge Base" on your dashboard. Give it a name and description that helps you organize your documents.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
            2
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Upload PDF Documents</h4>
            <p className="text-sm text-gray-600">
              Open your knowledge base and drag & drop PDF files into the upload area. Each file can be up to 10MB, and you can upload up to 10 files per knowledge base.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
            3
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Wait for Processing</h4>
            <p className="text-sm text-gray-600">
              Your files will be processed automatically. This usually takes less than a minute. You'll see a "Ready" status when complete.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
            4
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Start Chatting</h4>
            <p className="text-sm text-gray-600">
              Click "Chat with Documents" and ask questions about your PDFs. The AI will search through your documents and provide accurate answers with citations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturesContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
      </div>

      <div className="grid gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">AI-Powered Chat</h4>
              <p className="text-sm text-gray-700">
                Ask natural language questions about your documents. Powered by Google's Gemini AI for accurate, context-aware responses.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Multiple Knowledge Bases</h4>
              <p className="text-sm text-gray-700">
                Organize documents into up to 5 separate knowledge bases. Perfect for different projects, subjects, or teams.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Secure & Private</h4>
              <p className="text-sm text-gray-700">
                Your documents are private and secure. Only you can access your knowledge bases and chat history.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Fast Processing</h4>
              <p className="text-sm text-gray-700">
                Documents are typically processed in under a minute, so you can start chatting quickly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Frequently Asked Questions</h3>
      </div>

      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-semibold text-gray-900 mb-2">What file formats are supported?</h4>
          <p className="text-sm text-gray-600">
            Currently, we support PDF files with text content. Make sure your PDFs contain actual text, not just scanned images.
          </p>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-semibold text-gray-900 mb-2">What are the file size limits?</h4>
          <p className="text-sm text-gray-600">
            Each PDF file can be up to 10MB in size. You can upload up to 10 files per knowledge base, and create up to 5 knowledge bases.
          </p>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-semibold text-gray-900 mb-2">How many questions can I ask per day?</h4>
          <p className="text-sm text-gray-600">
            You have a daily limit of 100 queries. This limit resets every 24 hours at midnight UTC. Check the Usage & Limits page to track your usage.
          </p>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-semibold text-gray-900 mb-2">How accurate are the AI responses?</h4>
          <p className="text-sm text-gray-600">
            Our AI uses advanced search and retrieval technology to find relevant information from your documents. While highly accurate, always verify critical information from the original documents.
          </p>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Can I delete uploaded documents?</h4>
          <p className="text-sm text-gray-600">
            Yes! You can delete individual files or entire knowledge bases at any time. Deleted files will free up your storage quota.
          </p>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-semibold text-gray-900 mb-2">What happens if processing fails?</h4>
          <p className="text-sm text-gray-600">
            If a file fails to process, you'll see an error status. Try re-uploading the file. If the issue persists, make sure your PDF contains text and isn't corrupted.
          </p>
        </div>

        <div className="pb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Is there a mobile app?</h4>
          <p className="text-sm text-gray-600">
            Not yet, but our web application is fully responsive and works great on mobile browsers!
          </p>
        </div>
      </div>
    </div>
  );
}
