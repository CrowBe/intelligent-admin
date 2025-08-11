import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { verifyKindeToken } from '../middleware/kindeAuth.js';
import { EmailIntelligenceService, EmailSummary, UserEmailPreferences } from '../services/emailIntelligence.js';
import { emailUrgencyDetectionService } from '../services/emailUrgencyDetection';
import { notificationService } from '../services/notificationService';
import { ollamaService } from '../services/ollamaService.js';

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
    return res.status(400).json({
      error: 'Bad Request',
      message: 'emails array is required'
    });
  }

  // Validate email structure
  const validEmails = emails.filter((email: any) => 
    email.id && email.subject && email.from && email.snippet && email.date
  );

  if (validEmails.length === 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'No valid emails provided'
    });
  }

  // Convert date strings to Date objects
  const emailsWithDates = validEmails.map((email: any) => ({
    ...email,
    date: new Date(email.date),
    isRead: email.isRead || false
  })) as EmailSummary[];

  // Analyze emails
  const analyzedEmails = await EmailIntelligenceService.analyzeEmails(emailsWithDates, preferences);

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
    return res.status(400).json({
      error: 'Bad Request',
      message: 'emails array is required'
    });
  }

  // Convert and validate emails
  const emailsWithDates = emails.map((email: any) => ({
    ...email,
    date: new Date(email.date),
    isRead: email.isRead || false
  })) as EmailSummary[];

  // Analyze emails first
  const analyzedEmails = await EmailIntelligenceService.analyzeEmails(emailsWithDates, preferences);

  // Set default date range if not provided
  const digestDateRange = dateRange || {
    from: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    to: new Date()
  };

  // Generate digest
  const digest = await EmailIntelligenceService.generateMorningDigest(analyzedEmails, {
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
    userId: req.user?.id || 'test-user',
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
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Valid preferences object is required'
    });
  }

  // For now, just return the updated preferences
  // In a real implementation, this would save to database
  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: {
      ...preferences,
      userId: req.user?.id || 'test-user',
      updatedAt: new Date().toISOString()
    }
  });
}));

// POST /api/v1/emails/urgency-analysis
// Analyze email urgency with Phase 2A enhanced detection
router.post('/urgency-analysis', asyncHandler(async (req, res) => {
  const { messageId, from, to, subject, body, timestamp } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!messageId || !from || !subject || !body) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'messageId, from, subject, and body are required'
    });
  }

  const emailContent = {
    messageId,
    from,
    to: to || '',
    subject,
    body,
    timestamp: timestamp ? new Date(timestamp) : new Date()
  };

  const analysis = await emailUrgencyDetectionService.analyzeEmailUrgency(userId, emailContent);

  // If urgent email, potentially send notification
  if (analysis.category === 'urgent' && analysis.urgencyScore > 0.7) {
    await notificationService.sendUrgentEmailAlert(userId, {
      from,
      subject,
      urgencyScore: analysis.urgencyScore,
      businessImpact: analysis.reasoning
    });
  }

  res.json({
    success: true,
    data: {
      messageId,
      analysis
    }
  });
}));

// GET /api/v1/emails/urgent
// Get urgent emails for user (for Morning Brief)
router.get('/urgent', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const since = req.query.since ? new Date(req.query.since as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const urgentEmails = await emailUrgencyDetectionService.getUrgentEmailsForUser(userId, since);

  res.json({
    success: true,
    data: {
      urgentEmails,
      count: urgentEmails.length,
      since: since.toISOString()
    }
  });
}));

// POST /api/v1/emails/feedback
// Provide feedback on urgency analysis accuracy
router.post('/feedback', asyncHandler(async (req, res) => {
  const { messageId, correctUrgency, correctCategory, actualCategory, actualUrgencyScore } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!messageId || typeof correctUrgency !== 'boolean') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'messageId and correctUrgency (boolean) are required'
    });
  }

  await emailUrgencyDetectionService.updateAnalysisFromFeedback(userId, messageId, {
    correctUrgency,
    correctCategory: correctCategory ?? true,
    actualCategory,
    actualUrgencyScore
  });

  res.json({
    success: true,
    message: 'Feedback recorded successfully'
  });
}));

// GET /api/v1/emails/ai-status
// Get AI service availability status
router.get('/ai-status', asyncHandler(async (req, res) => {
  const ollamaStats = ollamaService.getStats();
  
  res.json({
    success: true,
    data: {
      ollama: {
        available: ollamaStats.isAvailable,
        model: ollamaStats.model,
        baseUrl: ollamaStats.baseUrl
      },
      openai: {
        available: !!process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
      },
      currentStrategy: ollamaStats.isAvailable ? 'ollama-primary' : 'openai-primary',
      urgencyDetection: {
        available: true,
        version: '2.0'
      }
    }
  });
}));

export { router as emailRoutes };