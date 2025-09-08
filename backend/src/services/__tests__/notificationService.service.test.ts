import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationService, NotificationType } from '../notificationService.js';
import { DIContainer } from '../../repositories/RepositoryFactory.js';

// Mock DIContainer
vi.mock('../../repositories/RepositoryFactory.js', () => ({
  DIContainer: {
    getInstance: vi.fn(),
  },
}));

describe('NotificationService', () => {
  let service: NotificationService;
  let mockContainer: any;

  beforeEach(() => {
    mockContainer = {
      notificationPreference: {
        findByUserId: vi.fn(),
        upsertPreference: vi.fn(),
        findEnabledByType: vi.fn(),
      },
      notificationToken: {
        findActiveByUserId: vi.fn(),
        upsertUserToken: vi.fn(),
      },
      notificationLog: {
        create: vi.fn(),
        markAsSent: vi.fn(),
        findByUserId: vi.fn(),
        markAsRead: vi.fn(),
      },
      emailAnalysis: {
        count: vi.fn(),
      },
      task: {
        count: vi.fn(),
      },
    };

    (DIContainer.getInstance as any).mockReturnValue(mockContainer);
    service = new NotificationService();
    vi.clearAllMocks();
  });

  describe('upsertPreferences', () => {
    it('should create/update notification preferences', async () => {
      const preferenceData = {
        userId: 'user-123',
        type: NotificationType.MORNING_BRIEF,
        enabled: true,
        timing: {
          startHour: 7,
          startMinute: 0,
          endHour: 7,
          endMinute: 30,
          timezone: 'Australia/Sydney',
          daysOfWeek: [1, 2, 3, 4, 5],
        },
        channels: {
          push: true,
          email: false,
          sms: false,
        },
      };

      const mockResult = { id: 'pref-1', ...preferenceData };
      mockContainer.notificationPreference.upsertPreference.mockResolvedValue(mockResult);

      const result = await service.upsertPreferences(preferenceData);

      expect(result).toEqual(mockResult);
      expect(mockContainer.notificationPreference.upsertPreference).toHaveBeenCalledWith(
        'user-123',
        NotificationType.MORNING_BRIEF,
        {
          enabled: true,
          timingPreferences: preferenceData.timing,
          channels: preferenceData.channels,
        }
      );
    });

    it('should validate input data with Zod schema', async () => {
      const invalidData = {
        userId: 'user-123',
        type: 'invalid_type', // Invalid enum value
        enabled: true,
      };

      await expect(service.upsertPreferences(invalidData as any)).rejects.toThrow();
    });
  });

  describe('getPreferences', () => {
    it('should retrieve user preferences', async () => {
      const mockPreferences = [
        {
          id: 'pref-1',
          userId: 'user-123',
          type: 'morning_brief',
          enabled: true,
        },
      ];

      mockContainer.notificationPreference.findByUserId.mockResolvedValue(mockPreferences);

      const result = await service.getPreferences('user-123');

      expect(result).toEqual(mockPreferences);
      expect(mockContainer.notificationPreference.findByUserId).toHaveBeenCalledWith('user-123');
    });
  });

  describe('isWithinTimeWindow', () => {
    it('should return true when no timing restrictions', () => {
      const preference = { timingPreferences: undefined };

      const result = service.isWithinTimeWindow(preference);

      expect(result).toBe(true);
    });

    it('should check time window correctly', () => {
      const preference = {
        timingPreferences: {
          startHour: 7,
          startMinute: 0,
          endHour: 8,
          endMinute: 0,
          timezone: 'Australia/Sydney',
          daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
        },
      };

      // Mock current time to be within window (7:30 AM on Monday)
      const mockDate = new Date('2024-01-08T07:30:00+11:00'); // Monday 7:30 AM Sydney time
      vi.spyOn(global, 'Date').mockImplementation((...args) => {
        if (args.length === 0) {
          return mockDate as any;
        }
        return new (Date as any)(...args);
      });

      const result = service.isWithinTimeWindow(preference);

      expect(result).toBe(true);

      vi.restoreAllMocks();
    });

    it('should return false for weekend when restricted to weekdays', () => {
      const preference = {
        timingPreferences: {
          daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri only
        },
      };

      // Mock current time to be Saturday
      const mockDate = new Date('2024-01-06T08:00:00+11:00'); // Saturday
      vi.spyOn(global, 'Date').mockImplementation((...args) => {
        if (args.length === 0) {
          return mockDate as any;
        }
        return new (Date as any)(...args);
      });

      const result = service.isWithinTimeWindow(preference);

      expect(result).toBe(false);

      vi.restoreAllMocks();
    });
  });

  describe('sendPushNotification', () => {
    it('should send push notification successfully', async () => {
      const notification = {
        title: 'Test Notification',
        body: 'Test message',
        type: NotificationType.CUSTOM,
        data: { test: 'data' },
      };

      const mockToken = {
        id: 'token-1',
        userId: 'user-123',
        token: 'fcm-token',
        platform: 'web',
      };

      const mockLog = {
        id: 'log-1',
        userId: 'user-123',
        title: 'Test Notification',
        body: 'Test message',
        type: 'custom',
        status: 'pending',
      };

      mockContainer.notificationToken.findActiveByUserId.mockResolvedValue([mockToken]);
      mockContainer.notificationLog.create.mockResolvedValue(mockLog);
      mockContainer.notificationLog.markAsSent.mockResolvedValue({ ...mockLog, status: 'sent' });

      const result = await service.sendPushNotification('user-123', notification);

      expect(result.id).toBe('log-1');
      expect(mockContainer.notificationLog.create).toHaveBeenCalledWith({
        userId: 'user-123',
        type: NotificationType.CUSTOM,
        title: 'Test Notification',
        body: 'Test message',
        data: { test: 'data' },
        status: 'pending',
        channel: 'push',
      });
      expect(mockContainer.notificationLog.markAsSent).toHaveBeenCalledWith('log-1');
    });

    it('should handle no active tokens', async () => {
      mockContainer.notificationToken.findActiveByUserId.mockResolvedValue([]);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();

      const result = await service.sendPushNotification('user-123', {
        title: 'Test',
        body: 'Test',
      });

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('No active FCM token for user user-123');

      consoleSpy.mockRestore();
    });

    it('should handle errors gracefully', async () => {
      mockContainer.notificationToken.findActiveByUserId.mockRejectedValue(
        new Error('Database error')
      );

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();

      await expect(
        service.sendPushNotification('user-123', {
          title: 'Test',
          body: 'Test',
        })
      ).rejects.toThrow('Database error');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error sending push notification:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('generateMorningBrief', () => {
    it('should generate morning brief with urgent emails', async () => {
      mockContainer.emailAnalysis.count.mockResolvedValue(3); // 3 urgent emails
      mockContainer.task.count.mockResolvedValue(5); // 5 pending tasks

      const result = await service.generateMorningBrief('user-123');

      expect(result).toMatchObject({
        title: expect.stringContaining('Good morning'),
        sections: expect.arrayContaining([
          expect.objectContaining({
            heading: '🔴 Urgent Items',
            items: expect.arrayContaining([
              expect.stringContaining('3 urgent emails'),
            ]),
            priority: 'high',
          }),
        ]),
        summary: expect.stringContaining('3 urgent items'),
      });

      expect(mockContainer.emailAnalysis.count).toHaveBeenCalledWith({
        userId: 'user-123',
        priority: 'urgent',
        analyzedAt: expect.any(Date),
      });
      expect(mockContainer.task.count).toHaveBeenCalledWith({
        userId: 'user-123',
        status: 'pending',
      });
    });

    it('should generate brief with no urgent items', async () => {
      mockContainer.emailAnalysis.count.mockResolvedValue(0); // No urgent emails
      mockContainer.task.count.mockResolvedValue(2); // 2 pending tasks

      const result = await service.generateMorningBrief('user-123');

      expect(result.summary).toContain('No urgent items');
      expect(result.sections).not.toContainEqual(
        expect.objectContaining({
          heading: '🔴 Urgent Items',
        })
      );
    });

    it('should include business insights section', async () => {
      mockContainer.emailAnalysis.count.mockResolvedValue(0);
      mockContainer.task.count.mockResolvedValue(0);

      const result = await service.generateMorningBrief('user-123');

      expect(result.sections).toContainEqual(
        expect.objectContaining({
          heading: '📊 Business Insights',
          priority: 'low',
          items: expect.arrayContaining([
            expect.stringContaining('Email response rate'),
          ]),
        })
      );
    });
  });

  describe('scheduleMorningBriefs', () => {
    it('should schedule briefs for users within time window', async () => {
      const mockPreferences = [
        {
          userId: 'user-1',
          type: 'morning_brief',
          enabled: true,
          timingPreferences: {
            startHour: 7,
            startMinute: 0,
            endHour: 8,
            endMinute: 0,
          },
        },
        {
          userId: 'user-2',
          type: 'morning_brief',
          enabled: true,
          timingPreferences: {
            startHour: 9,
            startMinute: 0,
            endHour: 10,
            endMinute: 0,
          },
        },
      ];

      mockContainer.notificationPreference.findEnabledByType.mockResolvedValue(mockPreferences);

      // Mock isWithinTimeWindow to return true for user-1, false for user-2
      const originalIsWithinTimeWindow = service.isWithinTimeWindow;
      service.isWithinTimeWindow = vi.fn()
        .mockReturnValueOnce(true)  // user-1
        .mockReturnValueOnce(false); // user-2

      // Mock other dependencies
      mockContainer.emailAnalysis.count.mockResolvedValue(1);
      mockContainer.task.count.mockResolvedValue(2);
      mockContainer.notificationToken.findActiveByUserId.mockResolvedValue([
        { id: '1', token: 'token-1', platform: 'web' },
      ]);
      mockContainer.notificationLog.create.mockResolvedValue({ id: 'log-1' });
      mockContainer.notificationLog.markAsSent.mockResolvedValue({ id: 'log-1' });

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();

      await service.scheduleMorningBriefs();

      expect(mockContainer.notificationPreference.findEnabledByType).toHaveBeenCalledWith(
        NotificationType.MORNING_BRIEF
      );
      expect(service.isWithinTimeWindow).toHaveBeenCalledTimes(2);
      expect(mockContainer.notificationLog.create).toHaveBeenCalledTimes(1); // Only user-1
      expect(consoleSpy).toHaveBeenCalledWith('Morning brief sent to user user-1');

      // Restore
      service.isWithinTimeWindow = originalIsWithinTimeWindow;
      consoleSpy.mockRestore();
    });

    it('should handle errors in brief generation', async () => {
      const mockPreferences = [
        {
          userId: 'user-error',
          type: 'morning_brief',
          enabled: true,
        },
      ];

      mockContainer.notificationPreference.findEnabledByType.mockResolvedValue(mockPreferences);

      // Mock isWithinTimeWindow to return true
      service.isWithinTimeWindow = vi.fn().mockReturnValue(true);

      // Mock generateMorningBrief to throw error
      mockContainer.emailAnalysis.count.mockRejectedValue(new Error('Database error'));

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();

      await service.scheduleMorningBriefs();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to send morning brief to user user-error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('saveToken', () => {
    it('should save FCM token', async () => {
      const mockToken = {
        id: 'token-1',
        userId: 'user-123',
        token: 'fcm-token',
        platform: 'web',
      };

      mockContainer.notificationToken.upsertUserToken.mockResolvedValue(mockToken);

      const result = await service.saveToken('user-123', 'fcm-token', 'web');

      expect(result).toEqual(mockToken);
      expect(mockContainer.notificationToken.upsertUserToken).toHaveBeenCalledWith(
        'user-123',
        'fcm-token',
        'web'
      );
    });
  });

  describe('getHistory', () => {
    it('should return notification history', async () => {
      const mockHistory = [
        {
          id: 'notif-1',
          title: 'Test 1',
          createdAt: new Date(),
        },
        {
          id: 'notif-2',
          title: 'Test 2',
          createdAt: new Date(),
        },
      ];

      mockContainer.notificationLog.findByUserId.mockResolvedValue(mockHistory);

      const result = await service.getHistory('user-123', 25);

      expect(result).toEqual(mockHistory);
      expect(mockContainer.notificationLog.findByUserId).toHaveBeenCalledWith('user-123', 25);
    });

    it('should use default limit', async () => {
      mockContainer.notificationLog.findByUserId.mockResolvedValue([]);

      await service.getHistory('user-123');

      expect(mockContainer.notificationLog.findByUserId).toHaveBeenCalledWith('user-123', 50);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockUpdated = {
        id: 'notif-1',
        status: 'read',
        readAt: new Date(),
      };

      mockContainer.notificationLog.markAsRead.mockResolvedValue(mockUpdated);

      const result = await service.markAsRead('notif-1');

      expect(result).toEqual(mockUpdated);
      expect(mockContainer.notificationLog.markAsRead).toHaveBeenCalledWith('notif-1');
    });
  });
});