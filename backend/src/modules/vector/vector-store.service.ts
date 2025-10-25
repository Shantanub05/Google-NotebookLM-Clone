import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Pinecone } from '@pinecone-database/pinecone';
import { ChromaClient, Collection } from 'chromadb';
import { AppConfigService } from '../../common/config/config.service';
import { OpenAIService } from '../openai/openai.service';

export interface VectorDocument {
  id: string;
  text: string;
  metadata: {
    documentId: string;
    pageNumber: number;
    chunkIndex: number;
    startChar: number;
    endChar: number;
  };
}

export interface SearchResult {
  id: string;
  text: string;
  score: number;
  metadata: {
    documentId: string;
    pageNumber: number;
    chunkIndex: number;
    startChar: number;
    endChar: number;
  };
}

@Injectable()
export class VectorStoreService implements OnModuleInit {
  private readonly logger = new Logger(VectorStoreService.name);

  // Pinecone
  private pinecone: Pinecone;
  private pineconeIndex: any;

  // ChromaDB
  private chromaClient: ChromaClient;
  private chromaCollection: Collection;

  private readonly collectionName = 'pdf_documents';
  private vectorDbType: string;

  constructor(
    private configService: AppConfigService,
    private openaiService: OpenAIService,
  ) {}

  async onModuleInit() {
    this.vectorDbType = this.configService.vectorDb;

    if (this.vectorDbType === 'pinecone') {
      await this.initializePinecone();
    } else {
      await this.initializeChroma();
    }
  }

  /**
   * Initialize Pinecone client and index
   */
  private async initializePinecone() {
    try {
      this.logger.log('Initializing Pinecone client...');

      this.pinecone = new Pinecone({
        apiKey: this.configService.pineconeApiKey,
      });

      const indexName = this.configService.pineconeIndex;

      // Check if index exists
      const indexes = await this.pinecone.listIndexes();
      const indexExists = indexes.indexes?.some(idx => idx.name === indexName);

      if (!indexExists) {
        this.logger.log(`Creating Pinecone index: ${indexName}`);
        await this.pinecone.createIndex({
          name: indexName,
          dimension: 1536, // OpenAI text-embedding-3-small dimension
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1',
            },
          },
        });

        // Wait for index to be ready
        this.logger.log('Waiting for index to be ready...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }

      this.pineconeIndex = this.pinecone.index(indexName);
      this.logger.log('Pinecone initialized successfully');
    } catch (error) {
      this.logger.error(`Error initializing Pinecone: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initialize ChromaDB client and collection
   */
  private async initializeChroma() {
    try {
      this.logger.log('Initializing ChromaDB client...');

      this.chromaClient = new ChromaClient({
        path: `http://${this.configService.chromaHost}:${this.configService.chromaPort}`,
      });

      try {
        this.chromaCollection = await this.chromaClient.getCollection({
          name: this.collectionName,
        });
        this.logger.log(`Using existing collection: ${this.collectionName}`);
      } catch (error) {
        this.logger.log(`Creating new collection: ${this.collectionName}`);
        this.chromaCollection = await this.chromaClient.createCollection({
          name: this.collectionName,
          metadata: { description: 'PDF document chunks with embeddings' },
        });
      }

      this.logger.log('ChromaDB initialized successfully');
    } catch (error) {
      this.logger.error(`Error initializing ChromaDB: ${error.message}`);
      this.logger.warn('Running without vector store - using in-memory fallback');
    }
  }

  /**
   * Add documents to the vector store
   */
  async addDocuments(documents: VectorDocument[]): Promise<void> {
    if (this.vectorDbType === 'pinecone') {
      return this.addDocumentsToPinecone(documents);
    } else {
      return this.addDocumentsToChroma(documents);
    }
  }

  private async addDocumentsToPinecone(documents: VectorDocument[]): Promise<void> {
    try {
      if (!this.pineconeIndex) {
        throw new Error('Pinecone index not initialized');
      }

      this.logger.log(`Adding ${documents.length} documents to Pinecone`);

      // Generate embeddings
      const texts = documents.map((doc) => doc.text);
      const embeddings = await this.openaiService.createEmbeddings(texts);

      // Prepare vectors for Pinecone
      const vectors = documents.map((doc, idx) => ({
        id: doc.id,
        values: embeddings[idx],
        metadata: {
          text: doc.text,
          documentId: doc.metadata.documentId,
          pageNumber: doc.metadata.pageNumber,
          chunkIndex: doc.metadata.chunkIndex,
          startChar: doc.metadata.startChar,
          endChar: doc.metadata.endChar,
        },
      }));

      // Upsert to Pinecone
      await this.pineconeIndex.upsert(vectors);

      this.logger.log('Documents added to Pinecone successfully');
    } catch (error) {
      this.logger.error(`Error adding documents to Pinecone: ${error.message}`);
      throw error;
    }
  }

  private async addDocumentsToChroma(documents: VectorDocument[]): Promise<void> {
    try {
      if (!this.chromaCollection) {
        throw new Error('ChromaDB collection not initialized');
      }

      this.logger.log(`Adding ${documents.length} documents to ChromaDB`);

      // Generate embeddings
      const texts = documents.map((doc) => doc.text);
      const embeddings = await this.openaiService.createEmbeddings(texts);

      const ids = documents.map((doc) => doc.id);
      const metadatas = documents.map((doc) => ({
        ...doc.metadata,
        text: doc.text.substring(0, 1000),
      }));

      await this.chromaCollection.add({
        ids,
        embeddings,
        documents: texts,
        metadatas,
      });

      this.logger.log('Documents added to ChromaDB successfully');
    } catch (error) {
      this.logger.error(`Error adding documents to ChromaDB: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for similar documents
   */
  async search(
    query: string,
    topK?: number,
    filter?: Record<string, any>,
  ): Promise<SearchResult[]> {
    if (this.vectorDbType === 'pinecone') {
      return this.searchPinecone(query, topK, filter);
    } else {
      return this.searchChroma(query, topK, filter);
    }
  }

  private async searchPinecone(
    query: string,
    topK?: number,
    filter?: Record<string, any>,
  ): Promise<SearchResult[]> {
    try {
      if (!this.pineconeIndex) {
        throw new Error('Pinecone index not initialized');
      }

      const k = topK || this.configService.topKResults;
      this.logger.log(`Searching Pinecone for: "${query.substring(0, 50)}..." (top ${k})`);

      // Generate query embedding
      const queryEmbedding = await this.openaiService.createEmbedding(query);

      // Search in Pinecone
      // Note: Serverless indexes may have issues with metadata filtering
      // Query without filter and filter results in-memory if needed
      const queryK = filter ? k * 5 : k; // Get more results if we need to filter

      const queryResponse = await this.pineconeIndex.query({
        vector: queryEmbedding,
        topK: queryK,
        includeMetadata: true,
        // Don't use filter on serverless - filter in-memory instead
      });

      // Format and filter results
      let searchResults: SearchResult[] = queryResponse.matches.map((match: any) => ({
        id: match.id,
        text: match.metadata.text,
        score: match.score,
        metadata: {
          documentId: match.metadata.documentId,
          pageNumber: match.metadata.pageNumber,
          chunkIndex: match.metadata.chunkIndex,
          startChar: match.metadata.startChar,
          endChar: match.metadata.endChar,
        },
      }));

      // Apply in-memory filtering if filter is provided
      if (filter) {
        searchResults = searchResults.filter((result) => {
          for (const [key, value] of Object.entries(filter)) {
            if ((result.metadata as any)[key] !== value) {
              return false;
            }
          }
          return true;
        });

        // Trim to requested topK after filtering
        searchResults = searchResults.slice(0, k);
      }

      this.logger.log(`Found ${searchResults.length} results in Pinecone`);
      return searchResults;
    } catch (error) {
      this.logger.error(`Error searching Pinecone: ${error.message}`);
      throw error;
    }
  }

  private async searchChroma(
    query: string,
    topK?: number,
    filter?: Record<string, any>,
  ): Promise<SearchResult[]> {
    try {
      if (!this.chromaCollection) {
        throw new Error('ChromaDB collection not initialized');
      }

      const k = topK || this.configService.topKResults;
      this.logger.log(`Searching ChromaDB for: "${query.substring(0, 50)}..." (top ${k})`);

      const queryEmbedding = await this.openaiService.createEmbedding(query);

      const results = await this.chromaCollection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: k,
        where: filter,
      });

      const searchResults: SearchResult[] = [];

      if (results.ids && results.ids[0]) {
        for (let i = 0; i < results.ids[0].length; i++) {
          const id = results.ids[0][i];
          const text = results.documents[0][i] as string;
          const metadata = results.metadatas[0][i] as any;
          const distance = results.distances[0][i] ?? 0;

          const score = 1 / (1 + distance);

          searchResults.push({
            id,
            text,
            score,
            metadata: {
              documentId: metadata.documentId,
              pageNumber: metadata.pageNumber,
              chunkIndex: metadata.chunkIndex,
              startChar: metadata.startChar,
              endChar: metadata.endChar,
            },
          });
        }
      }

      this.logger.log(`Found ${searchResults.length} results in ChromaDB`);
      return searchResults;
    } catch (error) {
      this.logger.error(`Error searching ChromaDB: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete all documents for a specific document ID
   */
  async deleteDocument(documentId: string): Promise<void> {
    if (this.vectorDbType === 'pinecone') {
      return this.deleteDocumentFromPinecone(documentId);
    } else {
      return this.deleteDocumentFromChroma(documentId);
    }
  }

  private async deleteDocumentFromPinecone(documentId: string): Promise<void> {
    try {
      if (!this.pineconeIndex) {
        throw new Error('Pinecone index not initialized');
      }

      this.logger.log(`Deleting document from Pinecone: ${documentId}`);

      // Serverless indexes don't support delete by metadata
      // Instead, we query with a high topK to get all matching vectors, then delete by IDs

      // Create a dummy query vector (all zeros) - we only care about metadata
      const dummyVector = new Array(1536).fill(0);

      // Query for all vectors with this documentId
      const queryResponse = await this.pineconeIndex.query({
        vector: dummyVector,
        topK: 10000, // High number to get all chunks
        includeMetadata: true,
      });

      // Filter results by documentId in-memory
      const matchingIds = queryResponse.matches
        .filter((match: any) => match.metadata.documentId === documentId)
        .map((match: any) => match.id);

      if (matchingIds.length > 0) {
        this.logger.log(`Found ${matchingIds.length} vectors to delete for document ${documentId}`);

        // Delete by IDs
        await this.pineconeIndex.deleteMany(matchingIds);

        this.logger.log(`Deleted ${matchingIds.length} vectors for document ${documentId}`);
      } else {
        this.logger.log(`No vectors found for document ${documentId}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting document from Pinecone: ${error.message}`);
      throw error;
    }
  }

  private async deleteDocumentFromChroma(documentId: string): Promise<void> {
    try {
      if (!this.chromaCollection) {
        throw new Error('ChromaDB collection not initialized');
      }

      this.logger.log(`Deleting document from ChromaDB: ${documentId}`);

      const results = await this.chromaCollection.get({
        where: { documentId },
      });

      if (results.ids && results.ids.length > 0) {
        await this.chromaCollection.delete({
          ids: results.ids,
        });

        this.logger.log(`Deleted ${results.ids.length} chunks for document ${documentId}`);
      } else {
        this.logger.log(`No chunks found for document ${documentId}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting document from ChromaDB: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get collection stats
   */
  async getStats(): Promise<{ count: number }> {
    try {
      if (this.vectorDbType === 'pinecone') {
        if (!this.pineconeIndex) {
          return { count: 0 };
        }
        const stats = await this.pineconeIndex.describeIndexStats();
        return { count: stats.totalRecordCount || 0 };
      } else {
        if (!this.chromaCollection) {
          return { count: 0 };
        }
        const count = await this.chromaCollection.count();
        return { count };
      }
    } catch (error) {
      this.logger.error(`Error getting stats: ${error.message}`);
      return { count: 0 };
    }
  }

  /**
   * Clear all documents from the collection
   */
  async clearCollection(): Promise<void> {
    if (this.vectorDbType === 'pinecone') {
      await this.clearPineconeIndex();
    } else {
      await this.clearChromaCollection();
    }
  }

  private async clearPineconeIndex(): Promise<void> {
    try {
      if (!this.pineconeIndex) {
        return;
      }

      this.logger.log('Clearing Pinecone index...');
      await this.pineconeIndex.deleteAll();
      this.logger.log('Pinecone index cleared');
    } catch (error) {
      this.logger.error(`Error clearing Pinecone index: ${error.message}`);
      throw error;
    }
  }

  private async clearChromaCollection(): Promise<void> {
    try {
      if (!this.chromaCollection) {
        return;
      }

      this.logger.log('Clearing ChromaDB collection...');

      await this.chromaClient.deleteCollection({ name: this.collectionName });
      this.chromaCollection = await this.chromaClient.createCollection({
        name: this.collectionName,
        metadata: { description: 'PDF document chunks with embeddings' },
      });

      this.logger.log('ChromaDB collection cleared');
    } catch (error) {
      this.logger.error(`Error clearing ChromaDB collection: ${error.message}`);
      throw error;
    }
  }
}
