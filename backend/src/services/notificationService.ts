import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Notification types
export enum NotificationType {
  MORNING_BRIEF = 'morning_brief',
  URGENT_EMAIL = 'urgent_email',
  TASK_REMINDER = 'task_reminder',
  SYSTEM_ALERT = 'system_alert',
  CUSTOM = 'custom'
}

// Notification preference schema
const NotificationPreferenceSchema = z.object({
  userId: z.string(),
  type: z.nativeEnum(NotificationType),
  enabled: z.boolean().default(true),
  timing: z.object({
    startHour: z.number().min(0).max(23).default(7),
    startMinute: z.number().min(0).max(59).default(0),
    endHour: z.number().min(0).max(23).default(7),
    endMinute: z.number().min(0).max(59).default(30),
    timezone: z.string().default('Australia/Sydney'),
    daysOfWeek: z.array(z.number().min(0).max(6)).default([1, 2, 3, 4, 5]) // Mon-Fri
  }).optional(),
  channels: z.object({
    push: z.boolean().default(true),
    email: z.boolean().default(false),
    sms: z.boolean().default(false)
  }).optional()
});

export type NotificationPreference = z.infer<typeof NotificationPreferenceSchema>;

export class NotificationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create or update notification preferences for a user
   */
  async upsertPreferences(preferences: NotificationPreference) {
    const validated = NotificationPreferenceSchema.parse(preferences);
    
    return await this.prisma.notificationPreference.upsert({
      where: {
        userId_type: {
          userId: validated.userId,
          type: validated.type
        }
      },
      update: {
        enabled: validated.enabled,
        timingPreferences: validated.timing as any,
        channels: validated.channels as any,
        updatedAt: new Date()
      },
      create: {
        userId: validated.userId,
        type: validated.type,
        enabled: validated.enabled,
        timingPreferences: validated.timing as any,
        channels: validated.channels as any
      }
    });
  }

  /**
   * Get user's notification preferences
   */
  async getPreferences(userId: string) {
    return await this.prisma.notificationPreference.findMany({
      where: { userId }
    });
  }

  /**
   * Check if it's the right time to send a notification
   */
  isWithinTimeWindow(preference: any): boolean {
    const now = new Date();
    const timezone = preference.timingPreferences?.timezone || 'Australia/Sydney';
    
    // Convert to user's timezone
    const userTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const currentHour = userTime.getHours();
    const currentMinute = userTime.getMinutes();
    const currentDay = userTime.getDay();
    
    const timing = preference.timingPreferences;
    if (!timing) return true; // No timing restrictions
    
    // Check day of week
    if (timing.daysOfWeek && !timing.daysOfWeek.includes(currentDay)) {
      return false;
    }
    
    // Check time window
    const currentMinutes = currentHour * 60 + currentMinute;
    const startMinutes = (timing.startHour || 7) * 60 + (timing.startMinute || 0);
    const endMinutes = (timing.endHour || 7) * 60 + (timing.endMinute || 30);
    
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  /**
   * Send a push notification
   */
  async sendPushNotification(userId: string, notification: {
    title: string;
    body: string;
    data?: Record<string, any>;
    type?: NotificationType;
  }) {
    try {
      // Get user's FCM token
      const token = await this.prisma.notificationToken.findFirst({
        where: { 
          userId,
          active: true,
          platform: 'web'
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!token) {
        console.log(`No active FCM token for user ${userId}`);
        return null;
      }

      // Log the notification
      const log = await this.prisma.notificationLog.create({
        data: {
          userId,
          type: notification.type || NotificationType.CUSTOM,
          title: notification.title,
          body: notification.body,
          data: notification.data as any,
          status: 'pending',
          channel: 'push'
        }
      });

      // TODO: Integrate with Firebase Admin SDK to actually send
      // For now, we'll just mark it as sent
      await this.prisma.notificationLog.update({
        where: { id: log.id },
        data: { 
          status: 'sent',
          sentAt: new Date()
        }
      });

      return log;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  /**
   * Generate Morning Brief content
   */
  async generateMorningBrief(userId: string): Promise<{
    title: string;
    sections: Array<{
      heading: string;
      items: string[];
      priority: 'high' | 'medium' | 'low';
    }>;
    summary: string;
  }> {
    // Get user's recent data
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Get urgent emails count
    const urgentEmails = await this.prisma.emailAnalysis.count({
      where: {
        userId,
        priority: 'urgent',
        createdAt: { gte: yesterday }
      }
    });

    // Get pending tasks
    const pendingTasks = await this.prisma.task.count({
      where: {
        userId,
        status: 'pending'
      }
    });

    // Get today's calendar events (mock for now)
    const todayEvents = 3; // TODO: Integrate with calendar service

    // Build the brief
    const sections = [];

    // High priority section
    if (urgentEmails > 0) {
      sections.push({
        heading: '🔴 Urgent Items',
        items: [
          `${urgentEmails} urgent email${urgentEmails > 1 ? 's' : ''} require attention`,
          'Review and respond to critical customer inquiries'
        ],
        priority: 'high' as const
      });
    }

    // Medium priority section
    sections.push({
      heading: '📅 Today\'s Schedule',
      items: [
        `${todayEvents} appointment${todayEvents !== 1 ? 's' : ''} scheduled`,
        `${pendingTasks} task${pendingTasks !== 1 ? 's' : ''} pending completion`
      ],
      priority: 'medium' as const
    });

    // Low priority section
    sections.push({
      heading: '📊 Business Insights',
      items: [
        'Email response rate: 85% (above average)',
        'Customer satisfaction trending up',
        'Consider following up on yesterday\'s quotes'
      ],
      priority: 'low' as const
    });

    const summary = urgentEmails > 0 
      ? `You have ${urgentEmails} urgent items requiring immediate attention.`
      : 'No urgent items. Focus on scheduled tasks today.';

    return {
      title: `Good morning! Here's your brief for ${new Date().toLocaleDateString('en-AU')}`,
      sections,
      summary
    };
  }

  /**
   * Schedule Morning Brief for all users
   */
  async scheduleMorningBriefs() {
    console.log('Scheduling morning briefs...');
    
    // Get all users with morning brief enabled
    const preferences = await this.prisma.notificationPreference.findMany({
      where: {
        type: NotificationType.MORNING_BRIEF,
        enabled: true
      }
    });

    for (const pref of preferences) {
      if (this.isWithinTimeWindow(pref)) {
        try {
          const brief = await this.generateMorningBrief(pref.userId);
          
          await this.sendPushNotification(pref.userId, {
            title: '☀️ Morning Brief',
            body: brief.summary,
            data: { brief },
            type: NotificationType.MORNING_BRIEF
          });
          
          console.log(`Morning brief sent to user ${pref.userId}`);
        } catch (error) {
          console.error(`Failed to send morning brief to user ${pref.userId}:`, error);
        }
      }
    }
  }

  /**
   * Save FCM token for a user
   */
  async saveToken(userId: string, token: string, platform: 'web' | 'ios' | 'android' = 'web') {
    // Deactivate old tokens
    await this.prisma.notificationToken.updateMany({
      where: { userId, platform },
      data: { active: false }
    });

    // Save new token
    return await this.prisma.notificationToken.create({
      data: {
        userId,
        token,
        platform,
        active: true
      }
    });
  }

  /**
   * Get notification history for a user
   */
  async getHistory(userId: string, limit: number = 50) {
    return await this.prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    return await this.prisma.notificationLog.update({
      where: { id: notificationId },
      data: { 
        readAt: new Date(),
        status: 'read'
      }
    });
  }
}
