import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EmailUrgencyDetectionService, EmailPriority, EmailCategory } from '../emailUrgencyDetection.js';

// Mock Prisma client
const mockPrisma = {
  emailAnalysis: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
};

describe('EmailUrgencyDetectionService', () => {
  let service: EmailUrgencyDetectionService;

  beforeEach(() => {
    service = new EmailUrgencyDetectionService(mockPrisma as any);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('analyzeEmail', () => {
    it('should analyze urgent email correctly', async () => {
      const urgentEmail = {
        userId: 'user-123',
        emailId: 'email-urgent',
        subject: 'URGENT: Gas leak emergency at job site',
        from: 'site.manager@construction.com',
        snippet: 'Emergency situation requires immediate attention. Gas leak detected.',
        receivedAt: new Date(),
      };

      mockPrisma.emailAnalysis.create.mockResolvedValue({
        id: 'analysis-1',
        analyzedAt: new Date(),
      });

      const analysis = await service.analyzeEmail(urgentEmail);

      expect(analysis).toBeDefined();
      expect(analysis.priority).toBe(EmailPriority.URGENT);
      expect(analysis.category).toBe(EmailCategory.URGENT);
      expect(analysis.urgencyScore).toBeGreaterThanOrEqual(70);
      expect(analysis.actionRequired).toBe(true);
      expect(analysis.keywords).toContain('emergency');
      expect(analysis.keywords).toContain('gas leak');
      expect(analysis.suggestedActions).toContain('Respond immediately');
      expect(analysis.reasoning).toContain('urgent keywords');
    });

    it('should analyze standard business email correctly', async () => {
      const businessEmail = {
        userId: 'user-123',
        emailId: 'email-business',
        subject: 'Invoice #INV-2024-001 - Payment Due',
        from: 'accounts@supplier.com.au',
        snippet: 'Please find attached invoice for materials delivered last week.',
        receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      };

      mockPrisma.emailAnalysis.create.mockResolvedValue({
        id: 'analysis-2',
        analyzedAt: new Date(),
      });

      const analysis = await service.analyzeEmail(businessEmail);

      expect(analysis.priority).toBe(EmailPriority.HIGH);
      expect(analysis.category).toBe(EmailCategory.STANDARD);
      expect(analysis.businessRelevance).toBeGreaterThanOrEqual(60);
      expect(analysis.keywords).toContain('invoice');
      expect(analysis.keywords).toContain('payment');
      expect(analysis.suggestedActions).toContain('Review and respond within 24 hours');
    });

    it('should analyze follow-up email correctly', async () => {
      const followUpEmail = {
        userId: 'user-123',
        emailId: 'email-followup',
        subject: 'Following up on quote request',
        from: 'client@homeowner.com',
        snippet: 'Hi, just following up on the quote I requested last week for bathroom renovation.',
        receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      };

      mockPrisma.emailAnalysis.create.mockResolvedValue({
        id: 'analysis-3',
        analyzedAt: new Date(),
      });

      const analysis = await service.analyzeEmail(followUpEmail);

      expect(analysis.category).toBe(EmailCategory.FOLLOW_UP);
      expect(analysis.keywords).toContain('following up');
      expect(analysis.suggestedActions).toContain('Check previous correspondence');
      expect(analysis.suggestedActions).toContain('Respond with update');
    });

    it('should identify spam emails correctly', async () => {
      const spamEmail = {
        userId: 'user-123',
        emailId: 'email-spam',
        subject: 'CONGRATULATIONS! You\'ve WON $10,000!!!',
        from: 'noreply@suspicious-domain.com',
        snippet: 'Amazing deal! Click here now for your free money! Act now, limited time only!',
        receivedAt: new Date(),
      };

      mockPrisma.emailAnalysis.create.mockResolvedValue({
        id: 'analysis-4',
        analyzedAt: new Date(),
      });

      const analysis = await service.analyzeEmail(spamEmail);

      expect(analysis.category).toBe(EmailCategory.SPAM);
      expect(analysis.priority).toBe(EmailPriority.LOW);
      expect(analysis.actionRequired).toBe(false);
      expect(analysis.suggestedActions).toContain('Mark as spam');
    });

    it('should analyze administrative email correctly', async () => {
      const adminEmail = {
        userId: 'user-123',
        emailId: 'email-admin',
        subject: 'Tax Notice - BAS Statement Available',
        from: 'noreply@ato.gov.au',
        snippet: 'Your Business Activity Statement for quarter ending March 2024 is now available.',
        receivedAt: new Date(),
      };

      mockPrisma.emailAnalysis.create.mockResolvedValue({
        id: 'analysis-5',
        analyzedAt: new Date(),
      });

      const analysis = await service.analyzeEmail(adminEmail);

      expect(analysis.category).toBe(EmailCategory.ADMIN);
      expect(analysis.keywords).toContain('tax');
      expect(analysis.keywords).toContain('bas');
      expect(analysis.suggestedActions).toContain('File for reference');
    });

    it('should handle recent emails with higher urgency', async () => {
      const recentEmail = {
        userId: 'user-123',
        emailId: 'email-recent',
        subject: 'Meeting in 30 minutes - client presentation',
        from: 'boss@company.com',
        snippet: 'Quick reminder about the client presentation today',
        receivedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      };

      mockPrisma.emailAnalysis.create.mockResolvedValue({
        id: 'analysis-6',
        analyzedAt: new Date(),
      });

      const analysis = await service.analyzeEmail(recentEmail);

      expect(analysis.urgencyScore).toBeGreaterThan(40); // Should get boost for recency
      expect(analysis.keywords).toContain('today');
    });

    it('should handle emails with action phrases', async () => {
      const actionEmail = {
        userId: 'user-123',
        emailId: 'email-action',
        subject: 'Please confirm your availability',
        from: 'scheduler@company.com',
        snippet: 'Please confirm your availability for tomorrow\'s site visit. Response required by 5 PM.',
        receivedAt: new Date(),
      };

      mockPrisma.emailAnalysis.create.mockResolvedValue({
        id: 'analysis-7',
        analyzedAt: new Date(),
      });

      const analysis = await service.analyzeEmail(actionEmail);

      expect(analysis.actionRequired).toBe(true);
    });
  });

  describe('analyzeEmails (batch)', () => {
    it('should analyze multiple emails in batch', async () => {
      const emails = [
        {
          userId: 'user-123',
          emailId: 'email-1',
          subject: 'URGENT: Emergency repair needed',
          from: 'client@emergency.com',
          snippet: 'Burst pipe flooding basement',
          receivedAt: new Date(),
        },
        {
          userId: 'user-123',
          emailId: 'email-2',
          subject: 'Quote Request',
          from: 'client@normal.com',
          snippet: 'Looking for a quote on kitchen renovation',
          receivedAt: new Date(),
        },
      ];

      mockPrisma.emailAnalysis.create
        .mockResolvedValueOnce({ id: 'analysis-1', analyzedAt: new Date() })
        .mockResolvedValueOnce({ id: 'analysis-2', analyzedAt: new Date() });

      const analyses = await service.analyzeEmails(emails);

      expect(analyses).toHaveLength(2);
      expect(analyses[0].priority).toBe(EmailPriority.URGENT);
      expect(analyses[1].priority).toBe(EmailPriority.MEDIUM);
      expect(mockPrisma.emailAnalysis.create).toHaveBeenCalledTimes(2);
    });

    it('should handle failures gracefully in batch processing', async () => {
      const emails = [
        {
          userId: 'user-123',
          emailId: 'email-good',
          subject: 'Valid email',
          from: 'valid@email.com',
          snippet: 'This should work',
          receivedAt: new Date(),
        },
        {
          userId: 'user-123',
          emailId: 'email-bad',
          subject: 'Problem email',
          from: 'bad@email.com',
          snippet: 'This will fail',
          receivedAt: new Date(),
        },
      ];

      mockPrisma.emailAnalysis.create
        .mockResolvedValueOnce({ id: 'analysis-1', analyzedAt: new Date() })
        .mockRejectedValueOnce(new Error('Database error'));

      // Mock console.error to avoid test output noise
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();

      const analyses = await service.analyzeEmails(emails);

      expect(analyses).toHaveLength(1); // Only successful analysis
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to analyze email email-bad:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getRecentAnalyses', () => {
    it('should retrieve recent analyses for user', async () => {
      const mockAnalyses = [
        { id: '1', userId: 'user-123', subject: 'Email 1', priority: 'high' },
        { id: '2', userId: 'user-123', subject: 'Email 2', priority: 'medium' },
      ];

      mockPrisma.emailAnalysis.findMany.mockResolvedValue(mockAnalyses);

      const result = await service.getRecentAnalyses('user-123', 10);

      expect(result).toEqual(mockAnalyses);
      expect(mockPrisma.emailAnalysis.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { analyzedAt: 'desc' },
        take: 10,
      });
    });

    it('should use default limit when not provided', async () => {
      mockPrisma.emailAnalysis.findMany.mockResolvedValue([]);

      await service.getRecentAnalyses('user-123');

      expect(mockPrisma.emailAnalysis.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { analyzedAt: 'desc' },
        take: 50,
      });
    });
  });

  describe('getAnalysisByEmailId', () => {
    it('should retrieve analysis by email ID', async () => {
      const mockAnalysis = { id: '1', emailId: 'email-123', priority: 'high' };
      mockPrisma.emailAnalysis.findFirst.mockResolvedValue(mockAnalysis);

      const result = await service.getAnalysisByEmailId('email-123');

      expect(result).toEqual(mockAnalysis);
      expect(mockPrisma.emailAnalysis.findFirst).toHaveBeenCalledWith({
        where: { emailId: 'email-123' },
      });
    });

    it('should return null when analysis not found', async () => {
      mockPrisma.emailAnalysis.findFirst.mockResolvedValue(null);

      const result = await service.getAnalysisByEmailId('nonexistent-email');

      expect(result).toBeNull();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty email content gracefully', async () => {
      const emptyEmail = {
        userId: 'user-123',
        emailId: 'email-empty',
        subject: '',
        from: 'sender@example.com',
        snippet: '',
        receivedAt: new Date(),
      };

      mockPrisma.emailAnalysis.create.mockResolvedValue({
        id: 'analysis-1',
        analyzedAt: new Date(),
      });

      const analysis = await service.analyzeEmail(emptyEmail);

      expect(analysis).toBeDefined();
      expect(analysis.urgencyScore).toBe(0);
      expect(analysis.businessRelevance).toBe(30); // Base score
      expect(analysis.keywords).toEqual([]);
    });

    it('should handle malformed email addresses', async () => {
      const malformedEmail = {
        userId: 'user-123',
        emailId: 'email-malformed',
        subject: 'Test email',
        from: 'malformed-email-address',
        snippet: 'Test content',
        receivedAt: new Date(),
      };

      mockPrisma.emailAnalysis.create.mockResolvedValue({
        id: 'analysis-1',
        analyzedAt: new Date(),
      });

      const analysis = await service.analyzeEmail(malformedEmail);

      expect(analysis).toBeDefined();
      expect(analysis.businessRelevance).toBe(30); // Should use base score when domain extraction fails
    });

    it('should handle database save errors', async () => {
      const email = {
        userId: 'user-123',
        emailId: 'email-fail',
        subject: 'Test',
        from: 'test@example.com',
        snippet: 'Test',
        receivedAt: new Date(),
      };

      mockPrisma.emailAnalysis.create.mockRejectedValue(new Error('Database error'));

      await expect(service.analyzeEmail(email)).rejects.toThrow('Database error');
    });

    it('should handle very long email content', async () => {
      const longContent = 'word '.repeat(1000);
      const longEmail = {
        userId: 'user-123',
        emailId: 'email-long',
        subject: longContent,
        from: 'sender@example.com',
        snippet: longContent,
        bodyPreview: longContent,
        receivedAt: new Date(),
      };

      mockPrisma.emailAnalysis.create.mockResolvedValue({
        id: 'analysis-1',
        analyzedAt: new Date(),
      });

      const analysis = await service.analyzeEmail(longEmail);

      expect(analysis).toBeDefined();
      expect(analysis.keywords.length).toBeLessThanOrEqual(10); // Should limit keywords
    });
  });

  describe('Urgency Score Calculation', () => {
    it('should give high scores for emergency keywords', async () => {
      const emergencyEmail = {
        userId: 'user-123',
        emailId: 'email-emergency',
        subject: 'EMERGENCY: Electrical fault causing sparks',
        from: 'site@danger.com',
        snippet: 'Immediate electrical emergency at construction site',
        receivedAt: new Date(),
      };

      mockPrisma.emailAnalysis.create.mockResolvedValue({
        id: 'analysis-1',
        analyzedAt: new Date(),
      });

      const analysis = await service.analyzeEmail(emergencyEmail);

      expect(analysis.urgencyScore).toBeGreaterThanOrEqual(90);
      expect(analysis.keywords).toContain('emergency');
      expect(analysis.keywords).toContain('electrical fault');
    });

    it('should boost scores for time-sensitive content', async () => {
      const timeEmail = {
        userId: 'user-123',
        emailId: 'email-time',
        subject: 'Need response today - client waiting',
        from: 'urgent@client.com',
        snippet: 'Client is waiting for response today, please reply ASAP',
        receivedAt: new Date(),
      };

      mockPrisma.emailAnalysis.create.mockResolvedValue({
        id: 'analysis-1',
        analyzedAt: new Date(),
      });

      const analysis = await service.analyzeEmail(timeEmail);

      expect(analysis.urgencyScore).toBeGreaterThan(50);
      expect(analysis.keywords).toContain('today');
    });

    it('should consider email age in urgency calculation', async () => {
      const oldEmail = {
        userId: 'user-123',
        emailId: 'email-old',
        subject: 'Urgent matter',
        from: 'old@email.com',
        snippet: 'This was urgent but is old now',
        receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      };

      const recentEmail = {
        ...oldEmail,
        emailId: 'email-recent',
        receivedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      };

      mockPrisma.emailAnalysis.create.mockResolvedValue({
        id: 'analysis-1',
        analyzedAt: new Date(),
      });

      const oldAnalysis = await service.analyzeEmail(oldEmail);
      const recentAnalysis = await service.analyzeEmail(recentEmail);

      expect(recentAnalysis.urgencyScore).toBeGreaterThan(oldAnalysis.urgencyScore);
    });
  });

  describe('Business Relevance Calculation', () => {
    it('should give higher scores for business domains', async () => {
      const businessEmail = {
        userId: 'user-123',
        emailId: 'email-biz',
        subject: 'Invoice payment reminder',
        from: 'accounts@supplier.com.au',
        snippet: 'Payment for invoice INV-123 is now overdue',
        receivedAt: new Date(),
      };

      mockPrisma.emailAnalysis.create.mockResolvedValue({
        id: 'analysis-1',
        analyzedAt: new Date(),
      });

      const analysis = await service.analyzeEmail(businessEmail);

      expect(analysis.businessRelevance).toBeGreaterThan(60);
      expect(analysis.keywords).toContain('invoice');
      expect(analysis.keywords).toContain('payment');
    });

    it('should give lower scores for personal domains', async () => {
      const personalEmail = {
        userId: 'user-123',
        emailId: 'email-personal',
        subject: 'Happy Birthday!',
        from: 'friend@gmail.com',
        snippet: 'Hope you have a wonderful birthday celebration',
        receivedAt: new Date(),
      };

      mockPrisma.emailAnalysis.create.mockResolvedValue({
        id: 'analysis-1',
        analyzedAt: new Date(),
      });

      const analysis = await service.analyzeEmail(personalEmail);

      expect(analysis.businessRelevance).toBeLessThan(50);
      expect(analysis.category).not.toBe(EmailCategory.URGENT);
    });

    it('should recognize trade-specific keywords', async () => {
      const tradeEmail = {
        userId: 'user-123',
        emailId: 'email-trade',
        subject: 'Site visit required for electrical inspection',
        from: 'inspector@council.gov.au',
        snippet: 'Electrical compliance inspection needed for permit approval',
        receivedAt: new Date(),
      };

      mockPrisma.emailAnalysis.create.mockResolvedValue({
        id: 'analysis-1',
        analyzedAt: new Date(),
      });

      const analysis = await service.analyzeEmail(tradeEmail);

      expect(analysis.businessRelevance).toBeGreaterThan(70);
      expect(analysis.keywords).toContain('site visit');
      expect(analysis.keywords).toContain('compliance');
    });
  });
});