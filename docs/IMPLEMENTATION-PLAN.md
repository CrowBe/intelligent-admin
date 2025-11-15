# Implementation Plan: Agent SDK Evaluation

> **Purpose:** Step-by-step execution plan for 2-week Agent SDK experiments. Provides daily tasks, success criteria, and decision framework. Use this for hands-on implementation guidance.

---

## Overview

**Decision:** Experiment first, commit later.
**Timeline:** 2 weeks validation, then decide next steps.
**Approach:** Build incrementally, measure everything, decide based on data.

## What We're NOT Doing

❌ Complete migration before validation
❌ Big-bang deployment
❌ 5 specialized agents without proof
❌ Architecture rewrite without evidence

## What We ARE Doing

✅ Week 1: MCP server experiment (Gmail integration)
✅ Week 2: Agent orchestration experiment (if Week 1 succeeds)
✅ Measure and compare at each step
✅ Easy rollback if experiments fail

---

## The Plan in 3 Steps

### Step 1: Week 1 - MCP Server Experiment

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

**Comparison baseline:**
- Current: `backend/src/services/emailUrgencyDetection.ts` (423 lines)
- Measure: Lines of code, response time, accuracy, developer experience

**Outcome:**
- **If successful:** Continue to Week 2
- **If failed:** Document why, improve existing service instead

---

### Step 2: Week 2 - Agent Orchestration Experiment

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

**Test workflow - Emergency job handling:**
1. Analyze email urgency
2. Check calendar availability
3. Verify industry compliance requirements
4. Draft response with scheduling options
5. Notify user

**Success criteria:**
- ✅ Agent code simpler than manual orchestration
- ✅ Better edge case handling
- ✅ Response time <10s

**Comparison baseline:**
- Current: Manual service orchestration (multiple API calls)
- Measure: Code complexity, reliability, error handling

**Outcome:**
- **If successful:** Agents add value for complex workflows
- **If failed:** Use MCP servers without Agent SDK

---

### Step 3: Decision Point

**Based on experiment results, choose ONE path:**

#### **Path A: Both MCP + Agents Succeed** → Hybrid Approach
- Scope: MCP for all integrations + selective agents for complex workflows
- Next: Create scoped migration plan

#### **Path B: Only MCP Succeeds** → MCP-Only Adoption
- Scope: Replace Gmail/Calendar/Document API calls with MCP servers
- Next: Create MCP rollout plan

#### **Path C: Neither Succeeds** → Improve Current Architecture
- Scope: Enhance existing services, better orchestration layer
- Next: Document learnings, continue Phase 2 features

#### **Path D: Only Agents Succeed** → Re-evaluate
- Unlikely scenario
- Action: Revisit Week 1 experiment

---

## Immediate Next Steps

### Day 0: Preparation

**1. Get Anthropic API Key**
- Sign up at https://console.anthropic.com/
- Create API key: "intelligent-admin-experiments"
- Copy key (starts with "sk-ant-")

**2. Update Environment Configuration**
```bash
# backend/.env
ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-sonnet-4  # Use latest available model
```

**3. Update backend/src/config/env.ts**
```typescript
// Add to validation schema
ANTHROPIC_API_KEY: str({
  default: '',
  desc: 'Anthropic API key for Claude Agent SDK'
}),
ANTHROPIC_MODEL: str({
  default: 'claude-sonnet-4',  // Check docs.anthropic.com for latest
  desc: 'Anthropic Claude model to use'
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
- Average response time: ~2s
- Accuracy: 90%
- Error rate: <1%

## Pain Points
- List specific pain points in current implementation
- What's hardest to maintain?
- Where do bugs occur most?
```

**6. Set Up Experiment Tracking**
Create experiment log templates for daily progress tracking.

---

## Week 1 Detailed Plan

### Day 1: Setup & Scaffolding

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
3. Set up Gmail API authentication (reuse existing OAuth)
4. Test basic connection to Gmail API
5. **Checkpoint:** Can we connect to Gmail via MCP server?

---

### Day 2: Implement fetch_inbox Tool

**Goal:** Replace manual Gmail fetching with MCP tool

1. Implement `fetch_inbox` tool
2. Test tool from backend route
3. Compare response format to existing service
4. Measure performance
5. **Checkpoint:** Is fetch_inbox working correctly?

---

### Day 3: Implement analyze_urgency Tool

**Goal:** Use Claude to analyze email urgency

1. Install Anthropic SDK
   ```bash
   npm install @anthropic-ai/sdk
   ```

2. Implement `analyze_urgency` tool using Claude API
3. Test urgency detection
4. Compare accuracy to existing emailUrgencyDetection.ts
5. **Checkpoint:** Is accuracy ≥90%?

---

### Day 4: Implement create_draft Tool

1. Implement `create_draft` tool using Gmail API
2. Test draft creation
3. Integration testing: fetch → analyze → draft workflow
4. Performance testing: measure end-to-end time
5. **Checkpoint:** Does workflow complete in <5s?

---

### Day 5: Comparison & Decision

1. Count lines of code: MCP server vs existing service
2. Run accuracy tests
3. Performance testing: response times
4. Developer experience assessment
5. Document results in `docs/experiments/week1-mcp-results.md`
6. Calculate metrics:
   - Code reduction: (423 - new_lines) / 423 × 100%
   - Accuracy: test_correct / test_total × 100%
7. **Go/No-Go Decision:**
   - If all criteria met → Continue to Week 2
   - If any criteria failed → Document why, stop experiments

---

## Week 2 Detailed Plan

### Only execute if Week 1 succeeds

### Day 6: Agent SDK Setup

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

### Day 7-8: Emergency Job Agent Implementation

1. Define emergency workflow steps
2. Implement agent with tool calling
3. Test workflow orchestration
4. Compare to manual orchestration

---

### Day 9: Integration & Performance Testing

1. End-to-end testing
2. Edge case testing
3. Performance measurement
4. Code complexity comparison

---

### Day 10: Final Decision

1. Document results in `docs/experiments/week2-agent-results.md`
2. Compare agent vs manual orchestration
3. Make final decision: Path A/B/C/D
4. Create next phase plan based on decision

---

## Success Metrics Template

### Code Complexity
- **Lines of code:** [Before] → [After]
- **Number of files:** [Before] → [After]
- **Dependencies:** [Before] → [After]

### Performance
- **Response time (p50):** [Before] → [After]
- **Response time (p95):** [Before] → [After]

### Reliability
- **Error rate:** [Before] → [After]
- **Edge cases handled:** [Before] → [After]

### Developer Experience
- **Time to understand code:** [Before] → [After]
- **Time to add new feature:** [Before] → [After]
- **Ease of debugging:** [Before] → [After]

---

## Risk Management

### What Could Go Wrong?

**Week 1 Risks:**
- **MCP server doesn't connect:** Test Gmail API first, verify OAuth
- **Accuracy worse than existing:** Adjust prompts, try different models
- **Too slow:** Optimize, use faster model

**Week 2 Risks:**
- **Agent SDK complex:** Start simpler, minimal viable agent
- **Orchestration unreliable:** Add retries, error handling
- **Context limits exceeded:** Implement context compaction

### Rollback Plan

**If Week 1 fails:**
1. Delete `mcp-servers/gmail-intelligence/`
2. Keep existing `emailUrgencyDetection.ts`
3. Document learnings

**If Week 2 fails:**
1. Keep MCP server from Week 1 (if it succeeded)
2. Delete agent code
3. Use MCP servers directly from backend

**Total rollback time:** <1 hour per experiment

---

## Post-Experiment: Next Steps by Path

### If Path A (MCP + Agents)

**Additional MCP Servers:**
- Calendar MCP server
- Document processing MCP server
- Industry knowledge MCP server

**Additional Agents:**
- Document analysis agent
- Morning brief agent
- Deploy to production with feature flags

---

### If Path B (MCP Only)

**Additional MCP Servers:**
- Google Calendar integration
- Document processing integration

**Production Deployment:**
- Replace existing API calls with MCP tools
- Feature flag rollout
- Monitor performance

---

### If Path C (Neither)

**Immediate:**
- Document why experiments failed
- Share learnings with team

**Next:**
- Improve existing services
- Continue Phase 2 features
- Focus on user stories, not architecture

---

## Definition of Done

### Week 1 Complete When:
- ✅ MCP server implemented
- ✅ All 3 tools working (fetch, analyze, draft)
- ✅ Metrics measured and documented
- ✅ Comparison to baseline complete
- ✅ Go/No-Go decision made
- ✅ Results documented

### Week 2 Complete When:
- ✅ Emergency job agent implemented
- ✅ Workflow orchestration tested
- ✅ Metrics measured and documented
- ✅ Comparison complete
- ✅ Final path decision made
- ✅ Results documented

### Experiments Complete When:
- ✅ Both weeks documented
- ✅ Clear path forward identified
- ✅ Next phase plan created (if proceeding) OR learnings documented (if stopping)

---

## Approval Checklist

Before starting experiments:

- [ ] Anthropic API key obtained
- [ ] Experiment branch created: `experiment/mcp-agent-validation`
- [ ] Baseline metrics documented
- [ ] Experiment tracking templates created
- [ ] Team notified
- [ ] Rollback plan understood

---

## File Structure After Experiments

```
intelligent-admin/
├── docs/
│   └── experiments/
│       ├── baseline-metrics.md
│       ├── week1-mcp-results.md
│       └── week2-agent-results.md
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

**Success:** Data-driven decision on architecture direction
**Failure:** Documented learnings, improved current architecture

**This is an experiment, not a migration.**
**We only migrate if experiments prove value.**
