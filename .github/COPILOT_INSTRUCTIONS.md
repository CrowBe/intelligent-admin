# GitHub Copilot Instructions

## Project Overview
AI-powered administrative assistant for Australian trade businesses. Single-screen chat interface with MCP (Model Context Protocol) agent integration.

## Architecture
- **Frontend**: React 18+ with TypeScript, Tailwind CSS, single-page chat interface
- **Backend**: Express.js with TypeScript, Prisma ORM, SQLite (dev) → PostgreSQL (prod)
- **AI**: OpenAI API integration with MCP agent orchestration
- **Real-time**: Server-Sent Events for chat streaming

## Code Style Guidelines

### TypeScript
- Use strict TypeScript configuration
- Prefer `interface` over `type` for object definitions
- Use proper generic types: `<T extends Record<string, unknown>>`
- Always define return types for functions
- Use `unknown` instead of `any`

### React
- Functional components with hooks
- Use React Context for state management (no Redux)
- Custom hooks for reusable logic
- Proper component composition and prop drilling avoidance

### Backend
- Express.js with proper middleware patterns
- Async/await for all database operations
- Proper error handling with custom error classes
- Input validation with Zod schemas

### Database
- Prisma ORM with proper schema definitions
- Use transactions for multi-step operations
- Implement soft deletes where appropriate
- Index frequently queried fields

## File Naming Conventions
- Components: `PascalCase.tsx` (e.g., `ChatInterface.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useChat.ts`)
- Services: `camelCase.ts` with `Service` suffix (e.g., `aiService.ts`)
- Utils: `camelCase.ts` (e.g., `dateHelpers.ts`)
- Types: `camelCase.ts` (e.g., `chatTypes.ts`)

## Key Features to Implement

### Chat Interface
- Single-screen design optimized for mobile and desktop
- Real-time message streaming via Server-Sent Events
- File upload capability with drag-and-drop
- Integration status indicators
- Typing indicators and message state management

### MCP Agent System
- Dynamic agent selection based on user intent
- Gmail, Calendar, and Document processing agents
- Agent health monitoring and error handling
- Extensible architecture for future agents

### Authentication
- JWT with refresh token mechanism
- OAuth 2.0 for external service integrations
- Secure token storage with encryption
- Session management with proper expiration

## Common Patterns

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

### Error Handling
```typescript
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### MCP Agent Pattern
```typescript
interface MCPAgent {
  name: string;
  capabilities: string[];
  execute(task: AgentTask): Promise<AgentResult>;
  healthCheck(): Promise<boolean>;
}
```

## Testing Guidelines
- Unit tests for all services and utilities
- Component tests for React components
- Integration tests for API endpoints
- E2E tests for critical user flows
- Mock external APIs (OpenAI, Gmail, etc.)

## Security Considerations
- Never log sensitive data (tokens, passwords, personal info)
- Validate all inputs with Zod schemas
- Implement rate limiting on API endpoints
- Use parameterized queries to prevent SQL injection
- Encrypt sensitive data at rest

## Performance Guidelines
- Implement proper caching strategies
- Use pagination for large data sets
- Optimize database queries with proper indexing
- Implement connection pooling for database
- Use compression for API responses

## AI Integration Best Practices
- Implement proper context management for conversations
- Use function calling for MCP agent selection
- Handle AI API rate limits and errors gracefully
- Implement conversation memory with proper limits
- Stream responses for better user experience

Remember: This is a business-critical application for trade professionals. Focus on reliability, simplicity, and user experience over complex features.