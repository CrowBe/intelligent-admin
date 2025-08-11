# Warp AI Context - Intelligent Admin Project

## Project Overview

**Intelligent Admin** is an AI-powered administrative assistant specifically designed for Australian trade businesses (electricians, plumbers, HVAC contractors) scaling from 1-50 employees. The application provides a single AI chat interface that replaces 5-8 separate business applications, addressing the AU$56 billion annually wasted on administrative tasks.

### Core Value Proposition
- **Single AI Interface**: Replaces multiple fragmented business tools
- **Industry-Specific Intelligence**: Australian Standards, ESV regulations, trade pricing
- **Mobile-First Design**: Optimized for on-site trade professionals
- **Proactive Intelligence**: Morning Brief notifications, urgent email detection, workflow learning

## Current Development Status

### Phase 1 Completed ✅
- **Foundation**: React + TypeScript + Express.js + PostgreSQL architecture
- **Core Chat**: AI-powered conversation interface with OpenAI integration
- **Document Processing**: OCR, text extraction, proactive document requests
- **Workflow Learning**: User preference adaptation and pattern recognition
- **Testing Suite**: Comprehensive Vitest testing framework

### Phase 2 In Progress (Current Focus) 🔄
- **Email Intelligence**: Gmail OAuth, urgency detection, morning briefs
- **Push Notifications**: Firebase integration with smart timing
- **User Onboarding**: Progressive disclosure for first-time users
- **Industry Knowledge**: Australian trade regulations and pricing intelligence
- **Mobile Optimization**: Touch-first interface for trade professionals

### Critical Gaps Needing Attention ⚠️
1. **Gmail OAuth Flow** - Complete integration with security reassurance
2. **Push Notification System** - Morning Brief engagement mechanism
3. **Industry Knowledge Integration** - Australian Standards and ESV regulations
4. **Mobile-First Interface** - One-handed operation optimization
5. **User Onboarding Flow** - Progressive feature introduction

## Architecture & Tech Stack

### Frontend
```
React 18+ with TypeScript
├── Tailwind CSS for styling
├── React Context for state management (no Redux)
├── Server-Sent Events for real-time chat
├── Vite for development and building
└── Vitest for testing
```

### Backend
```
Node.js with Express.js and TypeScript
├── Prisma ORM with PostgreSQL
├── OpenAI API integration
├── OAuth 2.0 (Google, Kinde)
├── JWT authentication with refresh tokens
├── Winston logging
└── Comprehensive error handling
```

### Key Services
- **AI Service**: OpenAI integration with conversation management
- **Email Intelligence**: Gmail API with urgency detection
- **Document Processing**: OCR, text extraction, proactive requests
- **Industry Knowledge**: Web scraping for Australian trade standards
- **Notification Service**: Firebase push notifications
- **Workflow Adaptation**: User preference learning

## Project Structure

```
intelligent-admin/
├── frontend/                   # React SPA with chat interface
├── backend/                    # Express.js API server
├── shared/                     # Common types and utilities
├── docs/                       # Comprehensive documentation
├── .github/                    # CI/CD and Copilot instructions
├── .ai/                        # AI development context
└── scripts/                    # Build and deployment scripts
```

## Development Guidelines

### Code Standards
- **TypeScript**: Strict mode, proper typing, no `any`
- **React**: Functional components with hooks, Context API
- **Backend**: Async/await, proper error handling, Zod validation
- **Testing**: Unit, integration, and component tests with >80% coverage
- **Security**: JWT auth, OAuth 2.0, encrypted data at rest

### File Naming Conventions
- **Components**: `PascalCase.tsx` (e.g., `ChatInterface.tsx`)
- **Hooks**: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- **Services**: `camelCase.ts` with `Service` suffix (e.g., `aiService.ts`)
- **Types**: `camelCase.ts` (e.g., `chatTypes.ts`)

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}
```

## Business Context

### Target Users
1. **"Scaling Sam"** (5-15 employees): Primary persona, overwhelmed by admin
2. **"Efficient Emma"** (Office managers): Process optimizer and decision influencer  
3. **"Solo Steve"** (1-3 employees): Growth-ready sole traders

### Key Pain Points Addressed
- **Administrative Burden**: 3+ hours/week saved per employee
- **Email Overwhelm**: Smart prioritization and drafting assistance
- **Communication Confidence**: Professional tone adaptation
- **Industry Knowledge**: Instant access to Australian trade standards
- **Mobile Workflow**: One-handed operation during field work

### Competitive Advantages
- **AI-Native Design**: First conversational interface for trade businesses
- **Industry Intelligence**: Deep Australian trade knowledge integration
- **Mobile-First UX**: Built for on-site professional workflows
- **Learning System**: Adapts to individual business patterns

## Key Features & Implementation

### 1. AI Chat Interface
**Current State**: Core functionality implemented
**Location**: `frontend/src/components/chat/`
**Key Files**: 
- `ChatInterface.tsx` - Main chat screen
- `ChatMessages.tsx` - Message rendering
- `ChatInput.tsx` - Input with file upload

**Warp Commands for Development**:
```bash
# Start development servers
npm run dev

# Run tests
npm run test

# Check chat implementation
cd frontend/src/components/chat && ls -la
```

### 2. Email Intelligence (Phase 2 Priority)
**Current State**: OAuth skeleton exists, needs completion
**Location**: `backend/src/services/emailIntelligence.ts`
**Key Requirements**:
- Gmail OAuth with security reassurance
- Urgency detection (🔴🟡🟢📋 categorization)
- Morning Brief generation
- Draft creation without auto-sending

**Warp Commands**:
```bash
# Check email service implementation
cat backend/src/services/emailIntelligence.ts

# Test email API routes
curl -X GET http://localhost:3000/api/emails/test
```

### 3. Industry Knowledge Integration
**Current State**: Basic infrastructure, needs Australian trade sources
**Location**: `backend/src/services/industryKnowledge.ts`
**Data Sources Needed**:
- Australian Standards (AS/NZS 3000)
- Energy Safe Victoria (ESV) regulations
- Master Electricians Australia (MEA) guidelines
- Trade publication pricing (*Electrical Connection*)

**Warp Commands**:
```bash
# Check industry knowledge service
cat backend/src/services/industryKnowledge.ts

# View current industry sources
grep -r "Australian Standards" backend/src/
```

### 4. Document Processing
**Current State**: ✅ Fully implemented
**Location**: `backend/src/services/documentProcessing.ts`
**Features**: OCR, text extraction, proactive requests
**Testing**: Run `npm test -- documentProcessing`

### 5. User Onboarding
**Current State**: Missing, critical for Phase 2
**Planned Location**: `frontend/src/components/onboarding/`
**Requirements**:
- Progressive feature introduction
- Security reassurance for Gmail OAuth
- Mobile-optimized tutorial flow

## Common Development Tasks

### Adding New Features
1. **Create issue** in project tracking
2. **Branch naming**: `feature/description` or `bugfix/description`
3. **Implementation order**: Backend service → API route → Frontend component → Tests
4. **Testing**: Unit + integration + component tests
5. **Documentation**: Update relevant .md files

### Database Changes
```bash
# Add new migration
cd backend && npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset

# View database schema
npx prisma studio
```

### Frontend Development
```bash
# Start frontend development server
cd frontend && npm run dev

# Run component tests
npm run test:watch

# Build for production
npm run build
```

### Backend Development
```bash
# Start backend development server
cd backend && npm run dev

# Run API tests
npm run test

# Check service health
curl http://localhost:3000/api/health
```

## Testing Guidelines

### Test Structure
- **Unit Tests**: Individual functions and services
- **Integration Tests**: API endpoints and database operations
- **Component Tests**: React components with user interactions
- **E2E Tests**: Critical user flows (planned)

### Running Tests
```bash
# All tests
npm run test

# Frontend tests only
cd frontend && npm run test

# Backend tests only
cd backend && npm run test

# Watch mode for development
npm run test:watch
```

## Environment Setup

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/intelligent_admin
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret
KINDE_CLIENT_ID=your-kinde-client-id
KINDE_DOMAIN=https://yourdomain.kinde.com

# Google OAuth (for Gmail)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Services
OPENAI_API_KEY=your-openai-api-key

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
```

### Local Development Setup
```bash
# Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install

# Setup database
cd backend && npx prisma migrate dev

# Start development servers
npm run dev
```

## Security & Privacy

### Data Protection
- **Encryption**: AES-256 for sensitive data at rest
- **Transport**: TLS 1.3 for all communications
- **Authentication**: JWT with refresh tokens
- **OAuth**: Standard Google OAuth 2.0 flows
- **Compliance**: Australian Privacy Act 1988

### API Security
- **Rate Limiting**: Implemented per endpoint
- **Input Validation**: Zod schemas for all inputs  
- **Authorization**: Role-based access control
- **Audit Logging**: Comprehensive activity tracking

## Performance Targets

### Response Times
- **Chat Response**: <200ms for simple queries
- **AI Processing**: <2s for complex requests
- **File Upload**: <30s for typical documents
- **Page Load**: <3s on mobile 3G connections

### Scalability
- **Concurrent Users**: 1000+ initially
- **Database**: Connection pooling, query optimization
- **Caching**: Redis for session and frequently accessed data
- **Architecture**: Microservice-ready design

## Deployment & Infrastructure

### Development
```bash
# Docker Compose for local development
docker-compose up -d

# Manual startup
cd backend && npm run dev &
cd frontend && npm run dev
```

### Production (Planned)
- **Frontend**: CDN + static hosting
- **Backend**: Containerized on cloud platform
- **Database**: Managed PostgreSQL
- **Cache**: Managed Redis
- **Monitoring**: Comprehensive logging and alerting

## Documentation References

### Core Documentation
- **README.md**: Setup guide and overview
- **docs/requirements.md**: Functional requirements
- **docs/system-architecture.md**: Technical architecture
- **docs/api-documentation.md**: API endpoints and schemas
- **docs/user-stories.md**: Detailed user scenarios
- **docs/development-roadmap.md**: Phase-based development plan

### AI Context Files
- **.github/COPILOT_INSTRUCTIONS.md**: GitHub Copilot guidance
- **.ai/development-context.md**: AI assistant development context
- **CLAUDE.md**: Claude AI instructions

### Development Process
- **PHASE2_DEVELOPMENT_PLAN.md**: Current phase roadmap
- **UX_GAPS_ANALYSIS.md**: User experience gap analysis

## Common Issues & Solutions

### Development Issues
1. **Port Conflicts**: Check ports 3000 (backend), 5173 (frontend)
2. **Database Connection**: Verify PostgreSQL running and connection string
3. **OAuth Issues**: Check redirect URIs and environment variables
4. **Build Failures**: Clear node_modules and reinstall dependencies

### Debugging Commands
```bash
# Check running services
lsof -i :3000
lsof -i :5173

# Database connection test
cd backend && npx prisma db pull

# Check logs
tail -f backend/logs/app.log

# Service health check
curl http://localhost:3000/api/health
```

## Next Steps & Priorities

### Immediate (Week 1-2)
1. **Complete Gmail OAuth** with security messaging
2. **Implement Push Notifications** for Morning Brief
3. **Build User Onboarding Flow** with progressive disclosure
4. **Mobile Interface Improvements** for one-handed operation

### Short-term (Month 1)
1. **Industry Knowledge Integration** with Australian sources
2. **Email Urgency Detection** with ML-based classification
3. **Calendar Integration** for scheduling coordination
4. **Performance Optimization** for mobile devices

### Medium-term (Month 2-3)
1. **Business Intelligence** dashboard
2. **Advanced MCP Integration** for multi-service workflows
3. **Voice Input** capabilities
4. **Offline Functionality** for basic operations

---

## When Working with Warp AI

### Project Context
- This is a **business-critical application** for trade professionals
- Focus on **reliability and simplicity** over complex features
- **Mobile-first** approach - users primarily on phones during work
- **Australian market focus** - regulations, standards, business practices

### Development Approach
- **User story driven** - every feature addresses real pain points
- **Progressive enhancement** - start simple, add complexity gradually
- **Testing first** - comprehensive test coverage for reliability
- **Performance conscious** - trade professionals have limited time

### Code Quality Standards
- **TypeScript strict mode** throughout
- **Consistent error handling** with custom error classes
- **Security first** - proper authentication and data protection
- **Performance monitoring** - track real user metrics

### Communication Style
- **Direct and practical** - trade professionals value efficiency
- **Security transparent** - explain data handling clearly
- **Industry aware** - understand trade business workflows
- **Professional tone** - business application, not consumer app

Remember: The goal is to save Australian trade business owners 3+ hours per week on administrative tasks while maintaining professional standards and regulatory compliance.
