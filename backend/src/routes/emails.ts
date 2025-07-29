import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { verifyKindeToken } from '../middleware/kindeAuth.js';
import { EmailIntelligenceService, EmailSummary, UserEmailPreferences } from '../services/emailIntelligence.js';

const router = Router();

// All email routes require authentication
router.use(verifyKindeToken);

// GET /api/v1/emails/analyze
// Analyze user's emails and return intelligence
router.get('/analyze', asyncHandler(async (req, res) => {
  // This endpoint expects the frontend to provide Gmail data
  // since we don't store Gmail credentials on the backend
  res.json({
    message: 'Use POST /api/v1/emails/analyze with email data from frontend',
    instructions: 'Frontend should fetch emails from Gmail API and send to this endpoint for analysis'
  });
}));

// POST /api/v1/emails/analyze
// Analyze specific emails provided in request body
router.post('/analyze', asyncHandler(async (req, res) => {
  const { emails, preferences } = req.body;
  
  if (!emails || !Array.isArray(emails)) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'emails array is required'
    });
    return;
  }

  // Validate email structure
  const validEmails = emails.filter((email: any) => 
    email.id && email.subject && email.from && email.snippet && email.date
  );

  if (validEmails.length === 0) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'No valid emails provided'
    });
    return;
  }

  // Convert date strings to Date objects
  const emailsWithDates = validEmails.map((email: any) => ({
    ...email,
    date: new Date(email.date),
    isRead: email.isRead || false
  })) as EmailSummary[];

  // Analyze emails
  const analyzedEmails = EmailIntelligenceService.analyzeEmails(emailsWithDates, preferences);

  res.json({
    success: true,
    data: {
      totalEmails: analyzedEmails.length,
      analyzedEmails,
      summary: {
        urgentCount: analyzedEmails.filter(e => e.analysis.priority === 'urgent').length,
        highPriorityCount: analyzedEmails.filter(e => e.analysis.priority === 'high').length,
        actionRequiredCount: analyzedEmails.filter(e => e.analysis.actionRequired).length,
        categoryCounts: {
          urgent: analyzedEmails.filter(e => e.analysis.category === 'urgent').length,
          standard: analyzedEmails.filter(e => e.analysis.category === 'standard').length,
          followUp: analyzedEmails.filter(e => e.analysis.category === 'follow-up').length,
          admin: analyzedEmails.filter(e => e.analysis.category === 'admin').length,
          spam: analyzedEmails.filter(e => e.analysis.category === 'spam').length,
        }
      }
    }
  });
}));

// POST /api/v1/emails/digest
// Generate morning digest from provided email data
router.post('/digest', asyncHandler(async (req, res) => {
  const { emails, dateRange, preferences } = req.body;
  
  if (!emails || !Array.isArray(emails)) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'emails array is required'
    });
    return;
  }

  // Convert and validate emails
  const emailsWithDates = emails.map((email: any) => ({
    ...email,
    date: new Date(email.date),
    isRead: email.isRead || false
  })) as EmailSummary[];

  // Analyze emails first
  const analyzedEmails = EmailIntelligenceService.analyzeEmails(emailsWithDates, preferences);

  // Set default date range if not provided
  const digestDateRange = dateRange || {
    from: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    to: new Date()
  };

  // Generate digest
  const digest = EmailIntelligenceService.generateMorningDigest(analyzedEmails, {
    from: new Date(digestDateRange.from),
    to: new Date(digestDateRange.to)
  });

  res.json({
    success: true,
    data: digest
  });
}));

// GET /api/v1/emails/digest/custom
// Generate custom digest for date range
router.get('/digest/custom', asyncHandler(async (req, res) => {
  res.json({
    message: 'Use POST /api/v1/emails/digest with dateRange and email data',
    instructions: 'Frontend should provide emails and custom date range for digest generation'
  });
}));

// GET /api/v1/emails/preferences
// Get user's email analysis preferences
router.get('/preferences', asyncHandler(async (req, res) => {
  // TODO: Implement user preferences storage
  // For now, return default preferences
  const defaultPreferences: UserEmailPreferences = {
    userId: req.user!.id,
    urgentKeywords: ['emergency', 'urgent', 'asap', 'critical'],
    businessKeywords: ['quote', 'estimate', 'invoice', 'payment', 'service'],
    spamKeywords: ['congratulations you won', 'click here now', 'limited time offer'],
    priorityRules: {
      fromAddresses: [],
      subjectPatterns: []
    },
    digestSettings: {
      enabled: true,
      frequency: 'daily',
      timeOfDay: '09:00',
      includeWeekends: false
    },
    analysisSettings: {
      enableSentimentAnalysis: true,
      enableBusinessRelevanceScoring: true,
      enableActionSuggestions: true,
      strictSpamFiltering: false
    }
  };

  res.json({
    success: true,
    data: defaultPreferences
  });
}));

// PUT /api/v1/emails/preferences
// Update user's email analysis preferences
router.put('/preferences', asyncHandler(async (req, res) => {
  // TODO: Implement user preferences storage in database
  const preferences = req.body;
  
  // Validate preferences structure
  if (!preferences || typeof preferences !== 'object') {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Valid preferences object is required'
    });
    return;
  }

  // For now, just return the updated preferences
  // In a real implementation, this would save to database
  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: {
      ...preferences,
      userId: req.user!.id,
      updatedAt: new Date().toISOString()
    }
  });
}));

export { router as emailRoutes };