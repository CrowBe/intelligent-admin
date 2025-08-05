import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { documentProcessingService } from './documentProcessing.js';
import fs from 'fs/promises';
import path from 'path';

// Mock dependencies
vi.mock('fs/promises');
vi.mock('tesseract.js', () => ({
  createWorker: vi.fn(() => ({
    terminate: vi.fn(),
    recognize: vi.fn(() => ({
      data: { text: 'Mock OCR text', confidence: 85 }
    }))
  }))
}));

vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    greyscale: vi.fn().mockReturnThis(),
    normalize: vi.fn().mockReturnThis(),
    sharpen: vi.fn().mockReturnThis(),
    png: vi.fn().mockReturnThis(),
    toFile: vi.fn().mockResolvedValue(undefined)
  }))
}));

vi.mock('pdf-parse', () => ({
  default: vi.fn(() => ({
    text: 'Mock PDF content with invoice #12345 amount $1,500.00',
    numpages: 2
  }))
}));

describe('DocumentProcessingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await documentProcessingService.terminateOCR();
  });

  describe('processDocument', () => {
    it('should process PDF documents correctly', async () => {
      const mockFilePath = '/test/path/document.pdf';
      const mockMimeType = 'application/pdf';
      
      vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('mock pdf data'));

      const result = await documentProcessingService.processDocument(
        mockFilePath,
        mockMimeType,
        { enableOCR: false, extractStructuredData: true }
      );

      expect(result.contentText).toBe('Mock PDF content with invoice #12345 amount $1,500.00');
      expect(result.extractedData.documentType).toBe('invoice');
      expect(result.extractedData.keyInformation?.amount).toBe('$1,500.00');
      expect(result.extractedData.keyInformation?.invoiceNumber).toBe('12345');
      expect(result.extractedData.metadata?.pageCount).toBe(2);
    });

    it('should process image documents with OCR', async () => {
      const mockFilePath = '/test/path/document.jpg';
      const mockMimeType = 'image/jpeg';

      const result = await documentProcessingService.processDocument(
        mockFilePath,
        mockMimeType,
        { enableOCR: true, extractStructuredData: true }
      );

      expect(result.contentText).toBe('Mock OCR text');
      expect(result.extractedData.confidence).toBe(0.85);
      expect(result.extractedData.imageText).toBe('Mock OCR text');
    });

    it('should process text files correctly', async () => {
      const mockFilePath = '/test/path/document.txt';
      const mockMimeType = 'text/plain';
      const mockContent = 'Quote #Q789 for electrical work: $2,500.00';
      
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      const result = await documentProcessingService.processDocument(
        mockFilePath,
        mockMimeType,
        { extractStructuredData: true }
      );

      expect(result.contentText).toBe(mockContent);
      expect(result.extractedData.documentType).toBe('quote');
      expect(result.extractedData.keyInformation?.amount).toBe('$2,500.00');
      expect(result.extractedData.keyInformation?.quoteNumber).toBe('Q789');
    });

    it('should handle unsupported file types', async () => {
      const mockFilePath = '/test/path/document.xyz';
      const mockMimeType = 'application/unknown';

      await expect(
        documentProcessingService.processDocument(mockFilePath, mockMimeType)
      ).rejects.toThrow('Unsupported file type: application/unknown');
    });

    it('should detect document types correctly', async () => {
      const testCases = [
        { content: 'Invoice #123 total $500', expectedType: 'invoice' },
        { content: 'Quote estimate for work', expectedType: 'quote' },
        { content: 'Safety certificate valid', expectedType: 'certificate' },
        { content: 'Receipt for payment', expectedType: 'receipt' },
        { content: 'Contract agreement terms', expectedType: 'contract' },
        { content: 'WHS safety requirements', expectedType: 'safety_document' },
        { content: 'Technical drawing plan', expectedType: 'technical_drawing' },
        { content: 'Random text content', expectedType: 'general_document' }
      ];

      for (const { content, expectedType } of testCases) {
        vi.mocked(fs.readFile).mockResolvedValue(content);
        
        const result = await documentProcessingService.processDocument(
          '/test/path/document.txt',
          'text/plain',
          { extractStructuredData: true }
        );

        expect(result.extractedData.documentType).toBe(expectedType);
      }
    });

    it('should extract safety requirements correctly', async () => {
      const mockContent = 'Safety requirements: safety glasses, hard hat, steel cap boots, lockout tagout procedures';
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      const result = await documentProcessingService.processDocument(
        '/test/path/safety.txt',
        'text/plain',
        { extractStructuredData: true }
      );

      expect(result.extractedData.documentType).toBe('safety_document');
      expect(result.extractedData.keyInformation?.safetyRequirements).toContain('safety glasses');
      expect(result.extractedData.keyInformation?.safetyRequirements).toContain('hard hat');
      expect(result.extractedData.keyInformation?.safetyRequirements).toContain('steel cap boots');
      expect(result.extractedData.keyInformation?.safetyRequirements).toContain('lockout tagout');
    });
  });

  describe('email processing', () => {
    it('should parse email content correctly', async () => {
      const mockEmailContent = `From: client@example.com
To: dave@electrical.com
Subject: Urgent electrical issue
Date: Mon, 1 Jan 2024 10:00:00 +1000

Emergency power outage at our facility. Need immediate assistance.`;

      vi.mocked(fs.readFile).mockResolvedValue(mockEmailContent);

      const result = await documentProcessingService.processDocument(
        '/test/path/email.eml',
        'message/rfc822',
        { extractStructuredData: true }
      );

      expect(result.extractedData.documentType).toBe('email');
      expect(result.extractedData.keyInformation?.from).toBe('client@example.com');
      expect(result.extractedData.keyInformation?.to).toBe('dave@electrical.com');
      expect(result.extractedData.keyInformation?.subject).toBe('Urgent electrical issue');
      expect(result.contentText).toContain('Emergency power outage');
    });
  });

  describe('error handling', () => {
    it('should handle file read errors gracefully', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      await expect(
        documentProcessingService.processDocument('/nonexistent/file.pdf', 'application/pdf')
      ).rejects.toThrow('File not found');
    });

    it('should handle OCR initialization errors', async () => {
      const { createWorker } = await import('tesseract.js');
      vi.mocked(createWorker).mockRejectedValue(new Error('OCR initialization failed'));

      await expect(
        documentProcessingService.processDocument('/test/image.jpg', 'image/jpeg', { enableOCR: true })
      ).rejects.toThrow('OCR initialization failed');
    });
  });
});