# Data Models

## Database Schema Design

### Overview
The application uses PostgreSQL as the primary database with the following design principles:
- Normalized data structure to reduce redundancy
- Foreign key constraints for data integrity
- Indexed columns for performance
- JSON columns for flexible metadata storage
- Soft deletes for audit trails

## Core Tables

### users
User account information and business details.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    business_name VARCHAR(255),
    business_type VARCHAR(100),
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'Australia/Sydney',
    preferences JSONB DEFAULT '{}',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_business_type ON users(business_type);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**TypeScript Interface:**
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  businessType?: string;
  phone?: string;
  timezone: string;
  preferences: UserPreferences;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  ai: {
    personality: 'professional' | 'friendly' | 'concise';
    proactiveMode: boolean;
    autoSuggestions: boolean;
  };
  integrations: {
    autoConnect: boolean;
    defaultCalendar?: string;
    defaultEmail?: string;
  };
}
```

### chat_sessions
Individual conversation sessions between user and AI.

```sql
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    context_data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    message_count INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_last_activity ON chat_sessions(last_activity_at);
CREATE INDEX idx_chat_sessions_status ON chat_sessions(status);
```

**TypeScript Interface:**
```typescript
interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  contextData: ChatContext;
  status: 'active' | 'archived' | 'deleted';
  messageCount: number;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

interface ChatContext {
  businessContext?: {
    currentProject?: string;
    clientInfo?: any;
    taskType?: string;
  };
  aiContext?: {
    personality: string;
    memory: any[];
    preferences: any;
  };
  integrationContext?: {
    activeConnections: string[];
    recentTasks: any[];
  };
}
```

### messages
Individual messages within chat sessions.

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    token_count INTEGER,
    processing_time_ms INTEGER,
    timestamp TIMESTAMP DEFAULT NOW(),
    edited_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_messages_role ON messages(role);
```

**TypeScript Interface:**
```typescript
interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: MessageMetadata;
  tokenCount?: number;
  processingTimeMs?: number;
  timestamp: Date;
  editedAt?: Date;
  deletedAt?: Date;
}

interface MessageMetadata {
  attachments?: {
    type: string;
    url: string;
    name: string;
    size: number;
  }[];
  suggestions?: string[];
  actions?: {
    type: string;
    payload: any;
    completed: boolean;
  }[];
  aiMetadata?: {
    model: string;
    temperature: number;
    confidence: number;
    intent: string;
    entities: any[];
  };
}
```

### integrations
External application connections and OAuth tokens.

```sql
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255),
    encrypted_tokens TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP,
    scopes TEXT[],
    capabilities TEXT[],
    status VARCHAR(20) DEFAULT 'connected',
    metadata JSONB DEFAULT '{}',
    last_sync_at TIMESTAMP,
    connected_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    UNIQUE(user_id, provider)
);

-- Indexes
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_integrations_token_expires_at ON integrations(token_expires_at);
```

**TypeScript Interface:**
```typescript
interface Integration {
  id: string;
  userId: string;
  provider: IntegrationProvider;
  providerUserId?: string;
  encryptedTokens: string;
  refreshTokenEncrypted?: string;
  tokenExpiresAt?: Date;
  scopes: string[];
  capabilities: string[];
  status: 'connected' | 'expired' | 'error' | 'disconnected';
  metadata: IntegrationMetadata;
  lastSyncAt?: Date;
  connectedAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

type IntegrationProvider = 'gmail' | 'google_calendar' | 'hubspot' | 'outlook' | 'slack';

interface IntegrationMetadata {
  email?: string;
  displayName?: string;
  avatar?: string;
  organizationId?: string;
  lastError?: {
    code: string;
    message: string;
    timestamp: Date;
  };
  syncStats?: {
    totalSynced: number;
    lastSyncDuration: number;
    errors: number;
  };
}
```

### documents
Uploaded and processed documents with extracted content.

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    category VARCHAR(100),
    tags TEXT[],
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    content_text TEXT,
    extracted_data JSONB DEFAULT '{}',
    processing_status VARCHAR(20) DEFAULT 'pending',
    processing_error TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX idx_documents_processing_status ON documents(processing_status);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);
CREATE INDEX idx_documents_content_text ON documents USING GIN(to_tsvector('english', content_text));
```

**TypeScript Interface:**
```typescript
interface Document {
  id: string;
  userId: string;
  filename: string;
  originalFilename: string;
  title?: string;
  category?: string;
  tags: string[];
  mimeType: string;
  fileSize: number;
  filePath: string;
  contentText?: string;
  extractedData: DocumentExtractedData;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  uploadedAt: Date;
  processedAt?: Date;
  deletedAt?: Date;
}

interface DocumentExtractedData {
  summary?: string;
  keyTerms?: string[];
  entities?: {
    type: string;
    value: string;
    confidence: number;
    startOffset: number;
    endOffset: number;
  }[];
  metadata?: {
    pageCount?: number;
    language?: string;
    author?: string;
    createdDate?: string;
    modifiedDate?: string;
  };
  businessContext?: {
    relevantTo?: string[];
    actionItems?: string[];
    contacts?: any[];
    dates?: Date[];
  };
}
```

### mcp_agents
MCP (Model Context Protocol) agents and their capabilities.

```sql
CREATE TABLE mcp_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    endpoint VARCHAR(500) NOT NULL,
    capabilities JSONB NOT NULL DEFAULT '[]',
    configuration JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    version VARCHAR(20),
    health_check_url VARCHAR(500),
    last_health_check TIMESTAMP,
    health_status VARCHAR(20) DEFAULT 'unknown',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_mcp_agents_name ON mcp_agents(name);
CREATE INDEX idx_mcp_agents_status ON mcp_agents(status);
CREATE INDEX idx_mcp_agents_capabilities ON mcp_agents USING GIN(capabilities);
```

**TypeScript Interface:**
```typescript
interface MCPAgent {
  id: string;
  name: string;
  description?: string;
  endpoint: string;
  capabilities: AgentCapability[];
  configuration: AgentConfiguration;
  status: 'active' | 'inactive' | 'error';
  version?: string;
  healthCheckUrl?: string;
  lastHealthCheck?: Date;
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

interface AgentCapability {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  examples?: any[];
}

interface AgentConfiguration {
  timeout?: number;
  retries?: number;
  rateLimit?: {
    requests: number;
    window: number;
  };
  authentication?: {
    type: 'none' | 'apikey' | 'oauth';
    config: any;
  };
}
```

### tasks
Executed tasks and their results from MCP agents.

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
    agent_id UUID NOT NULL REFERENCES mcp_agents(id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL,
    input_payload JSONB NOT NULL,
    output_payload JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    processing_time_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_session_id ON tasks(session_id);
CREATE INDEX idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_started_at ON tasks(started_at);
```

**TypeScript Interface:**
```typescript
interface Task {
  id: string;
  userId: string;
  sessionId?: string;
  agentId: string;
  taskType: string;
  inputPayload: any;
  outputPayload?: any;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
  processingTimeMs?: number;
  retryCount: number;
  metadata: TaskMetadata;
}

interface TaskMetadata {
  priority?: 'low' | 'medium' | 'high';
  scheduledFor?: Date;
  dependencies?: string[];
  userVisible?: boolean;
  notifyOnComplete?: boolean;
}
```

## Relationships

### Entity Relationship Diagram
```
users (1) ──── (many) chat_sessions
  │                        │
  │                        └── (many) messages
  │
  ├── (many) integrations
  ├── (many) documents
  └── (many) tasks
              │
              └── (many) mcp_agents
```

## Data Validation Rules

### User Data
- Email must be valid and unique
- Password must meet security requirements (8+ chars, mixed case, numbers)
- Business type must be from predefined list
- Timezone must be valid IANA timezone

### Chat Data
- Session title max 255 characters
- Message content max 10,000 characters
- Context data must be valid JSON

### Integration Data
- Provider must be supported integration type
- Tokens must be encrypted before storage
- Scopes must be valid for provider

### Document Data
- File size limited to 10MB
- Supported MIME types: PDF, DOC, DOCX, TXT
- Tags limited to 10 per document

## Data Retention Policies

### Chat Data
- Active sessions: Indefinite
- Archived sessions: 2 years
- Deleted sessions: 30 days (soft delete)

### Integration Data
- Active integrations: Indefinite
- Disconnected integrations: 90 days
- Token refresh history: 30 days

### Document Data
- Uploaded documents: Indefinite (user controlled)
- Processing logs: 90 days
- Deleted documents: 30 days (soft delete)

### Task Data
- Completed tasks: 1 year
- Failed tasks: 6 months
- Task logs: 90 days

## Performance Considerations

### Indexing Strategy
- Primary keys: UUID v4 for distributed systems
- Foreign keys: Always indexed
- Frequently queried columns: Indexed
- JSON columns: GIN indexes for complex queries
- Text search: Full-text search indexes

### Partitioning
- Messages table: Partition by month
- Tasks table: Partition by status and date
- Documents table: Consider partitioning by user_id for large datasets

### Caching Strategy
- User sessions: Redis with 24h TTL
- Integration tokens: Redis with token expiry TTL
- Frequently accessed documents: Redis with 1h TTL
- MCP agent capabilities: Redis with 6h TTL

This data model provides a robust foundation for the AI-powered administrative assistant application with proper normalization, performance optimization, and scalability considerations.