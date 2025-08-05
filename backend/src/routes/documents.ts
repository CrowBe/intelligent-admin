import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { body, query, param, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import { documentProcessingService } from '../services/documentProcessing.js';
import { logger } from '../utils/logger.js';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'text/plain',
      'message/rfc822', // Email files
      'application/octet-stream' // For .eml files
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.eml')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  }
});

// Validation schemas
const uploadQuerySchema = z.object({
  enableOCR: z.string().optional().transform(val => val === 'true'),
  extractStructuredData: z.string().optional().transform(val => val === 'true'),
  category: z.string().optional()
});

const searchSchema = z.object({
  query: z.string().min(1),
  category: z.string().optional(),
  limit: z.number().min(1).max(50).optional().default(20),
  offset: z.number().min(0).optional().default(0)
});

// GET /api/v1/documents
router.get('/', 
  query('category').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { category, limit = 20, offset = 0 } = req.query;

    const documents = await prisma.document.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(category && { category: category as string })
      },
      select: {
        id: true,
        filename: true,
        originalFilename: true,
        title: true,
        category: true,
        tags: true,
        mimeType: true,
        fileSize: true,
        processingStatus: true,
        uploadedAt: true,
        processedAt: true
      },
      orderBy: { uploadedAt: 'desc' },
      take: limit as number,
      skip: offset as number
    });

    const total = await prisma.document.count({
      where: {
        userId,
        deletedAt: null,
        ...(category && { category: category as string })
      }
    });

    res.json({
      documents: documents.map(doc => ({
        ...doc,
        tags: JSON.parse(doc.tags)
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  })
);

// POST /api/v1/documents/upload
router.post('/upload',
  upload.single('document'),
  body('title').optional().isString().trim(),
  body('category').optional().isString().trim(),
  body('tags').optional().isJSON(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      // Parse query parameters
      const queryParams = uploadQuerySchema.parse(req.query);
      
      // Create document record
      const document = await prisma.document.create({
        data: {
          userId,
          filename: req.file.filename,
          originalFilename: req.file.originalname,
          title: req.body.title || req.file.originalname,
          category: req.body.category || null,
          tags: req.body.tags || '[]',
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          filePath: req.file.path,
          processingStatus: 'pending'
        }
      });

      // Start background processing
      processDocumentInBackground(document.id, req.file.path, req.file.mimetype, {
        enableOCR: queryParams.enableOCR || true,
        extractStructuredData: queryParams.extractStructuredData || true,
        detectDocumentType: true
      });

      res.status(201).json({
        message: 'Document uploaded successfully',
        document: {
          id: document.id,
          filename: document.filename,
          originalFilename: document.originalFilename,
          title: document.title,
          category: document.category,
          tags: JSON.parse(document.tags),
          mimeType: document.mimeType,
          fileSize: document.fileSize,
          processingStatus: document.processingStatus,
          uploadedAt: document.uploadedAt
        }
      });

    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => 
          logger.warn('Failed to clean up uploaded file:', err)
        );
      }
      throw error;
    }
  })
);

// GET /api/v1/documents/:documentId
router.get('/:documentId',
  param('documentId').isString().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const document = await prisma.document.findFirst({
      where: {
        id: req.params.documentId,
        userId,
        deletedAt: null
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      ...document,
      tags: JSON.parse(document.tags),
      extractedData: document.extractedData ? JSON.parse(document.extractedData) : null
    });
  })
);

// DELETE /api/v1/documents/:documentId
router.delete('/:documentId',
  param('documentId').isString().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const document = await prisma.document.findFirst({
      where: {
        id: req.params.documentId,
        userId,
        deletedAt: null
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Soft delete the document
    await prisma.document.update({
      where: { id: req.params.documentId },
      data: { deletedAt: new Date() }
    });

    // Clean up physical file
    try {
      await fs.unlink(document.filePath);
    } catch (error) {
      logger.warn(`Failed to delete physical file: ${document.filePath}`, error);
    }

    res.json({ message: 'Document deleted successfully' });
  })
);

// GET /api/v1/documents/:documentId/process
router.get('/:documentId/process',
  param('documentId').isString().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const document = await prisma.document.findFirst({
      where: {
        id: req.params.documentId,
        userId,
        deletedAt: null
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.processingStatus === 'completed') {
      return res.json({
        status: 'completed',
        contentText: document.contentText,
        extractedData: document.extractedData ? JSON.parse(document.extractedData) : null,
        processedAt: document.processedAt
      });
    }

    if (document.processingStatus === 'failed') {
      return res.status(422).json({
        error: 'Document processing failed',
        details: document.processingError
      });
    }

    // If still processing or pending, trigger reprocessing
    if (document.processingStatus === 'pending' || document.processingStatus === 'processing') {
      processDocumentInBackground(document.id, document.filePath, document.mimeType, {
        enableOCR: true,
        extractStructuredData: true,
        detectDocumentType: true
      });

      return res.json({
        status: document.processingStatus,
        message: 'Document is being processed. Check back shortly.'
      });
    }

    res.status(422).json({ error: 'Unknown processing status' });
  })
);

// POST /api/v1/documents/search
router.post('/search',
  body('query').isString().notEmpty(),
  body('category').optional().isString(),
  body('limit').optional().isInt({ min: 1, max: 50 }),
  body('offset').optional().isInt({ min: 0 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { query: searchQuery, category, limit = 20, offset = 0 } = req.body;

    // Full-text search on content and metadata
    const documents = await prisma.document.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(category && { category }),
        OR: [
          { contentText: { contains: searchQuery, mode: 'insensitive' } },
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { originalFilename: { contains: searchQuery, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        filename: true,
        originalFilename: true,
        title: true,
        category: true,
        tags: true,
        mimeType: true,
        fileSize: true,
        processingStatus: true,
        uploadedAt: true,
        processedAt: true,
        contentText: true
      },
      orderBy: [
        { processedAt: 'desc' },
        { uploadedAt: 'desc' }
      ],
      take: limit,
      skip: offset
    });

    const total = await prisma.document.count({
      where: {
        userId,
        deletedAt: null,
        ...(category && { category }),
        OR: [
          { contentText: { contains: searchQuery, mode: 'insensitive' } },
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { originalFilename: { contains: searchQuery, mode: 'insensitive' } }
        ]
      }
    });

    res.json({
      documents: documents.map(doc => ({
        ...doc,
        tags: JSON.parse(doc.tags),
        // Truncate content for search results
        contentText: doc.contentText ? doc.contentText.substring(0, 500) + '...' : null
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      searchQuery
    });
  })
);

// Background processing function
async function processDocumentInBackground(
  documentId: string,
  filePath: string,
  mimeType: string,
  options: any
): Promise<void> {
  try {
    // Update status to processing
    await documentProcessingService.updateDocumentStatus(documentId, 'processing');
    
    // Process the document
    const result = await documentProcessingService.processDocument(filePath, mimeType, options);
    
    // Update with results
    await documentProcessingService.updateDocumentStatus(documentId, 'completed', result);
    
    logger.info(`Document ${documentId} processed successfully`);
  } catch (error) {
    logger.error(`Document processing failed for ${documentId}:`, error);
    await documentProcessingService.updateDocumentStatus(
      documentId,
      'failed',
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export { router as documentRoutes };