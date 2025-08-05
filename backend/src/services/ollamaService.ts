import { logger } from '../utils/logger.js';
import type { 
  OllamaMessage, 
  OllamaOptions, 
  OllamaApiResponse, 
  OllamaModelsResponse,
  EmailAnalysisResult,
  EmailSummary 
} from '../types/ollama.js';

/**
 * Ollama Service for Local LLM Integration
 * Provides local AI capabilities as alternative to OpenAI API
 */

export interface OllamaResponse {
  model: string;
  content: string;
  tokens: number;
  processingTime: number;
}

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  timeout: number;
}

class OllamaService {
  private static instance: OllamaService;
  private config: OllamaConfig;
  private isAvailable: boolean = false;

  private constructor() {
    this.config = {
      baseUrl: process.env['OLLAMA_BASE_URL'] || 'http://localhost:11434',
      model: process.env['OLLAMA_MODEL'] || 'gemma3:latest',
      timeout: parseInt(process.env['OLLAMA_TIMEOUT'] || '30000', 10),
    };

    this.checkAvailability();
  }

  public static getInstance(): OllamaService {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService();
    }
    return OllamaService.instance;
  }

  /**
   * Check if Ollama is available and running
   */
  private async checkAvailability(): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = (await response.json()) as OllamaModelsResponse;
        const hasModel = data.models?.some((m) => m.name.includes(this.config.model.split(':')[0]));

        if (hasModel) {
          this.isAvailable = true;
          logger.info(`Ollama service available with model: ${this.config.model}`);
        } else {
          logger.warn(`Ollama running but model ${this.config.model} not found`);
          await this.pullModel();
        }
      }
    } catch (error) {
      this.isAvailable = false;
      logger.warn('Ollama service not available, falling back to OpenAI:', error);
    }
  }

  /**
   * Download model if not available
   */
  private async pullModel(): Promise<void> {
    try {
      logger.info(`Downloading Ollama model: ${this.config.model}`);

      const response = await fetch(`${this.config.baseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: this.config.model }),
      });

      if (response.ok) {
        logger.info(`Model ${this.config.model} download initiated`);
        this.isAvailable = true;
      } else {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Failed to download Ollama model:', error);
    }
  }

  /**
   * Check if Ollama service is available
   */
  public getAvailability(): boolean {
    return this.isAvailable;
  }

  /**
   * Generate chat completion using Ollama
   */
  async generateChatCompletion(
    messages: OllamaMessage[],
    options?: OllamaOptions
  ): Promise<OllamaResponse> {
    if (!this.isAvailable) {
      throw new Error('Ollama service not available');
    }

    const startTime = Date.now();

    try {
      // Prepare messages for Ollama format
      const ollmaMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add system prompt if provided
      if (options?.systemPrompt) {
        ollmaMessages.unshift({
          role: 'system',
          content: options.systemPrompt,
        });
      }

      const requestBody = {
        model: this.config.model,
        messages: ollmaMessages,
        stream: false,
        options: {
          temperature: options?.temperature || 0.7,
          num_predict: options?.maxTokens || 2048,
          top_p: 0.9,
          repeat_penalty: 1.1,
        },
      };

      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as OllamaApiResponse;
      const processingTime = Date.now() - startTime;

      return {
        model: this.config.model,
        content: data.message?.content || '',
        tokens: data.eval_count || 0,
        processingTime,
      };
    } catch (error) {
      logger.error('Ollama chat completion failed:', error);
      throw error;
    }
  }

  /**
   * Analyze email content using local AI
   */
  async analyzeEmailContent(
    emailContent: string,
    context: string = ''
  ): Promise<EmailAnalysisResult> {
    const systemPrompt = `You are an AI assistant specializing in email analysis for Australian trade businesses.
    Analyze emails and provide structured responses in JSON format only.

    Focus on:
    - Australian trade business context
    - Urgency detection for trade-related communications
    - Customer vs supplier identification
    - Job opportunity recognition
    - Compliance and safety-related content`;

    const prompt = `Analyze this email for an Australian trade business:

Email Content: "${emailContent}"
Business Context: "${context}"

Respond ONLY with valid JSON in this exact format:
{
  "urgencyScore": 0-100,
  "category": "urgent|standard|follow_up|admin|spam",
  "businessRelevance": 0-100,
  "sentiment": "positive|neutral|negative",
  "actionRequired": true|false,
  "suggestedActions": ["action1", "action2"],
  "reasoning": "Brief explanation of analysis"
}`;

    try {
      const response = await this.generateChatCompletion([{ role: 'user', content: prompt }], {
        systemPrompt,
        temperature: 0.3,
      });

      // Parse JSON response
      const analysis = JSON.parse(response.content) as EmailAnalysisResult;

      // Validate response structure
      if (
        typeof analysis.urgencyScore !== 'number' ||
        !analysis.category ||
        typeof analysis.businessRelevance !== 'number'
      ) {
        throw new Error('Invalid response structure from Ollama');
      }

      return analysis;
    } catch (error) {
      logger.error('Email analysis failed:', error);

      // Fallback to rule-based analysis
      return {
        urgencyScore: 50,
        category: 'standard',
        businessRelevance: 70,
        sentiment: 'neutral',
        actionRequired: false,
        suggestedActions: ['Review email content'],
        reasoning: 'AI analysis failed, using fallback',
      };
    }
  }

  /**
   * Generate morning digest summary
   */
  async generateMorningDigest(
    emailSummaries: EmailSummary[],
    userContext: Record<string, any> = {}
  ): Promise<string> {
    const systemPrompt = `You are an executive assistant for Australian trade business owners.
    Create concise, actionable morning email digests that help prioritize the day's work.

    Focus on:
    - Urgent customer communications
    - Business opportunities
    - Compliance deadlines
    - Supplier communications
    - Administrative tasks`;

    const emailList = emailSummaries
      .slice(0, 15)
      .map(email => `- ${email.priority.toUpperCase()}: ${email.subject} | ${email.snippet.substring(0, 100)}...`)
      .join('\n');

    const prompt = `Create a morning email digest for a trade business owner:

Today's Emails (${emailSummaries.length} total):
${emailList}

Business Context: ${JSON.stringify(userContext)}

Create a professional summary with:
1. Priority items requiring immediate attention
2. Business opportunities to follow up
3. Administrative tasks to handle
4. Overall recommendations for the day

Keep it concise and actionable (max 300 words).`;

    try {
      const response = await this.generateChatCompletion([{ role: 'user', content: prompt }], {
        systemPrompt,
        temperature: 0.4,
      });

      return response.content;
    } catch (error) {
      logger.error('Morning digest generation failed:', error);

      // Fallback summary
      const urgentCount = emailSummaries.filter(e => e.priority === 'urgent').length;
      return `Good morning! You have ${emailSummaries.length} emails today, with ${urgentCount} marked as urgent. Please review your urgent emails first, then handle standard communications and administrative tasks.`;
    }
  }

  /**
   * Get service statistics
   */
  getStats(): {
    isAvailable: boolean;
    model: string;
    baseUrl: string;
  } {
    return {
      isAvailable: this.isAvailable,
      model: this.config.model,
      baseUrl: this.config.baseUrl,
    };
  }
}

export const ollamaService = OllamaService.getInstance();
