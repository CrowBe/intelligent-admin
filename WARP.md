# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Intelligent Admin** - AI-powered administrative assistant for Australian trade businesses
- Single-screen chat interface with MCP (Model Context Protocol) agent integration
- Targets small trade businesses (plumbing, electrical, HVAC) with 1-50 employees
- Solves administrative burden preventing scaling (AU$56B wasted annually)

**Current Phase**: Phase 1B - Email Intelligence (In Progress)
- Gmail OAuth integration complete
- Building email analysis and morning digest features
- Focus on urgency detection and smart categorization

## Development Commands

### Core Commands

```bash
# Quick start - Install all dependencies and setup database
npm run setup

# Start development (both frontend and backend)
npm run dev

# Run tests
npm run test                    # Run all tests
npm run test:watch             # Watch mode for tests
npm run test:coverage          # Generate coverage report

# Code quality
npm run lint                   # Check linting
npm run lint:fix              # Auto-fix linting issues
npm run format                 # Format code with Prettier
npm run type-check            # TypeScript type checking

# Build for production
npm run build                  # Build all packages
```

### Database Commands

```bash
# Database management (run from backend directory)
cd backend && npm run db:migrate      # Apply migrations
cd backend && npm run db:reset        # Reset database
cd backend && npm run db:studio       # Open Prisma Studio GUI
cd backend && npm run db:generate     # Generate Prisma client
```

### Docker Commands

```bash
# Docker development environment
npm run docker:up              # Start services (PostgreSQL, Redis)
npm run docker:down            # Stop services
npm run docker:logs            # View logs
npm run docker:reset           # Full reset (removes volumes)
```

### Individual Service Commands

```bash
# Frontend only (port 5173)
npm run dev:frontend

# Backend only (port 3000)
npm run dev:backend

# Run single test file
cd frontend && npx vitest run src/components/chat/ChatInterface.test.tsx
cd backend && npx vitest run src/services/emailUrgencyDetection.test.ts
```

## Architecture & Structure

### High-Level Architecture

The application follows a **simplified monolithic architecture** for MVP with clear upgrade paths:

```
Frontend (React + TypeScript + Tailwind)
    ↓ REST API + SSE
Backend (Express.js + Prisma)
    ↓ 
PostgreSQL Database
    ↓
External Services (Gmail API, OpenAI, etc.)
```

### Directory Structure

```
intelligent-admin/
├── frontend/                  # React SPA (port 5173)
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── auth/        # Authentication (Kinde + Google OAuth)
│   │   │   ├── chat/        # Chat interface components
│   │   │   ├── email/       # Email intelligence features
│   │   │   ├── dashboard/   # Dashboard views
│   │   │   └── onboarding/  # User onboarding flow
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API communication layer
│   │   └── lib/            # Utilities and helpers
│   └── vite.config.ts      # Vite configuration
│
├── backend/                  # Express.js API (port 3000)
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   │   ├── emails.ts   # Email analysis endpoints
│   │   │   ├── notifications.ts
│   │   │   ├── onboarding.ts
│   │   │   └── industry.ts # Industry knowledge
│   │   ├── services/       # Business logic
│   │   │   ├── emailUrgencyDetection.ts
│   │   │   ├── notificationService.ts
│   │   │   ├── industryService.ts
│   │   │   └── scheduler.ts
│   │   └── index.ts       # Server entry point
│   └── prisma/
│       └── schema.prisma   # Database schema
│
└── shared/                  # Shared types and utilities
```

### Key Services & Features

#### Authentication System
- **Hybrid approach**: Kinde for app auth + Google OAuth for Gmail
- Firebase integration for Google Identity Services
- JWT tokens with refresh mechanism
- Secure OAuth token storage (encrypted in PostgreSQL)

#### Email Intelligence (Phase 1B - Current)
- Gmail API integration with modern Google Identity Services
- Urgency detection algorithm (🔴 Urgent, 🟡 High, 🟢 Standard, 📋 Admin)
- Smart email categorization
- Morning digest generation
- Draft creation (without auto-sending)

#### MCP Agent System (Future)
- Gmail agent for email operations
- Calendar agent for scheduling
- Document agent for file processing
- Coordinated through Express.js backend

#### Database Schema (Prisma)
Key models:
- `User` - User accounts
- `EmailAnalysis` - Analyzed email data
- `NotificationPreference` - User notification settings
- `IndustrySource` / `IndustryItem` - Industry knowledge base
- `OnboardingProgress` - User onboarding tracking
- `Task` - Task management

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

- `/health` - Health check
- `/industry/*` - Industry knowledge endpoints
- `/notifications/*` - Notification management
- `/onboarding/*` - Onboarding flow
- `/emails/*` - Email analysis and management

## Environment Setup

### Required Environment Variables

```bash
# Frontend (.env)
VITE_KINDE_CLIENT_ID=your-kinde-client-id
VITE_KINDE_DOMAIN=https://yourdomain.kinde.com
VITE_KINDE_REDIRECT_URI=http://localhost:5173
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
VITE_API_BASE_URL=http://localhost:3000

# Backend (.env)
DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/intelligent_admin_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-key
PORT=3000
```

## Testing Strategy

### Test Framework: Vitest 3.2.4

- **Unit Tests**: All service functions and utilities
- **Component Tests**: React components with Testing Library
- **Integration Tests**: API endpoints with Supertest
- **E2E Tests**: Critical user flows (planned)

### Running Tests

```bash
# Run all tests
npm run test

# Run with coverage (target: 80%)
npm run test:coverage

# Run specific test file
npx vitest run path/to/test.ts

# Interactive UI mode
cd frontend && npm run test:ui
```

### Test Structure
- Frontend tests: `frontend/src/**/*.test.{ts,tsx}`
- Backend tests: `backend/src/**/*.test.ts`
- Integration tests: `backend/src/**/*.integration.test.ts`

## Development Workflow

### 1. Feature Development
1. Create feature branch from main
2. Implement with TypeScript strict mode
3. Write tests (minimum 80% coverage)
4. Run `npm run precommit` before committing
5. Create PR with description

### 2. Code Quality Checks
- ESLint + Prettier enforcement
- TypeScript strict mode enabled
- Functional React components with hooks
- Proper error handling with custom error classes

### 3. Database Changes
1. Modify `backend/prisma/schema.prisma`
2. Run `cd backend && npx prisma migrate dev --name your_migration_name`
3. Run `cd backend && npm run db:generate`
4. Update related TypeScript types

## Common Tasks

### Adding a New API Endpoint
1. Create route in `backend/src/routes/`
2. Add service logic in `backend/src/services/`
3. Update Prisma schema if needed
4. Write tests for service and route
5. Update frontend API service

### Adding a New React Component
1. Create component in appropriate `frontend/src/components/` subdirectory
2. Write component test alongside
3. Use Tailwind CSS for styling
4. Follow existing patterns for state management

### Debugging

- Frontend: Use React DevTools and browser console
- Backend: Check terminal output from `npm run dev:backend`
- Database: Use `cd backend && npm run db:studio` for GUI
- API: Test endpoints with `curl` or Postman

## Performance Targets

- Chat response: < 200ms for simple queries
- AI processing: < 2s for complex NLP tasks
- Page load: < 3s on mobile networks
- Support for 1000+ concurrent users

## Security Considerations

- All sensitive data encrypted at rest (AES-256)
- OAuth 2.0 for external integrations
- JWT with refresh tokens for authentication
- Input validation with Zod
- Rate limiting on API endpoints
- CORS properly configured

## Deployment Notes

- Development: Docker Compose setup
- Production: Kubernetes ready (future)
- Database: PostgreSQL with Prisma migrations
- File storage: Local filesystem (S3-compatible planned)
- Monitoring: Logging configured with Morgan

## Key Dependencies

### Frontend
- React 19 + TypeScript 5.8
- Vite 7 (build tool)
- Tailwind CSS 4.1
- @kinde-oss/kinde-auth-react (authentication)
- Firebase 12 (Google Identity Services)
- Lucide React (icons)

### Backend  
- Express 4.19 + TypeScript 5.7
- Prisma 5.16 (ORM)
- Zod 3.24 (validation)
- Helmet (security)
- TSX (TypeScript execution)

## Troubleshooting

### Common Issues

**Port conflicts**: Ensure ports 3000, 5173 are available
```bash
lsof -i :3000  # Check what's using port 3000
lsof -i :5173  # Check what's using port 5173
```

**Database connection issues**: 
```bash
cd backend && npm run db:reset  # Reset database
docker-compose down -v && docker-compose up -d  # Reset Docker
```

**TypeScript errors**: Check VS Code Problems panel or run:
```bash
npm run type-check
```

**Module not found**: Rebuild dependencies:
```bash
npm run clean && npm run install:all
```

## Important Context

- **Business Focus**: Australian trade businesses (electricians, plumbers, HVAC)
- **Primary Problem**: Admin burden preventing business growth
- **Solution**: AI chat replacing 5-8 separate business apps
- **Current Priority**: Email intelligence and morning briefs
- **Next Phase**: Calendar integration and multi-service coordination

## Related Documentation

- `README.md` - Setup guide and project overview
- `CLAUDE.md` - Detailed AI assistant instructions
- `TEST_FRAMEWORK_DOCUMENTATION.md` - Comprehensive testing guide
- `PHASE2_DEVELOPMENT_PLAN.md` - Roadmap for next features
- `docs/` folder - Technical specifications and architecture
