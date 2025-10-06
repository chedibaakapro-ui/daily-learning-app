import TopicsRepository from './TopicsRepository';

class TopicsService {
  private topicsRepository: TopicsRepository;

  constructor() {
    this.topicsRepository = new TopicsRepository();
  }

  async getAllTopics() {
    return await this.topicsRepository.findAllTopics();
  }

  async createTopic(title: string, content: string, category: string, difficulty: string) {
    return await this.topicsRepository.createTopic(title, content, category, difficulty);
  }
}

export default TopicsService;