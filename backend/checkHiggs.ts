import prisma from './src/lib/prisma';

async function checkHiggs() {
  const topic = await prisma.topic.findFirst({
    where: { title: { contains: 'Higgs' } },
    include: { questions: { orderBy: { difficulty: 'asc' } } }
  });
  
  if (!topic) {
    console.log('❌ Higgs Boson topic not found!');
    return;
  }
  
  console.log('\n📚 Topic:', topic.title);
  console.log('\nQuestions in database:');
  
  topic.questions.forEach(q => {
    console.log('\n' + q.difficulty + ':');
    console.log('  Q:', q.questionText);
    console.log('  A:', q.optionA.substring(0, 60));
    console.log('  B:', q.optionB.substring(0, 60));
  });
  
  await prisma.$disconnect();
}

checkHiggs();
