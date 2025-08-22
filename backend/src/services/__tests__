import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailAnalysisService } from '../email-analysis.js';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
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
  })),
}));

describe('EmailAnalysisService', () => {
  let service: EmailAnalysisService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    service = new EmailAnalysisService(mockPrisma);
    vi.clearAllMocks();
  });

  describe('analyzeUrgency', () => {
    it('should detect high urgency for deadline-related emails', () => {
      const highUrgencyEmails = [
        { subject: 'URGENT: Response needed by EOD', content: 'Please respond immediately' },
        { subject: 'Meeting in 1 hour', content: 'Quick reminder about our meeting' },
        { subject: 'Deadline tomorrow', content: 'Project due tomorrow morning' },
        { subject: 'ASAP - Review needed', content: 'Need your approval ASAP' },
      ];

      highUrgencyEmails.forEach((email) => {
        const result = service.analyzeUrgency(email.subject, email.content);
        expect(result.level).toBe('high');
        expect(result.score).toBeGreaterThanOrEqual(7);
        expect(result.keywords).toContain(expect.any(String));
      });
    });

    it('should detect medium urgency for important but not critical emails', () => {
      const mediumUrgencyEmails = [
        { subject: 'Important update', content: 'Please review when you can' },
        { subject: 'Follow-up needed', content: 'Let me know your thoughts' },
        { subject: 'This week\'s priorities', content: 'Here are the tasks for this week' },
      ];

      mediumUrgencyEmails.forEach((email) => {
        const result = service.analyzeUrgency(email.subject, email.content);
        expect(result.level).toBe('medium');
        expect(result.score).toBeGreaterThanOrEqual(4);
        expect(result.score).toBeLessThan(7);
      });
    });

    it('should detect low urgency for regular emails', () => {
      const lowUrgencyEmails = [
        { subject: 'Newsletter', content: 'Monthly newsletter content' },
        { subject: 'FYI', content: 'Just sharing some information' },
        { subject: 'Team update', content: 'Regular status update' },
      ];

      lowUrgencyEmails.forEach((email) => {
        const result = service.analyzeUrgency(email.subject, email.content);
        expect(result.level).toBe('low');
        expect(result.score).toBeLessThan(4);
      });
    });
  });

  describe('categorizeEmail', () => {
    it('should categorize work-related emails', () => {
      const workEmails = [
        { subject: 'Project update', content: 'The project is on track' },
        { subject: 'Meeting notes', content: 'Summary of today\'s meeting' },
        { subject: 'Budget approval', content: 'Please approve the budget' },
      ];

      workEmails.forEach((email) => {
        const result = service.categorizeEmail(email.subject, email.content, 'boss@company.com');
        expect(result.category).toBe('work');
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    it('should categorize personal emails', () => {
      const personalEmails = [
        { subject: 'Happy Birthday!', content: 'Hope you have a great day' },
        { subject: 'Weekend plans', content: 'Are you free this weekend?' },
        { subject: 'Family reunion', content: 'Planning for the family gathering' },
      ];

      personalEmails.forEach((email) => {
        const result = service.categorizeEmail(email.subject, email.content, 'friend@gmail.com');
        expect(result.category).toBe('personal');
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    it('should categorize promotional emails', () => {
      const promoEmails = [
        { subject: '50% OFF Sale!', content: 'Limited time offer' },
        { subject: 'Special discount for you', content: 'Save big on your purchase' },
        { subject: 'New products available', content: 'Check out our latest deals' },
      ];

      promoEmails.forEach((email) => {
        const result = service.categorizeEmail(email.subject, email.content, 'promo@store.com');
        expect(result.category).toBe('promotional');
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    it('should categorize newsletter emails', () => {
      const newsletterEmails = [
        { subject: 'Weekly Newsletter', content: 'This week\'s highlights' },
        { subject: 'Industry News Digest', content: 'Latest industry updates' },
        { subject: 'Monthly Report', content: 'Your monthly summary' },
      ];

      newsletterEmails.forEach((email) => {
        const result = service.categorizeEmail(email.subject, email.content, 'newsletter@company.com');
        expect(result.category).toBe('newsletter');
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });
  });

  describe('generateDraft', () => {
    it('should generate appropriate reply draft', () => {
      const context = {
        originalSubject: 'Meeting tomorrow',
        originalContent: 'Can we meet tomorrow at 2 PM?',
        sender: 'colleague@company.com',
        intent: 'accept' as const,
      };

      const draft = service.generateDraft(context);

      expect(draft.subject).toContain('Re:');
      expect(draft.content).toContain('Thank you');
      expect(draft.content.length).toBeGreaterThan(50);
      expect(draft.metadata).toMatchObject({
        tone: 'professional',
        intent: 'accept',
        wordCount: expect.any(Number),
      });
    });

    it('should generate decline draft', () => {
      const context = {
        originalSubject: 'Project proposal',
        originalContent: 'Would you like to join this project?',
        sender: 'manager@company.com',
        intent: 'decline' as const,
      };

      const draft = service.generateDraft(context);

      expect(draft.subject).toContain('Re:');
      expect(draft.content).toMatch(/unfortunately|unable|cannot/i);
      expect(draft.metadata.intent).toBe('decline');
    });

    it('should generate request info draft', () => {
      const context = {
        originalSubject: 'New initiative',
        originalContent: 'We are starting a new initiative',
        sender: 'team@company.com',
        intent: 'request_info' as const,
      };

      const draft = service.generateDraft(context);

      expect(draft.content).toMatch(/more information|details|clarify/i);
      expect(draft.metadata.intent).toBe('request_info');
    });
  });

  describe('saveDraft', () => {
    it('should save email draft', async () => {
      const draftData = {
        userId: 'user-123',
        subject: 'Test Draft',
        content: 'This is a test draft',
        to: ['recipient@example.com'],
        metadata: { tone: 'professional' },
      };

      const savedDraft = {
        id: 'draft-1',
        ...draftData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.emailDraft.create.mockResolvedValue(savedDraft);

      const result = await service.saveDraft(draftData);

      expect(result).toEqual(savedDraft);
      expect(mockPrisma.emailDraft.create).toHaveBeenCalledWith({
        data: draftData,
      });
    });
  });

  describe('getUserDrafts', () => {
    it('should return user drafts', async () => {
      const mockDrafts = [
        {
          id: 'draft-1',
          userId: 'user-123',
          subject: 'Draft 1',
          content: 'Content 1',
          to: ['user1@example.com'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'draft-2',
          userId: 'user-123',
          subject: 'Draft 2',
          content: 'Content 2',
          to: ['user2@example.com'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.emailDraft.findMany.mockResolvedValue(mockDrafts);

      const result = await service.getUserDrafts('user-123');

      expect(result).toEqual(mockDrafts);
      expect(mockPrisma.emailDraft.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('updateDraft', () => {
    it('should update existing draft', async () => {
      const updates = {
        subject: 'Updated Subject',
        content: 'Updated Content',
      };

      const updatedDraft = {
        id: 'draft-1',
        userId: 'user-123',
        subject: 'Updated Subject',
        content: 'Updated Content',
        to: ['recipient@example.com'],
        updatedAt: new Date(),
      };

      mockPrisma.emailDraft.update.mockResolvedValue(updatedDraft);

      const result = await service.updateDraft('draft-1', updates);

      expect(result).toEqual(updatedDraft);
      expect(mockPrisma.emailDraft.update).toHaveBeenCalledWith({
        where: { id: 'draft-1' },
        data: updates,
      });
    });
  });

  describe('deleteDraft', () => {
    it('should delete draft', async () => {
      mockPrisma.emailDraft.delete.mockResolvedValue({ id: 'draft-1' });

      await service.deleteDraft('draft-1');

      expect(mockPrisma.emailDraft.delete).toHaveBeenCalledWith({
        where: { id: 'draft-1' },
      });
    });
  });

  describe('getEmailStats', () => {
    it('should return email statistics', async () => {
      mockPrisma.email.count.mockImplementation((query: any) => {
        if (query.where.urgency === 'high') return Promise.resolve(5);
        if (query.where.urgency === 'medium') return Promise.resolve(10);
        if (query.where.urgency === 'low') return Promise.resolve(20);
        if (query.where.category === 'work') return Promise.resolve(15);
        if (query.where.category === 'personal') return Promise.resolve(8);
        if (query.where.category === 'promotional') return Promise.resolve(12);
        return Promise.resolve(35);
      });

      const stats = await service.getEmailStats('user-123');

      expect(stats).toEqual({
        total: 35,
        byUrgency: {
          high: 5,
          medium: 10,
          low: 20,
        },
        byCategory: {
          work: 15,
          personal: 8,
          promotional: 12,
        },
      });
    });
  });
});
