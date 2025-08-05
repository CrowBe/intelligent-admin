import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Business Context Learning Service
 * Learns and adapts to user business patterns and preferences
 */

export interface BusinessProfile {
  businessName?: string;
  businessType?: string;
  serviceCategories: string[];
  communicationTone: 'professional' | 'friendly' | 'casual';
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  customerTypes: string[];
  averageJobValue?: number;
  followUpPreferences: {
    timing: 'immediate' | 'same_day' | 'next_day' | 'weekly';
    method: 'email' | 'phone' | 'both';
  };
}

export interface UserPreference {
  type: string;
  data: any;
  confidence: number;
  lastUpdated: Date;
}

export interface WorkflowPattern {
  type: string;
  pattern: any;
  confidence: number;
  occurrences: number;
  lastSeen: Date;
}

class BusinessContextService {
  private static instance: BusinessContextService;

  private constructor() {}

  public static getInstance(): BusinessContextService {
    if (!BusinessContextService.instance) {
      BusinessContextService.instance = new BusinessContextService();
    }
    return BusinessContextService.instance;
  }

  /**
   * Learn from user interaction patterns
   */
  async learnFromInteraction(
    userId: string,
    interactionType: string,
    interactionData: Record<string, any>
  ): Promise<void> {
    try {
      switch (interactionType) {
        case 'email_response_timing':
          await this.learnResponseTiming(userId, interactionData as { responseTime: number; emailPriority: string; customerType?: string });
          break;
        case 'communication_tone':
          await this.learnCommunicationTone(userId, interactionData as { tone: string; context: string; feedback?: 'positive' | 'negative' });
          break;
        case 'customer_categorization':
          await this.learnCustomerTypes(userId, interactionData as { customerIdentifiers: string[]; category: string; jobValue?: number });
          break;
        case 'job_value_estimation':
          await this.learnJobValues(userId, interactionData as { jobDescription: string; estimatedValue: number; actualValue?: number });
          break;
        default:
          logger.warn(`Unknown interaction type: ${interactionType}`);
      }
    } catch (error) {
      logger.error('Error learning from interaction:', error);
    }
  }

  /**
   * Learn user's preferred response timing patterns
   */
  private async learnResponseTiming(
    userId: string,
    data: { responseTime: number; emailPriority: string; customerType?: string }
  ): Promise<void> {
    const patternType = 'response_timing';
    const patternKey = `${data.emailPriority}_${data.customerType || 'general'}`;

    // Get existing pattern
    const existingPattern = await prisma.workflowPattern.findUnique({
      where: {
        userId_patternType: {
          userId,
          patternType: `${patternType}_${patternKey}`
        }
      }
    });

    if (existingPattern) {
      // Update existing pattern
      const currentData = JSON.parse(existingPattern.patternData);
      const newAverageTime = (currentData.averageResponseTime * existingPattern.occurrences + data.responseTime) / (existingPattern.occurrences + 1);
      
      await prisma.workflowPattern.update({
        where: { id: existingPattern.id },
        data: {
          patternData: JSON.stringify({
            ...currentData,
            averageResponseTime: newAverageTime,
            lastResponseTime: data.responseTime
          }),
          occurrences: existingPattern.occurrences + 1,
          confidence: Math.min(existingPattern.confidence + 0.1, 1.0),
          lastSeen: new Date()
        }
      });
    } else {
      // Create new pattern
      await prisma.workflowPattern.create({
        data: {
          userId,
          patternType: `${patternType}_${patternKey}`,
          patternData: JSON.stringify({
            emailPriority: data.emailPriority,
            customerType: data.customerType,
            averageResponseTime: data.responseTime,
            lastResponseTime: data.responseTime
          }),
          confidence: 0.3,
          occurrences: 1,
          lastSeen: new Date()
        }
      });
    }

    logger.info(`Learned response timing pattern for user ${userId}: ${patternKey}`);
  }

  /**
   * Learn user's communication tone preferences
   */
  private async learnCommunicationTone(
    userId: string,
    data: { tone: string; context: string; feedback?: 'positive' | 'negative' }
  ): Promise<void> {
    const preferenceType = 'communication_tone';

    // Get existing preference
    const existingPreference = await prisma.userPreference.findUnique({
      where: {
        userId_preferenceType: {
          userId,
          preferenceType
        }
      }
    });

    if (existingPreference) {
      const currentData = JSON.parse(existingPreference.preferenceData);
      const toneCount = currentData.toneFrequency[data.tone] || 0;
      
      await prisma.userPreference.update({
        where: { id: existingPreference.id },
        data: {
          preferenceData: JSON.stringify({
            ...currentData,
            toneFrequency: {
              ...currentData.toneFrequency,
              [data.tone]: toneCount + 1
            },
            lastTone: data.tone,
            lastContext: data.context
          }),
          confidence: data.feedback === 'positive' ? 
            Math.min(existingPreference.confidence + 0.2, 1.0) :
            Math.max(existingPreference.confidence - 0.1, 0.1)
        }
      });
    } else {
      await prisma.userPreference.create({
        data: {
          userId,
          preferenceType,
          preferenceData: JSON.stringify({
            toneFrequency: { [data.tone]: 1 },
            lastTone: data.tone,
            lastContext: data.context
          }),
          confidence: 0.5
        }
      });
    }
  }

  /**
   * Learn customer categorization patterns
   */
  private async learnCustomerTypes(
    userId: string,
    data: { customerIdentifiers: string[]; category: string; jobValue?: number }
  ): Promise<void> {
    const patternType = 'customer_categorization';

    for (const identifier of data.customerIdentifiers) {
      const patternKey = identifier.toLowerCase();
      
      const existingPattern = await prisma.workflowPattern.findUnique({
        where: {
          userId_patternType: {
            userId,
            patternType: `${patternType}_${patternKey}`
          }
        }
      });

      if (existingPattern) {
        await prisma.workflowPattern.update({
          where: { id: existingPattern.id },
          data: {
            occurrences: existingPattern.occurrences + 1,
            confidence: Math.min(existingPattern.confidence + 0.1, 1.0),
            lastSeen: new Date()
          }
        });
      } else {
        await prisma.workflowPattern.create({
          data: {
            userId,
            patternType: `${patternType}_${patternKey}`,
            patternData: JSON.stringify({
              identifier: identifier,
              category: data.category,
              averageJobValue: data.jobValue
            }),
            confidence: 0.4,
            occurrences: 1,
            lastSeen: new Date()
          }
        });
      }
    }
  }

  /**
   * Learn job value estimation patterns
   */
  private async learnJobValues(
    userId: string,
    data: { jobDescription: string; estimatedValue: number; actualValue?: number }
  ): Promise<void> {
    // Extract keywords from job description
    const keywords = this.extractJobKeywords(data.jobDescription);
    
    for (const keyword of keywords) {
      const patternType = 'job_value_estimation';
      const patternKey = keyword.toLowerCase();
      
      const existingPattern = await prisma.workflowPattern.findUnique({
        where: {
          userId_patternType: {
            userId,
            patternType: `${patternType}_${patternKey}`
          }
        }
      });

      if (existingPattern) {
        const currentData = JSON.parse(existingPattern.patternData);
        const newAverageValue = (currentData.averageValue * existingPattern.occurrences + data.estimatedValue) / (existingPattern.occurrences + 1);
        
        await prisma.workflowPattern.update({
          where: { id: existingPattern.id },
          data: {
            patternData: JSON.stringify({
              ...currentData,
              averageValue: newAverageValue,
              lastValue: data.estimatedValue,
              actualValue: data.actualValue
            }),
            occurrences: existingPattern.occurrences + 1,
            confidence: data.actualValue ? 
              Math.min(existingPattern.confidence + 0.2, 1.0) :
              Math.min(existingPattern.confidence + 0.05, 1.0),
            lastSeen: new Date()
          }
        });
      } else {
        await prisma.workflowPattern.create({
          data: {
            userId,
            patternType: `${patternType}_${patternKey}`,
            patternData: JSON.stringify({
              keyword,
              averageValue: data.estimatedValue,
              lastValue: data.estimatedValue,
              actualValue: data.actualValue
            }),
            confidence: 0.3,
            occurrences: 1,
            lastSeen: new Date()
          }
        });
      }
    }
  }

  /**
   * Get user's business profile
   */
  async getBusinessProfile(userId: string): Promise<BusinessProfile> {
    try {
      // Get user preferences
      const preferences = await prisma.userPreference.findMany({
        where: { userId }
      });

      // Get workflow patterns
      const patterns = await prisma.workflowPattern.findMany({
        where: { 
          userId,
          isActive: true,
          confidence: { gte: 0.3 }
        },
        orderBy: { confidence: 'desc' }
      });

      // Build business profile from learned data
      const profile: BusinessProfile = {
        serviceCategories: [],
        communicationTone: 'professional',
        workingHours: {
          start: '08:00',
          end: '17:00',
          timezone: 'Australia/Sydney'
        },
        customerTypes: [],
        followUpPreferences: {
          timing: 'same_day',
          method: 'email'
        }
      };

      // Extract communication tone preference
      const tonePreference = preferences.find(p => p.preferenceType === 'communication_tone');
      if (tonePreference) {
        const toneData = JSON.parse(tonePreference.preferenceData);
        const mostUsedTone = Object.entries(toneData.toneFrequency)
          .sort(([,a], [,b]) => (b as number) - (a as number))[0];
        if (mostUsedTone) {
          profile.communicationTone = mostUsedTone[0] as BusinessProfile['communicationTone'];
        }
      }

      // Extract customer types from patterns
      const customerPatterns = patterns.filter(p => p.patternType.startsWith('customer_categorization_'));
      profile.customerTypes = customerPatterns.map(p => {
        const data = JSON.parse(p.patternData);
        return data.category;
      }).filter((value, index, self) => self.indexOf(value) === index);

      // Calculate average job value
      const jobValuePatterns = patterns.filter(p => p.patternType.startsWith('job_value_estimation_'));
      if (jobValuePatterns.length > 0) {
        const totalValue = jobValuePatterns.reduce((sum, pattern) => {
          const data = JSON.parse(pattern.patternData);
          return sum + (data.averageValue * pattern.occurrences);
        }, 0);
        const totalOccurrences = jobValuePatterns.reduce((sum, pattern) => sum + pattern.occurrences, 0);
        profile.averageJobValue = totalValue / totalOccurrences;
      }

      return profile;
    } catch (error) {
      logger.error('Error getting business profile:', error);
      throw error;
    }
  }

  /**
   * Get contextual suggestions based on learned patterns
   */
  async getContextualSuggestions(
    userId: string,
    context: { type: string; data: any }
  ): Promise<string[]> {
    try {
      const suggestions: string[] = [];
      
      // Get relevant patterns for the context
      const patterns = await prisma.workflowPattern.findMany({
        where: {
          userId,
          patternType: { contains: context.type },
          isActive: true,
          confidence: { gte: 0.4 }
        },
        orderBy: { confidence: 'desc' },
        take: 5
      });

      // Generate suggestions based on patterns
      for (const pattern of patterns) {
        const patternData = JSON.parse(pattern.patternData);
        
        switch (context.type) {
          case 'email_response':
            if (patternData.averageResponseTime) {
              const hours = Math.round(patternData.averageResponseTime / (1000 * 60 * 60));
              suggestions.push(`Based on your patterns, consider responding within ${hours} hours for ${patternData.emailPriority} priority emails`);
            }
            break;
          case 'job_estimation':
            if (patternData.averageValue) {
              suggestions.push(`Similar jobs typically cost around $${Math.round(patternData.averageValue)}`);
            }
            break;
        }
      }

      return suggestions;
    } catch (error) {
      logger.error('Error getting contextual suggestions:', error);
      return [];
    }
  }

  /**
   * Helper method to extract keywords from job descriptions
   */
  private extractJobKeywords(description: string): string[] {
    const keywords: string[] = [];
    const commonTerms = [
      'installation', 'repair', 'maintenance', 'upgrade', 'inspection',
      'electrical', 'wiring', 'outlet', 'switch', 'panel', 'circuit',
      'lighting', 'meter', 'safety', 'emergency', 'residential', 'commercial'
    ];

    const descriptionLower = description.toLowerCase();
    for (const term of commonTerms) {
      if (descriptionLower.includes(term)) {
        keywords.push(term);
      }
    }

    return keywords;
  }
}

export const businessContextService = BusinessContextService.getInstance();