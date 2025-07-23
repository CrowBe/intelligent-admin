import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/v1/documents
router.get('/', asyncHandler(async (req, res) => {
  // TODO: Get user's documents
  res.status(501).json({
    message: 'Get documents endpoint - coming soon',
    endpoint: 'GET /api/v1/documents'
  });
}));

// POST /api/v1/documents/upload
router.post('/upload', asyncHandler(async (req, res) => {
  // TODO: Upload document
  res.status(501).json({
    message: 'Upload document endpoint - coming soon',
    endpoint: 'POST /api/v1/documents/upload'
  });
}));

// GET /api/v1/documents/:documentId
router.get('/:documentId', asyncHandler(async (req, res) => {
  // TODO: Get specific document
  res.status(501).json({
    message: 'Get document endpoint - coming soon',
    endpoint: `GET /api/v1/documents/${req.params.documentId}`
  });
}));

// DELETE /api/v1/documents/:documentId
router.delete('/:documentId', asyncHandler(async (req, res) => {
  // TODO: Delete document
  res.status(501).json({
    message: 'Delete document endpoint - coming soon',
    endpoint: `DELETE /api/v1/documents/${req.params.documentId}`
  });
}));

// GET /api/v1/documents/:documentId/process
router.get('/:documentId/process', asyncHandler(async (req, res) => {
  // TODO: Process document with AI
  res.status(501).json({
    message: 'Process document endpoint - coming soon',
    endpoint: `GET /api/v1/documents/${req.params.documentId}/process`
  });
}));

// POST /api/v1/documents/search
router.post('/search', asyncHandler(async (req, res) => {
  // TODO: Search documents
  res.status(501).json({
    message: 'Search documents endpoint - coming soon',
    endpoint: 'POST /api/v1/documents/search'
  });
}));

export { router as documentRoutes };