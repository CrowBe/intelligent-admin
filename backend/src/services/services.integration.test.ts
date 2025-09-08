import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import { NotificationService } from './notificationService';
import { EmailUrgencyDetectionService } from './emailUrgencyDetection';
import { OnboardingService } from './onboardingService';
import { SchedulerService } from './scheduler';
import { DIContainer } from '../repositories/RepositoryFactory.js';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient with all required models
const createMockPrisma = () => ({
  notificationPreference: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  notification: {
    create: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  emailCategory: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  email: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
  },
  emailDraft: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  onboardingProgress: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  onboardingStep: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  scheduledTask: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
});

describe('Services Integration Tests', () => {
  let mockPrisma: any;

  beforeAll(() => {
    // Initialize DIContainer for the tests
    mockPrisma = createMockPrisma();
    // Mock the DIContainer initialization
    vi.spyOn(DIContainer, 'initialize').mockImplementation(() => {});
    vi.spyOn(DIContainer, 'getInstance').mockReturnValue({
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
    } as any);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('NotificationService', () => {
    let service: NotificationService;

    beforeEach(() => {
      service = new NotificationService();
    });

    it('should initialize and handle basic operations', async () => {
      // Get the mocked container
      const mockContainer = DIContainer.getInstance() as any;
      
      // Test getPreferences
      mockContainer.notificationPreference.findByUserId.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'morning_brief',
          enabled: true,
          timingPreferences: { startHour: 9, startMinute: 0 },
          channels: { push: true, email: false },
        }
      ]);

      const prefs = await service.getPreferences('user-123');
      expect(prefs).toBeDefined();
      expect(Array.isArray(prefs)).toBe(true);

      // Test sendPushNotification
      mockContainer.notificationToken.findActiveByUserId.mockResolvedValue([
        { id: '1', userId: 'user-123', token: 'test-token', platform: 'web' }
      ]);

      mockContainer.notificationLog.create.mockResolvedValue({
        id: 'notif-1',
        userId: 'user-123',
        title: 'Test',
        body: 'Test message',
        type: 'custom',
        status: 'pending',
        channel: 'push',
        createdAt: new Date(),
      });

      mockContainer.notificationLog.markAsSent.mockResolvedValue({ id: 'notif-1' });

      const notification = await service.sendPushNotification('user-123', {
        title: 'Test',
        body: 'Test message',
      });
      expect(notification).toBeDefined();
      expect(notification.title).toBe('Test');

      // Test generateMorningBrief
      mockContainer.emailAnalysis.count.mockResolvedValue(2);
      mockContainer.task.count.mockResolvedValue(5);

      const brief = await service.generateMorningBrief('user-123');
      expect(brief).toBeDefined();
      expect(brief.title).toContain('Good morning');
      expect(brief.sections).toBeInstanceOf(Array);
    });
  });

  describe('EmailUrgencyDetectionService', () => {
    let service: EmailUrgencyDetectionService;

    beforeEach(() => {
      service = new EmailUrgencyDetectionService(mockPrisma);
      // Mock the saveAnalysis method
      mockPrisma.emailAnalysis = {
        create: vi.fn().mockResolvedValue({
          id: '1',
          analyzedAt: new Date(),
        }),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        count: vi.fn(),
      };
    });

    it('should analyze email urgency correctly', async () => {
      const email = {
        userId: 'user-123',
        emailId: 'email-1',
        subject: 'URGENT: Need response ASAP',
        from: 'client@company.com',
        snippet: 'This is critical and needs immediate attention',
        receivedAt: new Date(),
      };

      const analysis = await service.analyzeEmail(email);
      
      expect(analysis).toBeDefined();
      expect(analysis.priority).toBe('urgent');
      expect(analysis.urgencyScore).toBeGreaterThanOrEqual(70);
      expect(analysis.category).toBe('urgent');
    });

    it('should analyze business emails correctly', async () => {
      const email = {
        userId: 'user-123',
        emailId: 'email-2',
        subject: 'Invoice Payment Due',
        from: 'billing@supplier.com',
        snippet: 'Please find attached invoice for services rendered',
        receivedAt: new Date(),
      };

      const analysis = await service.analyzeEmail(email);
      
      expect(analysis).toBeDefined();
      expect(analysis.businessRelevance).toBeGreaterThanOrEqual(50);
      expect(analysis.keywords).toContain('invoice');
    });

    it('should get recent analyses', async () => {
      const mockAnalyses = [
        { id: '1', userId: 'user-123', emailId: 'email-1', priority: 'high' },
        { id: '2', userId: 'user-123', emailId: 'email-2', priority: 'medium' },
      ];
      
      mockPrisma.emailAnalysis.findMany.mockResolvedValue(mockAnalyses);
      
      const results = await service.getRecentAnalyses('user-123', 10);
      
      expect(results).toEqual(mockAnalyses);
      expect(mockPrisma.emailAnalysis.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { analyzedAt: 'desc' },
        take: 10
      });
    });
  });

  describe('OnboardingService', () => {
    let service: OnboardingService;
    let mockPrisma: any;

    beforeEach(() => {
      mockPrisma = createMockPrisma();
      service = new OnboardingService();
    });

    it('should manage onboarding progress', async () => {
      // Test creating new progress
      mockPrisma.onboardingProgress.findUnique.mockResolvedValue(null);
      mockPrisma.onboardingProgress.create.mockResolvedValue({
        id: 'progress-1',
        userId: 'user-123',
        currentStep: 0,
        completedSteps: [],
        totalSteps: 7,
        completionPercentage: 0,
        startedAt: new Date(),
        completedAt: null,
      });

      const progress = await service.getProgress('user-123');
      expect(progress).toBeDefined();
      expect(progress.currentStep).toBe(0);
      expect(progress.completedSteps).toEqual([]);

      // Test getting next step
      mockPrisma.onboardingProgress.findUnique.mockResolvedValue({
        completedSteps: [],
        currentStep: 0,
      });

      const nextStep = await service.getNextStep('user-123');
      expect(nextStep).toBeDefined();
      expect(nextStep?.step).toBe('welcome');
    });

    it('should provide onboarding tips', () => {
      const welcomeTips = service.getTips('welcome');
      expect(welcomeTips).toBeInstanceOf(Array);
      expect(welcomeTips.length).toBe(3);
      expect(welcomeTips[0]).toHaveProperty('title');
      expect(welcomeTips[0]).toHaveProperty('description');

      const profileTips = service.getTips('profile');
      expect(profileTips).toBeInstanceOf(Array);
      expect(profileTips.length).toBe(3);
    });

    it('should generate onboarding checklist', async () => {
      mockPrisma.onboardingProgress.findUnique.mockResolvedValue({
        completedSteps: ['welcome', 'profile'],
        currentStep: 2,
      });

      const checklist = await service.getChecklist('user-123');
      expect(checklist).toBeInstanceOf(Array);
      expect(checklist.length).toBe(7);
      expect(checklist[0].completed).toBe(true);
      expect(checklist[2].current).toBe(true);
    });
  });

  describe('SchedulerService', () => {
    let service: SchedulerService;
    let mockPrisma: any;

    beforeEach(() => {
      mockPrisma = createMockPrisma();
      service = new SchedulerService(mockPrisma);
    });

    it('should manage scheduler lifecycle', () => {
      expect(service.getStatus()).toBe('stopped');
      
      service.start();
      expect(service.getStatus()).toBe('running');
      
      service.stop();
      expect(service.getStatus()).toBe('stopped');
    });

    it('should schedule tasks', async () => {
      const scheduledTime = new Date(Date.now() + 60000);
      mockPrisma.scheduledTask.create.mockResolvedValue({
        id: 'task-1',
        userId: 'user-123',
        type: 'email_reminder',
        scheduledFor: scheduledTime,
        data: { emailId: 'email-1' },
        status: 'pending',
        createdAt: new Date(),
      });

      const task = await service.scheduleTask(
        'user-123',
        'email_reminder',
        scheduledTime,
        { emailId: 'email-1' }
      );

      expect(task).toBeDefined();
      expect(task.type).toBe('email_reminder');
      expect(task.status).toBe('pending');
    });

    it('should calculate next execution times', () => {
      const baseTime = new Date('2024-01-01T10:00:00Z');
      
      const daily = service.getNextExecutionTime(baseTime, 'daily');
      expect(daily.getTime()).toBe(baseTime.getTime() + 24 * 60 * 60 * 1000);
      
      const weekly = service.getNextExecutionTime(baseTime, 'weekly');
      expect(weekly.getTime()).toBe(baseTime.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const hourly = service.getNextExecutionTime(baseTime, 'hourly');
      expect(hourly.getTime()).toBe(baseTime.getTime() + 60 * 60 * 1000);
    });
  });

  describe('Service Interoperability', () => {
    it('should allow services to work together', async () => {
      const mockPrisma = createMockPrisma();
      
      // Initialize all services
      const notificationService = new NotificationService();
      const emailService = new EmailUrgencyDetectionService(mockPrisma);
      const onboardingService = new OnboardingService();
      const schedulerService = new SchedulerService(mockPrisma);

      // Example: Schedule a notification based on email urgency
      const urgency = emailService.analyzeUrgency(
        'URGENT: Meeting in 5 minutes',
        'Don\'t forget about the meeting'
      );

      if (urgency.level === 'high') {
        mockPrisma.scheduledTask.create.mockResolvedValue({
          id: 'task-urgent',
          userId: 'user-123',
          type: 'urgent_notification',
          scheduledFor: new Date(),
          data: { message: 'High priority email received' },
          status: 'pending',
        });

        const task = await schedulerService.scheduleTask(
          'user-123',
          'urgent_notification',
          new Date(),
          { message: 'High priority email received' }
        );

        expect(task).toBeDefined();
        expect(task.type).toBe('urgent_notification');
      }

      // Example: Update onboarding when user sets notification preferences
      mockPrisma.onboardingProgress.findUnique.mockResolvedValue({
        completedSteps: ['welcome', 'profile'],
        currentStep: 2,
        totalSteps: 7,
      });

      mockPrisma.notificationPreference.update.mockResolvedValue({
        morningBriefEnabled: true,
        morningBriefTime: '08:00',
      });

      mockPrisma.onboardingProgress.update.mockResolvedValue({
        completedSteps: ['welcome', 'profile', 'preferences'],
        currentStep: 3,
        completionPercentage: 42.86,
      });

      const prefs = await notificationService.updatePreferences('user-123', {
        morningBriefEnabled: true,
        morningBriefTime: '08:00',
      });

      const progress = await onboardingService.updateProgress('user-123', 'preferences');
      
      expect(progress.completedSteps).toContain('preferences');
    });
  });
});
