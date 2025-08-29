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
    minLength: 32,
    desc: 'Secret key for JWT token generation',
    devDefault: 'development-secret-key-at-least-32-characters-long'
  }),
  CORS_ORIGIN: str({
    default: '*',
    desc: 'Allowed CORS origins (comma-separated)'
  }),
  
  // AI Services
  OPENAI_API_KEY: str({
    desc: 'OpenAI API key for AI services',
    devDefault: 'sk-development-key'
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
  ENABLE_INDUSTRY_INTELLIGENCE
} = env;

// Helper to check if in production
export const isProduction = NODE_ENV === 'production';
export const isDevelopment = NODE_ENV === 'development';
export const isTest = NODE_ENV === 'test';
