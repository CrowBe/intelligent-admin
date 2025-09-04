# Backend Testing Plan

## Overview

The backend module provides the Node.js/Express API server with business logic for the AI-powered administrative assistant. This testing plan covers API endpoint testing, service layer validation, database operations, and integration with external services.

## Architecture Under Test

### API Endpoints
- **Authentication**: `/auth/*` - Kinde OAuth integration
- **Chat**: `/api/v1/chat/*` - AI conversation handling
- **Documents**: `/api/v1/documents/*` - File upload and processing
- **Gmail Integration**: `/api/v1/gmail/*` - Email analysis and management
- **Industry Knowledge**: `/api/v1/industry/*` - Australian trade standards
- **Notifications**: `/api/v1/notifications/*` - Push notification system

### Business Services
- **EmailAnalysisService**: Email urgency detection and categorization
- **NotificationService**: Firebase push notifications and preferences
- **OnboardingService**: User setup and progressive disclosure
- **SchedulerService**: Task scheduling and automation
- **IndustryKnowledgeService**: Australian trade regulations integration

### Data Layer
- **Prisma ORM**: Database operations and migrations
- **Repository Pattern**: Data access abstraction
- **DIContainer**: Dependency injection for services

## Testing Strategy

### Test Types & Distribution
- **Unit Tests**: 50% (individual functions, utilities)
- **Integration Tests**: 40% (API endpoints, service interactions)
- **Database Tests**: 10% (repository layer, migrations)

### Coverage Requirements
- **Lines**: 80% minimum
- **Functions**: 80% minimum
- **Branches**: 75% minimum
- **Statements**: 80% minimum

## API Endpoint Testing

### Express Route Testing

#### Basic Structure
```typescript
import request from 'supertest';
import { app } from '../app';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('POST /api/v1/chat/message', () => {
  beforeEach(async () => {
    // Setup test database
    await setupTestDB();
  });

  afterEach(async () => {
    // Cleanup test data
    await cleanupTestDB();
  });

  it('should process chat messages with authentication', async () => {
    const response = await request(app)
      .post('/api/v1/chat/message')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ message: 'Help me schedule a meeting' })
      .expect(200);

    expect(response.body).toMatchObject({
      reply: expect.any(String),
      intent: 'scheduling',
      confidence: expect.any(Number),
    });
  });
});
```

#### Authentication Testing
```typescript
describe('Authentication Middleware', () => {
  it('should reject requests without valid token', async () => {
    await request(app)
      .post('/api/v1/chat/message')
      .send({ message: 'test' })
      .expect(401);
  });

  it('should accept requests with valid Kinde token', async () => {
    const response = await request(app)
      .get('/api/v1/user/profile')
      .set('Authorization', `Bearer ${kindeToken}`)
      .expect(200);
  });
});
```

### Document Upload Testing

#### File Processing Tests
```typescript
describe('POST /api/v1/documents/upload', () => {
  it('should process PDF documents correctly', async () => {
    const pdfBuffer = await fs.readFile('test/fixtures/sample.pdf');
    
    const response = await request(app)
      .post('/api/v1/documents/upload')
      .set('Authorization', `Bearer ${validToken}`)
      .attach('document', pdfBuffer, 'sample.pdf')
      .field('category', 'regulation')
      .expect(201);

    expect(response.body).toMatchObject({
      documentId: expect.any(String),
      status: 'processing',
      extractedText: expect.any(String),
    });
  });

  it('should reject unsupported file types', async () => {
    const executableBuffer = Buffer.from('malicious content');
    
    await request(app)
      .post('/api/v1/documents/upload')
      .set('Authorization', `Bearer ${validToken}`)
      .attach('document', executableBuffer, 'malware.exe')
      .expect(400);
  });
});
```

### Gmail Integration Testing

#### Email Analysis Tests
```typescript
describe('Gmail Integration API', () => {
  it('should analyze email urgency correctly', async () => {
    const mockGmailData = {
      subject: 'URGENT: Site Safety Violation',
      body: 'Immediate action required for compliance',
      sender: 'safety@worksafe.nsw.gov.au',
    };

    const response = await request(app)
      .post('/api/v1/gmail/analyze')
      .set('Authorization', `Bearer ${validToken}`)
      .send(mockGmailData)
      .expect(200);

    expect(response.body).toMatchObject({
      urgency: 'high',
      category: 'compliance',
      suggestedActions: expect.arrayContaining([
        expect.objectContaining({ type: 'immediate_response' })
      ]),
    });
  });
});
```

## Service Layer Testing

### Business Logic Testing

#### Email Analysis Service
```typescript
describe('EmailAnalysisService', () => {
  let service: EmailAnalysisService;
  let mockPrisma: MockPrismaClient;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new EmailAnalysisService(mockPrisma);
  });

  it('should detect urgent safety-related emails', async () => {
    const email = {
      subject: 'WorkSafe NSW Notice',
      body: 'Compliance inspection required within 24 hours',
      sender: 'noreply@safework.nsw.gov.au',
    };

    const analysis = await service.analyzeUrgency(email);

    expect(analysis).toMatchObject({
      urgencyScore: expect.toBeGreaterThan(8),
      category: 'compliance',
      keywords: expect.arrayContaining(['inspection', 'WorkSafe']),
      actionRequired: true,
    });
  });

  it('should categorize trade-specific emails correctly', async () => {
    const emails = [
      { subject: 'Electrical Certificate Required', category: 'electrical' },
      { subject: 'Plumbing Permit Update', category: 'plumbing' },
      { subject: 'Building Code Changes 2024', category: 'construction' },
    ];

    for (const email of emails) {
      const result = await service.categorizeEmail(email);
      expect(result.category).toBe(email.category);
    }
  });
});
```

#### Notification Service Testing
```typescript
describe('NotificationService', () => {
  it('should send Firebase notifications successfully', async () => {
    const mockNotification = {
      userId: 'user123',
      title: 'Urgent Email Received',
      body: 'WorkSafe inspection notice requires attention',
      type: 'email_urgent',
    };

    vi.spyOn(admin.messaging(), 'send').mockResolvedValue('message-id');

    const result = await service.sendNotification(mockNotification);

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('message-id');
  });

  it('should respect user notification preferences', async () => {
    mockPrisma.notificationPreference.findUnique.mockResolvedValue({
      emailUrgent: false,
      morningBrief: true,
    });

    const shouldSend = await service.shouldSendNotification('user123', 'email_urgent');
    expect(shouldSend).toBe(false);
  });
});
```

### Database Testing

#### Repository Layer Tests
```typescript
describe('EmailRepository', () => {
  let repository: EmailRepository;
  let testDB: PrismaClient;

  beforeAll(async () => {
    testDB = new PrismaClient({
      datasources: { db: { url: TEST_DATABASE_URL } }
    });
    repository = new EmailRepository(testDB);
  });

  afterEach(async () => {
    await testDB.email.deleteMany({});
  });

  it('should store and retrieve emails correctly', async () => {
    const emailData = {
      subject: 'Test Email',
      body: 'Test content',
      sender: 'test@example.com',
      urgencyScore: 5,
    };

    const saved = await repository.create(emailData);
    expect(saved.id).toBeDefined();

    const retrieved = await repository.findById(saved.id);
    expect(retrieved).toMatchObject(emailData);
  });
});
```

#### Migration Testing
```typescript
describe('Database Migrations', () => {
  it('should run all migrations successfully', async () => {
    const { execSync } = require('child_process');
    
    expect(() => {
      execSync('npx prisma migrate deploy', {
        env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL }
      });
    }).not.toThrow();
  });
});
```

## External Service Integration Testing

### OpenAI API Testing
```typescript
describe('OpenAI Integration', () => {
  it('should generate appropriate responses for trade queries', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'Based on AS/NZS 3000:2018, you need...'
        }
      }]
    };

    vi.spyOn(openai, 'chat').mockResolvedValue(mockResponse);

    const response = await chatService.processMessage(
      'What electrical standards apply to commercial installations in NSW?'
    );

    expect(response).toContain('AS/NZS 3000:2018');
  });
});
```

### Gmail API Testing
```typescript
describe('Gmail API Integration', () => {
  it('should fetch recent emails with proper authentication', async () => {
    const mockGmailResponse = {
      data: {
        messages: [
          { id: 'msg1', threadId: 'thread1' },
          { id: 'msg2', threadId: 'thread2' },
        ]
      }
    };

    vi.spyOn(gmail.users.messages, 'list').mockResolvedValue(mockGmailResponse);

    const emails = await gmailService.getRecentEmails('user@example.com');
    expect(emails).toHaveLength(2);
  });
});
```

## Performance Testing

### API Performance Benchmarks
```typescript
describe('API Performance', () => {
  it('should respond to chat messages within 2 seconds', async () => {
    const start = Date.now();
    
    await request(app)
      .post('/api/v1/chat/message')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ message: 'Quick question about permits' })
      .expect(200);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });

  it('should handle concurrent requests efficiently', async () => {
    const promises = Array(10).fill(null).map(() =>
      request(app)
        .get('/api/v1/user/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)
    );

    const start = Date.now();
    await Promise.all(promises);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(5000); // 10 requests in under 5s
  });
});
```

### Database Performance
```typescript
describe('Database Performance', () => {
  it('should execute complex queries efficiently', async () => {
    // Insert test data
    await seedTestData(1000); // 1000 test emails

    const start = Date.now();
    const results = await emailRepository.findUrgentEmails({
      limit: 50,
      userId: 'test-user',
      urgencyThreshold: 7,
    });
    const duration = Date.now() - start;

    expect(results).toHaveLength(50);
    expect(duration).toBeLessThan(500); // < 500ms for complex query
  });
});
```

## Security Testing

### Authentication & Authorization
```typescript
describe('Security Tests', () => {
  it('should prevent SQL injection attacks', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    await request(app)
      .get(`/api/v1/search?query=${encodeURIComponent(maliciousInput)}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400); // Should be rejected, not cause server error
  });

  it('should validate input sanitization', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    
    const response = await request(app)
      .post('/api/v1/chat/message')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ message: xssPayload })
      .expect(200);

    expect(response.body.reply).not.toContain('<script>');
  });

  it('should enforce rate limiting', async () => {
    const requests = Array(11).fill(null).map(() =>
      request(app)
        .post('/api/v1/chat/message')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ message: 'test' })
    );

    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});
```

## Error Handling Testing

### Graceful Error Recovery
```typescript
describe('Error Handling', () => {
  it('should handle database connection failures', async () => {
    // Simulate DB disconnection
    vi.spyOn(prisma, '$connect').mockRejectedValue(new Error('DB_CONNECTION_FAILED'));

    const response = await request(app)
      .get('/api/v1/user/profile')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(503);

    expect(response.body).toMatchObject({
      error: 'Service temporarily unavailable',
      retryAfter: expect.any(Number),
    });
  });

  it('should handle external API failures gracefully', async () => {
    vi.spyOn(openai, 'chat').mockRejectedValue(new Error('OpenAI API Error'));

    const response = await request(app)
      .post('/api/v1/chat/message')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ message: 'test question' })
      .expect(200);

    expect(response.body.reply).toContain('temporarily unable');
  });
});
```

## Test Data & Fixtures

### Australian Trade Business Data
```typescript
const tradeBusinessFixtures = {
  electrical_contractor: {
    businessName: 'Sparks Electrical',
    abn: '12 345 678 901',
    licenses: ['NSW-EL-12345'],
    regulations: ['AS/NZS 3000:2018', 'AS/NZS 3018:2007'],
  },
  plumbing_contractor: {
    businessName: 'Flow Master Plumbing', 
    abn: '23 456 789 012',
    licenses: ['NSW-PL-67890'],
    regulations: ['AS/NZS 3500:2018'],
  },
};

const mockEmails = {
  urgent_safety: {
    subject: 'URGENT: WorkSafe NSW Compliance Notice',
    body: 'Your electrical installation requires immediate inspection...',
    sender: 'noreply@safework.nsw.gov.au',
    urgencyScore: 9,
  },
  routine_quote: {
    subject: 'Re: Quote Request - Kitchen Renovation',
    body: 'Thanks for your interest. When would be convenient...',
    sender: 'homeowner@gmail.com',
    urgencyScore: 3,
  },
};
```

## Environment Setup

### Test Database Configuration
```typescript
// test/setup.ts
import { PrismaClient } from '@prisma/client';

const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'sqlite::memory:',
    },
  },
});

export const setupTestDB = async () => {
  await testPrisma.$executeRaw`PRAGMA foreign_keys = ON`;
  // Run migrations
  // Seed test data
};

export const cleanupTestDB = async () => {
  await testPrisma.$transaction([
    testPrisma.email.deleteMany(),
    testPrisma.notification.deleteMany(),
    testPrisma.user.deleteMany(),
  ]);
};
```

### Mock External Services
```typescript
// test/mocks/external-services.ts
export const mockOpenAI = {
  chat: {
    completions: {
      create: vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'Mock AI response' } }]
      })
    }
  }
};

export const mockGmailAPI = {
  users: {
    messages: {
      list: vi.fn(),
      get: vi.fn(),
    }
  }
};
```

## CI/CD Integration

### Test Pipeline
1. **Database Setup**: Create test database and run migrations
2. **Unit Tests**: Service layer and utility functions
3. **Integration Tests**: API endpoints and database operations
4. **Performance Tests**: Response time and throughput validation
5. **Security Tests**: Authentication and input validation
6. **Coverage Report**: Validate 80% minimum coverage

### Environment Variables
```bash
# Test environment configuration
TEST_DATABASE_URL="sqlite:./test.db"
OPENAI_API_KEY="test-key"
GMAIL_CLIENT_ID="test-client-id"
KINDE_DOMAIN="test.kinde.com"
NODE_ENV="test"
LOG_LEVEL="error"
```

## Monitoring & Maintenance

### Health Checks
```typescript
describe('Health Monitoring', () => {
  it('should report healthy status with all services up', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'healthy',
      database: 'connected',
      external_apis: 'operational',
      uptime: expect.any(Number),
    });
  });
});
```

### Regular Maintenance Tasks
- **Daily**: Monitor test execution times and flaky tests
- **Weekly**: Review error rates and performance metrics
- **Monthly**: Update test data and mock services
- **Quarterly**: Security audit and dependency updates

---

*Last Updated: {{ current_date }}*
*Framework: Node.js/Express with Vitest*
*Target Coverage: 80% minimum*