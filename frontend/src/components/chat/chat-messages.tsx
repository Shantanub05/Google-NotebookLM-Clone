'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { useChatHistory } from '@/hooks/use-chat';
import { useAppStore } from '@/store/app-store';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessagesProps {
  isLoading?: boolean;
  onCitationClick?: (pageNumber: number) => void;
}

export function ChatMessages({ isLoading, onCitationClick }: ChatMessagesProps) {
  const { sessionId } = useAppStore();
  const { data: historyData } = useChatHistory(sessionId || undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = historyData?.data || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!sessionId) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Upload a PDF to start chatting
          </p>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <p className="text-lg font-medium">Your document is ready!</p>
          <p className="text-sm text-muted-foreground">
            Ask me anything about your PDF
          </p>
          <div className="space-y-2 pt-4">
            <p className="text-xs font-medium text-muted-foreground">
              Suggested questions:
            </p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                • "What is the main topic of this document?"
              </p>
              <p className="text-xs text-muted-foreground">
                • "Can you summarize the key points?"
              </p>
              <p className="text-xs text-muted-foreground">
                • "What are the conclusions?"
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="space-y-1">
        <AnimatePresence>
          {messages.map((message: any, index: number) => (
            <ChatMessage
              key={message.id || index}
              role={message.role}
              content={message.content}
              citations={message.citations}
              onCitationClick={onCitationClick}
            />
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-4"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="text-sm text-muted-foreground">Thinking...</div>
          </motion.div>
        )}
      </div>
    </ScrollArea>
  );
}
