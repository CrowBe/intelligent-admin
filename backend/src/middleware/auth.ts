import type { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

// Extend Express Request type to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

// JWT payload interface
interface JwtPayload {
  id: string;
  email?: string;
  iat?: number;
  exp?: number;
}

/**
 * Handle JWT verification errors with appropriate responses
 */
const handleJwtError = (error: unknown, res: Response): void => {
  if (error instanceof jwt.TokenExpiredError) {
    res.status(401).json({ 
      error: 'Token expired', 
      message: 'Please log in again' 
    });
  } else if (error instanceof jwt.JsonWebTokenError) {
    res.status(401).json({ 
      error: 'Invalid token', 
      message: 'Token is malformed or invalid' 
    });
  } else {
    res.status(401).json({ 
      error: 'Authentication failed', 
      message: 'Could not verify token' 
    });
  }
};

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and attaches user information to request
 * Returns 401 for invalid/missing tokens
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  
  // Check for Authorization header with Bearer format
  if (authHeader?.startsWith('Bearer ') !== true) {
    res.status(401).json({ 
      error: 'Access denied', 
      message: 'No token provided or invalid format' 
    });
    return;
  }

  // Extract token from Bearer header
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (token === '') {
    res.status(401).json({ 
      error: 'Access denied', 
      message: 'Token is required' 
    });
    return;
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Validate decoded token has required user ID
    if (typeof decoded.id !== 'string' || decoded.id === '') {
      res.status(401).json({ 
        error: 'Invalid token', 
        message: 'Token does not contain valid user ID' 
      });
      return;
    }

    // Attach user information to request
    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    next();
  } catch (error) {
    handleJwtError(error, res);
  }
};

/**
 * User Ownership Validation Middleware
 * Ensures authenticated user can only access their own data
 * Should be used after authenticateToken middleware
 */
export const validateUserOwnership = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const { userId } = req.params;
  
  // Check if user is authenticated (should be handled by authenticateToken first)
  if (req.user?.id === undefined) {
    res.status(401).json({ 
      error: 'Authentication required', 
      message: 'User not authenticated' 
    });
    return;
  }

  // Check if the requested userId matches the authenticated user's ID
  if (typeof userId === 'string' && userId !== req.user.id) {
    res.status(403).json({ 
      error: 'Access forbidden', 
      message: 'You can only access your own data' 
    });
    return;
  }

  next();
};

/**
 * Optional Authentication Middleware
 * Attaches user information if token is provided but doesn't require it
 * Useful for endpoints that work with or without authentication
 */
export const optionalAuthentication = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  
  // If no auth header, continue without user info
  if (authHeader?.startsWith('Bearer ') !== true) {
    next();
    return;
  }

  const token = authHeader.substring(7);
  
  if (token === '') {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    if (decoded.id !== undefined && typeof decoded.id === 'string') {
      req.user = {
        id: decoded.id,
        email: decoded.email
      };
    }
  } catch (_error) {
    // Silently continue without user info if token is invalid
    // This allows the endpoint to work without authentication
  }

  next();
};