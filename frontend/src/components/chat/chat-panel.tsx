'use client';

import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { useSendMessage } from '@/hooks/use-chat';
import { useAppStore } from '@/store/app-store';

export function ChatPanel() {
  const { setCurrentPage } = useAppStore();
  const sendMessage = useSendMessage();

  const handleCitationClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h2 className="text-lg font-semibold">Chat</h2>
        <p className="text-xs text-muted-foreground">
          Ask questions about your document
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages
          isLoading={sendMessage.isPending}
          onCitationClick={handleCitationClick}
        />
      </div>

      {/* Input */}
      <ChatInput />
    </div>
  );
}
