import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => apiClient.createSession(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create session');
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      documentId,
      message,
    }: {
      sessionId: string;
      documentId: string;
      message: string;
    }) => apiClient.sendMessage(sessionId, documentId, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['chat-history', variables.sessionId],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to send message');
    },
  });
}

export function useChatHistory(sessionId?: string) {
  return useQuery({
    queryKey: ['chat-history', sessionId],
    queryFn: () => apiClient.getChatHistory(sessionId!),
    enabled: !!sessionId,
    refetchInterval: false,
  });
}

export function useClearHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => apiClient.clearHistory(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['chat-history', sessionId] });
      toast.success('Chat history cleared');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to clear history');
    },
  });
}
