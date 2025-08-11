import express from 'express';
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { notificationService } from '../services/notificationService.js';
import { verifyKindeToken } from '../middleware/kindeAuth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();


/**
 * Register FCM token for push notifications
 * POST /api/v1/notifications/register-token
 */
router.post('/register-token', 
  verifyKindeToken,
  [
    body('token').notEmpty().withMessage('FCM token is required'),
    body('deviceType').isIn(['web', 'android', 'ios']).withMessage('Invalid device type')
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

      const { token, deviceType } = req.body;
      const userId = req.user!.id;

      await notificationService.registerToken(userId, token, deviceType);

      res.json({ 
        message: 'FCM token registered successfully',
        registered: true 
      });

    } catch (error) {
      logger.error('Failed to register FCM token:', error);
      res.status(500).json({ 
        error: 'Failed to register notification token' 
      });
    }
  }
);

/**
 * Update notification preferences
 * PUT /api/v1/notifications/preferences
 */
router.put('/preferences',
  verifyKindeToken,
  [
    body('morningBriefEnabled').optional().isBoolean(),
    body('morningBriefTime').optional().isInt({ min: 0, max: 1439 }), // 0-1439 minutes (24 hours)
    body('urgentEmailsEnabled').optional().isBoolean(),
    body('calendarAlertsEnabled').optional().isBoolean(),
    body('weekendNotifications').optional().isBoolean()
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

      const userId = req.user!.id;
      const preferences = req.body;

      await notificationService.updateNotificationPreferences(userId, preferences);

      res.json({ 
        message: 'Notification preferences updated successfully',
        preferences 
      });

    } catch (error) {
      logger.error('Failed to update notification preferences:', error);
      res.status(500).json({ 
        error: 'Failed to update notification preferences' 
      });
    }
  }
);

/**
 * Get notification preferences
 * GET /api/v1/notifications/preferences
 */
router.get('/preferences',
  verifyKindeToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // This would be implemented in the notification service
      // For now, return default preferences
      const defaultPreferences = {
        morningBriefEnabled: true,
        morningBriefTime: 420, // 7:00 AM
        urgentEmailsEnabled: true,
        calendarAlertsEnabled: true,
        weekendNotifications: false
      };

      res.json({ preferences: defaultPreferences });

    } catch (error) {
      logger.error('Failed to get notification preferences:', error);
      res.status(500).json({ 
        error: 'Failed to get notification preferences' 
      });
    }
  }
);

/**
 * Send test notification
 * POST /api/v1/notifications/test
 */
router.post('/test',
  verifyKindeToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const success = await notificationService.sendNotification(userId, {
        title: '🧪 Test Notification',
        body: 'Your notification system is working correctly!',
        data: {
          type: 'test',
          timestamp: new Date().toISOString()
        }
      });

      if (success) {
        res.json({ 
          message: 'Test notification sent successfully',
          sent: true 
        });
      } else {
        res.status(400).json({ 
          error: 'Failed to send test notification - no valid tokens found' 
        });
      }

    } catch (error) {
      logger.error('Failed to send test notification:', error);
      res.status(500).json({ 
        error: 'Failed to send test notification' 
      });
    }
  }
);

/**
 * Trigger morning brief manually (for testing)
 * POST /api/v1/notifications/morning-brief
 */
router.post('/morning-brief',
  verifyKindeToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const success = await notificationService.sendMorningBrief(userId);

      if (success) {
        res.json({ 
          message: 'Morning brief sent successfully',
          sent: true 
        });
      } else {
        res.status(400).json({ 
          error: 'No urgent items found or morning brief disabled' 
        });
      }

    } catch (error) {
      logger.error('Failed to send morning brief:', error);
      res.status(500).json({ 
        error: 'Failed to send morning brief' 
      });
    }
  }
);

/**
 * Get notification history
 * GET /api/v1/notifications/history
 */
router.get('/history',
  verifyKindeToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      // This would be implemented to fetch from notification_logs table
      // For now, return empty array
      const notifications = [];
      const total = 0;

      res.json({
        notifications,
        pagination: {
          total,
          limit,
          offset,
          hasMore: total > offset + limit
        }
      });

    } catch (error) {
      logger.error('Failed to get notification history:', error);
      res.status(500).json({ 
        error: 'Failed to get notification history' 
      });
    }
  }
);

/**
 * Health check for notification service
 * GET /api/v1/notifications/health
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    service: 'notification',
    timestamp: new Date().toISOString(),
    firebaseInitialized: notificationService['initialized'] || false
  });
});

export default router;