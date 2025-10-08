import { Router, Request, Response } from 'express';
import LearningService from './LearningService';
import { Difficulty } from '@prisma/client';

const router = Router();
const learningService = new LearningService();

// Middleware to extract userId from JWT (simplified for now)
// In production, use proper JWT middleware
const getUserId = (req: Request): string => {
  // TODO: Extract from JWT token
  // For now, accept from header or body for testing
  return req.headers['x-user-id'] as string || req.body.userId || 'test-user-id';
};

// ============================================
// GET /api/learning/daily
// Get today's 3 topics
// ============================================
router.get('/daily', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const dailyTopics = await learningService.getDailyTopics(userId);
    res.json(dailyTopics);
  } catch (error: any) {
    console.error('Error getting daily topics:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET /api/learning/topic/:topicId
// Get topic content with selected difficulty
// ============================================
router.get('/topic/:topicId', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { topicId } = req.params;
    const difficulty = (req.query.difficulty as Difficulty) || Difficulty.MEDIUM;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

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
router.post('/topic/:topicId/mark-read', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { topicId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const result = await learningService.markTopicAsRead(userId, topicId);
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
router.get('/quiz/:topicId', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { topicId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

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
router.post('/quiz/:topicId/submit', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { topicId } = req.params;
    const { answers } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

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
router.get('/progress', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const progress = await learningService.getUserProgress(userId);
    res.json(progress);
  } catch (error: any) {
    console.error('Error getting user progress:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
