# System Architecture

## Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Mobile Client  │    │  Desktop PWA    │
│    (React)      │    │    (React)      │    │    (React)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │    API Gateway/LB         │
                    │  (NGINX/CloudFlare)       │
                    └─────────────┬─────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                        │                         │
┌───────▼────────┐    ┌──────────▼──────────┐    ┌────────▼────────┐
│  Frontend       │    │   Backend API       │    │  WebSocket      │
│  Service        │    │   Service           │    │  Service        │
│  (Static)       │    │  (Express.js)       │    │  (Socket.io)    │
└────────────────┘    └──────────┬──────────┘    └─────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                       │                        │
┌───────▼────────┐    ┌─────────▼─────────┐    ┌────────▼────────┐
│   AI Engine    │    │  Authentication   │    │  Integration    │
│   Service      │    │   Service         │    │   Service       │
│  (Python/JS)   │    │  (OAuth 2.0)      │    │  (MCP Agents)   │
└───────┬────────┘    └───────────────────┘    └────────┬────────┘
        │                                               │
┌───────▼────────┐                              ┌───────▼────────┐
│  Document      │                              │  External APIs │
│  Processing    │                              │  (Gmail/Cal/   │
│  Service       │                              │   HubSpot)     │
└────────────────┘                              └────────────────┘

        ┌─────────────────────────┬─────────────────────────┐
        │                        │                         │
┌───────▼────────┐    ┌──────────▼──────────┐    ┌────────▼────────┐
│  PostgreSQL    │    │     Redis Cache     │    │  File Storage   │
│  (Primary DB)  │    │  (Sessions/Cache)   │    │  (Documents)    │
└────────────────┘    └─────────────────────┘    └─────────────────┘
```

## Service Architecture Details

### 1. Frontend Service
**Technology**: React 18+ with TypeScript
**Responsibilities**:
- User interface rendering
- Real-time chat interface
- State management (Redux Toolkit)
- WebSocket connection management
- Authentication flow handling

**Key Components**:
```
src/
├── components/
│   ├── chat/
│   ├── auth/
│   ├── integrations/
│   └── common/
├── pages/
├── hooks/
├── services/
├── store/
└── utils/
```

### 2. Backend API Service
**Technology**: Node.js + Express.js + TypeScript
**Responsibilities**:
- REST API endpoints
- Request validation and sanitization
- Business logic orchestration
- Service communication
- Authentication middleware

**Key Modules**:
```
src/
├── controllers/
├── middleware/
├── services/
├── models/
├── routes/
├── utils/
└── config/
```

### 3. AI Engine Service
**Technology**: Python (FastAPI) or Node.js
**Responsibilities**:
- Natural language processing
- Intent recognition and classification
- Context management and memory
- Response generation
- Recommendation engine

**Architecture**:
```
┌─────────────────┐    ┌─────────────────┐
│   NLP Pipeline  │    │  Context Store  │
│                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │
│  │Tokenizer  │  │    │  │ Vector    │  │
│  └───────────┘  │    │  │ Database  │  │
│  ┌───────────┐  │    │  └───────────┘  │
│  │Intent     │  │    │  ┌───────────┐  │
│  │Classifier │  │    │  │Conversation│ │
│  └───────────┘  │    │  │ Memory    │  │
│  ┌───────────┐  │    │  └───────────┘  │
│  │Response   │  │    └─────────────────┘
│  │Generator  │  │
│  └───────────┘  │
└─────────────────┘
```

### 4. Authentication Service
**Technology**: Node.js + Passport.js
**Responsibilities**:
- User authentication and authorization
- OAuth 2.0 flow management
- Token generation and validation
- Session management
- Security enforcement

**OAuth Flow**:
```
1. User initiates login
2. Redirect to OAuth provider
3. Authorization code exchange
4. Token storage (encrypted)
5. JWT issuance for app access
6. Refresh token management
```

### 5. Integration Service (MCP)
**Technology**: Node.js + Custom MCP Implementation
**Responsibilities**:
- MCP agent management
- Dynamic agent discovery
- Task routing and execution
- External API communication
- Integration health monitoring

**MCP Agent Architecture**:
```
┌─────────────────┐
│   MCP Router    │
└─────────┬───────┘
          │
    ┌─────┴─────┐
    │ Agent     │
    │ Registry  │
    └─────┬─────┘
          │
┌─────────▼─────────┐
│     Agents        │
├───────────────────┤
│ Gmail Agent       │
│ Calendar Agent    │
│ HubSpot Agent     │
│ Document Agent    │
│ Custom Agents     │
└───────────────────┘
```

### 6. Document Processing Service
**Technology**: Node.js + Python (for OCR)
**Responsibilities**:
- File upload handling
- Document parsing (PDF, DOCX, etc.)
- OCR processing for images
- Text extraction and cleaning
- Content indexing and search

**Processing Pipeline**:
```
File Upload → Format Detection → Content Extraction → 
Text Processing → Context Analysis → Index Storage
```

## Data Architecture

### Database Design
**Primary Database**: PostgreSQL 15+

**Core Tables**:
```sql
users (id, email, profile_data, created_at, updated_at)
chat_sessions (id, user_id, context_data, created_at)
messages (id, session_id, content, role, timestamp)
integrations (id, user_id, provider, tokens_encrypted, status)
documents (id, user_id, filename, content, metadata, processed_at)
mcp_agents (id, name, capabilities, endpoint, status)
tasks (id, user_id, agent_id, payload, status, result)
```

**Relationships**:
- Users → Chat Sessions (1:many)
- Chat Sessions → Messages (1:many)
- Users → Integrations (1:many)
- Users → Documents (1:many)
- Tasks → MCP Agents (many:1)

### Caching Strategy
**Redis Implementation**:
```
Session Data: user:{id}:session → session_object
Chat Context: chat:{session_id}:context → context_data
Integration Status: integration:{id}:status → status_object
Frequently Accessed: cache:{key} → data (TTL-based)
```

## Security Architecture

### Authentication Flow
```
1. User Login Request
   ↓
2. Credentials Validation
   ↓
3. JWT Token Generation
   ↓
4. Secure Token Storage
   ↓
5. Protected Route Access
   ↓
6. Token Validation Middleware
   ↓
7. Request Processing
```

### Data Protection Layers
1. **Transport Security**: TLS 1.3 for all communications
2. **Authentication**: JWT with refresh tokens
3. **Authorization**: Role-based access control
4. **Data Encryption**: AES-256 for sensitive data at rest
5. **Input Validation**: Comprehensive sanitization
6. **Rate Limiting**: Protection against abuse
7. **Audit Logging**: Complete activity tracking

## Scalability Considerations

### Horizontal Scaling Points
1. **Frontend**: CDN + multiple instances
2. **API Service**: Load-balanced instances
3. **AI Engine**: GPU-accelerated instances
4. **Database**: Read replicas + sharding
5. **Cache**: Redis cluster
6. **File Storage**: Distributed storage

### Performance Optimization
- **Database**: Connection pooling, query optimization
- **Cache**: Multi-layer caching strategy
- **API**: Response compression, pagination
- **Frontend**: Code splitting, lazy loading
- **WebSocket**: Connection pooling, message batching

## Monitoring and Observability

### Metrics Collection
- **Application Metrics**: Response times, error rates
- **Business Metrics**: User engagement, task completion
- **Infrastructure Metrics**: CPU, memory, network
- **Custom Metrics**: AI performance, integration health

### Logging Strategy
```
Application Logs → Structured JSON → Central Logging
Error Tracking → Alerting System → Incident Response
Performance Metrics → Monitoring Dashboard → Analysis
```

## Deployment Architecture

### Development Environment
```
Docker Compose:
- Frontend (React dev server)
- Backend (Node.js with hot reload)
- PostgreSQL (local instance)
- Redis (local instance)
- AI Engine (local or containerized)
```

### Production Environment
```
Kubernetes Cluster:
- Frontend pods (NGINX + React build)
- Backend pods (Node.js instances)
- AI Engine pods (Python/Node.js)
- PostgreSQL (managed service)
- Redis (managed service)
- Load Balancer (NGINX Ingress)
- Monitoring (Prometheus + Grafana)
```

This architecture provides a solid foundation for building a scalable, secure, and maintainable AI-powered administrative assistant application.