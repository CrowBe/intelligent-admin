# Implementation Plan: Agent SDK Evaluation

## Executive Summary

**Decision:** Experiment first, commit later.
**Timeline:** 2 weeks validation, then decide next steps.
**Investment:** $50 budget, 1 developer, minimal risk.

## What We're NOT Doing

❌ **16-week migration** - Too much commitment without validation
❌ **Complete rewrite** - Current architecture works
❌ **5 specialized agents** - Premature, unproven value
❌ **Big-bang deployment** - Too risky

## What We ARE Doing

✅ **2-week experiment** - Validate before committing
✅ **Measure everything** - Data-driven decisions
✅ **Easy rollback** - No damage if experiments fail
✅ **Clear success criteria** - No ambiguity

---

## The Plan in 3 Steps

### Step 1: Week 1 - MCP Server Experiment (Days 1-5)

**Question:** Does a Gmail MCP server simplify our email integration?

**What to build:**
```
mcp-servers/gmail-intelligence/
├── package.json
├── src/
│   ├── index.ts          # MCP server implementation
│   ├── tools/
│   │   ├── fetch_inbox.ts
│   │   ├── analyze_urgency.ts
│   │   └── create_draft.ts
│   └── types.ts
└── tsconfig.json
```

**Success criteria:**
- ✅ Reduces Gmail integration code >50% (from 423 lines)
- ✅ Maintains 90% urgency detection accuracy
- ✅ Response time <5s
- ✅ Completed in ≤5 days

**Comparison baseline:**
- Current: `backend/src/services/emailUrgencyDetection.ts` (423 lines)
- Measure: Lines of code, response time, accuracy, developer experience

**If successful:** Continue to Week 2
**If failed:** Document why, improve existing service instead

---

### Step 2: Week 2 - Agent Orchestration Experiment (Days 6-10)

**Question:** Does an agent improve multi-step workflow orchestration?

**What to build:**
```
agents/
├── base/
│   └── BaseAgent.ts       # Core agent functionality
├── email/
│   └── EmergencyJobAgent.ts  # Single workflow agent
└── shared/
    └── types.ts
```

**Test workflow:**
Emergency job handling:
1. Analyze email urgency
2. Check calendar availability
3. Verify industry compliance requirements
4. Draft response with scheduling options
5. Notify user

**Success criteria:**
- ✅ Agent code simpler than manual orchestration
- ✅ Better edge case handling
- ✅ Response time <10s
- ✅ Completed in ≤5 days

**Comparison baseline:**
- Current: Manual service orchestration (multiple API calls)
- Measure: Code complexity, reliability, error handling, developer experience

**If successful:** Agents add value for complex workflows
**If failed:** Use MCP servers without Agent SDK

---

### Step 3: Decision Point (Day 11)

**Based on experiment results, choose ONE path:**

#### **Path A: Both MCP + Agents Succeed** → Hybrid Approach
- Timeline: 4-6 weeks additional
- Scope: MCP for all integrations + 2-3 agents for complex workflows
- Monthly cost: ~$60 (save 64%)
- Next: Create scoped migration plan

#### **Path B: Only MCP Succeeds** → MCP-Only Adoption
- Timeline: 2-3 weeks additional
- Scope: Replace Gmail/Calendar/Document API calls with MCP servers
- Monthly cost: ~$54 (save 67%)
- Next: Create MCP rollout plan

#### **Path C: Neither Succeeds** → Improve Current Architecture
- Timeline: 0 weeks migration
- Scope: Enhance existing services, better orchestration layer
- Monthly cost: $165 (current)
- Next: Document learnings, continue Phase 2 features

#### **Path D: Only Agents Succeed** → Re-evaluate
- Unlikely scenario
- Would suggest MCP wasn't properly implemented
- Action: Revisit Week 1 experiment

---

## Immediate Next Steps (Before Starting)

### Day 0: Preparation (2-4 hours)

**1. Get Anthropic API Key**
- Sign up at https://console.anthropic.com/
- Create API key: "intelligent-admin-experiments"
- Set spending limit: $50/month
- Copy key (starts with "sk-ant-")

**2. Update Environment Configuration**
```bash
# backend/.env
ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_TIMEOUT=60000
```

**3. Update backend/src/config/env.ts**
```typescript
// Add to validation schema
ANTHROPIC_API_KEY: str({
  default: '',
  desc: 'Anthropic API key for Claude Agent SDK'
}),
ANTHROPIC_MODEL: str({
  default: 'claude-3-5-sonnet-20241022',
  desc: 'Anthropic Claude model to use'
}),
ANTHROPIC_TIMEOUT: num({
  default: 60000,
  desc: 'Anthropic API timeout in milliseconds'
}),
```

**4. Create Experiment Branch**
```bash
git checkout -b experiment/mcp-agent-validation
```

**5. Document Current Baseline**
Create `docs/experiments/baseline-metrics.md`:
```markdown
# Baseline Metrics (Pre-Experiment)

## Email Urgency Detection Service

**File:** backend/src/services/emailUrgencyDetection.ts
- Lines of code: 423
- Dependencies: @prisma/client, zod
- Average response time: ~2s
- Accuracy: 90% (based on user corrections)
- Error rate: <1%

## Current User Flow
1. User receives email
2. Backend analyzes urgency (emailUrgencyDetection.ts)
3. Result stored in database
4. Frontend displays categorized email

## Pain Points
- [ ] List specific pain points in current implementation
- [ ] What's hardest to maintain?
- [ ] Where do bugs occur most?
- [ ] What takes longest to implement new features?
```

**6. Set Up Experiment Tracking**
Create `docs/experiments/week1-mcp-results.md`:
```markdown
# Week 1: Gmail MCP Server Experiment

## Hypothesis
MCP server will simplify Gmail integration vs custom service.

## Success Criteria
- [ ] Code reduction >50%
- [ ] Accuracy ≥90%
- [ ] Response time <5s
- [ ] Completed in ≤5 days

## Daily Log

### Day 1: [Date]
**Goal:** Environment setup, MCP server scaffolding
**Actual:**
**Blockers:**
**Notes:**

### Day 2: [Date]
**Goal:** Implement fetch_inbox tool
**Actual:**
**Blockers:**
**Notes:**

[...continue for Days 3-5]

## Results
[Fill in after Week 1]

## Decision
- [ ] Continue to Week 2
- [ ] Stop, improve existing service

**Reasoning:**
```

---

## Week 1 Detailed Plan

### Day 1: Setup & Scaffolding (6-8 hours)

**Morning:**
1. Install dependencies
   ```bash
   cd mcp-servers
   mkdir gmail-intelligence
   cd gmail-intelligence
   npm init -y
   npm install @modelcontextprotocol/sdk typescript @types/node
   npm install googleapis @google-cloud/local-auth
   ```

2. Create basic MCP server structure
   ```typescript
   // mcp-servers/gmail-intelligence/src/index.ts
   import { Server } from '@modelcontextprotocol/sdk/server/index.js';
   import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

   const server = new Server({
     name: 'gmail-intelligence-server',
     version: '1.0.0',
   }, {
     capabilities: {
       tools: {},
       resources: {}
     }
   });

   // TODO: Register tools
   // TODO: Register resources

   const transport = new StdioServerTransport();
   await server.connect(transport);
   ```

**Afternoon:**
3. Set up Gmail API authentication (reuse existing OAuth)
4. Test basic connection to Gmail API
5. **Checkpoint:** Can we connect to Gmail via MCP server?

---

### Day 2: Implement fetch_inbox Tool (6-8 hours)

**Goal:** Replace manual Gmail fetching with MCP tool

**Morning:**
1. Implement `fetch_inbox` tool
   ```typescript
   server.setRequestHandler(ListToolsRequestSchema, async () => ({
     tools: [{
       name: 'fetch_inbox',
       description: 'Fetch emails from Gmail inbox',
       inputSchema: {
         type: 'object',
         properties: {
           maxResults: { type: 'number', default: 50 },
           query: { type: 'string' }
         }
       }
     }]
   }));

   server.setRequestHandler(CallToolRequestSchema, async (request) => {
     if (request.params.name === 'fetch_inbox') {
       // Fetch from Gmail API
       // Format response
       // Return emails
     }
   });
   ```

**Afternoon:**
2. Test tool from backend route
3. Compare response format to existing service
4. Measure performance
5. **Checkpoint:** Is fetch_inbox working correctly?

---

### Day 3: Implement analyze_urgency Tool (6-8 hours)

**Goal:** Use Claude to analyze email urgency

**Morning:**
1. Install Anthropic SDK
   ```bash
   npm install @anthropic-ai/sdk
   ```

2. Implement `analyze_urgency` tool
   ```typescript
   import Anthropic from '@anthropic-ai/sdk';

   const anthropic = new Anthropic({
     apiKey: process.env.ANTHROPIC_API_KEY,
   });

   // In tool handler
   const analysis = await anthropic.messages.create({
     model: 'claude-3-5-sonnet-20241022',
     max_tokens: 1024,
     messages: [{
       role: 'user',
       content: `Analyze email urgency for Australian trade business...`
     }]
   });
   ```

**Afternoon:**
3. Test urgency detection
4. Compare accuracy to existing emailUrgencyDetection.ts
5. Measure token usage and cost
6. **Checkpoint:** Is accuracy ≥90%?

---

### Day 4: Implement create_draft Tool (6-8 hours)

**Morning:**
1. Implement `create_draft` tool using Gmail API
2. Test draft creation

**Afternoon:**
3. Integration testing: fetch → analyze → draft workflow
4. Performance testing: measure end-to-end time
5. **Checkpoint:** Does workflow complete in <5s?

---

### Day 5: Comparison & Decision (6-8 hours)

**Morning:**
1. Count lines of code: MCP server vs existing service
2. Run accuracy tests: compare MCP vs existing
3. Performance testing: response times, token usage
4. Developer experience: ease of adding new features

**Afternoon:**
5. Document results in `docs/experiments/week1-mcp-results.md`
6. Calculate metrics:
   - Code reduction: (423 - new_lines) / 423 * 100%
   - Accuracy: test_correct / test_total * 100%
   - Performance: avg_response_time
7. **Go/No-Go Decision:**
   - If all criteria met → Continue to Week 2
   - If any criteria failed → Document why, stop experiments

---

## Week 2 Detailed Plan

### Only execute if Week 1 succeeds

### Day 6: Agent SDK Setup (6-8 hours)

1. Install Agent SDK
   ```bash
   cd agents
   npm init -y
   npm install @anthropic-ai/claude-agent-sdk
   ```

2. Create base agent structure
3. Connect agent to MCP server from Week 1
4. Test basic agent execution

---

### Day 7-8: Emergency Job Agent Implementation (12-16 hours)

1. Define emergency workflow steps
2. Implement agent with tool calling
3. Test workflow orchestration
4. Compare to manual orchestration

---

### Day 9: Integration & Performance Testing (6-8 hours)

1. End-to-end testing
2. Edge case testing
3. Performance measurement
4. Code complexity comparison

---

### Day 10: Final Decision (6-8 hours)

1. Document results in `docs/experiments/week2-agent-results.md`
2. Compare agent vs manual orchestration
3. Make final decision: Path A/B/C/D
4. Create next phase plan based on decision

---

## Success Metrics Template

Track these for each experiment:

### Code Complexity
- **Lines of code:** [Before] → [After]
- **Number of files:** [Before] → [After]
- **Dependencies:** [Before] → [After]
- **Cyclomatic complexity:** [Before] → [After]

### Performance
- **Response time (p50):** [Before] → [After]
- **Response time (p95):** [Before] → [After]
- **Token usage:** N/A → [After]
- **Cost per operation:** [Before] → [After]

### Reliability
- **Error rate:** [Before] → [After]
- **Edge cases handled:** [Before] → [After]
- **Retry logic needed:** [Before] → [After]

### Developer Experience
- **Time to understand code:** [Before] → [After]
- **Time to add new feature:** [Before] → [After]
- **Ease of debugging:** [Before] → [After]
- **Documentation clarity:** [Before] → [After]

---

## Risk Management

### What Could Go Wrong?

**Week 1 Risks:**
- **MCP server doesn't connect:** Test Gmail API first, verify OAuth
- **Accuracy worse than existing:** Adjust prompts, try different models
- **Too slow:** Optimize token usage, use faster model
- **Takes >5 days:** Time-box aggressively, cut scope if needed

**Week 2 Risks:**
- **Agent SDK complex:** Start simpler, minimal viable agent
- **Orchestration unreliable:** Add retries, error handling
- **Context limits exceeded:** Implement context compaction
- **Takes >5 days:** Same as Week 1

### Rollback Plan

**If Week 1 fails:**
1. Delete `mcp-servers/gmail-intelligence/` (30 seconds)
2. Keep existing `emailUrgencyDetection.ts`
3. Document learnings in experiment results
4. Total rollback time: <1 hour

**If Week 2 fails:**
1. Keep MCP server from Week 1 (if it succeeded)
2. Delete agent code
3. Use MCP servers directly from backend
4. Total rollback time: <1 hour

---

## Budget & Resource Allocation

### Time
- **Week 1:** 5 days × 6-8 hours = 30-40 hours
- **Week 2:** 5 days × 6-8 hours = 30-40 hours
- **Total:** 60-80 hours (2 weeks)

### Cost
- **API calls:** $5-10 actual (budgeted $50)
- **Developer time:** 80 hours × $100/hr = $8,000
- **Total investment:** ~$8,000

### People
- **1 developer** (full-time for 2 weeks)
- **Optional:** 1 reviewer for checkpoints

---

## Post-Experiment: Next Steps by Path

### If Path A (MCP + Agents) - 4-6 Weeks

**Week 3-4: Additional MCP Servers**
- Calendar MCP server
- Document processing MCP server
- Industry knowledge MCP server

**Week 5-6: Additional Agents**
- Document analysis agent
- Morning brief agent
- Deploy to production with feature flags

---

### If Path B (MCP Only) - 2-3 Weeks

**Week 3: Calendar & Document MCP Servers**
- Google Calendar integration
- Document processing integration

**Week 4: Production Deployment**
- Replace existing API calls with MCP tools
- Feature flag rollout
- Monitor performance

---

### If Path C (Neither) - 0 Weeks Migration

**Immediately:**
- Document why experiments failed
- Share learnings with team

**Next Quarter:**
- Improve existing services
- Continue Phase 2 features (Morning Brief, industry knowledge)
- Focus on user stories, not architecture

---

## Communication Plan

### Daily Updates
Post in team channel:
```
Day [N] Checkpoint:
✅ Completed: [what was done]
🚧 In Progress: [current work]
⚠️ Blockers: [any issues]
📊 Metrics: [any measurements]
```

### Weekly Decision Points

**End of Week 1:**
```
Week 1 Results:
Code reduction: [X]%
Accuracy: [X]%
Performance: [X]s
Decision: [Continue/Stop]
Reasoning: [why]
```

**End of Week 2:**
```
Week 2 Results:
Agent vs Manual: [comparison]
Edge cases: [handled/not handled]
Developer experience: [better/worse/same]
Final Decision: Path [A/B/C/D]
Next Steps: [specific plan]
```

---

## Definition of Done

### Week 1 Complete When:
- ✅ MCP server implemented
- ✅ All 3 tools working (fetch, analyze, draft)
- ✅ Metrics measured and documented
- ✅ Comparison to baseline complete
- ✅ Go/No-Go decision made
- ✅ Results documented in `docs/experiments/week1-mcp-results.md`

### Week 2 Complete When:
- ✅ Emergency job agent implemented
- ✅ Workflow orchestration tested
- ✅ Metrics measured and documented
- ✅ Comparison to manual orchestration complete
- ✅ Final path decision made
- ✅ Results documented in `docs/experiments/week2-agent-results.md`

### Experiments Complete When:
- ✅ Both weeks documented
- ✅ Clear path forward identified
- ✅ Next phase plan created (if proceeding)
- ✅ OR learnings documented (if stopping)
- ✅ Budget and timeline actuals recorded
- ✅ Team presentation given

---

## Approval Checklist

Before starting experiments:

- [ ] Anthropic API key obtained (spending limit: $50/month)
- [ ] Experiment branch created: `experiment/mcp-agent-validation`
- [ ] Baseline metrics documented
- [ ] Experiment tracking templates created
- [ ] Team notified of 2-week experiment
- [ ] Calendar blocked for focused work
- [ ] Rollback plan understood

---

## File Structure After Experiments

```
intelligent-admin/
├── docs/
│   ├── experiments/
│   │   ├── baseline-metrics.md
│   │   ├── week1-mcp-results.md
│   │   └── week2-agent-results.md
│   ├── agent-sdk-experiment-plan.md (this plan)
│   ├── MIGRATION-DECISION.md
│   ├── API-KEYS-AND-COSTS.md
│   └── claude-agent-sdk-migration-plan.md (reference only)
├── mcp-servers/          # NEW (if Week 1 succeeds)
│   └── gmail-intelligence/
├── agents/               # NEW (if Week 2 succeeds)
│   ├── base/
│   └── email/
├── backend/              # EXISTING (unchanged)
└── frontend/             # EXISTING (unchanged)
```

---

## Summary

**What:** 2-week experiment to validate MCP servers and Agent SDK
**Why:** Prove value before committing to migration
**How:** Build incrementally, measure everything, decide based on data
**When:** Start immediately after approval
**Who:** 1 developer, full-time for 2 weeks
**Cost:** $50 API budget, ~$8K developer time

**Success:** Data-driven decision on architecture direction
**Failure:** Documented learnings, improved current architecture

**This is an experiment, not a migration.**
**We only migrate if experiments prove value.**

---

## Ready to Start?

✅ **Yes** → Proceed to Day 0 preparation
❌ **No** → What questions remain?
🤔 **Maybe** → What would give you confidence?
