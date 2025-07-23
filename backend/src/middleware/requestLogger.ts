import { Request, Response, NextFunction } from 'express';
import { logRequest } from '../utils/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const responseTime = Date.now() - start;
    logRequest(req, res, responseTime);
    originalEnd.apply(res, args);
  };

  next();
};