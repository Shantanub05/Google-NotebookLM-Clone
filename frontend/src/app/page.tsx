'use client';

import dynamic from 'next/dynamic';
import { AppLayout } from '@/components/layout/app-layout';
import { Sidebar } from '@/components/layout/sidebar';
import { PdfUpload } from '@/components/pdf/pdf-upload';
import { ChatPanel } from '@/components/chat/chat-panel';
import { useAppStore } from '@/store/app-store';

// Dynamically import PdfViewer with SSR disabled to avoid DOMMatrix errors
const PdfViewer = dynamic(
  () => import('@/components/pdf/pdf-viewer').then((mod) => mod.PdfViewer),
  { ssr: false }
);

export default function HomePage() {
  const { documentId } = useAppStore();

  return (
    <AppLayout
      sidebar={<Sidebar />}
      pdfViewer={documentId ? <PdfViewer /> : <PdfUpload />}
      chatPanel={<ChatPanel />}
    />
  );
}
