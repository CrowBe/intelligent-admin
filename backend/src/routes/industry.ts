import { Router } from 'express';
import { IndustryService } from '../services/industryService.js';

export const industryRouter = Router();

// Lazily initialize the service to ensure DI container is ready
let industryService: IndustryService | null = null;

const getIndustryService = (): IndustryService => {
  if (!industryService) {
    industryService = new IndustryService();
  }
  return industryService;
};

industryRouter.get('/stats', async (_req, res) => {
  try {
    const stats = await getIndustryService().getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting industry stats:', error);
    res.status(500).json({ error: 'Failed to get industry statistics' });
  }
});

industryRouter.get('/categories', async (_req, res) => {
  try {
    const categories = await getIndustryService().getCategories();
    res.json({ categories, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

industryRouter.get('/sources', async (_req, res) => {
  try {
    const sources = await getIndustryService().getSources();
    res.json({ sources, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting sources:', error);
    res.status(500).json({ error: 'Failed to get sources' });
  }
});

industryRouter.get('/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const limit = Number(req.query.limit || 10);
    const results = await getIndustryService().search(q, limit);
    res.json(results);
  } catch (error) {
    console.error('Error searching industry items:', error);
    res.status(500).json({ error: 'Failed to search industry items' });
  }
});

industryRouter.post('/update', async (_req, res) => {
  try {
    const result = await getIndustryService().updateKnowledgeBase();
    res.json(result);
  } catch (error) {
    console.error('Error updating knowledge base:', error);
    res.status(500).json({ error: 'Failed to update knowledge base' });
  }
});
