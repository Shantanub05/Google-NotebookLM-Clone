// PDF Document Types
export interface PdfDocument {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  uploadedAt: Date;
  processedAt?: Date;
  status: DocumentStatus;
  pageCount: number;
  sessionId: string;
}

export enum DocumentStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error',
}

// Chat Types
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
  score?: number;
}

export interface ChatSession {
  id: string;
  documentId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types
export interface UploadPdfRequest {
  file: File | Express.Multer.File;
}

export interface UploadPdfResponse {
  success: boolean;
  data?: PdfDocument;
  error?: string;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
  documentId: string;
}

export interface ChatResponse {
  success: boolean;
  data?: ChatMessage;
  error?: string;
}

export interface GetPdfResponse {
  success: boolean;
  data?: PdfDocument;
  error?: string;
}

export interface GetChatHistoryResponse {
  success: boolean;
  data?: ChatMessage[];
  error?: string;
}

export interface DeletePdfResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Vector Store Types
export interface VectorChunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  metadata: ChunkMetadata;
}

export interface ChunkMetadata {
  pageNumber: number;
  chunkIndex: number;
  startChar: number;
  endChar: number;
  documentId: string;
}

// OpenAI Types
export interface EmbeddingRequest {
  text: string;
  model?: string;
}

export interface CompletionRequest {
  messages: { role: string; content: string }[];
  context: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Error Types
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: any;
}

// Configuration Types
export interface AppConfig {
  openai: {
    apiKey: string;
    embeddingModel: string;
    chatModel: string;
    maxTokens: number;
    temperature: number;
  };
  chroma: {
    host: string;
    port: number;
    persistDirectory: string;
  };
  upload: {
    maxFileSize: number;
    uploadDir: string;
  };
  chat: {
    chunkSize: number;
    chunkOverlap: number;
    topKResults: number;
  };
}
