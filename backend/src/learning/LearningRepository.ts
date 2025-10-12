import prisma from '../lib/prisma';
import { Difficulty, ProgressStatus } from '@prisma/client';

class LearningRepository {
  
  // ============================================
  // DAILY TOPICS
  // ============================================
  
  async getDailyTopicSet(userId: string, date: Date) {
    console.log('[DTR_DEBUG_X7K] [REPO] getDailyTopicSet called');
    console.log('[DTR_DEBUG_X7K] [REPO] Looking for DailyTopicSet with:');
    console.log('[DTR_DEBUG_X7K] [REPO]   userId:', userId);
    console.log('[DTR_DEBUG_X7K] [REPO]   date:', date.toISOString());
    
    const result = await prisma.dailyTopicSet.findUnique({
      where: {
        userId_date: {
          userId,
          date
        }
      },
      include: {
        topics: {
          include: {
            topic: {
              include: {
                category: true
              }
            }
          },
          orderBy: {
            displayOrder: 'asc'
          }
        }
      }
    });
    
    if (result) {
      console.log('[DTR_DEBUG_X7K] [REPO] ✅ FOUND DailyTopicSet');
      console.log('[DTR_DEBUG_X7K] [REPO]   ID:', result.id);
      console.log('[DTR_DEBUG_X7K] [REPO]   Topics count:', result.topics.length);
    } else {
      console.log('[DTR_DEBUG_X7K] [REPO] ❌ NO DailyTopicSet found');
    }
    
    return result;
  }

  async createDailyTopicSet(userId: string, date: Date, topicIds: string[]) {
    console.log('[DTR_DEBUG_X7K] [REPO] createDailyTopicSet called');
    console.log('[DTR_DEBUG_X7K] [REPO] Creating DailyTopicSet with:');
    console.log('[DTR_DEBUG_X7K] [REPO]   userId:', userId);
    console.log('[DTR_DEBUG_X7K] [REPO]   date:', date.toISOString());
    console.log('[DTR_DEBUG_X7K] [REPO]   topicIds:', topicIds);
    
    const result = await prisma.dailyTopicSet.create({
      data: {
        userId,
        date,
        topics: {
          create: topicIds.map((topicId, index) => ({
            topicId,
            displayOrder: index + 1
          }))
        }
      },
      include: {
        topics: {
          include: {
            topic: {
              include: {
                category: true
              }
            }
          },
          orderBy: {
            displayOrder: 'asc'
          }
        }
      }
    });
    
    console.log('[DTR_DEBUG_X7K] [REPO] ✅ DailyTopicSet created successfully');
    
    return result;
  }

  // ✅ NEW METHOD - DELETE DAILY TOPIC SET
  async deleteDailyTopicSet(userId: string, date: Date) {
    console.log('[REPO] deleteDailyTopicSet called for manual refresh');
    console.log('[REPO]   userId:', userId);
    console.log('[REPO]   date:', date.toISOString());
    
    await prisma.dailyTopicSet.deleteMany({
      where: {
        userId,
        date
      }
    });
    
    console.log('[REPO] ✅ DailyTopicSet deleted successfully');
  }

  // ============================================
  // TOPIC SELECTION
  // ============================================

  async getUserInterests(userId: string) {
    console.log('[DTR_DEBUG_X7K] [REPO] getUserInterests called for userId:', userId);
    
    const result = await prisma.userInterest.findMany({
      where: { userId },
      include: { category: true }
    });
    
    console.log('[DTR_DEBUG_X7K] [REPO] Found', result.length, 'interests');
    return result;
  }

  async getRandomTopicsByCategories(categoryIds: string[], limit: number) {
    console.log('[DTR_DEBUG_X7K] [REPO] getRandomTopicsByCategories called');
    console.log('[DTR_DEBUG_X7K] [REPO]   categoryIds:', categoryIds);
    console.log('[DTR_DEBUG_X7K] [REPO]   limit:', limit);
    
    const topics = await prisma.topic.findMany({
      where: {
        categoryId: { in: categoryIds },
        isActive: true
      },
      include: {
        category: true
      }
    });

    console.log('[DTR_DEBUG_X7K] [REPO] Found', topics.length, 'active topics in these categories');

    const shuffled = topics.sort(() => Math.random() - 0.5);
    const result = shuffled.slice(0, limit);
    
    console.log('[DTR_DEBUG_X7K] [REPO] Returning', result.length, 'random topics');
    return result;
  }

  async getRandomTopics(limit: number) {
    console.log('[DTR_DEBUG_X7K] [REPO] getRandomTopics called with limit:', limit);
    
    const topics = await prisma.topic.findMany({
      where: { isActive: true },
      include: { category: true }
    });

    console.log('[DTR_DEBUG_X7K] [REPO] Found', topics.length, 'total active topics');

    const shuffled = topics.sort(() => Math.random() - 0.5);
    const result = shuffled.slice(0, limit);
    
    console.log('[DTR_DEBUG_X7K] [REPO] Returning', result.length, 'random topics');
    return result;
  }

  async getCompletedTopicIds(userId: string) {
    console.log('[DTR_DEBUG_X7K] [REPO] getCompletedTopicIds called for userId:', userId);
    
    const progress = await prisma.userProgress.findMany({
      where: {
        userId,
        status: ProgressStatus.COMPLETED
      },
      select: { topicId: true }
    });

    const ids = progress.map(p => p.topicId);
    console.log('[DTR_DEBUG_X7K] [REPO] Found', ids.length, 'completed topics');
    
    return ids;
  }

  // ============================================
  // TOPIC CONTENT
  // ============================================

  async getTopicById(topicId: string) {
    return await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        category: true,
        questions: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' }
        }
      }
    });
  }

  // ============================================
  // PROGRESS TRACKING
  // ============================================

  async getUserProgress(userId: string, topicId: string) {
    return await prisma.userProgress.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId
        }
      }
    });
  }

  async createUserProgress(userId: string, topicId: string, difficulty: Difficulty) {
    return await prisma.userProgress.create({
      data: {
        userId,
        topicId,
        status: ProgressStatus.IN_PROGRESS,
        difficultyChosen: difficulty
      }
    });
  }

  async updateUserProgress(userId: string, topicId: string, data: any) {
    return await prisma.userProgress.update({
      where: {
        userId_topicId: {
          userId,
          topicId
        }
      },
      data
    });
  }

  async markTopicAsRead(userId: string, topicId: string, difficulty?: Difficulty) {
    const now = new Date();
    
    // Build update data based on whether difficulty is provided
    const updateData: any = {
      markedAsReadAt: now,
      status: ProgressStatus.IN_PROGRESS
    };
    
    if (difficulty) {
      updateData.difficultyChosen = difficulty;
    }
    
    const createData: any = {
      userId,
      topicId,
      status: ProgressStatus.IN_PROGRESS,
      markedAsReadAt: now
    };
    
    if (difficulty) {
      createData.difficultyChosen = difficulty;
    }
    
    return await prisma.userProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId
        }
      },
      update: updateData,
      create: createData
    });
  }

  // ============================================
  // QUIZ
  // ============================================

  async getQuestionsByTopic(topicId: string, difficulty: Difficulty) {
    return await prisma.question.findMany({
      where: {
        topicId,
        difficulty,
        isActive: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });
  }

  async getAllQuestionsByTopic(topicId: string) {
    return await prisma.question.findMany({
      where: {
        topicId,
        isActive: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });
  }

  async createQuizAttempt(
    userId: string,
    questionId: string,
    topicId: string,
    selectedOption: string,
    isCorrect: boolean,
    attemptNumber: number
  ) {
    return await prisma.quizAttempt.create({
      data: {
        userId,
        questionId,
        topicId,
        selectedOption,
        isCorrect,
        attemptNumber
      }
    });
  }

  async getQuizAttemptCount(userId: string, topicId: string) {
    return await prisma.quizAttempt.count({
      where: {
        userId,
        topicId
      }
    });
  }

  async completeTopicQuiz(userId: string, topicId: string, score: number) {
    const now = new Date();

    await prisma.userProgress.update({
      where: {
        userId_topicId: {
          userId,
          topicId
        }
      },
      data: {
        quizCompleted: true,
        quizScore: score,
        quizCompletedAt: now,
        completedAt: now,
        status: ProgressStatus.COMPLETED
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalTopicsCompleted: { increment: 1 },
        lastActivityDate: now
      }
    });
  }

  // ============================================
  // DAILY TOPIC SET UPDATES
  // ============================================

  async updateDailyTopicSetProgress(userId: string, date: Date) {
    const set = await this.getDailyTopicSet(userId, date);
    
    if (!set) return;

    const completedCount = await prisma.userProgress.count({
      where: {
        userId,
        topicId: {
          in: set.topics.map(t => t.topicId)
        },
        status: ProgressStatus.COMPLETED
      }
    });

    await prisma.dailyTopicSet.update({
      where: { id: set.id },
      data: {
        completedCount,
        isFullyCompleted: completedCount === set.topics.length
      }
    });
  }

  // ============================================
  // USER STATS
  // ============================================

  async getUserStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        totalTopicsCompleted: true,
        lastActivityDate: true
      }
    });

    return user;
  }
}

export default LearningRepository;