import prisma from './src/lib/prisma';

async function test() {
  const topics = await prisma.topic.findMany({
    take: 2,
    include: { questions: { orderBy: { difficulty: 'asc' } } }
  });
  
  topics.forEach(t => {
    console.log('\n Topic:', t.title);
    t.questions.forEach(q => {
      console.log('   ', q.difficulty, ':', q.questionText.substring(0, 70));
    });
  });
  
  await prisma.$disconnect();
}

test();
