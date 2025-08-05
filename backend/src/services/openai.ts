import OpenAI from 'openai';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { CustomError } from '../middleware/errorHandler.js';

// Types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
  stream?: boolean;
}

export interface ChatCompletionResult {
  content: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
  processingTime: number;
}

export interface StreamChunk {
  content: string;
  finished: boolean;
}

// Initialize OpenAI client
let openai: OpenAI | null = null;

if (config.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
  });
  logger.info('OpenAI client initialized');
} else {
  logger.warn('OpenAI API key not provided - AI features will be disabled');
}

// System prompts
export const SYSTEM_PROMPTS = {
  default: `You are an AI administrative assistant specifically designed for Australian trade businesses (plumbing, electrical, carpentry, etc.). 

Your role is to help with:
- Email management and communication
- Scheduling and calendar management  
- Document processing and organization
- Invoice and quote generation
- Customer relationship management
- Integration with business tools
- Administrative task automation

Key guidelines:
- Be professional but friendly
- Understand Australian business context and terminology
- Provide practical, actionable advice
- Ask clarifying questions when needed
- Suggest relevant integrations and automations
- Keep responses concise and focused
- Always prioritize data privacy and security

Current conversation context will be provided with each request.`,

  emailAssistant: `You are an expert email management assistant for Australian trade businesses. Help with composing, organizing, and managing business emails. Focus on professional communication, follow-ups, and email automation.`,

  schedulingAssistant: `You are a scheduling and calendar management expert for trade businesses. Help with appointment booking, scheduling optimization, and calendar coordination. Understand typical trade business workflows and timing constraints.`,

  documentProcessor: `You are a document processing specialist. Help extract information from invoices, quotes, contracts, and other business documents. Provide structured data extraction and document organization suggestions.`,
};

// OpenAI Service Class
export class OpenAIService {
  private static instance: OpenAIService;
  private client: OpenAI;

  private constructor() {
    if (!openai) {
      throw new CustomError('OpenAI client not initialized - API key required', 500);
    }
    this.client = openai;
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Generate chat completion
   */
  async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: options.model || config.OPENAI_MODEL,
        messages: options.messages,
        temperature: options.temperature ?? config.OPENAI_TEMPERATURE,
        max_tokens: options.maxTokens || config.OPENAI_MAX_TOKENS,
        stream: false,
      });

      const processingTime = Date.now() - startTime;
      const choice = response.choices[0];

      if (!choice || !choice.message?.content) {
        throw new CustomError('No response generated from OpenAI', 500);
      }

      const result: ChatCompletionResult = {
        content: choice.message.content,
        tokenUsage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
        finishReason: choice.finish_reason || 'unknown',
        processingTime,
      };

      logger.info('OpenAI chat completion generated', {
        model: result.model,
        tokensUsed: result.tokenUsage.totalTokens,
        processingTime: result.processingTime,
        finishReason: result.finishReason,
      });

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error('OpenAI chat completion failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
        model: options.model || config.OPENAI_MODEL,
        messageCount: options.messages.length,
      });

      if (error instanceof OpenAI.APIError) {
        throw new CustomError(
          `OpenAI API error: ${error.message}`,
          error.status || 500
        );
      }

      throw new CustomError(
        'Failed to generate AI response',
        500
      );
    }
  }

  /**
   * Generate streaming chat completion
   */
  async *chatCompletionStream(options: ChatCompletionOptions): AsyncGenerator<StreamChunk> {
    try {
      const stream = await this.client.chat.completions.create({
        model: options.model || config.OPENAI_MODEL,
        messages: options.messages,
        temperature: options.temperature ?? config.OPENAI_TEMPERATURE,
        max_tokens: options.maxTokens || config.OPENAI_MAX_TOKENS,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        if (delta?.content) {
          yield {
            content: delta.content,
            finished: false,
          };
        }

        if (chunk.choices[0]?.finish_reason) {
          yield {
            content: '',
            finished: true,
          };
          break;
        }
      }
    } catch (error) {
      logger.error('OpenAI streaming completion failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        model: options.model || config.OPENAI_MODEL,
      });

      throw new CustomError(
        'Failed to generate streaming AI response',
        500
      );
    }
  }

  /**
   * Build context-aware messages for chat completion
   */
  buildChatMessages(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    systemPrompt: string = SYSTEM_PROMPTS.default,
    contextData?: Record<string, any>
  ): ChatMessage[] {
    // Start with system message
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    // Add context if provided
    if (contextData && Object.keys(contextData).length > 0) {
      messages.push({
        role: 'system',
        content: `Current context: ${JSON.stringify(contextData, null, 2)}`,
      });
    }

    // Add conversation history (limit to last 10 messages to stay within token limits)
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    return messages;
  }

  /**
   * Generate suggestions based on context
   */
  async generateSuggestions(
    conversationContext: ChatMessage[],
    contextData?: Record<string, any>
  ): Promise<string[]> {
    try {
      const messages = this.buildChatMessages(
        'Based on our conversation, provide 3 short (2-4 word) suggestions for what the user might want to do next. Return only the suggestions, one per line.',
        conversationContext.slice(-4), // Only use recent context for suggestions
        SYSTEM_PROMPTS.default,
        contextData
      );

      const result = await this.chatCompletion({
        messages,
        temperature: 0.7,
        maxTokens: 100,
      });

      return result.content
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .slice(0, 3);
    } catch (error) {
      logger.error('Failed to generate suggestions', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      // Return fallback suggestions
      return ['Ask a question', 'Get help', 'Show options'];
    }
  }

  /**
   * Check if OpenAI service is available
   */
  isAvailable(): boolean {
    return !!config.OPENAI_API_KEY && !!this.client;
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      model: config.OPENAI_MODEL,
      maxTokens: config.OPENAI_MAX_TOKENS,
      temperature: config.OPENAI_TEMPERATURE,
      available: this.isAvailable(),
    };
  }
}

// Export function to get singleton instance (lazy initialization)
export const getOpenAIService = (): OpenAIService => {
  return OpenAIService.getInstance();
};