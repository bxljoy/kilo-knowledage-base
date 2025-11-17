'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';
import { EmptyChatState } from './empty-chat-state';

interface ChatInterfaceProps {
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  fileCount: number;
}

export function ChatInterface({
  knowledgeBaseId,
  knowledgeBaseName,
  fileCount,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');

  const { messages, sendMessage, status, error } = useChat({
    transport: new TextStreamChatTransport({
      api: `/api/knowledge-bases/${knowledgeBaseId}/chat`,
    }),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const messageContent = input;
    setInput(''); // Clear input immediately

    await sendMessage({
      role: 'user',
      content: messageContent,
    } as any);
  };

  const handleRetry = () => {
    // TODO: Implement retry logic if needed
  };

  const isLoading = (status as any) === 'in_progress';

  // Show empty state if no files uploaded
  if (fileCount === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyChatState
          knowledgeBaseName={knowledgeBaseName}
          knowledgeBaseId={knowledgeBaseId}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          error={error}
          knowledgeBaseId={knowledgeBaseId}
          onRetry={handleRetry}
        />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
