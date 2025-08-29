import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma.js';
import { EmailUrgencyDetectionService } from '../services/emailUrgencyDetection.js';
import { z } from 'zod';

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export const emailRouter = Router();

// Lazily initialize the service to ensure DI container is ready
let emailService: EmailUrgencyDetectionService | null = null;

const getEmailService = (): EmailUrgencyDetectionService => {
  if (!emailService) {
    emailService = new EmailUrgencyDetectionService(prisma);
  }
  return emailService;
};

// Analyze single email or batch
emailRouter.post('/analyze', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if it's a batch request from frontend
    if (req.body.emails && Array.isArray(req.body.emails)) {
      // Handle batch analysis from frontend
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
      
      // Extract userId from auth header or use a default
      // TODO: Implement proper JWT auth middleware
      const authHeader = req.headers.authorization;
      let userId = 'default-user'; // Default for development
      
      if (authHeader?.startsWith('Bearer ')) {
        // Extract user ID from token if available
        // For now, just use a placeholder
        userId = req.user?.id || 'default-user';
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
    } else {
      // Handle single email analysis (original format)
      const schema = z.object({
        userId: z.string(),
        emailId: z.string(),
        subject: z.string(),
        from: z.string(),
        snippet: z.string(),
        bodyPreview: z.string().optional(),
        receivedAt: z.string().transform(s => new Date(s))
      });

      const validated = schema.parse(req.body);
      const analysis = await getEmailService().analyzeEmail(validated);
      res.json({ analysis });
    }
  } catch (error) {
    // Return Zod validation errors in a more readable format
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(400).json({ error: String(error) });
    }
  }
});

// Batch analyze emails
emailRouter.post('/analyze-batch', async (req, res) => {
  try {
    const schema = z.array(z.object({
      userId: z.string(),
      emailId: z.string(),
      subject: z.string(),
      from: z.string(),
      snippet: z.string(),
      bodyPreview: z.string().optional(),
      receivedAt: z.string().transform(s => new Date(s))
    }));

    const validated = schema.parse(req.body.emails);
    const analyses = await getEmailService().analyzeEmails(validated);
    res.json({ analyses });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

// Get recent email analyses
emailRouter.get('/analyses/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = Number(req.query.limit) || 50;
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
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get urgent emails
emailRouter.get('/urgent/:userId', async (req, res) => {
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
emailRouter.get('/stats/:userId', async (req, res) => {
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
