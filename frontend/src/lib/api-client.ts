import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 300000, // 5 minutes for large PDF processing
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // PDF Operations
  async uploadPdf(file: File, sessionId: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(
      `/api/pdf/upload?sessionId=${sessionId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  async getPdfMetadata(documentId: string): Promise<any> {
    const response = await this.client.get(`/api/pdf/${documentId}`);
    return response.data;
  }

  async getPdfContent(documentId: string): Promise<Blob> {
    const response = await this.client.get(`/api/pdf/${documentId}/content`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async deletePdf(documentId: string): Promise<any> {
    const response = await this.client.delete(`/api/pdf/${documentId}`);
    return response.data;
  }

  async getSessionPdfs(sessionId: string): Promise<any> {
    const response = await this.client.get(`/api/pdf/session/${sessionId}`);
    return response.data;
  }

  // Chat Operations
  async createSession(documentId: string): Promise<any> {
    const response = await this.client.post('/api/chat/session', {
      documentId,
    });
    return response.data;
  }

  async sendMessage(
    sessionId: string,
    documentId: string,
    message: string
  ): Promise<any> {
    const response = await this.client.post('/api/chat', {
      sessionId,
      documentId,
      message,
    });
    return response.data;
  }

  async getChatHistory(sessionId: string): Promise<any> {
    const response = await this.client.get(`/api/chat/${sessionId}/history`);
    return response.data;
  }

  async clearHistory(sessionId: string): Promise<any> {
    const response = await this.client.delete(
      `/api/chat/${sessionId}/history`
    );
    return response.data;
  }

  async deleteSession(sessionId: string): Promise<any> {
    const response = await this.client.delete(`/api/chat/${sessionId}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
