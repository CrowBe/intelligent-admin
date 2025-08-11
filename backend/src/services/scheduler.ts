import * as cron from 'node-cron';
import { notificationService } from './notificationService.js';
import { logger } from '../utils/logger.js';

export class SchedulerService {
  private static instance: SchedulerService;
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  private constructor() {}

  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  /**
   * Initialize all scheduled tasks
   */
  async initialize(): Promise<void> {
    try {
      // Schedule morning briefs - runs every minute during morning hours (6:30-8:30 AM)
      // This allows for user-specific timing within this window
      const morningBriefTask = cron.schedule('* 6-8 * * 1-5', async () => {
        logger.info('Running morning brief scheduler...');
        await notificationService.scheduleMorningBriefs();
      }, {
        timezone: 'Australia/Sydney'
      });

      this.tasks.set('morning-brief', morningBriefTask);

      // Schedule email monitoring - every 5 minutes during business hours
      const emailMonitorTask = cron.schedule('*/5 7-18 * * 1-5', async () => {
        logger.info('Running email urgency monitoring...');
        await this.checkForUrgentEmails();
      }, {
        timezone: 'Australia/Sydney'
      });

      this.tasks.set('email-monitor', emailMonitorTask);

      // Clean up old notification logs - daily at 2 AM
      const cleanupTask = cron.schedule('0 2 * * *', async () => {
        logger.info('Running notification log cleanup...');
        await this.cleanupOldNotificationLogs();
      }, {
        timezone: 'Australia/Sydney'
      });

      this.tasks.set('cleanup', cleanupTask);

      logger.info('Scheduler service initialized with tasks:', Array.from(this.tasks.keys()));
    } catch (error) {
      logger.error('Failed to initialize scheduler service:', error);
    }
  }

  /**
   * Start all scheduled tasks
   */
  start(): void {
    try {
      this.tasks.forEach((task, name) => {
        task.start();
        logger.info(`Started scheduled task: ${name}`);
      });
      
      logger.info('All scheduled tasks started successfully');
    } catch (error) {
      logger.error('Failed to start scheduled tasks:', error);
    }
  }

  /**
   * Stop all scheduled tasks
   */
  stop(): void {
    try {
      this.tasks.forEach((task, name) => {
        task.stop();
        logger.info(`Stopped scheduled task: ${name}`);
      });
      
      logger.info('All scheduled tasks stopped');
    } catch (error) {
      logger.error('Failed to stop scheduled tasks:', error);
    }
  }

  /**
   * Get status of all scheduled tasks
   */
  getStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    
    this.tasks.forEach((task, name) => {
      status[name] = task.getStatus() === "scheduled";
    });
    
    return status;
  }

  /**
   * Check for urgent emails and send notifications
   */
  private async checkForUrgentEmails(): Promise<void> {
    try {
      // This would integrate with the email analysis service
      // For now, this is a placeholder implementation
      logger.info('Email urgency monitoring - placeholder implementation');
      
      // TODO: Integrate with email analysis service
      // TODO: Query for recent emails with high urgency scores
      // TODO: Send notifications for urgent emails that haven't been notified yet
      
    } catch (error) {
      logger.error('Failed to check for urgent emails:', error);
    }
  }

  /**
   * Clean up old notification logs (keep last 30 days)
   */
  private async cleanupOldNotificationLogs(): Promise<void> {
    try {
      const { PrismaClient } = await import('@prisma/client');
      
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const result = await prisma.notificationLog.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      });
      
      logger.info(`Cleaned up ${result.count} old notification logs`);
      
      await prisma.$disconnect();
      
    } catch (error) {
      logger.error('Failed to clean up notification logs:', error);
    }
  }

  /**
   * Manually trigger morning brief for testing
   */
  async triggerMorningBrief(): Promise<void> {
    logger.info('Manually triggering morning brief...');
    await notificationService.scheduleMorningBriefs();
  }

  /**
   * Add a custom scheduled task
   */
  addTask(name: string, cronExpression: string, callback: () => Promise<void>): boolean {
    try {
      if (this.tasks.has(name)) {
        logger.warn(`Task with name '${name}' already exists`);
        return false;
      }

      const task = cron.schedule(cronExpression, callback, {
        timezone: 'Australia/Sydney'
      });

      this.tasks.set(name, task);
      logger.info(`Added scheduled task: ${name} with expression: ${cronExpression}`);
      return true;
      
    } catch (error) {
      logger.error(`Failed to add scheduled task '${name}':`, error);
      return false;
    }
  }

  /**
   * Remove a scheduled task
   */
  removeTask(name: string): boolean {
    try {
      const task = this.tasks.get(name);
      if (task) {
        task.stop();
        task.destroy();
        this.tasks.delete(name);
        logger.info(`Removed scheduled task: ${name}`);
        return true;
      } else {
        logger.warn(`Task with name '${name}' not found`);
        return false;
      }
    } catch (error) {
      logger.error(`Failed to remove scheduled task '${name}':`, error);
      return false;
    }
  }
}

export const schedulerService = SchedulerService.getInstance();