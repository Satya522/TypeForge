import { PrismaClient, Difficulty, ContentType, PreferredDuration } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  // Create a default admin user
  const adminEmail = 'admin@typeforge.local';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        role: 'ADMIN',
        hashedPassword: '$2b$12$P5Gtzim6KBctRdaJIex43.tXLc2xB.36r7JhF6eg/svvpXa0wDgM.', // password: admin123
        settings: {
          create: {
            leaderboardVisible: true,
            preferredDuration: PreferredDuration.S60,
            language: 'en',
            theme: 'dark',
            accentColor: 'blue',
            fontFamily: 'Inter',
            fontSize: 16,
            notificationsEnabled: true,
          },
        },
      },
    });
  }
  // Lesson paths and lessons
  const beginnerPath = await prisma.lessonPath.upsert({
    where: { slug: 'beginner' },
    update: {},
    create: {
      title: 'Beginner',
      slug: 'beginner',
      order: 1,
      description: 'Start your typing journey from scratch.',
      difficulty: 'EASY',
      lessons: {
        create: [
          {
            title: 'Home Row Basics',
            slug: 'home-row-basics',
            order: 1,
            description: 'Learn the home row keys.',
            difficulty: 'EASY',
            estimatedTime: 60,
            targetKeys: 'asdfjkl;',
            targetFingers: 'left pinky to right pinky',
            instructions: 'Type the home row keys repeatedly to build muscle memory.',
            xpReward: 50,
            contentBlocks: {
              create: [
                {
                  type: ContentType.WORDS,
                  order: 1,
                  content: 'f d s a j k l ; as df jk l; kj ;l as df jk',
                },
                {
                  type: ContentType.SENTENCE,
                  order: 2,
                  content: 'The quick brown fox jumps over the lazy dog.',
                },
              ],
            },
          },
          {
            title: 'Top Row Introduction',
            slug: 'top-row-introduction',
            order: 2,
            description: 'Introduce top row keys.',
            difficulty: 'EASY',
            estimatedTime: 90,
            targetKeys: 'qweruiop',
            targetFingers: 'left pinky to right pinky',
            instructions: 'Focus on the top row and alternate between keys.',
            xpReward: 70,
            contentBlocks: {
              create: [
                {
                  type: ContentType.WORDS,
                  order: 1,
                  content: 'q w e r u i o p',
                },
                {
                  type: ContentType.SENTENCE,
                  order: 2,
                  content: 'Practice makes perfect. Keep going!',
                },
              ],
            },
          },
        ],
      },
    },
  });
  // Categories & practice content examples
  const quoteCategory = await prisma.category.upsert({
    where: { slug: 'quotes' },
    update: {},
    create: {
      name: 'Quotes',
      slug: 'quotes',
      description: 'Inspirational and famous quotes to practice.',
    },
  });
  await prisma.practiceContent.createMany({
    data: [
      {
        type: ContentType.QUOTE,
        difficulty: Difficulty.EASY,
        content: 'The only way to do great work is to love what you do.',
        categoryId: quoteCategory.id,
      },
      {
        type: ContentType.QUOTE,
        difficulty: Difficulty.MEDIUM,
        content: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
        categoryId: quoteCategory.id,
      },
    ],
    skipDuplicates: true,
  });
  // Achievements
  await prisma.achievement.createMany({
    data: [
      {
        name: 'First Steps',
        slug: 'first-lesson',
        description: 'Complete your first lesson',
        xpReward: 100,
      },
      {
        name: 'Speed Demon',
        slug: '50-wpm',
        description: 'Reach 50 WPM in a session',
        xpReward: 200,
      },
      {
        name: 'Accuracy Ace',
        slug: '95-accuracy',
        description: 'Achieve 95% accuracy in any session',
        xpReward: 200,
      },
    ],
    skipDuplicates: true,
  });
  console.log('Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
