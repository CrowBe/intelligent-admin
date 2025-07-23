# Project Structure Guidelines

## Repository Structure

### Simplified Layout
```
intelligent-assistant/
├── README.md
├── CLAUDE.md                    # Claude Code instructions
├── package.json                 # Root package.json with workspaces
├── docker-compose.yml           # Development environment
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── docs/                        # Documentation
│   ├── requirements.md
│   ├── technical-specifications.md
│   ├── system-architecture.md
│   ├── development-roadmap.md
│   ├── api-documentation.md
│   ├── business-case.md
│   └── deployment.md
├── frontend/                    # React single-page application
│   ├── package.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── InputBox.tsx
│   │   │   ├── IntegrationStatus.tsx
│   │   │   └── SettingsModal.tsx
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.tsx
│   └── public/
├── backend/                     # Express.js API server
│   ├── package.json
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── chat.ts
│   │   │   ├── integrations.ts
│   │   │   └── documents.ts
│   │   ├── services/
│   │   │   ├── mcpService.ts
│   │   │   ├── aiService.ts
│   │   │   └── authService.ts
│   │   ├── agents/              # MCP Agents
│   │   │   ├── gmailAgent.ts
│   │   │   ├── calendarAgent.ts
│   │   │   └── documentAgent.ts
│   │   ├── middleware/
│   │   ├── models/
│   │   └── app.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── uploads/                 # File storage
├── shared/                      # Shared types and utilities
│   ├── types/
│   └── utils/
└── scripts/                     # Build and deployment scripts
    ├── setup-dev.sh
    ├── build.sh
    └── deploy.sh
```

## Service Structure Guidelines

### Frontend Service Structure
```
packages/frontend/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── main.tsx                # Application entry point
│   ├── App.tsx                 # Root component
│   ├── components/             # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Loading.tsx
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── OAuth.tsx
│   │   └── integrations/
│   │       ├── IntegrationList.tsx
│   │       ├── IntegrationCard.tsx
│   │       └── ConnectionStatus.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Chat.tsx
│   │   ├── Settings.tsx
│   │   └── Integrations.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   ├── useWebSocket.ts
│   │   └── useIntegrations.ts
│   ├── services/               # API communication
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   └── websocket.ts
│   ├── store/                  # State management
│   │   ├── index.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── chatSlice.ts
│   │   │   └── integrationsSlice.ts
│   │   └── middleware/
│   ├── types/                  # TypeScript definitions
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── chat.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── validation.ts
│   └── styles/
│       ├── globals.css
│       └── components.css
├── tests/
│   ├── __mocks__/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── dist/                       # Build output
```

### Backend Service Structure
```
packages/backend/
├── package.json
├── tsconfig.json
├── jest.config.js
├── .env.example
├── src/
│   ├── app.ts                  # Express app setup
│   ├── server.ts               # Server entry point
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── oauth.ts
│   │   └── environment.ts
│   ├── controllers/            # Route handlers
│   │   ├── authController.ts
│   │   ├── chatController.ts
│   │   ├── userController.ts
│   │   ├── integrationController.ts
│   │   └── documentController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── logging.ts
│   ├── services/               # Business logic
│   │   ├── authService.ts
│   │   ├── chatService.ts
│   │   ├── userService.ts
│   │   ├── integrationService.ts
│   │   └── documentService.ts
│   ├── models/                 # Database models
│   │   ├── User.ts
│   │   ├── ChatSession.ts
│   │   ├── Message.ts
│   │   ├── Integration.ts
│   │   └── Document.ts
│   ├── routes/                 # Route definitions
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   ├── users.ts
│   │   ├── integrations.ts
│   │   └── documents.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── crypto.ts
│   │   ├── validation.ts
│   │   └── helpers.ts
│   ├── types/
│   │   ├── express.d.ts
│   │   ├── api.ts
│   │   └── database.ts
│   └── websocket/
│       ├── socketHandlers.ts
│       ├── chatEvents.ts
│       └── middleware.ts
├── tests/
│   ├── integration/
│   ├── unit/
│   └── fixtures/
├── migrations/                 # Database migrations
└── dist/                      # Build output
```

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

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "nodemon src/server.ts",
    "dev:frontend": "vite",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "tsc && tsc-alias",
    "build:frontend": "vite build",
    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "jest",
    "test:frontend": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "docker:build": "docker build -t ai-assistant .",
    "docker:dev": "docker-compose up -d",
    "migrate": "knex migrate:latest",
    "seed": "knex seed:run"
  }
}
```

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

## Code Quality Standards

### TypeScript Configuration
- Strict mode enabled
- No implicit any
- Consistent import/export patterns
- Path mapping for clean imports

### Linting Rules
- ESLint with TypeScript support
- Prettier for code formatting
- Import order enforcement
- Unused variable detection
- Consistent naming conventions

### Testing Standards
- Unit tests for all services
- Integration tests for API endpoints
- Component tests for React components
- E2E tests for critical user flows
- Minimum 80% code coverage

This structure provides a solid foundation for building, maintaining, and scaling the AI-powered administrative assistant application.