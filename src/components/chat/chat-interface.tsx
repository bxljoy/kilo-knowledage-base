'use client';

import { useChat } from 'ai/react';
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
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } =
    useChat({
      api: `/api/knowledge-bases/${knowledgeBaseId}/chat`,
      onError: (error) => {
        console.error('Chat error:', error);
      },
    });

  const handleRetry = () => {
    if (reload) {
      reload();
    }
  };

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
    <div className="h-full flex flex-col bg-gray-50">
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
      <div className="border-t bg-white">
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
