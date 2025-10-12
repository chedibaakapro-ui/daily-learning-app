import { Difficulty } from '@prisma/client';
import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import LearningService from './LearningService';

const router = Router();
const learningService = new LearningService();

// Apply auth middleware to all routes
router.use(authMiddleware);

// ============================================
// GET /api/learning/daily
// Get today's 3 topics
// ============================================
router.get('/daily', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const dailyTopics = await learningService.getDailyTopics(userId);
    res.json(dailyTopics);
  } catch (error: any) {
    console.error('Error getting daily topics:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST /api/learning/daily/refresh
// Manually refresh daily topics
// ============================================
router.post('/daily/refresh', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const dailyTopics = await learningService.refreshDailyTopics(userId);
    res.json(dailyTopics);
  } catch (error: any) {
    console.error('Error refreshing daily topics:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET /api/learning/topic/:topicId
// Get topic content with selected difficulty
// ============================================
router.get('/topic/:topicId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { topicId } = req.params;
    const difficulty = (req.query.difficulty as Difficulty) || Difficulty.MEDIUM;

    const topicContent = await learningService.getTopicContent(userId, topicId, difficulty);
    res.json(topicContent);
  } catch (error: any) {
    console.error('Error getting topic content:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST /api/learning/topic/:topicId/mark-read
// Mark topic as read
// ============================================
router.post('/topic/:topicId/mark-read', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { topicId } = req.params;
    const { difficulty } = req.body;

    const result = await learningService.markTopicAsRead(userId, topicId, difficulty);
    res.json(result);
  } catch (error: any) {
    console.error('Error marking topic as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET /api/learning/quiz/:topicId
// Get quiz questions for a topic
// ============================================
router.get('/quiz/:topicId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { topicId } = req.params;

    const quiz = await learningService.getQuiz(userId, topicId);
    res.json(quiz);
  } catch (error: any) {
    console.error('Error getting quiz:', error);
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// POST /api/learning/quiz/:topicId/submit
// Submit quiz answers
// ============================================
router.post('/quiz/:topicId/submit', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { topicId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array required' });
    }

    const result = await learningService.submitQuiz(userId, topicId, answers);
    res.json(result);
  } catch (error: any) {
    console.error('Error submitting quiz:', error);
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// GET /api/learning/progress
// Get user progress stats
// ============================================
router.get('/progress', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const progress = await learningService.getUserProgress(userId);
    res.json(progress);
  } catch (error: any) {
    console.error('Error getting user progress:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;