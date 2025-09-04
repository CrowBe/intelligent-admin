import { cleanEnv, str, port, url, bool, num } from 'envalid';

/**
 * Validated environment variables
 */
export const env = cleanEnv(process.env, {
  // Server Configuration
  NODE_ENV: str({ 
    choices: ['development', 'production', 'test'],
    default: 'development',
    desc: 'Application environment' 
  }),
  PORT: port({ 
    default: 3001,
    desc: 'Port number for the backend server' 
  }),
  
  // Database
  DATABASE_URL: url({
    desc: 'PostgreSQL connection string',
    example: 'postgresql://user:password@localhost:5432/dbname'
  }),
  
  // Security
  JWT_SECRET: str({ 
    desc: 'Secret key for JWT token generation'
  }),
  CORS_ORIGIN: str({
    default: 'http://localhost:3000',
    desc: 'Allowed CORS origins (comma-separated)'
  }),
  
  // AI Services
  OPENAI_API_KEY: str({
    desc: 'OpenAI API key for AI services'
  }),
  OPENAI_MODEL: str({
    default: 'gpt-4-turbo-preview',
    desc: 'OpenAI model to use'
  }),
  
  // Email Services (Optional)
  GMAIL_CLIENT_ID: str({
    default: '',
    desc: 'Gmail OAuth2 client ID'
  }),
  GMAIL_CLIENT_SECRET: str({
    default: '',
    desc: 'Gmail OAuth2 client secret'
  }),
  GMAIL_REDIRECT_URI: str({
    default: '',
    desc: 'Gmail OAuth2 redirect URI'
  }),
  
  // Redis (Optional)
  REDIS_URL: str({ 
    default: '',
    desc: 'Redis connection URL for caching'
  }),
  
  // Monitoring (Optional)
  SENTRY_DSN: str({
    default: '',
    desc: 'Sentry DSN for error tracking'
  }),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: num({
    default: 15 * 60 * 1000, // 15 minutes
    desc: 'Rate limit window in milliseconds'
  }),
  RATE_LIMIT_MAX_REQUESTS: num({
    default: 100,
    desc: 'Maximum requests per rate limit window'
  }),
  
  // Logging
  LOG_LEVEL: str({
    choices: ['error', 'warn', 'info', 'debug', 'verbose'],
    default: 'info',
    desc: 'Logging level'
  }),
  
  // Feature Flags
  ENABLE_MORNING_BRIEF: bool({
    default: true,
    desc: 'Enable morning brief notifications'
  }),
  ENABLE_EMAIL_ANALYSIS: bool({
    default: true,
    desc: 'Enable email urgency analysis'
  }),
  ENABLE_INDUSTRY_INTELLIGENCE: bool({
    default: true,
    desc: 'Enable industry intelligence features'
  }),
  
  // Timeout Configuration
  DATABASE_CONNECTION_TIMEOUT: num({
    default: 10000, // 10 seconds
    desc: 'Database connection timeout in milliseconds'
  }),
  DATABASE_QUERY_TIMEOUT: num({
    default: 30000, // 30 seconds
    desc: 'Database query timeout in milliseconds'
  }),
  HTTP_REQUEST_TIMEOUT: num({
    default: 30000, // 30 seconds
    desc: 'HTTP request timeout in milliseconds'
  }),
  OPENAI_TIMEOUT: num({
    default: 60000, // 60 seconds
    desc: 'OpenAI API timeout in milliseconds'
  }),
  SERVER_TIMEOUT: num({
    default: 120000, // 2 minutes
    desc: 'Server request timeout in milliseconds'
  })
});

// Type-safe environment variables
export type Env = typeof env;

// Export individual variables for convenience
export const {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  CORS_ORIGIN,
  OPENAI_API_KEY,
  OPENAI_MODEL,
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI,
  REDIS_URL,
  SENTRY_DSN,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  LOG_LEVEL,
  ENABLE_MORNING_BRIEF,
  ENABLE_EMAIL_ANALYSIS,
  ENABLE_INDUSTRY_INTELLIGENCE,
  DATABASE_CONNECTION_TIMEOUT,
  DATABASE_QUERY_TIMEOUT,
  HTTP_REQUEST_TIMEOUT,
  OPENAI_TIMEOUT,
  SERVER_TIMEOUT
} = env;

// Helper to check if in production
export const isProduction = NODE_ENV === 'production';
export const isDevelopment = NODE_ENV === 'development';
export const isTest = NODE_ENV === 'test';

/**
 * Validates JWT secret for production security requirements
 */
const validateJwtSecret = (errors: string[]): void => {
  const jwtSecretLower = JWT_SECRET.toLowerCase();
  
  if (jwtSecretLower.includes('development')) {
    errors.push('Production JWT_SECRET cannot contain "development"');
  }
  
  if (jwtSecretLower.includes('default') || jwtSecretLower.includes('secret')) {
    errors.push('Production JWT_SECRET cannot contain predictable terms like "default" or "secret"');
  }

  if (JWT_SECRET.length < 32) {
    errors.push('Production JWT_SECRET must be at least 32 characters long');
  }
};

/**
 * Validates OpenAI API key format for production
 */
const validateOpenAiKey = (errors: string[]): void => {
  if (OPENAI_API_KEY.startsWith('sk-development')) {
    errors.push('Production requires valid OpenAI API key (cannot start with "sk-development")');
  }

  if (OPENAI_API_KEY === 'your-api-key' || OPENAI_API_KEY.toLowerCase().includes('placeholder')) {
    errors.push('Production requires valid OpenAI API key (placeholder values not allowed)');
  }
};

/**
 * Validates timeout configuration values
 */
const validateTimeouts = (errors: string[]): void => {
  // Validate timeout values are reasonable
  if (DATABASE_CONNECTION_TIMEOUT < 1000) {
    errors.push('DATABASE_CONNECTION_TIMEOUT must be at least 1000ms (1 second)');
  }
  
  if (DATABASE_CONNECTION_TIMEOUT > 30000) {
    errors.push('DATABASE_CONNECTION_TIMEOUT should not exceed 30000ms (30 seconds) for production');
  }
  
  if (DATABASE_QUERY_TIMEOUT < 5000) {
    errors.push('DATABASE_QUERY_TIMEOUT must be at least 5000ms (5 seconds)');
  }
  
  if (DATABASE_QUERY_TIMEOUT > 300000) {
    errors.push('DATABASE_QUERY_TIMEOUT should not exceed 300000ms (5 minutes) for production');
  }
  
  if (HTTP_REQUEST_TIMEOUT < 5000) {
    errors.push('HTTP_REQUEST_TIMEOUT must be at least 5000ms (5 seconds)');
  }
  
  if (HTTP_REQUEST_TIMEOUT > 180000) {
    errors.push('HTTP_REQUEST_TIMEOUT should not exceed 180000ms (3 minutes) for production');
  }
  
  if (OPENAI_TIMEOUT < 10000) {
    errors.push('OPENAI_TIMEOUT must be at least 10000ms (10 seconds)');
  }
  
  if (OPENAI_TIMEOUT > 300000) {
    errors.push('OPENAI_TIMEOUT should not exceed 300000ms (5 minutes) for production');
  }
  
  if (SERVER_TIMEOUT < 30000) {
    errors.push('SERVER_TIMEOUT must be at least 30000ms (30 seconds)');
  }
  
  if (SERVER_TIMEOUT > 600000) {
    errors.push('SERVER_TIMEOUT should not exceed 600000ms (10 minutes) for production');
  }
  
  // Validate logical relationships between timeouts
  if (DATABASE_QUERY_TIMEOUT <= DATABASE_CONNECTION_TIMEOUT) {
    errors.push('DATABASE_QUERY_TIMEOUT should be greater than DATABASE_CONNECTION_TIMEOUT');
  }
  
  if (SERVER_TIMEOUT <= HTTP_REQUEST_TIMEOUT) {
    errors.push('SERVER_TIMEOUT should be greater than HTTP_REQUEST_TIMEOUT');
  }
};

/**
 * Validates production configuration to prevent insecure defaults
 * Should be called during server initialization
 * @throws {Error} If production configuration is insecure
 */
export const validateProductionConfig = (): void => {
  if (!isProduction) {
    return; // Skip validation in non-production environments
  }

  const errors: string[] = [];

  // Run individual validation functions
  validateJwtSecret(errors);
  validateOpenAiKey(errors);
  validateTimeouts(errors);

  // Validate CORS_ORIGIN is not wildcard
  if (CORS_ORIGIN === '*') {
    errors.push('Production CORS_ORIGIN cannot be wildcard "*"');
  }

  // Warn about localhost database URL
  if (DATABASE_URL.includes('localhost') && !DATABASE_URL.includes('127.0.0.1')) {
    console.warn('Warning: Production DATABASE_URL appears to reference localhost');
  }

  if (errors.length > 0) {
    throw new Error(`Production configuration validation failed:\n- ${errors.join('\n- ')}`);
  }
};
