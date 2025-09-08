import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { DIContainer } from '../RepositoryFactory.js';
import { createUnitOfWork } from '../UnitOfWork.js';

// Mock Prisma client for fast testing
const createMockPrismaClient = () => {
  const mockData = {
    industrySource: new Map(),
    industryItem: new Map(),
    user: new Map(),
    task: new Map()
  };

  let sourceIdCounter = 1;
  let itemIdCounter = 1;
  let userIdCounter = 1;
  let taskIdCounter = 1;

  return {
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    $transaction: vi.fn().mockImplementation((callback) => callback(mockPrisma)),

    industrySource: {
      create: vi.fn().mockImplementation(({ data }) => {
        const id = `source_${sourceIdCounter++}`;
        const now = new Date();
        const source = {
          id,
          name: data.name,
          url: data.url || null,
          isActive: data.isActive ?? true,
          lastCrawled: data.lastCrawled || null,
          createdAt: now,
          updatedAt: now,
          ...data
        };
        mockData.industrySource.set(id, source);
        return Promise.resolve(source);
      }),
      
      findUnique: vi.fn().mockImplementation(({ where }) => {
        if (where.id) {
          return Promise.resolve(mockData.industrySource.get(where.id) || null);
        }
        if (where.name) {
          const found = Array.from(mockData.industrySource.values())
            .find(source => source.name === where.name);
          return Promise.resolve(found || null);
        }
        return Promise.resolve(null);
      }),

      findMany: vi.fn().mockImplementation(({ where }) => {
        let sources = Array.from(mockData.industrySource.values());
        if (where?.isActive !== undefined) {
          sources = sources.filter(source => source.isActive === where.isActive);
        }
        return Promise.resolve(sources);
      }),

      update: vi.fn().mockImplementation(({ where, data }) => {
        const source = mockData.industrySource.get(where.id);
        if (!source) throw new Error('Source not found');
        
        const updated = {
          ...source,
          ...data,
          updatedAt: new Date()
        };
        mockData.industrySource.set(where.id, updated);
        return Promise.resolve(updated);
      }),

      deleteMany: vi.fn().mockImplementation(() => {
        const count = mockData.industrySource.size;
        mockData.industrySource.clear();
        return Promise.resolve({ count });
      })
    },

    industryItem: {
      create: vi.fn().mockImplementation(({ data }) => {
        const id = `item_${itemIdCounter++}`;
        const now = new Date();
        const item = {
          id,
          sourceId: data.source.connect.id,
          contentType: data.contentType,
          category: data.category,
          title: data.title,
          content: data.content,
          relevanceScore: data.relevanceScore || 0,
          sourceUrl: data.sourceUrl || null,
          lastUpdated: now,
          createdAt: now,
          updatedAt: now
        };
        mockData.industryItem.set(id, item);
        return Promise.resolve(item);
      }),

      findMany: vi.fn().mockImplementation(({ where, orderBy, take, skip }) => {
        let items = Array.from(mockData.industryItem.values());
        
        if (where?.contentType) {
          items = items.filter(item => item.contentType === where.contentType);
        }
        
        if (where?.OR) {
          const orResults = new Set();
          where.OR.forEach(condition => {
            if (condition.title?.contains) {
              items.filter(item => 
                item.title.toLowerCase().includes(condition.title.contains.toLowerCase())
              ).forEach(item => orResults.add(item));
            }
            if (condition.content?.contains) {
              items.filter(item => 
                item.content.toLowerCase().includes(condition.content.contains.toLowerCase())
              ).forEach(item => orResults.add(item));
            }
          });
          items = Array.from(orResults);
        }

        if (orderBy?.relevanceScore) {
          items.sort((a, b) => orderBy.relevanceScore === 'desc' 
            ? b.relevanceScore - a.relevanceScore 
            : a.relevanceScore - b.relevanceScore);
        }

        if (skip) items = items.slice(skip);
        if (take) items = items.slice(0, take);

        return Promise.resolve(items);
      }),

      groupBy: vi.fn().mockImplementation(({ by, _count }) => {
        const items = Array.from(mockData.industryItem.values());
        const groups = new Map();
        
        items.forEach(item => {
          const key = item[by[0]];
          if (!groups.has(key)) {
            groups.set(key, { [by[0]]: key, _count: { [by[0]]: 0 } });
          }
          groups.get(key)._count[by[0]]++;
        });

        return Promise.resolve(Array.from(groups.values()));
      }),

      count: vi.fn().mockImplementation(() => {
        return Promise.resolve(mockData.industryItem.size);
      }),

      deleteMany: vi.fn().mockImplementation(() => {
        const count = mockData.industryItem.size;
        mockData.industryItem.clear();
        return Promise.resolve({ count });
      })
    },

    user: {
      create: vi.fn().mockImplementation(({ data }) => {
        const id = `user_${userIdCounter++}`;
        const now = new Date();
        const user = {
          id,
          email: data.email,
          name: data.name || null,
          createdAt: now,
          updatedAt: now
        };
        mockData.user.set(id, user);
        return Promise.resolve(user);
      }),

      findUnique: vi.fn().mockImplementation(({ where }) => {
        if (where.email) {
          const found = Array.from(mockData.user.values())
            .find(user => user.email === where.email);
          return Promise.resolve(found || null);
        }
        return Promise.resolve(mockData.user.get(where.id) || null);
      }),

      upsert: vi.fn().mockImplementation(({ where, create, update }) => {
        const existing = Array.from(mockData.user.values())
          .find(user => user.email === where.email);
        
        if (existing) {
          const updated = { ...existing, ...update, updatedAt: new Date() };
          mockData.user.set(existing.id, updated);
          return Promise.resolve(updated);
        } else {
          const id = `user_${userIdCounter++}`;
          const now = new Date();
          const user = { id, ...create, createdAt: now, updatedAt: now };
          mockData.user.set(id, user);
          return Promise.resolve(user);
        }
      }),

      deleteMany: vi.fn().mockImplementation(() => {
        const count = mockData.user.size;
        mockData.user.clear();
        return Promise.resolve({ count });
      })
    },

    task: {
      create: vi.fn().mockImplementation(({ data }) => {
        const id = `task_${taskIdCounter++}`;
        const now = new Date();
        const task = {
          id,
          userId: data.userId,
          title: data.title,
          description: data.description || null,
          status: data.status || 'pending',
          dueDate: data.dueDate,
          reminderSent: data.reminderSent || false,
          createdAt: now,
          updatedAt: now
        };
        mockData.task.set(id, task);
        return Promise.resolve(task);
      }),

      findMany: vi.fn().mockImplementation(({ where, orderBy }) => {
        let tasks = Array.from(mockData.task.values());
        
        if (where?.userId) {
          tasks = tasks.filter(task => task.userId === where.userId);
        }
        if (where?.status) {
          tasks = tasks.filter(task => task.status === where.status);
        }
        if (where?.dueDate?.lt) {
          tasks = tasks.filter(task => task.dueDate < where.dueDate.lt);
        }

        return Promise.resolve(tasks);
      }),

      update: vi.fn().mockImplementation(({ where, data }) => {
        const task = mockData.task.get(where.id);
        if (!task) throw new Error('Task not found');
        
        const updated = { ...task, ...data, updatedAt: new Date() };
        mockData.task.set(where.id, updated);
        return Promise.resolve(updated);
      }),

      deleteMany: vi.fn().mockImplementation(() => {
        const count = mockData.task.size;
        mockData.task.clear();
        return Promise.resolve({ count });
      })
    }
  };
};

const mockPrisma = createMockPrismaClient();

describe('Repository Pattern Tests (Mocked)', () => {
  let container: DIContainer;
  let industryItemRepo: any;
  let industrySourceRepo: any;
  let userRepo: any;
  let taskRepo: any;

  beforeAll(async () => {
    // Initialize DI container with mock database
    DIContainer.initialize(mockPrisma as any);
    container = DIContainer.getInstance();
    
    // Get repository instances
    industryItemRepo = container.industryItem;
    industrySourceRepo = container.industrySource;
    userRepo = container.user;
    taskRepo = container.task;
  });

  beforeEach(async () => {
    // Clear all mock data
    vi.clearAllMocks();
    await mockPrisma.industryItem.deleteMany();
    await mockPrisma.industrySource.deleteMany();
    await mockPrisma.task.deleteMany();
    await mockPrisma.user.deleteMany();
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
  });
});