import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  get port(): number {
    return this.configService.get<number>('port') ?? 3001;
  }

  get nodeEnv(): string {
    return this.configService.get<string>('nodeEnv') ?? 'development';
  }

  get openaiApiKey(): string {
    const apiKey = this.configService.get<string>('openai.apiKey');
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    return apiKey;
  }

  get embeddingModel(): string {
    return this.configService.get<string>('openai.embeddingModel') ?? 'text-embedding-3-small';
  }

  get chatModel(): string {
    return this.configService.get<string>('openai.chatModel') ?? 'gpt-4o';
  }

  get maxTokens(): number {
    return this.configService.get<number>('openai.maxTokens') ?? 4096;
  }

  get temperature(): number {
    return this.configService.get<number>('openai.temperature') ?? 0.7;
  }

  get vectorDb(): string {
    return this.configService.get<string>('vectorDb') ?? 'pinecone';
  }

  get pineconeApiKey(): string {
    const apiKey = this.configService.get<string>('pinecone.apiKey');
    if (!apiKey && this.vectorDb === 'pinecone') {
      throw new Error('Pinecone API key is not configured');
    }
    return apiKey ?? '';
  }

  get pineconeEnvironment(): string {
    return this.configService.get<string>('pinecone.environment') ?? 'us-east-1-aws';
  }

  get pineconeIndex(): string {
    return this.configService.get<string>('pinecone.index') ?? 'notebooklm-clone';
  }

  get chromaHost(): string {
    return this.configService.get<string>('chroma.host') ?? 'localhost';
  }

  get chromaPort(): number {
    return this.configService.get<number>('chroma.port') ?? 8000;
  }

  get chromaPersistDirectory(): string {
    return this.configService.get<string>('chroma.persistDirectory') ?? './chroma_data';
  }

  get maxFileSize(): number {
    return this.configService.get<number>('upload.maxFileSize') ?? 52428800;
  }

  get uploadDir(): string {
    return this.configService.get<string>('upload.uploadDir') ?? './uploads';
  }

  get chunkSize(): number {
    return this.configService.get<number>('chat.chunkSize') ?? 500;
  }

  get chunkOverlap(): number {
    return this.configService.get<number>('chat.chunkOverlap') ?? 50;
  }

  get topKResults(): number {
    return this.configService.get<number>('chat.topKResults') ?? 5;
  }

  get corsOrigin(): string {
    return this.configService.get<string>('cors.origin') ?? 'http://localhost:3000';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
}
