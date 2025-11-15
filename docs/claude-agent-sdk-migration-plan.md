# Claude Agent SDK Migration Plan

> **Purpose:** Original comprehensive migration plan (1,742 lines). **Reference only** - contains premature implementation details created before validation. Contains useful technical information about Agent SDK architecture and capabilities. Use only as technical reference if experiments prove Agent SDK adds value.

> ⚠️ **Do not use this plan for implementation.** See IMPLEMENTATION-PLAN.md for the validated experiment-first approach.

---

## Executive Summary

This document outlines a comprehensive plan to migrate or rebuild the **Intelligent Admin** application using the **Claude Agent TypeScript SDK**. The migration represents a paradigm shift from a traditional web application architecture to an **agent-based autonomous system** that can proactively manage administrative tasks for Australian trade businesses.

**Current State:** Phase 1 complete - Traditional monorepo (React + Express.js + PostgreSQL) with basic email intelligence features

**Target State:** Agent-based system leveraging Claude Agent SDK for autonomous task execution, intelligent decision-making, and seamless integration with business tools

**Migration Strategy:** Hybrid approach - Maintain web interface for user interaction while rebuilding backend logic as autonomous agents

**Timeline:** 12-16 weeks for complete migration with parallel development tracks

---

## Table of Contents

1. [Strategic Overview](#strategic-overview)
2. [Architecture Comparison](#architecture-comparison)
3. [Migration Approach](#migration-approach)
4. [Agent Design](#agent-design)
5. [Implementation Phases](#implementation-phases)
6. [Technical Specifications](#technical-specifications)
7. [Data Migration Strategy](#data-migration-strategy)
8. [Risk Assessment & Mitigation](#risk-assessment--mitigation)
9. [Success Metrics](#success-metrics)
10. [Rollback Plan](#rollback-plan)

---

## Strategic Overview

### Why Migrate to Claude Agent SDK?

#### Current Limitations
1. **Manual Service Orchestration**: Current architecture requires manual coordination between email service, document processing, and calendar integration
2. **Limited Context Awareness**: Each service operates in isolation without comprehensive understanding of user's business context
3. **Reactive Rather Than Proactive**: System responds to user queries but doesn't anticipate needs or take initiative
4. **Complex Integration Management**: Each new integration requires custom API code, authentication handling, and error management
5. **Scalability Challenges**: Adding new capabilities requires significant development effort across multiple layers

#### Agent SDK Advantages
1. **Autonomous Task Execution**: Agents can independently manage complex multi-step workflows (e.g., read email → analyze urgency → check calendar → draft response → verify tone)
2. **Natural Context Gathering**: Agents use file system exploration, semantic search, and subagents to build comprehensive understanding
3. **Proactive Intelligence**: Agents can identify patterns, anticipate needs, and take initiative (aligned with "Morning Brief" vision)
4. **Built-in Tool Integration**: MCP support provides standardized integrations with minimal custom code
5. **Self-Verification**: Agents can verify their work through linting, visual feedback, and LLM judging
6. **Adaptive Learning**: Feedback loops enable continuous improvement and pattern recognition

### Business Value Proposition

**For Australian Trade Business Owners (Dave the Electrician):**
- **Reduced Cognitive Load**: Agent handles entire workflows autonomously (not just suggesting actions)
- **Faster Response Times**: Agent can draft, verify, and queue responses without waiting for user approval on every step
- **Better Decision Making**: Agent synthesizes information from multiple sources (emails, industry regulations, past projects)
- **24/7 Operation**: Agent monitors and triages even outside business hours

**For Development Team:**
- **Accelerated Feature Development**: New capabilities added as tools/prompts rather than full service implementations
- **Reduced Maintenance Burden**: Agent SDK handles orchestration, error recovery, and integration management
- **Better Testing**: Agent feedback loops enable automated verification of complex workflows
- **Future-Proof Architecture**: Agent-based systems align with industry direction and AI capabilities evolution

---

## Architecture Comparison

### Current Architecture (Traditional Web App)

```
┌─────────────────────────────────────────────────────┐
│                 Client Layer                        │
├─────────────────┬─────────────────┬─────────────────┤
│   Web Browser   │   Mobile PWA    │   Desktop App   │
│   (React SPA)   │   (React PWA)   │   (React PWA)   │
└─────────────────┴─────────────────┴─────────────────┘
                       │
                       │ HTTPS/REST API
                       ▼
┌─────────────────────────────────────────────────────┐
│              Backend Services                       │
├─────────────────┬─────────────────┬─────────────────┤
│   Express.js    │   File Upload   │   Email Service │
│   API Server    │   Processing    │   Integration   │
└─────────────────┴─────────────────┴─────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│               Data Layer                            │
├─────────────────┬─────────────────┬─────────────────┤
│   PostgreSQL    │   File Storage  │   External APIs │
│   (Prisma ORM)  │   (Local/Cloud) │   (Gmail/OpenAI)│
└─────────────────┴─────────────────┴─────────────────┘
```

**Limitations:**
- Manual service orchestration
- Each integration requires custom code
- Limited cross-service context awareness
- User must approve each step in multi-step workflows

### Target Architecture (Agent-Based System)

```
┌─────────────────────────────────────────────────────┐
│                 User Interface Layer                │
├─────────────────┬─────────────────┬─────────────────┤
│   Web Dashboard │   Mobile App    │  Claude Desktop │
│   (React)       │   (React PWA)   │  (MCP Client)   │
└─────────────────┴─────────────────┴─────────────────┘
                       │
                       │ Agent Communication Protocol
                       ▼
┌─────────────────────────────────────────────────────┐
│           Claude Agent Orchestration Layer          │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  Master Agent (Business Intelligence Core)   │  │
│  │  - Context aggregation across all agents     │  │
│  │  - Workflow coordination and prioritization  │  │
│  │  - User preference learning and application  │  │
│  └──────────────────┬──────────────────────────┘  │
│                     │                              │
│         ┌───────────┼───────────┬─────────────┐   │
│         ▼           ▼           ▼             ▼   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ │
│  │  Email   │ │ Document │ │ Schedule │ │Industry│ │
│  │  Agent   │ │  Agent   │ │  Agent   │ │ Agent │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────┘ │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              MCP Tool Integration Layer             │
├─────────────────┬─────────────────┬─────────────────┤
│  Gmail MCP      │  Calendar MCP   │  Document MCP   │
│  (Read/Write)   │  (Events/Schedule)│ (Parse/OCR)   │
└─────────────────┴─────────────────┴─────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│            Shared Context & Data Layer              │
├─────────────────┬─────────────────┬─────────────────┤
│   PostgreSQL    │   Vector DB     │   File System   │
│   (User Data)   │   (Knowledge)   │   (Documents)   │
└─────────────────┴─────────────────┴─────────────────┘
```

**Advantages:**
- Autonomous multi-step workflow execution
- Agents share context through Master Agent coordination
- Self-verification through feedback loops
- Standardized MCP integrations
- Parallel agent execution for complex tasks

---

## Migration Approach

### Hybrid Strategy: Gradual Agent Integration

Rather than a "big bang" rewrite, we'll adopt a **strangler fig pattern** where agents gradually replace traditional services while maintaining the existing user interface.

### Three Migration Tracks

#### Track 1: Foundation & Infrastructure (Weeks 1-4)
**Objective:** Establish agent runtime environment alongside existing architecture

**Activities:**
1. Install and configure Claude Agent SDK
2. Create agent development environment with file system access
3. Set up agent-to-database communication layer
4. Implement agent monitoring and logging infrastructure
5. Create development/testing harness for agents

**Deliverables:**
- Working agent runtime environment
- Agent development guidelines and templates
- Monitoring dashboard for agent activities
- Testing framework for agent verification

#### Track 2: Core Agent Development (Weeks 5-12)
**Objective:** Build and deploy specialized agents to replace existing services

**Activities:**
1. **Email Agent** (Weeks 5-7): Replace emailUrgencyDetection service
2. **Document Agent** (Weeks 7-9): Replace file processing service
3. **Industry Knowledge Agent** (Weeks 9-10): Replace industry service
4. **Schedule Agent** (Weeks 10-12): New capability with calendar integration

**Deliverables:**
- Four specialized agents with comprehensive tooling
- MCP server implementations for each integration
- Agent-based API endpoints (backward compatible)
- Agent performance metrics and validation

#### Track 3: Master Agent & Orchestration (Weeks 13-16)
**Objective:** Implement coordinating agent and advanced workflows

**Activities:**
1. Build Master Agent for cross-agent coordination
2. Implement workflow learning and preference system
3. Create proactive monitoring and notification system
4. Deploy Morning Brief autonomous workflow
5. User acceptance testing with real trade business owners

**Deliverables:**
- Master Agent with full orchestration capabilities
- Autonomous Morning Brief feature
- Workflow learning engine
- Production-ready agent system

### Compatibility & Rollback Strategy

**Dual-Mode Operation:**
- Maintain existing Express.js API endpoints during migration
- Agents operate behind existing API interface initially
- Feature flag system to toggle between traditional service and agent execution
- Gradual user migration with A/B testing capability

**Rollback Triggers:**
- Agent response time > 5 seconds for 95th percentile
- Agent accuracy < 90% compared to traditional service
- Critical bugs affecting > 5% of operations
- User satisfaction drop > 20%

---

## Agent Design

### Agent Architecture Pattern

Each agent follows the **Feedback Loop Architecture**:

```typescript
class BaseAgent {
  // 1. GATHER CONTEXT
  async gatherContext(task: Task): Promise<Context> {
    // Agentic search - explore file system
    // Semantic search - find relevant documents
    // Subagent queries - parallel information gathering
    // Context compaction - summarize when near token limits
  }

  // 2. TAKE ACTION
  async takeAction(context: Context, task: Task): Promise<ActionResult> {
    // Tool execution
    // Code generation
    // Bash commands
    // MCP integrations
  }

  // 3. VERIFY WORK
  async verifyWork(result: ActionResult): Promise<Verification> {
    // Linting and type checking
    // Visual feedback (screenshots for UI)
    // LLM judging for fuzzy evaluation
    // Rule-based validation
  }

  // 4. ITERATE
  async iterate(verification: Verification): Promise<FinalResult> {
    // Refine based on feedback
    // Retry failed operations
    // Learn from patterns
    // Return final result or recurse
  }
}
```

### Specialized Agents

#### 1. Email Agent

**Responsibility:** Autonomous email intelligence, triage, and response management

**Core Capabilities:**
- Monitor Gmail inbox via MCP integration
- Analyze urgency using learned patterns (not just keyword matching)
- Draft context-aware responses in user's communication style
- Create and manage email rules automatically
- Coordinate with Schedule Agent for meeting requests
- Learn from user corrections and preferences

**Tools:**
```typescript
const emailAgentTools = {
  // MCP-based Gmail operations
  fetchInbox: () => Promise<Email[]>,
  searchEmails: (query: string) => Promise<Email[]>,
  readEmail: (emailId: string) => Promise<EmailContent>,
  createDraft: (to: string, subject: string, body: string) => Promise<Draft>,
  sendEmail: (draftId: string) => Promise<SentEmail>,

  // Analysis tools
  analyzeUrgency: (email: Email) => Promise<UrgencyAnalysis>,
  extractActionItems: (email: Email) => Promise<ActionItem[]>,
  identifyEmailType: (email: Email) => Promise<EmailType>,

  // Australian trade business specific
  detectTradeEmergency: (email: Email) => Promise<EmergencyLevel>,
  estimateJobValue: (email: Email) => Promise<ValueEstimate>,
  checkComplianceRequirements: (email: Email) => Promise<Compliance[]>,

  // Response generation
  draftResponse: (email: Email, tone: Tone) => Promise<string>,
  validateEmailAddress: (email: string) => Promise<boolean>,
  checkSendHistory: (to: string) => Promise<EmailHistory>
}
```

**Example Workflow:**
```typescript
// Autonomous Morning Brief Generation
async generateMorningBrief(userId: string): Promise<MorningBrief> {
  // 1. GATHER CONTEXT
  const emails = await this.tools.fetchInbox({ since: 'yesterday' });
  const userPreferences = await this.getUserPreferences(userId);
  const calendar = await this.scheduleAgent.getTodaySchedule(userId);
  const recentProjects = await this.getRecentProjects(userId);

  // 2. TAKE ACTION - Analyze in parallel using subagents
  const analyses = await Promise.all(
    emails.map(email => this.analyzeEmail(email, { userPreferences, calendar, recentProjects }))
  );

  // 3. VERIFY - Check analysis quality
  const verified = analyses.filter(a => a.confidenceScore > 0.8);
  const needsReview = analyses.filter(a => a.confidenceScore <= 0.8);

  // 4. ITERATE - Create brief with prioritization
  const urgent = verified.filter(a => a.urgency === 'high');
  const brief = {
    summary: `${urgent.length} urgent issues requiring attention`,
    urgent: urgent.map(this.formatUrgentItem),
    needsReview: needsReview.map(this.formatReviewItem),
    suggestedScheduleAdjustments: this.suggestScheduleChanges(urgent, calendar)
  };

  return brief;
}
```

#### 2. Document Agent

**Responsibility:** Intelligent document processing, analysis, and knowledge extraction

**Core Capabilities:**
- Process PDFs, Word docs, images, URLs
- OCR for scanned documents
- Extract structured data (pricing, compliance requirements, specifications)
- Cross-reference with Australian trade regulations
- Proactively request missing documentation
- Generate document summaries for chat context

**Tools:**
```typescript
const documentAgentTools = {
  // Document processing
  processDocument: (file: File) => Promise<ProcessedDocument>,
  extractText: (file: File) => Promise<string>,
  performOCR: (image: File) => Promise<string>,
  extractTables: (file: File) => Promise<Table[]>,

  // Analysis tools
  identifyDocumentType: (doc: ProcessedDocument) => Promise<DocumentType>,
  extractCompliance: (doc: ProcessedDocument) => Promise<ComplianceRequirement[]>,
  extractPricing: (doc: ProcessedDocument) => Promise<PricingData>,
  findContradictions: (doc: ProcessedDocument, industry: IndustryKnowledge) => Promise<Issue[]>,

  // Knowledge integration
  crossReferenceRegulations: (requirements: any[]) => Promise<CrossReference[]>,
  calculateCostImpact: (requirements: any[], pricing: UserPricing) => Promise<CostAnalysis>,
  suggestEquipmentNeeds: (requirements: any[]) => Promise<EquipmentSuggestion[]>,

  // Proactive requests
  identifyMissingDocs: (context: JobContext) => Promise<MissingDocument[]>,
  generateDocRequest: (missing: MissingDocument) => Promise<string>
}
```

**Example Workflow:**
```typescript
// Autonomous quote preparation from client document
async processClientRequirements(document: File, jobContext: JobContext): Promise<QuotePreparation> {
  // 1. GATHER CONTEXT
  const processed = await this.tools.processDocument(document);
  const docType = await this.tools.identifyDocumentType(processed);
  const industryStandards = await this.industryAgent.getRelevantStandards(docType);
  const userPricing = await this.getUserPricingStructure(jobContext.userId);

  // 2. TAKE ACTION - Extract requirements
  const [compliance, pricing, technical] = await Promise.all([
    this.tools.extractCompliance(processed),
    this.tools.extractPricing(processed),
    this.extractTechnicalSpecs(processed)
  ]);

  // Cross-reference with standards
  const deviations = await this.tools.findContradictions(
    { compliance, technical },
    industryStandards
  );

  // Calculate cost impact
  const costAnalysis = await this.tools.calculateCostImpact(
    compliance,
    userPricing
  );

  // 3. VERIFY - Check for missing information
  const missing = await this.tools.identifyMissingDocs(jobContext);

  // 4. ITERATE - Generate comprehensive quote preparation
  return {
    requirements: { compliance, pricing, technical },
    deviations: deviations,
    costAnalysis: costAnalysis,
    missingDocuments: missing,
    suggestedQuote: this.generateQuoteSuggestion(costAnalysis, deviations),
    clientCommunication: this.generateClientQuestions(missing, deviations)
  };
}
```

#### 3. Industry Knowledge Agent

**Responsibility:** Maintain and apply Australian trade industry expertise

**Core Capabilities:**
- Web scraping of regulatory sources (ESV, MEA, Australian Standards)
- Knowledge base updates and validation
- Context-aware application of regulations to specific jobs
- Compliance requirement identification
- Pricing benchmark analysis
- Safety protocol recommendations

**Tools:**
```typescript
const industryAgentTools = {
  // Knowledge gathering
  scrapeRegulatorySite: (url: string) => Promise<ScrapedContent>,
  extractRegulations: (content: string) => Promise<Regulation[]>,
  validateSource: (url: string) => Promise<SourceReliability>,
  detectUpdates: (source: Source) => Promise<Update[]>,

  // Knowledge application
  findRelevantRegulations: (jobType: string, state: string) => Promise<Regulation[]>,
  checkCompliance: (jobDetails: JobDetails) => Promise<ComplianceCheck>,
  recommendSafetyProtocols: (jobType: string) => Promise<SafetyProtocol[]>,
  estimatePricingBenchmark: (jobType: string, location: string) => Promise<PricingBenchmark>,

  // Learning and updates
  updateKnowledgeBase: (regulations: Regulation[]) => Promise<void>,
  resolveConflicts: (regulations: Regulation[]) => Promise<ResolvedRegulation[]>,
  tagByIndustry: (content: string) => Promise<IndustryTag[]>
}
```

#### 4. Schedule Agent

**Responsibility:** Intelligent calendar management and scheduling optimization

**Core Capabilities:**
- Google Calendar integration via MCP
- Conflict detection and resolution
- Intelligent scheduling suggestions
- Emergency rescheduling for urgent jobs
- Travel time and location optimization
- Integration with email responses

**Tools:**
```typescript
const scheduleAgentTools = {
  // Calendar operations
  fetchCalendar: (userId: string, dateRange: DateRange) => Promise<Event[]>,
  createEvent: (event: EventDetails) => Promise<Event>,
  updateEvent: (eventId: string, changes: Partial<Event>) => Promise<Event>,
  deleteEvent: (eventId: string) => Promise<void>,

  // Scheduling intelligence
  findAvailableSlots: (duration: number, constraints: Constraints) => Promise<TimeSlot[]>,
  detectConflicts: (newEvent: Event, calendar: Event[]) => Promise<Conflict[]>,
  suggestRescheduling: (conflict: Conflict) => Promise<RescheduleOption[]>,
  optimizeRoute: (events: Event[]) => Promise<OptimizedSchedule>,

  // Business logic
  calculateTravelTime: (from: Location, to: Location) => Promise<number>,
  applyPricingRules: (event: Event) => Promise<PricingCategory>,
  identifyEmergencyPriority: (job: Job) => Promise<PriorityLevel>
}
```

#### 5. Master Agent (Orchestrator)

**Responsibility:** Coordinate all agents and manage complex multi-agent workflows

**Core Capabilities:**
- Workflow orchestration across agents
- Context aggregation and sharing
- User preference learning and application
- Proactive task identification
- Conflict resolution between agents
- Performance monitoring and optimization

**Tools:**
```typescript
const masterAgentTools = {
  // Agent coordination
  delegateToAgent: (agentType: AgentType, task: Task) => Promise<AgentResult>,
  aggregateContext: (agentResults: AgentResult[]) => Promise<AggregatedContext>,
  resolveConflicts: (conflicts: AgentConflict[]) => Promise<Resolution>,

  // Workflow management
  identifyWorkflow: (userInput: string) => Promise<Workflow>,
  orchestrateWorkflow: (workflow: Workflow) => Promise<WorkflowResult>,
  monitorProgress: (workflowId: string) => Promise<ProgressStatus>,

  // Learning and adaptation
  learnUserPreferences: (interactions: Interaction[]) => Promise<Preferences>,
  applyPreferences: (task: Task, preferences: Preferences) => Promise<Task>,
  identifyPatterns: (history: TaskHistory[]) => Promise<Pattern[]>,

  // Proactive intelligence
  identifyProactiveTasks: (context: UserContext) => Promise<ProactiveTask[]>,
  prioritizeTasks: (tasks: Task[]) => Promise<PrioritizedTasks>,
  suggestWorkflowImprovements: (workflow: Workflow) => Promise<Improvement[]>
}
```

---

## Implementation Phases

### Phase 1: Foundation Setup (Weeks 1-4)

#### Week 1-2: Environment & Infrastructure

**Objectives:**
- Set up Claude Agent SDK development environment
- Create agent runtime infrastructure
- Establish monitoring and logging

**Tasks:**
1. Install Claude Agent SDK
   ```bash
   npm install @anthropic-ai/claude-agent-sdk
   ```

2. Create agent workspace structure
   ```
   intelligent-admin/
   ├── agents/                    # NEW: Agent implementations
   │   ├── base/                  # Base agent classes
   │   │   ├── BaseAgent.ts       # Core agent functionality
   │   │   ├── AgentConfig.ts     # Configuration types
   │   │   └── AgentTools.ts      # Tool registration system
   │   ├── email/                 # Email Agent
   │   ├── document/              # Document Agent
   │   ├── industry/              # Industry Knowledge Agent
   │   ├── schedule/              # Schedule Agent
   │   ├── master/                # Master Orchestrator Agent
   │   └── shared/                # Shared utilities
   ├── mcp-servers/               # NEW: MCP server implementations
   │   ├── gmail-mcp/
   │   ├── calendar-mcp/
   │   ├── document-mcp/
   │   └── industry-mcp/
   ├── agent-config/              # NEW: Agent configurations
   │   ├── tools/                 # Tool definitions
   │   ├── prompts/               # Prompt templates
   │   └── workflows/             # Workflow definitions
   ├── backend/                   # EXISTING: Traditional API (gradual deprecation)
   ├── frontend/                  # EXISTING: React UI (maintained)
   └── shared/                    # EXISTING: Shared types (expanded)
   ```

3. Implement agent runtime manager
   ```typescript
   // agents/runtime/AgentRuntime.ts
   export class AgentRuntime {
     private agents: Map<AgentType, BaseAgent> = new Map();
     private logger: Logger;
     private monitoring: MonitoringService;

     async initializeAgent(type: AgentType, config: AgentConfig): Promise<void> {
       const agent = await this.createAgent(type, config);
       this.agents.set(type, agent);
       await agent.initialize();
       this.logger.info(`Agent ${type} initialized successfully`);
     }

     async executeTask(agentType: AgentType, task: Task): Promise<TaskResult> {
       const startTime = Date.now();
       const agent = this.agents.get(agentType);

       if (!agent) {
         throw new Error(`Agent ${agentType} not found`);
       }

       try {
         const result = await agent.execute(task);
         this.monitoring.recordSuccess(agentType, Date.now() - startTime);
         return result;
       } catch (error) {
         this.monitoring.recordFailure(agentType, error);
         throw error;
       }
     }
   }
   ```

4. Set up monitoring dashboard
   - Agent execution metrics (response time, success rate)
   - Context usage tracking
   - Tool invocation statistics
   - Error tracking and alerting

**Deliverables:**
- ✅ Working agent runtime environment
- ✅ Agent development templates
- ✅ Monitoring dashboard
- ✅ Testing harness

#### Week 3-4: MCP Infrastructure & Database Integration

**Objectives:**
- Build MCP servers for core integrations
- Create agent-to-database communication layer
- Establish tool registration system

**Tasks:**
1. Implement Gmail MCP Server
   ```typescript
   // mcp-servers/gmail-mcp/src/index.ts
   import { Server } from '@modelcontextprotocol/sdk/server/index.js';
   import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
   import { gmail_v1, google } from 'googleapis';

   const server = new Server({
     name: 'gmail-intelligence-server',
     version: '1.0.0',
   }, {
     capabilities: {
       tools: {},
       resources: {}
     }
   });

   // Register resources
   server.setRequestHandler(ListResourcesRequestSchema, async () => ({
     resources: [
       {
         uri: 'gmail://inbox/recent',
         name: 'Recent Inbox Emails',
         mimeType: 'application/json',
         description: 'Recent emails from user inbox'
       },
       {
         uri: 'gmail://analysis/urgent',
         name: 'Urgent Emails',
         mimeType: 'application/json',
         description: 'Emails flagged as urgent'
       }
     ]
   }));

   // Register tools
   server.setRequestHandler(ListToolsRequestSchema, async () => ({
     tools: [
       {
         name: 'fetch_inbox',
         description: 'Fetch emails from Gmail inbox with optional filters',
         inputSchema: {
           type: 'object',
           properties: {
             maxResults: { type: 'number', default: 50 },
             since: { type: 'string', description: 'ISO date string' },
             query: { type: 'string', description: 'Gmail search query' }
           }
         }
       },
       {
         name: 'analyze_email_urgency',
         description: 'Analyze email urgency for Australian trade business context',
         inputSchema: {
           type: 'object',
           properties: {
             emailId: { type: 'string' },
             userPreferences: { type: 'object' }
           },
           required: ['emailId']
         }
       },
       {
         name: 'create_draft',
         description: 'Create email draft with specified content',
         inputSchema: {
           type: 'object',
           properties: {
             to: { type: 'string' },
             subject: { type: 'string' },
             body: { type: 'string' },
             tone: { type: 'string', enum: ['professional', 'casual', 'urgent'] }
           },
           required: ['to', 'subject', 'body']
         }
       }
     ]
   }));

   // Tool execution handlers
   server.setRequestHandler(CallToolRequestSchema, async (request) => {
     switch (request.params.name) {
       case 'fetch_inbox':
         return await handleFetchInbox(request.params.arguments);
       case 'analyze_email_urgency':
         return await handleAnalyzeUrgency(request.params.arguments);
       case 'create_draft':
         return await handleCreateDraft(request.params.arguments);
       default:
         throw new Error(`Unknown tool: ${request.params.name}`);
     }
   });
   ```

2. Create database adapter for agents
   ```typescript
   // agents/shared/DatabaseAdapter.ts
   export class AgentDatabaseAdapter {
     constructor(private prisma: PrismaClient) {}

     async storeAgentContext(agentId: string, context: AgentContext): Promise<void> {
       await this.prisma.agentContext.upsert({
         where: { agentId },
         create: {
           agentId,
           context: context as any,
           updatedAt: new Date()
         },
         update: {
           context: context as any,
           updatedAt: new Date()
         }
       });
     }

     async retrieveAgentContext(agentId: string): Promise<AgentContext | null> {
       const record = await this.prisma.agentContext.findUnique({
         where: { agentId }
       });
       return record?.context as AgentContext || null;
     }

     async storeWorkflowResult(workflow: WorkflowResult): Promise<void> {
       await this.prisma.workflowExecution.create({
         data: {
           workflowId: workflow.id,
           userId: workflow.userId,
           status: workflow.status,
           result: workflow.result as any,
           executionTime: workflow.executionTime,
           agentsInvolved: workflow.agentsInvolved,
           completedAt: new Date()
         }
       });
     }
   }
   ```

**Deliverables:**
- ✅ Gmail MCP server operational
- ✅ Agent database integration
- ✅ Tool registration framework
- ✅ Development documentation

---

### Phase 2: Core Agent Development (Weeks 5-12)

#### Weeks 5-7: Email Agent Implementation

**Objectives:**
- Build Email Agent to replace emailUrgencyDetection service
- Implement autonomous email triage
- Create draft response generation

**Implementation:**
```typescript
// agents/email/EmailAgent.ts
import { BaseAgent } from '../base/BaseAgent.js';
import type { Task, Context, AgentResult } from '../base/types.js';

export class EmailAgent extends BaseAgent {
  constructor(config: EmailAgentConfig) {
    super('email-agent', config);
  }

  async execute(task: Task): Promise<AgentResult> {
    // GATHER CONTEXT
    const context = await this.gatherContext(task);

    // TAKE ACTION
    const action = await this.takeAction(context, task);

    // VERIFY WORK
    const verification = await this.verifyWork(action);

    // ITERATE if needed
    if (!verification.passed) {
      return this.iterate(verification, context, task);
    }

    return {
      success: true,
      result: action.result,
      confidence: verification.confidence,
      metadata: {
        contextSize: context.tokenCount,
        toolsUsed: action.toolsUsed,
        iterationCount: 1
      }
    };
  }

  protected async gatherContext(task: Task): Promise<Context> {
    const userId = task.userId;

    // Parallel context gathering using subagents
    const [userPrefs, recentEmails, calendar, pastInteractions] = await Promise.all([
      this.getUserPreferences(userId),
      this.tools.fetchInbox({ userId, maxResults: 100 }),
      this.scheduleAgent?.getUpcomingEvents(userId, 7) || Promise.resolve([]),
      this.getRecentEmailInteractions(userId, 30)
    ]);

    // Semantic search for relevant past emails
    const similarEmails = await this.findSimilarEmails(task.emailContent, pastInteractions);

    // Build comprehensive context
    return {
      userPreferences: userPrefs,
      currentInbox: recentEmails,
      upcomingSchedule: calendar,
      relevantHistory: similarEmails,
      businessContext: await this.getBusinessContext(userId),
      tokenCount: this.estimateTokenCount([userPrefs, recentEmails, calendar, similarEmails])
    };
  }

  protected async takeAction(context: Context, task: Task): Promise<ActionResult> {
    switch (task.type) {
      case 'analyze_urgency':
        return this.analyzeEmailUrgency(task.email, context);

      case 'generate_morning_brief':
        return this.generateMorningBrief(context);

      case 'draft_response':
        return this.draftEmailResponse(task.email, context);

      case 'triage_inbox':
        return this.triageInbox(context);

      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private async analyzeEmailUrgency(email: Email, context: Context): Promise<ActionResult> {
    // Use LLM with structured output for analysis
    const analysis = await this.llm.analyze({
      email,
      userPreferences: context.userPreferences,
      businessContext: context.businessContext,
      similarCases: context.relevantHistory
    }, {
      outputSchema: EmailUrgencySchema,
      systemPrompt: this.getUrgencyAnalysisPrompt(context)
    });

    // Store in database
    await this.db.storeEmailAnalysis({
      userId: context.userPreferences.userId,
      emailId: email.id,
      analysis: analysis,
      analyzedAt: new Date()
    });

    return {
      result: analysis,
      toolsUsed: ['llm.analyze', 'db.storeEmailAnalysis'],
      confidence: analysis.confidenceScore
    };
  }

  private async generateMorningBrief(context: Context): Promise<ActionResult> {
    // Filter emails from last 16 hours (overnight)
    const overnightEmails = context.currentInbox.filter(
      e => this.isOvernightEmail(e, context.userPreferences.timezone)
    );

    // Analyze each email in parallel
    const analyses = await Promise.all(
      overnightEmails.map(email => this.analyzeEmailUrgency(email, context))
    );

    // Categorize by urgency
    const urgent = analyses.filter(a => a.result.urgencyLevel === 'urgent');
    const high = analyses.filter(a => a.result.urgencyLevel === 'high');

    // Generate brief with AI
    const brief = await this.llm.generate({
      template: 'morning-brief',
      data: {
        urgent,
        high,
        schedule: context.upcomingSchedule,
        businessPriorities: context.businessContext.currentPriorities
      }
    });

    return {
      result: {
        summary: brief,
        urgentCount: urgent.length,
        highCount: high.length,
        suggestedActions: this.generateSuggestedActions(urgent, high, context)
      },
      toolsUsed: ['llm.analyze', 'llm.generate'],
      confidence: 0.95
    };
  }

  protected async verifyWork(action: ActionResult): Promise<Verification> {
    // Rule-based verification
    const rulesPassed = this.verifyAgainstRules(action);

    // LLM judging for quality
    const qualityScore = await this.llm.judge(action.result, {
      criteria: ['relevance', 'accuracy', 'tone', 'completeness']
    });

    return {
      passed: rulesPassed && qualityScore > 0.8,
      confidence: qualityScore,
      issues: rulesPassed ? [] : this.identifyIssues(action),
      suggestions: qualityScore < 0.9 ? await this.getSuggestions(action) : []
    };
  }
}
```

**Testing Strategy:**
```typescript
// agents/email/__tests__/EmailAgent.test.ts
describe('EmailAgent', () => {
  let agent: EmailAgent;
  let mockTools: MockEmailTools;

  beforeEach(() => {
    mockTools = createMockEmailTools();
    agent = new EmailAgent({
      tools: mockTools,
      llm: mockLLM,
      db: mockDatabase
    });
  });

  describe('Urgency Analysis', () => {
    it('should detect emergency keywords in Australian trade context', async () => {
      const email = createMockEmail({
        subject: 'URGENT: Gas leak at Westfield site',
        from: 'manager@westfield.com.au',
        body: 'Gas leak detected in food court. Need immediate attendance.'
      });

      const result = await agent.execute({
        type: 'analyze_urgency',
        email,
        userId: 'test-user'
      });

      expect(result.result.urgencyLevel).toBe('urgent');
      expect(result.result.reasoning).toContain('gas leak');
      expect(result.result.suggestedActions).toContain('Call immediately');
    });

    it('should consider user schedule when determining urgency', async () => {
      // User has emergency appointment already scheduled
      mockTools.getUpcomingEvents.mockResolvedValue([
        { time: 'today 9am', description: 'Emergency callout - blocked drain' }
      ]);

      const email = createMockEmail({
        subject: 'Blocked toilet - office building',
        from: 'admin@office.com.au'
      });

      const result = await agent.execute({
        type: 'analyze_urgency',
        email,
        userId: 'test-user'
      });

      // Should note scheduling conflict
      expect(result.result.notes).toContain('schedule conflict');
    });
  });

  describe('Morning Brief Generation', () => {
    it('should prioritize urgent emails in brief', async () => {
      const urgentEmail = createMockEmail({ subject: 'URGENT: No power' });
      const normalEmail = createMockEmail({ subject: 'Quote request' });

      mockTools.fetchInbox.mockResolvedValue([urgentEmail, normalEmail]);

      const result = await agent.execute({
        type: 'generate_morning_brief',
        userId: 'test-user'
      });

      expect(result.result.urgentCount).toBe(1);
      expect(result.result.summary).toMatch(/no power/i);
    });
  });

  describe('Draft Response', () => {
    it('should match user communication tone', async () => {
      const userPrefs = {
        communicationStyle: 'casual-but-professional',
        signOff: 'Cheers, Dave'
      };

      const email = createMockEmail({
        subject: 'Quote for RCD testing',
        from: 'facility@office.com.au'
      });

      const result = await agent.execute({
        type: 'draft_response',
        email,
        userId: 'test-user'
      });

      expect(result.result.draft).toContain('Cheers, Dave');
      expect(result.result.tone).toBe('casual-but-professional');
    });
  });
});
```

**Deliverables:**
- ✅ Email Agent with full urgency detection
- ✅ Morning Brief autonomous generation
- ✅ Draft response creation
- ✅ 90%+ test coverage
- ✅ Performance benchmarks met

#### Weeks 7-9: Document Agent Implementation

**Objectives:**
- Build Document Agent for PDF/Word/image processing
- Implement OCR and content extraction
- Create cross-referencing with industry standards

**Key Features:**
- Multi-format document ingestion
- Structured data extraction (pricing, compliance, specs)
- Proactive document request generation
- Integration with Industry Knowledge Agent

**Deliverables:**
- ✅ Document Agent operational
- ✅ OCR integration working
- ✅ Cross-referencing engine
- ✅ Comprehensive testing

#### Weeks 9-10: Industry Knowledge Agent

**Objectives:**
- Build Industry Agent for Australian trade knowledge
- Implement web scraping for regulatory sources
- Create knowledge validation system

**Key Features:**
- Automated scraping of ESV, MEA, Australian Standards
- Knowledge base updates and validation
- Context-aware regulation application
- Compliance checking

**Deliverables:**
- ✅ Industry Agent functional
- ✅ Web scraping pipeline
- ✅ Knowledge base populated
- ✅ Validation system

#### Weeks 10-12: Schedule Agent

**Objectives:**
- Build Schedule Agent for calendar management
- Implement intelligent scheduling
- Create integration with Email Agent

**Key Features:**
- Google Calendar MCP integration
- Conflict detection and resolution
- Emergency rescheduling
- Travel time optimization

**Deliverables:**
- ✅ Schedule Agent operational
- ✅ Calendar integration working
- ✅ Intelligent scheduling algorithms
- ✅ Email-schedule coordination

---

### Phase 3: Master Agent & Orchestration (Weeks 13-16)

#### Weeks 13-14: Master Agent Development

**Objectives:**
- Build Master Agent for workflow orchestration
- Implement cross-agent coordination
- Create context aggregation system

**Implementation:**
```typescript
// agents/master/MasterAgent.ts
export class MasterAgent extends BaseAgent {
  private agentRegistry: Map<AgentType, BaseAgent>;

  constructor(config: MasterAgentConfig) {
    super('master-agent', config);
    this.agentRegistry = new Map();
  }

  async registerAgent(type: AgentType, agent: BaseAgent): Promise<void> {
    this.agentRegistry.set(type, agent);
  }

  async execute(task: Task): Promise<AgentResult> {
    // 1. GATHER CONTEXT - Identify workflow needed
    const workflow = await this.identifyWorkflow(task);

    // 2. TAKE ACTION - Orchestrate agents
    const result = await this.orchestrateWorkflow(workflow, task);

    // 3. VERIFY WORK - Validate workflow completion
    const verification = await this.verifyWorkflow(result);

    // 4. ITERATE - Refine if needed
    if (!verification.passed) {
      return this.retryWorkflow(workflow, verification);
    }

    // Learn from execution
    await this.learnFromWorkflow(workflow, result);

    return result;
  }

  private async identifyWorkflow(task: Task): Promise<Workflow> {
    // Use LLM to classify task into workflow type
    const classification = await this.llm.classify(task, {
      workflowTypes: [
        'email-triage-and-response',
        'quote-preparation',
        'emergency-scheduling',
        'compliance-check',
        'morning-brief',
        'document-analysis'
      ]
    });

    return this.getWorkflowDefinition(classification.workflowType);
  }

  private async orchestrateWorkflow(workflow: Workflow, task: Task): Promise<AgentResult> {
    const results: Map<string, any> = new Map();

    // Execute workflow steps
    for (const step of workflow.steps) {
      const agent = this.agentRegistry.get(step.agentType);

      if (!agent) {
        throw new Error(`Agent ${step.agentType} not registered`);
      }

      // Build step task with context from previous steps
      const stepTask = this.buildStepTask(step, task, results);

      // Execute with timeout
      const stepResult = await Promise.race([
        agent.execute(stepTask),
        this.timeout(step.timeout)
      ]);

      results.set(step.id, stepResult);

      // Check if should continue
      if (step.continueIf && !step.continueIf(stepResult)) {
        break;
      }
    }

    // Aggregate results
    return this.aggregateResults(results, workflow);
  }

  private async learnFromWorkflow(workflow: Workflow, result: AgentResult): Promise<void> {
    // Store workflow execution for pattern learning
    await this.db.storeWorkflowExecution({
      workflowType: workflow.type,
      steps: workflow.steps.map(s => s.id),
      result: result,
      executionTime: result.metadata.executionTime,
      success: result.success
    });

    // Update user preferences based on result
    if (result.metadata.userFeedback) {
      await this.updateUserPreferences(result.metadata.userFeedback);
    }
  }
}
```

**Example Workflow: Emergency Job Handling**
```typescript
const emergencyJobWorkflow: Workflow = {
  type: 'emergency-job-handling',
  steps: [
    {
      id: 'analyze-emergency',
      agentType: 'email',
      task: 'analyze_urgency',
      timeout: 5000,
      continueIf: (result) => result.urgencyLevel === 'urgent'
    },
    {
      id: 'check-availability',
      agentType: 'schedule',
      task: 'find_emergency_slot',
      timeout: 3000
    },
    {
      id: 'reschedule-if-needed',
      agentType: 'schedule',
      task: 'reschedule_non_urgent',
      timeout: 5000,
      condition: (prevResults) => prevResults.get('check-availability').hasConflict
    },
    {
      id: 'check-compliance',
      agentType: 'industry',
      task: 'check_emergency_requirements',
      timeout: 4000
    },
    {
      id: 'draft-response',
      agentType: 'email',
      task: 'draft_emergency_response',
      timeout: 6000,
      context: ['analyze-emergency', 'check-availability', 'check-compliance']
    },
    {
      id: 'notify-user',
      agentType: 'email',
      task: 'send_notification',
      timeout: 2000
    }
  ],
  verification: {
    rules: [
      'emergency response drafted within 60 seconds',
      'schedule confirmed or alternative provided',
      'compliance requirements identified'
    ]
  }
};
```

**Deliverables:**
- ✅ Master Agent operational
- ✅ Workflow orchestration working
- ✅ Context aggregation system
- ✅ Multi-agent coordination

#### Weeks 15-16: Workflow Learning & Production Deployment

**Objectives:**
- Implement preference learning system
- Deploy to production with monitoring
- User acceptance testing

**Tasks:**
1. Preference Learning Engine
   ```typescript
   export class PreferenceLearningEngine {
     async learnFromInteractions(userId: string, timeframe: number): Promise<LearnedPreferences> {
       const interactions = await this.db.getUserInteractions(userId, timeframe);

       const patterns = {
         responseStyle: this.analyzeResponsePatterns(interactions),
         schedulingPreferences: this.analyzeSchedulingPatterns(interactions),
         prioritizationRules: this.analyzePrioritizationPatterns(interactions),
         communicationTone: this.analyzeTonePreferences(interactions)
       };

       return this.consolidatePatterns(patterns);
     }

     private analyzeResponsePatterns(interactions: Interaction[]): ResponsePattern {
       // Identify patterns in user corrections to agent suggestions
       const corrections = interactions.filter(i => i.type === 'correction');

       return {
         preferredResponseTime: this.calculateAverageResponseTime(corrections),
         approvalThreshold: this.calculateApprovalThreshold(corrections),
         preferredActions: this.extractPreferredActions(corrections)
       };
     }
   }
   ```

2. Production Deployment
   - Blue-green deployment strategy
   - Feature flags for gradual rollout
   - Comprehensive monitoring
   - Automated rollback triggers

3. User Acceptance Testing
   - Beta testing with 5-10 trade businesses
   - Real-world workflow validation
   - Performance benchmarking
   - User satisfaction surveys

**Deliverables:**
- ✅ Preference learning operational
- ✅ Production deployment complete
- ✅ Monitoring dashboards live
- ✅ UAT completed successfully

---

## Technical Specifications

### Agent Configuration Schema

```typescript
// agents/base/AgentConfig.ts
export interface AgentConfig {
  // Agent identity
  name: string;
  version: string;
  description: string;

  // Runtime configuration
  maxTokens: number;
  timeout: number;
  retryAttempts: number;

  // LLM configuration
  llm: {
    model: string; // e.g., 'claude-3-5-sonnet-20241022'
    temperature: number;
    maxContextTokens: number;
  };

  // Tool configuration
  tools: ToolConfig[];
  mcpServers: MCPServerConfig[];

  // Verification settings
  verification: {
    enabled: boolean;
    rules: VerificationRule[];
    llmJudging: boolean;
    visualFeedback: boolean;
  };

  // Learning settings
  learning: {
    enabled: boolean;
    feedbackLoop: boolean;
    preferenceUpdates: boolean;
  };

  // Database integration
  database: {
    adapter: DatabaseAdapter;
    caching: CacheConfig;
  };

  // Monitoring
  monitoring: {
    enabled: boolean;
    metricsEndpoint: string;
    errorTracking: boolean;
  };
}

export interface ToolConfig {
  name: string;
  description: string;
  handler: ToolHandler;
  inputSchema: JSONSchema;
  timeout?: number;
}

export interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
}
```

### Database Schema Extensions

```prisma
// backend/prisma/schema.prisma

// Agent execution tracking
model AgentExecution {
  id            String   @id @default(cuid())
  agentType     String   // email, document, industry, schedule, master
  taskType      String   // analyze_urgency, draft_response, etc.
  userId        String
  status        String   // pending, running, completed, failed
  startedAt     DateTime @default(now())
  completedAt   DateTime?
  executionTime Int?     // milliseconds
  tokensUsed    Int?
  toolsInvoked  String[] // Array of tool names used
  result        Json?
  error         String?
  metadata      Json?

  @@index([agentType, status])
  @@index([userId, startedAt])
}

// Agent context storage
model AgentContext {
  id        String   @id @default(cuid())
  agentId   String   @unique
  userId    String?
  context   Json     // Stored context for agent continuity
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  expiresAt DateTime?

  @@index([userId])
}

// Workflow execution tracking
model WorkflowExecution {
  id             String   @id @default(cuid())
  workflowType   String   // emergency-job, quote-prep, morning-brief
  userId         String
  status         String   // running, completed, failed
  steps          Json     // Array of step results
  agentsInvolved String[] // Array of agent types
  startedAt      DateTime @default(now())
  completedAt    DateTime?
  executionTime  Int?
  result         Json?
  error          String?
  userFeedback   Json?    // User corrections/approvals

  @@index([userId, workflowType])
  @@index([status, startedAt])
}

// User preference learning
model UserPreference {
  id              String   @id @default(cuid())
  userId          String   @unique
  communicationStyle String? // casual-but-professional, formal, etc.
  responseTimeGoal   Int?    // minutes
  schedulingRules    Json?   // Learned scheduling preferences
  prioritizationRules Json?  // How user prioritizes tasks
  tonePreferences    Json?   // Email tone preferences
  workflowPreferences Json?  // Preferred workflows for tasks
  learnedAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  confidence      Float    @default(0.5) // Confidence in learned prefs

  user User @relation(fields: [userId], references: [id])
}

// Enhanced email analysis for agent
model EmailAnalysis {
  id                String   @id @default(cuid())
  userId            String
  emailId           String   @unique
  agentAnalysisId   String?  // Link to AgentExecution
  subject           String
  sender            String
  snippet           String
  priority          String
  category          String
  urgencyScore      Float
  businessRelevance Float
  actionRequired    Boolean
  keywords          String[]
  suggestedActions  String[]
  reasoning         String
  agentConfidence   Float    @default(0.8)
  userCorrection    Json?    // If user corrected agent analysis
  notificationSent  Boolean  @default(false)
  analyzedAt        DateTime @default(now())

  agentExecution AgentExecution? @relation(fields: [agentAnalysisId], references: [id])

  @@index([userId, priority])
  @@index([analyzedAt])
}
```

### Performance Requirements

| Metric | Target | Maximum Acceptable |
|--------|--------|-------------------|
| Email Analysis | < 2s | 5s |
| Morning Brief Generation | < 10s | 20s |
| Draft Response Creation | < 3s | 8s |
| Document Processing | < 15s | 30s |
| Workflow Orchestration | < 30s | 60s |
| Agent Context Retrieval | < 200ms | 500ms |
| Tool Invocation | < 1s | 3s |
| Database Operations | < 100ms | 300ms |

### Security Considerations

1. **Agent Sandbox**: Agents execute in sandboxed environment with restricted file system access
2. **Tool Permissions**: Each tool requires explicit permission configuration
3. **User Data Protection**: Agent context encrypted at rest
4. **Audit Logging**: All agent actions logged for compliance
5. **Rate Limiting**: Agent API calls rate-limited per user
6. **Secret Management**: MCP server credentials stored in secure vault

---

## Data Migration Strategy

### Phase 1: Dual-Write Period (Weeks 5-12)

During agent development, both traditional services and agents write to database:

```typescript
// Backend API endpoint (temporary dual execution)
app.post('/api/v1/emails/analyze', async (req, res) => {
  const { emailId, userId } = req.body;

  // Execute both traditional and agent-based analysis
  const [traditionalResult, agentResult] = await Promise.allSettled([
    traditionalEmailService.analyzeEmail(emailId, userId),
    agentRuntime.executeTask('email', {
      type: 'analyze_urgency',
      email: { id: emailId },
      userId
    })
  ]);

  // Compare results for validation
  await comparisonService.compareResults(traditionalResult, agentResult);

  // Return based on feature flag
  if (featureFlags.useAgentForEmail(userId)) {
    res.json(agentResult.value);
  } else {
    res.json(traditionalResult.value);
  }
});
```

### Phase 2: Data Backfill (Week 13)

Migrate existing email analyses to agent format:

```typescript
async function backfillAgentExecutions(): Promise<void> {
  const existingAnalyses = await prisma.emailAnalysis.findMany({
    where: { agentAnalysisId: null }
  });

  for (const analysis of existingAnalyses) {
    // Create corresponding AgentExecution record
    const agentExecution = await prisma.agentExecution.create({
      data: {
        agentType: 'email',
        taskType: 'analyze_urgency',
        userId: analysis.userId,
        status: 'completed',
        completedAt: analysis.analyzedAt,
        result: {
          priority: analysis.priority,
          category: analysis.category,
          urgencyScore: analysis.urgencyScore
        }
      }
    });

    // Link analysis to execution
    await prisma.emailAnalysis.update({
      where: { id: analysis.id },
      data: { agentAnalysisId: agentExecution.id }
    });
  }
}
```

### Phase 3: Deprecation (Week 14-16)

1. Feature flag all users to agent execution
2. Monitor for 1 week
3. If stable, remove traditional service code
4. Clean up dual-write logic

---

## Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Agent response time exceeds targets | High | Medium | Implement caching, context compaction, parallel execution |
| Agent accuracy below 90% threshold | Critical | Low | Extensive testing, user correction feedback loop, fallback to traditional |
| MCP server integration failures | Medium | Medium | Retry logic, graceful degradation, comprehensive error handling |
| Token costs exceed budget | Medium | Medium | Context compaction, caching, efficient prompts |
| Database performance degradation | High | Low | Query optimization, indexing, connection pooling |
| Agent infinite loops | Medium | Low | Timeout mechanisms, iteration limits, circuit breakers |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| User adoption resistance | High | Medium | Gradual rollout, extensive onboarding, clear value demonstration |
| Migration timeline overrun | Medium | Medium | Buffer time, parallel development tracks, MVP approach |
| Existing users disrupted | High | Low | Backward compatibility, feature flags, rollback plan |
| Development resource constraints | Medium | Medium | Phased approach, outsourcing options, prioritization |

### Mitigation Strategies

1. **Comprehensive Testing**: 80% code coverage minimum, extensive integration testing
2. **Feature Flags**: Gradual rollout with ability to disable agents per user
3. **Monitoring**: Real-time dashboards for agent performance, error rates
4. **User Feedback**: Built-in feedback mechanism for corrections
5. **Rollback Plan**: Maintain traditional services for 3 months post-migration

---

## Success Metrics

### Technical Metrics

- **Agent Performance**: 95% of executions complete within target time
- **Accuracy**: 90% user approval rate for agent suggestions
- **Reliability**: 99.5% uptime for agent system
- **Cost Efficiency**: Token usage within 20% of baseline projections

### Business Metrics

- **User Engagement**: Morning Brief open rate >70%
- **Time Savings**: Average 2+ hours saved per user per week
- **Task Completion**: 50% increase in automated task completion
- **User Satisfaction**: NPS score >50 for agent features

### Learning Metrics

- **Preference Accuracy**: 80% of learned preferences applied correctly
- **Workflow Optimization**: 30% reduction in multi-step workflow time
- **Error Reduction**: 40% fewer user corrections over 3 months

---

## Rollback Plan

### Triggers for Rollback

1. Agent accuracy drops below 80%
2. Response time exceeds maximum acceptable for >10% of requests
3. Critical bugs affecting >10% of users
4. User satisfaction score drops >30%
5. Token costs exceed budget by >50%

### Rollback Procedure

1. **Immediate**: Flip feature flag to disable agent execution for all users
2. **Within 1 hour**: Verify traditional services operational
3. **Within 4 hours**: Communicate to users about temporary reversion
4. **Within 24 hours**: Root cause analysis and remediation plan
5. **Within 1 week**: Fix and re-deploy OR continue with traditional services

### Data Preservation

- All agent execution logs preserved for analysis
- User preference data maintained for future use
- Workflow execution history archived
- No data loss during rollback

---

## Conclusion

This migration to Claude Agent SDK represents a **transformational upgrade** from a traditional web application to an **autonomous AI agent system**. The phased approach minimizes risk while delivering incremental value.

### Key Benefits

1. **For Users**: More proactive, intelligent, and time-saving assistance
2. **For Development**: Faster feature development, reduced maintenance, better scalability
3. **For Business**: Competitive differentiation, higher user retention, reduced support burden

### Next Steps

1. **Review and Approve**: Stakeholder review of migration plan
2. **Resource Allocation**: Assign development team for 16-week timeline
3. **Environment Setup**: Week 1 infrastructure preparation
4. **Kickoff**: Begin Phase 1 foundation work

### Timeline Summary

- **Weeks 1-4**: Foundation & Infrastructure
- **Weeks 5-12**: Core Agent Development (Email, Document, Industry, Schedule)
- **Weeks 13-16**: Master Agent, Workflow Learning, Production Deployment
- **Total**: 16 weeks to production-ready agent system

**Estimated Effort**: 3-4 full-time developers for 4 months

**Expected ROI**: 5x improvement in user productivity, 3x faster feature development, 70% reduction in integration complexity

---

*Document Version: 1.0*
*Created: 2025-01-13*
*Status: Draft for Review*
