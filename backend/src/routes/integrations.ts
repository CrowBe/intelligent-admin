import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/v1/integrations
router.get('/', asyncHandler(async (req, res) => {
  // TODO: Get user's integrations
  res.status(501).json({
    message: 'Get integrations endpoint - coming soon',
    endpoint: 'GET /api/v1/integrations'
  });
}));

// POST /api/v1/integrations/connect/:provider
router.post('/connect/:provider', asyncHandler(async (req, res) => {
  // TODO: Connect integration (Gmail, Calendar, etc.)
  res.status(501).json({
    message: 'Connect integration endpoint - coming soon',
    endpoint: `POST /api/v1/integrations/connect/${req.params.provider}`
  });
}));

// DELETE /api/v1/integrations/:integrationId
router.delete('/:integrationId', asyncHandler(async (req, res) => {
  // TODO: Disconnect integration
  res.status(501).json({
    message: 'Disconnect integration endpoint - coming soon',
    endpoint: `DELETE /api/v1/integrations/${req.params.integrationId}`
  });
}));

// GET /api/v1/integrations/:integrationId/sync
router.get('/:integrationId/sync', asyncHandler(async (req, res) => {
  // TODO: Sync integration data
  res.status(501).json({
    message: 'Sync integration endpoint - coming soon',
    endpoint: `GET /api/v1/integrations/${req.params.integrationId}/sync`
  });
}));

// GET /api/v1/integrations/available
router.get('/available', asyncHandler(async (req, res) => {
  // TODO: Get available integrations
  res.status(501).json({
    message: 'Get available integrations endpoint - coming soon',
    endpoint: 'GET /api/v1/integrations/available'
  });
}));

export { router as integrationRoutes };