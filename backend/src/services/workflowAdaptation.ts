import { prisma } from '../db/index.js';
import { logger } from '../utils/logger.js';



export interface WorkflowPattern {
  patternType: string;
  patternData: any;
  confidence: number;
  occurrences: number;
}

export interface WorkflowAdaptation {
  type: 'follow_up_timing' | 'communication_tone' | 'task_batching' | 'priority_weighting';
  recommendation: string;
  confidence: number;
  data: any;
}

export interface CustomerContext {
  type: 'business' | 'residential';
  value: 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'standard' | 'flexible';
  communicationPreference: 'formal' | 'casual' | 'technical';
}

class WorkflowAdaptationService {
  /**
   * Learn follow-up timing preferences based on customer value
   */
  async learnFollowUpTiming(
    userId: string,
    customerType: 'business' | 'residential',
    customerValue: 'high' | 'medium' | 'low',
    responseTime: number // in hours
  ): Promise<void> {
    const patternType = `follow_up_timing_${customerType}_${customerValue}`;
    
    try {
      const existing = await prisma.workflowPattern.findUnique({
        where: {
          userId_patternType: {
            userId,
            patternType
          }
        }
      });

      if (existing) {
        // Update existing pattern
        const currentData = JSON.parse(existing.patternData);
        const newAverage = (currentData.averageResponseTime * existing.occurrences + responseTime) / (existing.occurrences + 1);
        
        await prisma.workflowPattern.update({
          where: { id: existing.id },
          data: {
            patternData: JSON.stringify({
              ...currentData,
              averageResponseTime: newAverage,
              lastResponseTime: responseTime,
              responses: [...(currentData.responses || []).slice(-9), responseTime] // Keep last 10
            }),
            confidence: Math.min(existing.confidence + 0.1, 1.0),
            occurrences: existing.occurrences + 1,
            lastSeen: new Date()
          }
        });
      } else {
        // Create new pattern
        await prisma.workflowPattern.create({
          data: {
            userId,
            patternType,
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
      }

      logger.info(`Follow-up timing pattern learned for user ${userId}:`, {
        customerType,
        customerValue,
        responseTime
      });

    } catch (error) {
      logger.error('Failed to learn follow-up timing:', error);
    }
  }

  /**
   * Learn communication tone preferences by customer type
   */
  async learnCommunicationTone(
    userId: string,
    customerContext: CustomerContext,
    messageContent: string,
    userFeedback?: 'approved' | 'modified' | 'rejected'
  ): Promise<void> {
    const patternType = `communication_tone_${customerContext.type}`;
    
    try {
      const toneAnalysis = this.analyzeTone(messageContent);
      
      const existing = await prisma.workflowPattern.findUnique({
        where: {
          userId_patternType: {
            userId,
            patternType
          }
        }
      });

      const newData = {
        customerType: customerContext.type,
        toneProfile: toneAnalysis,
        feedback: userFeedback,
        timestamp: new Date()
      };

      if (existing) {
        const currentData = JSON.parse(existing.patternData);
        const samples = [...(currentData.samples || []).slice(-19), newData]; // Keep last 20
        
        await prisma.workflowPattern.update({
          where: { id: existing.id },
          data: {
            patternData: JSON.stringify({
              ...currentData,
              samples,
              preferredTone: this.calculatePreferredTone(samples)
            }),
            confidence: this.calculateConfidence(samples, userFeedback),
            occurrences: existing.occurrences + 1,
            lastSeen: new Date()
          }
        });
      } else {
        await prisma.workflowPattern.create({
          data: {
            userId,
            patternType,
            patternData: JSON.stringify({
              customerType: customerContext.type,
              samples: [newData],
              preferredTone: toneAnalysis
            }),
            confidence: userFeedback === 'approved' ? 0.3 : 0.1,
            occurrences: 1
          }
        });
      }

    } catch (error) {
      logger.error('Failed to learn communication tone:', error);
    }
  }

  /**
   * Learn task batching preferences based on user behavior
   */
  async learnTaskBatching(
    userId: string,
    taskTypes: string[],
    batchSize: number,
    timeGap: number // minutes between tasks
  ): Promise<void> {
    const patternType = 'task_batching_preference';
    
    try {
      const existing = await prisma.workflowPattern.findUnique({
        where: {
          userId_patternType: {
            userId,
            patternType
          }
        }
      });

      const newBatch = {
        taskTypes,
        batchSize,
        timeGap,
        timestamp: new Date()
      };

      if (existing) {
        const currentData = JSON.parse(existing.patternData);
        const batches = [...(currentData.batches || []).slice(-14), newBatch]; // Keep last 15
        
        await prisma.workflowPattern.update({
          where: { id: existing.id },
          data: {
            patternData: JSON.stringify({
              ...currentData,
              batches,
              preferredBatchSize: this.calculatePreferredBatchSize(batches),
              preferredTimeGap: this.calculatePreferredTimeGap(batches)
            }),
            confidence: Math.min(existing.confidence + 0.05, 0.9),
            occurrences: existing.occurrences + 1,
            lastSeen: new Date()
          }
        });
      } else {
        await prisma.workflowPattern.create({
          data: {
            userId,
            patternType,
            patternData: JSON.stringify({
              batches: [newBatch],
              preferredBatchSize: batchSize,
              preferredTimeGap: timeGap
            }),
            confidence: 0.1,
            occurrences: 1
          }
        });
      }

    } catch (error) {
      logger.error('Failed to learn task batching:', error);
    }
  }

  /**
   * Get workflow adaptations for a user
   */
  async getWorkflowAdaptations(userId: string): Promise<WorkflowAdaptation[]> {
    const adaptations: WorkflowAdaptation[] = [];

    try {
      const patterns = await prisma.workflowPattern.findMany({
        where: {
          userId,
          isActive: true,
          confidence: { gte: 0.3 } // Only use patterns with reasonable confidence
        }
      });

      for (const pattern of patterns) {
        const data = JSON.parse(pattern.patternData);
        
        if (pattern.patternType.startsWith('follow_up_timing_')) {
          adaptations.push({
            type: 'follow_up_timing',
            recommendation: this.generateFollowUpRecommendation(pattern.patternType, data),
            confidence: pattern.confidence,
            data: {
              customerType: data.customerType,
              customerValue: data.customerValue,
              averageResponseTime: data.averageResponseTime
            }
          });
        }

        if (pattern.patternType.startsWith('communication_tone_')) {
          adaptations.push({
            type: 'communication_tone',
            recommendation: this.generateToneRecommendation(data),
            confidence: pattern.confidence,
            data: {
              customerType: data.customerType,
              preferredTone: data.preferredTone
            }
          });
        }

        if (pattern.patternType === 'task_batching_preference') {
          adaptations.push({
            type: 'task_batching',
            recommendation: this.generateBatchingRecommendation(data),
            confidence: pattern.confidence,
            data: {
              preferredBatchSize: data.preferredBatchSize,
              preferredTimeGap: data.preferredTimeGap
            }
          });
        }
      }

    } catch (error) {
      logger.error('Failed to get workflow adaptations:', error);
    }

    return adaptations;
  }

  /**
   * Apply workflow adaptation to a specific context
   */
  async applyWorkflowAdaptation(
    userId: string,
    adaptationType: string,
    context: any
  ): Promise<any> {
    try {
      const pattern = await prisma.workflowPattern.findUnique({
        where: {
          userId_patternType: {
            userId,
            patternType: adaptationType
          }
        }
      });

      if (!pattern || pattern.confidence < 0.3) {
        return null; // Not enough confidence to apply adaptation
      }

      const data = JSON.parse(pattern.patternData);

      switch (adaptationType) {
        case 'follow_up_timing_business_high':
          return {
            recommendedFollowUpTime: Math.min(data.averageResponseTime, 2), // Max 2 hours for high-value business
            urgency: 'high'
          };

        case 'follow_up_timing_residential_medium':
          return {
            recommendedFollowUpTime: data.averageResponseTime || 24, // Default 24 hours
            urgency: 'medium'
          };

        case 'communication_tone_business':
          return {
            tone: data.preferredTone?.formality || 'formal',
            vocabulary: 'professional',
            structure: 'structured'
          };

        case 'communication_tone_residential':
          return {
            tone: data.preferredTone?.formality || 'casual',
            vocabulary: 'accessible',
            structure: 'conversational'
          };

        default:
          return null;
      }

    } catch (error) {
      logger.error('Failed to apply workflow adaptation:', error);
      return null;
    }
  }

  /**
   * Update workflow pattern confidence based on user feedback
   */
  async updatePatternConfidence(
    userId: string,
    patternType: string,
    feedback: 'positive' | 'negative' | 'neutral'
  ): Promise<void> {
    try {
      const pattern = await prisma.workflowPattern.findUnique({
        where: {
          userId_patternType: {
            userId,
            patternType
          }
        }
      });

      if (!pattern) return;

      let confidenceDelta = 0;
      switch (feedback) {
        case 'positive':
          confidenceDelta = 0.1;
          break;
        case 'negative':
          confidenceDelta = -0.2;
          break;
        case 'neutral':
          confidenceDelta = -0.05;
          break;
      }

      const newConfidence = Math.max(0, Math.min(1, pattern.confidence + confidenceDelta));

      await prisma.workflowPattern.update({
        where: { id: pattern.id },
        data: {
          confidence: newConfidence,
          isActive: newConfidence > 0.1, // Deactivate if confidence gets too low
          lastSeen: new Date()
        }
      });

      logger.info(`Pattern confidence updated:`, {
        userId,
        patternType,
        feedback,
        oldConfidence: pattern.confidence,
        newConfidence
      });

    } catch (error) {
      logger.error('Failed to update pattern confidence:', error);
    }
  }

  // Private helper methods

  private analyzeTone(content: string): any {
    const words = content.toLowerCase().split(/\s+/);
    
    const formalWords = ['please', 'kindly', 'regarding', 'furthermore', 'therefore'];
    const casualWords = ['hey', 'thanks', 'great', 'awesome', 'cool'];
    const technicalWords = ['specification', 'compliance', 'regulation', 'standard', 'certification'];

    const formalCount = words.filter(word => formalWords.includes(word)).length;
    const casualCount = words.filter(word => casualWords.includes(word)).length;
    const technicalCount = words.filter(word => technicalWords.includes(word)).length;

    return {
      formality: formalCount > casualCount ? 'formal' : 'casual',
      technicality: technicalCount / words.length > 0.05 ? 'technical' : 'accessible',
      length: content.length,
      wordCount: words.length
    };
  }

  private calculatePreferredTone(samples: any[]): any {
    const approvedSamples = samples.filter(s => s.feedback === 'approved');
    
    if (approvedSamples.length === 0) {
      return samples[0]?.toneProfile || { formality: 'casual', technicality: 'accessible' };
    }

    const formalityVotes = approvedSamples.map(s => s.toneProfile.formality);
    const technicality = approvedSamples.map(s => s.toneProfile.technicality);

    return {
      formality: this.getMostFrequent(formalityVotes),
      technicality: this.getMostFrequent(technicality)
    };
  }

  private calculateConfidence(samples: any[], feedback?: string): number {
    const approvedCount = samples.filter(s => s.feedback === 'approved').length;
    const rejectedCount = samples.filter(s => s.feedback === 'rejected').length;
    const total = samples.length;

    let baseConfidence = (approvedCount - rejectedCount * 2) / total;
    baseConfidence = Math.max(0, Math.min(1, baseConfidence));

    // Boost confidence for positive recent feedback
    if (feedback === 'approved') {
      baseConfidence += 0.1;
    } else if (feedback === 'rejected') {
      baseConfidence -= 0.2;
    }

    return Math.max(0, Math.min(1, baseConfidence));
  }

  private calculatePreferredBatchSize(batches: any[]): number {
    const sizes = batches.map(b => b.batchSize);
    return Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length);
  }

  private calculatePreferredTimeGap(batches: any[]): number {
    const gaps = batches.map(b => b.timeGap);
    return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  }

  private getMostFrequent(arr: string[]): string {
    const frequency = arr.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );
  }

  private generateFollowUpRecommendation(patternType: string, data: any): string {
    const [, , customerType, customerValue] = patternType.split('_');
    const hours = Math.round(data.averageResponseTime);
    
    return `For ${customerValue}-value ${customerType} customers, follow up within ${hours} hours based on your historical response patterns.`;
  }

  private generateToneRecommendation(data: any): string {
    const tone = data.preferredTone;
    return `Use ${tone.formality} language with ${tone.technicality} vocabulary for ${data.customerType} customers.`;
  }

  private generateBatchingRecommendation(data: any): string {
    return `Process tasks in batches of ${data.preferredBatchSize} with ${data.preferredTimeGap} minute intervals.`;
  }
}

export const workflowAdaptationService = new WorkflowAdaptationService();