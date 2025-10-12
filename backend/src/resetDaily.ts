import prisma from './lib/prisma';

async function resetDaily() {
  const userId = '55243faf-53bf-4df7-8ddf-ea2c59cf50eb';
  
  console.log('🔄 Resetting DailyTopicSet...');
  
  // Delete existing daily topic sets
  await prisma.dailyTopicSet.deleteMany({
    where: { userId }
  });
  
  console.log('✅ Deleted all DailyTopicSets');
  
  // Check user progress
  const completedTopics = await prisma.userProgress.findMany({
    where: {
      userId,
      status: 'COMPLETED'
    },
    include: { topic: true }
  });
  
  console.log('\n📊 User Progress:');
  console.log('Completed topics:', completedTopics.length);
  completedTopics.forEach(p => {
    console.log(`  - ${p.topic.title}`);
  });
  
  // Check interests
  const interests = await prisma.userInterest.findMany({
    where: { userId },
    include: { category: true }
  });
  
  console.log('\n🎯 User Interests:', interests.length);
  interests.forEach(i => {
    console.log(`  - ${i.category.name}`);
  });
  
  // Check all topics
  const allTopics = await prisma.topic.findMany({
    where: { isActive: true },
    include: { category: true }
  });
  
  console.log('\n📚 All Available Topics:', allTopics.length);
  allTopics.forEach(t => {
    console.log(`  - ${t.title} (${t.category.name})`);
  });
  
  await prisma.$disconnect();
  
  console.log('\n✅ Done! Now refresh your frontend to generate new topics.');
}

resetDaily();