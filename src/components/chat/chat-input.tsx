'use client';

import { FormEvent, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

const MAX_CHARS = 500;

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && input.length <= MAX_CHARS && !isLoading) {
        // Create a synthetic form event
        const form = e.currentTarget.form;
        if (form) {
          handleSubmit(new Event('submit') as any);
        }
      }
    }
  };

  const charsRemaining = MAX_CHARS - input.length;
  const isOverLimit = input.length > MAX_CHARS;
  const canSubmit = input.trim().length > 0 && !isOverLimit && !isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your documents..."
          className={`w-full px-4 py-3 pr-24 border rounded-lg resize-none focus:outline-none focus:ring-2 ${
            isOverLimit
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          rows={3}
          disabled={isLoading}
        />

        {/* Character Counter */}
        <div
          className={`absolute bottom-3 right-3 text-xs ${
            isOverLimit ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          {charsRemaining} / {MAX_CHARS}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Press <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">Enter</kbd> to send,{' '}
          <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">Shift + Enter</kbd> for new line
        </p>

        <Button
          type="submit"
          disabled={!canSubmit}
          className="min-w-24"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
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
              Sending...
            </span>
          ) : (
            'Send'
          )}
        </Button>
      </div>
    </form>
  );
}
