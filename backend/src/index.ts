import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';
import type { Server } from 'http';
import { env, PORT, CORS_ORIGIN, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, SERVER_TIMEOUT, validateProductionConfig } from './config/env.js';
import { logInfo, logError, stream } from './utils/logger.js';
import { industryRouter } from './routes/industry.js';
import { notificationRouter } from './routes/notifications.js';
import { onboardingRouter } from './routes/onboarding.js';
import { emailRouter } from './routes/emails.js';
import { adminRouter } from './routes/admin.js';
import { prisma, checkDatabaseHealth } from './services/prisma.js';
import { SchedulerService } from './services/scheduler.js';
import { initializeDependencies, cleanup } from './services/initialization.js';
import { fileUploadService } from './services/fileUpload.js';

// Initialize dependency injection container
initializeDependencies();

// Validate production configuration to prevent insecure defaults
try {
  validateProductionConfig();
  logInfo('✅ Production configuration validated');
} catch (error) {
  logError('❌ Production configuration validation failed:', error);
  throw error;
}

// Initialize scheduler (needed for health endpoint)
const scheduler = new SchedulerService(prisma);

const app = express();

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Middleware
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN.split(',') }));
app.use(compression()); // Compress all routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize()); // Prevent NoSQL injection attacks
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(morgan('combined', { stream }));

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Health check
app.get('/health', (_req, res) => {
  void (async (): Promise<void> => {
  // Perform database health check with configured timeout
  const dbHealth = await checkDatabaseHealth();
  
  if (dbHealth.error !== null && dbHealth.error !== undefined) {
    logError('Database health check failed:', dbHealth.error);
  }
  
  const schedulerStatus = scheduler.getStatus();
  
  // Check file system health
  let fileSystemStatus = 'healthy';
  let fileSystemError: string | null = null;
  let fileSystemStats: Record<string, unknown> | null = null;
  
  try {
    await fileUploadService.ensureUploadDirectories();
    const stats = await fileUploadService.getUploadStats();
    fileSystemStats = {
      totalFiles: stats.totalFiles,
      tempFiles: stats.tempFiles,
      totalSizeMB: Math.round(stats.totalSizeBytes / (1024 * 1024) * 100) / 100,
      oldestFileAgeHours: Math.round(stats.oldestFileAge / (1000 * 60 * 60) * 100) / 100
    };
  } catch (error) {
    fileSystemStatus = 'degraded';
    fileSystemError = error instanceof Error ? error.message : 'File system error';
    logError('File system health check failed:', error);
  }
  
  const allServicesHealthy = dbHealth.status === 'connected' && 
                            schedulerStatus.running && 
                            fileSystemStatus === 'healthy';
  
  const healthStatus = {
    status: allServicesHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbHealth.status,
        responseTime: dbHealth.responseTime,
        error: dbHealth.error
      },
      scheduler: schedulerStatus,
      fileSystem: {
        status: fileSystemStatus,
        stats: fileSystemStats,
        error: fileSystemError
      }
    }
  };
  
  // Return 503 if critical services are down
  const statusCode = healthStatus.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
  })();
});

// API Routes
app.use('/api/v1/industry', industryRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/onboarding', onboardingRouter);
app.use('/api/v1/emails', emailRouter);
app.use('/api/v1/admin', adminRouter);

// Start scheduler after all setup
scheduler.start();

// Start server (only if not in test environment)
let server: Server | undefined;
if (env.NODE_ENV !== 'test') {
  server = app.listen(PORT, (error?: Error) => {
    if (error !== null && error !== undefined) {
      logError('❌ Failed to start server:', error);
      // eslint-disable-next-line n/no-process-exit
      process.exit(1);
    }
    
    // Configure server timeouts
    if (server !== null && server !== undefined) {
      server.timeout = SERVER_TIMEOUT;
      server.keepAliveTimeout = 65000; // 65 seconds (should be > load balancer idle timeout)
      server.headersTimeout = 66000; // 66 seconds (must be > keepAliveTimeout)
    }
    
    logInfo(`🚀 Backend listening on http://localhost:${PORT}`);
    logInfo(`⏱️ Server timeout: ${SERVER_TIMEOUT}ms, Keep-alive: 65s, Headers: 66s`);
    logInfo(`📍 API Endpoints:`);
    logInfo(`   - Industry: http://localhost:${PORT}/api/v1/industry`);
    logInfo(`   - Notifications: http://localhost:${PORT}/api/v1/notifications`);
    logInfo(`   - Onboarding: http://localhost:${PORT}/api/v1/onboarding`);
    logInfo(`   - Emails: http://localhost:${PORT}/api/v1/emails`);
    logInfo(`   - Admin: http://localhost:${PORT}/api/v1/admin`);
  });
  
  // Handle server errors during runtime
  server.on('error', (error: Error) => {
    logError('❌ Server runtime error:', error);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  });
}

// Export for testing
export { app, scheduler, server };

// Graceful shutdown with comprehensive error handling
const gracefulShutdown = async (signal: string): Promise<void> => {
  logInfo(`${signal} received, shutting down gracefully`);
  
  try {
    // Close server first with error handling
    if (server !== undefined) {
      await new Promise<void>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        server!.close((error?: Error) => {
          if (error !== null && error !== undefined) {
            logError('Error closing HTTP server:', error);
            reject(error);
          } else {
            logInfo('HTTP server closed');
            resolve();
          }
        });
      });
    }
    
    // Stop scheduler with error handling
    try {
      scheduler.stop();
      logInfo('Scheduler stopped');
    } catch (error) {
      logError('Error stopping scheduler:', error);
      // Continue with cleanup even if scheduler fails to stop
    }
    
    // Cleanup with timeout and comprehensive error handling
    await Promise.race([
(async (): Promise<void> => {
        try {
          // Clean up temporary files during shutdown
          try {
            const tempFilesRemoved = await fileUploadService.cleanupAllTemporaryFiles();
            logInfo(`Shutdown cleanup: removed ${tempFilesRemoved} temporary files`);
          } catch (error) {
            logError('Error during file cleanup on shutdown:', error);
            // Continue with other cleanup operations
          }
          
          await cleanup();
          logInfo('Cleanup completed successfully');
        } catch (error) {
          logError('Error during cleanup operations:', error);
          throw error;
        }
      })(),
      new Promise<void>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Cleanup timeout after 5 seconds'));
        }, 5000);
      })
    ]);
    
    logInfo('Graceful shutdown completed successfully');
    // eslint-disable-next-line n/no-process-exit
    process.exit(0);
  } catch (error) {
    logError('Error during graceful shutdown:', error);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
};

// Signal handlers with proper error handling
process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM').catch((error) => {
    logError('Unhandled error in SIGTERM graceful shutdown:', error);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  });
});

process.on('SIGINT', () => {
  gracefulShutdown('SIGINT').catch((error) => {
    logError('Unhandled error in SIGINT graceful shutdown:', error);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  });
});

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (error: Error) => {
  logError('Uncaught exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION').catch(() => {
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason: unknown) => {
  logError('Unhandled promise rejection:', reason);
  gracefulShutdown('UNHANDLED_REJECTION').catch(() => {
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  });
});
