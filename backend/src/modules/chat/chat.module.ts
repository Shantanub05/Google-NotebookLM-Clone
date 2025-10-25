import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { VectorModule } from '../vector/vector.module';
import { OpenAIModule } from '../openai/openai.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [VectorModule, OpenAIModule, PdfModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
