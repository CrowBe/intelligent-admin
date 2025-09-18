#!/usr/bin/env node

import OpenAI from 'openai';

// Email analysis types
export interface EmailData {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  body?: string;
  receivedAt: string;
}

export interface EmailAnalysis {
  emailId: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'urgent' | 'standard' | 'follow-up' | 'admin' | 'spam';
  urgencyScore: number;
  businessRelevance: number;
  actionRequired: boolean;
  keywords: string[];
  suggestedActions: string[];
  reasoning: string;
  businessContext?: string;
}

// Tool definitions for extensibility
interface Tool {
  name: string;
  description: string;
  execute: (params: any) => Promise<any>;
}

export class IntelligentAdminMCPServer {
  private readonly openai: OpenAI;
  private tools: Map<string, Tool> = new Map();

  constructor() {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.registerTools();
  }

  private registerTools() {
    // Email Analysis Tool
    this.tools.set('analyze_email', {
      name: 'analyze_email',
      description: 'Analyze a single email for priority, category, and action items using AI',
      execute: async (params: { email: EmailData; businessContext?: string }) => {
        return await this.analyzeEmail(params.email, params.businessContext);
      },
    });

    // Batch Email Analysis Tool
    this.tools.set('analyze_emails_batch', {
      name: 'analyze_emails_batch',
      description: 'Analyze multiple emails in batch for efficient processing',
      execute: async (params: { emails: EmailData[]; businessContext?: string }) => {
        return await this.analyzeEmailsBatch(params.emails, params.businessContext);
      },
    });

    // Morning Brief Tool
    this.tools.set('generate_morning_brief', {
      name: 'generate_morning_brief',
      description: 'Generate a morning brief summary of urgent emails and tasks',
      execute: async (params: { recentAnalyses: any[]; businessContext?: string }) => {
        return await this.generateMorningBrief(params.recentAnalyses, params.businessContext);
      },
    });

    // Document Analysis Tool (extensible)
    this.tools.set('analyze_document', {
      name: 'analyze_document',
      description: 'Analyze business documents for compliance, requirements, and insights',
      execute: async (params: { content: string; type: string; businessContext?: string }) => {
        return await this.analyzeDocument(params.content, params.type, params.businessContext);
      },
    });
  }

  // Public API for external usage
  async executeTool(toolName: string, params: any): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    return await tool.execute(params);
  }

  getAvailableTools(): string[] {
    return Array.from(this.tools.keys());
  }

  // Core AI analysis methods
  private async analyzeEmail(email: EmailData, businessContext?: string): Promise<EmailAnalysis> {
    const prompt = this.buildAnalysisPrompt(email, businessContext);

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant specialized in analyzing emails for Australian trade businesses.
          Your task is to categorize emails by urgency and business relevance, providing actionable insights.

          Categories:
          - 🔴 URGENT: Requires immediate action (emergencies, deadlines, critical issues)
          - 🟡 STANDARD: Normal business communications
          - 🟢 FOLLOW-UP: Follow-up on previous conversations
          - 📋 ADMIN: Administrative/informational content
          - 🗑️ SPAM: Likely spam or promotional content

          Priorities: urgent, high, medium, low

          Consider Australian trade business context: electrical, plumbing, HVAC, construction, etc.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return this.parseAnalysisResponse(response, email.id);
  }

  private async analyzeEmailsBatch(
    emails: EmailData[],
    businessContext?: string
  ): Promise<{ analyses: EmailAnalysis[] }> {
    const analyses = await Promise.all(emails.map(email => this.analyzeEmail(email, businessContext)));
    return { analyses };
  }

  private async generateMorningBrief(analyses: any[], businessContext?: string): Promise<{ brief: any }> {
    const urgentEmails = analyses.filter(a => a.priority === 'urgent');
    const highPriorityEmails = analyses.filter(a => a.priority === 'high');

    const prompt = `Generate a morning brief for an Australian trade business owner based on these email analyses:

Urgent emails: ${urgentEmails.length}
High priority emails: ${highPriorityEmails.length}
Business context: ${businessContext || 'General trade business'}

Please create a concise, actionable morning brief that highlights the most important items requiring attention.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional assistant creating morning briefs for busy trade business owners. Be concise, actionable, and prioritize urgent items.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const briefContent = completion.choices[0]?.message?.content || 'No brief generated';

    return {
      brief: {
        title: '☀️ Morning Brief',
        content: briefContent,
        urgentCount: urgentEmails.length,
        highPriorityCount: highPriorityEmails.length,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  private async analyzeDocument(content: string, type: string, businessContext?: string): Promise<any> {
    const prompt = `Analyze this ${type} document for a trade business:

${content}

${businessContext ? `Business Context: ${businessContext}` : ''}

Provide key insights, requirements, and recommendations.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    return {
      analysis: completion.choices[0]?.message?.content || 'Analysis completed',
      documentType: type,
      insights: [],
    };
  }

  private buildAnalysisPrompt(email: EmailData, businessContext?: string): string {
    return `Please analyze this email for an Australian trade business:

SUBJECT: ${email.subject}
FROM: ${email.from}
CONTENT: ${email.snippet}${email.body ? `\n\nFULL BODY:\n${email.body}` : ''}
RECEIVED: ${email.receivedAt}
${businessContext ? `\nBUSINESS CONTEXT: ${businessContext}` : ''}

Please provide:
1. Priority level (urgent/high/medium/low)
2. Category (urgent/standard/follow-up/admin/spam)
3. Urgency score (0-100)
4. Business relevance score (0-100)
5. Whether action is required (true/false)
6. Key keywords or phrases
7. Suggested actions (2-3 specific recommendations)
8. Brief reasoning for the analysis

Format your response as JSON with these exact keys: priority, category, urgencyScore, businessRelevance, actionRequired, keywords, suggestedActions, reasoning`;
  }

  private parseAnalysisResponse(response: string, emailId: string): EmailAnalysis {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        emailId,
        priority: parsed.priority || 'medium',
        category: parsed.category || 'standard',
        urgencyScore: Math.min(100, Math.max(0, parsed.urgencyScore || 50)),
        businessRelevance: Math.min(100, Math.max(0, parsed.businessRelevance || 50)),
        actionRequired: parsed.actionRequired || false,
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        suggestedActions: Array.isArray(parsed.suggestedActions) ? parsed.suggestedActions : [],
        reasoning: parsed.reasoning || 'Analysis completed',
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return {
        emailId,
        priority: 'medium',
        category: 'standard',
        urgencyScore: 50,
        businessRelevance: 50,
        actionRequired: false,
        keywords: [],
        suggestedActions: ['Review email content'],
        reasoning: 'Fallback analysis due to parsing error',
      };
    }
  }
}

// Export for external usage
export default IntelligentAdminMCPServer;
