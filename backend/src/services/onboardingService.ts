import { z } from 'zod';
import { DIContainer } from '../repositories/RepositoryFactory.js';
import type { 
  OnboardingProgressRepository,
  UserPreferenceRepository,
  UserRepository
} from '../repositories/index.js';

// Onboarding steps
export enum OnboardingStep {
  WELCOME = 'welcome',
  BUSINESS_PROFILE = 'business_profile',
  GMAIL_CONNECT = 'gmail_connect',
  NOTIFICATIONS_SETUP = 'notifications_setup',
  INDUSTRY_PREFERENCES = 'industry_preferences',
  TUTORIAL = 'tutorial',
  COMPLETED = 'completed'
}

// Business types for Australian trades
export enum BusinessType {
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  HVAC = 'hvac',
  CARPENTRY = 'carpentry',
  GENERAL_TRADES = 'general_trades',
  OTHER = 'other'
}

// Business profile schema
const BusinessProfileSchema = z.object({
  businessName: z.string().min(1),
  businessType: z.nativeEnum(BusinessType),
  employeeCount: z.number().min(1).max(50),
  servicesOffered: z.array(z.string()),
  primaryLocation: z.string(),
  yearsInBusiness: z.number().min(0),
  averageJobValue: z.number().optional(),
  communicationPreferences: z.object({
    preferredTone: z.enum(['formal', 'casual', 'friendly']).default('friendly'),
    responseTime: z.enum(['immediate', 'same_day', 'next_day']).default('same_day'),
    followUpFrequency: z.enum(['aggressive', 'moderate', 'minimal']).default('moderate')
  }).optional()
});

export type BusinessProfile = z.infer<typeof BusinessProfileSchema>;

export class OnboardingService {
  private progressRepo: OnboardingProgressRepository;
  private preferenceRepo: UserPreferenceRepository;
  private userRepo: UserRepository;

  constructor() {
    const container = DIContainer.getInstance();
    this.progressRepo = container.onboardingProgress;
    this.preferenceRepo = container.userPreference;
    this.userRepo = container.user;
  }

  /**
   * Get or create onboarding progress for a user
   */
  async getProgress(userId: string) {
    // Get all completed steps
    const steps = await this.progressRepo.findByUserId(userId);

    // Determine current step
    const completedSteps = steps.filter(s => s.completedAt).map(s => s.step);
    const currentStep = this.determineCurrentStep(completedSteps);
    
    // Calculate progress percentage
    const totalSteps = Object.values(OnboardingStep).length - 1; // Exclude 'completed'
    const progressPercentage = Math.round((completedSteps.length / totalSteps) * 100);

    return {
      userId,
      currentStep,
      completedSteps,
      progressPercentage,
      isComplete: currentStep === OnboardingStep.COMPLETED,
      steps
    };
  }

  /**
   * Mark a step as completed
   */
  async completeStep(userId: string, step: OnboardingStep, data?: any) {
    // Check if step already completed
    const existing = await this.progressRepo.findByUserAndStep(userId, step);

    if (existing?.completedAt) {
      return existing; // Already completed
    }

    // Create or update the step
    const progress = await this.progressRepo.markStepCompleted(userId, step, data);

    // Check if all steps are complete
    await this.checkAndCompleteOnboarding(userId);

    return progress;
  }

  /**
   * Skip a step
   */
  async skipStep(userId: string, step: OnboardingStep) {
    const progress = await this.progressRepo.markStepSkipped(userId, step);

    // Check if all steps are complete/skipped
    await this.checkAndCompleteOnboarding(userId);

    return progress;
  }

  /**
   * Save business profile
   */
  async saveBusinessProfile(userId: string, profile: BusinessProfile) {
    const validated = BusinessProfileSchema.parse(profile);
    
    // Save to user preferences or profile
    await this.preferenceRepo.updateBusinessProfile(userId, validated);

    // Mark business profile step as complete
    await this.completeStep(userId, OnboardingStep.BUSINESS_PROFILE, validated);

    return validated;
  }

  /**
   * Get business profile
   */
  async getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
    const prefs = await this.preferenceRepo.findByUserId(userId);
    return prefs?.businessProfile as BusinessProfile | null;
  }

  /**
   * Determine the current step based on completed steps
   */
  private determineCurrentStep(completedSteps: string[]): OnboardingStep {
    const stepOrder = [
      OnboardingStep.WELCOME,
      OnboardingStep.BUSINESS_PROFILE,
      OnboardingStep.GMAIL_CONNECT,
      OnboardingStep.NOTIFICATIONS_SETUP,
      OnboardingStep.INDUSTRY_PREFERENCES,
      OnboardingStep.TUTORIAL
    ];

    for (const step of stepOrder) {
      if (!completedSteps.includes(step)) {
        return step;
      }
    }

    return OnboardingStep.COMPLETED;
  }

  /**
   * Check if onboarding is complete and mark accordingly
   */
  private async checkAndCompleteOnboarding(userId: string) {
    const progress = await this.getProgress(userId);
    
    // Check if all required steps are done
    const requiredSteps = [
      OnboardingStep.WELCOME,
      OnboardingStep.BUSINESS_PROFILE,
      OnboardingStep.GMAIL_CONNECT,
      OnboardingStep.NOTIFICATIONS_SETUP
    ];

    const allRequiredComplete = requiredSteps.every(step => 
      progress.completedSteps.includes(step)
    );

    if (allRequiredComplete && progress.currentStep !== OnboardingStep.COMPLETED) {
      await this.completeStep(userId, OnboardingStep.COMPLETED, {
        completedAt: new Date(),
        totalTimeMinutes: this.calculateOnboardingTime(progress.steps)
      });

      // Send completion notification
      // TODO: Integrate with NotificationService
      console.log(`User ${userId} completed onboarding!`);
    }
  }

  /**
   * Calculate total onboarding time
   */
  private calculateOnboardingTime(steps: any[]): number {
    if (steps.length < 2) {return 0;}
    
    const sorted = steps.sort((a, b) => 
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
    
    const first = new Date(sorted[0].completedAt);
    const last = new Date(sorted[sorted.length - 1].completedAt);
    
    return Math.round((last.getTime() - first.getTime()) / (1000 * 60)); // Minutes
  }

  /**
   * Get onboarding tips for current step
   */
  getTipsForStep(step: OnboardingStep): string[] {
    const tips: Record<OnboardingStep, string[]> = {
      [OnboardingStep.WELCOME]: [
        'Welcome to Intelligent Admin! Let\'s get you set up.',
        'This will only take about 5 minutes.',
        'You can skip optional steps and come back later.'
      ],
      [OnboardingStep.BUSINESS_PROFILE]: [
        'Tell us about your business to personalize your experience.',
        'This helps us provide industry-specific insights.',
        'Your information is kept strictly confidential.'
      ],
      [OnboardingStep.GMAIL_CONNECT]: [
        'Connect your Gmail to analyze and manage emails.',
        'We use secure OAuth - we never see your password.',
        'You can revoke access anytime from Google settings.'
      ],
      [OnboardingStep.NOTIFICATIONS_SETUP]: [
        'Set up your Morning Brief for daily business insights.',
        'Choose your preferred notification time (7:00-7:30 AM recommended).',
        'You can adjust these settings anytime.'
      ],
      [OnboardingStep.INDUSTRY_PREFERENCES]: [
        'Select your industry knowledge sources.',
        'We\'ll keep you updated on regulations and standards.',
        'Customize which updates are most relevant to you.'
      ],
      [OnboardingStep.TUTORIAL]: [
        'Quick tutorial on using the chat interface.',
        'Try commands like "Show urgent emails" or "Create a quote".',
        'The AI learns your preferences over time.'
      ],
      [OnboardingStep.COMPLETED]: [
        'You\'re all set up!',
        'Start by checking your Morning Brief.',
        'Ask me anything about your business operations.'
      ]
    };

    return tips[step] || [];
  }

  /**
   * Get security explanations for sensitive steps
   */
  getSecurityInfo(step: OnboardingStep): {
    title: string;
    explanation: string;
    safeguards: string[];
  } | null {
    switch (step) {
      case OnboardingStep.GMAIL_CONNECT:
        return {
          title: 'Gmail Security',
          explanation: 'We use Google\'s secure OAuth 2.0 for authentication.',
          safeguards: [
            'We never see or store your password',
            'Data is encrypted in transit and at rest',
            'You can revoke access anytime',
            'We only request minimal necessary permissions',
            'Compliant with Australian privacy laws'
          ]
        };
      
      case OnboardingStep.BUSINESS_PROFILE:
        return {
          title: 'Data Privacy',
          explanation: 'Your business information is protected.',
          safeguards: [
            'Data stored in Australian servers',
            'Never shared with third parties',
            'Used only to improve your experience',
            'You can delete your data anytime',
            'Compliant with Australian Privacy Act'
          ]
        };
      
      default:
        return null;
    }
  }

  /**
   * Reset onboarding (for testing or re-onboarding)
   */
  async resetOnboarding(userId: string) {
    await this.progressRepo.deleteMany({ userId } as any);
    return { message: 'Onboarding reset successfully' };
  }

  /**
   * Get onboarding statistics
   */
  async getStats() {
    const totalUsers = await this.userRepo.count();
    const completedOnboarding = await this.progressRepo.count({
      step: OnboardingStep.COMPLETED
    } as any);

    // For complex aggregations, we'll use the base repository's executeRaw method
    // or fetch all and process in memory for now
    const allProgress = await this.progressRepo.findAll();
    const stepCompletion = allProgress.reduce((acc, curr) => {
      const step = curr.step;
      acc[step] = (acc[step] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const completedSteps = await this.progressRepo.findAll(
      { step: OnboardingStep.COMPLETED } as any
    );

    const times = completedSteps
      .map(p => (p.data as any)?.totalTimeMinutes)
      .filter(t => t);
    
    const avgMinutes = times.length > 0 
      ? times.reduce((a, b) => a + b, 0) / times.length 
      : 0;

    return {
      totalUsers,
      completedOnboarding,
      completionRate: totalUsers > 0 ? (completedOnboarding / totalUsers) * 100 : 0,
      stepCompletion: Object.entries(stepCompletion).map(([step, count]) => ({
        step,
        count
      })),
      averageCompletionTimeMinutes: Math.round(avgMinutes)
    };
  }
}
