import { Router, type Response } from 'express';
import { prisma } from '../services/prisma.js';
import { EmailUrgencyDetectionService } from '../services/emailUrgencyDetection.js';
import { z } from 'zod';
import { authenticateToken, validateUserOwnership, type AuthenticatedRequest } from '../middleware/auth.js';

export const emailRouter = Router();

// Lazily initialize the service to ensure DI container is ready
let emailService: EmailUrgencyDetectionService | null = null;

const getEmailService = (): EmailUrgencyDetectionService => {
  emailService ??= new EmailUrgencyDetectionService(prisma);
  return emailService;
};

/**
 * Handle batch email analysis from frontend
 */
const handleBatchAnalysis = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const batchSchema = z.object({
    emails: z.array(z.object({
      id: z.string(),
      subject: z.string(),
      from: z.string(),
      snippet: z.string(),
      date: z.string().transform(s => new Date(s)),
      isRead: z.boolean().optional()
    })),
    preferences: z.any().optional()
  });

  const validated = batchSchema.parse(req.body);
  
  // Get userId from authenticated user
  const userId = req.user?.id;
  if (userId === undefined) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }
  
  // Transform to backend format and analyze each email
  const analysisPromises = validated.emails.map(email => 
    getEmailService().analyzeEmail({
      userId,
      emailId: email.id,
      subject: email.subject,
      from: email.from,
      snippet: email.snippet,
      bodyPreview: email.snippet, // Use snippet as bodyPreview if not provided
      receivedAt: new Date(email.date)
    })
  );
  
  const analyses = await Promise.all(analysisPromises);
  
  // Format response to match frontend expectations
  const analyzedEmails = validated.emails.map((email, index) => ({
    ...email,
    analysis: analyses[index]
  }));
  
  // Calculate summary
  const summary = {
    urgentCount: analyses.filter(a => a.priority === 'urgent').length,
    highPriorityCount: analyses.filter(a => a.priority === 'high').length,
    actionRequiredCount: analyses.filter(a => a.actionRequired).length,
    categoryCounts: {
      urgent: analyses.filter(a => a.category === 'urgent').length,
      standard: analyses.filter(a => a.category === 'standard').length,
      followUp: analyses.filter(a => a.category === 'follow-up').length,
      admin: analyses.filter(a => a.category === 'admin').length,
      spam: analyses.filter(a => a.category === 'spam').length
    }
  };
  
  res.json({
    success: true,
    data: {
      totalEmails: validated.emails.length,
      analyzedEmails,
      summary
    }
  });
};

/**
 * Handle single email analysis
 */
const handleSingleEmailAnalysis = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const schema = z.object({
    emailId: z.string(),
    subject: z.string(),
    from: z.string(),
    snippet: z.string(),
    bodyPreview: z.string().optional(),
    receivedAt: z.string().transform(s => new Date(s))
  });

  const validated = schema.parse(req.body);
  
  // Get userId from authenticated user
  const userId = req.user?.id;
  if (userId === undefined) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }
  
  // Use authenticated user's ID instead of requiring it in body
  const emailData = {
    userId,
    emailId: validated.emailId,
    subject: validated.subject,
    from: validated.from,
    snippet: validated.snippet,
    bodyPreview: validated.bodyPreview,
    receivedAt: validated.receivedAt
  };
  const analysis = await getEmailService().analyzeEmail(emailData);
  res.json({ analysis });
};

// Analyze single email or batch
emailRouter.post('/analyze', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  (async (): Promise<void> => {
    try {
      // Check if it's a batch request from frontend
      if (Array.isArray(req.body.emails)) {
        await handleBatchAnalysis(req, res);
      } else {
        await handleSingleEmailAnalysis(req, res);
      }
    } catch (error) {
      // Return Zod validation errors in a more readable format
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(400).json({ error: String(error) });
      }
    }
  })().catch((error: unknown) => {
    res.status(500).json({ error: 'Internal server error', details: String(error) });
  });
});

// Batch analyze emails
emailRouter.post('/analyze-batch', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.array(z.object({
      emailId: z.string(),
      subject: z.string(),
      from: z.string(),
      snippet: z.string(),
      bodyPreview: z.string().optional(),
      receivedAt: z.string().transform(s => new Date(s))
    }));

    const validated = schema.parse(req.body.emails);
    
    // Get userId from authenticated user
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    // Add userId from authenticated user to each email
    const emailsWithUserId = validated.map(email => ({
      userId,
      emailId: email.emailId,
      subject: email.subject,
      from: email.from,
      snippet: email.snippet,
      bodyPreview: email.bodyPreview,
      receivedAt: email.receivedAt
    }));
    const analyses = await getEmailService().analyzeEmails(emailsWithUserId);
    res.json({ analyses });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

// Get recent email analyses
emailRouter.get('/analyses/:userId', authenticateToken, validateUserOwnership, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = (typeof req.query.limit === 'string' && req.query.limit !== '' ? Number(req.query.limit) : 0) || 50;
    const analyses = await getEmailService().getRecentAnalyses(userId, limit);
    res.json({ analyses });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get analysis by email ID
emailRouter.get('/analysis/:emailId', async (req, res) => {
  try {
    const { emailId } = req.params;
    const analysis = await getEmailService().getAnalysisByEmailId(emailId);
    if (analysis === null) {
      res.status(404).json({ error: 'Analysis not found' });
      return;
    }
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get urgent emails
emailRouter.get('/urgent/:userId', authenticateToken, validateUserOwnership, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const urgentEmails = await prisma.emailAnalysis.findMany({
      where: {
        userId,
        priority: 'urgent'
      },
      orderBy: { analyzedAt: 'desc' },
      take: 20
    });
    res.json({ urgentEmails });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get email statistics
emailRouter.get('/stats/:userId', authenticateToken, validateUserOwnership, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const [total, urgent, actionRequired, categories] = await Promise.all([
      prisma.emailAnalysis.count({ where: { userId } }),
      prisma.emailAnalysis.count({ where: { userId, priority: 'urgent' } }),
      prisma.emailAnalysis.count({ where: { userId, actionRequired: true } }),
      prisma.emailAnalysis.groupBy({
        by: ['category'],
        where: { userId },
        _count: true
      })
    ]);

    res.json({
      stats: {
        total,
        urgent,
        actionRequired,
        categories: categories.map(c => ({
          category: c.category,
          count: c._count
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});
