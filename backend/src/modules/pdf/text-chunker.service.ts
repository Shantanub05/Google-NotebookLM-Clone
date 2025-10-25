import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../common/config/config.service';
import { ExtractedPage } from './pdf-extractor.service';

export interface TextChunk {
  id: string;
  text: string;
  pageNumber: number;
  chunkIndex: number;
  startChar: number;
  endChar: number;
}

@Injectable()
export class TextChunkerService {
  private readonly logger = new Logger(TextChunkerService.name);

  constructor(private configService: AppConfigService) {}

  /**
   * Split extracted pages into overlapping chunks
   */
  chunkPages(pages: ExtractedPage[], documentId: string): TextChunk[] {
    const chunkSize = this.configService.chunkSize;
    const chunkOverlap = this.configService.chunkOverlap;

    this.logger.log(
      `Chunking document with size=${chunkSize}, overlap=${chunkOverlap}`,
    );

    const chunks: TextChunk[] = [];
    let globalChunkIndex = 0;

    for (const page of pages) {
      const pageChunks = this.chunkText(
        page.text,
        chunkSize,
        chunkOverlap,
        page.pageNumber,
        page.startChar,
        globalChunkIndex,
        documentId,
      );

      chunks.push(...pageChunks);
      globalChunkIndex += pageChunks.length;
    }

    this.logger.log(`Created ${chunks.length} chunks from ${pages.length} pages`);

    return chunks;
  }

  /**
   * Split a single text into overlapping chunks
   */
  private chunkText(
    text: string,
    chunkSize: number,
    overlap: number,
    pageNumber: number,
    pageStartChar: number,
    startingIndex: number,
    documentId: string,
  ): TextChunk[] {
    const chunks: TextChunk[] = [];
    const words = text.split(/\s+/).filter((word) => word.length > 0);

    if (words.length === 0) {
      return chunks;
    }

    let currentChunk: string[] = [];
    let chunkIndex = startingIndex;
    let wordIndex = 0;

    while (wordIndex < words.length) {
      currentChunk = [];

      // Build chunk up to chunkSize words
      while (
        currentChunk.length < chunkSize &&
        wordIndex < words.length
      ) {
        currentChunk.push(words[wordIndex]);
        wordIndex++;
      }

      // Create chunk
      const chunkText = currentChunk.join(' ');
      const chunkId = `${documentId}_chunk_${chunkIndex}`;

      // Calculate character positions (approximate)
      const startChar = pageStartChar;
      const endChar = pageStartChar + chunkText.length;

      chunks.push({
        id: chunkId,
        text: chunkText,
        pageNumber,
        chunkIndex,
        startChar,
        endChar,
      });

      chunkIndex++;

      // Move back by overlap amount for the next chunk
      if (wordIndex < words.length && overlap > 0) {
        wordIndex -= Math.min(overlap, currentChunk.length);
      }
    }

    return chunks;
  }

  /**
   * Split text into chunks by character count (alternative approach)
   */
  chunkByCharCount(
    text: string,
    pageNumber: number,
    documentId: string,
    startingIndex: number = 0,
  ): TextChunk[] {
    const chunkSize = this.configService.chunkSize * 5; // Approximate chars per token
    const overlap = this.configService.chunkOverlap * 5;

    const chunks: TextChunk[] = [];
    let start = 0;
    let chunkIndex = startingIndex;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunkText = text.substring(start, end).trim();

      if (chunkText.length > 0) {
        chunks.push({
          id: `${documentId}_chunk_${chunkIndex}`,
          text: chunkText,
          pageNumber,
          chunkIndex,
          startChar: start,
          endChar: end,
        });

        chunkIndex++;
      }

      start = end - overlap;
    }

    return chunks;
  }

  /**
   * Split text intelligently by sentences and paragraphs
   */
  chunkBySentences(
    text: string,
    pageNumber: number,
    documentId: string,
    startingIndex: number = 0,
  ): TextChunk[] {
    const targetSize = this.configService.chunkSize * 5;
    const chunks: TextChunk[] = [];

    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    let currentChunk = '';
    let chunkIndex = startingIndex;
    let startChar = 0;

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > targetSize && currentChunk.length > 0) {
        // Save current chunk
        chunks.push({
          id: `${documentId}_chunk_${chunkIndex}`,
          text: currentChunk.trim(),
          pageNumber,
          chunkIndex,
          startChar,
          endChar: startChar + currentChunk.length,
        });

        chunkIndex++;
        startChar += currentChunk.length;
        currentChunk = '';
      }

      currentChunk += sentence;
    }

    // Add remaining chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        id: `${documentId}_chunk_${chunkIndex}`,
        text: currentChunk.trim(),
        pageNumber,
        chunkIndex,
        startChar,
        endChar: startChar + currentChunk.length,
      });
    }

    return chunks;
  }
}
