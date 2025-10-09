import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import TopicsService from './TopicsService';

const router = Router();
const topicsService = new TopicsService();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all topics
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const topics = await topicsService.getAllTopics();
    res.json(topics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new topic (admin only - for now just authenticated)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { 
      title, 
      categoryId, 
      contentSimple, 
      contentMedium, 
      contentAdvanced, 
      estimatedReadTime 
    } = req.body;
    
    if (!title || !categoryId || !contentSimple || !contentMedium || !contentAdvanced) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, categoryId, contentSimple, contentMedium, contentAdvanced' 
      });
    }

    const topic = await topicsService.createTopic(
      title,
      categoryId,
      contentSimple,
      contentMedium,
      contentAdvanced,
      estimatedReadTime
    );
    
    res.status(201).json(topic);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;