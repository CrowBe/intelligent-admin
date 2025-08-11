import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
  var prismaMock: PrismaClient | undefined;
}

// Use a singleton pattern for the database connection
// This allows us to mock it properly in tests
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'test') {
  // In test environment, we'll use a mock that will be set by the test setup
  // For now, create a placeholder that will be replaced by the setup
  if (!global.prismaMock) {
    // This will be replaced by the actual mock in test setup
    prisma = {} as PrismaClient;
  } else {
    prisma = global.prismaMock;
  }
} else {
  // In production/development, use a real PrismaClient
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  prisma = global.prisma;
}

export { prisma };
export default prisma;
