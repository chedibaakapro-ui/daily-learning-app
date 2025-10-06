import { Router, Request, Response } from 'express';
import TopicsService from './TopicsService';

const router = Router();
const topicsService = new TopicsService();

router.get('/', async (req: Request, res: Response) => {
  try {
    const topics = await topicsService.getAllTopics();
    res.json(topics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, content, category, difficulty } = req.body;
    const topic = await topicsService.createTopic(title, content, category, difficulty);
    res.status(201).json(topic);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;