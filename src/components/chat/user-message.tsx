'use client';

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="flex-1 bg-blue-600 text-white rounded-xl p-4 shadow-lg max-w-2xl ml-auto">
        <p className="whitespace-pre-wrap break-words leading-relaxed">{content}</p>
      </div>
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">
        U
      </div>
    </div>
  );
}
