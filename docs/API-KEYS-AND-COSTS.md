# API Keys & Cost Analysis

## Current System API Requirements

### Already Have
- ✅ **OpenAI API Key** - Currently using GPT-4-turbo-preview
- ✅ **Google OAuth Credentials** - Gmail integration (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET)
- ✅ **PostgreSQL Database** - No API costs, just hosting
- ⚠️ **Redis** (Optional) - Currently configured but not required

### Current Monthly Costs (Estimated)

**OpenAI API - GPT-4-turbo-preview:**
- Input: $10.00 / 1M tokens
- Output: $30.00 / 1M tokens

**Typical Usage (10 users, Phase 1):**
- Email analysis: ~500 tokens input, ~200 tokens output per email
- 10 users × 50 emails/day = 500 emails/day
- Monthly: 15,000 emails × (500 input + 200 output)
- Input: 7.5M tokens = **$75/month**
- Output: 3M tokens = **$90/month**
- **Total: ~$165/month**

---

## Agent SDK Migration API Requirements

### New Requirements

#### 1. Anthropic Claude API Key (Required)

**Why needed:**
- Claude Agent SDK uses Anthropic's Claude models
- Cannot use OpenAI models with Agent SDK

**Model options:**
- Claude 3.5 Sonnet (recommended for agents)
- Claude 3 Opus (most capable, most expensive)
- Claude 3 Haiku (fast, cheapest)

**Pricing (Claude 3.5 Sonnet):**
- Input: $3.00 / 1M tokens
- Output: $15.00 / 1M tokens

**Note:** Cheaper than GPT-4-turbo!

#### 2. Google OAuth Credentials (Already Have)

**No change needed** - Same Gmail API integration

#### 3. PostgreSQL Database (Already Have)

**May need:**
- Additional tables for agent execution tracking
- More storage for agent context
- No additional API costs

### Optional Requirements

#### 4. Google Calendar API (If implementing Schedule Agent)

**Cost:** FREE (included with Google Workspace/Gmail OAuth)
**Already have:** OAuth credentials cover Calendar API

#### 5. Document Processing APIs (If implementing Document Agent)

**Options:**
- Tesseract.js - FREE (open source OCR)
- Google Cloud Vision API - $1.50 per 1,000 images
- AWS Textract - $1.50 per 1,000 pages

**Recommendation:** Start with Tesseract.js (free)

---

## Cost Comparison: Current vs Agent SDK

### Experiment Phase (2 Weeks)

**Week 1: Gmail MCP Server Experiment**

Expected usage:
- Testing with 1 developer account
- ~100 emails for testing
- MCP tools: fetch_inbox, analyze_urgency, create_draft

Token estimate:
- Input: 100 emails × 1,000 tokens = 100K tokens
- Output: 100 emails × 300 tokens = 30K tokens
- Additional testing/debugging: 2× multiplier = 200K input, 60K output

**Cost (Claude 3.5 Sonnet):**
- Input: 200K tokens × $3.00 / 1M = **$0.60**
- Output: 60K tokens × $15.00 / 1M = **$0.90**
- **Total Week 1: ~$1.50**

**Week 2: Agent Orchestration Experiment**

Expected usage:
- Emergency workflow testing
- ~50 test scenarios
- Agent with multiple tool calls (3-5 tools per workflow)

Token estimate:
- Input: 50 scenarios × 2,500 tokens × 4 tools = 500K tokens
- Output: 50 scenarios × 800 tokens × 4 tools = 160K tokens

**Cost (Claude 3.5 Sonnet):**
- Input: 500K tokens × $3.00 / 1M = **$1.50**
- Output: 160K tokens × $15.00 / 1M = **$2.40**
- **Total Week 2: ~$3.90**

**Total Experiment Cost: ~$5.40**

**Reality check:** Budget $500 is **100× more than needed** for experiments.
**Recommended experiment budget: $50** (includes debugging, retries, extended testing)

---

### Production Costs: Current vs Agent SDK

**Scenario: 10 users, 50 emails/day each**

#### Current System (OpenAI GPT-4-turbo)

| Operation | Tokens/Operation | Operations/Month | Monthly Tokens | Cost |
|-----------|------------------|------------------|----------------|------|
| Email analysis | 700 total | 15,000 | 10.5M | $165 |
| **Total** | | | | **$165/month** |

#### Agent SDK System (Claude 3.5 Sonnet)

| Operation | Tokens/Operation | Operations/Month | Monthly Tokens | Cost |
|-----------|------------------|------------------|----------------|------|
| Email analysis (agent) | 1,200 total* | 15,000 | 18M | $54 |
| Morning Brief (daily) | 3,000 total | 300 (10 users × 30 days) | 0.9M | $2.70 |
| Workflow orchestration | 2,500 total | 1,000 (complex workflows) | 2.5M | $7.50 |
| Context gathering | 1,500 total | 5,000 (subagents) | 7.5M | $22.50 |
| Verification loops | 800 total | 10,000 | 8M | $24 |
| **Total** | | | | **$110.70/month** |

*Agent uses more tokens per operation (context gathering, verification) but Claude 3.5 Sonnet is cheaper

**Savings: $54.30/month (33% cheaper)**

**With 100 users:**
- Current (OpenAI): ~$1,650/month
- Agent SDK (Claude): ~$1,107/month
- **Savings: $543/month**

---

### Production Costs: Alternative Scenarios

#### Scenario 1: MCP Only (No Agent SDK)

If Week 1 succeeds but Week 2 fails:
- Use Claude API for email analysis via MCP
- Keep manual orchestration (existing Express.js routes)
- No agent overhead (context gathering, verification)

**Cost with Claude 3.5 Sonnet:**
- Email analysis: 15,000 × 800 tokens = 12M tokens
- Monthly: 12M tokens × $0.018 per 1K = **$54/month**
- **Savings vs current: $111/month (67% cheaper)**

#### Scenario 2: Keep OpenAI + Add MCP Servers

If Claude API doesn't work well but MCP servers add value:
- Use MCP servers as integration layer
- Keep OpenAI for LLM calls
- Best of both worlds

**Cost:**
- Same as current: **$165/month**
- Benefit: Simpler integration code, no cost increase

#### Scenario 3: Hybrid (MCP + Selective Agents)

Most likely outcome:
- MCP servers for all integrations
- Agents only for complex workflows (10% of operations)
- Manual orchestration for simple operations (90%)

**Cost:**
- Simple operations (90%): 13,500 × 800 tokens = 10.8M = **$48.60**
- Agent workflows (10%): 1,500 × 2,500 tokens = 3.75M = **$11.25**
- **Total: $59.85/month**
- **Savings vs current: $105.15/month (64% cheaper)**

---

## Cost Breakdown by Phase

### Phase 0: Experiments (2 weeks)
- **API Keys needed:** Anthropic Claude API key
- **Cost:** $5-50 depending on testing thoroughness
- **Recommendation:** Budget $50, expect to spend $10

### Phase 1: MCP Servers Only (If agents not adopted)
- **API Keys needed:** Anthropic Claude API key
- **Monthly ongoing:** $54/month (10 users)
- **vs Current:** Save $111/month

### Phase 2: Full Agent Migration
- **API Keys needed:** Anthropic Claude API key, same Google OAuth
- **Monthly ongoing:** $111/month (10 users)
- **vs Current:** Save $54/month

### Phase 3: Scale to 100 Users
- **Monthly ongoing:** $1,107/month (agent system)
- **vs Current:** $1,650/month (save $543/month)

---

## Hidden Costs to Consider

### Development Time
- **Experiment:** 2 weeks × 1 developer = ~$8,000 (assuming $100/hr)
- **Full migration:** 16 weeks × 3 developers = ~$192,000
- **MCP only:** 3 weeks × 1 developer = ~$12,000

**ROI on API savings:**
- Full migration: $543/month savings → 353 months to break even
- MCP only: $111/month savings → 108 months to break even
- **Conclusion:** API cost savings don't justify migration. Must provide other value.

### Infrastructure
- **Current:** Basic Express.js server
- **Agent SDK:** May need more memory for context management
- **Estimate:** +$20-50/month for larger instances

### Monitoring
- **Agent executions:** More logs, metrics, debugging
- **Estimate:** +$10-30/month for monitoring services (if using paid service)

### Maintenance
- **Agent SDK:** New dependency to maintain, SDK updates
- **MCP Servers:** Additional services to monitor/maintain
- **Estimate:** +5-10 hours/month developer time

---

## API Key Setup Instructions

### For Experiments (Immediate)

**1. Get Anthropic Claude API Key**
```bash
# Sign up at https://console.anthropic.com/
# Navigate to API Keys section
# Create new key with name: "intelligent-admin-experiments"
# Set spending limit: $50/month
# Copy key (starts with "sk-ant-")
```

**2. Add to Environment**
```bash
# backend/.env
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_TIMEOUT=60000
```

**3. Update env.ts**
```typescript
// backend/src/config/env.ts
export const env = cleanEnv(process.env, {
  // ... existing ...

  // Anthropic (for Agent SDK experiments)
  ANTHROPIC_API_KEY: str({
    default: '',
    desc: 'Anthropic API key for Claude Agent SDK'
  }),
  ANTHROPIC_MODEL: str({
    default: 'claude-3-5-sonnet-20241022',
    desc: 'Anthropic Claude model to use'
  }),
});
```

### Optional: Document Processing APIs

**If implementing Document Agent:**

**Option 1: Tesseract.js (FREE)**
```bash
npm install tesseract.js
# No API key needed
```

**Option 2: Google Cloud Vision**
```bash
# Create project at https://console.cloud.google.com/
# Enable Cloud Vision API
# Create service account and download JSON key
# Add GOOGLE_CLOUD_VISION_KEY to .env
```

---

## Cost Monitoring Strategy

### Set Spending Limits

**Anthropic Console:**
- Set monthly limit: $100 (experiments), $500 (production)
- Enable email alerts at 50%, 75%, 90%

**OpenAI Console (if keeping):**
- Set monthly limit: $200
- Enable email alerts

### Track Usage

**Log every API call:**
```typescript
// Track token usage
const logApiUsage = async (operation: string, tokens: { input: number; output: number }) => {
  await prisma.apiUsageLog.create({
    data: {
      provider: 'anthropic',
      operation,
      inputTokens: tokens.input,
      outputTokens: tokens.output,
      cost: (tokens.input * 0.003 / 1000) + (tokens.output * 0.015 / 1000),
      timestamp: new Date()
    }
  });
};
```

**Weekly cost reports:**
```sql
-- Get weekly costs by operation
SELECT
  operation,
  SUM(input_tokens) as total_input,
  SUM(output_tokens) as total_output,
  SUM(cost) as total_cost
FROM api_usage_log
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY operation
ORDER BY total_cost DESC;
```

---

## Recommendations

### For Experiments (Week 1-2)
- ✅ **Get:** Anthropic Claude API key ($50 budget)
- ❌ **Skip:** Everything else for now
- 🎯 **Goal:** Prove value with minimal investment

### If MCP Succeeds (Week 3+)
- ✅ **Keep:** Anthropic Claude API key
- ✅ **Use:** Existing Google OAuth
- ❌ **Don't add:** Additional services yet
- 🎯 **Goal:** Reduce API costs 67% vs current

### If Full Migration (Week 5+)
- ✅ **Scale up:** Anthropic spending limit to $500/month
- ⚠️ **Monitor:** Context usage (agents can accumulate tokens)
- ✅ **Optimize:** Use Claude 3 Haiku for simple operations
- ❌ **Don't remove:** OpenAI key yet (keep as fallback)

### Cost Optimization Tips

**1. Model Selection**
- Complex workflows → Claude 3.5 Sonnet ($0.018/1K tokens)
- Simple operations → Claude 3 Haiku ($0.0025/1K tokens)
- Critical accuracy → Claude 3 Opus ($0.075/1K tokens)

**2. Context Management**
- Limit context to 10K tokens max per operation
- Use context compaction for long conversations
- Cache frequently used context (industry knowledge, user preferences)

**3. Batching**
- Analyze multiple emails in single API call
- Batch morning brief for all users at once
- Reduce per-operation overhead

**4. Caching**
- Cache industry knowledge (regulations don't change daily)
- Cache user preferences (update weekly, not per-request)
- Use Redis for frequently accessed data

---

## Summary: What You Need Now

### Immediate (For Experiments)
1. **Anthropic Claude API Key** - Free tier: $5 credit, then pay-as-you-go
2. **Experiment budget:** $50 (will likely spend $5-10)
3. **Time:** 2 weeks, 1 developer

### Monthly Ongoing (If Adopted)
- **Best case (MCP only):** $54/month API + $20 infrastructure = **$74/month total**
- **Full agents:** $111/month API + $50 infrastructure = **$161/month total**
- **Current system:** $165/month API + $20 infrastructure = **$185/month total**

### ROI Reality Check
- API cost savings: $24-111/month
- Development cost: $8,000-192,000 one-time
- **Payback period: 6-135 years** ⚠️

**Conclusion:** Migrate for better architecture/features, NOT for cost savings.
