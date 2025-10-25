'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AppLayout } from '@/components/layout/app-layout';
import { Sidebar } from '@/components/layout/sidebar';
import { PdfUpload } from '@/components/pdf/pdf-upload';
import { ChatPanel } from '@/components/chat/chat-panel';
import { useAppStore } from '@/store/app-store';
import { useDeleteSession } from '@/hooks/use-chat';

// Dynamically import PdfViewer with SSR disabled to avoid DOMMatrix errors
const PdfViewer = dynamic(
  () => import('@/components/pdf/pdf-viewer').then((mod) => mod.PdfViewer),
  { ssr: false }
);

export default function HomePage() {
  const { documentId, sessionId } = useAppStore();
  const deleteSession = useDeleteSession();

  // Cleanup session when user leaves
  useEffect(() => {
    const handleCleanup = () => {
      if (sessionId) {
        deleteSession.mutate(sessionId);
      }
    };

    // Cleanup on page unload (browser close, tab close, navigation)
    window.addEventListener('beforeunload', handleCleanup);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleCleanup);
      handleCleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]); // deleteSession.mutate is stable and doesn't need to be in deps

  return (
    <AppLayout
      sidebar={<Sidebar />}
      pdfViewer={documentId ? <PdfViewer /> : <PdfUpload />}
      chatPanel={<ChatPanel />}
    />
  );
}
