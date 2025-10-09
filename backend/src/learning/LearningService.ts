import LearningRepository from './LearningRepository';
import { Difficulty, Topic, UserProgress } from '@prisma/client';

// Define types for included relations
type TopicWithCategory = Topic & {
  category: {
    name: string;
    icon: string | null;
  };
};

type DailyTopicSetWithRelations = {
  id: string;
  userId: string;
  date: Date;
  completedCount: number;
  isFullyCompleted: boolean;
  createdAt: Date;
  topics: Array<{
    id: string;
    displayOrder: number;
    topic: TopicWithCategory;
  }>;
};

type UserProgressWithStatus = UserProgress & {
  status: string;
  difficultyChosen: Difficulty | null;
  markedAsReadAt: Date | null;
  quizCompleted: boolean;
};

type UserStats = {
  currentStreak: number;
  longestStreak: number;
  totalTopicsCompleted: number;
  lastActivityDate: Date | null;
};

class LearningService {
  private learningRepository: LearningRepository;

  constructor() {
    this.learningRepository = new LearningRepository();
  }

  // ============================================
  // DAILY TOPICS GENERATION
  // ============================================

  async getDailyTopics(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if daily topics already exist for today
    let dailySet = await this.learningRepository.getDailyTopicSet(userId, today);

    if (dailySet) {
      return this.formatDailyTopics(dailySet as DailyTopicSetWithRelations);
    }

    // Generate new daily topics
    dailySet = await this.generateDailyTopics(userId, today);
    return this.formatDailyTopics(dailySet as DailyTopicSetWithRelations);
  }

  private async generateDailyTopics(userId: string, date: Date) {
    // Get user interests
    const interests = await this.learningRepository.getUserInterests(userId);
    
    // Get completed topic IDs to avoid repetition
    const completedIds = await this.learningRepository.getCompletedTopicIds(userId);

    let selectedTopics: TopicWithCategory[] = [];

    if (interests.length > 0) {
      // Get topics from user's interested categories
      const categoryIds = interests.map(i => i.categoryId);
      const candidateTopics = await this.learningRepository.getRandomTopicsByCategories(
        categoryIds,
        10 // Get more candidates to filter
      );

      // Filter out completed topics
      const availableTopics = candidateTopics.filter(
        (t: Topic) => !completedIds.includes(t.id)
      );

      // Take 3 topics
      selectedTopics = availableTopics.slice(0, 3);

      // If not enough topics, fill with random topics
      if (selectedTopics.length < 3) {
        const needed = 3 - selectedTopics.length;
        const randomTopics = await this.learningRepository.getRandomTopics(needed + 5);
        const filteredRandom = randomTopics.filter(
          (t: Topic) => !completedIds.includes(t.id) && 
               !selectedTopics.some((st: Topic) => st.id === t.id)
        );
        selectedTopics = [...selectedTopics, ...filteredRandom.slice(0, needed)];
      }
    } else {
      // No interests set, get random topics
      const randomTopics = await this.learningRepository.getRandomTopics(10);
      const availableTopics = randomTopics.filter(
        (t: Topic) => !completedIds.includes(t.id)
      );
      selectedTopics = availableTopics.slice(0, 3);
    }

    // Create daily topic set
    const topicIds = selectedTopics.map(t => t.id);
    return await this.learningRepository.createDailyTopicSet(userId, date, topicIds);
  }

  private formatDailyTopics(dailySet: DailyTopicSetWithRelations) {
    return {
      date: dailySet.date,
      completedCount: dailySet.completedCount,
      isFullyCompleted: dailySet.isFullyCompleted,
      topics: dailySet.topics.map((dt) => ({
        id: dt.topic.id,
        title: dt.topic.title,
        category: {
          name: dt.topic.category.name,
          icon: dt.topic.category.icon
        },
        estimatedReadTime: dt.topic.estimatedReadTime,
        displayOrder: dt.displayOrder
      }))
    };
  }

  // ============================================
  // TOPIC READING
  // ============================================

  async getTopicContent(userId: string, topicId: string, difficulty: Difficulty) {
    const topic = await this.learningRepository.getTopicById(topicId);

    if (!topic) {
      throw new Error('Topic not found');
    }

    // Get or create progress
    let progress = await this.learningRepository.getUserProgress(userId, topicId);
    
    if (!progress) {
      progress = await this.learningRepository.createUserProgress(userId, topicId, difficulty);
    }

    const typedProgress = progress as UserProgressWithStatus;

    // Select content based on difficulty
    let content: string;
    switch (difficulty) {
      case Difficulty.SIMPLE:
        content = topic.contentSimple;
        break;
      case Difficulty.MEDIUM:
        content = topic.contentMedium;
        break;
      case Difficulty.ADVANCED:
        content = topic.contentAdvanced;
        break;
      default:
        content = topic.contentMedium;
    }

    return {
      id: topic.id,
      title: topic.title,
      content,
      difficulty,
      category: {
        name: topic.category.name,
        icon: topic.category.icon
      },
      estimatedReadTime: topic.estimatedReadTime,
      progress: {
        status: typedProgress.status,
        difficultyChosen: typedProgress.difficultyChosen,
        markedAsReadAt: typedProgress.markedAsReadAt
      }
    };
  }

  async markTopicAsRead(userId: string, topicId: string) {
    await this.learningRepository.markTopicAsRead(userId, topicId);

    // Update daily topic set progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await this.learningRepository.updateDailyTopicSetProgress(userId, today);

    return { message: 'Topic marked as read' };
  }

  // ============================================
  // QUIZ
  // ============================================

  async getQuiz(userId: string, topicId: string) {
    const progress = await this.learningRepository.getUserProgress(userId, topicId);

    if (!progress) {
      throw new Error('You must read the topic first');
    }

    const typedProgress = progress as UserProgressWithStatus;

    if (!typedProgress.markedAsReadAt) {
      throw new Error('Please mark the topic as read before taking the quiz');
    }

    const difficulty = typedProgress.difficultyChosen || Difficulty.MEDIUM;
    const questions = await this.learningRepository.getQuestionsByTopic(topicId, difficulty);

    if (questions.length === 0) {
      throw new Error('No questions available for this topic');
    }

    // Return questions without correct answers
    return {
      topicId,
      difficulty,
      questions: questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        options: {
          A: q.optionA,
          B: q.optionB,
          C: q.optionC,
          D: q.optionD
        }
      }))
    };
  }

  async submitQuiz(userId: string, topicId: string, answers: { questionId: string; selectedOption: string }[]) {
    const progress = await this.learningRepository.getUserProgress(userId, topicId);

    if (!progress) {
      throw new Error('Progress not found');
    }

    const typedProgress = progress as UserProgressWithStatus;

    if (typedProgress.quizCompleted) {
      throw new Error('Quiz already completed for this topic');
    }

    // Get all questions
    const difficulty = typedProgress.difficultyChosen || Difficulty.MEDIUM;
    const questions = await this.learningRepository.getQuestionsByTopic(topicId, difficulty);

    // Grade the quiz
    let correctCount = 0;
    const results = [];

    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      
      if (!question) {
        throw new Error(`Question ${answer.questionId} not found`);
      }

      const isCorrect = question.correctOption === answer.selectedOption;
      if (isCorrect) correctCount++;

      // Save quiz attempt
      const attemptNumber = await this.learningRepository.getQuizAttemptCount(userId, topicId) + 1;
      await this.learningRepository.createQuizAttempt(
        userId,
        answer.questionId,
        topicId,
        answer.selectedOption,
        isCorrect,
        attemptNumber
      );

      results.push({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        correctOption: question.correctOption,
        isCorrect,
        explanation: question.explanation
      });
    }

    // Calculate score
    const score = correctCount;
    const totalQuestions = questions.length;

    // Complete the quiz
    await this.learningRepository.completeTopicQuiz(userId, topicId, score);

    // Update daily topic set progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await this.learningRepository.updateDailyTopicSetProgress(userId, today);

    return {
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      passed: score >= Math.ceil(totalQuestions * 0.7), // 70% to pass
      results
    };
  }

  // ============================================
  // USER PROGRESS
  // ============================================

  async getUserProgress(userId: string) {
    const stats = await this.learningRepository.getUserStats(userId) as UserStats | null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailySet = await this.learningRepository.getDailyTopicSet(userId, today);

    const typedDailySet = dailySet as DailyTopicSetWithRelations | null;

    return {
      currentStreak: stats?.currentStreak || 0,
      longestStreak: stats?.longestStreak || 0,
      totalTopicsCompleted: stats?.totalTopicsCompleted || 0,
      lastActivityDate: stats?.lastActivityDate,
      todayProgress: typedDailySet ? {
        completedCount: typedDailySet.completedCount,
        totalCount: typedDailySet.topics.length,
        isFullyCompleted: typedDailySet.isFullyCompleted
      } : null
    };
  }
}

export default LearningService;