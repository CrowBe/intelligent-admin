import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { authenticateToken, validateUserOwnership, optionalAuthentication, type AuthenticatedRequest } from './auth.js';

// Mock the environment
vi.mock('../config/env.js', () => ({
  JWT_SECRET: 'test-secret-key-minimum-32-characters-long'
}));

describe('Authentication Middleware', () => {
  let mockRequest: AuthenticatedRequest;
  let mockResponse: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      user: undefined
    } as AuthenticatedRequest;
    
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response;
    
    mockNext = vi.fn();
  });

  describe('authenticateToken', () => {
    it('should reject missing authorization header', () => {
      authenticateToken(mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access denied',
        message: 'No token provided or invalid format'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid authorization format', () => {
      mockRequest.headers.authorization = 'InvalidFormat token';
      
      authenticateToken(mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access denied',
        message: 'No token provided or invalid format'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject empty token', () => {
      mockRequest.headers.authorization = 'Bearer ';
      
      authenticateToken(mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access denied',
        message: 'Token is required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid JWT token', () => {
      mockRequest.headers.authorization = 'Bearer invalid-token';
      
      authenticateToken(mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'Token is malformed or invalid'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept valid JWT token and attach user', () => {
      const payload = { id: 'test-user-123', email: 'test@example.com' };
      const validToken = jwt.sign(payload, 'test-secret-key-minimum-32-characters-long');
      
      mockRequest.headers.authorization = `Bearer ${validToken}`;
      
      authenticateToken(mockRequest, mockResponse, mockNext);
      
      expect(mockRequest.user).toEqual({
        id: 'test-user-123',
        email: 'test@example.com'
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject token without user ID', () => {
      const payload = { email: 'test@example.com' }; // Missing ID
      const validToken = jwt.sign(payload, 'test-secret-key-minimum-32-characters-long');
      
      mockRequest.headers.authorization = `Bearer ${validToken}`;
      
      authenticateToken(mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'Token does not contain valid user ID'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject expired token', () => {
      const payload = { id: 'test-user-123', exp: Math.floor(Date.now() / 1000) - 3600 }; // Expired 1 hour ago
      const expiredToken = jwt.sign(payload, 'test-secret-key-minimum-32-characters-long');
      
      mockRequest.headers.authorization = `Bearer ${expiredToken}`;
      
      authenticateToken(mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Token expired',
        message: 'Please log in again'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateUserOwnership', () => {
    beforeEach(() => {
      mockRequest.user = { id: 'user-123' };
      mockRequest.params = { userId: 'user-123' };
    });

    it('should allow access when userId matches authenticated user', () => {
      validateUserOwnership(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject access when userId does not match authenticated user', () => {
      mockRequest.params = { userId: 'different-user-456' };
      
      validateUserOwnership(mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access forbidden',
        message: 'You can only access your own data'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject when user is not authenticated', () => {
      mockRequest.user = undefined;
      
      validateUserOwnership(mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'User not authenticated'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow access when no userId param is provided', () => {
      mockRequest.params = {};
      
      validateUserOwnership(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuthentication', () => {
    it('should continue without user when no auth header', () => {
      optionalAuthentication(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without user when auth header is invalid format', () => {
      mockRequest.headers.authorization = 'InvalidFormat token';
      
      optionalAuthentication(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should attach user when valid token is provided', () => {
      const payload = { id: 'test-user-123', email: 'test@example.com' };
      const validToken = jwt.sign(payload, 'test-secret-key-minimum-32-characters-long');
      
      mockRequest.headers.authorization = `Bearer ${validToken}`;
      
      optionalAuthentication(mockRequest, mockResponse, mockNext);
      
      expect(mockRequest.user).toEqual({
        id: 'test-user-123',
        email: 'test@example.com'
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without user when token is invalid', () => {
      mockRequest.headers.authorization = 'Bearer invalid-token';
      
      optionalAuthentication(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});