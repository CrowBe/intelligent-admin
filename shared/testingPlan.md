# Shared Module Testing Plan

## Overview

The shared module provides common TypeScript utilities, types, and validation logic used across the frontend and backend. This testing plan focuses on comprehensive unit testing of pure functions, type validation, utility libraries, and cross-platform compatibility.

## Architecture Under Test

### Core Components
- **Types**: Shared TypeScript interfaces and type definitions
- **Utilities**: Common helper functions and business logic
- **Validators**: Zod schemas and validation functions
- **Constants**: Business rules and configuration values
- **Date/Time Utilities**: Australian timezone and business hour handling

### Key Files
```
shared/src/
├── types/
│   ├── user.ts           # User and authentication types
│   ├── business.ts       # Trade business domain types
│   ├── email.ts          # Email analysis and categorization
│   └── industry.ts       # Australian trade standards
├── utils/
│   ├── validation.ts     # Input validation and sanitization
│   ├── formatting.ts     # Text and data formatting
│   ├── business.ts       # Business logic utilities
│   └── dates.ts          # Date/time handling
└── index.ts              # Public API exports
```

## Testing Strategy

### Test Types & Distribution
- **Unit Tests**: 85% (individual functions, pure logic)
- **Integration Tests**: 10% (cross-module compatibility)
- **Type Tests**: 5% (TypeScript type validation)

### Coverage Requirements
- **Lines**: 90% minimum (highest standard for shared code)
- **Functions**: 90% minimum
- **Branches**: 85% minimum
- **Statements**: 90% minimum

## Unit Testing Standards

### Pure Function Testing

#### Basic Structure
```typescript
import { describe, it, expect } from 'vitest';
import { functionName } from '../utils/module';

describe('functionName', () => {
  it('should return expected output for valid input', () => {
    const input = validTestInput;
    const expected = expectedOutput;
    const result = functionName(input);
    expect(result).toEqual(expected);
  });

  it('should handle edge cases appropriately', () => {
    // Test boundary conditions and edge cases
  });

  it('should throw meaningful errors for invalid input', () => {
    expect(() => functionName(invalidInput)).toThrow('Expected error message');
  });
});
```

### Business Logic Testing

#### Australian Trade Business Utilities
```typescript
describe('Business Utilities', () => {
  describe('extractABN', () => {
    it('should extract valid ABN from text', () => {
      const text = 'Our ABN is 12 345 678 901 for tax purposes';
      const result = extractABN(text);
      expect(result).toBe('12 345 678 901');
    });

    it('should return null for invalid ABN format', () => {
      const text = 'Invalid ABN: 123456789';
      const result = extractABN(text);
      expect(result).toBeNull();
    });
  });

  describe('validateElectricalLicense', () => {
    it('should validate NSW electrical contractor license', () => {
      const license = 'NSW-EL-12345';
      const result = validateElectricalLicense(license, 'NSW');
      expect(result.valid).toBe(true);
      expect(result.state).toBe('NSW');
      expect(result.type).toBe('electrical');
    });

    it('should reject invalid license formats', () => {
      const license = 'INVALID-123';
      const result = validateElectricalLicense(license, 'NSW');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid license format');
    });
  });

  describe('determineBusinessHours', () => {
    it('should return standard business hours for trade businesses', () => {
      const businessType = 'electrical_contractor';
      const location = 'Sydney, NSW';
      const result = determineBusinessHours(businessType, location);
      
      expect(result).toMatchObject({
        monday: { open: '07:00', close: '17:00' },
        saturday: { open: '08:00', close: '12:00' },
        sunday: null, // Closed
        timezone: 'Australia/Sydney',
      });
    });
  });
});
```

### Validation Testing

#### Zod Schema Validation
```typescript
import { z } from 'zod';
import { UserSchema, BusinessSchema } from '../types/schemas';

describe('Zod Schemas', () => {
  describe('UserSchema', () => {
    it('should validate correct user data', () => {
      const validUser = {
        id: 'user-123',
        email: 'john@example.com',
        name: 'John Smith',
        businessType: 'electrical_contractor',
        location: 'Sydney, NSW',
      };

      const result = UserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validUser);
      }
    });

    it('should reject invalid email formats', () => {
      const invalidUser = {
        id: 'user-123',
        email: 'invalid-email',
        name: 'John Smith',
      };

      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });
  });

  describe('EmailUrgencySchema', () => {
    it('should validate email analysis data', () => {
      const emailAnalysis = {
        subject: 'URGENT: WorkSafe Inspection Required',
        urgencyScore: 8.5,
        category: 'compliance',
        keywords: ['urgent', 'worksafe', 'inspection'],
        actionRequired: true,
        estimatedResponseTime: '2 hours',
      };

      const result = EmailUrgencySchema.safeParse(emailAnalysis);
      expect(result.success).toBe(true);
    });
  });
});
```

### Date/Time Utilities Testing

#### Australian Business Hours and Timezones
```typescript
describe('Date Utilities', () => {
  describe('isBusinessHours', () => {
    it('should detect business hours in Sydney timezone', () => {
      const businessHours = new Date('2024-03-15T10:00:00+11:00'); // 10 AM AEDT
      const afterHours = new Date('2024-03-15T19:00:00+11:00');   // 7 PM AEDT
      const weekend = new Date('2024-03-17T10:00:00+11:00');      // Sunday

      expect(isBusinessHours(businessHours, 'Australia/Sydney')).toBe(true);
      expect(isBusinessHours(afterHours, 'Australia/Sydney')).toBe(false);
      expect(isBusinessHours(weekend, 'Australia/Sydney')).toBe(false);
    });

    it('should handle daylight saving transitions', () => {
      const dstStart = new Date('2024-10-06T10:00:00+11:00'); // DST begins
      const dstEnd = new Date('2024-04-07T10:00:00+10:00');   // DST ends
      
      expect(isBusinessHours(dstStart, 'Australia/Sydney')).toBe(true);
      expect(isBusinessHours(dstEnd, 'Australia/Sydney')).toBe(true);
    });
  });

  describe('formatAustralianDate', () => {
    it('should format dates in Australian DD/MM/YYYY format', () => {
      const date = new Date('2024-03-15T10:30:00Z');
      const formatted = formatAustralianDate(date);
      expect(formatted).toBe('15/03/2024');
    });

    it('should handle different timezones correctly', () => {
      const utcDate = new Date('2024-03-15T13:00:00Z'); // 1 PM UTC
      const sydneyFormatted = formatAustralianDate(utcDate, 'Australia/Sydney');
      const perthFormatted = formatAustralianDate(utcDate, 'Australia/Perth');
      
      // Both should show the correct local date
      expect(sydneyFormatted).toMatch(/^\d{2}\/\d{2}\/2024$/);
      expect(perthFormatted).toMatch(/^\d{2}\/\d{2}\/2024$/);
    });
  });

  describe('calculateBusinessDays', () => {
    it('should calculate business days excluding weekends', () => {
      const startDate = new Date('2024-03-15'); // Friday
      const endDate = new Date('2024-03-22');   // Next Friday
      
      const businessDays = calculateBusinessDays(startDate, endDate);
      expect(businessDays).toBe(5); // Mon, Tue, Wed, Thu, Fri
    });

    it('should handle public holidays', () => {
      const startDate = new Date('2024-04-24'); // Day before ANZAC Day
      const endDate = new Date('2024-04-26');   // Day after ANZAC Day
      
      const businessDays = calculateBusinessDays(startDate, endDate, 'NSW');
      expect(businessDays).toBe(1); // Only one business day (Apr 26)
    });
  });
});
```

### Text Processing and Formatting

#### Australian Industry-Specific Text Processing
```typescript
describe('Text Processing', () => {
  describe('extractIndustryStandards', () => {
    it('should identify Australian Standards references', () => {
      const text = `
        The electrical work must comply with AS/NZS 3000:2018 
        and follow AS/NZS 3018:2007 for earthing systems.
      `;
      
      const standards = extractIndustryStandards(text);
      expect(standards).toEqual([
        'AS/NZS 3000:2018',
        'AS/NZS 3018:2007'
      ]);
    });
  });

  describe('formatBusinessAddress', () => {
    it('should format Australian addresses correctly', () => {
      const address = {
        street: '123 Collins Street',
        suburb: 'Melbourne',
        state: 'VIC',
        postcode: '3000',
      };
      
      const formatted = formatBusinessAddress(address);
      expect(formatted).toBe('123 Collins Street, Melbourne VIC 3000');
    });
  });

  describe('sanitizeFileName', () => {
    it('should create safe filenames from document titles', () => {
      const unsafeTitle = 'Electrical Certificate (Final) - Site #123 & Co.';
      const safe = sanitizeFileName(unsafeTitle);
      expect(safe).toBe('electrical-certificate-final-site-123-co');
      expect(safe).not.toMatch(/[^a-z0-9-]/);
    });
  });
});
```

### Type Validation Testing

#### TypeScript Type Guards
```typescript
describe('Type Guards', () => {
  describe('isValidBusinessType', () => {
    it('should validate known business types', () => {
      const validTypes = [
        'electrical_contractor',
        'plumbing_contractor', 
        'building_contractor',
        'hvac_contractor',
      ];

      validTypes.forEach(type => {
        expect(isValidBusinessType(type)).toBe(true);
      });
    });

    it('should reject invalid business types', () => {
      const invalidTypes = ['unknown_type', '', null, undefined, 123];
      
      invalidTypes.forEach(type => {
        expect(isValidBusinessType(type as any)).toBe(false);
      });
    });
  });

  describe('isEmailUrgent', () => {
    it('should identify urgent email characteristics', () => {
      const urgentEmails = [
        { subject: 'URGENT: Site Safety Issue', urgencyScore: 9 },
        { subject: 'WorkSafe NSW Notice', urgencyScore: 8.5 },
        { subject: 'Immediate Action Required', urgencyScore: 8 },
      ];

      urgentEmails.forEach(email => {
        expect(isEmailUrgent(email)).toBe(true);
      });
    });
  });
});
```

## Error Handling and Edge Cases

### Boundary Value Testing
```typescript
describe('Edge Cases and Boundaries', () => {
  describe('Input Validation', () => {
    it('should handle null and undefined inputs gracefully', () => {
      expect(formatBusinessName(null)).toBe('');
      expect(formatBusinessName(undefined)).toBe('');
      expect(formatBusinessName('')).toBe('');
    });

    it('should handle extremely long inputs', () => {
      const longText = 'a'.repeat(10000);
      expect(() => validateABN(longText)).not.toThrow();
      expect(validateABN(longText).valid).toBe(false);
    });

    it('should handle special characters and unicode', () => {
      const unicodeText = 'Café Électrique Pty Ltd 🔌';
      const result = sanitizeBusinessName(unicodeText);
      expect(result).toBe('Cafe Electrique Pty Ltd');
    });
  });

  describe('Numeric Boundaries', () => {
    it('should handle urgency score boundaries', () => {
      expect(calculateUrgencyLevel(-1)).toBe('low');
      expect(calculateUrgencyLevel(0)).toBe('low');
      expect(calculateUrgencyLevel(5)).toBe('medium');
      expect(calculateUrgencyLevel(10)).toBe('high');
      expect(calculateUrgencyLevel(11)).toBe('high'); // Clamped to max
    });
  });
});
```

### Performance Testing
```typescript
describe('Performance Requirements', () => {
  it('should process large datasets efficiently', () => {
    const largeEmailList = Array(1000).fill(null).map((_, i) => ({
      id: `email-${i}`,
      subject: `Test Email ${i}`,
      body: 'Sample content '.repeat(100),
    }));

    const start = performance.now();
    const results = categorizeEmails(largeEmailList);
    const duration = performance.now() - start;

    expect(results).toHaveLength(1000);
    expect(duration).toBeLessThan(1000); // < 1 second for 1000 emails
  });

  it('should handle text processing efficiently', () => {
    const longText = 'Sample text with standards references. '.repeat(1000);
    
    const start = performance.now();
    const standards = extractIndustryStandards(longText);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100); // < 100ms for large text
  });
});
```

## Cross-Platform Compatibility

### Node.js vs Browser Environment
```typescript
describe('Cross-Platform Compatibility', () => {
  it('should work in Node.js environment', () => {
    // Test Node.js specific features
    expect(typeof process !== 'undefined').toBe(true);
    
    const result = formatAustralianDate(new Date());
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('should work in browser environment', () => {
    // Mock browser environment
    const originalProcess = global.process;
    // @ts-ignore
    delete global.process;

    const result = formatAustralianDate(new Date());
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);

    // Restore
    global.process = originalProcess;
  });
});
```

## Test Data and Fixtures

### Australian Business Test Data
```typescript
export const testBusinessData = {
  electrical: {
    abn: '12 345 678 901',
    licenses: ['NSW-EL-12345', 'ACT-EL-67890'],
    standards: ['AS/NZS 3000:2018', 'AS/NZS 3018:2007'],
    businessHours: {
      monday: { open: '07:00', close: '17:00' },
      friday: { open: '07:00', close: '17:00' },
      saturday: { open: '08:00', close: '12:00' },
    },
  },
  plumbing: {
    abn: '23 456 789 012',
    licenses: ['NSW-PL-23456', 'VIC-PL-78901'],
    standards: ['AS/NZS 3500:2018'],
    emergencyHours: true,
  },
};

export const testEmailData = {
  urgent: {
    subject: 'URGENT: WorkSafe NSW Inspection Notice',
    sender: 'noreply@safework.nsw.gov.au',
    urgencyScore: 9,
    category: 'compliance',
  },
  routine: {
    subject: 'Weekly newsletter from Electrical Contractors Association',
    sender: 'newsletter@eca.org.au',
    urgencyScore: 2,
    category: 'information',
  },
};
```

## Mock Strategy

### External Dependencies
```typescript
// Since shared module should be dependency-free, 
// most mocking involves environment simulation
describe('Environment Mocking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset any global state
  });

  it('should handle different timezone environments', () => {
    const originalTimezone = process.env.TZ;
    
    // Test Sydney timezone
    process.env.TZ = 'Australia/Sydney';
    const sydneyResult = getCurrentBusinessHours();
    
    // Test Perth timezone  
    process.env.TZ = 'Australia/Perth';
    const perthResult = getCurrentBusinessHours();
    
    expect(sydneyResult.timezone).toBe('Australia/Sydney');
    expect(perthResult.timezone).toBe('Australia/Perth');
    
    // Restore
    process.env.TZ = originalTimezone;
  });
});
```

## CI/CD Integration

### Test Pipeline Configuration
```typescript
// vitest.config.ts specific for shared module
export default defineConfig({
  test: {
    name: 'shared',
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90,
        },
      },
    },
    testTimeout: 5000,
  },
});
```

### Quality Gates
- **Coverage**: 90% minimum (stricter for shared utilities)
- **Performance**: All tests < 100ms execution time
- **Type Safety**: Zero TypeScript errors
- **Linting**: Zero ESLint violations

## Documentation Testing

### Type Documentation
```typescript
describe('Type Exports', () => {
  it('should export all expected types', () => {
    // Verify public API exports
    expect(typeof UserType).toBe('object');
    expect(typeof BusinessType).toBe('object');
    expect(typeof EmailAnalysisType).toBe('object');
  });

  it('should have proper JSDoc documentation', () => {
    // Test that key functions have documentation
    const func = extractABN;
    expect(func.toString()).toContain('/**');
  });
});
```

## Maintenance and Monitoring

### Regular Tasks
- **Daily**: Monitor test performance and execution times
- **Weekly**: Review coverage reports and identify gaps
- **Monthly**: Update test data and business rules
- **Quarterly**: Review Australian standards and regulatory changes

### Metrics to Track
- **Function Coverage**: Ensure all public functions tested
- **Type Coverage**: Verify all exported types validated
- **Performance**: Monitor execution time trends
- **Cross-Platform**: Regular testing in different environments

---

*Last Updated: {{ current_date }}*
*Framework: Pure TypeScript with Vitest*
*Target Coverage: 90% minimum (shared utilities standard)*