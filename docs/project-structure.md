# Project Structure Documentation

## Monorepo Architecture

This project uses a **npm workspaces** monorepo structure with three main packages:

```
intelligent-admin/
├── package.json                 # Root workspace configuration
├── CLAUDE.md                    # Claude Code instructions & standards
├── eslint.config.js             # Root-level TypeScript linting
├── tsconfig.json                # Root TypeScript configuration
├── vitest.config.ts             # Root Vitest test configuration
├── docker-compose.yml           # Development environment
├── .gitignore
├── docs/                        # Project documentation
│   ├── project-structure.md     # This file
│   ├── development-roadmap.md
│   ├── system-architecture.md
│   └── api-documentation.md
├── scripts/                     # Database & deployment scripts
│   └── init-db.sql              # Database initialization
├── frontend/                    # React application (workspace)
├── backend/                     # Express.js API (workspace)
├── shared/                      # Shared utilities (workspace)
└── node_modules/                # Root workspace dependencies
```

### Workspace Configuration

The root `package.json` defines workspaces:
```json
{
  "workspaces": ["frontend", "backend", "shared"],
  "scripts": {
    "dev": "concurrently --names backend,frontend npm run dev:backend npm run dev:frontend",
    "test": "vitest run",
    "lint": "npm run lint:backend && npm run lint:frontend && npm run lint:shared"
  }
}
```

**Benefits:**
- Shared dependencies at root level
- Coordinated testing across packages  
- Consistent linting and TypeScript configuration
- Simplified cross-package imports

## Frontend Package Structure

### Co-located Component Architecture (shadcn-ui Compatible)

```
frontend/
├── package.json                # Frontend dependencies
├── eslint.config.js            # React + A11y linting rules
├── tsconfig.json               # TypeScript config with path aliases
├── vite.config.ts              # Vite bundler configuration
├── vitest.config.ts            # Frontend testing configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── .storybook/                 # Storybook visual testing setup
├── public/
├── src/
│   ├── main.tsx                # Application entry point
│   ├── App.tsx                 # Root component
│   ├── components/
│   │   ├── ui/                 # shadcn-ui compatible components
│   │   │   ├── index.ts        # Central re-exports
│   │   │   └── button/         # Co-located component structure
│   │   │       ├── index.ts    # Re-exports: export { Button } from './Button'
│   │   │       ├── Button.tsx  # Component implementation
│   │   │       ├── Button.stories.tsx  # Storybook visual tests
│   │   │       └── Button.test.tsx     # Vitest unit tests
│   │   ├── chat/               # Feature-specific components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ChatInterface.test.tsx
│   │   │   └── ChatMessage.stories.tsx
│   │   └── documents/
│   │       ├── DocumentUpload.tsx
│   │       ├── DocumentUpload.test.tsx
│   │       └── DocumentUpload.stories.tsx
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # API communication layer
│   │   ├── api.ts
│   │   ├── documentApi.ts
│   │   └── documentApi.test.ts
│   ├── lib/                    # Utility functions
│   │   └── utils.ts            # cn() helper and other utilities
│   └── __tests__/              # Additional test files
│       └── Dashboard.test.tsx
├── dist/                       # Vite build output
└── node_modules/
```

**Co-location Benefits:**
- ✅ **shadcn-ui compatibility**: Import paths unchanged (`@/components/ui/button`)
- ✅ **Logical grouping**: Related files stay together during refactoring
- ✅ **Better DX**: Less file switching, easier code reviews
- ✅ **Clear boundaries**: Each component owns its tests and stories

## Backend Package Structure

### Service-Oriented Architecture

```
backend/
├── package.json                # Backend dependencies + Prisma
├── eslint.config.js            # Node.js + security linting rules
├── tsconfig.json               # TypeScript with strict mode
├── vitest.config.ts            # Backend testing configuration  
├── .env                        # Environment variables (gitignored)
├── prisma/                     # Database schema & migrations
│   ├── schema.prisma           # Prisma schema definition
│   └── migrations/             # Database migration files
├── uploads/                    # File upload storage (development)
├── src/
│   ├── index.ts                # Server entry point
│   ├── config/
│   │   └── env.ts              # Environment configuration
│   ├── routes/                 # API route definitions
│   │   ├── admin.ts            # Admin management routes
│   │   └── emails.ts           # Email processing routes
│   ├── services/               # Core business logic (main focus)
│   │   ├── emailUrgencyDetection.ts    # AI-powered email analysis
│   │   ├── fileUpload.ts               # File handling service
│   │   ├── industryService.ts          # Australian trade knowledge
│   │   ├── notificationService.ts      # Push notification handling
│   │   ├── onboardingService.ts        # User onboarding flow
│   │   ├── prisma.ts                   # Database connection
│   │   ├── scheduler.ts                # Task scheduling service
│   │   └── initialization.ts          # Service initialization
│   ├── middleware/             # Express middleware
│   │   └── auth.ts             # Authentication middleware
│   │   └── auth.test.ts        # Co-located middleware tests
│   ├── utils/
│   │   └── httpClient.ts       # HTTP client utilities
│   ├── repositories/           # Data access layer
│   │   └── __tests__/          # Repository integration tests
│   └── __tests__/              # Integration & API tests
│       ├── admin.routes.test.ts
│       ├── fileUpload.test.ts
│       ├── server.test.ts
│       └── config-security.test.ts
├── dist/                       # TypeScript build output
└── node_modules/
```

**Service-First Design:**
- 🎯 **Core Logic in Services**: Business intelligence, email analysis, industry knowledge
- 🔐 **Security Focus**: Comprehensive testing for auth and file uploads
- 🧪 **Testing Strategy**: Mix of co-located (middleware) and grouped (__tests__) tests
- 💾 **Prisma Integration**: Database schema and migrations managed separately

## Naming Conventions

### File Naming
- **Components**: PascalCase (e.g., `ChatInterface.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- **Services**: camelCase with 'Service' suffix (e.g., `authService.ts`)
- **Utils**: camelCase (e.g., `helpers.ts`)
- **Types**: camelCase with descriptive suffix (e.g., `api.ts`)
- **Tests**: Same as source file with `.test` or `.spec` suffix

### Code Naming
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Classes**: PascalCase
- **Interfaces**: PascalCase with 'I' prefix (optional)
- **Types**: PascalCase with 'T' suffix (optional)
- **Enums**: PascalCase

### API Naming
- **Endpoints**: kebab-case (e.g., `/api/v1/chat-sessions`)
- **Parameters**: camelCase
- **Headers**: PascalCase with hyphens
- **Environment Variables**: UPPER_SNAKE_CASE

## Configuration Guidelines

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-secret

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# External Services
OPENAI_API_KEY=your-openai-key
HUBSPOT_API_KEY=your-hubspot-key

# Application
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn
```

## Shared Package Structure

### Common Types & Utilities

```
shared/
├── package.json                # Shared dependencies
├── eslint.config.js            # TypeScript library linting
├── tsconfig.json               # Shared TypeScript configuration
├── vitest.config.ts            # Shared testing configuration
├── src/
│   ├── index.ts                # Main exports
│   ├── types/
│   │   └── index.ts            # Common TypeScript interfaces
│   └── utils/
│       └── index.ts            # Shared utility functions
└── dist/                       # Built package for consumption
```

**Purpose:**
- 🤝 **Type Safety**: Shared interfaces between frontend and backend
- 🛠️ **Common Utils**: Validation, formatting, constants
- 📦 **Package Import**: Other workspaces import via `"shared"`

## Testing Organization

### Co-located vs Grouped Tests

**Co-located (Recommended for Components):**
```
components/ui/button/
├── Button.tsx
├── Button.test.tsx             # Unit tests next to implementation
└── Button.stories.tsx          # Visual tests for Storybook
```

**Grouped (For Integration/API Tests):**
```
backend/src/
├── __tests__/                  # Integration tests
│   ├── admin.routes.test.ts    # API endpoint testing
│   └── server.test.ts          # Server configuration testing
└── services/
    └── services.integration.test.ts  # Service integration tests
```

**Benefits:**
- **Co-located**: Easy maintenance, clear ownership
- **Grouped**: Cross-cutting concerns, integration scenarios
- **Storybook Integration**: Visual regression testing for UI components

## Workspace Scripts (Root Level)

```json
{
  "scripts": {
    "dev": "concurrently --names backend,frontend npm run dev:backend npm run dev:frontend",
    "test": "vitest run",                    // Root vitest runs all workspace tests
    "test:backend": "vitest run --project backend",
    "test:frontend": "vitest run --project frontend",
    "test:coverage": "vitest run --coverage",
    "lint": "npm run lint:backend && npm run lint:frontend && npm run lint:shared",
    "type-check": "npm run type-check:backend && npm run type-check:frontend",
    "setup": "npm run install:all && cd backend && npm run db:generate && npm run db:migrate"
  }
}
```

**Workspace Benefits:**
- 🏃 **Parallel Development**: Frontend and backend run concurrently
- 🧪 **Unified Testing**: Single command runs all workspace tests
- ✅ **Consistent Linting**: Same rules across all packages
- 🔧 **Easy Setup**: One-command project initialization

## Development Workflow

### Git Workflow
```
main (production)
├── develop (integration)
│   ├── feature/chat-interface
│   ├── feature/gmail-integration
│   ├── feature/document-processing
│   └── hotfix/security-patch
└── release/v1.0.0
```

### Branch Naming
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `release/version` - Release preparation
- `chore/description` - Maintenance tasks

### Commit Messages
```
feat: add chat interface with real-time messaging
fix: resolve OAuth token refresh issue
docs: update API documentation
test: add integration tests for Gmail service
refactor: optimize database queries
chore: update dependencies
```

## Development Navigation Guide

### Finding Your Way Around

**🎯 Starting Development:**
```bash
npm run setup                   # Initial project setup
npm run dev                     # Start both frontend & backend
npm run test                    # Run all tests
npm run lint                    # Check all code quality
```

**📁 Where to Find Things:**

| What you're looking for | Location |
|------------------------|----------|
| **UI Components** | `frontend/src/components/ui/{component}/` |
| **Business Logic** | `backend/src/services/` |
| **API Routes** | `backend/src/routes/` |
| **Shared Types** | `shared/src/types/` |
| **Database Schema** | `backend/prisma/schema.prisma` |
| **Component Tests** | Co-located: `{Component}.test.tsx` |
| **API Tests** | `backend/src/__tests__/` |
| **Visual Tests** | Co-located: `{Component}.stories.tsx` |
| **Config Files** | Each package root + project root |

**🧪 Testing Strategy:**
- **Unit Tests**: Co-located with components and services
- **Integration Tests**: Grouped in `__tests__/` folders  
- **Visual Tests**: Storybook stories for UI components
- **Coverage**: Run `npm run test:coverage` for reports

**📦 Import Patterns:**
```typescript
// ✅ Cross-workspace imports
import { ApiResponse } from 'shared';

// ✅ Frontend path aliases
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ✅ Backend relative imports
import { emailService } from '../services/emailService';
```

**🔧 Configuration Hierarchy:**
1. **Root**: Workspace coordination, shared tooling
2. **Package Level**: Package-specific build/test/lint configs
3. **Component Level**: Individual component organization

This structure supports rapid development while maintaining code quality and type safety across the entire application.
