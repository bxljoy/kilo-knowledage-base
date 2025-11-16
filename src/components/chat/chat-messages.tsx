'use client';

import { useEffect, useRef } from 'react';
import { Message } from 'ai';
import { UserMessage } from './user-message';
import { AIMessage } from './ai-message';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  error?: Error;
  knowledgeBaseId?: string;
  onRetry?: () => void;
}

export function ChatMessages({ messages, isLoading, error, knowledgeBaseId, onRetry }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="text-base font-medium text-gray-900 mb-1">
            Start a conversation
          </h3>
          <p className="text-xs text-gray-600">
            Ask questions about your uploaded documents. I'll provide answers based on the content you've uploaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {messages.map((message) => {
          // Extract content from message (AI SDK v5.x uses parts array for assistant messages)
          const content = message.role === 'assistant' && 'parts' in message
            ? message.parts.map((part: any) => part.type === 'text' ? part.text : '').join('')
            : message.content;

          return (
            <div key={message.id}>
              {message.role === 'user' ? (
                <UserMessage content={content} />
              ) : (
                <AIMessage
                  content={content}
                  messageId={message.id}
                  knowledgeBaseId={knowledgeBaseId}
                />
              )}
            </div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              AI
            </div>
            <div className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <svg
                  className="animate-spin h-4 w-4"
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
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
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
                  Failed to get response
                </p>
                <p className="text-sm text-red-700">
                  {error.message || 'An error occurred while processing your request. Please try again.'}
                </p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="mt-3 text-sm font-medium text-red-700 hover:text-red-900 underline"
                  >
                    Try again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
