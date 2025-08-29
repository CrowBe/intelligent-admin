import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { DIContainer } from '../RepositoryFactory.js';
import { createUnitOfWork } from '../UnitOfWork.js';
import type { 
  IndustryItemRepository, 
  IndustrySourceRepository,
  UserRepository,
  TaskRepository 
} from '../index.js';

// Test database setup
const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_TEST_URL || process.env.DATABASE_URL
    }
  }
});

describe('Repository Pattern Tests', () => {
  let container: DIContainer;
  let industryItemRepo: IndustryItemRepository;
  let industrySourceRepo: IndustrySourceRepository;
  let userRepo: UserRepository;
  let taskRepo: TaskRepository;

  beforeAll(async () => {
    // Initialize DI container with test database
    DIContainer.initialize(testPrisma);
    container = DIContainer.getInstance();
    
    // Get repository instances
    industryItemRepo = container.industryItem;
    industrySourceRepo = container.industrySource;
    userRepo = container.user;
    taskRepo = container.task;
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await testPrisma.industryItem.deleteMany();
    await testPrisma.industrySource.deleteMany();
    await testPrisma.task.deleteMany();
    await testPrisma.user.deleteMany();
  });

  describe('IndustrySourceRepository', () => {
    it('should create a new industry source', async () => {
      const source = await industrySourceRepo.create({
        name: 'Test Source'
      });

      expect(source).toBeDefined();
      expect(source.name).toBe('Test Source');
      expect(source.isActive).toBe(true);
    });

    it('should find source by name', async () => {
      await industrySourceRepo.create({
        name: 'Unique Source'
      });

      const found = await industrySourceRepo.findByName('Unique Source');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Unique Source');
    });

    it('should find active sources', async () => {
      await industrySourceRepo.create({
        name: 'Active Source',
        isActive: true
      });

      await industrySourceRepo.create({
        name: 'Inactive Source',
        isActive: false
      });

      const activeSources = await industrySourceRepo.findActiveSources();
      expect(activeSources).toHaveLength(1);
      expect(activeSources[0].name).toBe('Active Source');
    });

    it('should update last crawled timestamp', async () => {
      const source = await industrySourceRepo.create({
        name: 'Source to Update'
      });

      const beforeUpdate = source.lastCrawled;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const updated = await industrySourceRepo.updateLastCrawled(source.id);
      
      expect(updated.lastCrawled).toBeDefined();
      expect(updated.lastCrawled).not.toBe(beforeUpdate);
    });

    it('should toggle source active status', async () => {
      const source = await industrySourceRepo.create({
        name: 'Toggle Source',
        isActive: true
      });

      const toggled = await industrySourceRepo.toggleActiveStatus(source.id);
      expect(toggled.isActive).toBe(false);

      const toggledAgain = await industrySourceRepo.toggleActiveStatus(source.id);
      expect(toggledAgain.isActive).toBe(true);
    });
  });

  describe('IndustryItemRepository', () => {
    let testSource: any;

    beforeEach(async () => {
      testSource = await industrySourceRepo.create({
        name: 'Test Item Source'
      });
    });

    it('should create an industry item', async () => {
      const item = await industryItemRepo.create({
        source: { connect: { id: testSource.id } },
        contentType: 'regulation',
        category: 'electrical',
        title: 'Test Regulation',
        content: 'Test content',
        relevanceScore: 0.8
      });

      expect(item).toBeDefined();
      expect(item.title).toBe('Test Regulation');
      expect(item.contentType).toBe('regulation');
    });

    it('should search items by query', async () => {
      await industryItemRepo.create({
        source: { connect: { id: testSource.id } },
        contentType: 'standard',
        category: 'safety',
        title: 'Electrical Safety Standard',
        content: 'Important safety guidelines for electrical work',
        relevanceScore: 0.9
      });

      await industryItemRepo.create({
        source: { connect: { id: testSource.id } },
        contentType: 'regulation',
        category: 'plumbing',
        title: 'Plumbing Regulations',
        content: 'Water safety regulations',
        relevanceScore: 0.7
      });

      const results = await industryItemRepo.search('safety', 10);
      expect(results).toHaveLength(2);
      expect(results[0].relevanceScore).toBeGreaterThanOrEqual(results[1].relevanceScore);
    });

    it('should find items by content type', async () => {
      await industryItemRepo.create({
        source: { connect: { id: testSource.id } },
        contentType: 'pricing',
        category: 'materials',
        title: 'Material Costs',
        content: 'Current pricing information',
        relevanceScore: 0.5
      });

      await industryItemRepo.create({
        source: { connect: { id: testSource.id } },
        contentType: 'pricing',
        category: 'labor',
        title: 'Labor Rates',
        content: 'Standard labor rates',
        relevanceScore: 0.6
      });

      const pricingItems = await industryItemRepo.findByContentType('pricing');
      expect(pricingItems).toHaveLength(2);
      expect(pricingItems.every(item => item.contentType === 'pricing')).toBe(true);
    });

    it('should get categories with counts', async () => {
      await industryItemRepo.create({
        source: { connect: { id: testSource.id } },
        contentType: 'standard',
        category: 'electrical',
        title: 'Item 1',
        content: 'Content 1',
        relevanceScore: 0.5
      });

      await industryItemRepo.create({
        source: { connect: { id: testSource.id } },
        contentType: 'standard',
        category: 'electrical',
        title: 'Item 2',
        content: 'Content 2',
        relevanceScore: 0.5
      });

      await industryItemRepo.create({
        source: { connect: { id: testSource.id } },
        contentType: 'standard',
        category: 'plumbing',
        title: 'Item 3',
        content: 'Content 3',
        relevanceScore: 0.5
      });

      const categories = await industryItemRepo.getCategoriesWithCounts();
      expect(categories).toHaveLength(2);
      
      const electricalCategory = categories.find(c => c.category === 'electrical');
      expect(electricalCategory?.count).toBe(2);
      
      const plumbingCategory = categories.find(c => c.category === 'plumbing');
      expect(plumbingCategory?.count).toBe(1);
    });
  });

  describe('UserRepository', () => {
    it('should create a new user', async () => {
      const user = await userRepo.create({
        email: 'test@example.com',
        name: 'Test User'
      });

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
    });

    it('should find user by email', async () => {
      await userRepo.create({
        email: 'findme@example.com',
        name: 'Find Me'
      });

      const found = await userRepo.findByEmail('findme@example.com');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Find Me');
    });

    it('should upsert user', async () => {
      // First upsert - should create
      const created = await userRepo.upsertUser('upsert@example.com', 'Initial Name');
      expect(created.email).toBe('upsert@example.com');
      expect(created.name).toBe('Initial Name');

      // Second upsert - should update
      const updated = await userRepo.upsertUser('upsert@example.com', 'Updated Name');
      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe('Updated Name');
    });
  });

  describe('TaskRepository', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await userRepo.create({
        email: 'taskuser@example.com',
        name: 'Task User'
      });
    });

    it('should create a task', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);

      const task = await taskRepo.create({
        userId: testUser.id,
        title: 'Test Task',
        description: 'Task description',
        dueDate
      });

      expect(task).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.status).toBe('pending');
    });

    it('should find pending tasks', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);

      await taskRepo.create({
        userId: testUser.id,
        title: 'Pending Task',
        dueDate,
        status: 'pending'
      });

      await taskRepo.create({
        userId: testUser.id,
        title: 'Completed Task',
        dueDate,
        status: 'completed'
      });

      const pendingTasks = await taskRepo.findPendingTasks(testUser.id);
      expect(pendingTasks).toHaveLength(1);
      expect(pendingTasks[0].title).toBe('Pending Task');
    });

    it('should mark task as completed', async () => {
      const task = await taskRepo.create({
        userId: testUser.id,
        title: 'Task to Complete',
        dueDate: new Date()
      });

      const completed = await taskRepo.markCompleted(task.id);
      expect(completed.status).toBe('completed');
    });

    it('should get task statistics', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      // Create tasks with different statuses
      await taskRepo.create({
        userId: testUser.id,
        title: 'Pending Future',
        dueDate: futureDate,
        status: 'pending'
      });

      await taskRepo.create({
        userId: testUser.id,
        title: 'Pending Overdue',
        dueDate: pastDate,
        status: 'pending'
      });

      await taskRepo.create({
        userId: testUser.id,
        title: 'Completed',
        dueDate: futureDate,
        status: 'completed'
      });

      const stats = await taskRepo.getStatistics(testUser.id);
      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.overdue).toBe(1);
    });
  });

  describe('Unit of Work Pattern', () => {
    it('should handle transactions correctly', async () => {
      const uow = createUnitOfWork(testPrisma);

      await uow.transaction(async (transactionalUow) => {
        const userRepo = transactionalUow.repositories.getUserRepository();
        const taskRepo = transactionalUow.repositories.getTaskRepository();

        const user = await userRepo.create({
          email: 'transaction@example.com',
          name: 'Transaction User'
        });

        await taskRepo.create({
          userId: user.id,
          title: 'Transactional Task',
          dueDate: new Date()
        });
      });

      // Verify both were created
      const user = await userRepo.findByEmail('transaction@example.com');
      expect(user).toBeDefined();

      const tasks = await taskRepo.findByUserId(user!.id);
      expect(tasks).toHaveLength(1);
    });

    it('should rollback on error', async () => {
      const uow = createUnitOfWork(testPrisma);

      try {
        await uow.transaction(async (transactionalUow) => {
          const userRepo = transactionalUow.repositories.getUserRepository();

          await userRepo.create({
            email: 'rollback@example.com',
            name: 'Rollback User'
          });

          // Force an error
          throw new Error('Intentional error');
        });
      } catch (error) {
        // Expected error
      }

      // Verify nothing was created
      const user = await userRepo.findByEmail('rollback@example.com');
      expect(user).toBeNull();
    });
  });

  describe('Pagination', () => {
    it('should paginate results correctly', async () => {
      const testSource = await industrySourceRepo.create({
        name: 'Pagination Source'
      });

      // Create 15 items
      for (let i = 1; i <= 15; i++) {
        await industryItemRepo.create({
          source: { connect: { id: testSource.id } },
          contentType: 'standard',
          category: 'test',
          title: `Item ${i}`,
          content: `Content ${i}`,
          relevanceScore: 0.5
        });
      }

      // Get first page
      const page1 = await industryItemRepo.findPaginated(
        {} as any,
        { page: 1, pageSize: 5 }
      );

      expect(page1.data).toHaveLength(5);
      expect(page1.total).toBe(15);
      expect(page1.totalPages).toBe(3);
      expect(page1.hasNext).toBe(true);
      expect(page1.hasPrevious).toBe(false);

      // Get second page
      const page2 = await industryItemRepo.findPaginated(
        {} as any,
        { page: 2, pageSize: 5 }
      );

      expect(page2.data).toHaveLength(5);
      expect(page2.hasNext).toBe(true);
      expect(page2.hasPrevious).toBe(true);

      // Get last page
      const page3 = await industryItemRepo.findPaginated(
        {} as any,
        { page: 3, pageSize: 5 }
      );

      expect(page3.data).toHaveLength(5);
      expect(page3.hasNext).toBe(false);
      expect(page3.hasPrevious).toBe(true);
    });
  });
});
