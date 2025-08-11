import admin from 'firebase-admin';
import { prisma } from '../db/index.js';
import { logger } from '../utils/logger';



interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  icon?: string;
  badge?: string;
  sound?: string;
}

interface MorningBriefData {
  urgentCount: number;
  highPriorityEmails: Array<{
    from: string;
    subject: string;
    urgencyScore: number;
    businessImpact: string;
  }>;
  calendarConflicts: Array<{
    title: string;
    time: string;
    conflict: string;
  }>;
  opportunities: Array<{
    type: string;
    description: string;
    value?: string;
  }>;
}

export class NotificationService {
  private static instance: NotificationService;
  private initialized = false;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize Firebase Admin SDK
   */
  async initialize(): Promise<void> {
    try {
      if (this.initialized) return;

      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!serviceAccountKey) {
        logger.warn('Firebase service account key not found. Push notifications disabled.');
        return;
      }

      const serviceAccount = JSON.parse(serviceAccountKey);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });

      this.initialized = true;
      logger.info('Firebase Admin SDK initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  /**
   * Send push notification to a specific user
   */
  async sendNotification(
    userId: string, 
    payload: NotificationPayload,
    options: {
      priority?: 'normal' | 'high';
      timeToLive?: number;
      collapseKey?: string;
    } = {}
  ): Promise<boolean> {
    try {
      if (!this.initialized) {
        await this.initialize();
        if (!this.initialized) return false;
      }

      // Get user's FCM tokens
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { notificationTokens: true }
      });

      if (!user || !user.notificationTokens.length) {
        logger.warn(`No FCM tokens found for user ${userId}`);
        return false;
      }

      const tokens = user.notificationTokens.map(token => token.token);

      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/icons/app-icon-192x192.png',
        },
        data: payload.data || {},
        android: {
          priority: options.priority || 'high',
          ttl: options.timeToLive || 24 * 60 * 60 * 1000, // 24 hours
          collapseKey: options.collapseKey,
          notification: {
            icon: payload.icon || '/icons/app-icon-192x192.png',
            color: '#2563eb', // Blue theme color
            sound: payload.sound || 'default',
          }
        },
        apns: {
          payload: {
            aps: {
              badge: payload.badge ? parseInt(payload.badge) : undefined,
              sound: payload.sound || 'default',
            }
          }
        },
        tokens
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && (
            resp.error?.code === 'messaging/invalid-registration-token' ||
            resp.error?.code === 'messaging/registration-token-not-registered'
          )) {
            invalidTokens.push(tokens[idx]);
          }
        });

        if (invalidTokens.length > 0) {
          await this.removeInvalidTokens(userId, invalidTokens);
        }
      }

      // Log notification
      await prisma.notificationLog.create({
        data: {
          userId,
          type: options.collapseKey || 'general',
          title: payload.title,
          body: payload.body,
          sent: response.successCount > 0,
          failureReason: response.failureCount > 0 ? 'Some tokens failed' : null
        }
      });

      logger.info(`Sent notification to user ${userId}: ${response.successCount}/${tokens.length} successful`);
      return response.successCount > 0;

    } catch (error) {
      logger.error('Failed to send push notification:', error);
      return false;
    }
  }

  /**
   * Generate and send Morning Brief notification
   */
  async sendMorningBrief(userId: string): Promise<boolean> {
    try {
      // Check user's notification preferences
      const preferences = await prisma.notificationPreferences.findUnique({
        where: { userId }
      });

      if (!preferences?.morningBriefEnabled) {
        return false;
      }

      // Generate morning brief data
      const briefData = await this.generateMorningBrief(userId);
      
      if (!briefData.urgentCount && !briefData.calendarConflicts.length) {
        // No urgent items - skip notification to avoid spam
        return false;
      }

      const title = briefData.urgentCount > 0 
        ? `🔴 Morning Brief: ${briefData.urgentCount} urgent ${briefData.urgentCount === 1 ? 'issue' : 'issues'}`
        : '📅 Morning Brief: Calendar conflicts detected';

      const body = this.formatMorningBriefBody(briefData);

      return await this.sendNotification(userId, {
        title,
        body,
        data: {
          type: 'morning_brief',
          urgentCount: briefData.urgentCount.toString(),
          hasConflicts: briefData.calendarConflicts.length > 0 ? 'true' : 'false'
        },
        icon: '/icons/morning-brief-icon.png'
      }, {
        priority: briefData.urgentCount > 0 ? 'high' : 'normal',
        collapseKey: 'morning_brief'
      });

    } catch (error) {
      logger.error('Failed to send morning brief:', error);
      return false;
    }
  }

  /**
   * Schedule morning brief for all users
   */
  async scheduleMorningBriefs(): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        where: {
          notificationPreferences: {
            morningBriefEnabled: true
          }
        },
        include: {
          notificationPreferences: true
        }
      });

      const promises = users.map(async (user) => {
        const prefs = user.notificationPreferences;
        if (!prefs) return false;

        // Check if it's within the user's preferred time window
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;
        
        const startTime = prefs.morningBriefTime || 420; // Default 7:00 AM (420 minutes)
        const endTime = startTime + 30; // 30-minute window

        if (currentTime >= startTime && currentTime <= endTime) {
          return await this.sendMorningBrief(user.id);
        }
        return false;
      });

      const results = await Promise.allSettled(promises);
      const sent = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
      
      logger.info(`Morning brief scheduling completed: ${sent} briefs sent`);
    } catch (error) {
      logger.error('Failed to schedule morning briefs:', error);
    }
  }

  /**
   * Register FCM token for user
   */
  async registerToken(userId: string, token: string, deviceType: 'web' | 'android' | 'ios'): Promise<void> {
    try {
      await prisma.notificationToken.upsert({
        where: {
          userId_token: {
            userId,
            token
          }
        },
        update: {
          lastUsed: new Date(),
          deviceType
        },
        create: {
          userId,
          token,
          deviceType,
          lastUsed: new Date()
        }
      });

      logger.info(`Registered FCM token for user ${userId}`);
    } catch (error) {
      logger.error('Failed to register FCM token:', error);
    }
  }

  /**
   * Remove invalid FCM tokens
   */
  private async removeInvalidTokens(userId: string, tokens: string[]): Promise<void> {
    try {
      await prisma.notificationToken.deleteMany({
        where: {
          userId,
          token: { in: tokens }
        }
      });

      logger.info(`Removed ${tokens.length} invalid FCM tokens for user ${userId}`);
    } catch (error) {
      logger.error('Failed to remove invalid tokens:', error);
    }
  }

  /**
   * Generate morning brief data
   */
  private async generateMorningBrief(userId: string): Promise<MorningBriefData> {
    const briefData: MorningBriefData = {
      urgentCount: 0,
      highPriorityEmails: [],
      calendarConflicts: [],
      opportunities: []
    };

    try {
      // Get urgent emails from last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { emailUrgencyDetectionService } = await import('./emailUrgencyDetection');
      const urgentEmails = await emailUrgencyDetectionService.getUrgentEmailsForUser(userId, yesterday);

      briefData.urgentCount = urgentEmails.length;
      briefData.highPriorityEmails = urgentEmails.map(email => ({
        from: email.senderEmail,
        subject: email.subject,
        urgencyScore: email.urgencyScore,
        businessImpact: email.businessImpact || 'Unknown issue needs attention'
      }));

      // TODO: Integrate with calendar service for conflict detection
      // TODO: Integrate with opportunity detection system (follow-up reminders, etc.)

      logger.info(`Generated morning brief for user ${userId}: ${briefData.urgentCount} urgent emails`);
      
    } catch (error) {
      logger.error('Failed to generate morning brief data:', error);
    }

    return briefData;
  }

  /**
   * Format morning brief notification body
   */
  private formatMorningBriefBody(data: MorningBriefData): string {
    const parts: string[] = [];

    if (data.urgentCount > 0) {
      const topEmail = data.highPriorityEmails[0];
      if (topEmail) {
        parts.push(`${topEmail.from}: ${topEmail.businessImpact}`);
      }
    }

    if (data.calendarConflicts.length > 0) {
      parts.push(`${data.calendarConflicts.length} schedule conflicts`);
    }

    if (data.opportunities.length > 0) {
      parts.push(`${data.opportunities.length} new opportunities`);
    }

    return parts.join(' • ') || 'Tap to review your daily briefing';
  }

  /**
   * Update user notification preferences
   */
  async updateNotificationPreferences(
    userId: string, 
    preferences: {
      morningBriefEnabled?: boolean;
      morningBriefTime?: number; // Minutes from midnight
      urgentEmailsEnabled?: boolean;
      calendarAlertsEnabled?: boolean;
      weekendNotifications?: boolean;
    }
  ): Promise<void> {
    try {
      await prisma.notificationPreferences.upsert({
        where: { userId },
        update: preferences,
        create: {
          userId,
          ...preferences
        }
      });

      logger.info(`Updated notification preferences for user ${userId}`);
    } catch (error) {
      logger.error('Failed to update notification preferences:', error);
    }
  }

  /**
   * Send urgent email notification
   */
  async sendUrgentEmailAlert(
    userId: string,
    emailData: {
      from: string;
      subject: string;
      urgencyScore: number;
      businessImpact: string;
    }
  ): Promise<boolean> {
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId }
    });

    if (!preferences?.urgentEmailsEnabled) {
      return false;
    }

    return await this.sendNotification(userId, {
      title: '🔴 Urgent Email',
      body: `${emailData.from}: ${emailData.businessImpact}`,
      data: {
        type: 'urgent_email',
        urgencyScore: emailData.urgencyScore.toString(),
        from: emailData.from,
        subject: emailData.subject
      }
    }, {
      priority: 'high',
      collapseKey: 'urgent_email'
    });
  }
}

export const notificationService = NotificationService.getInstance();