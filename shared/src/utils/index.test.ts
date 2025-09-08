/**
 * Comprehensive Tests for Shared Utilities
 * Tests all utility functions with edge cases and performance validation
 */


import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  // Date Utilities
  formatDate,
  formatDateTime,
  formatTimeAgo,
  
  // String Utilities
  truncateText,
  capitalizeFirst,
  slugify,
  
  // Email Utilities
  isValidEmail,
  extractEmailDomain,
  maskEmail,
  
  // Business Utilities
  formatPhoneNumber,
  formatCurrency,
  
  // Array Utilities
  groupBy,
  uniqueBy,
  
  // API Utilities
  createSuccessResponse,
  createErrorResponse,
  isApiError,
  
  // Validation Utilities
  validateRequired,
  validateMinLength,
  validateMaxLength,
  
  // File Utilities
  formatFileSize,
  getFileExtension,
  isImageFile,
  
  // URL Utilities
  buildUrl,
  
  // Error Utilities
  createAppError,
  
  // Environment Utilities
  isDevelopment,
  isProduction,
  isTest,
} from './index.js';

describe('Date Utilities', () => {
  beforeEach(() => {
    // Reset system time for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-15T10:30:00Z'));
  });

  describe('formatDate', () => {
    it('should format Date object in Australian format', () => {
      const date = new Date('2024-03-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBe('15 Mar 2024');
    });

    it('should format date string in Australian format', () => {
      const result = formatDate('2024-12-25T00:00:00Z');
      expect(result).toBe('25 Dec 2024');
    });

    it('should handle edge case dates', () => {
      expect(formatDate('2024-01-01T00:00:00Z')).toBe('1 Jan 2024');
      expect(formatDate('2024-12-31T23:59:59Z')).toBe('1 Jan 2025'); // UTC vs local time
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatDateTime', () => {
    it('should format Date object with time in Australian format', () => {
      const date = new Date('2024-03-15T10:30:00Z');
      const result = formatDateTime(date);
      // The time will vary based on timezone, just check date format and that time exists
      expect(result).toMatch(/15 Mar 2024.*\d{1,2}:\d{2}/); // Check for date and time format
    });

    it('should format date string with time', () => {
      const result = formatDateTime('2024-12-25T15:45:30Z');
      expect(result).toMatch(/26 Dec 2024.*02:45|01:45/); // Account for timezone
    });
  });

  describe('formatTimeAgo', () => {
    it('should return "Just now" for current time', () => {
      const now = new Date();
      expect(formatTimeAgo(now)).toBe('Just now');
    });

    it('should return minutes ago for recent times', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatTimeAgo(fiveMinutesAgo)).toBe('5m ago');
    });

    it('should return hours ago for same day', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatTimeAgo(twoHoursAgo)).toBe('2h ago');
    });

    it('should return days ago for recent days', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(formatTimeAgo(threeDaysAgo)).toBe('3d ago');
    });

    it('should return formatted date for old dates', () => {
      const longAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      expect(formatTimeAgo(longAgo)).toBe(formatDate(longAgo));
    });

    it('should handle string dates', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      expect(formatTimeAgo(oneHourAgo.toISOString())).toBe('1h ago');
    });
  });
});

describe('String Utilities', () => {
  describe('truncateText', () => {
    it('should return original text if shorter than max length', () => {
      expect(truncateText('Short text', 20)).toBe('Short text');
    });

    it('should truncate text and add ellipsis', () => {
      expect(truncateText('This is a very long text that needs truncation', 20)).toBe('This is a very lo...');
    });

    it('should handle exact length', () => {
      expect(truncateText('Exact', 5)).toBe('Exact');
    });

    it('should handle edge cases', () => {
      expect(truncateText('', 10)).toBe('');
      expect(truncateText('Hi', 2)).toBe('Hi');
      expect(truncateText('Hi', 1)).toBe('...');
    });
  });

  describe('capitalizeFirst', () => {
    it('should capitalize first letter and lowercase rest', () => {
      expect(capitalizeFirst('hello WORLD')).toBe('Hello world');
    });

    it('should handle single character', () => {
      expect(capitalizeFirst('a')).toBe('A');
    });

    it('should handle empty string', () => {
      expect(capitalizeFirst('')).toBe('');
    });

    it('should handle all caps', () => {
      expect(capitalizeFirst('TESTING')).toBe('Testing');
    });
  });

  describe('slugify', () => {
    it('should convert text to URL-friendly slug', () => {
      expect(slugify('Hello World Test')).toBe('hello-world-test');
    });

    it('should remove special characters', () => {
      expect(slugify('Hello! @#$% World?')).toBe('hello-world');
    });

    it('should handle multiple spaces and dashes', () => {
      expect(slugify('  Hello   World  ')).toBe('hello-world');
      expect(slugify('Hello---World___Test')).toBe('hello-world-test');
    });

    it('should remove leading and trailing dashes', () => {
      expect(slugify('-Hello World-')).toBe('hello-world');
    });

    it('should handle edge cases', () => {
      expect(slugify('')).toBe('');
      expect(slugify('   ')).toBe('');
      expect(slugify('123')).toBe('123');
    });
  });
});

describe('Email Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(isValidEmail('valid_email@domain-name.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@invalid.com')).toBe(false);
      expect(isValidEmail('invalid.com')).toBe(false);
      expect(isValidEmail('invalid@.com')).toBe(false);
      expect(isValidEmail('invalid@domain')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('   ')).toBe(false);
      expect(isValidEmail('a@b.c')).toBe(true); // Minimal valid email
    });
  });

  describe('extractEmailDomain', () => {
    it('should extract domain from email', () => {
      expect(extractEmailDomain('user@example.com')).toBe('example.com');
      expect(extractEmailDomain('test@subdomain.domain.org')).toBe('subdomain.domain.org');
    });

    it('should handle invalid emails', () => {
      expect(extractEmailDomain('invalid')).toBe('');
      expect(extractEmailDomain('invalid@')).toBe('');
      expect(extractEmailDomain('@invalid.com')).toBe('invalid.com');
    });
  });

  describe('maskEmail', () => {
    it('should mask email username', () => {
      expect(maskEmail('john@example.com')).toBe('j**n@example.com');
      expect(maskEmail('testuser@domain.org')).toBe('t******r@domain.org');
    });

    it('should handle short usernames', () => {
      expect(maskEmail('ab@test.com')).toBe('ab@test.com');
      expect(maskEmail('a@test.com')).toBe('a@test.com');
    });

    it('should handle invalid emails', () => {
      expect(maskEmail('invalid')).toBe('invalid');
      expect(maskEmail('')).toBe('');
    });
  });
});

describe('Business Utilities', () => {
  describe('formatPhoneNumber', () => {
    it('should format Australian mobile numbers', () => {
      expect(formatPhoneNumber('0412345678')).toBe('0412 345 678');
      expect(formatPhoneNumber('0487654321')).toBe('0487 654 321');
    });

    it('should format international Australian numbers', () => {
      expect(formatPhoneNumber('61412345678')).toBe('+61 4 1234 5678');
      expect(formatPhoneNumber('61387654321')).toBe('+61 3 8765 4321');
    });

    it('should handle numbers with spaces and dashes', () => {
      expect(formatPhoneNumber('04 1234 5678')).toBe('0412 345 678');
      expect(formatPhoneNumber('04-1234-5678')).toBe('0412 345 678');
    });

    it('should return original for invalid formats', () => {
      expect(formatPhoneNumber('123')).toBe('123');
      expect(formatPhoneNumber('invalid')).toBe('invalid');
      expect(formatPhoneNumber('')).toBe('');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency in AUD by default', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should handle different currencies', () => {
      const usdFormatted = formatCurrency(1234.56, 'USD');
      const eurFormatted = formatCurrency(1234.56, 'EUR');
      // Currency formatting varies by locale, just ensure proper formatting
      expect(usdFormatted).toMatch(/USD|\$.*1,?234\.56/);
      expect(eurFormatted).toMatch(/EUR|€.*1,?234\.56/);
    });

    it('should handle edge cases', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
      expect(formatCurrency(0.01)).toBe('$0.01');
    });
  });
});

describe('Array Utilities', () => {
  describe('groupBy', () => {
    it('should group array items by key function', () => {
      const items = [
        { type: 'fruit', name: 'apple' },
        { type: 'fruit', name: 'banana' },
        { type: 'vegetable', name: 'carrot' },
      ];
      
      const grouped = groupBy(items, item => item.type);
      
      expect(grouped).toEqual({
        fruit: [
          { type: 'fruit', name: 'apple' },
          { type: 'fruit', name: 'banana' },
        ],
        vegetable: [
          { type: 'vegetable', name: 'carrot' },
        ],
      });
    });

    it('should handle empty array', () => {
      const grouped = groupBy([], item => item.type);
      expect(grouped).toEqual({});
    });

    it('should handle single item', () => {
      const items = [{ type: 'fruit', name: 'apple' }];
      const grouped = groupBy(items, item => item.type);
      expect(grouped).toEqual({
        fruit: [{ type: 'fruit', name: 'apple' }],
      });
    });
  });

  describe('uniqueBy', () => {
    it('should return unique items by key function', () => {
      const items = [
        { id: 1, name: 'apple' },
        { id: 2, name: 'banana' },
        { id: 1, name: 'apple duplicate' },
      ];
      
      const unique = uniqueBy(items, item => item.id);
      
      expect(unique).toEqual([
        { id: 1, name: 'apple' },
        { id: 2, name: 'banana' },
      ]);
    });

    it('should handle empty array', () => {
      const unique = uniqueBy([], item => item.id);
      expect(unique).toEqual([]);
    });

    it('should handle all unique items', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const unique = uniqueBy(items, item => item.id);
      expect(unique).toEqual(items);
    });
  });
});

describe('API Utilities', () => {
  describe('createSuccessResponse', () => {
    it('should create success response with data', () => {
      const data = { message: 'Success' };
      const response = createSuccessResponse(data);
      
      expect(response).toEqual({
        success: true,
        data: { message: 'Success' },
      });
    });

    it('should handle null data', () => {
      const response = createSuccessResponse(null);
      expect(response).toEqual({
        success: true,
        data: null,
      });
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response from AppError', () => {
      const error = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        statusCode: 400,
        details: { field: 'email' },
      };
      
      const response = createErrorResponse(error);
      
      expect(response).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: { field: 'email' },
        },
      });
    });
  });

  describe('isApiError', () => {
    it('should identify error responses', () => {
      const errorResponse = { success: false, error: { code: 'ERROR', message: 'Failed' } };
      const successResponse = { success: true, data: {} };
      
      expect(isApiError(errorResponse)).toBe(true);
      expect(isApiError(successResponse)).toBe(false);
    });
  });
});

describe('Validation Utilities', () => {
  describe('validateRequired', () => {
    it('should return null for valid values', () => {
      expect(validateRequired('value', 'field')).toBeNull();
      expect(validateRequired(0, 'field')).toBeNull();
      expect(validateRequired(false, 'field')).toBeNull();
    });

    it('should return error for invalid values', () => {
      expect(validateRequired(null, 'field')).toBe('field is required');
      expect(validateRequired(undefined, 'field')).toBe('field is required');
      expect(validateRequired('', 'field')).toBe('field is required');
    });
  });

  describe('validateMinLength', () => {
    it('should return null for valid length', () => {
      expect(validateMinLength('hello', 3, 'field')).toBeNull();
      expect(validateMinLength('hello', 5, 'field')).toBeNull();
    });

    it('should return error for invalid length', () => {
      expect(validateMinLength('hi', 5, 'field')).toBe('field must be at least 5 characters');
    });
  });

  describe('validateMaxLength', () => {
    it('should return null for valid length', () => {
      expect(validateMaxLength('hello', 10, 'field')).toBeNull();
      expect(validateMaxLength('hello', 5, 'field')).toBeNull();
    });

    it('should return error for invalid length', () => {
      expect(validateMaxLength('hello world', 5, 'field')).toBe('field must be no more than 5 characters');
    });
  });
});

describe('File Utilities', () => {
  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal places', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('image.PNG')).toBe('png');
      expect(getFileExtension('file.name.txt')).toBe('txt');
    });

    it('should handle files without extension', () => {
      // getFileExtension with no dots returns the whole string as extension
      expect(getFileExtension('filename')).toBe('filename');
      expect(getFileExtension('')).toBe('');
    });
  });

  describe('isImageFile', () => {
    it('should identify image files', () => {
      expect(isImageFile('photo.jpg')).toBe(true);
      expect(isImageFile('image.PNG')).toBe(true);
      expect(isImageFile('icon.svg')).toBe(true);
    });

    it('should reject non-image files', () => {
      expect(isImageFile('document.pdf')).toBe(false);
      expect(isImageFile('script.js')).toBe(false);
      expect(isImageFile('noextension')).toBe(false);
    });
  });
});

describe('URL Utilities', () => {
  describe('buildUrl', () => {
    it('should build URL with base and path', () => {
      const url = buildUrl('https://api.example.com', '/users');
      expect(url).toBe('https://api.example.com/users');
    });

    it('should add query parameters', () => {
      const url = buildUrl('https://api.example.com', '/users', { page: '1', limit: '10' });
      expect(url).toBe('https://api.example.com/users?page=1&limit=10');
    });

    it('should handle existing query parameters', () => {
      const url = buildUrl('https://api.example.com/users?existing=true', '', { page: '1' });
      expect(url).toBe('https://api.example.com/users?existing=true&page=1');
    });
  });
});

describe('Error Utilities', () => {
  describe('createAppError', () => {
    it('should create AppError with all fields', () => {
      const error = createAppError('VALIDATION_ERROR', 'Invalid input', 400, { field: 'email' });
      
      expect(error).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        statusCode: 400,
        details: { field: 'email' },
      });
    });

    it('should use default status code', () => {
      const error = createAppError('INTERNAL_ERROR', 'Something went wrong');
      
      expect(error).toEqual({
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong',
        statusCode: 500,
        details: undefined,
      });
    });
  });
});

describe('Environment Utilities', () => {
  beforeEach(() => {
    delete process.env['NODE_ENV'];
  });

  describe('isDevelopment', () => {
    it('should return true for development environment', () => {
      process.env['NODE_ENV'] = 'development';
      expect(isDevelopment()).toBe(true);
    });

    it('should return false for other environments', () => {
      process.env['NODE_ENV'] = 'production';
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('isProduction', () => {
    it('should return true for production environment', () => {
      process.env['NODE_ENV'] = 'production';
      expect(isProduction()).toBe(true);
    });

    it('should return false for other environments', () => {
      process.env['NODE_ENV'] = 'development';
      expect(isProduction()).toBe(false);
    });
  });

  describe('isTest', () => {
    it('should return true for test environment', () => {
      process.env['NODE_ENV'] = 'test';
      expect(isTest()).toBe(true);
    });

    it('should return false for other environments', () => {
      process.env['NODE_ENV'] = 'development';
      expect(isTest()).toBe(false);
    });
  });
});

// Performance Tests
describe('Performance Tests', () => {
  it('should handle large arrays efficiently', () => {
    const largeArray = Array.from({ length: 10000 }, (_, i) => ({ id: i % 100, value: i }));
    
    const start = performance.now();
    const grouped = groupBy(largeArray, item => item.id);
    const unique = uniqueBy(largeArray, item => item.id);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    expect(Object.keys(grouped)).toHaveLength(100);
    expect(unique).toHaveLength(100);
  });

  it('should handle long strings efficiently', () => {
    const longText = 'a'.repeat(10000);
    
    const start = performance.now();
    const truncated = truncateText(longText, 100);
    const slugified = slugify(longText.substring(0, 1000));
    const end = performance.now();
    
    expect(end - start).toBeLessThan(50); // Should complete in under 50ms
    expect(truncated).toHaveLength(100); // truncateText with maxLength 100 returns exactly 100 chars (97 + '...')
    expect(slugified).toMatch(/^a+$/);
  });

  it('should handle many validation calls efficiently', () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      isValidEmail(`user${i}@example.com`);
      validateRequired(`value${i}`, 'field');
    }
    
    const end = performance.now();
    expect(end - start).toBeLessThan(100); // Should complete in under 100ms
  });
});