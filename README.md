# Intelligent Assistant

AI-powered administrative assistant for Australian trade businesses. A single-screen chat interface with MCP (Model Context Protocol) agent integration for Gmail, Calendar, and document processing.

## Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- VS Code (recommended)

### Setup Development Environment

1. **Clone and setup:**
   ```bash
   cd intelligent-assistant
   ./scripts/setup-dev.sh
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys (OpenAI, Google OAuth, etc.)
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

4. **Open VS Code workspace:**
   ```bash
   code .vscode/intelligent-assistant.code-workspace
   ```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Database Studio**: `cd backend && npm run db:studio`

## Development Workflow

### VS Code Extensions
The workspace will prompt you to install recommended extensions including:
- GitHub Copilot & Copilot Chat
- TypeScript, ESLint, Prettier
- Prisma, Docker, GitLens

### AI Assistant Instructions
- **Copilot Instructions**: `.github/COPILOT_INSTRUCTIONS.md`
- **Development Context**: `.ai/development-context.md`

### Key Commands
```bash
npm run dev          # Start both frontend and backend
npm run test         # Run all tests
npm run lint         # Run linting
npm run type-check   # Run TypeScript checks
npm run build        # Build for production
```

## Architecture

### Simplified Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + Prisma ORM + SQLite/PostgreSQL
- **AI**: OpenAI API integration
- **Real-time**: Server-Sent Events
- **MCP Agents**: Gmail, Calendar, Document processing

### Project Structure
```
├── frontend/          # React single-page application
├── backend/           # Express.js API server
├── shared/            # Shared types and utilities
├── docs/              # Documentation
├── .vscode/           # VS Code configuration
└── scripts/           # Development scripts
```

## Current Phase: Foundation & Core Chat (Weeks 1-3)

### Week 1 Tasks
- [x] Project structure setup
- [x] VS Code configuration
- [x] Package.json and dependencies
- [ ] Basic React chat interface
- [ ] Express.js server with routes
- [ ] SQLite database with Prisma

### Next Steps
1. Set up OpenAI API integration
2. Create basic chat interface components
3. Implement JWT authentication
4. Build first MCP agent (Gmail)

## Business Context

**Target Market**: Australian trade businesses (plumbing, electrical, HVAC) with 1-50 employees
**Problem**: Administrative burden prevents scaling (AU$56B wasted annually on admin tasks)
**Solution**: AI chat interface replacing 5-8 separate business applications

## Development Guidelines

### Code Style
- TypeScript strict mode
- ESLint + Prettier enforcement
- Functional React components with hooks
- Proper error handling with custom error classes

### MCP Agent Pattern
```typescript
interface MCPAgent {
  name: string;
  capabilities: string[];
  execute(task: AgentTask): Promise<AgentResult>;
  healthCheck(): Promise<boolean>;
}
```

### Testing
- Unit tests for all services
- Component tests for React components
- Integration tests for MCP agents
- E2E tests for critical flows

## Troubleshooting

### Common Issues
- **Port conflicts**: Check if ports 3000, 5173 are available
- **Database issues**: Run `npm run db:reset` in backend/
- **Docker issues**: Run `docker-compose down -v && docker-compose up -d`

### Getting Help
- Check VS Code Problems panel for TypeScript/ESLint issues
- Use Copilot Chat for coding assistance
- Review `.ai/development-context.md` for project context

## API Keys Required

Add these to your `.env` file:
- `OPENAI_API_KEY` - OpenAI API access
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Gmail/Calendar integration
- `JWT_SECRET` - Authentication (generate secure random string)

---

Built with ❤️ for Australian trade businesses