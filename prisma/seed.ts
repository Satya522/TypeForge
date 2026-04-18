import { PrismaClient, Difficulty, ContentType, PreferredDuration } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Admin user ──
  const adminEmail = 'admin@typeforge.local';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        role: 'ADMIN',
        hashedPassword: '$2a$10$TmlyP1aP0B2Y2kPnAdEyn.V/8KbC4u92/RKA5kqGfQN6K.i33elKa',
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

  /* ═══════════════════════════════════════════════
     BEGINNER PATH — Home row & basic finger drills
  ═══════════════════════════════════════════════ */
  await prisma.lessonPath.upsert({
    where: { slug: 'beginner' },
    update: { title: 'Beginner', order: 1, description: 'Master the keyboard from scratch. Home row, basic keys, and building muscle memory.', difficulty: 'EASY' },
    create: {
      title: 'Beginner',
      slug: 'beginner',
      order: 1,
      description: 'Master the keyboard from scratch. Home row, basic keys, and building muscle memory.',
      difficulty: 'EASY',
      lessons: {
        create: [
          {
            title: 'Posture & Setup',
            slug: 'beg-posture-setup',
            order: 1,
            description: 'Learn the correct sitting posture, hand placement, and keyboard setup before you begin typing.',
            difficulty: 'EASY',
            estimatedTime: 120,
            targetKeys: 'none',
            instructions: 'Sit upright, wrists flat, fingers resting lightly on ASDF JKL;. Relax your shoulders. Eyes on screen.',
            xpReward: 30,
            contentBlocks: {
              create: [
                { type: ContentType.SENTENCE, order: 1, content: 'Sit up straight and place your fingers on the home row.' },
                { type: ContentType.SENTENCE, order: 2, content: 'Keep your wrists off the desk and your eyes on the screen.' },
              ],
            },
          },
          {
            title: 'Home Row: Left Hand',
            slug: 'beg-home-row-left',
            order: 2,
            description: 'Train your left hand fingers on A S D F keys with focused drills.',
            difficulty: 'EASY',
            estimatedTime: 180,
            targetKeys: 'asdf',
            targetFingers: 'left pinky, left ring, left middle, left index',
            instructions: 'Place: Pinky on A, Ring on S, Middle on D, Index on F. Only move the required finger.',
            xpReward: 50,
            contentBlocks: {
              create: [
                { type: ContentType.WORDS, order: 1, content: 'aaa sss ddd fff asd fds sdf ads fad dad sad glad flask fall salad' },
                { type: ContentType.SENTENCE, order: 2, content: 'A sad dad adds a flask. Fads fade fast.' },
              ],
            },
          },
          {
            title: 'Home Row: Right Hand',
            slug: 'beg-home-row-right',
            order: 3,
            description: 'Train your right hand fingers on J K L ; keys with focused drills.',
            difficulty: 'EASY',
            estimatedTime: 180,
            targetKeys: 'jkl;',
            targetFingers: 'right index, right middle, right ring, right pinky',
            instructions: 'Place: Index on J, Middle on K, Ring on L, Pinky on ;. Keep your left hand still on ASDF.',
            xpReward: 50,
            contentBlocks: {
              create: [
                { type: ContentType.WORDS, order: 1, content: 'jjj kkk lll ;;; jkl ;lk klj ljk jl kj ;l lk jkl; jlk' },
                { type: ContentType.SENTENCE, order: 2, content: 'Lull, jolt, skill, kill, fill, all, hall, jail.' },
              ],
            },
          },
          {
            title: 'Full Home Row Drill',
            slug: 'beg-home-row-full',
            order: 4,
            description: 'Combine both hands on the full home row. Build speed and rhythm on ASDF JKL;.',
            difficulty: 'EASY',
            estimatedTime: 240,
            targetKeys: 'asdfjkl;',
            instructions: 'Focus on even rhythm. Do not rush. Let your fingers return to home after each key.',
            xpReward: 80,
            contentBlocks: {
              create: [
                { type: ContentType.WORDS, order: 1, content: 'as df jk l; sad fad glad flask lads dads flask lass ask flask' },
                { type: ContentType.SENTENCE, order: 2, content: 'Ask a lass; a sad dad had a flask. Shall lads fall? All shall fall.' },
                { type: ContentType.WORDS, order: 3, content: 'all fall hall call wall dull lull skull skill fill dial jail kale sale' },
              ],
            },
          },
          {
            title: 'Bottom Row Introduction',
            slug: 'beg-bottom-row',
            order: 5,
            description: 'Learn Z X C V and B N M keys — extending home row reach downward.',
            difficulty: 'EASY',
            estimatedTime: 300,
            targetKeys: 'zxcvbnm',
            instructions: 'Extend your fingers down from home row. Return to home after each keystroke. No peeking at the keyboard.',
            xpReward: 100,
            contentBlocks: {
              create: [
                { type: ContentType.WORDS, order: 1, content: 'zap zoom zeal zone zinc box mix tax vex van vim vim cab can cane bun ban band bin big new name noon' },
                { type: ContentType.SENTENCE, order: 2, content: 'Max can fix a van. Ben zaps a big box. Vic can zoom in now.' },
                { type: ContentType.SENTENCE, order: 3, content: 'Zen and calm. Name the zone. Can you box? Mix a can of zinc.' },
              ],
            },
          },
        ],
      },
    },
  });

  /* ═══════════════════════════════════════════════
     MEDIUM PATH — Top row, numbers, common words
  ═══════════════════════════════════════════════ */
  await prisma.lessonPath.upsert({
    where: { slug: 'medium' },
    update: { title: 'Medium', order: 2, description: 'Expand to the full keyboard. Top row, numbers, punctuation and speed building with real words.', difficulty: 'MEDIUM' },
    create: {
      title: 'Medium',
      slug: 'medium',
      order: 2,
      description: 'Expand to the full keyboard. Top row, numbers, punctuation and speed building with real words.',
      difficulty: 'MEDIUM',
      lessons: {
        create: [
          {
            title: 'Top Row: Left Side (Q W E R T)',
            slug: 'med-top-row-left',
            order: 1,
            description: 'Master the left-side top row keys Q W E R T and build finger reach.',
            difficulty: 'MEDIUM',
            estimatedTime: 240,
            targetKeys: 'qwert',
            targetFingers: 'left pinky, left ring, left middle, left index',
            instructions: 'Reach up from home row. Q=pinky, W=ring, E=middle, R & T=index. Return to home after each key.',
            xpReward: 100,
            contentBlocks: {
              create: [
                { type: ContentType.WORDS, order: 1, content: 'we tree free grew brew true quest quite write water quest quiet require' },
                { type: ContentType.SENTENCE, order: 2, content: 'The quiet river grew wide. Write freely and with great care.' },
                { type: ContentType.SENTENCE, order: 3, content: 'Every expert was once a beginner. Practice every day to grow.' },
              ],
            },
          },
          {
            title: 'Top Row: Right Side (Y U I O P)',
            slug: 'med-top-row-right',
            order: 2,
            description: 'Master the right-side top row keys Y U I O P with proper finger technique.',
            difficulty: 'MEDIUM',
            estimatedTime: 240,
            targetKeys: 'yuiop',
            targetFingers: 'right index, right middle, right ring, right pinky',
            instructions: 'Y & U = right index, I = right middle, O = right ring, P = right pinky. Reach up, return to home.',
            xpReward: 100,
            contentBlocks: {
              create: [
                { type: ContentType.WORDS, order: 1, content: 'you your unit upon open pour plus poly pout yup pop poop loop hoop input output' },
                { type: ContentType.SENTENCE, order: 2, content: 'You input your own output. Pour your ideas into your work.' },
              ],
            },
          },
          {
            title: 'Numbers Row (1–5)',
            slug: 'med-numbers-left',
            order: 3,
            description: 'Master the left number keys 1 2 3 4 5 with correct finger positioning.',
            difficulty: 'MEDIUM',
            estimatedTime: 300,
            targetKeys: '12345',
            instructions: 'Use the same finger as the key below: 1=pinky, 2=ring, 3=middle, 4=index, 5=index. Reach up firmly.',
            xpReward: 120,
            contentBlocks: {
              create: [
                { type: ContentType.NUMBER, order: 1, content: '1 2 3 4 5 12 23 34 45 51 123 234 345 451 512 1234 2345 3451 4512 5123' },
                { type: ContentType.SENTENCE, order: 2, content: 'We have 12 cats, 34 dogs, and 5 birds. Order 123 items by the 15th.' },
              ],
            },
          },
          {
            title: 'Numbers Row (6–0)',
            slug: 'med-numbers-right',
            order: 4,
            description: 'Master the right number keys 6 7 8 9 0 with correct finger positioning.',
            difficulty: 'MEDIUM',
            estimatedTime: 300,
            targetKeys: '67890',
            instructions: 'Use: 6 & 7=right index, 8=right middle, 9=right ring, 0=right pinky.',
            xpReward: 120,
            contentBlocks: {
              create: [
                { type: ContentType.NUMBER, order: 1, content: '6 7 8 9 0 67 78 89 90 60 678 789 890 906 067 6789 7890 8906 9067 0678' },
                { type: ContentType.SENTENCE, order: 2, content: 'The score was 97 to 68. Call 9876. The price is 70.90 per unit.' },
              ],
            },
          },
          {
            title: 'Common Words & Sentences',
            slug: 'med-common-words',
            order: 5,
            description: 'Type the 200 most common English words to build natural typing speed and rhythm.',
            difficulty: 'MEDIUM',
            estimatedTime: 360,
            targetKeys: 'all',
            instructions: 'Focus on rhythm over speed. Let your fingers flow naturally. Avoid looking at the keyboard.',
            xpReward: 150,
            contentBlocks: {
              create: [
                { type: ContentType.WORDS, order: 1, content: 'the be to of and a in that have it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us' },
                { type: ContentType.SENTENCE, order: 2, content: 'The people who work hard every day are the ones who make the world a better place. Keep going, even when it gets tough. You have the power to improve.' },
              ],
            },
          },
        ],
      },
    },
  });

  /* ═══════════════════════════════════════════════
     ADVANCED PATH — Punctuation, code, speed bursts
  ═══════════════════════════════════════════════ */
  await prisma.lessonPath.upsert({
    where: { slug: 'advanced' },
    update: { title: 'Advanced', order: 3, description: 'Push your speed and accuracy to the limit. Punctuation, code typing, symbols, and elite-level drills.', difficulty: 'HARD' },
    create: {
      title: 'Advanced',
      slug: 'advanced',
      order: 3,
      description: 'Push your speed and accuracy to the limit. Punctuation, code typing, symbols, and elite-level drills.',
      difficulty: 'HARD',
      lessons: {
        create: [
          {
            title: 'Punctuation Mastery',
            slug: 'adv-punctuation',
            order: 1,
            description: 'Master all punctuation marks: commas, periods, colons, semicolons, apostrophes, and quotes.',
            difficulty: 'HARD',
            estimatedTime: 300,
            targetKeys: '.,;:\'"!?',
            instructions: 'Punctuation keys are often the hardest to reach. Practice deliberately. Do not skip errors — fix them.',
            xpReward: 150,
            contentBlocks: {
              create: [
                { type: ContentType.PUNCTUATION, order: 1, content: 'Wait, what? "I can\'t believe it!" You\'re telling me this: (A) true; or (B) false? It\'s not that simple, is it? Yes, it is.' },
                { type: ContentType.SENTENCE, order: 2, content: 'Hello, world! Can you type this: "precision matters." Yes, it does; always.' },
              ],
            },
          },
          {
            title: 'Symbols & Special Characters',
            slug: 'adv-symbols',
            order: 2,
            description: 'Tackle the shifted symbols: @ # $ % ^ & * ( ) _ + { } | < > ? — essential for coding.',
            difficulty: 'HARD',
            estimatedTime: 360,
            targetKeys: '@#$%^&*()_+{}|<>?',
            instructions: 'Use Shift correctly. Do not hold Shift longer than needed. Practice slowly first.',
            xpReward: 180,
            contentBlocks: {
              create: [
                { type: ContentType.PUNCTUATION, order: 1, content: 'email@example.com #hashtag $100 50% ^power &and *star (paren) _under +plus {brace} |pipe <less> >more? !bang' },
                { type: ContentType.CODE, order: 2, content: 'const fn = (x: number): string => `${x * 100}%`;\nif (x > 0 && x < 100) { return "valid"; }' },
              ],
            },
          },
          {
            title: 'Code Typing: JavaScript',
            slug: 'adv-code-js',
            order: 3,
            description: 'Type real JavaScript code snippets to master syntax, brackets, and developer vocabulary.',
            difficulty: 'HARD',
            estimatedTime: 420,
            targetKeys: 'all',
            instructions: 'Type carefully. Code typing rewards precision over raw speed. Every bracket and semicolon counts.',
            xpReward: 200,
            contentBlocks: {
              create: [
                { type: ContentType.CODE, order: 1, content: 'function add(a, b) {\n  return a + b;\n}\n\nconst result = add(10, 20);\nconsole.log(`Result: ${result}`);' },
                { type: ContentType.CODE, order: 2, content: 'const users = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];\nconst names = users.map(u => u.name);\nconsole.log(names.join(", "));' },
              ],
            },
          },
          {
            title: 'Speed Burst Training',
            slug: 'adv-speed-burst',
            order: 4,
            description: 'Short intensive 30-second bursts designed to push your WPM ceiling higher.',
            difficulty: 'HARD',
            estimatedTime: 480,
            targetKeys: 'all',
            instructions: 'Type as fast as possible for each burst while maintaining above 90% accuracy. Push your limits.',
            xpReward: 220,
            contentBlocks: {
              create: [
                { type: ContentType.WORDS, order: 1, content: 'about above across action address after again age ago agree ahead almost along already also although always among amount angle answer apart apply approach area around arrive art ask attack attention away back base because before begin behind between beyond big body book both break bring build burn call came can carry case cause change character charge check child choose city claim class clear close collect come common company complete concern consider contain continue control could course cover create cross current cut dark date day dead deal deep degree describe design detail develop didn\'t different difficult do does done down draw drive drop during early earth end enough even every everyone everything' },
                { type: ContentType.SENTENCE, order: 2, content: 'Speed comes from precision practiced over time. The fastest typists type clean first, fast second. Practice deliberate keystrokes every single day without exception.' },
              ],
            },
          },
          {
            title: 'Elite: Full Keyboard Mastery',
            slug: 'adv-elite-mastery',
            order: 5,
            description: 'The ultimate test. Mixed text including letters, numbers, symbols, and code at high speed.',
            difficulty: 'HARD',
            estimatedTime: 600,
            targetKeys: 'all',
            instructions: 'This is the final challenge. Maintain 95%+ accuracy at your highest WPM. No excuses.',
            xpReward: 350,
            contentBlocks: {
              create: [
                { type: ContentType.CODE, order: 1, content: 'interface User {\n  id: number;\n  name: string;\n  email: string;\n  role: "admin" | "user";\n}\n\nasync function fetchUser(id: number): Promise<User> {\n  const res = await fetch(`/api/users/${id}`);\n  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);\n  return res.json();\n}' },
                { type: ContentType.SENTENCE, order: 2, content: 'The elite typist types 100+ WPM with 98% accuracy across all content types: prose, code, numbers, and symbols. Mastery is the result of 10,000 deliberate repetitions — not raw talent.' },
                { type: ContentType.PUNCTUATION, order: 3, content: '"Excellence," said the master, "is not an act — it\'s a habit." (Score: 100%) [Rank: #1] {TypeForge Elite}' },
              ],
            },
          },
        ],
      },
    },
  });

  /* ── Achievements ── */
  await prisma.achievement.createMany({
    data: [
      { name: 'First Steps',       slug: 'first-lesson',     description: 'Complete your first lesson',              xpReward: 100 },
      { name: 'Speed Demon',       slug: '50-wpm',           description: 'Reach 50 WPM in a session',              xpReward: 200 },
      { name: 'Accuracy Ace',      slug: '95-accuracy',      description: 'Achieve 95% accuracy in any session',    xpReward: 200 },
      { name: 'Home Row Hero',     slug: 'home-row-hero',    description: 'Complete all Beginner lessons',          xpReward: 300 },
      { name: 'Middle Ground',     slug: 'medium-complete',  description: 'Complete all Medium lessons',            xpReward: 500 },
      { name: 'Elite Typist',      slug: 'advanced-complete',description: 'Complete all Advanced lessons',          xpReward: 1000 },
      { name: 'Century Club',      slug: '100-wpm',          description: 'Reach 100 WPM in a session',            xpReward: 500 },
      { name: 'Perfect Session',   slug: 'perfect-session',  description: 'Finish a session with 100% accuracy',   xpReward: 250 },
      { name: 'Daily Streak x7',   slug: 'streak-7',         description: 'Maintain a 7-day practice streak',      xpReward: 400 },
      { name: 'Code Whisperer',    slug: 'code-whisperer',   description: 'Complete a Code Typing lesson',         xpReward: 300 },
    ],
    skipDuplicates: true,
  });

  /* ── Practice content ── */
  const quoteCategory = await prisma.category.upsert({
    where: { slug: 'quotes' },
    update: {},
    create: { name: 'Quotes', slug: 'quotes', description: 'Inspirational and famous quotes to practice.' },
  });
  await prisma.practiceContent.createMany({
    data: [
      { type: ContentType.QUOTE, difficulty: Difficulty.EASY,   content: 'The only way to do great work is to love what you do.', categoryId: quoteCategory.id },
      { type: ContentType.QUOTE, difficulty: Difficulty.MEDIUM, content: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', categoryId: quoteCategory.id },
      { type: ContentType.QUOTE, difficulty: Difficulty.HARD,   content: 'It does not matter how slowly you go as long as you do not stop. Excellence is not a destination but a continuous journey that never ends.', categoryId: quoteCategory.id },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seeding complete — Beginner, Medium, Advanced paths created.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });