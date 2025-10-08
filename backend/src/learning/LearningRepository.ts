import prisma from '../lib/prisma';
import { Difficulty, ProgressStatus } from '@prisma/client';

class LearningRepository {
  
  // ============================================
  // DAILY TOPICS
  // ============================================
  
  async getDailyTopicSet(userId: string, date: Date) {
    return await prisma.dailyTopicSet.findUnique({
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
  }

  async createDailyTopicSet(userId: string, date: Date, topicIds: string[]) {
    return await prisma.dailyTopicSet.create({
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
  }

  // ============================================
  // TOPIC SELECTION
  // ============================================

  async getUserInterests(userId: string) {
    return await prisma.userInterest.findMany({
      where: { userId },
      include: { category: true }
    });
  }

  async getRandomTopicsByCategories(categoryIds: string[], limit: number) {
    const topics = await prisma.topic.findMany({
      where: {
        categoryId: { in: categoryIds },
        isActive: true
      },
      include: {
        category: true
      }
    });

    const shuffled = topics.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  async getRandomTopics(limit: number) {
    const topics = await prisma.topic.findMany({
      where: { isActive: true },
      include: { category: true }
    });

    const shuffled = topics.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  async getCompletedTopicIds(userId: string) {
    const progress = await prisma.userProgress.findMany({
      where: {
        userId,
        status: ProgressStatus.COMPLETED
      },
      select: { topicId: true }
    });

    return progress.map(p => p.topicId);
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

  async markTopicAsRead(userId: string, topicId: string) {
    const now = new Date();
    
    return await prisma.userProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId
        }
      },
      update: {
        markedAsReadAt: now,
        status: ProgressStatus.IN_PROGRESS
      },
      create: {
        userId,
        topicId,
        status: ProgressStatus.IN_PROGRESS,
        markedAsReadAt: now
      }
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
