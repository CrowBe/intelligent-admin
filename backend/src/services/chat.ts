import { prisma } from '../db/index.js';
import { getOpenAIService, ChatMessage, SYSTEM_PROMPTS } from './openai.js';
import { industryKnowledgeService, IndustryContext } from './industryKnowledge.js';
import { conversationIntelligenceService } from './conversationIntelligence.js';
import { proactiveDocumentRequestsService, DocumentSuggestion } from './proactiveDocumentRequests.js';
import { workflowAdaptationService, WorkflowAdaptation } from './workflowAdaptation.js';
import { ollamaService } from './ollamaService.js';
import { logger } from '../utils/logger.js';
import { CustomError } from '../middleware/errorHandler.js';



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
  documentSuggestions?: DocumentSuggestion[];
  workflowAdaptations?: WorkflowAdaptation[];
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

      // Analyze conversation for business context discovery
      const conversationAnalysis = await conversationIntelligenceService.analyzeForBusinessContext(
        data.userId,
        data.content,
        conversationHistory
      );

      // Get document suggestions based on conversation content
      const documentSuggestions = await proactiveDocumentRequestsService.analyzeMessageForDocumentRequests(
        data.userId,
        data.content,
        data.sessionId
      );

      // Get workflow adaptations for this user
      const workflowAdaptations = await workflowAdaptationService.getWorkflowAdaptations(data.userId);

      // Get relevant industry context
      const industryContext = await this.getIndustryContext(data.content, contextData);

      // Determine system prompt based on context
      let systemPrompt = SYSTEM_PROMPTS.default;
      if (contextData.businessType) {
        systemPrompt += `\n\nUser's business type: ${contextData.businessType}`;
      }

      // Add discovered business context to system prompt
      if (conversationAnalysis.contextClues.length > 0) {
        systemPrompt += this.buildBusinessContextPrompt(conversationAnalysis.contextClues);
      }

      // Add industry knowledge context
      if (industryContext) {
        systemPrompt += this.buildIndustryContextPrompt(industryContext);
      }

      // Add workflow adaptation context
      if (workflowAdaptations.length > 0) {
        systemPrompt += this.buildWorkflowAdaptationPrompt(workflowAdaptations);
      }

      // Add document suggestions context
      if (documentSuggestions.length > 0) {
        systemPrompt += this.buildDocumentSuggestionsPrompt(documentSuggestions);
      }

      // Generate AI response - try Ollama first, fallback to OpenAI
      let aiResponse: any;
      let suggestions: string[] = [];
      
      if (ollamaService.getAvailability()) {
        try {
          logger.info('Using Ollama for chat completion');
          
          // Prepare messages for Ollama
          const ollamaMessages = [
            ...conversationHistory,
            { role: 'user' as const, content: data.content }
          ];
          
          const ollamaResponse = await ollamaService.generateChatCompletion(
            ollamaMessages,
            { 
              systemPrompt,
              temperature: 0.7,
              maxTokens: 2048
            }
          );
          
          aiResponse = {
            content: ollamaResponse.content,
            model: ollamaResponse.model,
            finishReason: 'stop',
            tokenUsage: {
              promptTokens: 0,
              completionTokens: ollamaResponse.tokens,
              totalTokens: ollamaResponse.tokens
            },
            processingTime: ollamaResponse.processingTime
          };
          
          // Simple rule-based suggestions for Ollama
          suggestions = this.generateSimpleSuggestions(data.content, conversationHistory);
          
        } catch (error) {
          logger.warn('Ollama chat completion failed, falling back to OpenAI:', error);
          
          // Fallback to OpenAI
          const openaiService = getOpenAIService();
          const messages = openaiService.buildChatMessages(
            data.content,
            conversationHistory,
            systemPrompt,
            contextData
          );

          aiResponse = await openaiService.chatCompletion({
            messages,
            temperature: 0.7,
          });

          suggestions = await openaiService.generateSuggestions(
            [...conversationHistory, { role: 'user', content: data.content }],
            contextData
          );
        }
      } else {
        // Use OpenAI directly
        const openaiService = getOpenAIService();
        const messages = openaiService.buildChatMessages(
          data.content,
          conversationHistory,
          systemPrompt,
          contextData
        );

        aiResponse = await openaiService.chatCompletion({
          messages,
          temperature: 0.7,
        });

        suggestions = await openaiService.generateSuggestions(
          [...conversationHistory, { role: 'user', content: data.content }],
          contextData
        );
      }

      // Enhance response with conversation intelligence
      const enhancedContent = await conversationIntelligenceService.enhanceResponse(
        data.userId,
        aiResponse.content,
        conversationAnalysis
      );

      // Save AI response
      const assistantMessage = await prisma.message.create({
        data: {
          sessionId: data.sessionId,
          role: 'assistant',
          content: enhancedContent,
          metadata: JSON.stringify({
            suggestions,
            documentSuggestions,
            workflowAdaptations,
            model: aiResponse.model,
            finishReason: aiResponse.finishReason,
            contextClues: conversationAnalysis.contextClues,
            smartSuggestions: conversationAnalysis.suggestions,
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
        content: enhancedContent,
        suggestions,
        documentSuggestions,
        workflowAdaptations,
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

  /**
   * Get relevant industry context for a user message
   */
  private async getIndustryContext(
    message: string, 
    sessionContext: Record<string, any>
  ): Promise<IndustryContext | null> {
    try {
      // Only fetch industry context for messages that might benefit from it
      if (!this.needsIndustryContext(message)) {
        return null;
      }

      // Get industry context based on message content
      return await industryKnowledgeService.getIndustryContext(message, 5);
    } catch (error) {
      logger.error('Failed to get industry context:', error);
      return null; // Fail gracefully
    }
  }

  /**
   * Determine if a message needs industry context
   */
  private needsIndustryContext(message: string): boolean {
    const industryKeywords = [
      // Electrical terms
      'electrical', 'wiring', 'voltage', 'current', 'circuit', 'switchboard',
      'cable', 'conduit', 'earthing', 'testing', 'installation', 'meter',
      // Regulations and standards
      'regulation', 'standard', 'compliance', 'as/nzs', 'esv', 'safety',
      'code', 'requirement', 'certification', 'license',
      // Business terms
      'pricing', 'quote', 'estimate', 'cost', 'price', 'invoice',
      'customer', 'client', 'job', 'project', 'service'
    ];

    const messageLower = message.toLowerCase();
    return industryKeywords.some(keyword => messageLower.includes(keyword));
  }

  /**
   * Build industry context prompt addition
   */
  private buildIndustryContextPrompt(context: IndustryContext): string {
    let contextPrompt = '\n\n--- RELEVANT INDUSTRY KNOWLEDGE ---\n';

    // Add regulations
    if (context.regulations.length > 0) {
      contextPrompt += '\nREGULATIONS:\n';
      context.regulations.forEach(item => {
        contextPrompt += `- ${item.title}: ${item.content.substring(0, 200)}...\n`;
      });
    }

    // Add standards
    if (context.standards.length > 0) {
      contextPrompt += '\nSTANDARDS:\n';
      context.standards.forEach(item => {
        contextPrompt += `- ${item.title}: ${item.content.substring(0, 200)}...\n`;
      });
    }

    // Add safety information
    if (context.safety.length > 0) {
      contextPrompt += '\nSAFETY REQUIREMENTS:\n';
      context.safety.forEach(item => {
        contextPrompt += `- ${item.title}: ${item.content.substring(0, 200)}...\n`;
      });
    }

    // Add pricing guidance
    if (context.pricing.length > 0) {
      contextPrompt += '\nPRICING GUIDANCE:\n';
      context.pricing.forEach(item => {
        contextPrompt += `- ${item.title}: ${item.content.substring(0, 200)}...\n`;
      });
    }

    contextPrompt += '\nPlease reference this industry knowledge when providing responses. ';
    contextPrompt += 'Always prioritize safety and compliance requirements. ';
    contextPrompt += 'Provide specific regulation or standard references when applicable.\n';
    contextPrompt += '--- END INDUSTRY KNOWLEDGE ---\n';

    return contextPrompt;
  }

  /**
   * Build business context prompt addition from discovered clues
   */
  private buildBusinessContextPrompt(contextClues: Array<{type: string, value: string, confidence: number, evidence: string}>): string {
    let contextPrompt = '\n\n--- DISCOVERED BUSINESS CONTEXT ---\n';

    // Group clues by type
    const cluesByType = contextClues.reduce((acc, clue) => {
      if (!acc[clue.type]) acc[clue.type] = [];
      acc[clue.type].push(clue);
      return acc;
    }, {} as Record<string, typeof contextClues>);

    // Add industry context
    if (cluesByType.industry) {
      const industryClue = cluesByType.industry.sort((a, b) => b.confidence - a.confidence)[0];
      contextPrompt += `\nINDUSTRY: User appears to work in ${industryClue.value} (confidence: ${Math.round(industryClue.confidence * 100)}%)\n`;
      contextPrompt += `Evidence: ${industryClue.evidence}\n`;
    }

    // Add location context
    if (cluesByType.location) {
      const locationClue = cluesByType.location.sort((a, b) => b.confidence - a.confidence)[0];
      contextPrompt += `\nLOCATION: User appears to be in ${locationClue.value} (confidence: ${Math.round(locationClue.confidence * 100)}%)\n`;
      contextPrompt += `Evidence: ${locationClue.evidence}\n`;
    }

    // Add service type context
    if (cluesByType.service_type) {
      const serviceClue = cluesByType.service_type.sort((a, b) => b.confidence - a.confidence)[0];
      contextPrompt += `\nSERVICE TYPE: User appears to work on ${serviceClue.value} projects (confidence: ${Math.round(serviceClue.confidence * 100)}%)\n`;
      contextPrompt += `Evidence: ${serviceClue.evidence}\n`;
    }

    // Add work scale context
    if (cluesByType.work_scale) {
      const scaleClue = cluesByType.work_scale.sort((a, b) => b.confidence - a.confidence)[0];
      contextPrompt += `\nWORK SCALE: User appears to handle ${scaleClue.value.replace('_', ' ')} (confidence: ${Math.round(scaleClue.confidence * 100)}%)\n`;
      contextPrompt += `Evidence: ${scaleClue.evidence}\n`;
    }

    contextPrompt += '\nUse this context to provide more relevant and specific guidance. ';
    contextPrompt += 'Ask natural follow-up questions to confirm or discover additional context. ';
    contextPrompt += 'Suggest relevant standards and regulations based on discovered context.\n';
    contextPrompt += '--- END BUSINESS CONTEXT ---\n';

    return contextPrompt;
  }
  
  /**
   * Generate simple rule-based suggestions when using Ollama
   */
  private generateSimpleSuggestions(userMessage: string, conversationHistory: ChatMessage[]): string[] {
    const suggestions: string[] = [];
    const content = userMessage.toLowerCase();
    
    // Electrical work suggestions
    if (content.includes('electrical') || content.includes('wiring') || content.includes('voltage')) {
      suggestions.push('Tell me more about the electrical regulations');
      suggestions.push('What safety standards apply?');
      suggestions.push('Help with AS/NZS 3000 requirements');
    }
    
    // Quote/pricing suggestions
    if (content.includes('quote') || content.includes('price') || content.includes('cost')) {
      suggestions.push('Help me create a detailed quote');
      suggestions.push('What should I include in pricing?');
      suggestions.push('Show me similar project costs');
    }
    
    // Job/project suggestions
    if (content.includes('job') || content.includes('project') || content.includes('work')) {
      suggestions.push('Help plan this project');
      suggestions.push('What permits might I need?');
      suggestions.push('Timeline and scheduling advice');
    }
    
    // General business suggestions
    if (suggestions.length === 0) {
      suggestions.push('Tell me more about your business');
      suggestions.push('What regulations should I know?');
      suggestions.push('Help with industry standards');
    }
    
    return suggestions.slice(0, 3);
  }

  /**
   * Build workflow adaptation prompt addition
   */
  private buildWorkflowAdaptationPrompt(adaptations: WorkflowAdaptation[]): string {
    let contextPrompt = '\n\n--- WORKFLOW ADAPTATIONS ---\n';

    adaptations.forEach(adaptation => {
      switch (adaptation.type) {
        case 'follow_up_timing':
          contextPrompt += `\nFOLLOW-UP TIMING: ${adaptation.recommendation}\n`;
          contextPrompt += `Confidence: ${Math.round(adaptation.confidence * 100)}%\n`;
          break;

        case 'communication_tone':
          contextPrompt += `\nCOMMUNICATION TONE: ${adaptation.recommendation}\n`;
          contextPrompt += `Confidence: ${Math.round(adaptation.confidence * 100)}%\n`;
          break;

        case 'task_batching':
          contextPrompt += `\nTASK BATCHING: ${adaptation.recommendation}\n`;
          contextPrompt += `Confidence: ${Math.round(adaptation.confidence * 100)}%\n`;
          break;

        case 'priority_weighting':
          contextPrompt += `\nPRIORITY WEIGHTING: ${adaptation.recommendation}\n`;
          contextPrompt += `Confidence: ${Math.round(adaptation.confidence * 100)}%\n`;
          break;
      }
    });

    contextPrompt += '\nApply these learned preferences when providing guidance and suggestions.\n';
    contextPrompt += '--- END WORKFLOW ADAPTATIONS ---\n';

    return contextPrompt;
  }

  /**
   * Build document suggestions prompt addition
   */
  private buildDocumentSuggestionsPrompt(suggestions: DocumentSuggestion[]): string {
    let contextPrompt = '\n\n--- DOCUMENT SUGGESTIONS ---\n';

    contextPrompt += 'Based on the conversation, the following documents may be helpful:\n\n';

    suggestions.forEach((suggestion, index) => {
      contextPrompt += `${index + 1}. ${suggestion.type.replace('_', ' ').toUpperCase()} (${suggestion.priority} priority)\n`;
      contextPrompt += `   Reason: ${suggestion.reason}\n`;
      contextPrompt += `   Message: ${suggestion.message}\n\n`;
    });

    contextPrompt += 'You should mention these document suggestions naturally in your response when appropriate.\n';
    contextPrompt += 'Focus on the high-priority suggestions first.\n';
    contextPrompt += '--- END DOCUMENT SUGGESTIONS ---\n';

    return contextPrompt;
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance();