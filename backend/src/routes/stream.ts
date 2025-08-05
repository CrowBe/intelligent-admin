import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { asyncHandler, CustomError } from '../middleware/errorHandler.js';
import { chatService } from '../services/chat.js';
import { getOpenAIService } from '../services/openai.js';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Validation middleware
const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }
  next();
};

// Mock auth middleware (TODO: Replace with real JWT auth)
const mockAuth = (req: any, res: any, next: any) => {
  req.user = { id: '1' }; // Mock user ID
  next();
};

// POST /api/v1/stream/chat/:sessionId
router.post('/chat/:sessionId',
  mockAuth,
  [
    param('sessionId').isString().notEmpty(),
    body('content').isString().trim().isLength({ min: 1, max: 2000 }),
    body('role').optional().isIn(['user', 'system']),
  ],
  validateRequest,
  asyncHandler(async (req: any, res) => {
    const openaiService = getOpenAIService();
    if (!openaiService.isAvailable()) {
      throw new CustomError('AI service is not available - OpenAI API key required', 503);
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      // Verify session exists and belongs to user
      const session = await prisma.chatSession.findFirst({
        where: {
          id: req.params.sessionId,
          userId: req.user.id,
          deletedAt: null,
        },
      });

      if (!session) {
        sendEvent('error', { message: 'Session not found' });
        res.end();
        return;
      }

      // Save user message
      const userMessage = await prisma.message.create({
        data: {
          sessionId: req.params.sessionId,
          role: req.body.role || 'user',
          content: req.body.content,
          metadata: JSON.stringify({}),
        },
      });

      sendEvent('user_message', {
        id: userMessage.id,
        content: userMessage.content,
        timestamp: userMessage.timestamp,
      });

      // Get conversation history
      const recentMessages = await prisma.message.findMany({
        where: {
          sessionId: req.params.sessionId,
          deletedAt: null,
        },
        orderBy: {
          timestamp: 'asc',
        },
        take: 20,
      });

      // Convert to ChatMessage format (excluding the user message we just added)
      const conversationHistory = recentMessages
        .slice(0, -1)
        .map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        }));

      // Parse session context
      const contextData = JSON.parse(session.contextData);

      // Build messages for AI
      const messages = openaiService.buildChatMessages(
        req.body.content,
        conversationHistory,
        undefined,
        contextData
      );

      sendEvent('ai_start', { message: 'AI is thinking...' });

      // Stream AI response
      let fullResponse = '';
      const responseStartTime = Date.now();

      const streamGenerator = openaiService.chatCompletionStream({
        messages,
        temperature: 0.7,
      });

      for await (const chunk of streamGenerator) {
        if (chunk.finished) {
          break;
        }

        fullResponse += chunk.content;
        sendEvent('ai_chunk', {
          content: chunk.content,
          partial_response: fullResponse,
        });
      }

      const processingTime = Date.now() - responseStartTime;

      // Generate suggestions
      const suggestions = await openaiService.generateSuggestions(
        [...conversationHistory, { role: 'user', content: req.body.content }],
        contextData
      );

      // Save AI response
      const assistantMessage = await prisma.message.create({
        data: {
          sessionId: req.params.sessionId,
          role: 'assistant',
          content: fullResponse,
          metadata: JSON.stringify({
            suggestions,
            streaming: true,
          }),
          processingTimeMs: processingTime,
        },
      });

      // Update session
      await prisma.chatSession.update({
        where: { id: req.params.sessionId },
        data: {
          lastActivityAt: new Date(),
          messageCount: { increment: 2 },
        },
      });

      sendEvent('ai_complete', {
        id: assistantMessage.id,
        content: fullResponse,
        suggestions,
        processingTime,
        timestamp: assistantMessage.timestamp,
      });

      sendEvent('done', { message: 'Stream complete' });
      res.end();

    } catch (error) {
      sendEvent('error', {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      res.end();
    }
  })
);

// GET /api/v1/stream/health
router.get('/health', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    openai_available: getOpenAIService().isAvailable(),
  });

  res.end();
});

export { router as streamRoutes };