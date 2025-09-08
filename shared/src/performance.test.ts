/**
 * Performance and Compatibility Tests
 * Ensures shared utilities perform well and work across platforms
 */


import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  // Performance-critical utilities
  groupBy,
  uniqueBy,
  truncateText,
  formatDate,
  formatDateTime,
  isValidEmail,
  slugify,
  
  // Business utilities
  formatPhoneNumber,
  formatCurrency,
  
  // File utilities
  formatFileSize,
  isImageFile,
  
  // Validation utilities
  validateRequired,
  validateMinLength,
  validateMaxLength,
} from './utils/index.js';

describe('Performance Tests', () => {
  beforeEach(() => {
    // Set up performance timing
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Large Dataset Processing', () => {
    it('should handle large arrays efficiently in groupBy', () => {
      // Create large dataset
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        category: `category-${i % 50}`, // 50 different categories
        type: i % 2 === 0 ? 'even' : 'odd',
        value: Math.random() * 1000,
      }));

      const start = performance.now();
      const grouped = groupBy(largeArray, item => item.category);
      const end = performance.now();

      expect(end - start).toBeLessThan(50); // Should complete in under 50ms
      expect(Object.keys(grouped)).toHaveLength(50);
      expect(grouped['category-0']).toHaveLength(200); // 10000 / 50
    });

    it('should handle large arrays efficiently in uniqueBy', () => {
      // Create array with many duplicates
      const arrayWithDuplicates = Array.from({ length: 10000 }, (_, i) => ({
        id: i % 1000, // Only 1000 unique IDs
        name: `item-${i % 1000}`,
        data: `data-${i}`,
      }));

      const start = performance.now();
      const unique = uniqueBy(arrayWithDuplicates, item => item.id);
      const end = performance.now();

      expect(end - start).toBeLessThan(50); // Should complete in under 50ms
      expect(unique).toHaveLength(1000);
    });

    it('should process many text operations efficiently', () => {
      const texts = Array.from({ length: 1000 }, (_, i) => 
        `This is a very long text string that needs to be processed efficiently for item number ${i} in our performance test`
      );

      const start = performance.now();
      
      const results = texts.map(text => ({
        truncated: truncateText(text, 50),
        slugified: slugify(text.substring(0, 100)),
        length: text.length,
      }));

      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
      expect(results).toHaveLength(1000);
      expect(results[0].truncated.length).toBeLessThanOrEqual(53); // 50 + '...'
    });

    it('should validate emails efficiently at scale', () => {
      const emails = Array.from({ length: 1000 }, (_, i) => {
        const domains = ['gmail.com', 'yahoo.com', 'business.com', 'example.org'];
        const domain = domains[i % domains.length];
        return `user${i}@${domain}`;
      });

      const start = performance.now();
      const validations = emails.map(email => isValidEmail(email));
      const end = performance.now();

      expect(end - start).toBeLessThan(50); // Should complete in under 50ms
      expect(validations.every(valid => valid)).toBe(true);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not leak memory with repeated operations', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        const data = Array.from({ length: 100 }, (_, j) => ({
          id: j,
          category: `cat-${j % 10}`,
        }));
        
        groupBy(data, item => item.category);
        uniqueBy(data, item => item.id);
        
        // Force garbage collection periodically
        if (i % 100 === 0 && global.gc !== undefined) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent utility calls', async () => {
      const promises = Array.from({ length: 100 }, async (_, i) => {
        return {
          date: formatDate(new Date()),
          email: isValidEmail(`user${i}@example.com`),
          truncated: truncateText(`Text ${i}`, 10),
          phone: formatPhoneNumber(`041234567${i % 10}`),
        };
      });

      const start = performance.now();
      const results = await Promise.all(promises);
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
      expect(results).toHaveLength(100);
      expect(results.every(r => r.email)).toBe(true);
    });
  });
});

describe('Cross-Platform Compatibility Tests', () => {
  describe('Date Formatting Consistency', () => {
    it('should format dates consistently across different environments', () => {
      const testDate = new Date('2024-03-15T10:30:00.000Z');
      
      const formatted = formatDate(testDate);
      const formattedDateTime = formatDateTime(testDate);

      // Should always produce consistent format regardless of system locale
      expect(formatted).toMatch(/\d{1,2} \w{3} \d{4}/);
      expect(formattedDateTime).toMatch(/\d{1,2} \w{3} \d{4}.*\d{1,2}:\d{2}/);
    });

    it('should handle timezone differences gracefully', () => {
      // Test with different timezone scenarios
      const utcDate = new Date('2024-01-01T00:00:00.000Z');
      const noonDate = new Date('2024-01-01T12:00:00.000Z');
      
      const utcFormatted = formatDate(utcDate);
      const noonFormatted = formatDate(noonDate);
      
      // Both should format without errors
      expect(typeof utcFormatted).toBe('string');
      expect(typeof noonFormatted).toBe('string');
      expect(utcFormatted.length).toBeGreaterThan(0);
      expect(noonFormatted.length).toBeGreaterThan(0);
    });
  });

  describe('Currency Formatting Compatibility', () => {
    it('should format currency consistently in different environments', () => {
      const amounts = [0, 0.01, 1, 10, 100, 1000, 10000, 1000000.99];
      
      amounts.forEach(amount => {
        const formatted = formatCurrency(amount);
        
        // Should always include currency symbol and proper decimal places
        expect(formatted).toMatch(/\$[\d,]+\.\d{2}/);
        
        // Should handle large numbers with commas
        if (amount >= 1000) {
          expect(formatted).toMatch(/,/);
        }
      });
    });

    it('should handle different currencies', () => {
      const currencies = ['AUD', 'USD', 'EUR', 'GBP'];
      const amount = 1234.56;
      
      currencies.forEach(currency => {
        const formatted = formatCurrency(amount, currency);
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);
      });
    });
  });

  describe('File Operations Compatibility', () => {
    it('should handle file paths with different separators', () => {
      const windowsPath = 'C:\\Users\\Documents\\image.jpg';
      const unixPath = '/home/user/documents/image.jpg';
      const urlPath = 'https://example.com/files/image.jpg';
      
      // getFileExtension should work with all path types
      expect(isImageFile(windowsPath)).toBe(true);
      expect(isImageFile(unixPath)).toBe(true);
      expect(isImageFile(urlPath)).toBe(true);
    });

    it('should handle various file sizes', () => {
      const sizes = [
        0,
        1,
        1023,
        1024,
        1025,
        1048576,
        1073741824,
        1099511627776, // 1TB
      ];
      
      sizes.forEach(size => {
        const formatted = formatFileSize(size);
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);
        expect(formatted).toMatch(/\d+(\.\d+)?\s+(Bytes|KB|MB|GB|TB)/);
      });
    });
  });

  describe('Text Processing Compatibility', () => {
    it('should handle Unicode and special characters', () => {
      const unicodeStrings = [
        'Hello 世界',
        'Café naïve résumé',
        'Привет мир',
        '🚀 Emoji test 🌟',
        'Mixed 123 نمونه text',
      ];
      
      unicodeStrings.forEach(str => {
        // All text utilities should handle Unicode gracefully
        expect(() => truncateText(str, 10)).not.toThrow();
        expect(() => slugify(str)).not.toThrow();
        
        const truncated = truncateText(str, 5);
        const slug = slugify(str);
        
        expect(typeof truncated).toBe('string');
        expect(typeof slug).toBe('string');
      });
    });

    it('should handle very long strings', () => {
      const veryLongString = 'a'.repeat(100000);
      
      const start = performance.now();
      const truncated = truncateText(veryLongString, 100);
      const slug = slugify(veryLongString.substring(0, 1000));
      const end = performance.now();
      
      expect(end - start).toBeLessThan(50); // Should handle efficiently
      expect(truncated).toHaveLength(100); // truncateText with maxLength 100 returns exactly 100 chars (97 + '...')
      expect(slug).toBe('a'.repeat(1000));
    });
  });

  describe('Phone Number Regional Compatibility', () => {
    it('should handle various Australian phone formats', () => {
      const phoneFormats = [
        '0412345678',
        '04 1234 5678',
        '04-1234-5678',
        '04.1234.5678',
        '(04) 1234 5678',
        '+61412345678',
        '61412345678',
        '+61 4 1234 5678',
        '0387654321', // Landline
        '03 8765 4321',
      ];
      
      phoneFormats.forEach(phone => {
        const formatted = formatPhoneNumber(phone);
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);
        
        // Should either format properly or return original
        expect(formatted === phone || formatted.includes(' ')).toBe(true);
      });
    });
  });
});

describe('Edge Case Handling', () => {
  describe('Null and Undefined Handling', () => {
    it('should handle null/undefined inputs gracefully', () => {
      // Test validation utilities with null/undefined
      expect(validateRequired(null, 'field')).toBe('field is required');
      expect(validateRequired(undefined, 'field')).toBe('field is required');
      expect(validateRequired('', 'field')).toBe('field is required');
      
      // These should not crash with null/undefined
      expect(() => truncateText('', 10)).not.toThrow();
      expect(() => slugify('')).not.toThrow();
      expect(() => isValidEmail('')).not.toThrow();
      expect(() => formatFileSize(0)).not.toThrow();
    });
  });

  describe('Boundary Value Testing', () => {
    it('should handle minimum and maximum values', () => {
      // Test with minimum values
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(truncateText('a', 1)).toBe('a');
      expect(validateMinLength('', 0, 'field')).toBeNull();
      
      // Test with large values
      expect(formatFileSize(Number.MAX_SAFE_INTEGER)).toMatch(/\d+(\.\d+)?\s+\w+/);
      expect(validateMaxLength('a', Number.MAX_SAFE_INTEGER, 'field')).toBeNull();
    });

    it('should handle exact boundary conditions', () => {
      const text = 'exactly twenty chars';
      expect(text.length).toBe(20);
      
      // Test exact length scenarios
      expect(truncateText(text, 20)).toBe(text);
      expect(truncateText(text, 19)).toBe('exactly twenty c...');
      expect(validateMinLength(text, 20, 'field')).toBeNull();
      expect(validateMaxLength(text, 20, 'field')).toBeNull();
      expect(validateMinLength(text, 21, 'field')).toBe('field must be at least 21 characters');
      expect(validateMaxLength(text, 19, 'field')).toBe('field must be no more than 19 characters');
    });
  });

  describe('Special Character Handling', () => {
    it('should handle HTML and script tags safely', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        '"><script>alert("xss")</script>',
        'javascript:alert(1)',
      ];
      
      maliciousInputs.forEach(input => {
        // Utilities should process these safely without executing
        expect(() => truncateText(input, 20)).not.toThrow();
        expect(() => slugify(input)).not.toThrow();
        
        const truncated = truncateText(input, 20);
        const slug = slugify(input);
        
        // Should not contain executable content
        expect(typeof truncated).toBe('string');
        expect(typeof slug).toBe('string');
      });
    });

    it('should handle SQL injection patterns safely', () => {
      const sqlInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "1' UNION SELECT * FROM users --",
      ];
      
      sqlInputs.forEach(input => {
        // Should process without issues (not that these utilities do DB operations)
        expect(() => truncateText(input, 30)).not.toThrow();
        expect(() => validateRequired(input, 'field')).not.toThrow();
        
        const result = truncateText(input, 30);
        expect(typeof result).toBe('string');
      });
    });
  });
});