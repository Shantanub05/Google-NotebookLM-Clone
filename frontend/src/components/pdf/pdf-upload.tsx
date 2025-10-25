'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useUploadPdf } from '@/hooks/use-pdf';
import { useAppStore } from '@/store/app-store';
import { useCreateSession } from '@/hooks/use-chat';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export function PdfUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const { setDocument, setIsUploading } = useAppStore();
  const uploadPdf = useUploadPdf();
  const createSession = useCreateSession();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }

      if (file.size > 52428800) {
        // 50MB
        toast.error('File size must be less than 50MB');
        return;
      }

      try {
        setIsUploading(true);
        setUploadProgress(0);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 300);

        // Upload PDF
        const sessionId = uuidv4();
        const response = await uploadPdf.mutateAsync({ file, sessionId });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (response.success) {
          const pdfData = response.data;

          // Create chat session
          const sessionResponse = await createSession.mutateAsync(pdfData.id);

          if (sessionResponse.success) {
            const sessionData = sessionResponse.data;

            // Update store
            setDocument(
              pdfData.id,
              pdfData.originalName,
              sessionData.id,
              pdfData.pageCount
            );

            toast.success('PDF uploaded and ready for chat!');
          }
        }

        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
        }, 500);
      } catch (error: any) {
        console.error('Upload error:', error);
        setUploadProgress(0);
        setIsUploading(false);
        toast.error(error.response?.data?.error || 'Failed to upload PDF');
      }
    },
    [uploadPdf, createSession, setDocument, setIsUploading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploadPdf.isPending,
  });

  if (uploadPdf.isPending) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center space-y-4 p-8"
      >
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Processing PDF...</p>
          <p className="text-xs text-muted-foreground">
            Extracting text and creating embeddings
          </p>
        </div>
        {uploadProgress > 0 && (
          <div className="w-full max-w-xs">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-center mt-2 text-muted-foreground">
              {uploadProgress}%
            </p>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8"
    >
      <Card
        {...getRootProps()}
        className={`
          relative cursor-pointer border-2 border-dashed p-12 transition-all duration-200
          ${
            isDragActive
              ? 'border-primary bg-primary/5 scale-105'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <motion.div
            animate={{
              scale: isDragActive ? 1.1 : 1,
              rotate: isDragActive ? 5 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {isDragActive ? (
              <FileText className="h-16 w-16 text-primary" />
            ) : (
              <Upload className="h-16 w-16 text-muted-foreground" />
            )}
          </motion.div>

          <div className="space-y-2">
            <p className="text-lg font-semibold">
              {isDragActive ? 'Drop PDF here' : 'Upload PDF to start chatting'}
            </p>
            <p className="text-sm text-muted-foreground">
              Click or drag and drop your PDF file here
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: 50MB
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
