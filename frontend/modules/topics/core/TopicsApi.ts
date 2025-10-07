import axios from 'axios';
import { config } from '../../../lib/config';
const API_URL = `${config.apiUrl}/api/topics`;

interface TopicData {
  title: string;
  content: string;
  category: string;
  difficulty: string;
}

class TopicsApi {
  static async getAllTopics() {
    const response = await axios.get(API_URL);
    return response.data;
  }

  static async createTopic(data: TopicData) {
    const response = await axios.post(API_URL, data);
    return response.data;
  }
}

export default TopicsApi;