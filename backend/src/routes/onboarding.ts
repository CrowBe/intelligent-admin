import { Router } from 'express';
import { prisma } from '../services/prisma.js';
import { OnboardingService, OnboardingStep, BusinessType } from '../services/onboardingService.js';
import { z } from 'zod';

export const onboardingRouter = Router();
const onboardingService = new OnboardingService(prisma);

// Get onboarding progress
onboardingRouter.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await onboardingService.getProgress(userId);
    res.json({ progress });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Complete a step
onboardingRouter.post('/complete-step', async (req, res) => {
  try {
    const { userId, step, data } = req.body;
    const progress = await onboardingService.completeStep(userId, step, data);
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Skip a step
onboardingRouter.post('/skip-step', async (req, res) => {
  try {
    const { userId, step } = req.body;
    const progress = await onboardingService.skipStep(userId, step);
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
    const profile = await onboardingService.saveBusinessProfile(userId, profileData);
    res.json({ success: true, profile });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

// Get business profile
onboardingRouter.get('/business-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await onboardingService.getBusinessProfile(userId);
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get tips for current step
onboardingRouter.get('/tips/:step', async (req, res) => {
  try {
    const step = req.params.step as OnboardingStep;
    const tips = onboardingService.getTipsForStep(step);
    res.json({ tips });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get security info for step
onboardingRouter.get('/security/:step', async (req, res) => {
  try {
    const step = req.params.step as OnboardingStep;
    const info = onboardingService.getSecurityInfo(step);
    res.json({ info });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Reset onboarding (for testing)
onboardingRouter.post('/reset/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await onboardingService.resetOnboarding(userId);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get onboarding statistics
onboardingRouter.get('/stats', async (req, res) => {
  try {
    const stats = await onboardingService.getStats();
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});
