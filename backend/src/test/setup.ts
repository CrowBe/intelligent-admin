import { beforeAll, afterAll, afterEach, vi, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';

// Create a deep mock of PrismaClient
export const prisma: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

// Set the global mock for the database module to use
global.prismaMock = prisma as any;

// Mock the PrismaClient module
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => prisma)
}));

// Mock the database module to return our mocked prisma
vi.mock('../db/index.js', () => ({
  prisma,
  default: prisma
}));

// Reset mocks before each test
beforeEach(() => {
  mockReset(prisma);
  
  // Setup default mock behaviors that tests commonly need
  // These can be overridden in individual tests
  prisma.$connect.mockResolvedValue();
  prisma.$disconnect.mockResolvedValue();
});

// Global test setup
beforeAll(async () => {
  // No database connection needed for mocked tests
  console.log('Test setup: Using mocked Prisma client');
});

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
});

afterAll(() => {
  // Clean up after all tests
  console.log('Test teardown: Cleaning up mocks');
});

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-that-is-at-least-32-characters-long';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/intelligent_admin_test';
process.env.KINDE_DOMAIN = 'test-domain';
process.env.KINDE_CLIENT_ID = 'test-client-id';
process.env.KINDE_CLIENT_SECRET = 'test-client-secret';
process.env.KINDE_REDIRECT_URI = 'http://localhost:3000/callback';
process.env.KINDE_LOGOUT_REDIRECT_URI = 'http://localhost:3000';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.FIREBASE_SERVICE_ACCOUNT_KEY = '{}';
process.env.OLLAMA_BASE_URL = 'http://localhost:11434';

// Prisma is already exported at the top of the file
