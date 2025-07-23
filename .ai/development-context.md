# Development Context for AI Assistants

## Current Development Phase
**Phase 1: Foundation & Core Chat (Weeks 1-3)**
- Setting up development environment and project structure
- Implementing basic chat interface with OpenAI integration
- Creating MCP service foundation for agent management

## Project Context

### Business Problem
Australian trade businesses (plumbing, electrical, HVAC) struggle with administrative burden when scaling from 1-50 employees. They waste AU$56 billion annually on unnecessary admin tasks, averaging 3 hours per week per employee.

### Solution
AI-powered administrative assistant with conversational interface that integrates multiple business tools through MCP (Model Context Protocol) agents. Single-screen chat interface replaces 5-8 separate applications.

### Target Users
1. **Scaling Sam** (5-15 employees): Primary persona, needs efficiency tools
2. **Efficient Emma** (Office managers): Decision influencer, process optimizer
3. **Solo Steve** (1-3 employees): Growth-ready sole traders

## Technical Architecture

### Simplified Stack (Changed from microservices)
```
React SPA (Chat Interface) 
    ↓
Express.js API (Single Service)
    ↓
SQLite/PostgreSQL + OpenAI API + MCP Agents
```

### Key Technical Decisions
- **Frontend**: React + TypeScript + Tailwind CSS + Context API
- **Backend**: Express.js + Prisma ORM + SQLite → PostgreSQL
- **AI**: OpenAI API (not local models) for faster development
- **Real-time**: Server-Sent Events (not WebSocket) for simplicity
- **State**: React Context (not Redux) for minimal complexity

## MCP Agent System (CORE DIFFERENTIATOR)

### Available Agents
1. **Gmail Agent**: Email composition, reading, sending
2. **Calendar Agent**: Scheduling, appointment management
3. **Document Agent**: File processing, OCR, context extraction
4. **CRM Agent**: Customer relationship management (future)
5. **Accounting Agent**: Invoice generation, expense tracking (future)

### Agent Selection Logic
AI uses OpenAI function calling to determine which agent(s) to use based on user intent:
```typescript
// Example: "Send an email to John about tomorrow's meeting"
// → AI selects Gmail Agent + Calendar Agent for context
```

## Development Priorities

### Week 1 Focus (Current)
- [x] Project structure setup
- [x] VS Code configuration
- [ ] Package.json and dependency setup
- [ ] Basic React chat interface
- [ ] Express.js server with routes
- [ ] SQLite database with Prisma

### Week 2-3 Focus
- [ ] OpenAI API integration for chat
- [ ] Server-Sent Events for message streaming
- [ ] JWT authentication system
- [ ] Gmail MCP agent implementation
- [ ] OAuth 2.0 flow for Google services

## Code Organization

### Frontend Structure
```
frontend/src/
├── components/
│   ├── ChatInterface.tsx    # Main chat screen
│   ├── MessageBubble.tsx    # Individual messages
│   ├── InputBox.tsx         # Message input with file upload
│   └── IntegrationStatus.tsx # Connection indicators
├── hooks/
│   ├── useChat.ts           # Chat state management
│   ├── useAuth.ts           # Authentication
│   └── useIntegrations.ts   # MCP agent status
├── services/
│   ├── api.ts               # API client
│   └── websocket.ts         # Server-sent events
└── types/
    ├── chat.ts              # Chat-related types
    └── api.ts               # API response types
```

### Backend Structure
```
backend/src/
├── routes/
│   ├── auth.ts              # Authentication endpoints
│   ├── chat.ts              # Chat API with SSE
│   ├── integrations.ts      # OAuth & agent management
│   └── documents.ts         # File upload/processing
├── services/
│   ├── mcpService.ts        # MCP agent orchestration
│   ├── aiService.ts         # OpenAI API client
│   └── authService.ts       # JWT & OAuth handling
├── agents/
│   ├── gmailAgent.ts        # Gmail MCP agent
│   ├── calendarAgent.ts     # Calendar MCP agent
│   └── documentAgent.ts     # Document processing agent
└── models/
    └── (Prisma generated)    # Database models
```

## Key Implementation Guidelines

### Chat Interface
- Single screen with minimal navigation
- Mobile-first responsive design
- Real-time message streaming
- File upload with drag-and-drop
- Integration status indicators
- Conversation history persistence

### AI Integration
- Use OpenAI function calling for agent selection
- Implement conversation context and memory
- Handle API rate limits and errors gracefully
- Stream responses for better UX
- Maintain business context across conversations

### MCP Agent Pattern
```typescript
interface MCPAgent {
  name: string;
  capabilities: AgentCapability[];
  execute(task: AgentTask, context: ChatContext): Promise<AgentResult>;
  healthCheck(): Promise<AgentHealth>;
}
```

### Error Handling
- Graceful degradation when agents fail
- User-friendly error messages
- Comprehensive logging for debugging
- Fallback responses when AI is unavailable

## Testing Strategy
- Unit tests for all services and utilities
- Component tests for React components  
- Integration tests for MCP agents
- E2E tests for critical chat flows
- Mock external APIs during testing

## Security Requirements
- JWT authentication with refresh tokens
- OAuth 2.0 for external service access
- Encrypt sensitive data at rest
- Input validation with Zod
- Rate limiting on API endpoints
- No logging of sensitive user data

## Performance Targets
- Chat response: < 200ms for simple queries
- AI processing: < 2s for complex requests
- File upload: < 30s for typical documents
- Concurrent users: 100+ initially

## Competitive Advantage
1. **AI-Native Interface**: First conversational interface for trade business management
2. **MCP Architecture**: Extensible agent system for future integrations
3. **Single Application**: Replaces 5-8 separate tools with one interface
4. **Trade-Specific**: Built specifically for Australian trade business workflows

Remember: Focus on MVP functionality first. This is about getting trade business owners a simple, powerful tool that saves them 3+ hours of admin work per week.