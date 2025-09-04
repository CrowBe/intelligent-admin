import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the environment variables before importing the module
const mockEnv = {
  NODE_ENV: 'development',
  PORT: '3001',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/test',
  JWT_SECRET: 'test-jwt-secret-at-least-32-characters-long',
  CORS_ORIGIN: 'http://localhost:3000',
  OPENAI_API_KEY: 'sk-test123456789',
  OPENAI_MODEL: 'gpt-4-turbo-preview',
  GMAIL_CLIENT_ID: '',
  GMAIL_CLIENT_SECRET: '',
  GMAIL_REDIRECT_URI: '',
  REDIS_URL: '',
  SENTRY_DSN: '',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100',
  LOG_LEVEL: 'info',
  ENABLE_MORNING_BRIEF: 'true',
  ENABLE_EMAIL_ANALYSIS: 'true',
  ENABLE_INDUSTRY_INTELLIGENCE: 'true'
};

// Set up environment variables
Object.assign(process.env, mockEnv);

describe('Production Configuration Security', () => {
  beforeEach(() => {
    vi.resetModules();
    // Reset environment to development for each test
    process.env['NODE_ENV'] = 'development';
  });

  it('should skip validation in development environment', async () => {
    process.env['NODE_ENV'] = 'development';
    
    const { validateProductionConfig } = await import('../config/env.js');
    
    // Should not throw any errors in development
    expect(() => { validateProductionConfig(); }).not.toThrow();
  });

  it('should skip validation in test environment', async () => {
    process.env['NODE_ENV'] = 'test';
    
    const { validateProductionConfig } = await import('../config/env.js');
    
    // Should not throw any errors in test
    expect(() => { validateProductionConfig(); }).not.toThrow();
  });

  it('should reject JWT_SECRET containing "development" in production', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['JWT_SECRET'] = 'development-secret-key-at-least-32-characters-long';
    
    const { validateProductionConfig } = await import('../config/env.js');
    
    expect(() => { validateProductionConfig(); }).toThrow('Production JWT_SECRET cannot contain "development"');
  });

  it('should reject JWT_SECRET containing "default" in production', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['JWT_SECRET'] = 'default-jwt-secret-at-least-32-characters-long';
    
    const { validateProductionConfig } = await import('../config/env.js');
    
    expect(() => { validateProductionConfig(); }).toThrow('Production JWT_SECRET cannot contain predictable terms like "default" or "secret"');
  });

  it('should reject JWT_SECRET containing "secret" in production', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['JWT_SECRET'] = 'my-secret-key-at-least-32-characters-long';
    
    const { validateProductionConfig } = await import('../config/env.js');
    
    expect(() => { validateProductionConfig(); }).toThrow('Production JWT_SECRET cannot contain predictable terms like "default" or "secret"');
  });

  it('should reject short JWT_SECRET in production', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['JWT_SECRET'] = 'short';
    
    const { validateProductionConfig } = await import('../config/env.js');
    
    expect(() => { validateProductionConfig(); }).toThrow('Production JWT_SECRET must be at least 32 characters long');
  });

  it('should reject wildcard CORS_ORIGIN in production', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['JWT_SECRET'] = 'secure-production-jwt-key-at-least-32-characters-long';
    process.env['CORS_ORIGIN'] = '*';
    
    const { validateProductionConfig } = await import('../config/env.js');
    
    expect(() => { validateProductionConfig(); }).toThrow('Production CORS_ORIGIN cannot be wildcard "*"');
  });

  it('should reject development OpenAI API key in production', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['JWT_SECRET'] = 'secure-production-jwt-key-at-least-32-characters-long';
    process.env['CORS_ORIGIN'] = 'https://app.example.com';
    process.env['OPENAI_API_KEY'] = 'sk-development-test-key';
    
    const { validateProductionConfig } = await import('../config/env.js');
    
    expect(() => { validateProductionConfig(); }).toThrow('Production requires valid OpenAI API key (cannot start with "sk-development")');
  });

  it('should reject placeholder OpenAI API key in production', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['JWT_SECRET'] = 'secure-production-jwt-key-at-least-32-characters-long';
    process.env['CORS_ORIGIN'] = 'https://app.example.com';
    process.env['OPENAI_API_KEY'] = 'your-api-key';
    
    const { validateProductionConfig } = await import('../config/env.js');
    
    expect(() => { validateProductionConfig(); }).toThrow('Production requires valid OpenAI API key (placeholder values not allowed)');
  });

  it('should accept valid production configuration', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['JWT_SECRET'] = 'secure-production-jwt-key-at-least-32-characters-long-and-random';
    process.env['CORS_ORIGIN'] = 'https://app.example.com,https://admin.example.com';
    process.env['OPENAI_API_KEY'] = 'sk-proj-abc123def456ghi789jkl012mno345pqr';
    process.env['DATABASE_URL'] = 'postgresql://user:pass@prod-db.example.com:5432/app';
    
    const { validateProductionConfig } = await import('../config/env.js');
    
    // Should not throw any errors with valid production config
    expect(() => { validateProductionConfig(); }).not.toThrow();
  });

  it('should warn about localhost database URL in production', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['JWT_SECRET'] = 'secure-production-jwt-key-at-least-32-characters-long-and-random';
    process.env['CORS_ORIGIN'] = 'https://app.example.com';
    process.env['OPENAI_API_KEY'] = 'sk-proj-abc123def456ghi789jkl012mno345pqr';
    process.env['DATABASE_URL'] = 'postgresql://user:pass@localhost:5432/app';
    
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const { validateProductionConfig } = await import('../config/env.js');
    
    validateProductionConfig();
    
    expect(consoleSpy).toHaveBeenCalledWith('Warning: Production DATABASE_URL appears to reference localhost');
    
    consoleSpy.mockRestore();
  });

  it('should collect and report multiple validation errors', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['JWT_SECRET'] = 'development-short';
    process.env['CORS_ORIGIN'] = '*';
    process.env['OPENAI_API_KEY'] = 'sk-development-test';
    
    const { validateProductionConfig } = await import('../config/env.js');
    
    expect(() => { validateProductionConfig(); }).toThrow(/Production configuration validation failed:/);
    
    try {
      validateProductionConfig();
    } catch (error) {
      const errorMessage = (error as Error).message;
      expect(errorMessage).toContain('JWT_SECRET cannot contain "development"');
      expect(errorMessage).toContain('JWT_SECRET must be at least 32 characters long');
      expect(errorMessage).toContain('CORS_ORIGIN cannot be wildcard');
      expect(errorMessage).toContain('cannot start with "sk-development"');
    }
  });
});