/**
 * Type Definition Tests and Type Safety Validation
 * Ensures all shared types work correctly across frontend and backend
 */

import { describe, it, expect } from 'vitest';
import type {
  // User and Authentication Types
  User,
  AuthTokens,
  
  // Email Intelligence Types
  EmailAnalysis,
  EmailMessage,
  MorningDigest,
  
  // Chat and AI Types
  ChatMessage,
  ChatConversation,
  
  // Business Context Types
  BusinessContext,
  
  // Industry Knowledge Types
  IndustryStandard,
  
  // Integration Types
  Integration,
  
  // API Response Types
  ApiResponse,
  PaginatedResponse,
  
  // File Upload Types
  UploadedFile,
  
  // Notification Types
  Notification,
  
  // Error Types
  AppError,
  
  // Utility Types
  Status,
  Priority,
  
  // Environment Types
  EnvironmentConfig,
} from './index.js';

// Type validation helper functions
const isValidUser = (user: unknown): user is User => {
  return (
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    (user.name === undefined || typeof user.name === 'string') &&
    (user.avatar === undefined || typeof user.avatar === 'string') &&
    user.createdAt instanceof Date &&
    user.updatedAt instanceof Date
  );
};

const isValidAuthTokens = (tokens: unknown): tokens is AuthTokens => {
  return (
    typeof tokens.accessToken === 'string' &&
    typeof tokens.refreshToken === 'string' &&
    typeof tokens.expiresIn === 'number'
  );
};

describe('User and Authentication Types', () => {
  describe('User Type', () => {
    it('should validate required User properties', () => {
      const validUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(isValidUser(validUser)).toBe(true);
      expect(validUser.id).toBe('user-123');
      expect(validUser.email).toBe('test@example.com');
    });

    it('should validate optional User properties', () => {
      const userWithOptionals: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(isValidUser(userWithOptionals)).toBe(true);
      expect(userWithOptionals.name).toBe('Test User');
      expect(userWithOptionals.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('should reject invalid User objects', () => {
      const invalidUsers = [
        { id: 123, email: 'test@example.com' }, // id should be string
        { id: 'user-123', email: 123 }, // email should be string
        { id: 'user-123' }, // missing required fields
      ];

      invalidUsers.forEach(user => {
        expect(isValidUser(user)).toBe(false);
      });
    });
  });

  describe('AuthTokens Type', () => {
    it('should validate AuthTokens structure', () => {
      const validTokens: AuthTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600,
      };

      expect(isValidAuthTokens(validTokens)).toBe(true);
      expect(typeof validTokens.expiresIn).toBe('number');
    });
  });
});

describe('Email Intelligence Types', () => {
  describe('EmailAnalysis Type', () => {
    it('should validate EmailAnalysis structure', () => {
      const analysis: EmailAnalysis = {
        urgencyScore: 8.5,
        category: 'urgent',
        businessRelevance: 9.2,
        sentiment: 'positive',
        actionRequired: true,
        suggestedActions: ['respond_quickly', 'schedule_meeting'],
        reasoning: 'High urgency due to deadline mentioned',
      };

      expect(analysis.urgencyScore).toBeGreaterThan(0);
      expect(['urgent', 'standard', 'follow_up', 'admin', 'spam']).toContain(analysis.category);
      expect(['positive', 'neutral', 'negative']).toContain(analysis.sentiment);
      expect(Array.isArray(analysis.suggestedActions)).toBe(true);
    });

    it('should enforce category constraints', () => {
      // TypeScript compilation should catch invalid categories
      const validCategories: EmailAnalysis['category'][] = [
        'urgent',
        'standard',
        'follow_up',
        'admin',
        'spam'
      ];

      validCategories.forEach(category => {
        const analysis: EmailAnalysis = {
          urgencyScore: 5,
          category,
          businessRelevance: 5,
          sentiment: 'neutral',
          actionRequired: false,
          suggestedActions: [],
          reasoning: 'Test',
        };
        
        expect(analysis.category).toBe(category);
      });
    });
  });

  describe('EmailMessage Type', () => {
    it('should validate EmailMessage structure', () => {
      const message: EmailMessage = {
        id: 'msg-123',
        threadId: 'thread-456',
        subject: 'Important Business Matter',
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        cc: ['cc@example.com'],
        bcc: ['bcc@example.com'],
        body: 'Message content',
        snippet: 'Message preview',
        date: new Date(),
        isRead: false,
        isImportant: true,
        labels: ['INBOX', 'IMPORTANT'],
        analysis: {
          urgencyScore: 7,
          category: 'urgent',
          businessRelevance: 8,
          sentiment: 'positive',
          actionRequired: true,
          suggestedActions: ['respond'],
          reasoning: 'High priority client',
        },
      };

      expect(message.id).toBe('msg-123');
      expect(Array.isArray(message.to)).toBe(true);
      expect(message.analysis?.category).toBe('urgent');
    });

    it('should handle optional properties', () => {
      const minimalMessage: EmailMessage = {
        id: 'msg-123',
        subject: 'Test',
        from: 'test@example.com',
        to: ['recipient@example.com'],
        body: 'Content',
        snippet: 'Preview',
        date: new Date(),
        isRead: false,
        isImportant: false,
        labels: [],
      };

      expect(minimalMessage.threadId).toBeUndefined();
      expect(minimalMessage.cc).toBeUndefined();
      expect(minimalMessage.analysis).toBeUndefined();
    });
  });

  describe('MorningDigest Type', () => {
    it('should validate MorningDigest structure', () => {
      const digest: MorningDigest = {
        id: 'digest-123',
        userId: 'user-456',
        date: new Date(),
        summary: 'Your morning digest summary',
        urgentEmails: 3,
        totalEmails: 15,
        keyActions: ['Respond to client A', 'Review proposal B'],
        createdAt: new Date(),
      };

      expect(digest.urgentEmails).toBeGreaterThanOrEqual(0);
      expect(digest.totalEmails).toBeGreaterThanOrEqual(digest.urgentEmails);
      expect(Array.isArray(digest.keyActions)).toBe(true);
    });
  });
});

describe('Chat and AI Types', () => {
  describe('ChatMessage Type', () => {
    it('should validate ChatMessage structure', () => {
      const message: ChatMessage = {
        id: 'msg-123',
        role: 'user',
        content: 'Hello, AI assistant!',
        timestamp: new Date(),
        metadata: {
          model: 'gpt-4',
          processingTime: 1500,
          tokens: 25,
        },
      };

      expect(['user', 'assistant', 'system']).toContain(message.role);
      expect(message.metadata?.processingTime).toBeGreaterThan(0);
    });

    it('should handle message without metadata', () => {
      const simpleMessage: ChatMessage = {
        id: 'msg-456',
        role: 'assistant',
        content: 'Hello! How can I help you?',
        timestamp: new Date(),
      };

      expect(simpleMessage.metadata).toBeUndefined();
    });
  });

  describe('ChatConversation Type', () => {
    it('should validate ChatConversation structure', () => {
      const conversation: ChatConversation = {
        id: 'conv-123',
        userId: 'user-456',
        title: 'Business Planning Discussion',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Help me with business planning',
            timestamp: new Date(),
          },
          {
            id: 'msg-2',
            role: 'assistant',
            content: 'I\'d be happy to help with your business planning!',
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(Array.isArray(conversation.messages)).toBe(true);
      expect(conversation.messages).toHaveLength(2);
      expect(conversation.messages[0].role).toBe('user');
    });
  });
});

describe('Business Context Types', () => {
  describe('BusinessContext Type', () => {
    it('should validate BusinessContext structure', () => {
      const context: BusinessContext = {
        id: 'ctx-123',
        userId: 'user-456',
        businessName: 'ABC Plumbing Services',
        businessType: 'Trade Services',
        industry: 'Plumbing',
        location: 'Sydney, NSW',
        specialties: ['Emergency Repairs', 'Bathroom Renovations', 'Gas Fitting'],
        workingHours: 'Mon-Fri 8AM-6PM, Sat 9AM-2PM',
        preferences: {
          urgencyThreshold: 7.5,
          autoRespond: true,
          digestFrequency: 'daily',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(Array.isArray(context.specialties)).toBe(true);
      expect(['daily', 'weekly']).toContain(context.preferences.digestFrequency);
      expect(context.preferences.urgencyThreshold).toBeGreaterThan(0);
      expect(typeof context.preferences.autoRespond).toBe('boolean');
    });
  });
});

describe('Industry Knowledge Types', () => {
  describe('IndustryStandard Type', () => {
    it('should validate IndustryStandard structure', () => {
      const standard: IndustryStandard = {
        id: 'std-123',
        title: 'Australian Building Codes',
        description: 'National construction standards for residential buildings',
        category: 'Building Standards',
        industry: 'Construction',
        complianceLevel: 'mandatory',
        source: 'Australian Building Codes Board',
        lastUpdated: new Date(),
      };

      expect(['mandatory', 'recommended', 'optional']).toContain(standard.complianceLevel);
      expect(standard.lastUpdated instanceof Date).toBe(true);
    });
  });
});

describe('Integration Types', () => {
  describe('Integration Type', () => {
    it('should validate Integration structure', () => {
      const integration: Integration = {
        id: 'int-123',
        userId: 'user-456',
        type: 'gmail',
        status: 'connected',
        credentials: {
          accessToken: 'access-123',
          refreshToken: 'refresh-456',
          expiresAt: new Date(Date.now() + 3600000),
        },
        settings: {
          autoSync: true,
          syncFrequency: 'hourly',
        },
        lastSyncAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(['gmail', 'calendar', 'hubspot', 'other']).toContain(integration.type);
      expect(['connected', 'disconnected', 'error']).toContain(integration.status);
      expect(typeof integration.settings).toBe('object');
    });

    it('should handle minimal Integration', () => {
      const minimalIntegration: Integration = {
        id: 'int-789',
        userId: 'user-456',
        type: 'calendar',
        status: 'disconnected',
        settings: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(minimalIntegration.credentials).toBeUndefined();
      expect(minimalIntegration.lastSyncAt).toBeUndefined();
    });
  });
});

describe('API Response Types', () => {
  describe('ApiResponse Type', () => {
    it('should validate success response', () => {
      const successResponse: ApiResponse<User> = {
        success: true,
        data: {
          id: 'user-123',
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      expect(successResponse.success).toBe(true);
      expect(successResponse.data?.id).toBe('user-123');
      expect(successResponse.error).toBeUndefined();
    });

    it('should validate error response', () => {
      const errorResponse: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input provided',
          details: { field: 'email', issue: 'invalid format' },
        },
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error?.code).toBe('VALIDATION_ERROR');
      expect(errorResponse.data).toBeUndefined();
    });
  });

  describe('PaginatedResponse Type', () => {
    it('should validate paginated response structure', () => {
      const paginatedResponse: PaginatedResponse<User> = {
        success: true,
        data: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'user-2',
            email: 'user2@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 50,
          totalPages: 5,
        },
      };

      expect(Array.isArray(paginatedResponse.data)).toBe(true);
      expect(paginatedResponse.meta.totalPages).toBe(Math.ceil(paginatedResponse.meta.total / paginatedResponse.meta.limit));
    });
  });
});

describe('File and Notification Types', () => {
  describe('UploadedFile Type', () => {
    it('should validate UploadedFile structure', () => {
      const file: UploadedFile = {
        id: 'file-123',
        originalName: 'document.pdf',
        fileName: 'file-123-document.pdf',
        mimeType: 'application/pdf',
        size: 1048576,
        path: '/uploads/documents/file-123-document.pdf',
        uploadedAt: new Date(),
      };

      expect(file.size).toBeGreaterThan(0);
      expect(file.path.includes(file.fileName)).toBe(true);
    });
  });

  describe('Notification Type', () => {
    it('should validate Notification structure', () => {
      const notification: Notification = {
        id: 'notif-123',
        userId: 'user-456',
        type: 'urgent',
        title: 'Urgent Email Received',
        message: 'You have received a high-priority email from a client',
        isRead: false,
        createdAt: new Date(),
      };

      expect(['email', 'urgent', 'system', 'integration']).toContain(notification.type);
      expect(typeof notification.isRead).toBe('boolean');
    });
  });
});

describe('Error and Utility Types', () => {
  describe('AppError Type', () => {
    it('should validate AppError structure', () => {
      const error: AppError = {
        code: 'VALIDATION_ERROR',
        message: 'The provided input is invalid',
        statusCode: 400,
        details: {
          fields: ['email', 'password'],
          validationErrors: {
            email: 'Invalid email format',
            password: 'Password too short',
          },
        },
      };

      expect(error.statusCode).toBeGreaterThan(0);
      expect(error.statusCode).toBeLessThan(600);
      expect(typeof error.code).toBe('string');
    });
  });

  describe('Utility Types', () => {
    it('should validate Status union type', () => {
      const validStatuses: Status[] = ['pending', 'processing', 'completed', 'failed'];
      
      validStatuses.forEach(status => {
        const testStatus: Status = status;
        expect(testStatus).toBe(status);
      });
    });

    it('should validate Priority union type', () => {
      const validPriorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
      
      validPriorities.forEach(priority => {
        const testPriority: Priority = priority;
        expect(testPriority).toBe(priority);
      });
    });
  });
});

describe('Environment Configuration Types', () => {
  describe('EnvironmentConfig Type', () => {
    it('should validate EnvironmentConfig structure', () => {
      const devConfig: EnvironmentConfig = {
        nodeEnv: 'development',
        port: 3000,
        apiBaseUrl: 'http://localhost:3001/api',
        frontendUrl: 'http://localhost:3000',
        databaseUrl: 'postgresql://user:pass@localhost:5432/intelligent_admin_dev',
      };

      expect(['development', 'production', 'test']).toContain(devConfig.nodeEnv);
      expect(devConfig.port).toBeGreaterThan(0);
      expect(devConfig.apiBaseUrl.startsWith('http')).toBe(true);
    });

    it('should validate production config', () => {
      const prodConfig: EnvironmentConfig = {
        nodeEnv: 'production',
        port: 8080,
        apiBaseUrl: 'https://api.example.com',
        frontendUrl: 'https://app.example.com',
        databaseUrl: 'postgresql://user:pass@db.example.com:5432/intelligent_admin',
      };

      expect(prodConfig.nodeEnv).toBe('production');
      expect(prodConfig.apiBaseUrl.startsWith('https')).toBe(true);
      expect(prodConfig.frontendUrl.startsWith('https')).toBe(true);
    });
  });
});

// Cross-type compatibility tests
describe('Cross-Type Compatibility', () => {
  it('should ensure User works with ChatConversation', () => {
    const user: User = {
      id: 'user-123',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const conversation: ChatConversation = {
      id: 'conv-456',
      userId: user.id, // Should be compatible
      title: 'Test Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(conversation.userId).toBe(user.id);
  });

  it('should ensure EmailMessage works with EmailAnalysis', () => {
    const analysis: EmailAnalysis = {
      urgencyScore: 8,
      category: 'urgent',
      businessRelevance: 9,
      sentiment: 'positive',
      actionRequired: true,
      suggestedActions: ['respond_immediately'],
      reasoning: 'Client deadline approaching',
    };

    const message: EmailMessage = {
      id: 'msg-123',
      subject: 'Urgent: Project Deadline',
      from: 'client@example.com',
      to: ['me@mycompany.com'],
      body: 'We need to discuss the project deadline...',
      snippet: 'We need to discuss...',
      date: new Date(),
      isRead: false,
      isImportant: true,
      labels: ['INBOX'],
      analysis, // Should be compatible
    };

    expect(message.analysis?.urgencyScore).toBe(8);
    expect(message.analysis?.category).toBe('urgent');
  });

  it('should ensure API responses work with all data types', () => {
    const userResponse: ApiResponse<User> = {
      success: true,
      data: {
        id: 'user-123',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const messagesResponse: PaginatedResponse<EmailMessage> = {
      success: true,
      data: [
        {
          id: 'msg-1',
          subject: 'Test',
          from: 'test@example.com',
          to: ['me@example.com'],
          body: 'Test message',
          snippet: 'Test',
          date: new Date(),
          isRead: false,
          isImportant: false,
          labels: [],
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    expect(userResponse.data?.id).toBe('user-123');
    expect(messagesResponse.data).toHaveLength(1);
    expect(messagesResponse.meta.total).toBe(1);
  });
});

// Type inference and generic tests
describe('Type Inference and Generics', () => {
  it('should infer types correctly in ApiResponse', () => {
    // Test that TypeScript correctly infers types
    const stringResponse: ApiResponse<string> = {
      success: true,
      data: 'test string',
    };

    const numberResponse: ApiResponse<number> = {
      success: true,
      data: 42,
    };

    expect(typeof stringResponse.data).toBe('string');
    expect(typeof numberResponse.data).toBe('number');
  });

  it('should work with complex nested types', () => {
    const complexResponse: ApiResponse<{
      user: User;
      conversations: ChatConversation[];
      notifications: Notification[];
    }> = {
      success: true,
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        conversations: [],
        notifications: [],
      },
    };

    expect(complexResponse.data?.user.id).toBe('user-123');
    expect(Array.isArray(complexResponse.data?.conversations)).toBe(true);
    expect(Array.isArray(complexResponse.data?.notifications)).toBe(true);
  });
});