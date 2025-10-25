import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { VectorStoreService } from '../vector/vector-store.service';
import { OpenAIService } from '../openai/openai.service';
import { PdfService } from '../pdf/pdf.service';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  timestamp: Date;
  sessionId: string;
}

export interface Citation {
  id: string;
  pageNumber: number;
  text: string;
  score: number;
}

export interface ChatSession {
  id: string;
  documentId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly sessions = new Map<string, ChatSession>();

  constructor(
    private vectorStore: VectorStoreService,
    private openaiService: OpenAIService,
    private pdfService: PdfService,
  ) {}

  /**
   * Create a new chat session
   */
  createSession(documentId: string): ChatSession {
    const sessionId = uuidv4();

    const session: ChatSession = {
      id: sessionId,
      documentId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, session);

    this.logger.log(`Created chat session: ${sessionId} for document: ${documentId}`);

    return session;
  }

  /**
   * Get chat session by ID
   */
  getSession(sessionId: string): ChatSession {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    return session;
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    sessionId: string,
    documentId: string,
    userMessage: string,
  ): Promise<ChatMessage> {
    try {
      this.logger.log(
        `Processing message for session ${sessionId}: "${userMessage.substring(0, 50)}..."`,
      );

      // Verify document exists
      await this.pdfService.getMetadata(documentId);

      // Get or create session
      let session = this.sessions.get(sessionId);
      if (!session) {
        session = this.createSession(documentId);
      }

      // Add user message to history
      const userChatMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
        sessionId,
      };

      session.messages.push(userChatMessage);

      // Perform RAG query
      const searchResults = await this.vectorStore.search(
        userMessage,
        undefined,
        { documentId },
      );

      // Build context from search results
      const context = searchResults
        .map((result, index) => {
          return `[Page ${result.metadata.pageNumber}]\n${result.text}\n`;
        })
        .join('\n---\n');

      // Prepare conversation history
      const conversationHistory = session.messages
        .slice(-6) // Last 6 messages (3 exchanges)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Generate AI response
      const aiResponse = await this.openaiService.generateChatCompletion(
        userMessage,
        context,
        conversationHistory,
      );

      // Extract citations from AI response
      const citations = this.extractCitations(aiResponse, searchResults);

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse,
        citations,
        timestamp: new Date(),
        sessionId,
      };

      // Add to session
      session.messages.push(assistantMessage);
      session.updatedAt = new Date();

      this.sessions.set(sessionId, session);

      this.logger.log(`Generated response for session ${sessionId}`);

      return assistantMessage;
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract page citations from AI response
   */
  private extractCitations(response: string, searchResults: any[]): Citation[] {
    const citations: Citation[] = [];
    const pagePattern = /\[Page (\d+)\]/g;
    let match: RegExpExecArray | null;

    // Extract page numbers from response
    const pageNumbers = new Set<number>();
    while ((match = pagePattern.exec(response)) !== null) {
      pageNumbers.add(parseInt(match[1], 10));
    }

    // Create citations from search results that match mentioned pages
    for (const result of searchResults) {
      if (pageNumbers.has(result.metadata.pageNumber)) {
        citations.push({
          id: result.id,
          pageNumber: result.metadata.pageNumber,
          text: result.text.substring(0, 200), // Preview
          score: result.score,
        });
      }
    }

    // If no explicit page citations, use top results
    if (citations.length === 0 && searchResults.length > 0) {
      for (let i = 0; i < Math.min(3, searchResults.length); i++) {
        const result = searchResults[i];
        citations.push({
          id: result.id,
          pageNumber: result.metadata.pageNumber,
          text: result.text.substring(0, 200),
          score: result.score,
        });
      }
    }

    return citations;
  }

  /**
   * Get chat history for a session
   */
  getHistory(sessionId: string): ChatMessage[] {
    const session = this.getSession(sessionId);
    return session.messages;
  }

  /**
   * Clear chat history for a session
   */
  clearHistory(sessionId: string): void {
    const session = this.getSession(sessionId);
    session.messages = [];
    session.updatedAt = new Date();
    this.sessions.set(sessionId, session);

    this.logger.log(`Cleared history for session: ${sessionId}`);
  }

  /**
   * Delete a chat session
   */
  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.logger.log(`Deleted session: ${sessionId}`);
  }

  /**
   * Get all sessions for a document
   */
  getSessionsByDocument(documentId: string): ChatSession[] {
    const sessions: ChatSession[] = [];

    for (const session of this.sessions.values()) {
      if (session.documentId === documentId) {
        sessions.push(session);
      }
    }

    return sessions;
  }
}
