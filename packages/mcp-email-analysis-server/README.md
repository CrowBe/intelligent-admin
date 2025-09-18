# Intelligent Admin MCP Server

A generic, extensible AI-powered MCP (Model Context Protocol) server that provides intelligent business analysis tools for the Intelligent Admin application.

## Overview

This MCP server uses OpenAI GPT-4 to provide AI-powered analysis across multiple business domains:
- **Email Intelligence**: Priority classification, categorization, and action recommendations
- **Document Analysis**: Compliance checking, requirement extraction, and insights
- **Business Intelligence**: Morning briefs, trend analysis, and recommendations
- **Extensible Framework**: Easy to add new AI-powered tools for any business function

## Architecture

The server uses a **plugin-based architecture** where tools can be easily registered and executed:

```typescript
interface Tool {
  name: string;
  description: string;
  execute: (params: any) => Promise<any>;
}

// Register new tools dynamically
this.tools.set('my_new_tool', {
  name: 'my_new_tool',
  description: 'Description of what this tool does',
  execute: async (params) => {
    // AI-powered analysis logic here
    return await this.myNewAnalysis(params);
  },
});
```

## Current Tools

### Email Analysis Tools

#### `analyze_email`
Analyze a single email with AI-powered categorization.

**Input:**
```json
{
  "email": {
    "id": "email123",
    "subject": "Urgent: Water leak at Main St property",
    "from": "client@business.com",
    "snippet": "There's a major water leak...",
    "body": "Full email content...",
    "receivedAt": "2024-01-15T10:30:00Z"
  },
  "businessContext": "Plumbing business specializing in emergency repairs"
}
```

**Output:**
```json
{
  "emailId": "email123",
  "priority": "urgent",
  "category": "urgent",
  "urgencyScore": 95,
  "businessRelevance": 90,
  "actionRequired": true,
  "keywords": ["leak", "urgent", "emergency", "water"],
  "suggestedActions": [
    "Call client immediately",
    "Schedule emergency repair visit",
    "Prepare quote for repair work"
  ],
  "reasoning": "Email contains urgent keywords and describes an emergency situation requiring immediate action"
}
```

#### `analyze_emails_batch`
Process multiple emails efficiently in a single request.

#### `generate_morning_brief`
Create a personalized morning brief summarizing urgent emails and tasks.

### Document Analysis Tools

#### `analyze_document`
Analyze business documents for compliance, requirements, and insights.

**Input:**
```json
{
  "content": "Document content here...",
  "type": "contract",
  "businessContext": "Electrical contracting business"
}
```

## Adding New Tools

To add a new AI-powered tool:

1. **Create the analysis method:**
```typescript
private async myNewAnalysis(params: any): Promise<any> {
  const prompt = `Analyze this for a trade business: ${params.content}`;

  const completion = await this.openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  return {
    analysis: completion.choices[0]?.message?.content,
    insights: [],
  };
}
```

2. **Register the tool:**
```typescript
this.tools.set('my_new_tool', {
  name: 'my_new_tool',
  description: 'Analyze specific business content',
  execute: async (params) => await this.myNewAnalysis(params),
});
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables:**
   ```bash
   export OPENAI_API_KEY=your_openai_api_key
   ```

3. **Build the server:**
   ```bash
   npm run build
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

## Usage

### Programmatic Usage
```typescript
import { IntelligentAdminMCPServer } from './packages/mcp-email-analysis-server';

const server = new IntelligentAdminMCPServer();

// Execute tools programmatically
const result = await server.executeTool('analyze_email', {
  email: emailData,
  businessContext: 'Plumbing business'
});

// Get available tools
const tools = server.getAvailableTools();
```

### Integration with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "intelligent-admin": {
      "command": "node",
      "args": ["/path/to/packages/mcp-email-analysis-server/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Business Context

Specifically designed for Australian trade businesses:
- Electrical, plumbing, HVAC, construction
- Emergency response scenarios
- Compliance and regulatory considerations
- Industry-specific terminology recognition

## Extensibility Examples

### Potential New Tools
- **Quote Analysis**: Analyze quotes for competitiveness and completeness
- **Invoice Processing**: Extract payment terms and due dates
- **Schedule Optimization**: Analyze calendar conflicts and suggest improvements
- **Customer Sentiment**: Analyze communication patterns and satisfaction indicators
- **Compliance Checking**: Verify documents against Australian standards
- **Risk Assessment**: Identify potential project risks from communications

### Adding Industry-Specific Tools
```typescript
// Electrical safety compliance tool
this.tools.set('electrical_safety_check', {
  name: 'electrical_safety_check',
  description: 'Check electrical work against Australian standards',
  execute: async (params) => await this.checkElectricalSafety(params),
});

// HVAC system analysis tool
this.tools.set('hvac_analysis', {
  name: 'hvac_analysis',
  description: 'Analyze HVAC system requirements and recommendations',
  execute: async (params) => await this.analyzeHVAC(params),
});
```

## Performance & Scaling

- **Batch Processing**: Handle multiple items efficiently
- **Caching**: Implement result caching for repeated analyses
- **Rate Limiting**: Built-in protection against API limits
- **Error Recovery**: Graceful fallback for AI service issues

## Security

- **API Key Protection**: Secure environment variable handling
- **Input Validation**: Comprehensive parameter validation
- **Output Sanitization**: Safe response formatting
- **Audit Logging**: Complete request/response tracking
