import type { PrismaClient } from '@prisma/client';
import { NotificationService } from './notificationService.js';
import { fileUploadService } from './fileUpload.js';
import { logInfo, logError } from '../utils/logger.js';

export class SchedulerService {
  private readonly intervals: Map<string, NodeJS.Timeout> = new Map();
  private readonly notificationService: NotificationService;

  constructor(private readonly prisma: PrismaClient) {
    this.notificationService = new NotificationService();
  }

  /**
   * Start the scheduler
   */
  start() {
    logInfo('🕐 Scheduler service started');
    
    // Schedule morning briefs check every 5 minutes
    this.scheduleTask('morning-briefs', 5 * 60 * 1000, () => {
      this.checkAndSendMorningBriefs();
    });

    // Schedule email urgency checks every 15 minutes
    this.scheduleTask('email-urgency', 15 * 60 * 1000, () => {
      this.checkUrgentEmails();
    });

    // Schedule task reminders every 30 minutes
    this.scheduleTask('task-reminders', 30 * 60 * 1000, () => {
      this.checkTaskReminders();
    });

    // Schedule file cleanup every hour
    this.scheduleTask('file-cleanup', 60 * 60 * 1000, () => {
      this.cleanupOldFiles();
    });

    // Initial run
    this.checkAndSendMorningBriefs();
  }

  /**
   * Stop the scheduler
   */
  stop() {
    logInfo('🛑 Scheduler service stopping');
    this.intervals.forEach((interval, name) => {
      logInfo(`Clearing scheduled task: ${name}`);
      clearInterval(interval);
    });
    this.intervals.clear();
  }

  /**
   * Schedule a recurring task
   */
  private scheduleTask(name: string, intervalMs: number, task: () => void | Promise<void>) {
    // Clear existing interval if it exists
    const existing = this.intervals.get(name);
    if (existing) {
      clearInterval(existing);
    }

    // Set new interval
    const interval = setInterval(async () => {
      try {
        logInfo(`Running scheduled task: ${name}`);
        await task();
      } catch (error) {
        logError(`Error in scheduled task ${name}:`, error instanceof Error ? error : new Error(String(error)));
      }
    }, intervalMs);

    this.intervals.set(name, interval);
  }

  /**
   * Check and send morning briefs
   */
  private async checkAndSendMorningBriefs() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Only run between 6 AM and 9 AM
    if (currentHour < 6 || currentHour > 9) {
      return;
    }

    logInfo(`Checking morning briefs at ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
    
    try {
      await this.notificationService.scheduleMorningBriefs();
    } catch (error) {
      logError('Error scheduling morning briefs:', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Check for urgent emails and notify users
   */
  private async checkUrgentEmails() {
    try {
      // Get emails analyzed in the last 15 minutes that are urgent
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      
      const urgentEmails = await this.prisma.emailAnalysis.findMany({
        where: {
          priority: 'urgent',
          createdAt: { gte: fifteenMinutesAgo },
          notificationSent: false
        },
        include: {
          user: true
        }
      });

      for (const email of urgentEmails) {
        // Check if user has urgent email notifications enabled
        const pref = await this.prisma.notificationPreference.findFirst({
          where: {
            userId: email.userId,
            type: 'urgent_email',
            enabled: true
          }
        });

        if (pref) {
          await this.notificationService.sendPushNotification(email.userId, {
            title: '🔴 Urgent Email',
            body: `${email.subject} - requires immediate attention`,
            data: { emailId: email.id },
            type: 'urgent_email' as any
          });

          // Mark as notified
          await this.prisma.emailAnalysis.update({
            where: { id: email.id },
            data: { notificationSent: true }
          });
        }
      }
    } catch (error) {
      logError('Error checking urgent emails:', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Check for task reminders
   */
  private async checkTaskReminders() {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      // Find tasks due within the next hour that haven't been reminded
      const upcomingTasks = await this.prisma.task.findMany({
        where: {
          status: 'pending',
          dueDate: {
            gte: now,
            lte: oneHourFromNow
          },
          reminderSent: false
        }
      });

      for (const task of upcomingTasks) {
        // Check if user has task reminders enabled
        const pref = await this.prisma.notificationPreference.findFirst({
          where: {
            userId: task.userId,
            type: 'task_reminder',
            enabled: true
          }
        });

        if (pref) {
          const minutesUntilDue = Math.round((task.dueDate.getTime() - now.getTime()) / (1000 * 60));
          
          await this.notificationService.sendPushNotification(task.userId, {
            title: '⏰ Task Reminder',
            body: `"${task.title}" is due in ${minutesUntilDue} minutes`,
            data: { taskId: task.id },
            type: 'task_reminder' as any
          });

          // Mark as reminded
          await this.prisma.task.update({
            where: { id: task.id },
            data: { reminderSent: true }
          });
        }
      }
    } catch (error) {
      logError('Error checking task reminders:', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Clean up old uploaded files
   */
  private async cleanupOldFiles() {
    try {
      logInfo('Running scheduled file cleanup');
      await fileUploadService.ensureUploadDirectories();
      const cleanedCount = await fileUploadService.cleanupOldFiles(24);
      logInfo(`File cleanup completed: removed ${cleanedCount} old files`);
    } catch (error) {
      logError('Error during scheduled file cleanup:', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Schedule a one-time task
   */
  scheduleOnce(name: string, delayMs: number, task: () => void | Promise<void>) {
    setTimeout(async () => {
      try {
        logInfo(`Running one-time task: ${name}`);
        await task();
      } catch (error) {
        logError(`Error in one-time task ${name}:`, error instanceof Error ? error : new Error(String(error)));
      }
    }, delayMs);
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      running: this.intervals.size > 0,
      tasks: Array.from(this.intervals.keys()),
      timestamp: new Date().toISOString()
    };
  }
}
