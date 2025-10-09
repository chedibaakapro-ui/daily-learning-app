import axios from 'axios';
import { config } from '../../../lib/config';

const API_URL = `${config.apiUrl}/api/topics`;

// Get auth headers with JWT token
const getHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

interface TopicData {
  title: string;
  content: string;
  category: string;
  difficulty: string;
}

class TopicsApi {
  static async getAllTopics() {
    const response = await axios.get(API_URL, {
      headers: getHeaders()
    });
    return response.data;
  }

  static async createTopic(data: TopicData) {
    const response = await axios.post(API_URL, data, {
      headers: getHeaders()
    });
    return response.data;
  }
}

export default TopicsApi;