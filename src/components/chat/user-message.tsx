'use client';

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex items-start gap-4 justify-end">
      <div className="flex-1 bg-blue-600 text-white rounded-lg p-4 shadow-sm max-w-2xl ml-auto">
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium">
        U
      </div>
    </div>
  );
}
