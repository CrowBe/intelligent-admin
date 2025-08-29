import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';
import { env, PORT, CORS_ORIGIN, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from './config/env.js';
import { logInfo, logError, stream } from './utils/logger.js';
import { industryRouter } from './routes/industry.js';
import { notificationRouter } from './routes/notifications.js';
import { onboardingRouter } from './routes/onboarding.js';
import { emailRouter } from './routes/emails.js';
import { prisma } from './services/prisma.js';
import { SchedulerService } from './services/scheduler.js';
import { initializeDependencies, cleanup } from './services/initialization.js';

// Initialize dependency injection container
initializeDependencies();

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
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      scheduler: scheduler.getStatus()
    }
  });
});

// API Routes
app.use('/api/v1/industry', industryRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/onboarding', onboardingRouter);
app.use('/api/v1/emails', emailRouter);

// Initialize scheduler
const scheduler = new SchedulerService(prisma);
scheduler.start();

// Start server
app.listen(PORT, () => {
  const port = PORT;
  logInfo(`🚀 Backend listening on http://localhost:${port}`);
  logInfo(`📍 API Endpoints:`);
  logInfo(`   - Industry: http://localhost:${port}/api/v1/industry`);
  logInfo(`   - Notifications: http://localhost:${port}/api/v1/notifications`);
  logInfo(`   - Onboarding: http://localhost:${port}/api/v1/onboarding`);
  logInfo(`   - Emails: http://localhost:${port}/api/v1/emails`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logInfo('SIGTERM received, shutting down gracefully');
  scheduler.stop();
  await cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logInfo('SIGINT received, shutting down gracefully');
  scheduler.stop();
  await cleanup();
  process.exit(0);
});
