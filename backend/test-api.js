const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const TEST_USER_ID = 'test-user-123';

async function testAPI() {
  console.log('🧪 Testing Backend API...\n');

  try {
    // ============================================
    // SETUP: Create Test User in Database
    // ============================================
    console.log('👤 SETUP: Creating test user...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Delete test user if exists
    await prisma.user.deleteMany({
      where: { id: TEST_USER_ID }
    });

    // Create fresh test user
    await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        email: 'test@example.com',
        password: 'hashed-password',
      }
    });
    console.log('✅ Test user created!\n');

    // ============================================
    // TEST 1: Get Daily Topics
    // ============================================
    console.log('📚 TEST 1: Getting daily topics...');
    const dailyTopicsResponse = await axios.get(`${API_URL}/learning/daily`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    
    console.log('✅ Daily topics retrieved!');
    console.log(`   Topics count: ${dailyTopicsResponse.data.topics.length}`);
    console.log(`   Topics: ${dailyTopicsResponse.data.topics.map(t => t.title).join(', ')}\n`);

    const topicId = dailyTopicsResponse.data.topics[0].id;

    // ============================================
    // TEST 2: Get Topic Content
    // ============================================
    console.log('📖 TEST 2: Getting topic content (MEDIUM difficulty)...');
    const topicResponse = await axios.get(
      `${API_URL}/learning/topic/${topicId}?difficulty=MEDIUM`,
      { headers: { 'x-user-id': TEST_USER_ID } }
    );
    
    console.log('✅ Topic content retrieved!');
    console.log(`   Title: ${topicResponse.data.title}`);
    console.log(`   Category: ${topicResponse.data.category.name}`);
    console.log(`   Content length: ${topicResponse.data.content.length} characters\n`);

    // ============================================
    // TEST 3: Mark Topic as Read
    // ============================================
    console.log('✔️  TEST 3: Marking topic as read...');
    await axios.post(
      `${API_URL}/learning/topic/${topicId}/mark-read`,
      {},
      { headers: { 'x-user-id': TEST_USER_ID } }
    );
    
    console.log('✅ Topic marked as read!\n');

    // ============================================
    // TEST 4: Get Quiz
    // ============================================
    console.log('❓ TEST 4: Getting quiz questions...');
    const quizResponse = await axios.get(
      `${API_URL}/learning/quiz/${topicId}`,
      { headers: { 'x-user-id': TEST_USER_ID } }
    );
    
    console.log('✅ Quiz retrieved!');
    console.log(`   Questions count: ${quizResponse.data.questions.length}`);
    console.log(`   Difficulty: ${quizResponse.data.difficulty}\n`);

    // ============================================
    // TEST 5: Submit Quiz
    // ============================================
    console.log('📝 TEST 5: Submitting quiz answers...');
    
    const answers = quizResponse.data.questions.map(q => ({
      questionId: q.id,
      selectedOption: 'B'
    }));

    const submitResponse = await axios.post(
      `${API_URL}/learning/quiz/${topicId}/submit`,
      { answers },
      { headers: { 'x-user-id': TEST_USER_ID } }
    );
    
    console.log('✅ Quiz submitted!');
    console.log(`   Score: ${submitResponse.data.score}/${submitResponse.data.totalQuestions}`);
    console.log(`   Percentage: ${submitResponse.data.percentage}%`);
    console.log(`   Passed: ${submitResponse.data.passed ? 'Yes ✅' : 'No ❌'}\n`);

    // ============================================
    // TEST 6: Get User Progress
    // ============================================
    console.log('📊 TEST 6: Getting user progress...');
    const progressResponse = await axios.get(
      `${API_URL}/learning/progress`,
      { headers: { 'x-user-id': TEST_USER_ID } }
    );
    
    console.log('✅ User progress retrieved!');
    console.log(`   Current streak: ${progressResponse.data.currentStreak}`);
    console.log(`   Total topics completed: ${progressResponse.data.totalTopicsCompleted}`);
    console.log(`   Today's progress: ${progressResponse.data.todayProgress?.completedCount || 0}/3\n`);

    // ============================================
    // CLEANUP
    // ============================================
    await prisma.user.delete({
      where: { id: TEST_USER_ID }
    });
    await prisma.$disconnect();

    // ============================================
    // SUMMARY
    // ============================================
    console.log('🎉 ALL TESTS PASSED! ✅\n');
    console.log('Backend API is working correctly!');
    console.log('Ready for Step 4! 🚀');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

testAPI();