import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { industryRouter } from './routes/industry.js';
import { notificationRouter } from './routes/notifications.js';
import { onboardingRouter } from './routes/onboarding.js';
import { emailRouter } from './routes/emails.js';
import { prisma } from './services/prisma.js';
import { SchedulerService } from './services/scheduler.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json());
app.use(morgan('dev'));

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
const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`🚀 Backend listening on http://localhost:${port}`);
  console.log(`📍 API Endpoints:`);
  console.log(`   - Industry: http://localhost:${port}/api/v1/industry`);
  console.log(`   - Notifications: http://localhost:${port}/api/v1/notifications`);
  console.log(`   - Onboarding: http://localhost:${port}/api/v1/onboarding`);
  console.log(`   - Emails: http://localhost:${port}/api/v1/emails`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  scheduler.stop();
  await prisma.$disconnect();
  process.exit(0);
});
