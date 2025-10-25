'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSendMessage } from '@/hooks/use-chat';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

export function ChatInput() {
  const [message, setMessage] = useState('');
  const { sessionId, documentId } = useAppStore();
  const sendMessage = useSendMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !sessionId || !documentId) {
      return;
    }

    if (!sessionId) {
      toast.error('Please upload a document first');
      return;
    }

    try {
      await sendMessage.mutateAsync({
        sessionId,
        documentId,
        message: message.trim(),
      });
      setMessage('');
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isDisabled = !sessionId || !documentId || sendMessage.isPending;

  return (
    <motion.form
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      onSubmit={handleSubmit}
      className="border-t border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            sessionId
              ? 'Ask about the document...'
              : 'Upload a document to start chatting'
          }
          disabled={isDisabled}
          className="min-h-[60px] max-h-[200px] resize-none"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isDisabled || !message.trim()}
          className="h-[60px] w-[60px]"
        >
          {sendMessage.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Press Enter to send, Shift+Enter for new line
      </p>
    </motion.form>
  );
}
