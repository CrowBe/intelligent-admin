import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { emailRouter } from '../emails.js';
import { prisma } from '../../services/prisma.js';
import { EmailUrgencyDetectionService } from '../../services/emailUrgencyDetection.js';

// Mock the service
vi.mock('../../services/emailUrgencyDetection.js');
vi.mock('../../services/prisma.js');

// Mock middleware
vi.mock('../../middleware/auth.js', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-123' };
    next();
  },
  validateUserOwnership: (req: any, res: any, next: any) => next(),
}));

describe('Email Routes', () => {
  let app: express.Application;
  let mockEmailService: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/emails', emailRouter);

    // Create mock email service
    mockEmailService = {
      analyzeEmail: vi.fn(),
      analyzeEmails: vi.fn(),
      getRecentAnalyses: vi.fn(),
      getAnalysisByEmailId: vi.fn(),
    };

    // Mock the service constructor
    const MockEmailService = EmailUrgencyDetectionService as any;
    MockEmailService.mockImplementation(() => mockEmailService);

    // Mock Prisma client
    (prisma as any) = {
      emailAnalysis: {
        findMany: vi.fn(),
        count: vi.fn(),
        groupBy: vi.fn(),
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /analyze', () => {
    it('should analyze single email successfully', async () => {
      const mockAnalysis = {
        id: 'analysis-1',
        userId: 'test-user-123',
        emailId: 'email-1',
        subject: 'Test Email',
        from: 'test@example.com',
        snippet: 'Test snippet',
        priority: 'medium',
        category: 'standard',
        urgencyScore: 50,
        businessRelevance: 70,
        actionRequired: false,
        keywords: ['test'],
        suggestedActions: ['Review when convenient'],
        reasoning: 'Standard business communication',
        analyzedAt: new Date(),
      };

      mockEmailService.analyzeEmail.mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .post('/api/emails/analyze')
        .send({
          emailId: 'email-1',
          subject: 'Test Email',
          from: 'test@example.com',
          snippet: 'Test snippet',
          receivedAt: new Date().toISOString(),
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('analysis');
      expect(response.body.analysis.id).toBe('analysis-1');
      expect(mockEmailService.analyzeEmail).toHaveBeenCalledWith({
        userId: 'test-user-123',
        emailId: 'email-1',
        subject: 'Test Email',
        from: 'test@example.com',
        snippet: 'Test snippet',
        bodyPreview: undefined,
        receivedAt: expect.any(Date),
      });
    });

    it('should analyze batch emails successfully', async () => {
      const mockAnalyses = [
        {
          id: 'analysis-1',
          priority: 'urgent',
          category: 'urgent',
          actionRequired: true,
        },
        {
          id: 'analysis-2',
          priority: 'medium',
          category: 'standard',
          actionRequired: false,
        },
      ];

      mockEmailService.analyzeEmail.mockResolvedValueOnce(mockAnalyses[0]);
      mockEmailService.analyzeEmail.mockResolvedValueOnce(mockAnalyses[1]);

      const emails = [
        {
          id: 'email-1',
          subject: 'URGENT: Critical Issue',
          from: 'client@company.com',
          snippet: 'Emergency situation',
          date: new Date().toISOString(),
        },
        {
          id: 'email-2',
          subject: 'Regular Update',
          from: 'team@company.com',
          snippet: 'Weekly report',
          date: new Date().toISOString(),
        },
      ];

      const response = await request(app)
        .post('/api/emails/analyze')
        .send({ emails });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalEmails).toBe(2);
      expect(response.body.data.summary.urgentCount).toBe(1);
      expect(response.body.data.summary.actionRequiredCount).toBe(1);
      expect(mockEmailService.analyzeEmail).toHaveBeenCalledTimes(2);
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/emails/analyze')
        .send({
          emailId: 'email-1',
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
      expect(response.body).toHaveProperty('details');
    });

    it('should handle service errors', async () => {
      mockEmailService.analyzeEmail.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/api/emails/analyze')
        .send({
          emailId: 'email-1',
          subject: 'Test Email',
          from: 'test@example.com',
          snippet: 'Test snippet',
          receivedAt: new Date().toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /analyze-batch', () => {
    it('should handle batch analysis', async () => {
      const mockAnalyses = [
        { id: 'analysis-1', priority: 'high' },
        { id: 'analysis-2', priority: 'medium' },
      ];

      mockEmailService.analyzeEmails.mockResolvedValue(mockAnalyses);

      const response = await request(app)
        .post('/api/emails/analyze-batch')
        .send({
          emails: [
            {
              emailId: 'email-1',
              subject: 'Test 1',
              from: 'test1@example.com',
              snippet: 'Snippet 1',
              receivedAt: new Date().toISOString(),
            },
            {
              emailId: 'email-2',
              subject: 'Test 2',
              from: 'test2@example.com',
              snippet: 'Snippet 2',
              receivedAt: new Date().toISOString(),
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('analyses');
      expect(response.body.analyses).toHaveLength(2);
    });

    it('should handle invalid batch data', async () => {
      const response = await request(app)
        .post('/api/emails/analyze-batch')
        .send({
          emails: [
            {
              emailId: 'email-1',
              // Missing required fields
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /analyses/:userId', () => {
    it('should return recent analyses', async () => {
      const mockAnalyses = [
        { id: 'analysis-1', subject: 'Email 1' },
        { id: 'analysis-2', subject: 'Email 2' },
      ];

      mockEmailService.getRecentAnalyses.mockResolvedValue(mockAnalyses);

      const response = await request(app)
        .get('/api/emails/analyses/test-user-123')
        .query({ limit: '10' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('analyses');
      expect(response.body.analyses).toHaveLength(2);
      expect(mockEmailService.getRecentAnalyses).toHaveBeenCalledWith('test-user-123', 10);
    });

    it('should use default limit when not provided', async () => {
      mockEmailService.getRecentAnalyses.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/emails/analyses/test-user-123');

      expect(response.status).toBe(200);
      expect(mockEmailService.getRecentAnalyses).toHaveBeenCalledWith('test-user-123', 50);
    });

    it('should handle service errors', async () => {
      mockEmailService.getRecentAnalyses.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/emails/analyses/test-user-123');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /analysis/:emailId', () => {
    it('should return analysis for specific email', async () => {
      const mockAnalysis = { id: 'analysis-1', emailId: 'email-1' };
      mockEmailService.getAnalysisByEmailId.mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .get('/api/emails/analysis/email-1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('analysis');
      expect(response.body.analysis.id).toBe('analysis-1');
    });

    it('should return 404 when analysis not found', async () => {
      mockEmailService.getAnalysisByEmailId.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/emails/analysis/nonexistent-email');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Analysis not found');
    });
  });

  describe('GET /urgent/:userId', () => {
    it('should return urgent emails', async () => {
      const mockUrgentEmails = [
        { id: 'urgent-1', priority: 'urgent' },
        { id: 'urgent-2', priority: 'urgent' },
      ];

      (prisma.emailAnalysis.findMany as any).mockResolvedValue(mockUrgentEmails);

      const response = await request(app)
        .get('/api/emails/urgent/test-user-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('urgentEmails');
      expect(response.body.urgentEmails).toHaveLength(2);
      expect(prisma.emailAnalysis.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-123', priority: 'urgent' },
        orderBy: { analyzedAt: 'desc' },
        take: 20,
      });
    });

    it('should handle database errors', async () => {
      (prisma.emailAnalysis.findMany as any).mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/emails/urgent/test-user-123');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /stats/:userId', () => {
    it('should return email statistics', async () => {
      (prisma.emailAnalysis.count as any)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(15)  // urgent
        .mockResolvedValueOnce(25); // actionRequired

      (prisma.emailAnalysis.groupBy as any).mockResolvedValue([
        { category: 'urgent', _count: 15 },
        { category: 'standard', _count: 50 },
        { category: 'admin', _count: 35 },
      ]);

      const response = await request(app)
        .get('/api/emails/stats/test-user-123');

      expect(response.status).toBe(200);
      expect(response.body.stats).toEqual({
        total: 100,
        urgent: 15,
        actionRequired: 25,
        categories: [
          { category: 'urgent', count: 15 },
          { category: 'standard', count: 50 },
          { category: 'admin', count: 35 },
        ],
      });
    });

    it('should handle database errors in stats', async () => {
      (prisma.emailAnalysis.count as any).mockRejectedValue(new Error('Stats error'));

      const response = await request(app)
        .get('/api/emails/stats/test-user-123');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for protected routes', async () => {
      // Mock auth middleware to simulate no user
      vi.doMock('../../middleware/auth.js', () => ({
        authenticateToken: (req: any, res: any, next: any) => {
          req.user = undefined;
          next();
        },
        validateUserOwnership: (req: any, res: any, next: any) => next(),
      }));

      const response = await request(app)
        .post('/api/emails/analyze')
        .send({
          emailId: 'email-1',
          subject: 'Test',
          from: 'test@example.com',
          snippet: 'Test',
          receivedAt: new Date().toISOString(),
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'User not authenticated');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty email arrays', async () => {
      const response = await request(app)
        .post('/api/emails/analyze')
        .send({ emails: [] });

      expect(response.status).toBe(200);
      expect(response.body.data.totalEmails).toBe(0);
      expect(response.body.data.summary.urgentCount).toBe(0);
    });

    it('should handle malformed date strings', async () => {
      const response = await request(app)
        .post('/api/emails/analyze')
        .send({
          emailId: 'email-1',
          subject: 'Test',
          from: 'test@example.com',
          snippet: 'Test',
          receivedAt: 'invalid-date',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
    });

    it('should handle very large batch requests', async () => {
      const largeEmailBatch = Array.from({ length: 100 }, (_, i) => ({
        id: `email-${i}`,
        subject: `Subject ${i}`,
        from: `sender${i}@example.com`,
        snippet: `Snippet ${i}`,
        date: new Date().toISOString(),
      }));

      // Mock successful analysis for large batch
      mockEmailService.analyzeEmail.mockResolvedValue({
        priority: 'medium',
        category: 'standard',
        actionRequired: false,
      });

      const response = await request(app)
        .post('/api/emails/analyze')
        .send({ emails: largeEmailBatch });

      expect(response.status).toBe(200);
      expect(response.body.data.totalEmails).toBe(100);
      expect(mockEmailService.analyzeEmail).toHaveBeenCalledTimes(100);
    });
  });
});