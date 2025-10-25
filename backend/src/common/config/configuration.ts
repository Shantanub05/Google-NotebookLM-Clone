export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    embeddingModel: process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small',
    chatModel: process.env.CHAT_MODEL ?? 'gpt-4o',
    maxTokens: parseInt(process.env.MAX_TOKENS ?? '4096', 10),
    temperature: parseFloat(process.env.TEMPERATURE ?? '0.7'),
  },

  vectorDb: process.env.VECTOR_DB ?? 'pinecone',

  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT ?? 'us-east-1-aws',
    index: process.env.PINECONE_INDEX ?? 'notebooklm-clone',
  },

  chroma: {
    host: process.env.CHROMA_HOST ?? 'localhost',
    port: parseInt(process.env.CHROMA_PORT ?? '8000', 10),
    persistDirectory: process.env.CHROMA_PERSIST_DIRECTORY ?? './chroma_data',
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? '52428800', 10), // 50MB
    uploadDir: process.env.UPLOAD_DIR ?? './uploads',
  },

  chat: {
    chunkSize: parseInt(process.env.CHUNK_SIZE ?? '500', 10),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP ?? '50', 10),
    topKResults: parseInt(process.env.TOP_K_RESULTS ?? '5', 10),
  },

  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  },
});
