# Technical Specifications

## System Architecture Overview

### Architecture Pattern
**Simplified Monolithic Architecture** for MVP with clear upgrade path to microservices:
- Frontend: Single React application with chat interface
- Backend: Express.js API server with modular routes
- MCP Integration Layer: Built-in MCP agent management and execution
- Database: SQLite initially, PostgreSQL for scale
- External Services: OpenAI API, OAuth providers, MCP servers

### Technology Stack Decisions

#### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Real-time Communication**: Server-Sent Events for AI responses
- **State Management**: React Context API + useState (no Redux/Zustand)
- **Build Tool**: Vite for fast development
- **Core Components**: ChatInterface, MessageBubble, InputBox, IntegrationStatus, SettingsModal

#### Backend
- **Runtime**: Node.js (LTS version)
- **Framework**: Single Express.js application with TypeScript
- **API Design**: RESTful APIs + Server-Sent Events
- **Validation**: Zod for input validation
- **Testing**: Jest + Supertest
- **Structure**: Modular routes (auth, chat, integrations, documents) in single service

#### AI Engine
- **Primary AI**: OpenAI API (GPT-4/3.5-turbo) for conversational interface
- **Fallback Models**: Hugging Face Inference API for cost optimization
- **Intent Recognition**: Built-in prompt engineering for task classification
- **Context Management**: Conversation memory stored in database with simple retrieval
- **MCP Orchestration**: AI-driven selection and coordination of MCP agents

#### Database
- **Development Database**: SQLite with Prisma ORM
  - Simple file-based storage for rapid development
  - Easy setup and deployment
- **Production Database**: PostgreSQL 15+ (migration path planned)
  - User profiles and business data
  - Authentication tokens (encrypted)
  - Chat history and context
- **Caching**: In-memory caching initially (Redis for scale)

#### Authentication
- **Protocol**: OAuth 2.0 / OpenID Connect
- **Library**: Passport.js with relevant strategies
- **Token Storage**: Encrypted in PostgreSQL
- **Session Management**: JWT with refresh tokens

#### Document Processing
- **Text Extraction**: Simple multipart upload with pdf-parse
- **OCR**: Tesseract.js for scanned documents (when needed)
- **File Storage**: Local filesystem with simple text extraction
- **Processing**: Inline processing within main Express.js service

#### MCP Integration
- **Protocol**: Model Context Protocol specification (CORE CAPABILITY)
- **Agent Management**: Built-in registry with dynamic agent selection
- **Communication**: HTTP-based messaging to MCP servers
- **Agent Library**: Gmail, Calendar, Document, CRM, Accounting agents
- **Extensibility**: Support for open-source community MCP servers
- **AI Orchestration**: Intelligent multi-agent workflow coordination

#### Infrastructure
- **Development**: Simple Docker Compose setup
- **Production**: Single container deployment initially (Kubernetes for scale)
- **Monitoring**: Basic logging with Winston (expand to Prometheus later)
- **CI/CD**: GitHub Actions with simplified pipeline
- **Deployment**: Simplified single-service deployment

## API Design Principles

### RESTful Endpoints
```
/api/v1/auth/*          - Authentication endpoints
/api/v1/chat/*          - Chat interface endpoints
/api/v1/integrations/*  - External app integrations
/api/v1/documents/*     - Document processing
/api/v1/users/*         - User management
/api/v1/mcp/*           - MCP server management
```

### Server-Sent Events
```
/api/chat/stream       - AI response streaming
/api/system/events     - System notifications
/api/integrations/status - Integration status updates
```

**Note**: Using Server-Sent Events instead of WebSocket for simpler implementation and better compatibility with our single-screen chat interface.

## Simplified System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                 Single React App                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Chat          │  │   Integration   │  │   Settings  │ │
│  │   Interface     │  │   Status        │  │   Modal     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                    ┌─────────────────────┐
                    │   Express.js API    │
                    │                     │
                    │  ┌─────┐ ┌─────────┐│
                    │  │Chat │ │MCP Agent││
                    │  │API  │ │Manager  ││
                    │  └─────┘ └─────────┘│
                    └─────────────────────┘
                               │
               ┌───────────────┼───────────────┐
               │               │               │
        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │   SQLite/   │ │  OpenAI     │ │   MCP       │
        │ PostgreSQL  │ │    API      │ │  Servers    │
        └─────────────┘ └─────────────┘ └─────────────┘
```

### Key Simplifications
- **Single Page Application**: Chat interface is the primary (and nearly only) screen
- **Monolithic Backend**: All services combined into single Express.js application
- **Simplified State**: React Context instead of complex state management
- **Direct API Calls**: OpenAI API instead of local AI infrastructure
- **File-based Database**: SQLite for development, easy PostgreSQL migration

### MCP Integration Architecture
```typescript
// MCP Service within Express.js app
class MCPService {
  private agents: Map<string, MCPAgent> = new Map();
  
  async executeTask(intent: string, context: any): Promise<any> {
    const agent = this.selectAgent(intent);
    return await agent.execute(context);
  }
  
  private selectAgent(intent: string): MCPAgent {
    // AI-driven agent selection
    return this.agents.get(this.determineAgentType(intent));
  }
}

// Available MCP Agents
- GmailAgent: Email management
- CalendarAgent: Scheduling  
- DocumentAgent: File processing
- CRMAgent: Customer management
- AccountingAgent: Financial tasks
```

## Data Models

### Core Entities
- **User**: Profile, preferences, business context
- **ChatSession**: Conversation history and context
- **Integration**: Connected applications and tokens
- **Document**: Processed files and extracted data
- **MCPAgent**: Available agents and capabilities
- **Task**: Executed actions and results

## Security Implementation

### Authentication Flow
1. User login via web interface
2. JWT token issuance with refresh capability
3. OAuth 2.0 flow for external app connections
4. Secure token storage with encryption

### Data Protection
- **In Transit**: TLS 1.3 for all communications
- **At Rest**: AES-256 encryption for sensitive data
- **Access Control**: Role-based permissions
- **Audit Trail**: Comprehensive logging

## Performance Requirements

### Response Times
- **Chat messages**: < 200ms for simple queries
- **AI processing**: < 2s for complex NLP tasks
- **Document processing**: < 30s for typical files
- **Integration calls**: < 5s for external API calls

### Scalability Targets
- **Concurrent users**: 1000+ initially
- **Message throughput**: 10,000+ messages/minute
- **Document processing**: 100+ files/hour
- **Database**: 10M+ records support

## Deployment Architecture

### Development Environment
- Docker Compose for local development
- Hot reloading for frontend and backend
- Local PostgreSQL and Redis instances
- Mock external services for testing

### Production Environment
- Kubernetes cluster or containerized deployment
- Load balancer for high availability
- Database clustering and replication
- CDN for static assets
- Monitoring and alerting systems