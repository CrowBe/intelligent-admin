# API Documentation

## API Design Principles

### RESTful Design
- Resource-based URLs
- HTTP methods for operations (GET, POST, PUT, DELETE)
- Consistent response formats
- Proper HTTP status codes
- Stateless design

### API Versioning
- Version in URL: `/api/v1/`
- Backward compatibility maintained
- Deprecation notices for old versions

### Authentication
- JWT Bearer tokens in Authorization header
- OAuth 2.0 for external integrations
- Refresh token mechanism

## Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.yourdomain.com/api/v1
```

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "businessName": "ABC Trade Co",
  "businessType": "plumbing",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "businessName": "ABC Trade Co",
      "businessType": "plumbing",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token",
      "expiresIn": 86400
    }
  }
}
```

### POST /auth/login
Authenticate user credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "businessName": "ABC Trade Co",
      "businessType": "plumbing"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token",
      "expiresIn": 86400
    }
  }
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token",
    "expiresIn": 86400
  }
}
```

### POST /auth/logout
Logout user and invalidate tokens.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Chat Endpoints

### GET /chat/sessions
Get user's chat sessions.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Query Parameters:**
- `limit` (optional): Number of sessions to return (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-uuid",
        "title": "Gmail Integration Setup",
        "lastMessage": "Integration completed successfully",
        "lastActivity": "2024-01-15T10:30:00Z",
        "messageCount": 15
      }
    ],
    "pagination": {
      "total": 50,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### POST /chat/sessions
Create a new chat session.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Request Body:**
```json
{
  "title": "New Conversation",
  "context": {
    "businessType": "plumbing",
    "currentTask": "email_management"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-uuid",
      "title": "New Conversation",
      "createdAt": "2024-01-15T10:30:00Z",
      "context": {
        "businessType": "plumbing",
        "currentTask": "email_management"
      }
    }
  }
}
```

### GET /chat/sessions/:sessionId/messages
Get messages for a specific session.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message-uuid",
        "sessionId": "session-uuid",
        "role": "user",
        "content": "Help me send an email to my client",
        "timestamp": "2024-01-15T10:30:00Z",
        "metadata": {}
      },
      {
        "id": "message-uuid-2",
        "sessionId": "session-uuid",
        "role": "assistant",
        "content": "I can help you send an email. Do you have Gmail connected?",
        "timestamp": "2024-01-15T10:30:15Z",
        "metadata": {
          "suggestions": ["Connect Gmail", "Write email"]
        }
      }
    ]
  }
}
```

### POST /chat/sessions/:sessionId/messages
Send a message in a chat session.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Request Body:**
```json
{
  "content": "Help me send an email to my client",
  "metadata": {
    "attachments": [],
    "context": {}
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "message-uuid",
      "sessionId": "session-uuid",
      "role": "user",
      "content": "Help me send an email to my client",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }
}
```

## Integration Endpoints

### GET /integrations
Get user's connected integrations.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "integrations": [
      {
        "id": "integration-uuid",
        "provider": "gmail",
        "status": "connected",
        "connectedAt": "2024-01-15T10:30:00Z",
        "lastSync": "2024-01-15T11:00:00Z",
        "capabilities": ["send_email", "read_email", "manage_labels"],
        "metadata": {
          "email": "user@gmail.com",
          "displayName": "John Doe"
        }
      }
    ]
  }
}
```

### POST /integrations/:provider/connect
Initiate OAuth connection for an integration.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Path Parameters:**
- `provider`: Integration provider (gmail, calendar, hubspot)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/oauth/authorize?...",
    "state": "random-state-token"
  }
}
```

### POST /integrations/:provider/callback
Handle OAuth callback and complete integration.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Request Body:**
```json
{
  "code": "oauth-authorization-code",
  "state": "random-state-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "integration": {
      "id": "integration-uuid",
      "provider": "gmail",
      "status": "connected",
      "connectedAt": "2024-01-15T10:30:00Z",
      "capabilities": ["send_email", "read_email", "manage_labels"]
    }
  }
}
```

### DELETE /integrations/:integrationId
Disconnect an integration.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response (200):**
```json
{
  "success": true,
  "message": "Integration disconnected successfully"
}
```

## User Management Endpoints

### GET /users/profile
Get current user's profile.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "businessName": "ABC Trade Co",
      "businessType": "plumbing",
      "preferences": {
        "timezone": "Australia/Sydney",
        "notifications": {
          "email": true,
          "push": false
        }
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### PUT /users/profile
Update user profile.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "businessName": "ABC Trade Co",
  "businessType": "plumbing",
  "preferences": {
    "timezone": "Australia/Sydney",
    "notifications": {
      "email": true,
      "push": false
    }
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "businessName": "ABC Trade Co",
      "businessType": "plumbing",
      "preferences": {
        "timezone": "Australia/Sydney",
        "notifications": {
          "email": true,
          "push": false
        }
      },
      "updatedAt": "2024-01-15T10:35:00Z"
    }
  }
}
```

## Document Processing Endpoints

### POST /documents/upload
Upload and process a document.

**Headers:**
```
Authorization: Bearer jwt-token
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
file: [File object]
metadata: {
  "title": "Trade Regulations 2024",
  "category": "regulations",
  "tags": ["plumbing", "regulations", "2024"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": "document-uuid",
      "filename": "trade-regulations-2024.pdf",
      "title": "Trade Regulations 2024",
      "category": "regulations",
      "tags": ["plumbing", "regulations", "2024"],
      "size": 2048576,
      "status": "processing",
      "uploadedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### GET /documents
Get user's documents.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Query Parameters:**
- `category` (optional): Filter by category
- `tags` (optional): Filter by tags (comma-separated)
- `limit` (optional): Number of documents to return
- `offset` (optional): Pagination offset

**Response (200):**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "document-uuid",
        "filename": "trade-regulations-2024.pdf",
        "title": "Trade Regulations 2024",
        "category": "regulations",
        "tags": ["plumbing", "regulations", "2024"],
        "size": 2048576,
        "status": "processed",
        "uploadedAt": "2024-01-15T10:30:00Z",
        "extractedData": {
          "keyTerms": ["regulations", "compliance", "standards"],
          "summary": "Updated trade regulations for 2024..."
        }
      }
    ]
  }
}
```

### GET /documents/:documentId
Get document details and content.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": "document-uuid",
      "filename": "trade-regulations-2024.pdf",
      "title": "Trade Regulations 2024",
      "category": "regulations",
      "content": "Extracted text content...",
      "extractedData": {
        "keyTerms": ["regulations", "compliance", "standards"],
        "summary": "Updated trade regulations for 2024...",
        "entities": [
          {
            "type": "date",
            "value": "2024-01-01",
            "confidence": 0.95
          }
        ]
      },
      "status": "processed",
      "uploadedAt": "2024-01-15T10:30:00Z",
      "processedAt": "2024-01-15T10:31:00Z"
    }
  }
}
```

## WebSocket Events

### Connection
```javascript
// Client connects to WebSocket
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'jwt-token'
  }
});
```

### Chat Events
```javascript
// Send message
socket.emit('chat:message', {
  sessionId: 'session-uuid',
  content: 'Hello, I need help with email',
  metadata: {}
});

// Receive message
socket.on('chat:message', (data) => {
  // {
  //   id: 'message-uuid',
  //   sessionId: 'session-uuid',
  //   role: 'assistant',
  //   content: 'How can I help you with email?',
  //   timestamp: '2024-01-15T10:30:00Z'
  // }
});

// Typing indicator
socket.emit('chat:typing', {
  sessionId: 'session-uuid',
  isTyping: true
});

socket.on('chat:typing', (data) => {
  // { sessionId: 'session-uuid', isTyping: true, userId: 'user-uuid' }
});
```

### System Events
```javascript
// Integration status updates
socket.on('integration:status', (data) => {
  // {
  //   integrationId: 'integration-uuid',
  //   status: 'connected',
  //   provider: 'gmail'
  // }
});

// System notifications
socket.on('system:notification', (data) => {
  // {
  //   type: 'success',
  //   message: 'Gmail integration completed',
  //   timestamp: '2024-01-15T10:30:00Z'
  // }
});
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMIT | 429 | Too many requests |
| INTEGRATION_ERROR | 422 | External integration error |
| SERVER_ERROR | 500 | Internal server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| /auth/login | 5 requests | 15 minutes |
| /auth/register | 3 requests | 1 hour |
| /chat/* | 100 requests | 1 minute |
| /integrations/* | 20 requests | 1 minute |
| /documents/upload | 10 requests | 1 hour |
| Default | 1000 requests | 1 hour |

This API documentation provides a comprehensive guide for integrating with the AI-powered administrative assistant application.