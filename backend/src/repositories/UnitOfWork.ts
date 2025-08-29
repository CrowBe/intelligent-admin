import { PrismaClient } from '@prisma/client';
import { RepositoryFactory } from './RepositoryFactory.js';

/**
 * Unit of Work pattern implementation for managing database transactions
 * across multiple repositories
 */
export class UnitOfWork {
  private prisma: PrismaClient;
  private repositoryFactory: RepositoryFactory;
  private isInTransaction: boolean = false;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.repositoryFactory = RepositoryFactory.getInstance(prisma);
  }

  /**
   * Get repository factory for accessing repositories
   */
  get repositories() {
    return this.repositoryFactory;
  }

  /**
   * Execute work within a transaction
   * @param work - The work to execute within the transaction
   * @returns The result of the work
   */
  async transaction<T>(work: (uow: UnitOfWork) => Promise<T>): Promise<T> {
    if (this.isInTransaction) {
      // Already in a transaction, just execute the work
      return await work(this);
    }

    this.isInTransaction = true;
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Create a new UnitOfWork with the transaction client
        const transactionalUow = new UnitOfWork(tx as PrismaClient);
        transactionalUow.isInTransaction = true;
        return await work(transactionalUow);
      });
      return result;
    } finally {
      this.isInTransaction = false;
    }
  }

  /**
   * Execute multiple operations in a transaction with automatic rollback on failure
   */
  async executeInTransaction(operations: Array<() => Promise<any>>): Promise<any[]> {
    return await this.transaction(async () => {
      const results = [];
      for (const operation of operations) {
        results.push(await operation());
      }
      return results;
    });
  }

  /**
   * Commit changes (used when managing transactions manually)
   * Note: With Prisma, transactions are automatically committed
   */
  async commit(): Promise<void> {
    // Prisma handles commits automatically
    // This method is here for API consistency
  }

  /**
   * Rollback changes (used when managing transactions manually)
   * Note: With Prisma, transactions are automatically rolled back on error
   */
  async rollback(): Promise<void> {
    // Prisma handles rollbacks automatically
    // This method is here for API consistency
    throw new Error('Transaction rollback requested');
  }

  /**
   * Check if currently in a transaction
   */
  get inTransaction(): boolean {
    return this.isInTransaction;
  }

  /**
   * Get the Prisma client
   */
  get client(): PrismaClient {
    return this.prisma;
  }
}

/**
 * Scoped Unit of Work for specific business operations
 */
export class ScopedUnitOfWork extends UnitOfWork {
  private completedOperations: string[] = [];
  private failedOperations: string[] = [];

  /**
   * Track an operation as completed
   */
  markOperationCompleted(operationName: string): void {
    this.completedOperations.push(operationName);
  }

  /**
   * Track an operation as failed
   */
  markOperationFailed(operationName: string, error?: Error): void {
    this.failedOperations.push(operationName);
    if (error) {
      console.error(`Operation ${operationName} failed:`, error);
    }
  }

  /**
   * Get operation status
   */
  getOperationStatus() {
    return {
      completed: [...this.completedOperations],
      failed: [...this.failedOperations],
      totalCompleted: this.completedOperations.length,
      totalFailed: this.failedOperations.length
    };
  }

  /**
   * Clear operation tracking
   */
  clearOperationTracking(): void {
    this.completedOperations = [];
    this.failedOperations = [];
  }

  /**
   * Execute a tracked operation
   */
  async executeTrackedOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T | null> {
    try {
      const result = await operation();
      this.markOperationCompleted(operationName);
      return result;
    } catch (error) {
      this.markOperationFailed(operationName, error as Error);
      throw error;
    }
  }
}

/**
 * Business-specific Unit of Work implementations
 */
export class BusinessUnitOfWork extends ScopedUnitOfWork {
  /**
   * Complete onboarding process for a user
   */
  async completeUserOnboarding(
    userId: string,
    businessProfile: any,
    notificationPreferences: any
  ): Promise<void> {
    await this.transaction(async (uow) => {
      // Update user preferences
      await uow.executeTrackedOperation('updateUserPreferences', async () => {
        return await uow.repositories.getUserPreferenceRepository().upsertPreferences(
          userId,
          {},
          businessProfile
        );
      });

      // Set notification preferences
      await uow.executeTrackedOperation('setNotificationPreferences', async () => {
        const notificationRepo = uow.repositories.getNotificationPreferenceRepository();
        const promises = Object.entries(notificationPreferences).map(([type, settings]) =>
          notificationRepo.upsertPreference(userId, type, settings as any)
        );
        return await Promise.all(promises);
      });

      // Mark onboarding as completed
      await uow.executeTrackedOperation('markOnboardingComplete', async () => {
        return await uow.repositories.getOnboardingProgressRepository()
          .markStepCompleted(userId, 'completed');
      });
    });
  }

  /**
   * Process and analyze an email
   */
  async processEmail(
    userId: string,
    emailData: any,
    sendNotification: boolean = true
  ): Promise<void> {
    await this.transaction(async (uow) => {
      // Save email analysis
      const analysis = await uow.executeTrackedOperation('saveEmailAnalysis', async () => {
        return await uow.repositories.getEmailAnalysisRepository().create(emailData);
      });

      if (!analysis) {return;}

      // Send notification if needed
      if (sendNotification && analysis.priority === 'urgent') {
        await uow.executeTrackedOperation('sendNotification', async () => {
          const log = await uow.repositories.getNotificationLogRepository().create({
            userId,
            type: 'urgent_email',
            title: 'Urgent Email',
            body: `You have an urgent email from ${analysis.sender}`,
            channel: 'push',
            status: 'pending',
            data: { emailId: analysis.id }
          });

          // Mark email as notification sent
          await uow.repositories.getEmailAnalysisRepository()
            .markNotificationSent(analysis.id);

          return log;
        });
      }
    });
  }

  /**
   * Clean up old data across multiple tables
   */
  async performDataCleanup(daysToKeep: number = 90): Promise<{
    notificationLogs: number;
    completedTasks: number;
  }> {
    return await this.transaction(async (uow) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // Clean notification logs
      const notificationLogs = await uow.executeTrackedOperation('cleanNotificationLogs', async () => {
        return await uow.repositories.getNotificationLogRepository()
          .cleanupOldLogs(daysToKeep);
      }) || 0;

      // Clean completed tasks
      const completedTasks = await uow.executeTrackedOperation('cleanCompletedTasks', async () => {
        return await uow.repositories.getTaskRepository()
          .deleteMany({ 
            status: 'completed',
            updatedAt: { lt: cutoffDate }
          } as any);
      }) || 0;

      return {
        notificationLogs,
        completedTasks
      };
    });
  }
}

/**
 * Factory function for creating Unit of Work instances
 */
export function createUnitOfWork(prisma: PrismaClient, type?: 'basic' | 'scoped' | 'business'): UnitOfWork {
  switch (type) {
    case 'scoped':
      return new ScopedUnitOfWork(prisma);
    case 'business':
      return new BusinessUnitOfWork(prisma);
    case 'basic':
    default:
      return new UnitOfWork(prisma);
  }
}
