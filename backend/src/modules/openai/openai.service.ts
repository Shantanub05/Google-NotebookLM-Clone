import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { AppConfigService } from '../../common/config/config.service';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI;

  constructor(private configService: AppConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.openaiApiKey,
    });
  }

  /**
   * Generate embeddings for a given text
   */
  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.configService.embeddingModel,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(`Error creating embedding: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async createEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.configService.embeddingModel,
        input: texts,
      });

      return response.data.map((item) => item.embedding);
    } catch (error) {
      this.logger.error(`Error creating embeddings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate chat completion with context
   */
  async generateChatCompletion(
    userMessage: string,
    context: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
  ): Promise<string> {
    try {
      const systemPrompt = `You are a helpful AI assistant that answers questions based on the provided PDF document context.

IMPORTANT INSTRUCTIONS:
1. Answer questions ONLY based on the provided context
2. If the answer is not in the context, say "I cannot find that information in the document"
3. Provide specific page references when answering, using the format [Page X]
4. Be concise but comprehensive
5. If you reference information, cite the page number

Context from document:
${context}`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ];

      const response = await this.openai.chat.completions.create({
        model: this.configService.chatModel,
        messages: messages as any,
        temperature: this.configService.temperature,
        max_tokens: this.configService.maxTokens,
      });

      return response.choices[0].message.content ?? '';
    } catch (error) {
      this.logger.error(`Error generating chat completion: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate chat completion with streaming (for future use)
   */
  async *generateChatCompletionStream(
    userMessage: string,
    context: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
  ): AsyncGenerator<string> {
    try {
      const systemPrompt = `You are a helpful AI assistant that answers questions based on the provided PDF document context.

IMPORTANT INSTRUCTIONS:
1. Answer questions ONLY based on the provided context
2. If the answer is not in the context, say "I cannot find that information in the document"
3. Provide specific page references when answering, using the format [Page X]
4. Be concise but comprehensive

Context from document:
${context}`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ];

      const stream = await this.openai.chat.completions.create({
        model: this.configService.chatModel,
        messages: messages as any,
        temperature: this.configService.temperature,
        max_tokens: this.configService.maxTokens,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      this.logger.error(
        `Error generating streaming chat completion: ${error.message}`,
      );
      throw error;
    }
  }
}
