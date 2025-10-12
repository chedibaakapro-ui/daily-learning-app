import { Difficulty, Topic, UserProgress } from '@prisma/client';
import LearningRepository from './LearningRepository';

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
    console.log('[DTR_DEBUG_X7K] ========== GET DAILY TOPICS START ==========');
    console.log('[DTR_DEBUG_X7K] UserId:', userId);
    
    const today = new Date();
    console.log('[DTR_DEBUG_X7K] Server Date (BEFORE normalization):', today.toISOString());
    
    today.setHours(0, 0, 0, 0);
    console.log('[DTR_DEBUG_X7K] Normalized Today Date:', today.toISOString());

    // Check if daily topics already exist for today
    console.log('[DTR_DEBUG_X7K] Checking if DailyTopicSet exists for today...');
    let dailySet = await this.learningRepository.getDailyTopicSet(userId, today);

    if (dailySet) {
      console.log('[DTR_DEBUG_X7K] ✅ FOUND EXISTING DailyTopicSet');
      console.log('[DTR_DEBUG_X7K] Returning', dailySet.topics.length, 'topics');
      console.log('[DTR_DEBUG_X7K] ========== RETURNING EXISTING SET ==========\n');
      return this.formatDailyTopics(dailySet as DailyTopicSetWithRelations);
    }

    console.log('[DTR_DEBUG_X7K] ❌ NO EXISTING DailyTopicSet found');
    console.log('[DTR_DEBUG_X7K] Generating NEW daily topics...');
    
    // Generate new daily topics
    dailySet = await this.generateDailyTopics(userId, today);
    
    console.log('[DTR_DEBUG_X7K] ✅ NEW DailyTopicSet created with', dailySet.topics.length, 'topics');
    console.log('[DTR_DEBUG_X7K] ========== RETURNING NEW SET ==========\n');
    
    return this.formatDailyTopics(dailySet as DailyTopicSetWithRelations);
  }

  private async generateDailyTopics(userId: string, date: Date) {
    console.log('[DTR_DEBUG_X7K] --- GENERATE DAILY TOPICS ---');
    
    // Get user interests
    const interests = await this.learningRepository.getUserInterests(userId);
    console.log('[DTR_DEBUG_X7K] User has', interests.length, 'interests');
    
    // Get completed topic IDs (NEVER show these again!)
    const completedIds = await this.learningRepository.getCompletedTopicIds(userId);
    console.log('[DTR_DEBUG_X7K] User has completed', completedIds.length, 'topics (will NEVER show again)');
    console.log('[DTR_DEBUG_X7K] Completed IDs:', completedIds);

    let selectedTopics: TopicWithCategory[] = [];

    if (interests.length > 0) {
      console.log('[DTR_DEBUG_X7K] Selecting from user interests...');
      
      const categoryIds = interests.map(i => i.categoryId);
      const candidateTopics = await this.learningRepository.getRandomTopicsByCategories(
        categoryIds,
        20 // Get more candidates
      );
      console.log('[DTR_DEBUG_X7K] Found', candidateTopics.length, 'topics from interested categories');

      // Filter out completed topics (NEVER REPEAT!)
      const availableTopics = candidateTopics.filter(
        (t: Topic) => !completedIds.includes(t.id)
      );
      console.log('[DTR_DEBUG_X7K] After filtering completed:', availableTopics.length, 'available');

      selectedTopics = availableTopics.slice(0, 3);
      console.log('[DTR_DEBUG_X7K] Selected', selectedTopics.length, 'from interests');

      // If not enough, fill with random topics
      if (selectedTopics.length < 3) {
        console.log('[DTR_DEBUG_X7K] Need more topics, fetching random...');
        
        const needed = 3 - selectedTopics.length;
        const randomTopics = await this.learningRepository.getRandomTopics(20);
        
        const filteredRandom = randomTopics.filter(
          (t: Topic) => !completedIds.includes(t.id) && 
               !selectedTopics.some((st: Topic) => st.id === t.id)
        );
        console.log('[DTR_DEBUG_X7K] Found', filteredRandom.length, 'additional random topics');
        
        selectedTopics = [...selectedTopics, ...filteredRandom.slice(0, needed)];
      }
    } else {
      console.log('[DTR_DEBUG_X7K] No interests set, selecting random topics...');
      
      const randomTopics = await this.learningRepository.getRandomTopics(20);
      console.log('[DTR_DEBUG_X7K] Found', randomTopics.length, 'random topics');
      
      const availableTopics = randomTopics.filter(
        (t: Topic) => !completedIds.includes(t.id)
      );
      console.log('[DTR_DEBUG_X7K] After filtering completed:', availableTopics.length, 'available');
      
      selectedTopics = availableTopics.slice(0, 3);
    }

    console.log('[DTR_DEBUG_X7K] FINAL SELECTION:', selectedTopics.length, 'topics');
    
    // Check if we have enough topics
    if (selectedTopics.length === 0) {
      console.log('[DTR_DEBUG_X7K] ⚠️ NO TOPICS AVAILABLE!');
      // Create empty set to mark the day as processed
      return await this.learningRepository.createDailyTopicSet(userId, date, []);
    }

    if (selectedTopics.length < 3) {
      console.log('[DTR_DEBUG_X7K] ⚠️ WARNING: Only', selectedTopics.length, 'topics available (need 3)');
      console.log('[DTR_DEBUG_X7K] User may have completed most topics. Need to add more topics to database!');
    }

    const topicIds = selectedTopics.map(t => t.id);
    console.log('[DTR_DEBUG_X7K] Final topic IDs:', topicIds);
    console.log('[DTR_DEBUG_X7K] Final topic titles:', selectedTopics.map(t => t.title));
    console.log('[DTR_DEBUG_X7K] Creating DailyTopicSet...');
    
    const result = await this.learningRepository.createDailyTopicSet(userId, date, topicIds);
    console.log('[DTR_DEBUG_X7K] --- GENERATE DAILY TOPICS END ---');
    
    return result;
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

  async markTopicAsRead(userId: string, topicId: string, difficulty?: Difficulty) {
    // ✅ PASS DIFFICULTY TO REPOSITORY
    await this.learningRepository.markTopicAsRead(userId, topicId, difficulty);

    // Update daily topic set progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await this.learningRepository.updateDailyTopicSetProgress(userId, today);

    return { message: 'Topic marked as read' };
  }

  // ============================================
  // QUIZ - SHOWS ONLY 1 QUESTION PER DIFFICULTY
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
    
    // ✅ Get ONLY questions matching the chosen difficulty (1 question)
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

    // Get questions matching the chosen difficulty
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