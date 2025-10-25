import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';

// Import PDFParse class from pdf-parse
const { PDFParse } = require('pdf-parse');

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  startChar: number;
  endChar: number;
}

export interface ExtractedPdfData {
  text: string;
  pages: ExtractedPage[];
  numPages: number;
  info: any;
}

@Injectable()
export class PdfExtractorService {
  private readonly logger = new Logger(PdfExtractorService.name);

  /**
   * Extract text from PDF file with page tracking
   */
  async extractText(filePath: string): Promise<ExtractedPdfData> {
    try {
      this.logger.log(`Extracting text from PDF: ${filePath}`);

      // Read the PDF file
      const dataBuffer = await fs.readFile(filePath);

      // Create PDFParse instance
      const parser = new PDFParse({ data: dataBuffer });

      // Get metadata
      const info = await parser.getInfo();

      // Get text with page information
      const textResult = await parser.getText();

      // Build pages array from text result
      const pages: ExtractedPage[] = [];
      let currentChar = 0;

      for (let i = 0; i < textResult.pages.length; i++) {
        const pageText = textResult.pages[i].text;
        const startChar = currentChar;
        const endChar = currentChar + pageText.length;

        pages.push({
          pageNumber: i + 1,
          text: pageText,
          startChar,
          endChar,
        });

        currentChar = endChar;
      }

      // Clean up
      await parser.destroy();

      this.logger.log(
        `Successfully extracted text from ${pages.length} pages`,
      );

      return {
        text: textResult.text,
        pages,
        numPages: textResult.pages.length,
        info: info.info,
      };
    } catch (error) {
      this.logger.error(`Error extracting PDF text: ${error.message}`);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Get page number for a given character position
   */
  getPageNumberForPosition(
    pages: ExtractedPage[],
    charPosition: number,
  ): number {
    for (const page of pages) {
      if (charPosition >= page.startChar && charPosition <= page.endChar) {
        return page.pageNumber;
      }
    }
    return 1; // Default to first page if not found
  }
}
