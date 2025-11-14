# Agent SDK Experiment Plan

## Hypothesis

MCP servers and/or Claude Agent SDK can reduce integration complexity and improve workflow orchestration compared to our current backend architecture.

## Why Experiment First?

**Current state works:**
- Phase 1 complete (authentication, chat, database)
- Phase 2 in progress (email intelligence, industry knowledge)
- User stories emphasize ASSISTED workflows, not autonomous agents

**Before committing 16 weeks, validate in 2 weeks.**

## Experiments

### Experiment 1: MCP Server Value (Week 1)

**Question:** Does a Gmail MCP server simplify our email integration?

**Current baseline:**
- `backend/src/services/emailUrgencyDetection.ts` - 423 lines
- Custom Gmail API integration code
- Response time: ~2s, Accuracy: 90%

**What to build:**
- Simple Gmail MCP server with 3 tools:
  - `fetch_inbox` - Get recent emails
  - `analyze_urgency` - Analyze email urgency
  - `create_draft` - Create draft response
- Integrate into existing `/api/v1/emails` route
- No frontend changes

**Success criteria:**
- ✅ Reduces Gmail integration code by >50%
- ✅ Maintains 90% urgency detection accuracy
- ✅ Response time stays <5s
- ✅ Completed in <5 days

**Failure criteria:**
- ❌ Code complexity same or worse
- ❌ Performance degradation
- ❌ Takes >5 days to implement

**If successful:** MCP servers add value, continue to Experiment 2
**If failed:** Document why, improve existing service instead

### Experiment 2: Agent Orchestration Value (Week 2)

**Question:** Does an agent improve multi-step workflow orchestration?

**Current baseline:**
- Emergency job workflow requires manual coordination:
  1. Email analysis (emailUrgencyDetection service)
  2. Calendar check (future service)
  3. Industry compliance check (industryService)
  4. Draft response
- Total: ~5s, 85% reliability

**What to build:**
- Single agent for "Emergency Job Handling" workflow
- Agent uses MCP tools from Experiment 1
- Compare agent orchestration vs manual service calls

**Success criteria:**
- ✅ Agent code simpler than manual orchestration (fewer lines, clearer logic)
- ✅ Handles edge cases better (missed steps, errors)
- ✅ Response time <10s
- ✅ Completed in <5 days

**Failure criteria:**
- ❌ More complex than manual orchestration
- ❌ Worse reliability or error handling
- ❌ Takes >5 days to implement

**If successful:** Agents add value for complex workflows
**If failed:** Use MCP servers without Agent SDK

## Decision Tree

```
After Week 1:
├─ MCP Success → Continue to Week 2
└─ MCP Failure → Stop, improve existing services

After Week 2:
├─ Both MCP + Agents successful → Hybrid approach (MCP + selective agents)
├─ Only MCP successful → Add MCP servers to existing backend
├─ Only Agents successful → Re-evaluate (unlikely)
└─ Both failed → Document learnings, continue with current architecture
```

## Metrics to Track

### Code Complexity
- Lines of code (LoC)
- Number of files
- Cyclomatic complexity
- Dependencies

### Performance
- Response time (p50, p95, p99)
- Token usage (if using LLM)
- Database queries
- API calls

### Reliability
- Error rate
- Edge case handling
- Retry logic needed
- Fallback mechanisms

### Developer Experience
- Time to add new feature
- Ease of debugging
- Test coverage achievable
- Documentation clarity

## Resources

**Time:** 2 weeks maximum (5 days per experiment)
**Team:** 1 developer
**Budget:** $500 API credits (OpenAI + Anthropic)

## Experiment Setup

### Week 1 Tasks

**Day 1-2: Environment Setup**
- Install `@modelcontextprotocol/sdk`
- Create `mcp-servers/gmail-intelligence/` directory
- Set up comparison framework (old vs new metrics)
- Document current baseline metrics

**Day 3-4: MCP Implementation**
- Build Gmail MCP server
- Implement 3 MCP tools
- Add MCP server to backend configuration
- Test integration with existing route

**Day 5: Evaluation**
- Run comparison tests
- Measure all metrics
- Document results
- Make go/no-go decision

### Week 2 Tasks (If Week 1 Successful)

**Day 1-2: Agent Setup**
- Install `@anthropic-ai/claude-agent-sdk`
- Create basic agent structure
- Connect agent to MCP server from Week 1

**Day 3-4: Agent Implementation**
- Build emergency job workflow agent
- Test against manual orchestration
- Handle edge cases

**Day 5: Evaluation**
- Run comparison tests
- Measure all metrics
- Document results
- Make final decision

## Comparison Framework

### Template for Each Experiment

```markdown
## Experiment [N]: [Name]

### Before (Current Approach)
- Code: [lines of code, files]
- Performance: [response time]
- Reliability: [error rate]
- Complexity: [cyclomatic complexity]

### After (New Approach)
- Code: [lines of code, files]
- Performance: [response time]
- Reliability: [error rate]
- Complexity: [cyclomatic complexity]

### Comparison
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| LoC | | | |
| Response Time | | | |
| Error Rate | | | |
| Complexity | | | |

### Decision
- [ ] Success (continue)
- [ ] Failure (rollback)

### Reasoning
[Why this decision was made]

### Next Steps
[What to do next]
```

## Post-Experiment Actions

### If Both Experiments Succeed

**Create minimal migration plan:**
1. Add MCP servers for all integrations (Gmail, Calendar, Documents)
2. Build 1-2 agents for complex workflows only
3. Keep existing services for simple operations
4. Timeline: 4-6 weeks (not 16)

### If Only MCP Succeeds

**MCP-only adoption:**
1. Replace API integrations with MCP servers
2. Keep existing service orchestration
3. No Agent SDK needed
4. Timeline: 2-3 weeks

### If Experiments Fail

**Continue current approach:**
1. Improve existing services
2. Add better orchestration layer (not agents)
3. Focus on Phase 2 features
4. Document why migration was rejected

## Success Definition

**Experiment is successful if:**
- At least ONE metric significantly improves (>30%)
- NO metrics significantly degrade (>20%)
- Developer experience is better or same
- Implementation time within budget (<5 days per experiment)

**Experiment fails if:**
- No meaningful improvements
- Any metric degrades significantly
- Implementation time exceeds 5 days
- Increased complexity without benefit

## Rollback Plan

### If Experiment 1 Fails
1. Delete `mcp-servers/gmail-intelligence/`
2. Keep existing `emailUrgencyDetection.ts`
3. Document learnings in `docs/experiments/mcp-gmail-failed.md`

### If Experiment 2 Fails
1. Keep MCP server from Experiment 1 (if it succeeded)
2. Use MCP servers directly from backend routes
3. No Agent SDK adoption
4. Document learnings in `docs/experiments/agent-orchestration-failed.md`

## Next Immediate Steps

1. **Read user stories again** - Ensure experiments align with Dave's needs
2. **Set up experiment branch** - `experiment/mcp-agent-validation`
3. **Document current baseline** - Measure existing email service performance
4. **Day 1: Start Experiment 1** - Build minimal Gmail MCP server

## Questions to Answer

Before starting experiments:

1. **Do users need autonomous agents or assisted workflows?**
   - Review user stories: Dave wants to "review before sending"
   - Answer: Assisted workflows (human in loop)

2. **What's the real pain point in current architecture?**
   - Manual API integration code?
   - Service orchestration complexity?
   - Answer: Determine from codebase review

3. **What's the smallest change that adds value?**
   - Full Agent SDK migration?
   - MCP servers only?
   - Better service layer?
   - Answer: Run experiments to find out

## Commitment

**Maximum investment:** 2 weeks, 1 developer, $500 API credits
**Minimum value required:** >30% improvement in at least one metric
**Decision point:** End of Week 1, End of Week 2
**Rollback time:** <1 hour per experiment

---

**This is an experiment plan, not a migration plan.**
**Migration only happens if experiments prove value.**
