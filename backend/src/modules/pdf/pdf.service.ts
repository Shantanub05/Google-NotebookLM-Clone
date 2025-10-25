import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PdfExtractorService } from './pdf-extractor.service';
import { TextChunkerService } from './text-chunker.service';
import { VectorStoreService } from '../vector/vector-store.service';
import { AppConfigService } from '../../common/config/config.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface PdfMetadata {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  uploadedAt: Date;
  processedAt?: Date;
  pageCount: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  sessionId: string;
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly pdfStore = new Map<string, PdfMetadata>();

  constructor(
    private pdfExtractor: PdfExtractorService,
    private textChunker: TextChunkerService,
    private vectorStore: VectorStoreService,
    private configService: AppConfigService,
  ) {
    this.ensureUploadDir();
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDir() {
    const uploadDir = this.configService.uploadDir;
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      this.logger.log(`Upload directory ready: ${uploadDir}`);
    } catch (error) {
      this.logger.error(`Error creating upload directory: ${error.message}`);
    }
  }

  /**
   * Process uploaded PDF file
   */
  async processFile(
    file: Express.Multer.File,
    sessionId: string,
  ): Promise<PdfMetadata> {
    const documentId = uuidv4();
    const filename = `${documentId}_${file.originalname}`;
    const filePath = path.join(this.configService.uploadDir, filename);

    try {
      this.logger.log(`Processing PDF: ${file.originalname}`);

      // Save file
      await fs.writeFile(filePath, file.buffer);

      // Create metadata
      const metadata: PdfMetadata = {
        id: documentId,
        filename,
        originalName: file.originalname,
        path: filePath,
        size: file.size,
        uploadedAt: new Date(),
        pageCount: 0,
        status: 'processing',
        sessionId,
      };

      this.pdfStore.set(documentId, metadata);

      // Extract text from PDF
      const extractedData = await this.pdfExtractor.extractText(filePath);

      // Update page count
      metadata.pageCount = extractedData.numPages;

      // Chunk the text
      const chunks = this.textChunker.chunkPages(
        extractedData.pages,
        documentId,
      );

      // Convert chunks to vector documents
      const vectorDocs = chunks.map((chunk) => ({
        id: chunk.id,
        text: chunk.text,
        metadata: {
          documentId,
          pageNumber: chunk.pageNumber,
          chunkIndex: chunk.chunkIndex,
          startChar: chunk.startChar,
          endChar: chunk.endChar,
        },
      }));

      // Store in vector database
      await this.vectorStore.addDocuments(vectorDocs);

      // Update metadata
      metadata.status = 'ready';
      metadata.processedAt = new Date();
      this.pdfStore.set(documentId, metadata);

      this.logger.log(`PDF processed successfully: ${documentId}`);

      return metadata;
    } catch (error) {
      this.logger.error(`Error processing PDF: ${error.message}`);

      // Update status to error
      const metadata = this.pdfStore.get(documentId);
      if (metadata) {
        metadata.status = 'error';
        this.pdfStore.set(documentId, metadata);
      }

      // Clean up file
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        this.logger.error(`Error deleting file: ${unlinkError.message}`);
      }

      throw error;
    }
  }

  /**
   * Get PDF metadata by ID
   */
  async getMetadata(documentId: string): Promise<PdfMetadata> {
    const metadata = this.pdfStore.get(documentId);

    if (!metadata) {
      throw new NotFoundException(`Document not found: ${documentId}`);
    }

    return metadata;
  }

  /**
   * Get PDF file content
   */
  async getFile(documentId: string): Promise<Buffer> {
    const metadata = await this.getMetadata(documentId);

    try {
      const fileBuffer = await fs.readFile(metadata.path);
      return fileBuffer;
    } catch (error) {
      this.logger.error(`Error reading file: ${error.message}`);
      throw new NotFoundException(`File not found: ${documentId}`);
    }
  }

  /**
   * Delete PDF and its vectors
   */
  async deleteDocument(documentId: string): Promise<void> {
    const metadata = this.pdfStore.get(documentId);

    if (!metadata) {
      throw new NotFoundException(`Document not found: ${documentId}`);
    }

    try {
      this.logger.log(`Deleting document: ${documentId}`);

      // Delete from vector store
      await this.vectorStore.deleteDocument(documentId);

      // Delete file
      try {
        await fs.unlink(metadata.path);
      } catch (error) {
        this.logger.error(`Error deleting file: ${error.message}`);
      }

      // Remove from store
      this.pdfStore.delete(documentId);

      this.logger.log(`Document deleted: ${documentId}`);
    } catch (error) {
      this.logger.error(`Error deleting document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all documents for a session
   */
  async getDocumentsBySession(sessionId: string): Promise<PdfMetadata[]> {
    const documents: PdfMetadata[] = [];

    for (const metadata of this.pdfStore.values()) {
      if (metadata.sessionId === sessionId) {
        documents.push(metadata);
      }
    }

    return documents;
  }

  /**
   * Get all documents
   */
  async getAllDocuments(): Promise<PdfMetadata[]> {
    return Array.from(this.pdfStore.values());
  }
}
