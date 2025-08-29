import { 
  PrismaClient,
  OnboardingProgress,
  UserPreference,
  EmailAnalysis,
  Task,
  User,
  Prisma
} from '@prisma/client';
import { BaseRepository } from './base/BaseRepository.js';

/**
 * Repository for OnboardingProgress entities
 */
export class OnboardingProgressRepository extends BaseRepository<
  OnboardingProgress,
  Prisma.OnboardingProgressCreateInput,
  Prisma.OnboardingProgressUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'onboardingProgress');
  }

  /**
   * Find progress by user ID
   */
  async findByUserId(userId: string): Promise<OnboardingProgress[]> {
    return await this.model.findMany({
      where: { userId },
      orderBy: { completedAt: 'asc' }
    });
  }

  /**
   * Find progress by user and step
   */
  async findByUserAndStep(userId: string, step: string): Promise<OnboardingProgress | null> {
    return await this.model.findUnique({
      where: {
        userId_step: {
          userId,
          step
        }
      }
    });
  }

  /**
   * Get completed steps for a user
   */
  async getCompletedSteps(userId: string): Promise<string[]> {
    const progress = await this.model.findMany({
      where: {
        userId,
        completedAt: { not: null }
      },
      select: { step: true }
    });

    return progress.map(p => p.step);
  }

  /**
   * Mark step as completed
   */
  async markStepCompleted(userId: string, step: string, data?: any): Promise<OnboardingProgress> {
    return await this.model.upsert({
      where: {
        userId_step: {
          userId,
          step
        }
      },
      create: {
        userId,
        step,
        completedAt: new Date(),
        data: data || {}
      },
      update: {
        completedAt: new Date(),
        data: data || {},
        skipped: false
      }
    });
  }

  /**
   * Mark step as skipped
   */
  async markStepSkipped(userId: string, step: string): Promise<OnboardingProgress> {
    return await this.model.upsert({
      where: {
        userId_step: {
          userId,
          step
        }
      },
      create: {
        userId,
        step,
        skipped: true,
        completedAt: new Date()
      },
      update: {
        skipped: true,
        completedAt: new Date()
      }
    });
  }
}

/**
 * Repository for UserPreference entities
 */
export class UserPreferenceRepository extends BaseRepository<
  UserPreference,
  Prisma.UserPreferenceCreateInput,
  Prisma.UserPreferenceUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'userPreference');
  }

  /**
   * Find preferences by user ID
   */
  async findByUserId(userId: string): Promise<UserPreference | null> {
    return await this.model.findUnique({
      where: { userId }
    });
  }

  /**
   * Upsert user preferences
   */
  async upsertPreferences(
    userId: string,
    preferences: any,
    businessProfile?: any
  ): Promise<UserPreference> {
    return await this.model.upsert({
      where: { userId },
      create: {
        userId,
        preferences,
        businessProfile
      },
      update: {
        preferences,
        businessProfile,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Update business profile
   */
  async updateBusinessProfile(userId: string, profile: any): Promise<UserPreference> {
    const existing = await this.findByUserId(userId);
    
    if (!existing) {
      return await this.create({
        userId,
        businessProfile: profile,
        preferences: {}
      });
    }

    return await this.update(existing.id, {
      businessProfile: profile,
      updatedAt: new Date()
    });
  }
}

/**
 * Repository for EmailAnalysis entities
 */
export class EmailAnalysisRepository extends BaseRepository<
  EmailAnalysis,
  Prisma.EmailAnalysisCreateInput,
  Prisma.EmailAnalysisUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'emailAnalysis');
  }

  /**
   * Find analyses by user ID
   */
  async findByUserId(userId: string, limit?: number): Promise<EmailAnalysis[]> {
    return await this.model.findMany({
      where: { userId },
      orderBy: { analyzedAt: 'desc' },
      take: limit
    });
  }

  /**
   * Find by email ID
   */
  async findByEmailId(emailId: string): Promise<EmailAnalysis | null> {
    return await this.model.findUnique({
      where: { emailId }
    });
  }

  /**
   * Find urgent emails
   */
  async findUrgentEmails(userId: string, since?: Date): Promise<EmailAnalysis[]> {
    const where: any = {
      userId,
      priority: 'urgent'
    };

    if (since) {
      where.analyzedAt = { gte: since };
    }

    return await this.model.findMany({
      where,
      orderBy: { urgencyScore: 'desc' }
    });
  }

  /**
   * Find emails by category
   */
  async findByCategory(userId: string, category: string): Promise<EmailAnalysis[]> {
    return await this.model.findMany({
      where: {
        userId,
        category
      },
      orderBy: { analyzedAt: 'desc' }
    });
  }

  /**
   * Find emails requiring action
   */
  async findActionRequired(userId: string): Promise<EmailAnalysis[]> {
    return await this.model.findMany({
      where: {
        userId,
        actionRequired: true,
        notificationSent: false
      },
      orderBy: { urgencyScore: 'desc' }
    });
  }

  /**
   * Mark notification sent
   */
  async markNotificationSent(id: string): Promise<EmailAnalysis> {
    return await this.update(id, {
      notificationSent: true
    });
  }

  /**
   * Get email statistics
   */
  async getStatistics(userId: string, days: number = 7): Promise<{
    total: number;
    urgent: number;
    actionRequired: number;
    byCategory: Record<string, number>;
  }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [total, urgent, actionRequired, categoryStats] = await Promise.all([
      this.model.count({
        where: {
          userId,
          analyzedAt: { gte: since }
        }
      }),
      this.model.count({
        where: {
          userId,
          priority: 'urgent',
          analyzedAt: { gte: since }
        }
      }),
      this.model.count({
        where: {
          userId,
          actionRequired: true,
          analyzedAt: { gte: since }
        }
      }),
      this.model.groupBy({
        by: ['category'],
        where: {
          userId,
          analyzedAt: { gte: since }
        },
        _count: { id: true }
      })
    ]);

    const byCategory: Record<string, number> = {};
    categoryStats.forEach(stat => {
      byCategory[stat.category] = stat._count.id;
    });

    return {
      total,
      urgent,
      actionRequired,
      byCategory
    };
  }
}

/**
 * Repository for Task entities
 */
export class TaskRepository extends BaseRepository<
  Task,
  Prisma.TaskCreateInput,
  Prisma.TaskUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'task');
  }

  /**
   * Find tasks by user ID
   */
  async findByUserId(userId: string, status?: string): Promise<Task[]> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return await this.model.findMany({
      where,
      orderBy: { dueDate: 'asc' }
    });
  }

  /**
   * Find pending tasks
   */
  async findPendingTasks(userId: string): Promise<Task[]> {
    return await this.findByUserId(userId, 'pending');
  }

  /**
   * Find overdue tasks
   */
  async findOverdueTasks(userId: string): Promise<Task[]> {
    return await this.model.findMany({
      where: {
        userId,
        status: 'pending',
        dueDate: { lt: new Date() }
      },
      orderBy: { dueDate: 'asc' }
    });
  }

  /**
   * Find tasks due soon
   */
  async findTasksDueSoon(userId: string, hoursAhead: number = 24): Promise<Task[]> {
    const future = new Date();
    future.setHours(future.getHours() + hoursAhead);

    return await this.model.findMany({
      where: {
        userId,
        status: 'pending',
        dueDate: {
          gte: new Date(),
          lte: future
        },
        reminderSent: false
      },
      orderBy: { dueDate: 'asc' }
    });
  }

  /**
   * Mark task as completed
   */
  async markCompleted(id: string): Promise<Task> {
    return await this.update(id, {
      status: 'completed',
      updatedAt: new Date()
    });
  }

  /**
   * Mark reminder sent
   */
  async markReminderSent(id: string): Promise<Task> {
    return await this.update(id, {
      reminderSent: true
    });
  }

  /**
   * Get task statistics
   */
  async getStatistics(userId: string): Promise<{
    total: number;
    pending: number;
    completed: number;
    overdue: number;
  }> {
    const [total, pending, completed, overdue] = await Promise.all([
      this.count({ userId } as any),
      this.model.count({
        where: {
          userId,
          status: 'pending'
        }
      }),
      this.model.count({
        where: {
          userId,
          status: 'completed'
        }
      }),
      this.model.count({
        where: {
          userId,
          status: 'pending',
          dueDate: { lt: new Date() }
        }
      })
    ]);

    return {
      total,
      pending,
      completed,
      overdue
    };
  }
}

/**
 * Repository for User entities
 */
export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user');
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.model.findUnique({
      where: { email }
    });
  }

  /**
   * Create or update user
   */
  async upsertUser(email: string, name?: string): Promise<User> {
    return await this.model.upsert({
      where: { email },
      create: {
        email,
        name
      },
      update: {
        name,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Find users created within a time range
   */
  async findUsersCreatedBetween(startDate: Date, endDate: Date): Promise<User[]> {
    return await this.model.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

// Export all repositories
export { IndustryItemRepository, IndustrySourceRepository } from './IndustryRepository.js';
export { 
  NotificationPreferenceRepository, 
  NotificationTokenRepository, 
  NotificationLogRepository 
} from './NotificationRepository.js';
