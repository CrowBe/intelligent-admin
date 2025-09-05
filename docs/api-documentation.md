# API Documentation

## Overview
This document describes the REST API for the AI-powered Administrative Assistant application. The API provides endpoints for email analysis, industry intelligence, notifications, user onboarding, and administrative functions.

## Base Configuration

### Base URLs
```
Development: http://localhost:3001/api/v1
Production: https://api.yourdomain.com/api/v1
Health Check: http://localhost:3001/health
```

### Authentication
The API uses JWT Bearer token authentication:

**Request Header:**
```
Authorization: Bearer <jwt-token>
```

**Authentication Flow:**
1. Obtain JWT token from Kinde authentication service
2. Include token in Authorization header for protected endpoints
3. Token contains user ID and email for request context

### Response Format

**Success Response:**
```typescript
{
  success: true,
  data: {
    // Response data varies by endpoint
  }
}
```

**Error Response:**
```typescript
{
  error: string,
  message?: string,
  details?: string | object[]
}
```

### Rate Limiting
- **API Routes:** 100 requests per 15-minute window
- **Auth Routes:** 5 login attempts per 15 minutes, 3 registrations per hour
- **File Upload:** 10 requests per hour
- Rate limit headers included in responses

## Email Intelligence API

### POST /api/v1/emails/analyze
Analyze individual emails or batch of emails for urgency and priority.

**Authentication:** Required  
**Content-Type:** application/json

**Single Email Request:**
```typescript
{
  emailId: string;
  subject: string;
  from: string;
  snippet: string;
  bodyPreview?: string;
  receivedAt: string; // ISO date string
}
```

**Batch Email Request:**
```typescript
{
  emails: Array<{
    id: string;
    subject: string;
    from: string;
    snippet: string;
    date: string; // ISO date string
    isRead?: boolean;
  }>;
  preferences?: any;
}
```

**Response:**
```typescript
// Single email
{
  analysis: {
    priority: 'urgent' | 'high' | 'normal' | 'low';
    category: 'urgent' | 'standard' | 'follow-up' | 'admin' | 'spam';
    actionRequired: boolean;
    confidence: number;
    reasoning: string;
    suggestedActions: string[];
  }
}

// Batch emails
{
  success: true,
  data: {
    totalEmails: number;
    analyzedEmails: Array<{
      // Original email data plus analysis
      analysis: EmailAnalysis;
    }>;
    summary: {
      urgentCount: number;
      highPriorityCount: number;
      actionRequiredCount: number;
      categoryCounts: Record<string, number>;
    };
  }
}
```

### POST /api/v1/emails/analyze-batch
Legacy endpoint for batch email analysis.

**Authentication:** Required

**Request:**
```typescript
{
  emails: Array<{
    emailId: string;
    subject: string;
    from: string;
    snippet: string;
    bodyPreview?: string;
    receivedAt: string;
  }>
}
```

**Response:**
```typescript
{
  analyses: EmailAnalysis[]
}
```

### GET /api/v1/emails/analyses/:userId
Get recent email analyses for a user.

**Authentication:** Required + User Ownership Validation  
**Parameters:**
- `userId` (path): User ID
- `limit` (query): Number of analyses to return (default: 50)

**Response:**
```typescript
{
  analyses: Array<{
    id: string;
    emailId: string;
    userId: string;
    priority: string;
    category: string;
    actionRequired: boolean;
    confidence: number;
    reasoning: string;
    suggestedActions: string[];
    analyzedAt: string;
  }>
}
```

### GET /api/v1/emails/analysis/:emailId
Get analysis for a specific email by email ID.

**Authentication:** None  
**Parameters:**
- `emailId` (path): Email identifier

**Response:**
```typescript
{
  analysis: EmailAnalysis | null
}
```

**Status Codes:**
- `200`: Analysis found
- `404`: Analysis not found

### GET /api/v1/emails/urgent/:userId
Get urgent emails for a user.

**Authentication:** Required + User Ownership Validation  
**Parameters:**
- `userId` (path): User ID

**Response:**
```typescript
{
  urgentEmails: EmailAnalysis[] // Up to 20 most recent urgent emails
}
```

### GET /api/v1/emails/stats/:userId
Get email analysis statistics for a user.

**Authentication:** Required + User Ownership Validation  
**Parameters:**
- `userId` (path): User ID

**Response:**
```typescript
{
  stats: {
    total: number;
    urgent: number;
    actionRequired: number;
    categories: Array<{
      category: string;
      count: number;
    }>;
  }
}
```

## Industry Intelligence API

### GET /api/v1/industry/stats
Get industry knowledge statistics.

**Authentication:** None

**Response:**
```typescript
{
  totalItems: number;
  categories: Record<string, number>;
  sources: Record<string, number>;
  lastUpdated: string;
}
```

### GET /api/v1/industry/categories
Get available industry categories.

**Authentication:** None

**Response:**
```typescript
{
  categories: string[];
  timestamp: string;
}
```

### GET /api/v1/industry/sources
Get industry information sources.

**Authentication:** None

**Response:**
```typescript
{
  sources: string[];
  timestamp: string;
}
```

### GET /api/v1/industry/search
Search industry knowledge base.

**Authentication:** None  
**Query Parameters:**
- `q`: Search query string
- `limit`: Number of results (default: 10)

**Response:**
```typescript
{
  results: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    source: string;
    relevanceScore: number;
    updatedAt: string;
  }>;
  totalResults: number;
  query: string;
}
```

### POST /api/v1/industry/update
Trigger knowledge base update (admin function).

**Authentication:** None

**Response:**
```typescript
{
  success: boolean;
  itemsUpdated: number;
  timestamp: string;
}
```

## Notifications API

### GET /api/v1/notifications/preferences/:userId
Get user's notification preferences.

**Authentication:** None  
**Parameters:**
- `userId` (path): User ID

**Response:**
```typescript
{
  preferences: {
    id: string;
    userId: string;
    type: 'MORNING_BRIEF' | 'URGENT_EMAIL' | 'WEEKLY_SUMMARY' | 'CUSTOM';
    enabled: boolean;
    timing?: {
      startHour: number;
      startMinute: number;
      endHour: number;
      endMinute: number;
      timezone: string;
      daysOfWeek: number[];
    };
    channels?: {
      push: boolean;
      email: boolean;
      sms: boolean;
    };
  }
}
```

### POST /api/v1/notifications/preferences
Update notification preferences.

**Authentication:** None

**Request:**
```typescript
{
  userId: string;
  type: 'MORNING_BRIEF' | 'URGENT_EMAIL' | 'WEEKLY_SUMMARY' | 'CUSTOM';
  enabled: boolean;
  timing?: {
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
    timezone: string;
    daysOfWeek: number[]; // 0=Sunday, 6=Saturday
  };
  channels?: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}
```

**Response:**
```typescript
{
  preference: NotificationPreference
}
```

### POST /api/v1/notifications/token
Save FCM token for push notifications.

**Authentication:** None

**Request:**
```typescript
{
  userId: string;
  token: string;
  platform?: string; // default: 'web'
}
```

**Response:**
```typescript
{
  success: true;
  token: {
    id: string;
    userId: string;
    token: string;
    platform: string;
    createdAt: string;
  }
}
```

### POST /api/v1/notifications/morning-brief/:userId
Generate morning brief for user.

**Authentication:** None  
**Parameters:**
- `userId` (path): User ID

**Response:**
```typescript
{
  brief: {
    id: string;
    userId: string;
    content: string;
    urgentEmails: number;
    actionItems: string[];
    generatedAt: string;
  }
}
```

### POST /api/v1/notifications/test
Send test notification.

**Authentication:** None

**Request:**
```typescript
{
  userId: string;
  title: string;
  body: string;
  type?: string; // default: 'CUSTOM'
}
```

**Response:**
```typescript
{
  success: true;
  notification: {
    id: string;
    title: string;
    body: string;
    sentAt: string;
  }
}
```

### GET /api/v1/notifications/history/:userId
Get notification history.

**Authentication:** None  
**Parameters:**
- `userId` (path): User ID
- `limit` (query): Number of notifications (default: 50)

**Response:**
```typescript
{
  history: Array<{
    id: string;
    userId: string;
    title: string;
    body: string;
    type: string;
    sentAt: string;
    readAt?: string;
  }>
}
```

### POST /api/v1/notifications/read/:notificationId
Mark notification as read.

**Authentication:** None  
**Parameters:**
- `notificationId` (path): Notification ID

**Response:**
```typescript
{
  success: true;
  notification: {
    id: string;
    readAt: string;
  }
}
```

## User Onboarding API

### GET /api/v1/onboarding/progress/:userId
Get user's onboarding progress.

**Authentication:** None  
**Parameters:**
- `userId` (path): User ID

**Response:**
```typescript
{
  progress: {
    userId: string;
    currentStep: 'WELCOME' | 'BUSINESS_PROFILE' | 'INTEGRATIONS' | 'NOTIFICATIONS' | 'COMPLETED';
    completedSteps: string[];
    skippedSteps: string[];
    completionPercentage: number;
    lastActivity: string;
  }
}
```

### POST /api/v1/onboarding/complete-step
Mark an onboarding step as completed.

**Authentication:** None

**Request:**
```typescript
{
  userId: string;
  step: 'WELCOME' | 'BUSINESS_PROFILE' | 'INTEGRATIONS' | 'NOTIFICATIONS';
  data?: any; // Step-specific data
}
```

**Response:**
```typescript
{
  success: true;
  progress: OnboardingProgress;
}
```

### POST /api/v1/onboarding/skip-step
Skip an onboarding step.

**Authentication:** None

**Request:**
```typescript
{
  userId: string;
  step: string;
}
```

**Response:**
```typescript
{
  success: true;
  progress: OnboardingProgress;
}
```

### POST /api/v1/onboarding/business-profile
Save business profile information.

**Authentication:** None

**Request:**
```typescript
{
  userId: string;
  businessName: string;
  businessType: 'PLUMBING' | 'ELECTRICAL' | 'HVAC' | 'CARPENTRY' | 'PAINTING' | 'LANDSCAPING' | 'ROOFING' | 'GENERAL_CONTRACTOR' | 'OTHER';
  employeeCount: number;
  servicesOffered: string[];
  primaryLocation: string;
  yearsInBusiness: number;
  averageJobValue?: number;
  communicationPreferences?: {
    preferredTone: 'formal' | 'casual' | 'friendly';
    responseTime: 'immediate' | 'same_day' | 'next_day';
    followUpFrequency: 'aggressive' | 'moderate' | 'minimal';
  };
}
```

**Response:**
```typescript
{
  success: true;
  profile: BusinessProfile;
}
```

### GET /api/v1/onboarding/business-profile/:userId
Get business profile for user.

**Authentication:** None  
**Parameters:**
- `userId` (path): User ID

**Response:**
```typescript
{
  profile: BusinessProfile | null
}
```

### GET /api/v1/onboarding/tips/:step
Get tips for onboarding step.

**Authentication:** None  
**Parameters:**
- `step` (path): Onboarding step name

**Response:**
```typescript
{
  tips: string[]
}
```

### GET /api/v1/onboarding/security/:step
Get security information for onboarding step.

**Authentication:** None  
**Parameters:**
- `step` (path): Onboarding step name

**Response:**
```typescript
{
  info: {
    title: string;
    description: string;
    securityMeasures: string[];
  }
}
```

### POST /api/v1/onboarding/reset/:userId
Reset user's onboarding progress (testing only).

**Authentication:** None  
**Parameters:**
- `userId` (path): User ID

**Response:**
```typescript
{
  success: true;
  message: string;
  resetSteps: string[];
}
```

### GET /api/v1/onboarding/stats
Get onboarding statistics.

**Authentication:** None

**Response:**
```typescript
{
  stats: {
    totalUsers: number;
    completedUsers: number;
    averageCompletionTime: number;
    stepCompletionRates: Record<string, number>;
  }
}
```

## Administrative API

### GET /api/v1/admin/files/stats
Get file upload statistics.

**Authentication:** Required + Admin Role  
**Admin Check:** Currently allows any authenticated user (development mode)

**Response:**
```typescript
{
  success: true;
  data: {
    totalFiles: number;
    totalSizeBytes: number;
    oldestFileAge: number; // milliseconds
    tempFiles: number;
    formattedSize: string; // e.g., "15.2 MB"
    formattedOldestAge: string; // e.g., "2d 5h"
    maxFileSize: number;
    allowedExtensions: string[];
    formattedMaxFileSize: string;
  }
}
```

### POST /api/v1/admin/files/cleanup
Clean up old files from upload directories.

**Authentication:** Required + Admin Role

**Request:**
```typescript
{
  maxAgeHours?: number; // 1-168 hours, default: 24
  cleanupType?: 'old' | 'temp' | 'all'; // default: 'old'
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    cleanedCount: number;
    operation: string;
    timestamp: string;
  }
}
```

### DELETE /api/v1/admin/files/emergency-cleanup
Emergency cleanup of all files (removes all files regardless of age).

**Authentication:** Required + Admin Role

**Response:**
```typescript
{
  success: true;
  data: {
    totalCleaned: number;
    oldFilesCount: number;
    tempFilesCount: number;
    operation: 'emergency cleanup';
    timestamp: string;
  }
}
```

### GET /api/v1/admin/system/health
Get detailed system health status including file system.

**Authentication:** Required + Admin Role

**Response:**
```typescript
{
  success: true;
  data: {
    timestamp: string;
    fileSystem: {
      status: 'healthy' | 'unhealthy';
      stats: {
        totalFiles: number;
        totalSizeBytes: number;
        oldestFileAge: number;
        tempFiles: number;
        error?: string;
      };
      formattedSize?: string;
      formattedOldestAge?: string;
    }
  }
}
```

## System Health Check

### GET /health
Public health check endpoint for monitoring and load balancers.

**Authentication:** None

**Response:**
```typescript
{
  status: 'ok' | 'degraded';
  timestamp: string;
  services: {
    database: {
      status: 'connected' | 'error';
      responseTime: number; // milliseconds
      error?: string;
    };
    scheduler: {
      running: boolean;
      jobCount: number;
      lastActivity?: string;
    };
    fileSystem: {
      status: 'healthy' | 'degraded';
      stats: {
        totalFiles: number;
        tempFiles: number;
        totalSizeMB: number;
        oldestFileAgeHours: number;
      } | null;
      error?: string;
    }
  }
}
```

**Status Codes:**
- `200`: All services healthy
- `503`: One or more services degraded/down

## File Upload Configuration

**Maximum File Size:** 10MB  
**Allowed Extensions:**
- Documents: `.pdf`, `.doc`, `.docx`, `.txt`, `.rtf`, `.odt`
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`
- Spreadsheets: `.xls`, `.xlsx`, `.csv`, `.ods`
- Presentations: `.ppt`, `.pptx`, `.odp`
- Archives: `.zip`, `.rar`, `.7z`

**Upload Directories:**
- Temporary: `backend/uploads/temp/`
- Processed: `backend/uploads/processed/`
- Permissions: `700` (owner read/write/execute only)

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Request validation failed (Zod errors) |
| 401 | UNAUTHORIZED | Missing or invalid JWT token |
| 403 | FORBIDDEN | User lacks permission for resource |
| 404 | NOT_FOUND | Resource not found |
| 429 | RATE_LIMIT | Rate limit exceeded |
| 500 | SERVER_ERROR | Internal server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

## Environment Configuration

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Security  
JWT_SECRET=your-secret-key-minimum-32-chars
CORS_ORIGIN=http://localhost:3000

# AI Services
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4-turbo-preview
```

### Optional Variables
```bash
# Gmail Integration
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REDIRECT_URI=your-redirect-uri

# Redis Caching
REDIS_URL=redis://localhost:6379

# Feature Flags
ENABLE_MORNING_BRIEF=true
ENABLE_EMAIL_ANALYSIS=true
ENABLE_INDUSTRY_INTELLIGENCE=true

# Timeouts (milliseconds)
DATABASE_CONNECTION_TIMEOUT=10000
DATABASE_QUERY_TIMEOUT=30000
HTTP_REQUEST_TIMEOUT=30000
OPENAI_TIMEOUT=60000
SERVER_TIMEOUT=120000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info  # error, warn, info, debug, verbose
```

## Development and Testing

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Run with coverage
npm run test:coverage

# Test specific file
npm test -- emails.test.ts
```

### API Testing
```bash
# Health check
curl http://localhost:3001/health

# Test email analysis (requires auth token)
curl -X POST http://localhost:3001/api/v1/emails/analyze \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"emailId":"test","subject":"Test","from":"test@example.com","snippet":"Test email","receivedAt":"2024-01-01T00:00:00Z"}'
```

### Authentication Token Generation
Tokens are generated through the Kinde authentication service integration. For development/testing, you can:

1. Use the frontend login flow to obtain tokens
2. Generate tokens manually using the JWT_SECRET (development only)
3. Use test endpoints if available in development mode

## Security Considerations

1. **JWT Tokens:** Use strong secrets (32+ characters) in production
2. **CORS:** Configure specific origins, not wildcards in production
3. **Rate Limiting:** Configured per endpoint type
4. **File Uploads:** Size and extension restrictions enforced
5. **User Ownership:** Validated for user-specific endpoints
6. **Error Handling:** Sanitized error messages in production
7. **Timeout Configuration:** All external services have timeout limits

This API documentation reflects the current backend implementation and provides comprehensive guidance for integration and development.