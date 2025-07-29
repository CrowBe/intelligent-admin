import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { verifyKindeToken } from '../middleware/kindeAuth.js';

const router = Router();

// POST /api/v1/auth/verify-token
// Verify Kinde JWT token for API access
router.post('/verify-token', verifyKindeToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
}));

// GET /api/v1/auth/user
// Get user profile from Kinde token
router.get('/user', verifyKindeToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
}));

export { router as authRoutes };