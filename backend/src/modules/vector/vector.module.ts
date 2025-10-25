import { Module } from '@nestjs/common';
import { VectorStoreService } from './vector-store.service';
import { OpenAIModule } from '../openai/openai.module';

@Module({
  imports: [OpenAIModule],
  providers: [VectorStoreService],
  exports: [VectorStoreService],
})
export class VectorModule {}
