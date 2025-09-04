import { Router } from 'express';
import { NotificationService, NotificationType } from '../services/notificationService.js';
import { z } from 'zod';

export const notificationRouter = Router();

// Lazily initialize the service to ensure DI container is ready
let notificationService: NotificationService | null = null;

const getNotificationService = (): NotificationService => {
  if (!notificationService) {
    notificationService = new NotificationService();
  }
  return notificationService;
};

// Get user's notification preferences
notificationRouter.get('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = await getNotificationService().getPreferences(userId);
    res.json({ preferences });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Update notification preferences
notificationRouter.post('/preferences', async (req, res) => {
  try {
    const schema = z.object({
      userId: z.string(),
      type: z.nativeEnum(NotificationType),
      enabled: z.boolean(),
      timing: z.object({
        startHour: z.number(),
        startMinute: z.number(),
        endHour: z.number(),
        endMinute: z.number(),
        timezone: z.string(),
        daysOfWeek: z.array(z.number())
      }).optional(),
      channels: z.object({
        push: z.boolean(),
        email: z.boolean(),
        sms: z.boolean()
      }).optional()
    });

    const validated = schema.parse(req.body);
    const preference = await getNotificationService().upsertPreferences(validated);
    res.json({ preference });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

// Save FCM token
notificationRouter.post('/token', async (req, res) => {
  try {
    const { userId, token, platform = 'web' } = req.body;
    const saved = await getNotificationService().saveToken(userId, token, platform);
    res.json({ success: true, token: saved });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Generate morning brief
notificationRouter.post('/morning-brief/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const brief = await getNotificationService().generateMorningBrief(userId);
    res.json({ brief });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Send test notification
notificationRouter.post('/test', async (req, res) => {
  try {
    const { userId, title, body, type } = req.body;
    const result = await getNotificationService().sendPushNotification(userId, {
      title,
      body,
      type: type || NotificationType.CUSTOM
    });
    res.json({ success: true, notification: result });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get notification history
notificationRouter.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = Number(req.query.limit) || 50;
    const history = await getNotificationService().getHistory(userId, limit);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Mark notification as read
notificationRouter.post('/read/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const updated = await getNotificationService().markAsRead(notificationId);
    res.json({ success: true, notification: updated });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});
