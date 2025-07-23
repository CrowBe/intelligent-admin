import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { asyncHandler, CustomError } from '../middleware/errorHandler.js';
import { chatService } from '../services/chat.js';
import { openaiService } from '../services/openai.js';

const router = Router();

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

// GET /api/v1/chat/sessions
router.get('/sessions', 
  mockAuth,
  asyncHandler(async (req: any, res) => {
    const sessions = await chatService.getUserSessions(req.user.id);
    res.json({ sessions });
  })
);

// POST /api/v1/chat/sessions
router.post('/sessions',
  mockAuth,
  [
    body('title').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('contextData').optional().isObject(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res) => {
    const session = await chatService.createSession({
      userId: req.user.id,
      title: req.body.title,
      contextData: req.body.contextData,
    });
    
    res.status(201).json({ session });
  })
);

// GET /api/v1/chat/sessions/:sessionId
router.get('/sessions/:sessionId',
  mockAuth,
  [param('sessionId').isString().notEmpty()],
  validateRequest,
  asyncHandler(async (req: any, res) => {
    const messages = await chatService.getSessionMessages(
      req.params.sessionId,
      req.user.id,
      parseInt(req.query.limit) || 50
    );
    
    res.json({ messages });
  })
);

// POST /api/v1/chat/sessions/:sessionId/messages
router.post('/sessions/:sessionId/messages',
  mockAuth,
  [
    param('sessionId').isString().notEmpty(),
    body('content').isString().trim().isLength({ min: 1, max: 2000 }),
    body('role').optional().isIn(['user', 'system']),
  ],
  validateRequest,
  asyncHandler(async (req: any, res) => {
    if (!openaiService.isAvailable()) {
      throw new CustomError('AI service is not available - OpenAI API key required', 503);
    }

    const response = await chatService.sendMessage({
      sessionId: req.params.sessionId,
      userId: req.user.id,
      content: req.body.content,
      role: req.body.role,
    });
    
    res.json(response);
  })
);

// GET /api/v1/chat/sessions/:sessionId/messages
router.get('/sessions/:sessionId/messages',
  mockAuth,
  [
    param('sessionId').isString().notEmpty(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  asyncHandler(async (req: any, res) => {
    const messages = await chatService.getSessionMessages(
      req.params.sessionId,
      req.user.id,
      parseInt(req.query.limit as string) || 50
    );
    
    res.json({ messages });
  })
);

// PUT /api/v1/chat/sessions/:sessionId
router.put('/sessions/:sessionId',
  mockAuth,
  [
    param('sessionId').isString().notEmpty(),
    body('title').isString().trim().isLength({ min: 1, max: 100 }),
  ],
  validateRequest,
  asyncHandler(async (req: any, res) => {
    await chatService.updateSessionTitle(
      req.params.sessionId,
      req.user.id,
      req.body.title
    );
    
    res.json({ success: true });
  })
);

// DELETE /api/v1/chat/sessions/:sessionId
router.delete('/sessions/:sessionId',
  mockAuth,
  [param('sessionId').isString().notEmpty()],
  validateRequest,
  asyncHandler(async (req: any, res) => {
    await chatService.deleteSession(req.params.sessionId, req.user.id);
    res.json({ success: true });
  })
);

// GET /api/v1/chat/stats
router.get('/stats',
  mockAuth,
  asyncHandler(async (req: any, res) => {
    const stats = await chatService.getChatStats(req.user.id);
    res.json({ stats });
  })
);

// GET /api/v1/chat/config
router.get('/config',
  asyncHandler(async (req, res) => {
    const config = openaiService.getConfig();
    res.json({ config });
  })
);

export { router as chatRoutes };