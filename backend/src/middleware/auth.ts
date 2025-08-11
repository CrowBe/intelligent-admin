import { Request, Response, NextFunction } from '../types/express.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid access token'
      });
      return;
    }

    jwt.verify(token, config.JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        logger.warn('Invalid token attempt:', {
          token: token.substring(0, 20) + '...',
          error: err.message
        });
        
        res.status(403).json({
          error: 'Invalid token',
          message: 'Token has expired or is invalid'
        });
        return;
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        organization: decoded.organization,
        permissions: decoded.permissions
      };
      
      next();
    });
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error during authentication'
    });
  }
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    jwt.verify(token, config.JWT_SECRET, (err: any, decoded: any) => {
      if (!err && decoded) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          organization: decoded.organization,
          permissions: decoded.permissions
        };
      }
      // Continue regardless of token validity
      next();
    });
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    // Continue even if there's an error
    next();
  }
};

export const requireRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate first'
      });
      return;
    }

    if (req.user.role !== requiredRole) {
      res.status(403).json({
        error: 'Insufficient permissions',
        message: `Role '${requiredRole}' required`
      });
      return;
    }

    next();
  };
};