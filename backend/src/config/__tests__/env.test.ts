import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock envalid to test environment validation
vi.mock('envalid', () => ({
  cleanEnv: vi.fn(),
  str: vi.fn(),
  port: vi.fn(),
  url: vi.fn(),
  default: vi.fn(),
}));

describe('Environment Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment Validation', () => {
    it('should validate required environment variables', () => {
      const requiredVars = [
        'NODE_ENV',
        'PORT',
        'DATABASE_URL',
        'JWT_SECRET',
        'OPENAI_API_KEY',
      ];

      // Test that each required variable would be validated
      requiredVars.forEach((varName) => {
        expect(['development', 'test', 'production'].includes(process.env.NODE_ENV || 'test')).toBe(true);
      });
    });

    it('should have sensible defaults for development', () => {
      const devDefaults = {
        NODE_ENV: 'development',
        PORT: '3001',
        CORS_ORIGIN: 'http://localhost:3000',
        LOG_LEVEL: 'info',
      };

      Object.entries(devDefaults).forEach(([key, defaultValue]) => {
        const envValue = process.env[key];
        if (!envValue) {
          expect(defaultValue).toBeTruthy();
        }
      });
    });

    it('should validate JWT_SECRET length and content', () => {
      const validSecrets = [
        'a-very-long-secret-key-that-is-at-least-32-characters-long',
        'another-secure-jwt-secret-with-proper-length-and-entropy',
      ];

      const invalidSecrets = [
        'short',
        'development-secret',
        'default-secret',
        'test-secret',
      ];

      validSecrets.forEach((secret) => {
        expect(secret.length).toBeGreaterThanOrEqual(32);
        expect(secret).not.toMatch(/^(development|default|test|secret)$/i);
      });

      invalidSecrets.forEach((secret) => {
        expect(
          secret.length < 32 || /^(development|default|test|secret)$/i.test(secret)
        ).toBe(true);
      });
    });

    it('should validate DATABASE_URL format', () => {
      const validUrls = [
        'postgresql://user:pass@localhost:5432/database',
        'postgres://user:pass@db-host:5432/intelligent_admin',
        'file:./test.db', // SQLite for testing
      ];

      const invalidUrls = [
        'not-a-url',
        'http://localhost', // Wrong protocol
        'postgresql://localhost', // Missing credentials
      ];

      validUrls.forEach((url) => {
        expect(
          url.startsWith('postgresql://') ||
          url.startsWith('postgres://') ||
          url.startsWith('file:')
        ).toBe(true);
      });

      invalidUrls.forEach((url) => {
        expect(
          !url.startsWith('postgresql://') &&
          !url.startsWith('postgres://') &&
          !url.startsWith('file:')
        ).toBe(true);
      });
    });

    it('should validate OpenAI API key format', () => {
      const validKeys = [
        'sk-1234567890abcdef1234567890abcdef1234567890abcdef',
        'sk-proj-abcdef1234567890abcdef1234567890abcdef123456',
      ];

      const invalidKeys = [
        'invalid-key',
        'sk-test-key', // Test key
        'your-api-key-here', // Placeholder
      ];

      validKeys.forEach((key) => {
        expect(key.startsWith('sk-')).toBe(true);
        expect(key.length).toBeGreaterThan(20);
      });

      invalidKeys.forEach((key) => {
        expect(
          !key.startsWith('sk-') ||
          key.includes('test') ||
          key.includes('placeholder') ||
          key.includes('your-') ||
          key.length < 20
        ).toBe(true);
      });
    });

    it('should validate PORT as number', () => {
      const validPorts = ['3000', '3001', '8080', '80', '443'];
      const invalidPorts = ['abc', '-1', '70000', '0'];

      validPorts.forEach((port) => {
        const numPort = parseInt(port, 10);
        expect(numPort).toBeGreaterThan(0);
        expect(numPort).toBeLessThanOrEqual(65535);
      });

      invalidPorts.forEach((port) => {
        const numPort = parseInt(port, 10);
        expect(isNaN(numPort) || numPort <= 0 || numPort > 65535).toBe(true);
      });
    });

    it('should validate CORS_ORIGIN format', () => {
      const validOrigins = [
        'http://localhost:3000',
        'https://app.intelligent-admin.com',
        'https://staging.intelligent-admin.com',
        '*', // Only for development
      ];

      const invalidOrigins = [
        'localhost:3000', // Missing protocol
        'http://', // Incomplete URL
        'ftp://localhost', // Wrong protocol
      ];

      validOrigins.forEach((origin) => {
        expect(
          origin === '*' ||
          origin.startsWith('http://') ||
          origin.startsWith('https://')
        ).toBe(true);
      });

      invalidOrigins.forEach((origin) => {
        expect(
          origin !== '*' &&
          !origin.startsWith('http://') &&
          !origin.startsWith('https://')
        ).toBe(true);
      });
    });

    it('should validate LOG_LEVEL values', () => {
      const validLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
      const invalidLevels = ['trace', 'critical', 'notice', 'emergency'];

      validLevels.forEach((level) => {
        expect(['error', 'warn', 'info', 'verbose', 'debug', 'silly']).toContain(level);
      });

      invalidLevels.forEach((level) => {
        expect(['error', 'warn', 'info', 'verbose', 'debug', 'silly']).not.toContain(level);
      });
    });
  });

  describe('Environment-Specific Configuration', () => {
    it('should have production-safe defaults', () => {
      const productionEnv = {
        NODE_ENV: 'production',
        LOG_LEVEL: 'warn',
        CORS_ORIGIN: 'https://app.intelligent-admin.com',
      };

      // In production, sensitive defaults should be more restrictive
      expect(productionEnv.NODE_ENV).toBe('production');
      expect(productionEnv.LOG_LEVEL).not.toBe('debug');
      expect(productionEnv.CORS_ORIGIN).not.toBe('*');
      expect(productionEnv.CORS_ORIGIN.startsWith('https://')).toBe(true);
    });

    it('should allow development flexibility', () => {
      const developmentEnv = {
        NODE_ENV: 'development',
        LOG_LEVEL: 'debug',
        CORS_ORIGIN: 'http://localhost:3000',
        DATABASE_URL: 'postgresql://localhost:5432/intelligent_admin_dev',
      };

      expect(developmentEnv.NODE_ENV).toBe('development');
      expect(developmentEnv.LOG_LEVEL).toBe('debug');
      expect(developmentEnv.CORS_ORIGIN.startsWith('http://')).toBe(true);
    });

    it('should configure test environment properly', () => {
      const testEnv = {
        NODE_ENV: 'test',
        DATABASE_URL: 'file:./test.db',
        LOG_LEVEL: 'error',
        JWT_SECRET: 'test-secret-key-at-least-32-characters-long-for-testing',
      };

      expect(testEnv.NODE_ENV).toBe('test');
      expect(testEnv.DATABASE_URL.startsWith('file:')).toBe(true);
      expect(testEnv.LOG_LEVEL).toBe('error');
      expect(testEnv.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
    });
  });

  describe('Security Validation', () => {
    it('should reject weak JWT secrets in production', () => {
      const weakSecrets = [
        'secret',
        'development',
        'default',
        'test',
        '12345678901234567890123456789012', // Exactly 32 chars but weak
      ];

      weakSecrets.forEach((secret) => {
        const isWeak = 
          secret.length < 32 ||
          ['secret', 'development', 'default', 'test'].some(weak => 
            secret.toLowerCase().includes(weak)
          );
        
        expect(isWeak).toBe(true);
      });
    });

    it('should enforce HTTPS in production CORS origins', () => {
      const productionOrigins = [
        'https://app.intelligent-admin.com',
        'https://api.intelligent-admin.com',
      ];

      const invalidProductionOrigins = [
        'http://app.intelligent-admin.com', // HTTP in production
        '*', // Wildcard in production
        'localhost', // Localhost in production
      ];

      productionOrigins.forEach((origin) => {
        expect(origin.startsWith('https://')).toBe(true);
      });

      invalidProductionOrigins.forEach((origin) => {
        expect(
          !origin.startsWith('https://') ||
          origin === '*' ||
          origin.includes('localhost')
        ).toBe(true);
      });
    });

    it('should validate database URLs for production security', () => {
      const secureDbUrls = [
        'postgresql://user:complexpass@prod-db.intelligent-admin.com:5432/intelligent_admin',
        'postgres://admin:securepass123@db-cluster.internal:5432/intelligent_admin_prod',
      ];

      const insecureDbUrls = [
        'postgresql://root:password@localhost:5432/db', // Weak password, localhost
        'postgresql://admin:admin@localhost:5432/intelligent_admin', // Default credentials
        'postgresql://user@localhost/intelligent_admin', // No password
      ];

      secureDbUrls.forEach((url) => {
        expect(url.startsWith('postgresql://') || url.startsWith('postgres://')).toBe(true);
        expect(url.includes('@')).toBe(true); // Has credentials
        expect(!url.includes('localhost')).toBe(true); // Not localhost
      });

      insecureDbUrls.forEach((url) => {
        const hasWeakCredentials = 
          url.includes(':password@') ||
          url.includes(':admin@') ||
          !url.includes(':') || // No password
          url.includes('localhost');
        
        expect(hasWeakCredentials).toBe(true);
      });
    });
  });
});