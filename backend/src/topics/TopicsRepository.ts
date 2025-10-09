import prisma from '../lib/prisma';

class TopicsRepository {
  async findAllTopics() {
    return await prisma.topic.findMany({
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTopic(
    title: string,
    categoryId: string,
    contentSimple: string,
    contentMedium: string,
    contentAdvanced: string,
    estimatedReadTime: number = 2
  ) {
    return await prisma.topic.create({
      data: {
        title,
        categoryId,
        contentSimple,
        contentMedium,
        contentAdvanced,
        estimatedReadTime,
      },
      include: {
        category: true,
      },
    });
  }
}

export default TopicsRepository;