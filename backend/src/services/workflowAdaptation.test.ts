import { describe, it, expect, beforeEach, vi } from 'vitest';
import { workflowAdaptationService } from './workflowAdaptation.js';
import { prisma } from '../test/setup.js';

describe('WorkflowAdaptationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('learnFollowUpTiming', () => {
    it('should create new follow-up timing pattern', async () => {
      const userId = 'test-user-1';
      const customerType = 'business';
      const customerValue = 'high';
      const responseTime = 2; // 2 hours

      // Mock no existing pattern
      vi.mocked(prisma.workflowPattern.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.workflowPattern.create).mockResolvedValue({
        id: 'pattern-1',
        userId,
        patternType: 'follow_up_timing_business_high',
        patternData: JSON.stringify({
          customerType,
          customerValue,
          averageResponseTime: responseTime,
          lastResponseTime: responseTime,
          responses: [responseTime]
        }),
        confidence: 0.2,
        occurrences: 1,
        lastSeen: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await workflowAdaptationService.learnFollowUpTiming(
        userId,
        customerType,
        customerValue,
        responseTime
      );

      expect(prisma.workflowPattern.create).toHaveBeenCalledWith({
        data: {
          userId,
          patternType: 'follow_up_timing_business_high',
          patternData: JSON.stringify({
            customerType,
            customerValue,
            averageResponseTime: responseTime,
            lastResponseTime: responseTime,
            responses: [responseTime]
          }),
          confidence: 0.2,
          occurrences: 1
        }
      });
    });

    it('should update existing follow-up timing pattern', async () => {
      const userId = 'test-user-1';
      const customerType = 'residential';
      const customerValue = 'medium';
      const newResponseTime = 4;

      // Mock existing pattern
      const existingPattern = {
        id: 'pattern-1',
        userId,
        patternType: 'follow_up_timing_residential_medium',
        patternData: JSON.stringify({
          customerType,
          customerValue,
          averageResponseTime: 6,
          lastResponseTime: 6,
          responses: [6, 8, 4]
        }),
        confidence: 0.5,
        occurrences: 3,
        lastSeen: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(prisma.workflowPattern.findUnique).mockResolvedValue(existingPattern);
      vi.mocked(prisma.workflowPattern.update).mockResolvedValue({
        ...existingPattern,
        confidence: 0.6,
        occurrences: 4
      });

      await workflowAdaptationService.learnFollowUpTiming(
        userId,
        customerType,
        customerValue,
        newResponseTime
      );

      // Average should be (6*3 + 4) / 4 = 5.5
      expect(prisma.workflowPattern.update).toHaveBeenCalledWith({
        where: { id: 'pattern-1' },
        data: {
          patternData: expect.stringContaining('5.5'),
          confidence: 0.6,
          occurrences: 4,
          lastSeen: expect.any(Date)
        }
      });
    });
  });

  describe('learnCommunicationTone', () => {
    it('should learn communication tone for business customers', async () => {
      const userId = 'test-user-1';
      const customerContext = {
        type: 'business' as const,
        value: 'high' as const,
        urgency: 'immediate' as const,
        communicationPreference: 'formal' as const
      };
      const messageContent = 'Please provide a comprehensive quote for the electrical installation project.';
      const userFeedback = 'approved' as const;

      vi.mocked(prisma.workflowPattern.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.workflowPattern.create).mockResolvedValue({
        id: 'pattern-1',
        userId,
        patternType: 'communication_tone_business',
        patternData: '{}',
        confidence: 0.3,
        occurrences: 1,
        lastSeen: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await workflowAdaptationService.learnCommunicationTone(
        userId,
        customerContext,
        messageContent,
        userFeedback
      );

      expect(prisma.workflowPattern.create).toHaveBeenCalledWith({
        data: {
          userId,
          patternType: 'communication_tone_business',
          patternData: expect.stringContaining('formal'),
          confidence: 0.3,
          occurrences: 1
        }
      });
    });

    it('should analyze tone correctly from message content', async () => {
      const userId = 'test-user-1';
      const customerContext = {
        type: 'residential' as const,
        value: 'low' as const,
        urgency: 'standard' as const,
        communicationPreference: 'casual' as const
      };
      
      // Test formal message
      const formalMessage = 'Please kindly provide regarding the furthermore therefore specifications';
      vi.mocked(prisma.workflowPattern.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.workflowPattern.create).mockResolvedValue({
        id: 'pattern-1',
        userId,
        patternType: 'communication_tone_residential',
        patternData: '{}',
        confidence: 0.1,
        occurrences: 1,
        lastSeen: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await workflowAdaptationService.learnCommunicationTone(
        userId,
        customerContext,
        formalMessage
      );

      const callArgs = vi.mocked(prisma.workflowPattern.create).mock.calls[0][0];
      const patternData = JSON.parse(callArgs.data.patternData);
      expect(patternData.samples[0].toneProfile.formality).toBe('formal');
    });
  });

  describe('learnTaskBatching', () => {
    it('should learn task batching preferences', async () => {
      const userId = 'test-user-1';
      const taskTypes = ['email', 'quote', 'invoice'];
      const batchSize = 5;
      const timeGap = 15; // 15 minutes

      vi.mocked(prisma.workflowPattern.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.workflowPattern.create).mockResolvedValue({
        id: 'pattern-1',
        userId,
        patternType: 'task_batching_preference',
        patternData: '{}',
        confidence: 0.1,
        occurrences: 1,
        lastSeen: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await workflowAdaptationService.learnTaskBatching(
        userId,
        taskTypes,
        batchSize,
        timeGap
      );

      expect(prisma.workflowPattern.create).toHaveBeenCalledWith({
        data: {
          userId,
          patternType: 'task_batching_preference',
          patternData: expect.stringContaining('5'),
          confidence: 0.1,
          occurrences: 1
        }
      });
    });

    it('should update existing task batching pattern with running averages', async () => {
      const userId = 'test-user-1';
      const taskTypes = ['email', 'calendar'];
      const newBatchSize = 3;
      const newTimeGap = 10;

      // Mock existing pattern
      const existingPattern = {
        id: 'pattern-1',
        userId,
        patternType: 'task_batching_preference',
        patternData: JSON.stringify({
          batches: [
            { taskTypes: ['email'], batchSize: 5, timeGap: 20 },
            { taskTypes: ['quote'], batchSize: 2, timeGap: 5 }
          ],
          preferredBatchSize: 3.5,
          preferredTimeGap: 12.5
        }),
        confidence: 0.3,
        occurrences: 2,
        lastSeen: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(prisma.workflowPattern.findUnique).mockResolvedValue(existingPattern);
      vi.mocked(prisma.workflowPattern.update).mockResolvedValue({
        ...existingPattern,
        confidence: 0.35,
        occurrences: 3
      });

      await workflowAdaptationService.learnTaskBatching(
        userId,
        taskTypes,
        newBatchSize,
        newTimeGap
      );

      expect(prisma.workflowPattern.update).toHaveBeenCalledWith({
        where: { id: 'pattern-1' },
        data: expect.objectContaining({
          confidence: 0.35,
          occurrences: 3
        })
      });
    });
  });

  describe('getWorkflowAdaptations', () => {
    it('should return adaptations with sufficient confidence', async () => {
      const userId = 'test-user-1';

      const mockPatterns = [
        {
          id: 'pattern-1',
          patternType: 'follow_up_timing_business_high',
          patternData: JSON.stringify({
            customerType: 'business',
            customerValue: 'high',
            averageResponseTime: 2
          }),
          confidence: 0.8,
          occurrences: 10
        },
        {
          id: 'pattern-2', 
          patternType: 'communication_tone_residential',
          patternData: JSON.stringify({
            customerType: 'residential',
            preferredTone: { formality: 'casual', technicality: 'accessible' }
          }),
          confidence: 0.5,
          occurrences: 5
        },
        {
          id: 'pattern-3',
          patternType: 'task_batching_preference',
          patternData: JSON.stringify({
            preferredBatchSize: 4,
            preferredTimeGap: 15
          }),
          confidence: 0.2, // Too low confidence
          occurrences: 2
        }
      ];

      vi.mocked(prisma.workflowPattern.findMany).mockResolvedValue(mockPatterns);

      const adaptations = await workflowAdaptationService.getWorkflowAdaptations(userId);

      expect(adaptations).toHaveLength(2); // Only patterns with confidence >= 0.3
      
      const adaptationTypes = adaptations.map(a => a.type);
      expect(adaptationTypes).toContain('follow_up_timing');
      expect(adaptationTypes).toContain('communication_tone');
      expect(adaptationTypes).not.toContain('task_batching');

      // Check specific adaptation content
      const followUpAdaptation = adaptations.find(a => a.type === 'follow_up_timing');
      expect(followUpAdaptation?.confidence).toBe(0.8);
      expect(followUpAdaptation?.recommendation).toContain('high-value business');
      expect(followUpAdaptation?.recommendation).toContain('2 hours');
    });

    it('should handle empty results gracefully', async () => {
      const userId = 'test-user-1';

      vi.mocked(prisma.workflowPattern.findMany).mockResolvedValue([]);

      const adaptations = await workflowAdaptationService.getWorkflowAdaptations(userId);

      expect(adaptations).toHaveLength(0);
    });
  });

  describe('applyWorkflowAdaptation', () => {
    it('should apply follow-up timing adaptation', async () => {
      const userId = 'test-user-1';
      const adaptationType = 'follow_up_timing_business_high';

      const mockPattern = {
        id: 'pattern-1',
        patternType: adaptationType,
        patternData: JSON.stringify({
          averageResponseTime: 1.5
        }),
        confidence: 0.7,
        occurrences: 8
      };

      vi.mocked(prisma.workflowPattern.findUnique).mockResolvedValue(mockPattern);

      const result = await workflowAdaptationService.applyWorkflowAdaptation(
        userId,
        adaptationType,
        {}
      );

      expect(result).toEqual({
        recommendedFollowUpTime: 1.5,
        urgency: 'high'
      });
    });

    it('should apply communication tone adaptation', async () => {
      const userId = 'test-user-1';
      const adaptationType = 'communication_tone_business';

      const mockPattern = {
        id: 'pattern-1',
        patternType: adaptationType,
        patternData: JSON.stringify({
          preferredTone: { formality: 'formal' }
        }),
        confidence: 0.6,
        occurrences: 5
      };

      vi.mocked(prisma.workflowPattern.findUnique).mockResolvedValue(mockPattern);

      const result = await workflowAdaptationService.applyWorkflowAdaptation(
        userId,
        adaptationType,
        {}
      );

      expect(result).toEqual({
        tone: 'formal',
        vocabulary: 'professional',
        structure: 'structured'
      });
    });

    it('should return null for low confidence patterns', async () => {
      const userId = 'test-user-1';
      const adaptationType = 'follow_up_timing_residential_low';

      const mockPattern = {
        id: 'pattern-1',
        patternType: adaptationType,
        patternData: '{}',
        confidence: 0.2, // Below threshold
        occurrences: 2
      };

      vi.mocked(prisma.workflowPattern.findUnique).mockResolvedValue(mockPattern);

      const result = await workflowAdaptationService.applyWorkflowAdaptation(
        userId,
        adaptationType,
        {}
      );

      expect(result).toBeNull();
    });
  });

  describe('updatePatternConfidence', () => {
    it('should increase confidence for positive feedback', async () => {
      const userId = 'test-user-1';
      const patternType = 'follow_up_timing_business_high';

      const mockPattern = {
        id: 'pattern-1',
        confidence: 0.5
      };

      vi.mocked(prisma.workflowPattern.findUnique).mockResolvedValue(mockPattern);
      vi.mocked(prisma.workflowPattern.update).mockResolvedValue({
        ...mockPattern,
        confidence: 0.6
      });

      await workflowAdaptationService.updatePatternConfidence(
        userId,
        patternType,
        'positive'
      );

      expect(prisma.workflowPattern.update).toHaveBeenCalledWith({
        where: { id: 'pattern-1' },
        data: {
          confidence: 0.6,
          isActive: true,
          lastSeen: expect.any(Date)
        }
      });
    });

    it('should decrease confidence for negative feedback', async () => {
      const userId = 'test-user-1';
      const patternType = 'communication_tone_residential';

      const mockPattern = {
        id: 'pattern-1',
        confidence: 0.4
      };

      vi.mocked(prisma.workflowPattern.findUnique).mockResolvedValue(mockPattern);
      vi.mocked(prisma.workflowPattern.update).mockResolvedValue({
        ...mockPattern,
        confidence: 0.2
      });

      await workflowAdaptationService.updatePatternConfidence(
        userId,
        patternType,
        'negative'
      );

      expect(prisma.workflowPattern.update).toHaveBeenCalledWith({
        where: { id: 'pattern-1' },
        data: {
          confidence: 0.2,
          isActive: true,
          lastSeen: expect.any(Date)
        }
      });
    });

    it('should deactivate patterns with very low confidence', async () => {
      const userId = 'test-user-1';
      const patternType = 'task_batching_preference';

      const mockPattern = {
        id: 'pattern-1',
        confidence: 0.2
      };

      vi.mocked(prisma.workflowPattern.findUnique).mockResolvedValue(mockPattern);
      vi.mocked(prisma.workflowPattern.update).mockResolvedValue({
        ...mockPattern,
        confidence: 0.0,
        isActive: false
      });

      await workflowAdaptationService.updatePatternConfidence(
        userId,
        patternType,
        'negative'
      );

      expect(prisma.workflowPattern.update).toHaveBeenCalledWith({
        where: { id: 'pattern-1' },
        data: {
          confidence: 0.0,
          isActive: false,
          lastSeen: expect.any(Date)
        }
      });
    });
  });
});