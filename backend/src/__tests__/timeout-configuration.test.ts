import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkDatabaseHealth, executeWithTimeout } from '../services/prisma.js';
import { HttpTimeoutError, HttpError } from '../utils/httpClient.js';
import { env } from '../config/env.js';

describe('Timeout Configuration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Environment Variable Validation', () => {
    it('should have valid timeout configuration values', () => {
      expect(env.DATABASE_CONNECTION_TIMEOUT).toBeGreaterThan(0);
      expect(env.DATABASE_QUERY_TIMEOUT).toBeGreaterThan(0);
      expect(env.HTTP_REQUEST_TIMEOUT).toBeGreaterThan(0);
      expect(env.OPENAI_TIMEOUT).toBeGreaterThan(0);
      expect(env.SERVER_TIMEOUT).toBeGreaterThan(0);
    });

    it('should have logical timeout relationships', () => {
      expect(env.DATABASE_QUERY_TIMEOUT).toBeGreaterThan(env.DATABASE_CONNECTION_TIMEOUT);
      expect(env.SERVER_TIMEOUT).toBeGreaterThan(env.HTTP_REQUEST_TIMEOUT);
    });

    it('should have reasonable database timeout values', () => {
      expect(env.DATABASE_CONNECTION_TIMEOUT).toBeGreaterThanOrEqual(1000);
      expect(env.DATABASE_CONNECTION_TIMEOUT).toBeLessThanOrEqual(30000);
      expect(env.DATABASE_QUERY_TIMEOUT).toBeGreaterThanOrEqual(5000);
      expect(env.DATABASE_QUERY_TIMEOUT).toBeLessThanOrEqual(300000);
    });

    it('should have reasonable HTTP timeout values', () => {
      expect(env.HTTP_REQUEST_TIMEOUT).toBeGreaterThanOrEqual(5000);
      expect(env.HTTP_REQUEST_TIMEOUT).toBeLessThanOrEqual(180000);
      expect(env.OPENAI_TIMEOUT).toBeGreaterThanOrEqual(10000);
      expect(env.OPENAI_TIMEOUT).toBeLessThanOrEqual(300000);
    });

    it('should have reasonable server timeout values', () => {
      expect(env.SERVER_TIMEOUT).toBeGreaterThanOrEqual(30000);
      expect(env.SERVER_TIMEOUT).toBeLessThanOrEqual(600000);
    });
  });

  describe('Database Timeout Utilities', () => {
    it('should handle query timeout with executeWithTimeout', async () => {
      const slowQuery = (): Promise<string> => new Promise((resolve) => {
        setTimeout(() => {
          resolve('success');
        }, 2000);
      });

      await expect(executeWithTimeout(slowQuery, 1000)).rejects.toThrow('Query timeout after 1000ms');
    });

    it('should execute query successfully within timeout', async () => {
      const fastQuery = (): Promise<string> => new Promise((resolve) => {
        setTimeout(() => {
          resolve('success');
        }, 500);
      });

      const result = await executeWithTimeout(fastQuery, 1000);
      expect(result).toBe('success');
    });

    it('should return database health check structure', async () => {
      const result = await checkDatabaseHealth();
      
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('responseTime');
      expect(result).toHaveProperty('error');
      
      expect(['connected', 'disconnected']).toContain(result.status);
      
      if (result.status === 'connected') {
        expect(result.responseTime).toBeGreaterThanOrEqual(0);
        expect(result.error).toBeNull();
      } else {
        expect(result.responseTime).toBeNull();
        expect(result.error).toBeTruthy();
      }
    });
  });

  describe('Server Timeout Configuration', () => {
    it('should validate server timeout environment variable', () => {
      expect(env.SERVER_TIMEOUT).toBeTypeOf('number');
      expect(env.SERVER_TIMEOUT).toBeGreaterThan(30000); // At least 30 seconds
    });
  });

  describe('Timeout Error Classes', () => {
    it('should create HttpTimeoutError with correct message', () => {
      const error = new HttpTimeoutError(5000);
      
      expect(error.name).toBe('HttpTimeoutError');
      expect(error.message).toBe('HTTP request timeout after 5000ms');
      expect(error).toBeInstanceOf(Error);
    });

    it('should create HttpError with correct properties', () => {
      const responseData = { detail: 'Extra info' };
      const error = new HttpError(404, 'Not Found', 'Resource not found', responseData);
      
      expect(error.name).toBe('HttpError');
      expect(error.status).toBe(404);
      expect(error.statusText).toBe('Not Found');
      expect(error.message).toBe('Resource not found');
      expect(error.response).toEqual(responseData);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('Timeout Configuration Integration', () => {
    it('should handle timeout racing scenarios', async () => {
      const timeoutPromise = <T>(value: T, delay: number): Promise<T> => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(value);
          }, delay);
        });

      // Test that timeout wins when operation is slower
      const result = Promise.race([
        timeoutPromise('slow', 2000),
        timeoutPromise('timeout', 1000)
      ]);

      await expect(result).resolves.toBe('timeout');
    });

    it('should handle cascading timeout scenarios with proper cleanup', async () => {
      const operations: Array<Promise<string>> = [];
      
      // Create multiple operations that timeout
      for (let i = 0; i < 3; i++) {
        operations.push(
          new Promise((_, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error(`Operation ${i} timeout`));
            }, 100 + i * 50);
            
            // Simulate cleanup
            return (): void => {
              clearTimeout(timeoutId);
            };
          })
        );
      }

      // All should timeout
      const results = await Promise.allSettled(operations);
      
      results.forEach((result) => {
        expect(result.status).toBe('rejected');
        if (result.status === 'rejected') {
          expect(result.reason.message).toContain('timeout');
        }
      });
    });
  });
});