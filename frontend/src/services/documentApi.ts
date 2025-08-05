import { API_BASE_URL } from '../config/api';

export interface Document {
  id: string;
  filename: string;
  originalFilename: string;
  title: string;
  category: string | null;
  tags: string[];
  mimeType: string;
  fileSize: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  uploadedAt: string;
  processedAt: string | null;
  contentText?: string;
  extractedData?: any;
}

export interface DocumentUploadOptions {
  enableOCR?: boolean;
  extractStructuredData?: boolean;
  category?: string;
  title?: string;
  tags?: string[];
}

export interface DocumentSearchParams {
  query: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface DocumentListParams {
  category?: string;
  limit?: number;
  offset?: number;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface DocumentListResponse {
  documents: Document[];
  pagination: PaginationInfo;
}

export interface DocumentSearchResponse {
  documents: Document[];
  pagination: PaginationInfo;
  searchQuery: string;
}

class DocumentApiService {
  private baseUrl = `${API_BASE_URL}/documents`;

  /**
   * Upload a document file
   */
  async uploadDocument(
    file: File,
    options: DocumentUploadOptions = {}
  ): Promise<{ document: Document }> {
    const formData = new FormData();
    formData.append('document', file);

    if (options.title) {
      formData.append('title', options.title);
    }

    if (options.category) {
      formData.append('category', options.category);
    }

    if (options.tags) {
      formData.append('tags', JSON.stringify(options.tags));
    }

    const queryParams = new URLSearchParams();
    if (options.enableOCR !== undefined) {
      queryParams.append('enableOCR', options.enableOCR.toString());
    }
    if (options.extractStructuredData !== undefined) {
      queryParams.append('extractStructuredData', options.extractStructuredData.toString());
    }

    const url = queryParams.toString() 
      ? `${this.baseUrl}/upload?${queryParams}`
      : `${this.baseUrl}/upload`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get list of documents
   */
  async getDocuments(params: DocumentListParams = {}): Promise<DocumentListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.category) {
      queryParams.append('category', params.category);
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.offset) {
      queryParams.append('offset', params.offset.toString());
    }

    const url = queryParams.toString() 
      ? `${this.baseUrl}?${queryParams}`
      : this.baseUrl;

    const response = await fetch(url, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get a specific document by ID
   */
  async getDocument(documentId: string): Promise<Document> {
    const response = await fetch(`${this.baseUrl}/${documentId}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Document not found');
      }
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${documentId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Document not found');
      }
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }
  }

  /**
   * Get document processing status
   */
  async getProcessingStatus(documentId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    contentText?: string;
    extractedData?: any;
    processedAt?: string;
    error?: string;
    details?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/${documentId}/process`, {
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Document not found');
      }
      if (response.status === 422) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Processing failed');
      }
      throw new Error(`Failed to get processing status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search documents
   */
  async searchDocuments(params: DocumentSearchParams): Promise<DocumentSearchResponse> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload multiple documents
   */
  async uploadMultipleDocuments(
    files: File[],
    options: DocumentUploadOptions = {}
  ): Promise<{ document: Document }[]> {
    const uploadPromises = files.map(file => 
      this.uploadDocument(file, options)
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Get document download URL
   */
  getDownloadUrl(documentId: string): string {
    return `${this.baseUrl}/${documentId}/download`;
  }

  /**
   * Poll document processing status until complete
   */
  async pollProcessingStatus(
    documentId: string,
    maxAttempts: number = 30,
    intervalMs: number = 10000
  ): Promise<{
    status: 'completed' | 'failed';
    contentText?: string;
    extractedData?: any;
    processedAt?: string;
    error?: string;
  }> {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const result = await this.getProcessingStatus(documentId);

          if (result.status === 'completed') {
            resolve({
              status: 'completed',
              contentText: result.contentText,
              extractedData: result.extractedData,
              processedAt: result.processedAt
            });
            return;
          }

          if (result.status === 'failed') {
            resolve({
              status: 'failed',
              error: result.error || result.details || 'Processing failed'
            });
            return;
          }

          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error('Processing timeout'));
            return;
          }

          setTimeout(poll, intervalMs);

        } catch (error) {
          reject(error);
        }
      };

      // Start polling after a short delay
      setTimeout(poll, 2000);
    });
  }

  /**
   * Get document categories with counts
   */
  async getDocumentCategories(): Promise<{ category: string; count: number }[]> {
    // This would require a new backend endpoint
    // For now, return static categories
    return [
      { category: 'invoice', count: 0 },
      { category: 'quote', count: 0 },
      { category: 'certificate', count: 0 },
      { category: 'safety_document', count: 0 },
      { category: 'contract', count: 0 },
      { category: 'receipt', count: 0 },
      { category: 'technical_drawing', count: 0 },
      { category: 'photo', count: 0 },
      { category: 'email', count: 0 }
    ];
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(): Promise<{
    total: number;
    processed: number;
    processing: number;
    failed: number;
    totalSize: number;
  }> {
    // This would require a new backend endpoint
    // For now, get basic stats from document list
    try {
      const response = await this.getDocuments({ limit: 1000 }); // Get all documents
      const { documents } = response;

      const stats = {
        total: documents.length,
        processed: documents.filter(d => d.processingStatus === 'completed').length,
        processing: documents.filter(d => d.processingStatus === 'processing' || d.processingStatus === 'pending').length,
        failed: documents.filter(d => d.processingStatus === 'failed').length,
        totalSize: documents.reduce((sum, doc) => sum + doc.fileSize, 0)
      };

      return stats;
    } catch (error) {
      console.error('Failed to get document stats:', error);
      return {
        total: 0,
        processed: 0,
        processing: 0,
        failed: 0,
        totalSize: 0
      };
    }
  }
}

export const documentApi = new DocumentApiService();