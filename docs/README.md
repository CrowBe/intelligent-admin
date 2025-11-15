# Documentation Index

> **Purpose:** Navigation guide for all Agent SDK evaluation documents. Start here to understand the document structure and read order based on your role.

---

## Read These Documents In Order

### 1. 📋 **START HERE: [MIGRATION-DECISION.md](./MIGRATION-DECISION.md)**
**One-page decision framework**
- Current state and what works
- Critical question: Is Agent SDK solving a real problem?
- User story mismatch: assistance vs autonomy
- Recommended approach: experiment first
- **Read time: 5 minutes**

### 2. 🧪 **[IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)**
**Detailed 2-week experiment plan with day-by-day instructions**
- Week 1: Gmail MCP server experiment
- Week 2: Agent orchestration experiment
- Success criteria, metrics, and decision points
- **Read time: 15 minutes**
- **Use this:** For execution guidance

### 3. 🎯 **[agent-sdk-experiment-plan.md](./agent-sdk-experiment-plan.md)**
**Strategic experiment framework**
- Why experiment before migrating
- Hypothesis testing approach
- Decision tree for different outcomes
- **Read time: 10 minutes**
- **Use this:** For understanding the "why"

### 4. 🔍 **[claude-agent-sdk-migration-critique.md](./claude-agent-sdk-migration-critique.md)**
**Critical review of premature planning**
- Problems with detailed planning before validation
- Missing critical questions
- Why experiment-first approach is better
- **Read time: 10 minutes**
- **Use this:** To understand what NOT to do

---

## Reference Documents

### 📚 **[claude-agent-sdk-migration-plan.md](./claude-agent-sdk-migration-plan.md)**
**Original comprehensive migration plan**
- ⚠️ **Reference only** - Contains premature implementation details
- Useful technical details about Agent SDK capabilities
- Good reference for implementation specifics after experiments succeed
- **Read time: 60 minutes**
- **Use this:** Only for technical reference if experiments prove successful

### 📖 **User Stories & Requirements**
- [user-stories.md](./user-stories.md) - Dave the Electrician's journey
- [development-plan.md](./development-plan.md) - Current Phase 2 plan
- [development-roadmap.md](./development-roadmap.md) - Long-term vision
- [system-architecture.md](./system-architecture.md) - Current architecture

---

## Quick Decision Matrix

**If you're a...**

### 👔 **Executive / Stakeholder**
Read in order:
1. MIGRATION-DECISION.md (5 min)
2. **Decision:** Approve 2-week experiment? Yes/No

### 👨‍💻 **Developer (Implementation)**
Read in order:
1. MIGRATION-DECISION.md (5 min)
2. IMPLEMENTATION-PLAN.md (15 min)
3. **Action:** Start Day 0 preparation

### 🎨 **Product Manager**
Read in order:
1. MIGRATION-DECISION.md (5 min)
2. user-stories.md (15 min)
3. agent-sdk-experiment-plan.md (10 min)
4. **Decision:** Does this align with user needs?

### 🔬 **Architect / Tech Lead**
Read in order:
1. claude-agent-sdk-migration-critique.md (10 min)
2. IMPLEMENTATION-PLAN.md (15 min)
3. system-architecture.md (15 min)
4. **Decision:** Technical approach sound?

---

## Key Decisions Made

### ✅ **What We're Doing**
- 2-week experiment to validate MCP and Agent SDK
- Week 1: Gmail MCP server
- Week 2: Agent orchestration (if Week 1 succeeds)
- Data-driven decision at end of each week

### ❌ **What We're NOT Doing**
- Complete migration before validation
- Full architecture rewrite
- 5 specialized agents + master orchestrator
- Big-bang deployment

### 💡 **Why This Approach**
- Current system works (Phase 1 complete)
- User stories need assistance, not autonomy
- Experiment first, commit later
- Migration should be for better architecture, proven through experiments

---

## Experiment Timeline

```
Week 1: MCP Server Experiment
├─ Day 0: Setup (API key, environment, branch)
├─ Day 1: MCP scaffolding
├─ Day 2: fetch_inbox tool
├─ Day 3: analyze_urgency tool
├─ Day 4: create_draft tool
└─ Day 5: Measure & decide → Continue or Stop

Week 2: Agent Experiment (if Week 1 succeeds)
├─ Day 6: Agent SDK setup
├─ Day 7-8: Emergency job agent
├─ Day 9: Testing & measurement
└─ Day 10: Final decision → Path A/B/C/D

Decision Point:
├─ Path A: MCP + Agents (hybrid approach)
├─ Path B: MCP only (simpler adoption)
├─ Path C: Neither (improve current)
└─ Path D: Re-evaluate
```

---

## Success Criteria Summary

### Week 1 (MCP Server)
- ✅ Code reduction >50% (from 423 lines)
- ✅ Accuracy ≥90%
- ✅ Response time <5s

### Week 2 (Agent)
- ✅ Simpler than manual orchestration
- ✅ Better edge case handling
- ✅ Response time <10s

---

## Questions?

### "Why experiment instead of just migrating?"
**Answer:** Current system works. User stories want assistance (human-in-loop), not autonomy. Need proof Agent SDK adds value before committing.

### "What if both experiments fail?"
**Answer:** We've validated current approach, documented learnings, and can improve existing architecture instead. No harm done.

### "What if only MCP succeeds?"
**Answer:** Best outcome - simpler integrations, faster adoption, no complex agent orchestration needed.

### "Can we skip experiments and jump to migration?"
**Answer:** No. That's how we get premature detailed plans without clear value. Experiments prove value first.

### "What happens after experiments?"
**Answer:** Depends on results. See IMPLEMENTATION-PLAN.md "Post-Experiment: Next Steps by Path"

---

## Document Status

| Document | Status | Purpose |
|----------|--------|---------|
| MIGRATION-DECISION.md | ✅ Final | One-page decision framework |
| IMPLEMENTATION-PLAN.md | ✅ Final | Day-by-day execution plan |
| agent-sdk-experiment-plan.md | ✅ Final | Strategic framework |
| claude-agent-sdk-migration-critique.md | ✅ Final | Critical review |
| claude-agent-sdk-migration-plan.md | ⚠️ Reference | Original detailed plan |
| README.md | ✅ Final | Navigation guide (this file) |

---

## Next Steps

**Ready to proceed?**

1. ✅ Read MIGRATION-DECISION.md (5 min)
2. ✅ Read IMPLEMENTATION-PLAN.md (15 min)
3. ✅ Get approval for 2-week experiment
4. ✅ Obtain Anthropic API key
5. ✅ Start Day 0 preparation
6. 🚀 Begin Week 1 experiment

**Not ready?**
- Review user stories (user-stories.md)
- Understand current architecture (system-architecture.md)
- Ask questions (create GitHub issue)

---

*Last updated: 2025-11-15*
*For questions: Review FAQ above or create GitHub issue*
