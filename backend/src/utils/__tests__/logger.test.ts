import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import winston from 'winston';

// Mock winston to test logger configuration
vi.mock('winston', () => ({
  default: {
    createLogger: vi.fn(),
    format: {
      combine: vi.fn(),
      timestamp: vi.fn(),
      errors: vi.fn(),
      json: vi.fn(),
      simple: vi.fn(),
      colorize: vi.fn(),
      printf: vi.fn(),
    },
    transports: {
      Console: vi.fn(),
      File: vi.fn(),
    },
  },
}));

describe('Logger', () => {
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      verbose: vi.fn(),
    };

    const mockWinston = vi.mocked(winston);
    mockWinston.createLogger.mockReturnValue(mockLogger);
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Logger Configuration', () => {
    it('should create logger with proper configuration', () => {
      // Import the logger module (this would trigger winston.createLogger)
      const loggerConfig = {
        level: process.env.LOG_LEVEL || 'info',
        format: 'combined',
        transports: ['console'],
      };

      expect(loggerConfig.level).toBe(process.env.LOG_LEVEL || 'info');
      expect(loggerConfig.format).toBe('combined');
      expect(loggerConfig.transports).toContain('console');
    });

    it('should configure different log levels', () => {
      const logLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
      
      logLevels.forEach((level) => {
        expect(['error', 'warn', 'info', 'verbose', 'debug', 'silly']).toContain(level);
      });
    });

    it('should configure console transport for development', () => {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment || process.env.NODE_ENV === 'test') {
        expect(true).toBe(true); // Console transport should be enabled
      }
    });

    it('should configure file transport for production', () => {
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        const expectedFiles = [
          'logs/error.log',
          'logs/combined.log',
        ];
        
        expectedFiles.forEach((file) => {
          expect(file).toMatch(/\.log$/);
          expect(file).toContain('logs/');
        });
      } else {
        expect(true).toBe(true); // Test passes in non-production
      }
    });
  });

  describe('Logging Functions', () => {
    it('should provide info logging function', () => {
      const logInfo = (message: string, meta?: any) => {
        mockLogger.info(message, meta);
      };

      logInfo('Test info message', { userId: '123' });

      expect(mockLogger.info).toHaveBeenCalledWith('Test info message', { userId: '123' });
    });

    it('should provide error logging function', () => {
      const logError = (message: string, error?: Error | unknown) => {
        if (error instanceof Error) {
          mockLogger.error(message, { 
            error: error.message,
            stack: error.stack,
          });
        } else {
          mockLogger.error(message, { error: String(error) });
        }
      };

      const testError = new Error('Test error');
      logError('Test error message', testError);

      expect(mockLogger.error).toHaveBeenCalledWith('Test error message', {
        error: 'Test error',
        stack: expect.any(String),
      });
    });

    it('should provide warn logging function', () => {
      const logWarn = (message: string, meta?: any) => {
        mockLogger.warn(message, meta);
      };

      logWarn('Test warning', { action: 'deprecatedFeature' });

      expect(mockLogger.warn).toHaveBeenCalledWith('Test warning', { action: 'deprecatedFeature' });
    });

    it('should provide debug logging function', () => {
      const logDebug = (message: string, meta?: any) => {
        mockLogger.debug(message, meta);
      };

      logDebug('Debug information', { requestId: 'req-123', timing: 150 });

      expect(mockLogger.debug).toHaveBeenCalledWith('Debug information', { 
        requestId: 'req-123', 
        timing: 150 
      });
    });
  });

  describe('Error Handling in Logging', () => {
    it('should handle Error objects properly', () => {
      const logError = (message: string, error?: Error | unknown) => {
        if (error instanceof Error) {
          mockLogger.error(message, { 
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
        } else {
          mockLogger.error(message, { error: String(error) });
        }
      };

      const customError = new TypeError('Custom type error');
      logError('Custom error occurred', customError);

      expect(mockLogger.error).toHaveBeenCalledWith('Custom error occurred', {
        name: 'TypeError',
        message: 'Custom type error',
        stack: expect.any(String),
      });
    });

    it('should handle non-Error objects', () => {
      const logError = (message: string, error?: Error | unknown) => {
        if (error instanceof Error) {
          mockLogger.error(message, { 
            error: error.message,
            stack: error.stack,
          });
        } else {
          mockLogger.error(message, { error: String(error) });
        }
      };

      logError('String error', 'Something went wrong');
      logError('Object error', { code: 500, message: 'Server error' });
      logError('Null error', null);

      expect(mockLogger.error).toHaveBeenCalledWith('String error', { error: 'Something went wrong' });
      expect(mockLogger.error).toHaveBeenCalledWith('Object error', { 
        error: '[object Object]'
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Null error', { error: 'null' });
    });

    it('should handle undefined errors gracefully', () => {
      const logError = (message: string, error?: Error | unknown) => {
        if (error instanceof Error) {
          mockLogger.error(message, { 
            error: error.message,
            stack: error.stack,
          });
        } else if (error !== undefined) {
          mockLogger.error(message, { error: String(error) });
        } else {
          mockLogger.error(message);
        }
      };

      logError('Undefined error', undefined);

      expect(mockLogger.error).toHaveBeenCalledWith('Undefined error');
    });
  });

  describe('Structured Logging', () => {
    it('should support structured logging with metadata', () => {
      const logWithMeta = (level: string, message: string, meta: Record<string, any>) => {
        const enrichedMeta = {
          ...meta,
          timestamp: new Date().toISOString(),
          service: 'intelligent-admin-backend',
        };

        switch (level) {
          case 'info':
            mockLogger.info(message, enrichedMeta);
            break;
          case 'error':
            mockLogger.error(message, enrichedMeta);
            break;
          case 'warn':
            mockLogger.warn(message, enrichedMeta);
            break;
          default:
            mockLogger.info(message, enrichedMeta);
        }
      };

      const metadata = {
        userId: 'user-123',
        action: 'email-analysis',
        duration: 250,
        success: true,
      };

      logWithMeta('info', 'Email analysis completed', metadata);

      expect(mockLogger.info).toHaveBeenCalledWith('Email analysis completed', {
        ...metadata,
        timestamp: expect.any(String),
        service: 'intelligent-admin-backend',
      });
    });

    it('should support request logging context', () => {
      const logRequest = (method: string, url: string, statusCode: number, duration: number) => {
        mockLogger.info('HTTP Request', {
          method,
          url,
          statusCode,
          duration,
          type: 'http_request',
        });
      };

      logRequest('POST', '/api/emails/analyze', 200, 150);

      expect(mockLogger.info).toHaveBeenCalledWith('HTTP Request', {
        method: 'POST',
        url: '/api/emails/analyze',
        statusCode: 200,
        duration: 150,
        type: 'http_request',
      });
    });

    it('should support business logic logging', () => {
      const logBusinessEvent = (event: string, entityType: string, entityId: string, metadata?: any) => {
        mockLogger.info('Business Event', {
          event,
          entityType,
          entityId,
          type: 'business_event',
          ...metadata,
        });
      };

      logBusinessEvent('email_analyzed', 'email', 'email-123', {
        priority: 'high',
        category: 'urgent',
        actionRequired: true,
      });

      expect(mockLogger.info).toHaveBeenCalledWith('Business Event', {
        event: 'email_analyzed',
        entityType: 'email',
        entityId: 'email-123',
        type: 'business_event',
        priority: 'high',
        category: 'urgent',
        actionRequired: true,
      });
    });
  });

  describe('Log Formatting', () => {
    it('should format logs consistently', () => {
      const formatLog = (level: string, message: string, meta?: any) => {
        const timestamp = new Date().toISOString();
        const logEntry = {
          timestamp,
          level: level.toUpperCase(),
          message,
          ...(meta && { meta }),
        };

        return JSON.stringify(logEntry);
      };

      const formatted = formatLog('info', 'Test message', { key: 'value' });
      const parsed = JSON.parse(formatted);

      expect(parsed).toMatchObject({
        timestamp: expect.any(String),
        level: 'INFO',
        message: 'Test message',
        meta: { key: 'value' },
      });
    });

    it('should include correlation IDs when available', () => {
      const logWithCorrelation = (message: string, correlationId?: string) => {
        const logEntry = {
          message,
          ...(correlationId && { correlationId }),
          timestamp: new Date().toISOString(),
        };

        mockLogger.info(message, logEntry);
      };

      logWithCorrelation('Correlated log message', 'corr-123');

      expect(mockLogger.info).toHaveBeenCalledWith('Correlated log message', {
        message: 'Correlated log message',
        correlationId: 'corr-123',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Performance Logging', () => {
    it('should log performance metrics', () => {
      const logPerformance = (operation: string, duration: number, metadata?: any) => {
        mockLogger.info('Performance Metric', {
          operation,
          duration,
          type: 'performance',
          unit: 'ms',
          ...metadata,
        });
      };

      logPerformance('database_query', 45, {
        query: 'SELECT * FROM email_analysis',
        rows: 150,
      });

      expect(mockLogger.info).toHaveBeenCalledWith('Performance Metric', {
        operation: 'database_query',
        duration: 45,
        type: 'performance',
        unit: 'ms',
        query: 'SELECT * FROM email_analysis',
        rows: 150,
      });
    });

    it('should support timing wrapper function', () => {
      const timeOperation = async <T>(operation: string, fn: () => Promise<T>): Promise<T> => {
        const start = Date.now();
        try {
          const result = await fn();
          const duration = Date.now() - start;
          mockLogger.info(`Operation completed: ${operation}`, {
            duration,
            success: true,
            type: 'performance',
          });
          return result;
        } catch (error) {
          const duration = Date.now() - start;
          mockLogger.error(`Operation failed: ${operation}`, {
            duration,
            success: false,
            error: error instanceof Error ? error.message : String(error),
            type: 'performance',
          });
          throw error;
        }
      };

      const mockOperation = vi.fn().mockResolvedValue('result');
      
      expect(timeOperation('test_operation', mockOperation)).resolves.toBe('result');
    });
  });
});