'use client';

import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Citation {
  id: string;
  pageNumber: number;
  text: string;
  score: number;
}

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  onCitationClick?: (pageNumber: number) => void;
}

export function ChatMessage({ role, content, citations, onCitationClick }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex gap-3 p-4', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div className={cn('flex flex-col space-y-2', isUser ? 'items-end' : 'items-start')}>
        <Card
          className={cn(
            'max-w-[85%] px-4 py-3',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-card'
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        </Card>

        {/* Citations */}
        {citations && citations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {citations.map((citation, index) => (
              <Badge
                key={citation.id || index}
                variant="secondary"
                className="cursor-pointer transition-all hover:scale-105 hover:bg-secondary/80"
                onClick={() => onCitationClick?.(citation.pageNumber)}
              >
                Page {citation.pageNumber}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
