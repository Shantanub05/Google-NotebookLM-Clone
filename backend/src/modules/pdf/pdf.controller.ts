import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Res,
  Query,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { PdfService } from './pdf.service';
import { AppConfigService } from '../../common/config/config.service';

@Controller('api/pdf')
export class PdfController {
  private readonly logger = new Logger(PdfController.name);

  constructor(
    private pdfService: PdfService,
    private configService: AppConfigService,
  ) {}

  /**
   * Upload and process PDF
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Query('sessionId') sessionId: string,
  ) {
    try {
      if (!file) {
        throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
      }

      if (file.mimetype !== 'application/pdf') {
        throw new HttpException(
          'Only PDF files are allowed',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (file.size > this.configService.maxFileSize) {
        throw new HttpException(
          `File size exceeds limit of ${this.configService.maxFileSize} bytes`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!sessionId) {
        sessionId = 'default-session';
      }

      this.logger.log(`Uploading PDF: ${file.originalname}`);

      const metadata = await this.pdfService.processFile(file, sessionId);

      return {
        success: true,
        data: metadata,
      };
    } catch (error) {
      this.logger.error(`Error uploading PDF: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to upload PDF',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get PDF metadata
   */
  @Get(':id')
  async getPdfMetadata(@Param('id') id: string) {
    try {
      const metadata = await this.pdfService.getMetadata(id);

      return {
        success: true,
        data: metadata,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to get PDF metadata',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get PDF file content
   */
  @Get(':id/content')
  async getPdfContent(@Param('id') id: string, @Res() res: Response) {
    try {
      const fileBuffer = await this.pdfService.getFile(id);
      const metadata = await this.pdfService.getMetadata(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${metadata.originalName}"`,
        'Content-Length': fileBuffer.length,
      });

      res.send(fileBuffer);
    } catch (error) {
      this.logger.error(`Error serving PDF: ${error.message}`);
      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Failed to serve PDF',
      });
    }
  }

  /**
   * Delete PDF
   */
  @Delete(':id')
  async deletePdf(@Param('id') id: string) {
    try {
      await this.pdfService.deleteDocument(id);

      return {
        success: true,
        message: 'PDF deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to delete PDF',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all PDFs for a session
   */
  @Get('session/:sessionId')
  async getSessionPdfs(@Param('sessionId') sessionId: string) {
    try {
      const documents = await this.pdfService.getDocumentsBySession(sessionId);

      return {
        success: true,
        data: documents,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to get session PDFs',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
