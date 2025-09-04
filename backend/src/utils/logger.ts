import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { LOG_LEVEL, isProduction, isDevelopment } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'grey'
};

// Tell winston to use our custom colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define format for console output in development
const devFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(
    (info: winston.Logform.TransformableInfo) => `${info['timestamp']} ${info.level}: ${info.message}${info['stack'] !== undefined && typeof info['stack'] === 'string' ? `\n${info['stack']}` : ''}`
  )
);

// Define transports
const transports: winston.transport[] = [];

// Console transport
if (!isProduction) {
  transports.push(
    new winston.transports.Console({
      format: isDevelopment ? devFormat : format
    })
  );
}

// File transports for production
if (isProduction) {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  // Also log to console in production (for container environments)
  transports.push(
    new winston.transports.Console({
      format: format
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: LOG_LEVEL,
  levels,
  format,
  transports,
  exitOnError: false // Don't exit on handled exceptions
});

// Create a stream object for Morgan middleware
export const stream = {
  write: (message: string): void => {
    // Remove trailing newline
    logger.http(message.trim());
  }
};

// Export logger methods
export const logError = (error: Error | string, meta?: Record<string, unknown>): void => {
  if (error instanceof Error) {
    logger.error(error.message, { stack: error.stack, ...meta });
  } else {
    logger.error(error, meta);
  }
};

export const logWarn = (message: string, meta?: Record<string, unknown>): void => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: Record<string, unknown>): void => {
  logger.info(message, meta);
};

export const logDebug = (message: string, meta?: Record<string, unknown>): void => {
  logger.debug(message, meta);
};

export const logVerbose = (message: string, meta?: Record<string, unknown>): void => {
  logger.verbose(message, meta);
};

// Log unhandled rejections and exceptions
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  // Give Winston time to log before exiting
  setTimeout(() => {
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }, 1000);
});

export default logger;
