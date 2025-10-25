import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfExtractorService } from './pdf-extractor.service';
import { TextChunkerService } from './text-chunker.service';
import { PdfController } from './pdf.controller';
import { VectorModule } from '../vector/vector.module';

@Module({
  imports: [VectorModule],
  controllers: [PdfController],
  providers: [PdfService, PdfExtractorService, TextChunkerService],
  exports: [PdfService],
})
export class PdfModule {}
