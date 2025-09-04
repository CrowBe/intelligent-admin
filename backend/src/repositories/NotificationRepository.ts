import type { 
  PrismaClient, 
  NotificationPreference, 
  NotificationToken, 
  NotificationLog,
  Prisma 
} from '@prisma/client';
import { BaseRepository } from './base/BaseRepository.js';

/**
 * Repository for NotificationPreference entities
 */
export class NotificationPreferenceRepository extends BaseRepository<
  NotificationPreference,
  Prisma.NotificationPreferenceCreateInput,
  Prisma.NotificationPreferenceUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'notificationPreference');
  }

  /**
   * Find preferences by user ID
   */
  async findByUserId(userId: string): Promise<NotificationPreference[]> {
    return await this.model.findMany({
      where: { userId },
      orderBy: { type: 'asc' }
    });
  }

  /**
   * Find preference by user ID and type
   */
  async findByUserAndType(userId: string, type: string): Promise<NotificationPreference | null> {
    return await this.model.findUnique({
      where: {
        userId_type: {
          userId,
          type
        }
      }
    });
  }

  /**
   * Find enabled preferences by type
   */
  async findEnabledByType(type: string): Promise<NotificationPreference[]> {
    return await this.model.findMany({
      where: {
        type,
        enabled: true
      }
    });
  }

  /**
   * Upsert preference
   */
  async upsertPreference(
    userId: string,
    type: string,
    data: Prisma.NotificationPreferenceUpdateInput
  ): Promise<NotificationPreference> {
    return await this.model.upsert({
      where: {
        userId_type: {
          userId,
          type
        }
      },
      create: {
        userId,
        type,
        ...data
      } as Prisma.NotificationPreferenceCreateInput,
      update: data
    });
  }

  /**
   * Toggle preference enabled status
   */
  async toggleEnabled(userId: string, type: string): Promise<NotificationPreference> {
    const preference = await this.findByUserAndType(userId, type);
    if (!preference) {
      throw new Error('Preference not found');
    }

    return await this.update(preference.id, {
      enabled: !preference.enabled
    });
  }

  /**
   * Get users with specific notification enabled
   */
  async getUsersWithNotificationEnabled(type: string): Promise<string[]> {
    const preferences = await this.model.findMany({
      where: {
        type,
        enabled: true
      },
      select: {
        userId: true
      }
    });

    return preferences.map(p => p.userId);
  }
}

/**
 * Repository for NotificationToken entities
 */
export class NotificationTokenRepository extends BaseRepository<
  NotificationToken,
  Prisma.NotificationTokenCreateInput,
  Prisma.NotificationTokenUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'notificationToken');
  }

  /**
   * Find active tokens by user ID
   */
  async findActiveByUserId(userId: string): Promise<NotificationToken[]> {
    return await this.model.findMany({
      where: {
        userId,
        active: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Find token by value
   */
  async findByToken(token: string): Promise<NotificationToken | null> {
    return await this.model.findFirst({
      where: { token }
    });
  }

  /**
   * Find active tokens by platform
   */
  async findActiveByPlatform(platform: string): Promise<NotificationToken[]> {
    return await this.model.findMany({
      where: {
        platform,
        active: true
      }
    });
  }

  /**
   * Deactivate all tokens for a user
   */
  async deactivateUserTokens(userId: string): Promise<number> {
    const result = await this.model.updateMany({
      where: { userId },
      data: { active: false }
    });
    return result.count;
  }

  /**
   * Deactivate a specific token
   */
  async deactivateToken(token: string): Promise<NotificationToken | null> {
    const existing = await this.findByToken(token);
    if (!existing) {
      return null;
    }

    return await this.update(existing.id, {
      active: false
    });
  }

  /**
   * Upsert token for user
   */
  async upsertUserToken(
    userId: string,
    token: string,
    platform: string
  ): Promise<NotificationToken> {
    // First deactivate any existing tokens for this user/platform combo
    await this.model.updateMany({
      where: {
        userId,
        platform
      },
      data: { active: false }
    });

    // Check if this token already exists
    const existing = await this.findByToken(token);
    
    if (existing) {
      return await this.update(existing.id, {
        active: true,
        userId,
        platform
      });
    }

    return await this.create({
      userId,
      token,
      platform,
      active: true
    });
  }
}

/**
 * Repository for NotificationLog entities
 */
export class NotificationLogRepository extends BaseRepository<
  NotificationLog,
  Prisma.NotificationLogCreateInput,
  Prisma.NotificationLogUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'notificationLog');
  }

  /**
   * Find logs by user ID
   */
  async findByUserId(
    userId: string,
    limit?: number
  ): Promise<NotificationLog[]> {
    return await this.model.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  /**
   * Find logs by status
   */
  async findByStatus(status: string): Promise<NotificationLog[]> {
    return await this.model.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Find pending notifications
   */
  async findPending(): Promise<NotificationLog[]> {
    return await this.findByStatus('pending');
  }

  /**
   * Find failed notifications
   */
  async findFailed(since?: Date): Promise<NotificationLog[]> {
    const where: any = { status: 'failed' };
    if (since) {
      where.createdAt = { gte: since };
    }

    return await this.model.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Mark notification as sent
   */
  async markAsSent(id: string): Promise<NotificationLog> {
    return await this.update(id, {
      status: 'sent',
      sentAt: new Date()
    });
  }

  /**
   * Mark notification as delivered
   */
  async markAsDelivered(id: string): Promise<NotificationLog> {
    return await this.update(id, {
      status: 'delivered'
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<NotificationLog> {
    return await this.update(id, {
      status: 'read',
      readAt: new Date()
    });
  }

  /**
   * Mark notification as failed
   */
  async markAsFailed(id: string, error?: string): Promise<NotificationLog> {
    const data: any = { status: 'failed' };
    if (error) {
      data.data = { error };
    }
    return await this.update(id, data);
  }

  /**
   * Get notification statistics for a user
   */
  async getUserStatistics(userId: string, days: number = 30): Promise<{
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const stats = await this.model.groupBy({
      by: ['status'],
      where: {
        userId,
        createdAt: { gte: since }
      },
      _count: { id: true }
    });

    const result = {
      total: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0
    };

    stats.forEach(stat => {
      result[stat.status as keyof typeof result] = stat._count.id;
      result.total += stat._count.id;
    });

    return result;
  }

  /**
   * Clean up old logs
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.model.deleteMany({
      where: {
        createdAt: { lt: cutoffDate }
      }
    });

    return result.count;
  }
}
