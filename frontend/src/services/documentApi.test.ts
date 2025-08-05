import { describe, it, expect, vi, beforeEach } from 'vitest';
import { documentApi } from './documentApi';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('DocumentApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('uploadDocument', () => {
    it('should upload a document successfully', async () => {
      const mockResponse = {
        document: {
          id: 'doc-123',
          filename: 'test-123.pdf',
          originalFilename: 'test.pdf',
          title: 'test.pdf',
          category: null,
          tags: [],
          mimeType: 'application/pdf',
          fileSize: 1024,
          processingStatus: 'pending',
          uploadedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const result = await documentApi.uploadDocument(file, {
        enableOCR: true,
        extractStructuredData: true,
        category: 'invoice'
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/documents/upload?enableOCR=true&extractStructuredData=true',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: expect.any(FormData)
        })
      );

      // Check FormData contents
      const formData = mockFetch.mock.calls[0][1].body;
      expect(formData.get('document')).toEqual(file);
      expect(formData.get('category')).toBe('invoice');
    });

    it('should handle upload errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid file type' })
      });

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      await expect(
        documentApi.uploadDocument(file)
      ).rejects.toThrow('Invalid file type');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      await expect(
        documentApi.uploadDocument(file)
      ).rejects.toThrow('Network error');
    });
  });

  describe('getDocuments', () => {
    it('should fetch documents list', async () => {
      const mockResponse = {
        documents: [
          {
            id: 'doc-1',
            filename: 'test1.pdf',
            originalFilename: 'test1.pdf',
            title: 'Test Document 1',
            category: 'invoice',
            tags: ['urgent'],
            mimeType: 'application/pdf',
            fileSize: 1024,
            processingStatus: 'completed',
            uploadedAt: '2024-01-01T00:00:00.000Z',
            processedAt: '2024-01-01T00:01:00.000Z'
          }
        ],
        pagination: {
          total: 1,
          limit: 20,
          offset: 0,
          hasMore: false
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await documentApi.getDocuments({
        category: 'invoice',
        limit: 20,
        offset: 0
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/documents?category=invoice&limit=20',
        { credentials: 'include' }
      );
    });

    it('should handle empty query parameters', async () => {
      const mockResponse = {
        documents: [],
        pagination: { total: 0, limit: 20, offset: 0, hasMore: false }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await documentApi.getDocuments();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/documents',
        { credentials: 'include' }
      );
    });
  });

  describe('getDocument', () => {
    it('should fetch a single document', async () => {
      const mockDocument = {
        id: 'doc-123',
        filename: 'test.pdf',
        originalFilename: 'test.pdf',
        title: 'Test Document',
        category: 'invoice',
        tags: ['important'],
        mimeType: 'application/pdf',
        fileSize: 1024,
        processingStatus: 'completed',
        uploadedAt: '2024-01-01T00:00:00.000Z',
        processedAt: '2024-01-01T00:01:00.000Z',
        contentText: 'Document content',
        extractedData: { documentType: 'invoice', amount: '$100' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDocument
      });

      const result = await documentApi.getDocument('doc-123');

      expect(result).toEqual(mockDocument);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/documents/doc-123',
        { credentials: 'include' }
      );
    });

    it('should handle document not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(
        documentApi.getDocument('nonexistent')
      ).rejects.toThrow('Document not found');
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Document deleted successfully' })
      });

      await documentApi.deleteDocument('doc-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/documents/doc-123',
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );
    });

    it('should handle delete errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(
        documentApi.deleteDocument('doc-123')
      ).rejects.toThrow('Failed to delete document');
    });
  });

  describe('getProcessingStatus', () => {
    it('should get processing status for completed document', async () => {
      const mockStatus = {
        status: 'completed',
        contentText: 'Document content',
        extractedData: { documentType: 'invoice' },
        processedAt: '2024-01-01T00:01:00.000Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus
      });

      const result = await documentApi.getProcessingStatus('doc-123');

      expect(result).toEqual(mockStatus);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/documents/doc-123/process',
        { credentials: 'include' }
      );
    });

    it('should handle processing failures', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({
          error: 'Document processing failed',
          details: 'OCR failed'
        })
      });

      await expect(
        documentApi.getProcessingStatus('doc-123')
      ).rejects.toThrow('OCR failed');
    });
  });

  describe('searchDocuments', () => {
    it('should search documents successfully', async () => {
      const mockResponse = {
        documents: [
          {
            id: 'doc-1',
            filename: 'invoice.pdf',
            originalFilename: 'invoice.pdf',
            title: 'Invoice Document',
            category: 'invoice',
            tags: [],
            mimeType: 'application/pdf',
            fileSize: 1024,
            processingStatus: 'completed',
            uploadedAt: '2024-01-01T00:00:00.000Z',
            processedAt: '2024-01-01T00:01:00.000Z',
            contentText: 'Invoice #123 for electrical work...'
          }
        ],
        pagination: {
          total: 1,
          limit: 20,
          offset: 0,
          hasMore: false
        },
        searchQuery: 'invoice'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await documentApi.searchDocuments({
        query: 'invoice',
        category: 'invoice',
        limit: 20,
        offset: 0
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/documents/search',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            query: 'invoice',
            category: 'invoice',
            limit: 20,
            offset: 0
          })
        }
      );
    });
  });

  describe('pollProcessingStatus', () => {
    it('should poll until document processing completes', async () => {
      // First call - still processing
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'processing' })
      });

      // Second call - completed
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'completed',
          contentText: 'Document content',
          processedAt: '2024-01-01T00:01:00.000Z'
        })
      });

      const result = await documentApi.pollProcessingStatus('doc-123', 2, 100);

      expect(result).toEqual({
        status: 'completed',
        contentText: 'Document content',
        processedAt: '2024-01-01T00:01:00.000Z'
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle processing failures during polling', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'failed',
          error: 'Processing error'
        })
      });

      const result = await documentApi.pollProcessingStatus('doc-123', 1, 100);

      expect(result).toEqual({
        status: 'failed',
        error: 'Processing error'
      });
    });

    it('should timeout after max attempts', async () => {
      // Always return processing
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'processing' })
      });

      await expect(
        documentApi.pollProcessingStatus('doc-123', 2, 100)
      ).rejects.toThrow('Processing timeout');

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('uploadMultipleDocuments', () => {
    it('should upload multiple documents', async () => {
      const mockResponse1 = {
        document: { id: 'doc-1', filename: 'test1.pdf' }
      };
      const mockResponse2 = {
        document: { id: 'doc-2', filename: 'test2.pdf' }
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse1
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse2
        });

      const files = [
        new File(['test1'], 'test1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'test2.pdf', { type: 'application/pdf' })
      ];

      const results = await documentApi.uploadMultipleDocuments(files, {
        category: 'invoice'
      });

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual(mockResponse1);
      expect(results[1]).toEqual(mockResponse2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures in multiple uploads', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ document: { id: 'doc-1' } })
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ error: 'Invalid file' })
        });

      const files = [
        new File(['test1'], 'test1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'test2.txt', { type: 'text/plain' })
      ];

      await expect(
        documentApi.uploadMultipleDocuments(files)
      ).rejects.toThrow('Invalid file');
    });
  });

  describe('getDownloadUrl', () => {
    it('should generate correct download URL', () => {
      const url = documentApi.getDownloadUrl('doc-123');
      expect(url).toBe('http://localhost:3001/api/v1/documents/doc-123/download');
    });
  });

  describe('getDocumentStats', () => {
    it('should calculate document statistics', async () => {
      const mockResponse = {
        documents: [
          { processingStatus: 'completed', fileSize: 1024 },
          { processingStatus: 'processing', fileSize: 2048 },
          { processingStatus: 'failed', fileSize: 512 }
        ],
        pagination: { total: 3 }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const stats = await documentApi.getDocumentStats();

      expect(stats).toEqual({
        total: 3,
        processed: 1,
        processing: 1,
        failed: 1,
        totalSize: 3584 // 1024 + 2048 + 512
      });
    });

    it('should handle errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const stats = await documentApi.getDocumentStats();

      expect(stats).toEqual({
        total: 0,
        processed: 0,
        processing: 0,
        failed: 0,
        totalSize: 0
      });
    });
  });
});