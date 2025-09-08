/**
 * Integration Tests for Shared Package
 * Tests the main export functionality and cross-module compatibility
 */

import { describe, it, expect } from 'vitest';


// Import everything from the main entry point
import * as SharedPackage from './index.js';

// Import specific items to test exports
import {
  type User,
  type EmailAnalysis,
  type ChatMessage,
  type ApiResponse,
  // Utilities
  formatDate,
  isValidEmail,
  createSuccessResponse,
  groupBy,
} from './index.js';

describe('Shared Package Integration', () => {
  describe('Main Export Structure', () => {
    it('should export all types from types module', () => {
      // Test that type exports are available (these are compile-time checks primarily)
      const user: User = {
        id: 'test-id',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const emailAnalysis: EmailAnalysis = {
        urgencyScore: 7.5,
        category: 'urgent',
        businessRelevance: 8.0,
        sentiment: 'positive',
        actionRequired: true,
        suggestedActions: ['respond_quickly'],
        reasoning: 'Client deadline mentioned',
      };

      const chatMessage: ChatMessage = {
        id: 'msg-123',
        role: 'user',
        content: 'Hello world',
        timestamp: new Date(),
      };

      expect(user.id).toBe('test-id');
      expect(emailAnalysis.category).toBe('urgent');
      expect(chatMessage.role).toBe('user');
    });

    it('should export all utilities from utils module', () => {
      // Test that all utility functions are exported and working
      expect(typeof formatDate).toBe('function');
      expect(typeof isValidEmail).toBe('function');
      expect(typeof createSuccessResponse).toBe('function');
      expect(typeof groupBy).toBe('function');

      // Test basic functionality
      const dateStr = formatDate(new Date('2024-01-15'));
      expect(dateStr).toMatch(/15 Jan 2024/);

      const isValid = isValidEmail('test@example.com');
      expect(isValid).toBe(true);

      const response = createSuccessResponse({ message: 'success' });
      expect(response.success).toBe(true);
    });

    it('should have all expected exports', () => {
      // Verify the structure of the shared package
      const exportedKeys = Object.keys(SharedPackage);
      
      // Should have a reasonable number of exports (types don't appear in runtime exports)
      expect(exportedKeys.length).toBeGreaterThan(20);
      
      // Check for key utility functions
      expect(exportedKeys).toContain('formatDate');
      expect(exportedKeys).toContain('formatDateTime');
      expect(exportedKeys).toContain('isValidEmail');
      expect(exportedKeys).toContain('createSuccessResponse');
      expect(exportedKeys).toContain('validateRequired');
    });
  });

  describe('Cross-Module Integration', () => {
    it('should allow utilities to work with types seamlessly', () => {
      // Test that utilities can be used with the defined types
      const user: User = {
        id: 'user-123',
        email: 'john.doe@example.com',
        name: 'John Doe',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      };

      // Test utility functions with type data
      const formattedDate = formatDate(user.createdAt);
      const isEmailValid = isValidEmail(user.email);
      const successResponse = createSuccessResponse(user);

      expect(formattedDate).toMatch(/1 Jan 2024/);
      expect(isEmailValid).toBe(true);
      expect(successResponse.success).toBe(true);
      expect(successResponse.data?.id).toBe('user-123');

      // Type assertion to verify correct typing
      const typedResponse: ApiResponse<User> = successResponse;
      expect(typedResponse.data?.email).toBe('john.doe@example.com');
    });

    it('should support complex data transformations', () => {
      // Create sample data using types
      const emails: Array<{ analysis: EmailAnalysis }> = [
        {
          analysis: {
            urgencyScore: 9.0,
            category: 'urgent',
            businessRelevance: 8.5,
            sentiment: 'negative',
            actionRequired: true,
            suggestedActions: ['respond_immediately', 'escalate'],
            reasoning: 'Customer complaint with deadline',
          },
        },
        {
          analysis: {
            urgencyScore: 4.0,
            category: 'standard',
            businessRelevance: 6.0,
            sentiment: 'neutral',
            actionRequired: false,
            suggestedActions: ['acknowledge'],
            reasoning: 'Regular business inquiry',
          },
        },
        {
          analysis: {
            urgencyScore: 8.0,
            category: 'urgent',
            businessRelevance: 9.0,
            sentiment: 'positive',
            actionRequired: true,
            suggestedActions: ['respond_quickly'],
            reasoning: 'Important client opportunity',
          },
        },
      ];

      // Group emails by category using utility function
      const grouped = groupBy(emails, email => email.analysis.category);

      expect(grouped.urgent).toHaveLength(2);
      expect(grouped.standard).toHaveLength(1);
      expect(grouped.urgent[0].analysis.urgencyScore).toBe(9.0);
      expect(grouped.standard[0].analysis.sentiment).toBe('neutral');
    });

    it('should handle API responses with different data types', () => {
      // Test API response utilities with different types
      const userResponse: ApiResponse<User> = createSuccessResponse({
        id: 'user-123',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const chatResponse: ApiResponse<ChatMessage[]> = createSuccessResponse([
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date(),
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Hi there! How can I help?',
          timestamp: new Date(),
        },
      ]);

      expect(userResponse.success).toBe(true);
      expect(userResponse.data?.email).toBe('test@example.com');
      expect(chatResponse.success).toBe(true);
      expect(chatResponse.data).toHaveLength(2);
      expect(chatResponse.data?.[0].role).toBe('user');
    });
  });

  describe('Real-World Usage Scenarios', () => {
    it('should support email processing workflow', () => {
      // Simulate a real email processing scenario
      const rawEmail = {
        id: 'email-123',
        from: 'urgent.client@business.com',
        subject: 'URGENT: Production line down - need immediate assistance!',
        body: 'Our production line has stopped working. We need someone here ASAP.',
        receivedAt: new Date(),
      };

      // Validate email
      const isFromValid = isValidEmail(rawEmail.from);
      expect(isFromValid).toBe(true);

      // Create analysis
      const analysis: EmailAnalysis = {
        urgencyScore: 9.5,
        category: 'urgent',
        businessRelevance: 10.0,
        sentiment: 'negative',
        actionRequired: true,
        suggestedActions: ['dispatch_technician', 'call_client', 'notify_manager'],
        reasoning: 'Production line failure requires immediate response',
      };

      // Format response
      const response = createSuccessResponse({
        emailId: rawEmail.id,
        analysis,
        recommendations: analysis.suggestedActions,
        formattedDate: formatDate(rawEmail.receivedAt),
      });

      expect(response.success).toBe(true);
      expect(response.data?.analysis.urgencyScore).toBe(9.5);
      expect(response.data?.recommendations).toContain('dispatch_technician');
    });

    it('should support business context processing', () => {
      // Test business-related utilities with business types
      const phoneNumbers = ['0412345678', '04 8765 4321', '+61 3 9876 5432'];
      const amounts = [1250.75, 850.00, 2500.99];
      
      // Process phone numbers and currency
      const formattedPhones = phoneNumbers.map(phone => {
        // Import utility directly to test
        const { formatPhoneNumber } = SharedPackage;
        return formatPhoneNumber(phone);
      });

      const formattedAmounts = amounts.map(amount => {
        const { formatCurrency } = SharedPackage;
        return formatCurrency(amount);
      });

      expect(formattedPhones[0]).toBe('0412 345 678');
      expect(formattedAmounts[0]).toBe('$1,250.75');
      
      // Group by formatted value for reporting
      const businessData = amounts.map((amount, index) => ({
        phone: formattedPhones[index],
        amount: formattedAmounts[index],
        category: amount > 2000 ? 'high' : amount > 1000 ? 'medium' : 'low',
      }));

      const grouped = groupBy(businessData, item => item.category);
      expect(grouped.high).toHaveLength(1);
      expect(grouped.medium).toHaveLength(1);
      expect(grouped.low).toHaveLength(1);
    });

    it('should handle error scenarios gracefully', () => {
      // Test error handling with utilities and types
      const { createAppError, createErrorResponse, isApiError } = SharedPackage;

      const appError = createAppError(
        'VALIDATION_FAILED',
        'Email validation failed',
        400,
        { field: 'email', value: 'invalid-email' }
      );

      const errorResponse = createErrorResponse(appError);

      expect(isApiError(errorResponse)).toBe(true);
      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error?.code).toBe('VALIDATION_FAILED');
      expect(errorResponse.error?.details?.field).toBe('email');

      // Test that success responses are not errors
      const successResponse = createSuccessResponse({ message: 'success' });
      expect(isApiError(successResponse)).toBe(false);
    });

    it('should maintain performance with large datasets', () => {
      // Performance test with utilities and types
      const { uniqueBy, truncateText } = SharedPackage;

      // Generate large dataset
      const largeDataset = Array.from({ length: 5000 }, (_, i) => ({
        id: `item-${i % 1000}`, // Create duplicates
        category: `category-${i % 10}`,
        description: `This is a long description for item ${i} that needs to be processed efficiently`,
        urgencyScore: Math.random() * 10,
      }));

      const start = performance.now();

      // Process data
      const unique = uniqueBy(largeDataset, item => item.id);
      const grouped = groupBy(unique, item => item.category);
      const truncated = unique.map(item => ({
        ...item,
        shortDescription: truncateText(item.description, 50),
      }));

      const end = performance.now();

      // Should process efficiently
      expect(end - start).toBeLessThan(100); // Under 100ms
      expect(unique.length).toBe(1000); // Only unique items
      expect(Object.keys(grouped).length).toBe(10); // 10 categories
      expect(truncated[0].shortDescription.length).toBeLessThanOrEqual(53); // 50 + '...'
    });
  });

  describe('Module Boundaries and Isolation', () => {
    it('should not leak internal implementation details', () => {
      // Ensure only public API is exported
      const exports = Object.keys(SharedPackage);
      
      // Should not contain internal/private functions or variables
      const privatePrefixes = ['_', '__', 'internal', 'private'];
      const hasPrivateExports = exports.some(exportName =>
        privatePrefixes.some(prefix => exportName.startsWith(prefix))
      );

      expect(hasPrivateExports).toBe(false);
    });

    it('should provide consistent API surface', () => {
      // Test that the API is consistent and predictable
      const { formatDate, formatDateTime, formatTimeAgo } = SharedPackage;
      
      const testDate = new Date('2024-01-15T14:30:00Z');
      
      // All date formatters should handle the same input
      expect(() => formatDate(testDate)).not.toThrow();
      expect(() => formatDateTime(testDate)).not.toThrow();
      expect(() => formatTimeAgo(testDate)).not.toThrow();
      
      // All should return strings
      expect(typeof formatDate(testDate)).toBe('string');
      expect(typeof formatDateTime(testDate)).toBe('string');
      expect(typeof formatTimeAgo(testDate)).toBe('string');
    });
  });
});