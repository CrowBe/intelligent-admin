import { PrismaClient } from '@prisma/client';
import {
  IndustryItemRepository,
  IndustrySourceRepository,
  NotificationPreferenceRepository,
  NotificationTokenRepository,
  NotificationLogRepository,
  OnboardingProgressRepository,
  UserPreferenceRepository,
  EmailAnalysisRepository,
  TaskRepository,
  UserRepository
} from './index.js';

/**
 * Factory class for creating and managing repository instances
 * Implements singleton pattern for repository instances
 */
export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private prisma: PrismaClient;
  private repositories: Map<string, any>;

  private constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.repositories = new Map();
  }

  /**
   * Get singleton instance of RepositoryFactory
   */
  static getInstance(prisma: PrismaClient): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory(prisma);
    }
    return RepositoryFactory.instance;
  }

  /**
   * Get or create IndustryItemRepository
   */
  getIndustryItemRepository(): IndustryItemRepository {
    const key = 'industryItem';
    if (!this.repositories.has(key)) {
      this.repositories.set(key, new IndustryItemRepository(this.prisma));
    }
    return this.repositories.get(key);
  }

  /**
   * Get or create IndustrySourceRepository
   */
  getIndustrySourceRepository(): IndustrySourceRepository {
    const key = 'industrySource';
    if (!this.repositories.has(key)) {
      this.repositories.set(key, new IndustrySourceRepository(this.prisma));
    }
    return this.repositories.get(key);
  }

  /**
   * Get or create NotificationPreferenceRepository
   */
  getNotificationPreferenceRepository(): NotificationPreferenceRepository {
    const key = 'notificationPreference';
    if (!this.repositories.has(key)) {
      this.repositories.set(key, new NotificationPreferenceRepository(this.prisma));
    }
    return this.repositories.get(key);
  }

  /**
   * Get or create NotificationTokenRepository
   */
  getNotificationTokenRepository(): NotificationTokenRepository {
    const key = 'notificationToken';
    if (!this.repositories.has(key)) {
      this.repositories.set(key, new NotificationTokenRepository(this.prisma));
    }
    return this.repositories.get(key);
  }

  /**
   * Get or create NotificationLogRepository
   */
  getNotificationLogRepository(): NotificationLogRepository {
    const key = 'notificationLog';
    if (!this.repositories.has(key)) {
      this.repositories.set(key, new NotificationLogRepository(this.prisma));
    }
    return this.repositories.get(key);
  }

  /**
   * Get or create OnboardingProgressRepository
   */
  getOnboardingProgressRepository(): OnboardingProgressRepository {
    const key = 'onboardingProgress';
    if (!this.repositories.has(key)) {
      this.repositories.set(key, new OnboardingProgressRepository(this.prisma));
    }
    return this.repositories.get(key);
  }

  /**
   * Get or create UserPreferenceRepository
   */
  getUserPreferenceRepository(): UserPreferenceRepository {
    const key = 'userPreference';
    if (!this.repositories.has(key)) {
      this.repositories.set(key, new UserPreferenceRepository(this.prisma));
    }
    return this.repositories.get(key);
  }

  /**
   * Get or create EmailAnalysisRepository
   */
  getEmailAnalysisRepository(): EmailAnalysisRepository {
    const key = 'emailAnalysis';
    if (!this.repositories.has(key)) {
      this.repositories.set(key, new EmailAnalysisRepository(this.prisma));
    }
    return this.repositories.get(key);
  }

  /**
   * Get or create TaskRepository
   */
  getTaskRepository(): TaskRepository {
    const key = 'task';
    if (!this.repositories.has(key)) {
      this.repositories.set(key, new TaskRepository(this.prisma));
    }
    return this.repositories.get(key);
  }

  /**
   * Get or create UserRepository
   */
  getUserRepository(): UserRepository {
    const key = 'user';
    if (!this.repositories.has(key)) {
      this.repositories.set(key, new UserRepository(this.prisma));
    }
    return this.repositories.get(key);
  }

  /**
   * Clear all cached repository instances
   */
  clearCache(): void {
    this.repositories.clear();
  }

  /**
   * Get the underlying Prisma client
   */
  getPrismaClient(): PrismaClient {
    return this.prisma;
  }
}

/**
 * Dependency injection container for repositories
 */
export class DIContainer {
  private static instance: DIContainer;
  private repositoryFactory: RepositoryFactory;

  private constructor(prisma: PrismaClient) {
    this.repositoryFactory = RepositoryFactory.getInstance(prisma);
  }

  /**
   * Initialize the DI container
   */
  static initialize(prisma: PrismaClient): void {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer(prisma);
    }
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      throw new Error('DIContainer not initialized. Call DIContainer.initialize(prisma) first.');
    }
    return DIContainer.instance;
  }

  /**
   * Get repository factory
   */
  getRepositoryFactory(): RepositoryFactory {
    return this.repositoryFactory;
  }

  /**
   * Shorthand methods for getting repositories
   */
  get industryItem() {
    return this.repositoryFactory.getIndustryItemRepository();
  }

  get industrySource() {
    return this.repositoryFactory.getIndustrySourceRepository();
  }

  get notificationPreference() {
    return this.repositoryFactory.getNotificationPreferenceRepository();
  }

  get notificationToken() {
    return this.repositoryFactory.getNotificationTokenRepository();
  }

  get notificationLog() {
    return this.repositoryFactory.getNotificationLogRepository();
  }

  get onboardingProgress() {
    return this.repositoryFactory.getOnboardingProgressRepository();
  }

  get userPreference() {
    return this.repositoryFactory.getUserPreferenceRepository();
  }

  get emailAnalysis() {
    return this.repositoryFactory.getEmailAnalysisRepository();
  }

  get task() {
    return this.repositoryFactory.getTaskRepository();
  }

  get user() {
    return this.repositoryFactory.getUserRepository();
  }

  /**
   * Get Prisma client for transactions
   */
  get prisma() {
    return this.repositoryFactory.getPrismaClient();
  }
}
