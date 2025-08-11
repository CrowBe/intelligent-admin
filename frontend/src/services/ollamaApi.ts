import { logger } from '../utils/logger';
import { getActionInstructions } from '../types/actions';

/**
 * Ollama API Service for Local LLM Integration
 * Provides direct communication with local Ollama instance
 */

export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message?: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaStreamResponse {
  model: string;
  created_at: string;
  message?: {
    role: string;
    content: string;
  };
  done: boolean;
}

export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  timeout?: number;
  temperature?: number;
  systemPrompt?: string;
}

class OllamaApiService {
  private config: OllamaConfig;
  private isAvailable: boolean = false;
  private availableModels: OllamaModel[] = [];

  constructor() {
    this.config = {
      baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434',
      model: import.meta.env.VITE_OLLAMA_MODEL || 'llama2',
      timeout: parseInt(import.meta.env.VITE_OLLAMA_TIMEOUT || '30000', 10),
      temperature: parseFloat(import.meta.env.VITE_OLLAMA_TEMPERATURE || '0.7'),
      systemPrompt: import.meta.env.VITE_OLLAMA_SYSTEM_PROMPT || 
        `You are the AI assistant for Intelligent Admin, a comprehensive business management platform designed specifically for Australian trade businesses (electricians, plumbers, builders, etc.).

YOU ARE PART OF THE APPLICATION ITSELF - not a separate service. The user is already using Intelligent Admin and talking to you through the built-in chat interface.

The Intelligent Admin platform includes these integrated features:
- Gmail integration for email management and automation
- Document management and intelligent processing
- Industry-specific knowledge base (Australian regulations, standards, safety requirements)
- Customer relationship tracking
- Quote and invoice generation
- Job scheduling and workflow automation
- Compliance tracking for Australian trade regulations

When users mention "email integration" or "Gmail", they're referring to the Gmail integration feature WITHIN Intelligent Admin that:
- Automatically categorizes and prioritizes emails
- Detects urgent customer requests
- Suggests responses based on business context
- Creates morning email digests
- Identifies business opportunities in emails

IMPORTANT CONTEXT:
- You are helping them use features that are ALREADY PART of this application
- Guide them through using Intelligent Admin's features, not external tools
- When discussing email, assume they want to use Intelligent Admin's Gmail integration
- Be specific about how to use features within this application
- Reference Australian trade industry context when relevant

Be helpful, concise, and professional. Focus on guiding users through Intelligent Admin's features to manage their trade business efficiently.

${getActionInstructions()}`
    };

    // Check availability on initialization
    this.checkAvailability();
  }

  /**
   * Check if Ollama service is available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        this.availableModels = data.models || [];
        
        // Check if configured model is available
        const hasModel = this.availableModels.some(
          m => m.name === this.config.model || m.name.includes(this.config.model.split(':')[0])
        );

        if (hasModel) {
          this.isAvailable = true;
          console.log(`✅ Ollama service available with model: ${this.config.model}`);
        } else if (this.availableModels.length > 0) {
          // Use first available model if configured model not found
          this.config.model = this.availableModels[0].name;
          this.isAvailable = true;
          console.log(`⚠️ Configured model not found. Using: ${this.config.model}`);
        } else {
          console.warn('❌ No Ollama models available');
          this.isAvailable = false;
        }
      } else {
        this.isAvailable = false;
        console.warn('❌ Ollama service not responding');
      }
    } catch (error) {
      this.isAvailable = false;
      console.warn('❌ Ollama service not available:', error);
    }

    return this.isAvailable;
  }

  /**
   * Get availability status
   */
  getAvailability(): boolean {
    return this.isAvailable;
  }

  /**
   * Get available models
   */
  getAvailableModels(): OllamaModel[] {
    return this.availableModels;
  }

  /**
   * Get current configuration
   */
  getConfig(): OllamaConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OllamaConfig>): void {
    this.config = { ...this.config, ...config };
    // Re-check availability when config changes
    this.checkAvailability();
  }

  /**
   * Generate chat completion
   */
  async generateChatCompletion(
    messages: OllamaMessage[],
    options?: {
      temperature?: number;
      stream?: boolean;
      systemPrompt?: string;
    }
  ): Promise<OllamaResponse> {
    if (!this.isAvailable) {
      throw new Error('Ollama service is not available. Please ensure Ollama is running locally.');
    }

    try {
      // Add system prompt if provided
      const finalMessages = [...messages];
      const systemPrompt = options?.systemPrompt || this.config.systemPrompt;
      
      if (systemPrompt && !messages.some(m => m.role === 'system')) {
        finalMessages.unshift({
          role: 'system',
          content: systemPrompt
        });
      }

      const requestBody = {
        model: this.config.model,
        messages: finalMessages,
        stream: options?.stream || false,
        options: {
          temperature: options?.temperature || this.config.temperature,
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 30000);

      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data as OllamaResponse;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - Ollama is taking too long to respond');
        }
        throw error;
      }
      throw new Error('Failed to generate chat completion');
    }
  }

  /**
   * Generate streaming chat completion
   */
  async *generateStreamingChatCompletion(
    messages: OllamaMessage[],
    options?: {
      temperature?: number;
      systemPrompt?: string;
      onProgress?: (partial: string) => void;
    }
  ): AsyncGenerator<string, void, unknown> {
    if (!this.isAvailable) {
      throw new Error('Ollama service is not available');
    }

    try {
      // Add system prompt if provided
      const finalMessages = [...messages];
      const systemPrompt = options?.systemPrompt || this.config.systemPrompt;
      
      if (systemPrompt && !messages.some(m => m.role === 'system')) {
        finalMessages.unshift({
          role: 'system',
          content: systemPrompt
        });
      }

      const requestBody = {
        model: this.config.model,
        messages: finalMessages,
        stream: true,
        options: {
          temperature: options?.temperature || this.config.temperature,
        }
      };

      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line) as OllamaStreamResponse;
              if (data.message?.content) {
                const content = data.message.content;
                if (options?.onProgress) {
                  options.onProgress(content);
                }
                yield content;
              }
            } catch (e) {
              console.error('Failed to parse streaming response:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming chat completion failed:', error);
      throw error;
    }
  }

  /**
   * Pull/download a model
   */
  async pullModel(modelName: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.status}`);
      }

      // Wait for model to be downloaded
      const reader = response.body?.getReader();
      if (reader) {
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      }

      console.log(`✅ Model ${modelName} pulled successfully`);
      
      // Refresh available models
      await this.checkAvailability();
    } catch (error) {
      console.error('Failed to pull model:', error);
      throw error;
    }
  }

  /**
   * Test the connection with a simple prompt
   */
  async testConnection(): Promise<boolean> {
    try {
      const testMessage: OllamaMessage = {
        role: 'user',
        content: 'Hello, please respond with "OK" if you are working.'
      };

      const response = await this.generateChatCompletion([testMessage], {
        temperature: 0.1
      });

      return !!response.message?.content;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const ollamaApi = new OllamaApiService();
