// Chat Service with Context Support
// Handles chat API calls with optional section context

import { api } from './api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    suggestions?: string[];
    actions?: string[];
    tokenCount?: number;
    processingTime?: number;
  };
}

export interface ChatContext {
  page?: string;
  section?: string;
  data?: any;
}

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
  context?: ChatContext;
}

export interface SendMessageResponse {
  message: ChatMessage;
  suggestions?: string[];
}

class ChatService {
  /**
   * Send a message with optional context
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const response = await api.post('/chat/message', {
        content: request.message,
        sessionId: request.sessionId,
        context: request.context
      });

      return {
        message: {
          id: response.id || this.generateId(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date(response.timestamp || Date.now()),
          metadata: response.metadata
        },
        suggestions: response.suggestions
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Send a contextual chat message
   */
  async sendContextualMessage(
    message: string,
    context: ChatContext
  ): Promise<SendMessageResponse> {
    return this.sendMessage({
      message,
      context
    });
  }

  /**
   * Create a new chat session
   */
  async createSession(title?: string): Promise<{ sessionId: string }> {
    try {
      const response = await api.post('/chat/sessions', { title });
      return { sessionId: response.sessionId };
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  /**
   * Get chat history for a session
   */
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const response = await api.get(`/chat/sessions/${sessionId}/messages`);
      return response.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      throw error;
    }
  }

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await api.post(`/chat/sessions/${sessionId}/delete`);
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

export const chatService = new ChatService();
