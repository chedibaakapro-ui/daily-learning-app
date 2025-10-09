import TopicsRepository from './TopicsRepository';

class TopicsService {
  private topicsRepository: TopicsRepository;

  constructor() {
    this.topicsRepository = new TopicsRepository();
  }

  async getAllTopics() {
    return await this.topicsRepository.findAllTopics();
  }

  async createTopic(
    title: string,
    categoryId: string,
    contentSimple: string,
    contentMedium: string,
    contentAdvanced: string,
    estimatedReadTime?: number
  ) {
    return await this.topicsRepository.createTopic(
      title,
      categoryId,
      contentSimple,
      contentMedium,
      contentAdvanced,
      estimatedReadTime
    );
  }
}

export default TopicsService;