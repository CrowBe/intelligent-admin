# System Architecture

## Overview

This document defines the system architecture for the AI-powered administrative assistant application designed for small trade businesses in Australia. The application uses a monorepo architecture with clearly separated frontend, backend, and shared packages, providing a scalable foundation for rapid development and deployment.

## Current State: Phase 2 Implementation

**Monorepo Architecture** with distinct packages and clear upgrade paths:
- **Frontend**: React 18+ with TypeScript, Tailwind CSS, co-located components
- **Backend**: Node.js/Express API with TypeScript, Prisma ORM, modular services
- **Shared**: Common TypeScript types, utilities, and configurations
- **Database**: PostgreSQL with Prisma for type-safe database operations
- **Testing**: Vitest across all packages with comprehensive test coverage

## Technology Stack

### Frontend Package (`frontend/`)
- **Framework**: React 18+ with TypeScript and strict ESLint configuration
- **Styling**: Tailwind CSS with responsive mobile-first design
- **Components**: Co-located structure compatible with shadcn-ui components
- **State Management**: React Context API for global state
- **Build Tool**: Vite for fast development and optimized production builds
- **Testing**: Vitest with React Testing Library
- **Real-time Updates**: Server-Sent Events for AI chat responses

**Component Architecture**:
```
frontend/src/components/
├── ui/                    # shadcn-ui compatible components
│   ├── button/           # Co-located: component, stories, tests
│   │   ├── index.ts      # Re-exports for clean imports
│   │   ├── Button.tsx    # Component implementation
│   │   ├── Button.stories.tsx  # Storybook visual tests
│   │   └── Button.test.tsx     # Vitest unit tests
│   └── card/            # Same co-located structure
├── chat/                # Chat interface components
├── documents/           # Document upload/management
└── layout/             # Layout and navigation
```

### Backend Package (`backend/`)
- **Runtime**: Node.js (LTS) with TypeScript
- **Framework**: Express.js with modular route structure
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: Kinde (primary) + Google OAuth for Gmail integration
- **File Processing**: Local file upload with document analysis
- **Testing**: Vitest with Supertest for API testing
- **Validation**: Comprehensive input validation and sanitization

**Service Architecture**:
```
backend/src/
├── routes/              # API route handlers
│   ├── admin.ts        # Admin operations and user management
│   ├── emails.ts       # Gmail integration and email analysis
│   └── index.ts        # Route registration
├── services/           # Business logic services
│   ├── fileUpload.ts   # Document upload and processing
│   ├── prisma.ts       # Database connection and utilities
│   └── scheduler.ts    # Background job scheduling
├── middleware/         # Express middleware
│   └── auth.ts         # Authentication and authorization
├── utils/             # Utility functions
│   └── httpClient.ts  # HTTP client for external APIs
└── config/           # Configuration management
    └── env.ts        # Environment variable validation
```

### Shared Package (`shared/`)
- **Types**: Common TypeScript interfaces and type definitions
- **Utilities**: Shared helper functions and constants
- **Configurations**: Common ESLint, TypeScript configurations
- **Testing**: Shared test utilities and mocks

### AI Integration
- **Primary AI**: OpenAI API (GPT-4/3.5-turbo) for conversational interface
- **Intent Recognition**: Built-in prompt engineering for task classification
- **Context Management**: Persistent conversation history in PostgreSQL
- **Email Analysis**: Intelligent urgency detection and content classification
- **Industry Knowledge**: Australian trade standards and regulations processing

## Architecture Overview

### High-Level System Design
```
┌─────────────────────────────────────────────────────┐
│                 Client Layer                        │
├─────────────────┬─────────────────┬─────────────────┤
│   Web Browser   │   Mobile PWA    │   Desktop App   │
│   (React SPA)   │   (React PWA)   │   (React PWA)   │
└─────────────────┴─────────────────┴─────────────────┘
                           │
                           │ HTTPS/WSS
                           ▼
┌─────────────────────────────────────────────────────┐
│                API Gateway                          │
│              (NGINX/Reverse Proxy)                  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              Backend Services                       │
├─────────────────┬─────────────────┬─────────────────┤
│   Express.js    │   File Upload   │   Email Service │
│   API Server    │   Processing    │   Integration   │
└─────────────────┴─────────────────┴─────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│               Data Layer                            │
├─────────────────┬─────────────────┬─────────────────┤
│   PostgreSQL    │   File Storage  │   External APIs │
│   (Prisma ORM)  │   (Local/Cloud) │   (Gmail/OpenAI)│
└─────────────────┴─────────────────┴─────────────────┘
```

## Data Architecture

### Database Schema (Prisma)
The application uses PostgreSQL with Prisma ORM for type-safe database operations:

```typescript
// Core user and authentication
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  profile   Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Chat conversation management
model Conversation {
  id        String    @id @default(cuid())
  userId    String
  messages  Message[]
  context   Json?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  content        String
  role           String       // user, assistant, system
  metadata       Json?
  createdAt      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id])
}

// Email analysis and intelligence
model EmailAnalysis {
  id          String   @id @default(cuid())
  userId      String
  emailId     String
  subject     String
  sender      String
  urgency     String   // high, medium, low
  category    String   // customer_inquiry, invoice, urgent, etc.
  keywords    String[]
  sentiment   String?  // positive, neutral, negative
  actionItems String[]
  analyzedAt  DateTime @default(now())
}

// Industry knowledge and document processing
model IndustryKnowledge {
  id          String   @id @default(cuid())
  title       String
  content     String
  category    String   // regulations, standards, procedures
  industry    String   // electrical, plumbing, hvac, etc.
  source      String?  // URL or document source
  relevance   Float?   // relevance score
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Data Flow Architecture

#### Chat Interaction Flow
```
User Input → Frontend Chat Component → Backend API → 
OpenAI API → Response Processing → Database Storage → 
Frontend Update → User Display
```

#### Email Analysis Flow
```
Gmail OAuth → Email Fetch → Content Analysis → 
Urgency Detection → Database Storage → 
Push Notification → User Dashboard
```

#### Document Processing Flow
```
File Upload → Format Detection → Content Extraction → 
Industry Knowledge Extraction → Database Storage → 
Chat Context Enhancement
```

## Security Architecture

### Authentication & Authorization
- **Primary Auth**: Kinde authentication service
- **OAuth Integration**: Google OAuth 2.0 for Gmail access
- **Token Management**: Secure JWT storage with refresh token rotation
- **Session Security**: HTTP-only cookies with secure flags
- **API Security**: Bearer token authentication for all API endpoints

### Security Layers
1. **Transport Security**: TLS 1.3 encryption for all communications
2. **Input Validation**: Comprehensive request validation using TypeScript types
3. **Data Protection**: Sensitive data encryption at rest
4. **Rate Limiting**: API endpoint protection against abuse
5. **CORS Configuration**: Strict cross-origin resource sharing policies
6. **Content Security**: File upload validation and scanning

## Phase 2 Features Implementation

### Email Intelligence
- **Gmail Integration**: Full OAuth flow with secure token management
- **Urgency Detection**: AI-powered email priority classification
- **Content Analysis**: Automatic extraction of action items and keywords
- **Morning Brief**: Scheduled email summaries with push notifications
- **Smart Filtering**: Industry-specific email categorization

### Industry Knowledge System
- **Document Processing**: PDF/Word document parsing and analysis
- **Regulation Tracking**: Australian trade standards and compliance requirements
- **Knowledge Base**: Searchable industry information repository
- **Context Integration**: Industry knowledge enhancement of chat responses
- **Compliance Alerts**: Notifications for regulatory changes and updates

### Mobile-Optimized Interface
- **Touch-First Design**: Optimized for field professionals on mobile devices
- **Offline Capability**: Progressive Web App features for limited connectivity
- **Quick Actions**: Swipe gestures and shortcuts for common tasks
- **Voice Integration**: Voice-to-text for hands-free operation
- **Push Notifications**: Real-time alerts for urgent emails and updates

## Development Environment

### Monorepo Structure
```
intelligent-admin/
├── frontend/           # React application
├── backend/           # Node.js API server  
├── shared/           # Common types and utilities
├── docs/            # Documentation
├── scripts/         # Development and deployment scripts
└── package.json     # Workspace configuration
```

### Development Workflow
1. **Local Development**: Docker Compose for consistent environment
2. **Code Quality**: Strict ESLint/TypeScript configuration across all packages
3. **Testing Strategy**: Comprehensive unit and integration testing
4. **Build Process**: Parallel builds across all packages
5. **Hot Reload**: Development servers with instant code updates

### Testing Strategy
- **Unit Tests**: Individual function and component testing
- **Integration Tests**: API endpoint and service integration testing
- **End-to-End Tests**: Critical user flow validation
- **Visual Testing**: Storybook for component visual regression testing
- **Coverage Requirements**: Minimum 80% code coverage across all packages

## Deployment Architecture

### Development Deployment
- **Container Strategy**: Docker Compose for local development
- **Database**: PostgreSQL container with persistent volumes
- **File Storage**: Local filesystem with development uploads directory
- **Environment**: Isolated development environment with test data

### Production Deployment
- **Platform**: Kubernetes cluster for scalability and reliability
- **Database**: Managed PostgreSQL service (AWS RDS/GCP Cloud SQL)
- **File Storage**: Cloud storage integration (AWS S3/GCP Cloud Storage)
- **Load Balancing**: NGINX ingress controller for traffic distribution
- **Monitoring**: Comprehensive logging and metrics collection
- **CI/CD**: GitHub Actions for automated testing and deployment

## Performance Considerations

### Response Time Targets
- **Chat Responses**: < 200ms for cached responses, < 2s for AI processing
- **Email Analysis**: < 5s for batch processing of new emails
- **Document Processing**: < 30s for typical business documents
- **File Uploads**: Streaming uploads with progress indication

### Scalability Features
- **Database Optimization**: Indexed queries and connection pooling
- **Caching Strategy**: Strategic caching of frequently accessed data
- **Async Processing**: Background job processing for intensive tasks
- **Resource Management**: Efficient memory usage and garbage collection

## Monitoring and Observability

### Application Monitoring
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Metrics**: Response time and throughput monitoring
- **User Analytics**: Usage patterns and feature adoption tracking
- **System Health**: Database and external service status monitoring

### Business Intelligence
- **Email Analytics**: Urgency detection accuracy and response times
- **User Engagement**: Chat interaction patterns and satisfaction metrics
- **Industry Knowledge**: Document processing effectiveness and usage
- **Integration Health**: OAuth token refresh rates and API reliability

This architecture provides a robust foundation for a scalable, secure, and maintainable AI-powered administrative assistant specifically designed for Australian trade businesses, with clear paths for future enhancement and growth.