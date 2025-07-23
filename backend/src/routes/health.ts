import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const router = Router();
const prisma = new PrismaClient();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '0.1.0',
      services: {
        database: 'healthy',
        memory: {
          used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
          total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        },
      },
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    logger.error('Health check failed', { error: (error as Error).message });
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
});

// Detailed health check for monitoring
router.get('/detailed', async (req, res) => {
  try {
    const [dbResult] = await Promise.allSettled([
      prisma.$queryRaw`SELECT 1`,
    ]);

    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '0.1.0',
      services: {
        database: {
          status: dbResult.status === 'fulfilled' ? 'healthy' : 'unhealthy',
          responseTime: Date.now(),
        },
      },
      system: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version,
      },
    };

    const isHealthy = dbResult.status === 'fulfilled';
    res.status(isHealthy ? 200 : 503).json(healthCheck);
  } catch (error) {
    logger.error('Detailed health check failed', { error: (error as Error).message });
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'System health check failed',
    });
  }
});

export { router as healthRoutes };