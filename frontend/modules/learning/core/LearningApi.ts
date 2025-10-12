import axios from 'axios';
import { config } from '../../../lib/config';

const API_URL = `${config.apiUrl}/api/learning`;

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

export interface DailyTopic {
  id: string;
  title: string;
  category: {
    name: string;
    icon: string | null;
  };
  estimatedReadTime: number;
  displayOrder: number;
}

export interface DailyTopicsResponse {
  date: Date;
  completedCount: number;
  isFullyCompleted: boolean;
  topics: DailyTopic[];
}

export interface TopicContent {
  id: string;
  title: string;
  content: string;
  difficulty: 'SIMPLE' | 'MEDIUM' | 'ADVANCED';
  category: {
    name: string;
    icon: string | null;
  };
  estimatedReadTime: number;
  progress: {
    status: string;
    difficultyChosen: string | null;
    markedAsReadAt: Date | null;
  };
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export interface QuizResponse {
  topicId: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  results: {
    questionId: string;
    selectedOption: string;
    correctOption: string;
    isCorrect: boolean;
    explanation: string | null;
  }[];
}

export interface UserProgress {
  currentStreak: number;
  longestStreak: number;
  totalTopicsCompleted: number;
  lastActivityDate: Date | null;
  todayProgress: {
    completedCount: number;
    totalCount: number;
    isFullyCompleted: boolean;
  } | null;
}

class LearningApi {
  // Get today's 3 daily topics
  static async getDailyTopics(): Promise<DailyTopicsResponse> {
    const response = await axios.get(`${API_URL}/daily`, {
      headers: getHeaders()
    });
    return response.data;
  }

  // ✅ Manually refresh daily topics
  static async refreshDailyTopics(): Promise<DailyTopicsResponse> {
    const response = await axios.post(`${API_URL}/daily/refresh`, {}, {
      headers: getHeaders()
    });
    return response.data;
  }

  // Get topic content with selected difficulty
  static async getTopicContent(
    topicId: string,
    difficulty: 'SIMPLE' | 'MEDIUM' | 'ADVANCED'
  ): Promise<TopicContent> {
    const response = await axios.get(`${API_URL}/topic/${topicId}`, {
      headers: getHeaders(),
      params: { difficulty }
    });
    return response.data;
  }

  // Mark topic as read
  static async markTopicAsRead(
    topicId: string,
    difficulty: 'SIMPLE' | 'MEDIUM' | 'ADVANCED'
  ): Promise<{ message: string }> {
    const response = await axios.post(
      `${API_URL}/topic/${topicId}/mark-read`,
      { difficulty },
      { headers: getHeaders() }
    );
    return response.data;
  }

  // Get quiz questions for a topic
  static async getQuiz(
    topicId: string,
    difficulty: 'SIMPLE' | 'MEDIUM' | 'ADVANCED'
  ): Promise<QuizResponse> {
    const response = await axios.get(`${API_URL}/quiz/${topicId}`, {
      headers: getHeaders(),
      params: { difficulty }
    });
    return response.data;
  }

  // Submit quiz answers
  static async submitQuiz(
    topicId: string,
    answers: { questionId: string; selectedOption: string }[]
  ): Promise<QuizResult> {
    const response = await axios.post(
      `${API_URL}/quiz/${topicId}/submit`,
      { answers },
      { headers: getHeaders() }
    );
    return response.data;
  }

  // Get user progress and stats
  static async getUserProgress(): Promise<UserProgress> {
    const response = await axios.get(`${API_URL}/progress`, {
      headers: getHeaders()
    });
    return response.data;
  }
}

export default LearningApi;