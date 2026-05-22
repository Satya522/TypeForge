const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PRO_DEVELOPER = [
  'const [count, setCount] = useState<number>(0);',
  'await Promise.all([req1(), req2()]);',
  'export const config = { runtime: "edge" };',
  'array.reduce((acc, curr) => acc + curr, 0);',
  'if (a && b || !c) return { result: null };',
  '<button className="flex items-center gap-2">'
];

const PRO_ACCOUNTANT = [
  'Invoice #4920-A: Total balance due is $4,590.50.',
  'Q3 Earnings: 45.2% increase YoY, net revenue $2.4M.',
  'Tax ID 98-7654321. Deductions sum to $12,045.00.',
  'Account 00149201 routing transfer of $84,200.99.',
  'Fiscal year projection: 12.5% ROI across 4 quarters.',
  'Debit: $450.00 | Credit: $450.00 | Balance: $0.00'
];

const PRO_WRITER = [
  'It was the best of times, it was the worst of times.',
  'To be, or not to be, that is the question.',
  'The quick brown fox jumps over the lazy dog.',
  'All that glitters is not gold, often have you heard.',
  'Two roads diverged in a yellow wood, and I took one.',
  'Call me Ishmael. Some years ago, never mind how long.'
];

const PRO_TYPIST = [
  'Peter Piper picked a peck of pickled peppers.',
  'She sells seashells by the seashore on Sundays.',
  'A quick movement of the enemy will jeopardize six gunboats.',
  'How much wood would a woodchuck chuck if he could?',
  'Sphinx of black quartz, judge my vow!',
  'Pack my box with five dozen liquor jugs.'
];

const PRO_EVERYDAY = [
  'Hey! Can you send me the report by 5:00 PM?',
  'Meeting ID: 894-123-4567 Password: TypeForge2026',
  "I'll be there in 15 mins. Traffic is insane today!",
  'Please confirm your email address: user_99@domain.com',
  'Flight UA492 departs at 08:45 AM from Terminal C.',
  'My phone number is +1 (555) 987-6543. Call me!'
];

const data = {
  'Pro Developer': PRO_DEVELOPER,
  'Pro Accountant': PRO_ACCOUNTANT,
  'Pro Writer': PRO_WRITER,
  'Pro Typist': PRO_TYPIST,
  'Pro Everyday': PRO_EVERYDAY
};

async function main() {
  console.log('Seeding extreme challenge text...');
  
  for (const [categoryName, texts] of Object.entries(data)) {
    // Upsert Category
    const category = await prisma.category.upsert({
      where: { slug: categoryName.toLowerCase().replace(' ', '-') },
      update: {},
      create: {
        name: categoryName,
        slug: categoryName.toLowerCase().replace(' ', '-'),
        description: `Extreme typing challenge texts for ${categoryName}`
      }
    });

    // Check if texts exist, if not, create them
    for (const text of texts) {
      const existing = await prisma.practiceContent.findFirst({
        where: {
          content: text,
          categoryId: category.id
        }
      });
      
      if (!existing) {
        await prisma.practiceContent.create({
          data: {
            type: 'TEXT',
            difficulty: 'HARD',
            content: text,
            categoryId: category.id
          }
        });
      }
    }
  }
  
  console.log('Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
