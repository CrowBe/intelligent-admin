import express from 'express';
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { verifyKindeToken } from '../middleware/kindeAuth.js';
import { onboardingService } from '../services/onboardingService.js';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

const router = express.Router();

/**
 * Get user's onboarding progress
 * GET /api/v1/onboarding/progress
 */
router.get('/progress',
  verifyKindeToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const progress = await onboardingService.getProgress(userId);
      const isComplete = await onboardingService.isOnboardingComplete(userId);

      res.json({
        success: true,
        data: {
          progress,
          isComplete,
          totalSteps: 6
        }
      });
    } catch (error) {
      logger.error('Failed to get onboarding progress:', error);
      res.status(500).json({
        error: 'Failed to get onboarding progress'
      });
    }
  }
);

/**
 * Record onboarding step completion
 * POST /api/v1/onboarding/step
 */
router.post('/step',
  verifyKindeToken,
  [
    body('step').isString().notEmpty().withMessage('Step name is required'),
    body('completed').isBoolean().withMessage('Completed must be a boolean'),
    body('data').optional().isObject().withMessage('Data must be an object')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { step, completed, data } = req.body;
      const userId = req.user!.id;

      await onboardingService.recordStep(userId, step, completed, data);

      res.json({
        success: true,
        message: `Step ${step} ${completed ? 'completed' : 'skipped'} successfully`
      });
    } catch (error) {
      logger.error('Failed to record onboarding step:', error);
      res.status(500).json({
        error: 'Failed to record onboarding step'
      });
    }
  }
);

/**
 * Save user profile from onboarding
 * POST /api/v1/onboarding/profile
 */
router.post('/profile',
  verifyKindeToken,
  [
    body('businessName').isString().notEmpty().withMessage('Business name is required'),
    body('businessType').isString().notEmpty().withMessage('Business type is required'),
    body('painPoints').isArray().withMessage('Pain points must be an array'),
    body('confidence').isInt({ min: 1, max: 5 }).withMessage('Confidence must be 1-5')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { businessName, businessType, painPoints, confidence } = req.body;
      const userId = req.user!.id;

      const profile = {
        businessName,
        businessType,
        painPoints,
        confidence,
        onboardingCompletedAt: new Date()
      };

      await onboardingService.saveUserProfile(userId, profile);

      res.json({
        success: true,
        message: 'User profile saved successfully',
        data: profile
      });
    } catch (error) {
      logger.error('Failed to save user profile:', error);
      res.status(500).json({
        error: 'Failed to save user profile'
      });
    }
  }
);

/**
 * Get user's business profile
 * GET /api/v1/onboarding/profile
 */
router.get('/profile',
  verifyKindeToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const profile = await onboardingService.getUserProfile(userId);

      if (!profile) {
        return res.status(404).json({
          error: 'User profile not found'
        });
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      res.status(500).json({
        error: 'Failed to get user profile'
      });
    }
  }
);

/**
 * Get personalized recommendations
 * GET /api/v1/onboarding/recommendations
 */
router.get('/recommendations',
  verifyKindeToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const recommendations = await onboardingService.generateRecommendations(userId);

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      logger.error('Failed to get recommendations:', error);
      res.status(500).json({
        error: 'Failed to get recommendations'
      });
    }
  }
);

/**
 * Check if user needs onboarding
 * GET /api/v1/onboarding/status
 */
router.get('/status',
  verifyKindeToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const isComplete = await onboardingService.isOnboardingComplete(userId);
      const progress = await onboardingService.getProgress(userId);

      const completedSteps = progress.filter(p => p.completedAt && !p.skipped).length;
      const totalSteps = 6;

      res.json({
        success: true,
        data: {
          needsOnboarding: !isComplete,
          isComplete,
          completedSteps,
          totalSteps,
          progressPercentage: Math.round((completedSteps / totalSteps) * 100)
        }
      });
    } catch (error) {
      logger.error('Failed to check onboarding status:', error);
      res.status(500).json({
        error: 'Failed to check onboarding status'
      });
    }
  }
);

/**
 * Get onboarding analytics (admin only)
 * GET /api/v1/onboarding/analytics
 */
router.get('/analytics',
  verifyKindeToken,
  async (req: Request, res: Response) => {
    try {
      // Note: In production, add admin role check here
      const analytics = await onboardingService.getOnboardingAnalytics();

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Failed to get onboarding analytics:', error);
      res.status(500).json({
        error: 'Failed to get onboarding analytics'
      });
    }
  }
);

/**
 * Reset user's onboarding (for testing)
 * DELETE /api/v1/onboarding/reset
 */
router.delete('/reset',
  verifyKindeToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      // Delete all onboarding progress
      await prisma.onboardingProgress.deleteMany({
        where: { userId }
      });

      // Reset user preferences
      await prisma.user.update({
        where: { id: userId },
        data: {
          businessName: null,
          businessType: null,
          preferences: '{}'
        }
      });

      res.json({
        success: true,
        message: 'Onboarding reset successfully'
      });
    } catch (error) {
      logger.error('Failed to reset onboarding:', error);
      res.status(500).json({
        error: 'Failed to reset onboarding'
      });
    }
  }
);

export default router;