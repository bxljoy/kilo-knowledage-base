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
  // Ensure input is always a string (default to empty string if undefined)
  const safeInput = input ?? '';

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (safeInput.trim() && safeInput.length <= MAX_CHARS && !isLoading) {
        // Create a synthetic form event
        const form = e.currentTarget.form;
        if (form) {
          handleSubmit(new Event('submit') as any);
        }
      }
    }
  };

  const charsUsed = safeInput.length;
  const charsRemaining = MAX_CHARS - charsUsed;
  const isOverLimit = charsUsed > MAX_CHARS;
  const canSubmit = safeInput.trim().length > 0 && !isOverLimit && !isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
      <div className="relative">
        <textarea
          value={safeInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your documents..."
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3.5 pr-16 sm:pr-24 bg-slate-800 border rounded-xl resize-none focus:outline-none focus:ring-2 text-sm sm:text-base text-slate-100 placeholder:text-slate-500 ${
            isOverLimit
              ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-700 focus:ring-blue-500 focus:border-blue-500'
          }`}
          rows={3}
          disabled={isLoading}
        />

        {/* Character Counter */}
        <div
          className={`absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-xs font-medium ${
            isOverLimit ? 'text-red-400' : 'text-slate-500'
          }`}
        >
          {charsUsed} / {MAX_CHARS}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <p className="text-xs text-slate-400 hidden sm:block">
          Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs font-mono text-slate-300">Enter</kbd> to send,{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs font-mono text-slate-300">Shift + Enter</kbd> for new line
        </p>
        <p className="text-xs text-slate-400 sm:hidden">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs font-mono">Enter</kbd> = send • <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs font-mono">Shift+Enter</kbd> = new line
        </p>

        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full sm:w-auto sm:min-w-32 rounded-xl text-sm sm:text-base"
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
