import { Request, Response, NextFunction } from '../types/express.js';
import jwt from 'jsonwebtoken';
import { asyncHandler } from './errorHandler.js';

export interface KindeJWTPayload {
  sub: string; // User ID
  email: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  org_code?: string;
  permissions?: string[];
  aud: string; // Audience (should match your Kinde app)
  iss: string; // Issuer (Kinde domain)
  iat: number; // Issued at
  exp: number; // Expires at
}

/**
 * Middleware to verify Kinde JWT tokens
 * Extracts user information from the token and adds it to req.user
 */
export const verifyKindeToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'No valid authorization header found',
    });
    return;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    // TODO: Implement proper Kinde JWT verification
    // This is a placeholder implementation
    // In production, you would:
    // 1. Fetch Kinde's public keys from their JWKS endpoint
    // 2. Verify the token signature using the public key
    // 3. Validate issuer, audience, and other claims

    // For now, decode without verification (DEVELOPMENT ONLY)
    const decoded = jwt.decode(token) as KindeJWTPayload;

    if (!decoded || !decoded.sub || !decoded.email) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token payload',
      });
      return;
    }

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired',
      });
      return;
    }

    // Add user info to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name || `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim() || undefined,
      organization: decoded.org_code || undefined,
      permissions: decoded.permissions || [],
    };

    next();
  } catch (error) {
    res.status(401).json({
      error: `error ${error}`,
      message: 'Failed to verify token',
    });
    return;
  }
});

/**
 * Middleware to verify Kinde JWT tokens (optional)
 * Similar to verifyKindeToken but allows requests without tokens
 */
export const verifyKindeTokenOptional = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // If no auth header, continue without user info
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.decode(token) as KindeJWTPayload;

    if (decoded && decoded.sub && decoded.email && (!decoded.exp || Date.now() < decoded.exp * 1000)) {
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name || `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim() || undefined,
        organization: decoded.org_code || undefined,
        permissions: decoded.permissions || [],
      };
    }
  } catch (error) {
    // Log error but continue without user info
    console.error('Optional auth error:', error);
  }

  next();
});

/**
 * Middleware to check for specific permissions
 */
export const requirePermissions = (requiredPermissions: string[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const userPermissions = req.user.permissions || [];
    const hasRequiredPermissions = requiredPermissions.every(permission => userPermissions.includes(permission));

    if (!hasRequiredPermissions) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Missing required permissions: ${requiredPermissions.join(', ')}`,
      });
      return;
    }

    next();
  });
};

/**
 * Helper function to get Kinde public keys for JWT verification
 * TODO: Implement this to properly verify JWT signatures
 */
export const getKindePublicKeys = async (_: string) => {
  // TODO: Fetch from https://{your-kinde-domain}/.well-known/jwks.json
  // This should be cached and refreshed periodically
  throw new Error('Kinde public key verification not yet implemented');
};
