import express from 'express';
import { PrismaClient } from '@prisma/client';
import { IndustryService } from './services/industryService.js';

const app = express();
const prisma = new PrismaClient();
const port = 3001;

app.use(express.json());

// Test endpoints
app.get('/api/v1/industry/stats', async (_req, res) => {
  try {
    const service = new IndustryService(prisma);
    const stats = await service.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/v1/industry/search', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    const limit = Number(req.query.limit || 10);
    const service = new IndustryService(prisma);
    const results = await service.search(q, limit);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.listen(port, () => {
  console.log(`Phase 2B API test server running on port ${port}`);
  console.log(`Test endpoints:`);
  console.log(`  http://localhost:${port}/api/v1/industry/stats`);
  console.log(`  http://localhost:${port}/api/v1/industry/search?q=safety`);
});
