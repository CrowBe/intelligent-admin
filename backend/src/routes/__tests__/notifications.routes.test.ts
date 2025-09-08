import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { notificationRouter } from '../notifications.js';
import { NotificationService, NotificationType } from '../../services/notificationService.js';

// Mock the service
vi.mock('../../services/notificationService.js');

describe('Notification Routes', () => {
  let app: express.Application;
  let mockNotificationService: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/notifications', notificationRouter);

    // Create mock notification service
    mockNotificationService = {
      getPreferences: vi.fn(),
      upsertPreferences: vi.fn(),
      saveToken: vi.fn(),
      generateMorningBrief: vi.fn(),
      sendPushNotification: vi.fn(),
      getHistory: vi.fn(),
      markAsRead: vi.fn(),
    };

    // Mock the service constructor
    const MockNotificationService = NotificationService as any;
    MockNotificationService.mockImplementation(() => mockNotificationService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /preferences/:userId', () => {
    it('should return user notification preferences', async () => {
      const mockPreferences = [
        {
          id: 'pref-1',
          userId: 'user-123',
          type: 'morning_brief',
          enabled: true,
          timingPreferences: {
            startHour: 7,
            startMinute: 0,
            endHour: 7,
            endMinute: 30,
            timezone: 'Australia/Sydney',
            daysOfWeek: [1, 2, 3, 4, 5]
          },
          channels: { push: true, email: false, sms: false }
        }
      ];

      mockNotificationService.getPreferences.mockResolvedValue(mockPreferences);

      const response = await request(app)
        .get('/api/notifications/preferences/user-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('preferences', mockPreferences);
      expect(mockNotificationService.getPreferences).toHaveBeenCalledWith('user-123');
    });

    it('should handle service errors', async () => {
      mockNotificationService.getPreferences.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/notifications/preferences/user-123');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /preferences', () => {
    it('should create/update notification preferences', async () => {
      const preferenceData = {
        userId: 'user-123',
        type: NotificationType.MORNING_BRIEF,
        enabled: true,
        timing: {
          startHour: 8,
          startMinute: 0,
          endHour: 8,
          endMinute: 30,
          timezone: 'Australia/Melbourne',
          daysOfWeek: [1, 2, 3, 4, 5]
        },
        channels: { push: true, email: true, sms: false }
      };

      const mockCreatedPreference = {
        id: 'pref-new',
        ...preferenceData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockNotificationService.upsertPreferences.mockResolvedValue(mockCreatedPreference);

      const response = await request(app)
        .post('/api/notifications/preferences')
        .send(preferenceData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('preference', mockCreatedPreference);
      expect(mockNotificationService.upsertPreferences).toHaveBeenCalledWith(preferenceData);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        userId: 'user-123',
        // Missing type and enabled
      };

      const response = await request(app)
        .post('/api/notifications/preferences')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate notification type enum', async () => {
      const invalidData = {
        userId: 'user-123',
        type: 'invalid_type',
        enabled: true
      };

      const response = await request(app)
        .post('/api/notifications/preferences')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle optional fields correctly', async () => {
      const minimalData = {
        userId: 'user-123',
        type: NotificationType.URGENT_EMAIL,
        enabled: false
      };

      mockNotificationService.upsertPreferences.mockResolvedValue({
        id: 'pref-minimal',
        ...minimalData
      });

      const response = await request(app)
        .post('/api/notifications/preferences')
        .send(minimalData);

      expect(response.status).toBe(200);
      expect(mockNotificationService.upsertPreferences).toHaveBeenCalledWith(minimalData);
    });
  });

  describe('POST /token', () => {
    it('should save FCM token', async () => {
      const tokenData = {
        userId: 'user-123',
        token: 'fcm-token-abc123',
        platform: 'web'
      };

      const mockSavedToken = {
        id: 'token-1',
        userId: 'user-123',
        token: 'fcm-token-abc123',
        platform: 'web',
        isActive: true,
        createdAt: new Date()
      };

      mockNotificationService.saveToken.mockResolvedValue(mockSavedToken);

      const response = await request(app)
        .post('/api/notifications/token')
        .send(tokenData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        token: mockSavedToken
      });
      expect(mockNotificationService.saveToken).toHaveBeenCalledWith(
        'user-123',
        'fcm-token-abc123',
        'web'
      );
    });

    it('should use default platform when not provided', async () => {
      const tokenData = {
        userId: 'user-123',
        token: 'fcm-token-def456'
      };

      mockNotificationService.saveToken.mockResolvedValue({ id: 'token-2' });

      const response = await request(app)
        .post('/api/notifications/token')
        .send(tokenData);

      expect(response.status).toBe(200);
      expect(mockNotificationService.saveToken).toHaveBeenCalledWith(
        'user-123',
        'fcm-token-def456',
        'web'
      );
    });

    it('should handle token save errors', async () => {
      mockNotificationService.saveToken.mockRejectedValue(new Error('Token save failed'));

      const response = await request(app)
        .post('/api/notifications/token')
        .send({
          userId: 'user-123',
          token: 'invalid-token'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /morning-brief/:userId', () => {
    it('should generate morning brief', async () => {
      const mockBrief = {
        title: 'Good morning! Here\'s your brief for 08/01/2024',
        sections: [
          {
            heading: '🔴 Urgent Items',
            items: ['3 urgent emails require attention'],
            priority: 'high'
          },
          {
            heading: '📅 Today\'s Schedule',
            items: ['2 appointments scheduled', '5 tasks pending completion'],
            priority: 'medium'
          }
        ],
        summary: 'You have 3 urgent items requiring immediate attention.'
      };

      mockNotificationService.generateMorningBrief.mockResolvedValue(mockBrief);

      const response = await request(app)
        .post('/api/notifications/morning-brief/user-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('brief', mockBrief);
      expect(mockNotificationService.generateMorningBrief).toHaveBeenCalledWith('user-123');
    });

    it('should handle brief generation errors', async () => {
      mockNotificationService.generateMorningBrief.mockRejectedValue(
        new Error('Failed to generate brief')
      );

      const response = await request(app)
        .post('/api/notifications/morning-brief/user-123');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /test', () => {
    it('should send test notification', async () => {
      const testData = {
        userId: 'user-123',
        title: 'Test Notification',
        body: 'This is a test message',
        type: NotificationType.CUSTOM
      };

      const mockNotificationResult = {
        id: 'notif-test',
        userId: 'user-123',
        title: 'Test Notification',
        body: 'This is a test message',
        type: 'custom',
        status: 'sent',
        createdAt: new Date()
      };

      mockNotificationService.sendPushNotification.mockResolvedValue(mockNotificationResult);

      const response = await request(app)
        .post('/api/notifications/test')
        .send(testData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        notification: mockNotificationResult
      });
      expect(mockNotificationService.sendPushNotification).toHaveBeenCalledWith('user-123', {
        title: 'Test Notification',
        body: 'This is a test message',
        type: NotificationType.CUSTOM
      });
    });

    it('should use default type when not provided', async () => {
      const testData = {
        userId: 'user-123',
        title: 'Test',
        body: 'Message'
      };

      mockNotificationService.sendPushNotification.mockResolvedValue({ id: 'notif-1' });

      const response = await request(app)
        .post('/api/notifications/test')
        .send(testData);

      expect(response.status).toBe(200);
      expect(mockNotificationService.sendPushNotification).toHaveBeenCalledWith('user-123', {
        title: 'Test',
        body: 'Message',
        type: NotificationType.CUSTOM
      });
    });

    it('should handle test notification errors', async () => {
      mockNotificationService.sendPushNotification.mockRejectedValue(
        new Error('FCM token not found')
      );

      const response = await request(app)
        .post('/api/notifications/test')
        .send({
          userId: 'user-123',
          title: 'Test',
          body: 'Message'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /history/:userId', () => {
    it('should return notification history', async () => {
      const mockHistory = [
        {
          id: 'notif-1',
          userId: 'user-123',
          title: 'Morning Brief',
          body: 'Your daily summary',
          type: 'morning_brief',
          status: 'read',
          createdAt: '2024-01-08T07:30:00Z'
        },
        {
          id: 'notif-2',
          userId: 'user-123',
          title: 'Urgent Email',
          body: 'High priority email received',
          type: 'urgent_email',
          status: 'unread',
          createdAt: '2024-01-08T09:15:00Z'
        }
      ];

      mockNotificationService.getHistory.mockResolvedValue(mockHistory);

      const response = await request(app)
        .get('/api/notifications/history/user-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('history', mockHistory);
      expect(mockNotificationService.getHistory).toHaveBeenCalledWith('user-123', 50);
    });

    it('should handle custom limit parameter', async () => {
      mockNotificationService.getHistory.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/notifications/history/user-123')
        .query({ limit: '25' });

      expect(response.status).toBe(200);
      expect(mockNotificationService.getHistory).toHaveBeenCalledWith('user-123', 25);
    });

    it('should use default limit for invalid values', async () => {
      mockNotificationService.getHistory.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/notifications/history/user-123')
        .query({ limit: 'invalid' });

      expect(response.status).toBe(200);
      expect(mockNotificationService.getHistory).toHaveBeenCalledWith('user-123', 50);
    });

    it('should handle history retrieval errors', async () => {
      mockNotificationService.getHistory.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/notifications/history/user-123');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /read/:notificationId', () => {
    it('should mark notification as read', async () => {
      const mockUpdatedNotification = {
        id: 'notif-123',
        userId: 'user-123',
        title: 'Test Notification',
        body: 'Message body',
        status: 'read',
        readAt: new Date()
      };

      mockNotificationService.markAsRead.mockResolvedValue(mockUpdatedNotification);

      const response = await request(app)
        .post('/api/notifications/read/notif-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        notification: mockUpdatedNotification
      });
      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('notif-123');
    });

    it('should handle mark as read errors', async () => {
      mockNotificationService.markAsRead.mockRejectedValue(
        new Error('Notification not found')
      );

      const response = await request(app)
        .post('/api/notifications/read/invalid-notif-id');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Service Integration', () => {
    it('should handle service initialization correctly', async () => {
      mockNotificationService.getPreferences.mockResolvedValue([]);

      // Multiple requests should reuse the same service instance
      await request(app).get('/api/notifications/preferences/user-1');
      await request(app).get('/api/notifications/preferences/user-2');

      expect(NotificationService).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.getPreferences).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing request body parameters', async () => {
      const response = await request(app)
        .post('/api/notifications/token')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle zero or negative limit values', async () => {
      mockNotificationService.getHistory.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/notifications/history/user-123')
        .query({ limit: '0' });

      expect(response.status).toBe(200);
      expect(mockNotificationService.getHistory).toHaveBeenCalledWith('user-123', 0);
    });

    it('should handle empty notification history', async () => {
      mockNotificationService.getHistory.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/notifications/history/user-123');

      expect(response.status).toBe(200);
      expect(response.body.history).toEqual([]);
    });

    it('should handle complex timing preferences', async () => {
      const complexPreference = {
        userId: 'user-123',
        type: NotificationType.TASK_REMINDER,
        enabled: true,
        timing: {
          startHour: 6,
          startMinute: 30,
          endHour: 22,
          endMinute: 0,
          timezone: 'Australia/Perth',
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6] // All days
        },
        channels: {
          push: true,
          email: true,
          sms: true
        }
      };

      mockNotificationService.upsertPreferences.mockResolvedValue(complexPreference);

      const response = await request(app)
        .post('/api/notifications/preferences')
        .send(complexPreference);

      expect(response.status).toBe(200);
      expect(mockNotificationService.upsertPreferences).toHaveBeenCalledWith(complexPreference);
    });
  });
});