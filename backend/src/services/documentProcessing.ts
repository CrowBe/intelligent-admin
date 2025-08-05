import fs from 'fs/promises';
import path from 'path';
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import pdfParse from 'pdf-parse';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export interface ProcessedDocument {
  contentText: string;
  extractedData: {
    documentType?: string;
    keyInformation?: Record<string, any>;
    imageText?: string;
    confidence?: number;
    metadata?: {
      pageCount?: number;
      imageCount?: number;
      processingTime?: number;
    };
  };
}

export interface DocumentProcessingOptions {
  enableOCR?: boolean;
  ocrLanguage?: string;
  extractStructuredData?: boolean;
  detectDocumentType?: boolean;
}

class DocumentProcessingService {
  private ocrWorker: any = null;

  async initializeOCR(): Promise<void> {
    if (!this.ocrWorker) {
      this.ocrWorker = await createWorker('eng');
      logger.info('OCR worker initialized');
    }
  }

  async terminateOCR(): Promise<void> {
    if (this.ocrWorker) {
      await this.ocrWorker.terminate();
      this.ocrWorker = null;
      logger.info('OCR worker terminated');
    }
  }

  /**
   * Process uploaded document based on file type
   */
  async processDocument(
    filePath: string,
    mimeType: string,
    options: DocumentProcessingOptions = {}
  ): Promise<ProcessedDocument> {
    const startTime = Date.now();
    logger.info(`Processing document: ${filePath}, type: ${mimeType}`);

    try {
      let result: ProcessedDocument;

      if (mimeType === 'application/pdf') {
        result = await this.processPDF(filePath, options);
      } else if (mimeType.startsWith('image/')) {
        result = await this.processImage(filePath, options);
      } else if (mimeType === 'text/plain') {
        result = await this.processTextFile(filePath, options);
      } else if (mimeType.includes('email') || mimeType === 'message/rfc822') {
        result = await this.processEmail(filePath, options);
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }

      const processingTime = Date.now() - startTime;
      result.extractedData.metadata = {
        ...result.extractedData.metadata,
        processingTime
      };

      logger.info(`Document processed successfully in ${processingTime}ms`);
      return result;

    } catch (error) {
      logger.error('Document processing failed:', error);
      throw error;
    }
  }

  /**
   * Process PDF documents
   */
  private async processPDF(
    filePath: string,
    options: DocumentProcessingOptions
  ): Promise<ProcessedDocument> {
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);

    let extractedText = data.text;
    let confidence = 1.0;

    // If OCR is enabled and text is sparse, try OCR on PDF pages
    if (options.enableOCR && extractedText.trim().length < 100) {
      try {
        await this.initializeOCR();
        // For PDFs, we'd need to convert pages to images first
        // This is a simplified implementation
        logger.info('PDF has minimal text, OCR processing may be needed');
      } catch (error) {
        logger.warn('OCR processing failed for PDF:', error);
      }
    }

    const documentType = this.detectDocumentType(extractedText);
    const keyInformation = this.extractKeyInformation(extractedText, documentType);

    return {
      contentText: extractedText,
      extractedData: {
        documentType,
        keyInformation,
        confidence,
        metadata: {
          pageCount: data.numpages
        }
      }
    };
  }

  /**
   * Process image documents using OCR
   */
  private async processImage(
    filePath: string,
    options: DocumentProcessingOptions
  ): Promise<ProcessedDocument> {
    if (!options.enableOCR) {
      return {
        contentText: '',
        extractedData: {
          documentType: 'image',
          confidence: 0,
          metadata: { imageCount: 1 }
        }
      };
    }

    await this.initializeOCR();

    // Preprocess image for better OCR results
    const processedImagePath = await this.preprocessImage(filePath);

    try {
      const { data: { text, confidence } } = await this.ocrWorker.recognize(processedImagePath);
      
      const documentType = this.detectDocumentType(text);
      const keyInformation = this.extractKeyInformation(text, documentType);

      return {
        contentText: text,
        extractedData: {
          documentType,
          keyInformation,
          imageText: text,
          confidence: confidence / 100,
          metadata: { imageCount: 1 }
        }
      };

    } finally {
      // Clean up processed image if it's different from original
      if (processedImagePath !== filePath) {
        await fs.unlink(processedImagePath).catch(err => 
          logger.warn('Failed to clean up processed image:', err)
        );
      }
    }
  }

  /**
   * Process plain text files
   */
  private async processTextFile(
    filePath: string,
    options: DocumentProcessingOptions
  ): Promise<ProcessedDocument> {
    const content = await fs.readFile(filePath, 'utf-8');
    
    const documentType = this.detectDocumentType(content);
    const keyInformation = this.extractKeyInformation(content, documentType);

    return {
      contentText: content,
      extractedData: {
        documentType,
        keyInformation,
        confidence: 1.0
      }
    };
  }

  /**
   * Process email files (.eml, .msg)
   */
  private async processEmail(
    filePath: string,
    options: DocumentProcessingOptions
  ): Promise<ProcessedDocument> {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Basic email parsing - in production, use a proper email parser
    const emailParts = this.parseEmail(content);
    
    return {
      contentText: emailParts.body || content,
      extractedData: {
        documentType: 'email',
        keyInformation: {
          from: emailParts.from,
          to: emailParts.to,
          subject: emailParts.subject,
          date: emailParts.date
        },
        confidence: 1.0
      }
    };
  }

  /**
   * Preprocess image for better OCR results
   */
  private async preprocessImage(filePath: string): Promise<string> {
    const outputPath = filePath.replace(/\.[^.]+$/, '_processed.png');
    
    try {
      await sharp(filePath)
        .resize(2000, 2000, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .greyscale()
        .normalize()
        .sharpen()
        .png({ quality: 90 })
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      logger.warn('Image preprocessing failed, using original:', error);
      return filePath;
    }
  }

  /**
   * Detect document type based on content
   */
  private detectDocumentType(content: string): string {
    const lower = content.toLowerCase();
    
    if (lower.includes('invoice') || lower.includes('bill')) return 'invoice';
    if (lower.includes('quote') || lower.includes('estimate')) return 'quote';
    if (lower.includes('contract') || lower.includes('agreement')) return 'contract';
    if (lower.includes('receipt')) return 'receipt';
    if (lower.includes('certificate') || lower.includes('compliance')) return 'certificate';
    if (lower.includes('safety') || lower.includes('whs')) return 'safety_document';
    if (lower.includes('plan') || lower.includes('drawing')) return 'technical_drawing';
    
    return 'general_document';
  }

  /**
   * Extract key information based on document type
   */
  private extractKeyInformation(content: string, documentType: string): Record<string, any> {
    const info: Record<string, any> = {};
    
    switch (documentType) {
      case 'invoice':
        info.amount = this.extractAmount(content);
        info.invoiceNumber = this.extractInvoiceNumber(content);
        info.dueDate = this.extractDate(content, 'due');
        break;
        
      case 'quote':
        info.amount = this.extractAmount(content);
        info.quoteNumber = this.extractQuoteNumber(content);
        info.validUntil = this.extractDate(content, 'valid');
        break;
        
      case 'certificate':
        info.certificateNumber = this.extractCertificateNumber(content);
        info.expiryDate = this.extractDate(content, 'expir');
        break;
        
      case 'safety_document':
        info.safetyRequirements = this.extractSafetyRequirements(content);
        break;
    }
    
    return info;
  }

  /**
   * Basic email parsing
   */
  private parseEmail(content: string): Record<string, string> {
    const lines = content.split('\n');
    const result: Record<string, string> = {};
    
    let bodyStart = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('From:')) result.from = line.substring(5).trim();
      if (line.startsWith('To:')) result.to = line.substring(3).trim();
      if (line.startsWith('Subject:')) result.subject = line.substring(8).trim();
      if (line.startsWith('Date:')) result.date = line.substring(5).trim();
      
      if (line.trim() === '' && i > 5) {
        bodyStart = i + 1;
        break;
      }
    }
    
    if (bodyStart > 0) {
      result.body = lines.slice(bodyStart).join('\n').trim();
    }
    
    return result;
  }

  // Helper methods for information extraction
  private extractAmount(content: string): string | null {
    const amountMatch = content.match(/\$[\d,]+\.?\d*/);
    return amountMatch ? amountMatch[0] : null;
  }

  private extractInvoiceNumber(content: string): string | null {
    const invoiceMatch = content.match(/invoice\s*#?\s*(\w+)/i);
    return invoiceMatch ? invoiceMatch[1] : null;
  }

  private extractQuoteNumber(content: string): string | null {
    const quoteMatch = content.match(/quote\s*#?\s*(\w+)/i);
    return quoteMatch ? quoteMatch[1] : null;
  }

  private extractCertificateNumber(content: string): string | null {
    const certMatch = content.match(/certificate\s*#?\s*(\w+)/i);
    return certMatch ? certMatch[1] : null;
  }

  private extractDate(content: string, context: string): string | null {
    const datePattern = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/;
    const contextPattern = new RegExp(`${context}[^\\d]*${datePattern.source}`, 'i');
    const match = content.match(contextPattern);
    
    if (match) {
      const dateMatch = match[0].match(datePattern);
      return dateMatch ? dateMatch[0] : null;
    }
    
    return null;
  }

  private extractSafetyRequirements(content: string): string[] {
    const requirements: string[] = [];
    const safetyKeywords = [
      'safety glasses', 'hard hat', 'high vis', 'steel cap boots',
      'lockout tagout', 'permit to work', 'risk assessment'
    ];
    
    safetyKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        requirements.push(keyword);
      }
    });
    
    return requirements;
  }

  /**
   * Update document processing status in database
   */
  async updateDocumentStatus(
    documentId: string,
    status: 'processing' | 'completed' | 'failed',
    result?: ProcessedDocument,
    error?: string
  ): Promise<void> {
    try {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          processingStatus: status,
          ...(result && {
            contentText: result.contentText,
            extractedData: JSON.stringify(result.extractedData),
            processedAt: new Date()
          }),
          ...(error && { processingError: error })
        }
      });

      logger.info(`Document ${documentId} status updated to ${status}`);
    } catch (err) {
      logger.error(`Failed to update document status:`, err);
      throw err;
    }
  }
}

export const documentProcessingService = new DocumentProcessingService();

// Cleanup OCR worker on process exit
process.on('SIGINT', async () => {
  await documentProcessingService.terminateOCR();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await documentProcessingService.terminateOCR();
  process.exit(0);
});