import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export function useUploadPdf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, sessionId }: { file: File; sessionId: string }) =>
      apiClient.uploadPdf(file, sessionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pdfs'] });
      toast.success('PDF uploaded successfully!');
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to upload PDF');
    },
  });
}

export function usePdfMetadata(documentId?: string) {
  return useQuery({
    queryKey: ['pdf', documentId],
    queryFn: () => apiClient.getPdfMetadata(documentId!),
    enabled: !!documentId,
  });
}

export function usePdfContent(documentId?: string) {
  return useQuery({
    queryKey: ['pdf-content', documentId],
    queryFn: () => apiClient.getPdfContent(documentId!),
    enabled: !!documentId,
    staleTime: Infinity, // PDF content doesn't change
  });
}

export function useDeletePdf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => apiClient.deletePdf(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdfs'] });
      toast.success('PDF deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete PDF');
    },
  });
}
