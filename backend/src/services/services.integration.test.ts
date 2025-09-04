import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationService } from './notificationService';
import { EmailUrgencyDetectionService } from './emailUrgencyDetection';
import { OnboardingService } from './onboardingService';
import { SchedulerService } from './scheduler';

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
  describe('NotificationService', () => {
    let service: NotificationService;
    let mockPrisma: any;

    beforeEach(() => {
      mockPrisma = createMockPrisma();
      service = new NotificationService();
    });

    it('should initialize and handle basic operations', async () => {
      // Test getPreferences - create default when none exist
      mockPrisma.notificationPreference.findUnique.mockResolvedValue(null);
      mockPrisma.notificationPreference.create.mockResolvedValue({
        id: '1',
        userId: 'user-123',
        morningBriefEnabled: true,
        morningBriefTime: '09:00',
        pushEnabled: true,
        emailDigestEnabled: true,
        urgentAlertsEnabled: true,
      });

      const prefs = await service.getPreferences('user-123');
      expect(prefs).toBeDefined();
      expect(prefs.morningBriefEnabled).toBe(true);

      // Test sendNotification
      mockPrisma.notification.create.mockResolvedValue({
        id: 'notif-1',
        userId: 'user-123',
        title: 'Test',
        message: 'Test message',
        type: 'info',
        priority: 'normal',
        read: false,
        createdAt: new Date(),
      });

      const notification = await service.sendNotification(
        'user-123',
        'Test',
        'Test message',
        'info',
        'normal'
      );
      expect(notification).toBeDefined();
      expect(notification.title).toBe('Test');

      // Test generateMorningBrief
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      });

      const brief = await service.generateMorningBrief('user-123');
      expect(brief).toBeDefined();
      expect(brief.userId).toBe('user-123');
      expect(brief.sections).toBeInstanceOf(Array);
    });
  });

  describe('EmailAnalysisService', () => {
    let service: EmailAnalysisService;
    let mockPrisma: any;

    beforeEach(() => {
      mockPrisma = createMockPrisma();
      service = new EmailUrgencyDetectionService(mockPrisma);
    });

    it('should analyze email urgency correctly', () => {
      // Test high urgency
      const highUrgency = service.analyzeUrgency(
        'URGENT: Need response ASAP',
        'This is critical and needs immediate attention'
      );
      expect(highUrgency.level).toBe('high');
      expect(highUrgency.score).toBeGreaterThanOrEqual(7);

      // Test medium urgency
      const mediumUrgency = service.analyzeUrgency(
        'Important update',
        'Please review when you get a chance'
      );
      expect(mediumUrgency.level).toBe('medium');
      expect(mediumUrgency.score).toBeLessThan(7);

      // Test low urgency
      const lowUrgency = service.analyzeUrgency(
        'FYI',
        'Just sharing some information'
      );
      expect(lowUrgency.level).toBe('low');
      expect(lowUrgency.score).toBeLessThan(4);
    });

    it('should categorize emails correctly', () => {
      // Test work email
      const workEmail = service.categorizeEmail(
        'Project Update',
        'The project is progressing well',
        'boss@company.com'
      );
      expect(workEmail.category).toBe('work');

      // Test personal email
      const personalEmail = service.categorizeEmail(
        'Happy Birthday!',
        'Hope you have a great day',
        'friend@gmail.com'
      );
      expect(personalEmail.category).toBe('personal');

      // Test promotional email
      const promoEmail = service.categorizeEmail(
        '50% OFF Sale',
        'Limited time offer',
        'promo@store.com'
      );
      expect(promoEmail.category).toBe('promotional');
    });

    it('should generate email drafts', () => {
      const draft = service.generateDraft({
        originalSubject: 'Meeting Request',
        originalContent: 'Can we meet tomorrow?',
        sender: 'colleague@company.com',
        intent: 'accept',
      });

      expect(draft).toBeDefined();
      expect(draft.subject).toContain('Re:');
      expect(draft.content).toBeTruthy();
      expect(draft.metadata.intent).toBe('accept');
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
