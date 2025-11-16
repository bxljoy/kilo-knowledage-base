'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface AIMessageProps {
  content: string;
  messageId: string;
  knowledgeBaseId?: string;
}

export function AIMessage({ content, messageId, knowledgeBaseId }: AIMessageProps) {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [isRating, setIsRating] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleRating = async (newRating: number) => {
    if (!knowledgeBaseId) {
      toast.error('Unable to save rating');
      return;
    }

    setIsRating(true);

    try {
      // If clicking the same rating, remove it
      if (rating === newRating) {
        const response = await fetch(`/api/messages/${messageId}/rating`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove rating');
        }

        setRating(null);
        toast.success('Rating removed');
      } else {
        // Set new rating
        const response = await fetch(`/api/messages/${messageId}/rating`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating: newRating,
            knowledgeBaseId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save rating');
        }

        setRating(newRating);
        toast.success(newRating === 1 ? 'Helpful feedback received' : 'Feedback received');
      }
    } catch (error) {
      console.error('Error saving rating:', error);
      toast.error('Failed to save rating');
    } finally {
      setIsRating(false);
    }
  };

  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
        AI
      </div>
      <div className="flex-1 bg-white rounded-lg p-4 shadow-sm max-w-2xl">
        <p className="whitespace-pre-wrap break-words text-gray-800">{content}</p>

        {/* Actions */}
        <div className="mt-3 pt-3 border-t flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Rating buttons */}
          {knowledgeBaseId && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => handleRating(1)}
                disabled={isRating}
                className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                  rating === 1 ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                } disabled:opacity-50`}
                title="This was helpful"
              >
                <svg
                  className="w-4 h-4"
                  fill={rating === 1 ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleRating(-1)}
                disabled={isRating}
                className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                  rating === -1 ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                } disabled:opacity-50`}
                title="This wasn't helpful"
              >
                <svg
                  className="w-4 h-4"
                  fill={rating === -1 ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2M17 4H19a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
