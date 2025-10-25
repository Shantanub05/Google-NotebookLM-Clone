import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './common/config/config.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { ChatModule } from './modules/chat/chat.module';
import { VectorModule } from './modules/vector/vector.module';
import { OpenAIModule } from './modules/openai/openai.module';

@Module({
  imports: [
    ConfigModule,
    OpenAIModule,
    VectorModule,
    PdfModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
