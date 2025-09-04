import { Router } from 'express';
import type { OnboardingStep} from '../services/onboardingService.js';
import { OnboardingService, BusinessType } from '../services/onboardingService.js';
import { z } from 'zod';

export const onboardingRouter = Router();

// Lazily initialize the service to ensure DI container is ready
let onboardingService: OnboardingService | null = null;

const getOnboardingService = (): OnboardingService => {
  if (!onboardingService) {
    onboardingService = new OnboardingService();
  }
  return onboardingService;
};

// Get onboarding progress
onboardingRouter.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await getOnboardingService().getProgress(userId);
    res.json({ progress });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Complete a step
onboardingRouter.post('/complete-step', async (req, res) => {
  try {
    const { userId, step, data } = req.body;
    const progress = await getOnboardingService().completeStep(userId, step, data);
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Skip a step
onboardingRouter.post('/skip-step', async (req, res) => {
  try {
    const { userId, step } = req.body;
    const progress = await getOnboardingService().skipStep(userId, step);
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Save business profile
onboardingRouter.post('/business-profile', async (req, res) => {
  try {
    const schema = z.object({
      userId: z.string(),
      businessName: z.string(),
      businessType: z.nativeEnum(BusinessType),
      employeeCount: z.number(),
      servicesOffered: z.array(z.string()),
      primaryLocation: z.string(),
      yearsInBusiness: z.number(),
      averageJobValue: z.number().optional(),
      communicationPreferences: z.object({
        preferredTone: z.enum(['formal', 'casual', 'friendly']),
        responseTime: z.enum(['immediate', 'same_day', 'next_day']),
        followUpFrequency: z.enum(['aggressive', 'moderate', 'minimal'])
      }).optional()
    });

    const { userId, ...profileData } = req.body;
    const validated = schema.parse({ userId, ...profileData });
    const profile = await getOnboardingService().saveBusinessProfile(userId, profileData);
    res.json({ success: true, profile });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

// Get business profile
onboardingRouter.get('/business-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await getOnboardingService().getBusinessProfile(userId);
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get tips for current step
onboardingRouter.get('/tips/:step', async (req, res) => {
  try {
    const step = req.params.step as OnboardingStep;
    const tips = getOnboardingService().getTipsForStep(step);
    res.json({ tips });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get security info for step
onboardingRouter.get('/security/:step', async (req, res) => {
  try {
    const step = req.params.step as OnboardingStep;
    const info = getOnboardingService().getSecurityInfo(step);
    res.json({ info });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Reset onboarding (for testing)
onboardingRouter.post('/reset/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await getOnboardingService().resetOnboarding(userId);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get onboarding statistics
onboardingRouter.get('/stats', async (req, res) => {
  try {
    const stats = await getOnboardingService().getStats();
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});
