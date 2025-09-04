import { PrismaClient } from '@prisma/client';
import { DATABASE_CONNECTION_TIMEOUT, DATABASE_QUERY_TIMEOUT } from '../config/env.js';

/**
 * Prisma client instance with configured timeouts
 */
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env['DATABASE_URL']
    }
  },
  log: [
    { level: 'query', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
    { level: 'error', emit: 'stdout' }
  ]
});

// Configure global connection timeout
// Note: Prisma doesn't expose direct timeout configuration in the constructor
// These timeouts are handled at the connection pool level via DATABASE_URL parameters
// For PostgreSQL: ?connection_timeout=10&query_timeout=30
// We'll handle this through environment variable processing

/**
 * Enhanced database URL with timeout parameters
 */
const addTimeoutParams = (url: string): string => {
  const urlObj = new URL(url);
  
  // Add timeout parameters if not already present
  if (!urlObj.searchParams.has('connection_timeout')) {
    urlObj.searchParams.set('connection_timeout', Math.floor(DATABASE_CONNECTION_TIMEOUT / 1000).toString());
  }
  
  if (!urlObj.searchParams.has('query_timeout')) {
    urlObj.searchParams.set('query_timeout', Math.floor(DATABASE_QUERY_TIMEOUT / 1000).toString());
  }
  
  // For PostgreSQL, use statement_timeout for query timeout
  if (!urlObj.searchParams.has('statement_timeout')) {
    urlObj.searchParams.set('statement_timeout', `${DATABASE_QUERY_TIMEOUT}ms`);
  }
  
  return urlObj.toString();
};

// Apply timeout configuration to DATABASE_URL if needed
if (process.env['DATABASE_URL'] && !process.env['DATABASE_URL'].includes('connection_timeout')) {
  process.env['DATABASE_URL'] = addTimeoutParams(process.env['DATABASE_URL']);
}

/**
 * Database connection health check with timeout
 */
export const checkDatabaseHealth = async (): Promise<{
  status: 'connected' | 'disconnected';
  responseTime: number | null;
  error: string | null;
}> => {
  const start = Date.now();
  
  try {
    // Use a race between query and timeout
    await Promise.race([
      prisma.$queryRaw`SELECT 1 as status`,
      new Promise((_, reject) => 
        setTimeout(() => { reject(new Error('Database health check timeout')); }, DATABASE_CONNECTION_TIMEOUT)
      )
    ]);
    
    const responseTime = Date.now() - start;
    return {
      status: 'connected',
      responseTime,
      error: null
    };
  } catch (error) {
    return {
      status: 'disconnected',
      responseTime: null,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
};

/**
 * Execute query with explicit timeout
 */
export const executeWithTimeout = async <T>(
  query: () => Promise<T>,
  timeoutMs: number = DATABASE_QUERY_TIMEOUT
): Promise<T> => {
  return Promise.race([
    query(),
    new Promise<never>((_, reject) =>
      setTimeout(() => { reject(new Error(`Query timeout after ${timeoutMs}ms`)); }, timeoutMs)
    )
  ]);
};
