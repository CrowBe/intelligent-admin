import { Router, Request, Response } from 'express';
import { verifyKindeToken } from '../middleware/kindeAuth.js';
import { industryKnowledgeService } from '../services/industryKnowledge.js';
import { logger } from '../utils/logger.js';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Get industry knowledge statistics
 * GET /api/v1/industry/stats
 */
router.get('/stats', verifyKindeToken, async (req: Request, res: Response) => {
  try {
    const stats = industryKnowledgeService.getStats();
    
    // Get additional database stats
    const dbStats = await prisma.industryKnowledge.groupBy({
      by: ['source', 'contentType'],
      _count: {
        id: true
      }
    });
    
    res.json({
      ...stats,
      databaseBreakdown: dbStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching industry stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch industry knowledge statistics'
    });
  }
});

/**
 * Update industry knowledge base
 * POST /api/v1/industry/update
 */
router.post('/update', verifyKindeToken, async (req: Request, res: Response) => {
  try {
    logger.info('Starting manual industry knowledge update');
    
    // This is a long-running process, so we'll start it and return immediately
    industryKnowledgeService.updateKnowledgeBase()
      .then(() => {
        logger.info('Industry knowledge update completed successfully');
      })
      .catch((error) => {
        logger.error('Industry knowledge update failed:', error);
      });
    
    res.json({
      message: 'Industry knowledge update initiated',
      status: 'processing',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error initiating industry update:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to initiate industry knowledge update'
    });
  }
});

/**
 * Search industry knowledge
 * GET /api/v1/industry/search?q=query&limit=10
 */
router.get('/search', verifyKindeToken, async (req: Request, res: Response) => {
  try {
    const { q: query, limit = '10' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Query parameter "q" is required'
      });
    }
    
    const limitNum = Math.min(parseInt(limit as string) || 10, 50);
    
    // Get context from service
    const context = await industryKnowledgeService.getIndustryContext(query, limitNum);
    
    // Also search database for additional context
    const dbResults = await prisma.industryKnowledge.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      orderBy: [
        { relevanceScore: 'desc' },
        { lastUpdated: 'desc' }
      ],
      take: limitNum,
      select: {
        id: true,
        source: true,
        contentType: true,
        category: true,
        title: true,
        content: true,
        relevanceScore: true,
        lastUpdated: true,
        sourceUrl: true
      }
    });
    
    res.json({
      query,
      results: {
        contextual: context,
        database: dbResults
      },
      totalResults: dbResults.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error searching industry knowledge:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search industry knowledge'
    });
  }
});

/**
 * Get industry knowledge by category
 * GET /api/v1/industry/category/:category
 */
router.get('/category/:category', verifyKindeToken, async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { limit = '20' } = req.query;
    
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    
    const results = await prisma.industryKnowledge.findMany({
      where: {
        category: category,
        isActive: true
      },
      orderBy: [
        { relevanceScore: 'desc' },
        { lastUpdated: 'desc' }
      ],
      take: limitNum,
      select: {
        id: true,
        source: true,
        contentType: true,
        title: true,
        content: true,
        relevanceScore: true,
        lastUpdated: true,
        sourceUrl: true
      }
    });
    
    res.json({
      category,
      results,
      totalResults: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching industry knowledge by category:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch industry knowledge by category'
    });
  }
});

/**
 * Get available categories
 * GET /api/v1/industry/categories
 */
router.get('/categories', verifyKindeToken, async (req: Request, res: Response) => {
  try {
    const categories = await prisma.industryKnowledge.groupBy({
      by: ['category'],
      where: {
        isActive: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
    
    res.json({
      categories: categories.map(cat => ({
        name: cat.category,
        count: cat._count.id
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching industry categories:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch industry categories'
    });
  }
});

/**
 * Get industry sources status
 * GET /api/v1/industry/sources
 */
router.get('/sources', verifyKindeToken, async (req: Request, res: Response) => {
  try {
    const sources = await prisma.industryKnowledge.groupBy({
      by: ['source'],
      where: {
        isActive: true
      },
      _count: {
        id: true
      },
      _max: {
        lastUpdated: true
      }
    });
    
    res.json({
      sources: sources.map(source => ({
        name: source.source,
        itemCount: source._count.id,
        lastUpdated: source._max.lastUpdated
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching industry sources:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch industry sources'
    });
  }
});

export { router as industryRoutes };