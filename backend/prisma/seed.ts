import { PrismaClient, Difficulty, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================================
  // 1. CREATE CATEGORIES
  // ============================================
  console.log('📁 Creating categories...');

  const physics = await prisma.category.create({
    data: {
      name: 'Physics',
      slug: 'physics',
      icon: '⚛️',
      description: 'Explore the fundamental laws of the universe',
      displayOrder: 1,
    },
  });

  const mathematics = await prisma.category.create({
    data: {
      name: 'Mathematics',
      slug: 'mathematics',
      icon: '🔢',
      description: 'Discover the language of patterns and logic',
      displayOrder: 2,
    },
  });

  const marketing = await prisma.category.create({
    data: {
      name: 'Marketing',
      slug: 'marketing',
      icon: '📊',
      description: 'Learn the art and science of reaching customers',
      displayOrder: 3,
    },
  });

  await prisma.category.create({
    data: {
      name: 'Astronomy',
      slug: 'astronomy',
      icon: '🌌',
      description: 'Journey through space and time',
      displayOrder: 4,
    },
  });

  await prisma.category.create({
    data: {
      name: 'Business',
      slug: 'business',
      icon: '💼',
      description: 'Master the principles of commerce and entrepreneurship',
      displayOrder: 5,
    },
  });

  await prisma.category.create({
    data: {
      name: 'Artificial Intelligence',
      slug: 'artificial-intelligence',
      icon: '🤖',
      description: 'Understand the future of intelligent machines',
      displayOrder: 6,
    },
  });

  await prisma.category.create({
    data: {
      name: 'Religion',
      slug: 'religion',
      icon: '🕉️',
      description: 'Explore beliefs and philosophies across cultures',
      displayOrder: 7,
    },
  });

  await prisma.category.create({
    data: {
      name: 'History',
      slug: 'history',
      icon: '📜',
      description: 'Uncover the stories that shaped our world',
      displayOrder: 8,
    },
  });

  console.log('✅ Created 8 categories');

  // ============================================
  // 2. CREATE TOPICS WITH QUESTIONS
  // ============================================
  console.log('📚 Creating topics and questions...');

  // PHYSICS TOPIC 1
  const physicsTopic1 = await prisma.topic.create({
    data: {
      title: 'Why Do Black Holes Slow Down Time?',
      categoryId: physics.id,
      estimatedReadTime: 2,
      contentSimple: 'Imagine you are near a super heavy ball in space. Time actually moves slower for you than for someone far away! Black holes are so heavy that they bend space and time around them. The closer you get, the slower your clock ticks compared to clocks far away. It is like time itself gets stretched! Scientists proved this is real using super precise clocks. If you fell into a black hole, people watching from far away would see you move slower and slower, like a video in slow motion.',
      contentMedium: 'Black holes demonstrate Einstein theory of general relativity in its most extreme form. Their immense gravitational field warps spacetime to such a degree that time dilation becomes significant. Near the event horizon, the point of no return, time passes much more slowly relative to observers at a safe distance. This is not science fiction - GPS satellites must account for time dilation effects to maintain accuracy. An observer falling toward a black hole would experience time normally, but to an outside observer, they would appear to freeze at the event horizon, their image redshifting into oblivion.',
      contentAdvanced: 'Gravitational time dilation near black holes emerges from the Schwarzschild solution to Einstein field equations. The metric reveals that proper time relates to coordinate time through a specific factor, approaching zero at the Schwarzschild radius. This creates an event horizon where time effectively stops from an external reference frame. The phenomenon has been experimentally verified through gravitational redshift measurements and is essential for understanding Hawking radiation, where virtual particle pairs near the horizon experience differential time flows, leading to black hole evaporation over cosmological timescales.',
    },
  });

  await prisma.question.createMany({
    data: [
      {
        topicId: physicsTopic1.id,
        questionText: 'What happens to time near a black hole?',
        questionType: QuestionType.COMPREHENSION,
        difficulty: Difficulty.SIMPLE,
        optionA: 'Time speeds up',
        optionB: 'Time slows down',
        optionC: 'Time stays the same',
        optionD: 'Time reverses',
        correctOption: 'B',
        explanation: 'Time slows down near black holes due to their extreme gravity bending spacetime.',
        displayOrder: 1,
      },
      {
        topicId: physicsTopic1.id,
        questionText: 'What is the event horizon?',
        questionType: QuestionType.RECALL,
        difficulty: Difficulty.MEDIUM,
        optionA: 'The center of a black hole',
        optionB: 'The point where light escapes',
        optionC: 'The point of no return',
        optionD: 'The edge of the universe',
        correctOption: 'C',
        explanation: 'The event horizon is the boundary beyond which nothing, not even light, can escape.',
        displayOrder: 2,
      },
      {
        topicId: physicsTopic1.id,
        questionText: 'What describes gravitational time dilation?',
        questionType: QuestionType.APPLICATION,
        difficulty: Difficulty.ADVANCED,
        optionA: 'Energy equals mass times speed of light squared',
        optionB: 'The Schwarzschild metric',
        optionC: 'Force equals mass times acceleration',
        optionD: 'Pressure times volume equals moles times gas constant times temperature',
        correctOption: 'B',
        explanation: 'The Schwarzschild metric describes how time dilation occurs near massive objects.',
        displayOrder: 3,
      },
    ],
  });

  // MATHEMATICS TOPIC 1
  const mathTopic1 = await prisma.topic.create({
    data: {
      title: 'How Does Compound Interest Work?',
      categoryId: mathematics.id,
      estimatedReadTime: 2,
      contentSimple: 'Compound interest is like a snowball rolling down a hill - it keeps getting bigger! When you save money, the bank pays you interest. With compound interest, you earn interest on your interest too. If you save 100 dollars and earn 10 percent interest, you get 10 dollars. Next year, you earn interest on 110 dollars, not just 100 dollars. Over many years, this makes your money grow much faster than simple interest. It is why starting to save early is so powerful!',
      contentMedium: 'Compound interest is calculated on the initial principal and accumulated interest from previous periods. The formula determines the future value, where P is principal, r is annual rate, n is compounding frequency, and t is time in years. For example, 1000 dollars at 5 percent compounded annually becomes about 1629 dollars after 10 years, but about 1647 dollars if compounded monthly. This difference grows with time and rate. The Rule of 72 estimates doubling time by dividing 72 by the interest rate. Understanding compound interest is crucial for retirement planning and debt management.',
      contentAdvanced: 'Compound interest represents exponential growth described by continuous compounding when n approaches infinity. The effective annual rate allows comparison across different compounding frequencies. In financial mathematics, present value calculations use discounting formulas. The time value of money principle underlies derivatives pricing, bond valuation, and actuarial science. Compounding exponential nature explains both wealth accumulation and debt spirals, making it fundamental to portfolio theory and risk management strategies.',
    },
  });

  await prisma.question.createMany({
    data: [
      {
        topicId: mathTopic1.id,
        questionText: 'What makes compound interest different from simple interest?',
        questionType: QuestionType.COMPREHENSION,
        difficulty: Difficulty.SIMPLE,
        optionA: 'You earn interest on interest',
        optionB: 'The rate is higher',
        optionC: 'It takes longer',
        optionD: 'Banks prefer it',
        correctOption: 'A',
        explanation: 'Compound interest earns interest on both principal and previously earned interest.',
        displayOrder: 1,
      },
      {
        topicId: mathTopic1.id,
        questionText: 'Using the Rule of 72, how long to double money at 6 percent interest?',
        questionType: QuestionType.APPLICATION,
        difficulty: Difficulty.MEDIUM,
        optionA: '6 years',
        optionB: '12 years',
        optionC: '18 years',
        optionD: '24 years',
        correctOption: 'B',
        explanation: '72 divided by 6 equals 12 years. The Rule of 72 estimates doubling time.',
        displayOrder: 2,
      },
      {
        topicId: mathTopic1.id,
        questionText: 'What represents continuous compounding?',
        questionType: QuestionType.RECALL,
        difficulty: Difficulty.ADVANCED,
        optionA: 'Linear growth',
        optionB: 'Exponential growth with natural logarithm',
        optionC: 'Quadratic growth',
        optionD: 'Constant growth',
        correctOption: 'B',
        explanation: 'Continuous compounding uses the natural exponential function for growth calculation.',
        displayOrder: 3,
      },
    ],
  });

  // MARKETING TOPIC 1
  const marketingTopic1 = await prisma.topic.create({
    data: {
      title: 'The Psychology Behind Viral Marketing',
      categoryId: marketing.id,
      estimatedReadTime: 2,
      contentSimple: 'Things go viral when people cannot help but share them! It usually happens when content makes us feel strong emotions - laughter, surprise, or inspiration. Content that tells a story or shows something amazing spreads fastest. Companies try to create viral content by making things that people want to talk about with friends. The best viral content feels personal and relatable, not like an ad. Sometimes a simple idea shared at the right time can reach millions of people in just days!',
      contentMedium: 'Viral marketing leverages psychological triggers to achieve exponential organic reach. Research shows content goes viral when it triggers high-arousal emotions like awe, excitement, or anger. The STEPPS framework identifies six principles: Social Currency, Triggers, Emotion, Public visibility, Practical Value, and Stories. Successful campaigns like Dollar Shave Club and Old Spice combined humor, unexpectedness, and shareability. Network effects amplify reach when each share generates multiple new shares, creating geometric growth.',
      contentAdvanced: 'Viral marketing exhibits characteristics of epidemiological models applied to information diffusion. The basic reproduction number must exceed one for viral propagation, influenced by network topology, homophily, and weak tie bridges. Emotional contagion theory explains how affect transfers through social networks. Neuroscientific studies reveal that highly shareable content activates specific brain regions associated with self-referential processing and social cognition. Algorithmic amplification in social media platforms creates power-law distributions in content reach, where virality depends on early momentum during the critical first hours post-publication.',
    },
  });

  await prisma.question.createMany({
    data: [
      {
        topicId: marketingTopic1.id,
        questionText: 'What makes content go viral?',
        questionType: QuestionType.COMPREHENSION,
        difficulty: Difficulty.SIMPLE,
        optionA: 'High production budget',
        optionB: 'Strong emotions',
        optionC: 'Celebrity endorsement',
        optionD: 'Long length',
        correctOption: 'B',
        explanation: 'Content that triggers strong emotions like joy or surprise spreads fastest.',
        displayOrder: 1,
      },
      {
        topicId: marketingTopic1.id,
        questionText: 'What is one principle in the STEPPS framework?',
        questionType: QuestionType.RECALL,
        difficulty: Difficulty.MEDIUM,
        optionA: 'Speed',
        optionB: 'Social Currency',
        optionC: 'Sharing',
        optionD: 'Success',
        correctOption: 'B',
        explanation: 'Social Currency is one of the six STEPPS principles - content that makes sharers look good.',
        displayOrder: 2,
      },
      {
        topicId: marketingTopic1.id,
        questionText: 'What must the reproduction number exceed for viral propagation?',
        questionType: QuestionType.APPLICATION,
        difficulty: Difficulty.ADVANCED,
        optionA: 'Zero',
        optionB: 'One half',
        optionC: 'One',
        optionD: 'Ten',
        correctOption: 'C',
        explanation: 'The basic reproduction number must exceed one for exponential viral spread.',
        displayOrder: 3,
      },
    ],
  });

  console.log('✅ Created 3 topics with 9 questions');

  console.log('\n🎉 Seed completed successfully!');
  console.log('📁 Categories: 8');
  console.log('📚 Topics: 3');
  console.log('❓ Questions: 9');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });