'use client';

import { motion } from 'framer-motion';
import { FileText, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/custom/theme-toggle';
import { useAppStore } from '@/store/app-store';
import { useDeletePdf } from '@/hooks/use-pdf';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function Sidebar() {
  const { documentId, documentName, pageCount, toggleSidebar, clearDocument } = useAppStore();
  const deletePdf = useDeletePdf();

  const handleDelete = async () => {
    if (!documentId) return;

    if (confirm('Are you sure you want to delete this document?')) {
      await deletePdf.mutateAsync(documentId);
      clearDocument();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h1 className="text-lg font-bold">NotebookLM Clone</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {documentId && documentName ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium truncate" title={documentName}>
                      {documentName}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {pageCount} pages
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        PDF
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={handleDelete}
                  disabled={deletePdf.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <Separator />

              <div className="space-y-2 text-xs text-muted-foreground">
                <p>✓ Text extracted</p>
                <p>✓ Embeddings generated</p>
                <p>✓ Ready for questions</p>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="text-center space-y-2 py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No document uploaded yet
            </p>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">
            About
          </h3>
          <Card className="p-4 space-y-2 text-xs text-muted-foreground">
            <p>
              Upload a PDF and ask questions about its content. The AI will
              search the document and provide answers with page citations.
            </p>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <p className="text-xs text-center text-muted-foreground">
          Built with Next.js, NestJS & OpenAI
        </p>
      </div>
    </div>
  );
}
