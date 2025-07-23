import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  // TODO: Implement user registration
  res.status(501).json({
    message: 'User registration endpoint - coming soon',
    endpoint: 'POST /api/v1/auth/register'
  });
}));

// POST /api/v1/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  // TODO: Implement user login
  res.status(501).json({
    message: 'User login endpoint - coming soon',
    endpoint: 'POST /api/v1/auth/login'
  });
}));

// POST /api/v1/auth/refresh
router.post('/refresh', asyncHandler(async (req, res) => {
  // TODO: Implement token refresh
  res.status(501).json({
    message: 'Token refresh endpoint - coming soon',
    endpoint: 'POST /api/v1/auth/refresh'
  });
}));

// POST /api/v1/auth/logout
router.post('/logout', asyncHandler(async (req, res) => {
  // TODO: Implement user logout
  res.status(501).json({
    message: 'User logout endpoint - coming soon',
    endpoint: 'POST /api/v1/auth/logout'
  });
}));

// GET /api/v1/auth/google
router.get('/google', asyncHandler(async (req, res) => {
  // TODO: Implement Google OAuth
  res.status(501).json({
    message: 'Google OAuth endpoint - coming soon',
    endpoint: 'GET /api/v1/auth/google'
  });
}));

export { router as authRoutes };