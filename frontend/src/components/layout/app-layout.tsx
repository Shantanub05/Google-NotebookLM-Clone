'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface AppLayoutProps {
  sidebar: React.ReactNode;
  pdfViewer: React.ReactNode;
  chatPanel: React.ReactNode;
}

export function AppLayout({ sidebar, pdfViewer, chatPanel }: AppLayoutProps) {
  const { isSidebarOpen, toggleSidebar, documentId } = useAppStore();

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex h-full">
        {/* Sidebar - File List */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-20 w-80 border-r border-border bg-card/50 backdrop-blur-xl"
            >
              <div className="flex h-full flex-col">
                {sidebar}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* PDF Viewer */}
          <motion.div
            layout
            className={cn(
              'relative flex-1 transition-all duration-300',
              documentId ? 'opacity-100' : 'opacity-50'
            )}
          >
            {!isSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-4 z-10"
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            {pdfViewer}
          </motion.div>

          {/* Chat Panel */}
          <motion.div
            layout
            className="w-[480px] border-l border-border bg-card/30 backdrop-blur-xl"
          >
            {chatPanel}
          </motion.div>
        </div>
      </div>

      {/* Sidebar Toggle Button (when closed) */}
      {!isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed left-4 top-4 z-30"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="shadow-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
