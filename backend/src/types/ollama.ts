/**
 * Ollama Service Types
 */

export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface OllamaApiResponse {
  message?: { content: string };
  eval_count?: number;
  done?: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
}

export interface OllamaModelInfo {
  name: string;
  model?: string;
  modified_at?: string;
  size?: number;
  digest?: string;
  details?: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface OllamaModelsResponse {
  models?: OllamaModelInfo[];
}

export interface EmailAnalysisResult {
  urgencyScore: number;
  category: 'urgent' | 'standard' | 'follow_up' | 'admin' | 'spam';
  businessRelevance: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  actionRequired: boolean;
  suggestedActions: string[];
  reasoning: string;
}

export interface EmailSummary {
  subject: string;
  snippet: string;
  priority: string;
}