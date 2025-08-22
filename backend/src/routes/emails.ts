import { Router } from 'express';
import { prisma } from '../services/prisma.js';
import { EmailUrgencyDetectionService } from '../services/emailUrgencyDetection.js';
import { z } from 'zod';

export const emailRouter = Router();
const emailService = new EmailUrgencyDetectionService(prisma);

// Analyze single email
emailRouter.post('/analyze', async (req, res) => {
  try {
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
    const analysis = await emailService.analyzeEmail(validated);
    res.json({ analysis });
  } catch (error) {
    res.status(400).json({ error: String(error) });
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
    const analyses = await emailService.analyzeEmails(validated);
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
    const analyses = await emailService.getRecentAnalyses(userId, limit);
    res.json({ analyses });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get analysis by email ID
emailRouter.get('/analysis/:emailId', async (req, res) => {
  try {
    const { emailId } = req.params;
    const analysis = await emailService.getAnalysisByEmailId(emailId);
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
