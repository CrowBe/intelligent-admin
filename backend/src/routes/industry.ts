import { Router } from 'express';
import { prisma } from '../services/prisma';
import { IndustryService } from '../services/industryService';

export const industryRouter = Router();

industryRouter.get('/stats', async (_req, res) => {
  const service = new IndustryService(prisma);
  const stats = await service.getStats();
  res.json(stats);
});

industryRouter.get('/categories', async (_req, res) => {
  const service = new IndustryService(prisma);
  const categories = await service.getCategories();
  res.json({ categories, timestamp: new Date().toISOString() });
});

industryRouter.get('/sources', async (_req, res) => {
  const service = new IndustryService(prisma);
  const sources = await service.getSources();
  res.json({ sources, timestamp: new Date().toISOString() });
});

industryRouter.get('/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const limit = Number(req.query.limit || 10);
  const service = new IndustryService(prisma);
  const results = await service.search(q, limit);
  res.json(results);
});

industryRouter.post('/update', async (_req, res) => {
  const service = new IndustryService(prisma);
  const result = await service.updateKnowledgeBase();
  res.json(result);
});
