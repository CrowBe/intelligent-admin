import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

// Test database instance
let testPrismaInstance: PrismaClient | null = null;

export async function setupTestDatabase(): Promise<PrismaClient> {
  if (testPrismaInstance) {
    return testPrismaInstance;
  }

  // Clean up any existing test database
  const testDbPath = path.join(process.cwd(), 'test.db');
  try {
    await fs.unlink(testDbPath);
  } catch {
    // File doesn't exist, that's fine
  }

  // Create test database client
  testPrismaInstance = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./test.db'
      }
    },
    log: [] // Disable logging during tests
  });

  // Try to use existing Prisma client or apply schema if needed
  try {
    // Just try to connect - if it fails, the database doesn't exist
    await testPrismaInstance.$connect();
    await testPrismaInstance.$queryRaw`SELECT 1`;
    // If we get here, database is already set up
  } catch {
    // Database doesn't exist or schema is wrong, try to create it
    const { execSync } = await import('child_process');
    try {
      // Apply schema using regular Prisma client (will adapt to SQLite)
      execSync('npx prisma db push --accept-data-loss --force-reset', { 
        stdio: 'pipe',
        cwd: process.cwd(),
        env: {
          ...process.env,
          DATABASE_URL: 'file:./test.db'
        }
      });
    } catch (error) {
      // If schema push fails, create minimal database manually
      await testPrismaInstance.$connect();
      
      // Create basic tables manually for testing
      const sql = `
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "email" TEXT NOT NULL UNIQUE,
          "name" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS "Task" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "dueDate" DATETIME NOT NULL,
          "reminderSent" BOOLEAN NOT NULL DEFAULT 0,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS "IndustrySource" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL UNIQUE,
          "url" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT 1,
          "lastCrawled" DATETIME,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS "IndustryItem" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "sourceId" TEXT NOT NULL,
          "contentType" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "relevanceScore" REAL NOT NULL DEFAULT 0,
          "sourceUrl" TEXT,
          "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("sourceId") REFERENCES "IndustrySource"("id")
        );
      `;
      
      const statements = sql.split(';').filter(stmt => stmt.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          await testPrismaInstance.$executeRawUnsafe(statement);
        }
      }
    }
  }

  // Connect to database
  await testPrismaInstance.$connect();
  return testPrismaInstance;
}

export async function teardownTestDatabase(): Promise<void> {
  if (testPrismaInstance) {
    await testPrismaInstance.$disconnect();
    testPrismaInstance = null;
  }

  // Clean up test database file
  const testDbPath = path.join(process.cwd(), 'test.db');
  try {
    await fs.unlink(testDbPath);
  } catch {
    // File doesn't exist or couldn't be deleted, that's fine
  }
}

export function getTestPrisma(): PrismaClient {
  if (!testPrismaInstance) {
    throw new Error('Test database not initialized. Call setupTestDatabase() first.');
  }
  return testPrismaInstance;
}