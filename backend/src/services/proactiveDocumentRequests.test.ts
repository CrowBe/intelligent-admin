import { describe, it, expect, beforeEach, vi } from 'vitest';
import { proactiveDocumentRequestsService } from './proactiveDocumentRequests.js';
import { prisma } from '../test/setup.js';

// Mock Prisma
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    document: {
      count: vi.fn(),
      findMany: vi.fn()
    },
    message: {
      findMany: vi.fn()
    },
    user: {
      findUnique: vi.fn()
    },
    industryKnowledge: {
      findMany: vi.fn()
    }
  }))
}));

describe('ProactiveDocumentRequestsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeMessageForDocumentRequests', () => {
    it('should suggest electrical safety documents for electrical work', async () => {
      const userId = 'test-user-1';
      const messageContent = 'I need to do some electrical wiring work at a commercial site';

      // Mock that user doesn't have recent documents
      vi.mocked(prisma.document.count).mockResolvedValue(0);

      const suggestions = await proactiveDocumentRequestsService.analyzeMessageForDocumentRequests(
        userId,
        messageContent
      );

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].type).toBe('electrical_certificate');
      expect(suggestions[0].priority).toBe('high');
      expect(suggestions[0].keywords).toContain('electrical');
      expect(suggestions[0].keywords).toContain('wiring');
      expect(suggestions[0].message).toContain('electrical safety certificates');
    });

    it('should suggest quote documents when pricing is discussed', async () => {
      const userId = 'test-user-1';
      const messageContent = 'Customer is asking for a quote and estimate for this job';

      vi.mocked(prisma.document.count).mockResolvedValue(0);

      const suggestions = await proactiveDocumentRequestsService.analyzeMessageForDocumentRequests(
        userId,
        messageContent
      );

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].type).toBe('quote');
      expect(suggestions[0].priority).toBe('medium');
      expect(suggestions[0].keywords).toContain('quote');
      expect(suggestions[0].keywords).toContain('estimate');
      expect(suggestions[0].message).toContain('price lists');
    });

    it('should suggest safety documents for safety-related discussions', async () => {
      const userId = 'test-user-1';
      const messageContent = 'We need to ensure WHS safety compliance and risk assessment';

      vi.mocked(prisma.document.count).mockResolvedValue(0);

      const suggestions = await proactiveDocumentRequestsService.analyzeMessageForDocumentRequests(
        userId,
        messageContent
      );

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].type).toBe('safety_document');
      expect(suggestions[0].priority).toBe('high');
      expect(suggestions[0].keywords).toContain('safety');
      expect(suggestions[0].keywords).toContain('risk assessment');
      expect(suggestions[0].message).toContain('Safety documentation');
    });

    it('should suggest multiple document types for complex messages', async () => {
      const userId = 'test-user-1';
      const messageContent = 'Emergency electrical work needed, please send quote and ensure safety compliance';

      vi.mocked(prisma.document.count).mockResolvedValue(0);

      const suggestions = await proactiveDocumentRequestsService.analyzeMessageForDocumentRequests(
        userId,
        messageContent
      );

      expect(suggestions.length).toBeGreaterThan(1);
      
      const suggestionTypes = suggestions.map(s => s.type);
      expect(suggestionTypes).toContain('electrical_certificate');
      expect(suggestionTypes).toContain('quote');
      expect(suggestionTypes).toContain('safety_document');
      
      // Emergency should suggest photo upload
      expect(suggestionTypes).toContain('photo');
    });

    it('should not suggest documents if user has recent ones', async () => {
      const userId = 'test-user-1';
      const messageContent = 'Electrical work needed';

      // Mock that user has recent documents
      vi.mocked(prisma.document.count).mockResolvedValue(3);

      const suggestions = await proactiveDocumentRequestsService.analyzeMessageForDocumentRequests(
        userId,
        messageContent
      );

      expect(suggestions).toHaveLength(0);
    });

    it('should not suggest documents for non-matching content', async () => {
      const userId = 'test-user-1';
      const messageContent = 'Hello, how are you today?';

      const suggestions = await proactiveDocumentRequestsService.analyzeMessageForDocumentRequests(
        userId,
        messageContent
      );

      expect(suggestions).toHaveLength(0);
    });
  });

  describe('analyzeSessionForDocumentNeeds', () => {
    it('should analyze multiple messages from a session', async () => {
      const userId = 'test-user-1';
      const sessionId = 'test-session-1';

      // Mock session messages
      vi.mocked(prisma.message.findMany).mockResolvedValue([
        {
          content: 'I have electrical work coming up',
          role: 'user',
          timestamp: new Date()
        },
        {
          content: 'Customer wants a quote for switchboard upgrade',
          role: 'user',
          timestamp: new Date()
        }
      ]);

      vi.mocked(prisma.document.count).mockResolvedValue(0);

      const suggestions = await proactiveDocumentRequestsService.analyzeSessionForDocumentNeeds(
        userId,
        sessionId
      );

      expect(suggestions.length).toBeGreaterThan(0);
      
      const suggestionTypes = suggestions.map(s => s.type);
      expect(suggestionTypes).toContain('electrical_certificate');
      expect(suggestionTypes).toContain('quote');
    });
  });

  describe('generateSmartPrompts', () => {
    it('should generate context-specific prompts for new jobs', async () => {
      const userId = 'test-user-1';
      
      // Mock recent documents
      vi.mocked(prisma.document.findMany).mockResolvedValue([
        { category: 'invoice', title: 'Invoice #123', uploadedAt: new Date() }
      ]);

      const prompts = await proactiveDocumentRequestsService.generateSmartPrompts(
        userId,
        'new_job'
      );

      expect(prompts).toContain('Have you prepared a quote for this job? Upload it so I can track the project progress.');
      expect(prompts).toContain("Don't forget to upload your safety assessment and WHS documentation for this job site.");
    });

    it('should generate prompts for job completion context', async () => {
      const userId = 'test-user-1';
      
      vi.mocked(prisma.document.findMany).mockResolvedValue([]);

      const prompts = await proactiveDocumentRequestsService.generateSmartPrompts(
        userId,
        'job_completion'
      );

      expect(prompts).toContain('Remember to upload completion certificates and test results for compliance records.');
      expect(prompts).toContain("Upload 'after' photos of the completed work for your portfolio and warranty records.");
    });

    it('should generate prompts for financial review context', async () => {
      const userId = 'test-user-1';
      
      vi.mocked(prisma.document.findMany).mockResolvedValue([]);

      const prompts = await proactiveDocumentRequestsService.generateSmartPrompts(
        userId,
        'financial_review'
      );

      expect(prompts).toContain('Upload recent invoices so I can help track your cash flow and outstanding payments.');
      expect(prompts).toContain("Don't forget to upload material receipts for accurate job costing and tax records.");
    });
  });

  describe('trackDocumentRequestOutcome', () => {
    it('should track when documents are uploaded', async () => {
      const userId = 'test-user-1';
      const suggestionType = 'electrical_certificate';
      const documentId = 'doc-123';

      // Mock successful preference update
      vi.mocked(prisma.userPreference.upsert).mockResolvedValue({
        id: 'pref-1',
        userId,
        preferenceType: 'document_suggestions_electrical_certificate',
        preferenceData: '{"action":"increase_relevance","updatedAt":"2024-01-01T00:00:00.000Z"}',
        confidence: 0.8,
        learnedAt: new Date(),
        lastAppliedAt: new Date(),
        updatedAt: new Date()
      });

      await expect(
        proactiveDocumentRequestsService.trackDocumentRequestOutcome(
          userId,
          suggestionType,
          'uploaded',
          documentId
        )
      ).resolves.not.toThrow();

      expect(prisma.userPreference.upsert).toHaveBeenCalledWith({
        where: {
          userId_preferenceType: {
            userId,
            preferenceType: 'document_suggestions_electrical_certificate'
          }
        },
        update: expect.objectContaining({
          confidence: 0.8
        }),
        create: expect.objectContaining({
          userId,
          preferenceType: 'document_suggestions_electrical_certificate',
          confidence: 0.8
        })
      });
    });

    it('should track when suggestions are dismissed', async () => {
      const userId = 'test-user-1';
      const suggestionType = 'quote';

      vi.mocked(prisma.userPreference.upsert).mockResolvedValue({
        id: 'pref-1',
        userId,
        preferenceType: 'document_suggestions_quote',
        preferenceData: '{"action":"reduce_frequency","updatedAt":"2024-01-01T00:00:00.000Z"}',
        confidence: 0.3,
        learnedAt: new Date(),
        lastAppliedAt: new Date(),
        updatedAt: new Date()
      });

      await proactiveDocumentRequestsService.trackDocumentRequestOutcome(
        userId,
        suggestionType,
        'dismissed'
      );

      expect(prisma.userPreference.upsert).toHaveBeenCalledWith({
        where: {
          userId_preferenceType: {
            userId,
            preferenceType: 'document_suggestions_quote'
          }
        },
        update: expect.objectContaining({
          confidence: 0.3
        }),
        create: expect.objectContaining({
          confidence: 0.3
        })
      });
    });
  });
});