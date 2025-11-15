# Migration Decision Framework

> **Purpose:** One-page decision framework for Agent SDK evaluation. Answers "Should we migrate?" with clear recommendation: experiment first, not full migration. Identifies the mismatch between user needs (assistance) and Agent SDK strengths (autonomy).

---

## Current Situation

**What works:**
- Phase 1 complete: React + Express.js + PostgreSQL monorepo
- Email urgency detection operational
- User stories defined (Dave the Electrician wants ASSISTED workflows)

**Proposed change:**
- Migrate to Claude Agent SDK
- Original plan: Complete rewrite with multiple specialized agents

## The Critical Question

**Is Agent SDK the solution to a problem we actually have?**

### User Stories Say:
- "Review before sending" (not auto-send)
- "I want to understand the AI's reasoning"
- "Stay in control over final actions"

### Agent SDK Provides:
- Autonomous task execution
- Self-verification loops
- Proactive intelligence

**Mismatch:** Users want assistance, not autonomy.

## The Right Approach

### Don't Migrate. Experiment.

**Prove value first through structured experiments.**

### Week 1: MCP Server Experiment
- Build Gmail MCP server
- Compare to existing emailUrgencyDetection service
- Metrics: code complexity, performance, accuracy
- Decision: Continue or stop

### Week 2: Agent Orchestration Experiment (if Week 1 succeeds)
- Build emergency workflow agent
- Compare to manual orchestration
- Metrics: code simplicity, edge case handling
- Decision: Adopt, adapt, or abandon

### Possible Outcomes

1. **MCP + Agents both valuable** → Hybrid approach
2. **Only MCP valuable** → Add MCP servers only
3. **Neither valuable** → Improve existing services

## Decision Points

**After Week 1:**
- [ ] MCP reduced code complexity >50%? Yes/No
- [ ] MCP maintained performance? Yes/No
- [ ] MCP worth continuing? Yes/No

**After Week 2:**
- [ ] Agents simpler than manual orchestration? Yes/No
- [ ] Agents handle edge cases better? Yes/No
- [ ] Agents worth adopting? Yes/No

## What We Don't Need Yet

- ❌ 5 specialized agents
- ❌ Master orchestrator
- ❌ Database schema redesign
- ❌ Complete architecture rewrite

## What We Do Next

**Immediate:**
1. Create experiment branch: `experiment/mcp-agent-validation`
2. Document current email service baseline
3. Set success criteria for Experiment 1

**Week 1:**
4. Build Gmail MCP server
5. Integrate with existing backend
6. Measure and compare
7. Go/no-go decision

**Week 2 (if Week 1 succeeds):**
8. Build emergency workflow agent
9. Compare to manual approach
10. Final decision: adopt/adapt/abandon

## Success Criteria

**Experiment succeeds if:**
- At least ONE metric improves >30%
- NO metrics degrade >20%
- Developer experience better or same

**Experiment fails if:**
- No meaningful improvements
- Increased complexity
- Worse developer experience

## Related Documents

1. **IMPLEMENTATION-PLAN.md** - Detailed experiment execution plan
2. **agent-sdk-experiment-plan.md** - Strategic framework
3. **claude-agent-sdk-migration-critique.md** - Critical review of original approach
4. **claude-agent-sdk-migration-plan.md** - Technical reference (original detailed plan)

## Recommendation

**Start with experiments, not migration.**

- **Approach:** Validate assumptions through experiments
- **Fallback:** Continue with current approach (which works)
- **Decision:** Based on data, not assumptions

**Next action:** Create experiment branch and start Week 1.

---

*Remember: The best code is no code. The best migration is no migration.*
*Prove value first, commit later.*
