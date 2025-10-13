import { Difficulty, Topic, UserProgress } from '@prisma/client';
import LearningRepository from './LearningRepository';

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
  // DAILY TOPICS GENERATION - ALWAYS 3 CARDS
  // ============================================
  async getDailyTopics(userId: string) {
    console.log('[DAILY_TOPICS] ========== GET DAILY TOPICS START ==========');
    console.log('[DAILY_TOPICS] UserId:', userId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log('[DAILY_TOPICS] Today:', today.toISOString());

    let dailySet = await this.learningRepository.getDailyTopicSet(userId, today);

    if (dailySet) {
      console.log('[DAILY_TOPICS] ✅ Found existing set with', dailySet.topics.length, 'topics');
      
      // ✅ CRITICAL FIX: Verify we have exactly 3 topics
      if (dailySet.topics.length !== 3) {
        console.log('[DAILY_TOPICS] ⚠️ Set has', dailySet.topics.length, 'topics (need 3). Regenerating...');
        await this.learningRepository.deleteDailyTopicSet(userId, today);
        dailySet = await this.generateDailyTopics(userId, today);
      }
      
      return this.formatDailyTopics(dailySet as DailyTopicSetWithRelations);
    }

    console.log('[DAILY_TOPICS] No existing set. Generating new topics...');
    dailySet = await this.generateDailyTopics(userId, today);
    
    return this.formatDailyTopics(dailySet as DailyTopicSetWithRelations);
  }

  // ============================================
  // MANUAL TOPIC REFRESH
  // ============================================
  async refreshDailyTopics(userId: string) {
    console.log('[REFRESH] Manual refresh requested');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.learningRepository.deleteDailyTopicSet(userId, today);
    const dailySet = await this.generateDailyTopics(userId, today);
    
    return this.formatDailyTopics(dailySet as DailyTopicSetWithRelations);
  }

  // ============================================
  // ✅ CRITICAL FIX: ALWAYS GENERATE EXACTLY 3 TOPICS
  // ============================================
  private async generateDailyTopics(userId: string, date: Date) {
    console.log('[GENERATE] --- GENERATE 3 TOPICS ---');
    
    // Get user interests
    const interests = await this.learningRepository.getUserInterests(userId);
    console.log('[GENERATE] User interests:', interests.length);
    
    // Get completed topics
    const completedIds = await this.learningRepository.getCompletedTopicIds(userId);
    console.log('[GENERATE] Completed topics:', completedIds.length);

    let selectedTopics: TopicWithCategory[] = [];

    // Step 1: Try to get topics from interests (excluding completed)
    if (interests.length > 0) {
      const categoryIds = interests.map(i => i.categoryId);
      const candidateTopics = await this.learningRepository.getRandomTopicsByCategories(
        categoryIds,
        20
      );
      
      const availableFromInterests = candidateTopics.filter(
        (t: Topic) => !completedIds.includes(t.id)
      );
      
      selectedTopics = availableFromInterests.slice(0, 3);
      console.log('[GENERATE] Selected from interests:', selectedTopics.length);
    }

    // Step 2: If not enough, get random topics (excluding completed)
    if (selectedTopics.length < 3) {
      console.log('[GENERATE] Need more topics. Fetching random...');
      
      const randomTopics = await this.learningRepository.getRandomTopics(20);
      const availableRandom = randomTopics.filter(
        (t: Topic) => !completedIds.includes(t.id) && 
             !selectedTopics.some((st: Topic) => st.id === t.id)
      );
      
      const needed = 3 - selectedTopics.length;
      selectedTopics = [...selectedTopics, ...availableRandom.slice(0, needed)];
      console.log('[GENERATE] After random topics:', selectedTopics.length);
    }

    // ✅ Step 3: CRITICAL FIX - If still not enough, allow repeating completed topics
    if (selectedTopics.length < 3) {
      console.log('[GENERATE] ⚠️ Still need more! Allowing completed topics to repeat...');
      
      const allTopics = await this.learningRepository.getRandomTopics(20);
      const additionalTopics = allTopics.filter(
        (t: Topic) => !selectedTopics.some((st: Topic) => st.id === t.id)
      );
      
      const needed = 3 - selectedTopics.length;
      selectedTopics = [...selectedTopics, ...additionalTopics.slice(0, needed)];
      console.log('[GENERATE] After including completed:', selectedTopics.length);
    }

    // ✅ Step 4: ABSOLUTE LAST RESORT - If STILL not enough (impossible but safe)
    if (selectedTopics.length < 3) {
      console.error('[GENERATE] ❌ CRITICAL: Not enough topics in database!');
      console.error('[GENERATE] Database only has', selectedTopics.length, 'topics total');
      throw new Error('Not enough topics in database. Please add more topics.');
    }

    // ✅ GUARANTEE: We now have exactly 3 topics
    const topicIds = selectedTopics.slice(0, 3).map(t => t.id);
    console.log('[GENERATE] ✅ FINAL: Creating set with exactly 3 topics');
    console.log('[GENERATE] Topic IDs:', topicIds);

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

    let progress = await this.learningRepository.getUserProgress(userId, topicId);
    
    if (!progress) {
      progress = await this.learningRepository.createUserProgress(userId, topicId, difficulty);
    }

    const typedProgress = progress as UserProgressWithStatus;

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

  async markTopicAsRead(userId: string, topicId: string, difficulty?: Difficulty) {
    await this.learningRepository.markTopicAsRead(userId, topicId, difficulty);

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

    const difficulty = typedProgress.difficultyChosen || Difficulty.MEDIUM;
    const questions = await this.learningRepository.getQuestionsByTopic(topicId, difficulty);

    let correctCount = 0;
    const results = [];

    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      
      if (!question) {
        throw new Error(`Question ${answer.questionId} not found`);
      }

      const isCorrect = question.correctOption === answer.selectedOption;
      if (isCorrect) correctCount++;

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

    const score = correctCount;
    const totalQuestions = questions.length;

    await this.learningRepository.completeTopicQuiz(userId, topicId, score);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await this.learningRepository.updateDailyTopicSetProgress(userId, today);

    return {
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      passed: score >= Math.ceil(totalQuestions * 0.7),
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