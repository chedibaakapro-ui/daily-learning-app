import prisma from '../lib/prisma';

class TopicsRepository {
  async findAllTopics() {
    return await prisma.topic.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTopic(title: string, content: string, category: string, difficulty: string) {
    return await prisma.topic.create({
      data: {
        title,
        content,
        category,
        difficulty,
      },
    });
  }
}

export default TopicsRepository;