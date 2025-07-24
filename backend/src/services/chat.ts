import { PrismaClient } from '@prisma/client';
import { getOpenAIService, ChatMessage, SYSTEM_PROMPTS } from './openai.js';
import { logger } from '../utils/logger.js';
import { CustomError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

// Types
export interface CreateSessionData {
  userId: string;
  title?: string;
  contextData?: Record<string, any>;
}

export interface SendMessageData {
  sessionId: string;
  userId: string;
  content: string;
  role?: 'user' | 'system';
}

export interface ChatResponse {
  messageId: string;
  content: string;
  suggestions?: string[];
  processingTime: number;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface SessionSummary {
  id: string;
  title: string;
  lastMessage?: string;
  lastActivityAt: Date;
  messageCount: number;
  contextData?: Record<string, any>;
}

// Chat Service Class
export class ChatService {
  private static instance: ChatService;

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Create a new chat session
   */
  async createSession(data: CreateSessionData): Promise<SessionSummary> {
    try {
      const session = await prisma.chatSession.create({
        data: {
          userId: data.userId,
          title: data.title || 'New Chat',
          contextData: JSON.stringify(data.contextData || {}),
          messageCount: 0,
          lastActivityAt: new Date(),
        },
      });

      logger.info('Chat session created', {
        sessionId: session.id,
        userId: data.userId,
        title: session.title,
      });

      return {
        id: session.id,
        title: session.title,
        lastActivityAt: session.lastActivityAt,
        messageCount: session.messageCount,
        contextData: JSON.parse(session.contextData),
      };
    } catch (error) {
      logger.error('Failed to create chat session', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: data.userId,
      });
      throw new CustomError('Failed to create chat session', 500);
    }
  }

  /**
   * Get user's chat sessions
   */
  async getUserSessions(userId: string): Promise<SessionSummary[]> {
    try {
      const sessions = await prisma.chatSession.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        orderBy: {
          lastActivityAt: 'desc',
        },
        include: {
          messages: {
            where: { deletedAt: null },
            orderBy: { timestamp: 'desc' },
            take: 1,
            select: { content: true },
          },
        },
      });

      return sessions.map(session => ({
        id: session.id,
        title: session.title || 'Untitled Chat',
        lastMessage: session.messages[0]?.content,
        lastActivityAt: session.lastActivityAt,
        messageCount: session.messageCount,
        contextData: JSON.parse(session.contextData),
      }));
    } catch (error) {
      logger.error('Failed to get user sessions', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      });
      throw new CustomError('Failed to retrieve chat sessions', 500);
    }
  }

  /**
   * Get session messages
   */
  async getSessionMessages(sessionId: string, userId: string, limit = 50): Promise<any[]> {
    try {
      // Verify session belongs to user
      const session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId,
          deletedAt: null,
        },
      });

      if (!session) {
        throw new CustomError('Session not found', 404);
      }

      const messages = await prisma.message.findMany({
        where: {
          sessionId,
          deletedAt: null,
        },
        orderBy: {
          timestamp: 'asc',
        },
        take: limit,
      });

      return messages.map(message => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
        metadata: JSON.parse(message.metadata),
        tokenCount: message.tokenCount,
        processingTimeMs: message.processingTimeMs,
      }));
    } catch (error) {
      if (error instanceof CustomError) throw error;
      
      logger.error('Failed to get session messages', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId,
        userId,
      });
      throw new CustomError('Failed to retrieve messages', 500);
    }
  }

  /**
   * Send message and get AI response
   */
  async sendMessage(data: SendMessageData): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      // Verify session exists and belongs to user
      const session = await prisma.chatSession.findFirst({
        where: {
          id: data.sessionId,
          userId: data.userId,
          deletedAt: null,
        },
      });

      if (!session) {
        throw new CustomError('Session not found', 404);
      }

      // Save user message
      const userMessage = await prisma.message.create({
        data: {
          sessionId: data.sessionId,
          role: data.role || 'user',
          content: data.content,
          metadata: JSON.stringify({}),
        },
      });

      // Get conversation history
      const recentMessages = await prisma.message.findMany({
        where: {
          sessionId: data.sessionId,
          deletedAt: null,
        },
        orderBy: {
          timestamp: 'asc',
        },
        take: 20, // Limit to prevent token overflow
      });

      // Convert to ChatMessage format
      const conversationHistory: ChatMessage[] = recentMessages
        .slice(0, -1) // Exclude the message we just added
        .map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        }));

      // Parse session context
      const contextData = JSON.parse(session.contextData);

      // Determine system prompt based on context
      let systemPrompt = SYSTEM_PROMPTS.default;
      if (contextData.businessType) {
        systemPrompt += `\n\nUser's business type: ${contextData.businessType}`;
      }

      // Generate AI response
      const openaiService = getOpenAIService();
      const messages = openaiService.buildChatMessages(
        data.content,
        conversationHistory,
        systemPrompt,
        contextData
      );

      const aiResponse = await openaiService.chatCompletion({
        messages,
        temperature: 0.7,
      });

      // Generate suggestions
      const suggestions = await openaiService.generateSuggestions(
        [...conversationHistory, { role: 'user', content: data.content }],
        contextData
      );

      // Save AI response
      const assistantMessage = await prisma.message.create({
        data: {
          sessionId: data.sessionId,
          role: 'assistant',
          content: aiResponse.content,
          metadata: JSON.stringify({
            suggestions,
            model: aiResponse.model,
            finishReason: aiResponse.finishReason,
          }),
          tokenCount: aiResponse.tokenUsage.totalTokens,
          processingTimeMs: aiResponse.processingTime,
        },
      });

      // Update session
      await prisma.chatSession.update({
        where: { id: data.sessionId },
        data: {
          lastActivityAt: new Date(),
          messageCount: { increment: 2 }, // User + assistant message
        },
      });

      const totalProcessingTime = Date.now() - startTime;

      logger.info('Message processed successfully', {
        sessionId: data.sessionId,
        userId: data.userId,
        messageLength: data.content.length,
        responseLength: aiResponse.content.length,
        tokensUsed: aiResponse.tokenUsage.totalTokens,
        processingTime: totalProcessingTime,
      });

      return {
        messageId: assistantMessage.id,
        content: aiResponse.content,
        suggestions,
        processingTime: totalProcessingTime,
        tokenUsage: aiResponse.tokenUsage,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      if (error instanceof CustomError) throw error;

      logger.error('Failed to process message', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: data.sessionId,
        userId: data.userId,
        processingTime,
      });
      
      throw new CustomError('Failed to process message', 500);
    }
  }

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: string, userId: string): Promise<void> {
    try {
      // Verify session belongs to user
      const session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId,
          deletedAt: null,
        },
      });

      if (!session) {
        throw new CustomError('Session not found', 404);
      }

      // Soft delete session and messages
      await prisma.$transaction([
        prisma.message.updateMany({
          where: { sessionId },
          data: { deletedAt: new Date() },
        }),
        prisma.chatSession.update({
          where: { id: sessionId },
          data: { deletedAt: new Date() },
        }),
      ]);

      logger.info('Chat session deleted', {
        sessionId,
        userId,
      });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      
      logger.error('Failed to delete session', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId,
        userId,
      });
      throw new CustomError('Failed to delete session', 500);
    }
  }

  /**
   * Update session title
   */
  async updateSessionTitle(sessionId: string, userId: string, title: string): Promise<void> {
    try {
      const result = await prisma.chatSession.updateMany({
        where: {
          id: sessionId,
          userId,
          deletedAt: null,
        },
        data: { title },
      });

      if (result.count === 0) {
        throw new CustomError('Session not found', 404);
      }

      logger.info('Session title updated', {
        sessionId,
        userId,
        title,
      });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      
      logger.error('Failed to update session title', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId,
        userId,
      });
      throw new CustomError('Failed to update session title', 500);
    }
  }

  /**
   * Get chat statistics
   */
  async getChatStats(userId: string): Promise<{
    totalSessions: number;
    totalMessages: number;
    totalTokensUsed: number;
    averageSessionLength: number;
  }> {
    try {
      const [sessionStats, messageStats] = await Promise.all([
        prisma.chatSession.aggregate({
          where: {
            userId,
            deletedAt: null,
          },
          _count: { id: true },
          _avg: { messageCount: true },
        }),
        prisma.message.aggregate({
          where: {
            session: {
              userId,
              deletedAt: null,
            },
            deletedAt: null,
          },
          _count: { id: true },
          _sum: { tokenCount: true },
        }),
      ]);

      return {
        totalSessions: sessionStats._count.id,
        totalMessages: messageStats._count.id,
        totalTokensUsed: messageStats._sum.tokenCount || 0,
        averageSessionLength: sessionStats._avg.messageCount || 0,
      };
    } catch (error) {
      logger.error('Failed to get chat stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      });
      throw new CustomError('Failed to retrieve chat statistics', 500);
    }
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance();