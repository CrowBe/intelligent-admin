import { prisma } from '../db/index.js';
import { logger } from '../utils/logger';



export interface OnboardingProgress {
  userId: string;
  step: string;
  completedAt?: Date;
  skipped: boolean;
  data?: any;
}

export interface UserProfile {
  businessName: string;
  businessType: string;
  painPoints: string[];
  confidence: number;
  onboardingCompletedAt?: Date;
}

export class OnboardingService {
  private static instance: OnboardingService;

  private constructor() {}

  public static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  /**
   * Record onboarding step completion
   */
  async recordStep(
    userId: string, 
    step: string, 
    completed: boolean = true, 
    data?: any
  ): Promise<void> {
    try {
      await prisma.onboardingProgress.upsert({
        where: {
          userId_step: {
            userId,
            step
          }
        },
        update: {
          completedAt: completed ? new Date() : null,
          skipped: !completed,
          data: data ? JSON.stringify(data) : null
        },
        create: {
          userId,
          step,
          completedAt: completed ? new Date() : null,
          skipped: !completed,
          data: data ? JSON.stringify(data) : null
        }
      });

      logger.info(`Recorded onboarding step for user ${userId}: ${step} (${completed ? 'completed' : 'skipped'})`);
    } catch (error) {
      logger.error('Failed to record onboarding step:', error);
    }
  }

  /**
   * Get user's onboarding progress
   */
  async getProgress(userId: string): Promise<OnboardingProgress[]> {
    try {
      const progress = await prisma.onboardingProgress.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' }
      });

      return progress.map(p => ({
        userId: p.userId,
        step: p.step,
        completedAt: p.completedAt || undefined,
        skipped: p.skipped,
        data: p.data ? JSON.parse(p.data) : undefined
      }));
    } catch (error) {
      logger.error('Failed to get onboarding progress:', error);
      return [];
    }
  }

  /**
   * Check if user has completed onboarding
   */
  async isOnboardingComplete(userId: string): Promise<boolean> {
    try {
      const requiredSteps = ['welcome', 'pain-points'];
      const progress = await this.getProgress(userId);
      
      const completedSteps = progress
        .filter(p => p.completedAt && !p.skipped)
        .map(p => p.step);

      return requiredSteps.every(step => completedSteps.includes(step));
    } catch (error) {
      logger.error('Failed to check onboarding completion:', error);
      return false;
    }
  }

  /**
   * Save user profile from onboarding
   */
  async saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
    try {
      // Update user record with business information
      await prisma.user.update({
        where: { id: userId },
        data: {
          businessName: profile.businessName,
          businessType: profile.businessType,
          preferences: JSON.stringify({
            painPoints: profile.painPoints,
            confidence: profile.confidence,
            onboardingCompletedAt: profile.onboardingCompletedAt
          })
        }
      });

      // Record completion step
      await this.recordStep(userId, 'complete', true, {
        businessName: profile.businessName,
        businessType: profile.businessType,
        painPoints: profile.painPoints,
        confidence: profile.confidence
      });

      logger.info(`Saved user profile for ${userId}: ${profile.businessName} (${profile.businessType})`);
    } catch (error) {
      logger.error('Failed to save user profile:', error);
    }
  }

  /**
   * Get user's business profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) return null;

      const preferences = user.preferences ? JSON.parse(user.preferences) : {};

      return {
        businessName: user.businessName || '',
        businessType: user.businessType || '',
        painPoints: preferences.painPoints || [],
        confidence: preferences.confidence || 1,
        onboardingCompletedAt: preferences.onboardingCompletedAt 
          ? new Date(preferences.onboardingCompletedAt) 
          : undefined
      };
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * Get onboarding analytics
   */
  async getOnboardingAnalytics(): Promise<{
    totalUsers: number;
    completedOnboarding: number;
    completionRate: number;
    stepCompletionRates: Record<string, number>;
    averageTimeToComplete: number;
    commonPainPoints: Array<{ painPoint: string; count: number }>;
  }> {
    try {
      const totalUsers = await prisma.user.count();
      
      const completedUsers = await prisma.onboardingProgress.count({
        where: {
          step: 'complete',
          completedAt: { not: null }
        }
      });

      const completionRate = totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0;

      // Get step completion rates
      const allSteps = ['welcome', 'pain-points', 'demo', 'gmail-setup', 'notifications', 'complete'];
      const stepCompletionRates: Record<string, number> = {};

      for (const step of allSteps) {
        const stepCompletions = await prisma.onboardingProgress.count({
          where: {
            step,
            completedAt: { not: null }
          }
        });
        stepCompletionRates[step] = totalUsers > 0 ? (stepCompletions / totalUsers) * 100 : 0;
      }

      // Get common pain points
      const painPointsData = await prisma.onboardingProgress.findMany({
        where: {
          step: 'pain-points',
          completedAt: { not: null }
        },
        select: { data: true }
      });

      const painPointCounts: Record<string, number> = {};
      painPointsData.forEach(record => {
        if (record.data) {
          try {
            const data = JSON.parse(record.data);
            if (data.painPoints && Array.isArray(data.painPoints)) {
              data.painPoints.forEach((point: string) => {
                painPointCounts[point] = (painPointCounts[point] || 0) + 1;
              });
            }
          } catch (error) {
            // Skip invalid JSON
          }
        }
      });

      const commonPainPoints = Object.entries(painPointCounts)
        .map(([painPoint, count]) => ({ painPoint, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calculate average time to complete
      const completionTimes = await prisma.onboardingProgress.findMany({
        where: {
          step: 'complete',
          completedAt: { not: null }
        },
        select: {
          completedAt: true,
          createdAt: true
        }
      });

      let averageTimeToComplete = 0;
      if (completionTimes.length > 0) {
        const totalTime = completionTimes.reduce((sum, record) => {
          if (record.completedAt) {
            return sum + (record.completedAt.getTime() - record.createdAt.getTime());
          }
          return sum;
        }, 0);
        averageTimeToComplete = totalTime / completionTimes.length / (1000 * 60); // Convert to minutes
      }

      return {
        totalUsers,
        completedOnboarding: completedUsers,
        completionRate,
        stepCompletionRates,
        averageTimeToComplete,
        commonPainPoints
      };
    } catch (error) {
      logger.error('Failed to get onboarding analytics:', error);
      return {
        totalUsers: 0,
        completedOnboarding: 0,
        completionRate: 0,
        stepCompletionRates: {},
        averageTimeToComplete: 0,
        commonPainPoints: []
      };
    }
  }

  /**
   * Generate personalized recommendations based on user profile
   */
  async generateRecommendations(userId: string): Promise<{
    features: string[];
    integrations: string[];
    tips: string[];
  }> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        return { features: [], integrations: [], tips: [] };
      }

      const recommendations = {
        features: [] as string[],
        integrations: [] as string[],
        tips: [] as string[]
      };

      // Feature recommendations based on pain points
      if (profile.painPoints.includes('emails')) {
        recommendations.features.push('Email urgency detection');
        recommendations.features.push('Morning Brief notifications');
        recommendations.integrations.push('Gmail integration');
      }

      if (profile.painPoints.includes('quotes')) {
        recommendations.features.push('Quote template generation');
        recommendations.features.push('Customer communication drafts');
      }

      if (profile.painPoints.includes('followup')) {
        recommendations.features.push('Follow-up reminders');
        recommendations.features.push('Customer relationship tracking');
      }

      if (profile.painPoints.includes('scheduling')) {
        recommendations.integrations.push('Google Calendar integration');
        recommendations.features.push('Scheduling conflict detection');
      }

      if (profile.painPoints.includes('paperwork')) {
        recommendations.features.push('Document processing and OCR');
        recommendations.features.push('Compliance reminders');
      }

      // Business type specific recommendations
      if (profile.businessType === 'electrical') {
        recommendations.tips.push('Set up Australian Standards knowledge base');
        recommendations.tips.push('Configure ESV regulation monitoring');
        recommendations.tips.push('Enable electrical emergency keywords');
      }

      // General tips based on confidence level
      if (profile.confidence <= 2) {
        recommendations.tips.push('Start with email monitoring - it\'s the easiest win');
        recommendations.tips.push('Try the test notification feature to see how it works');
        recommendations.tips.push('Remember: I create drafts, you decide what gets sent');
      }

      return recommendations;
    } catch (error) {
      logger.error('Failed to generate recommendations:', error);
      return { features: [], integrations: [], tips: [] };
    }
  }
}

export const onboardingService = OnboardingService.getInstance();