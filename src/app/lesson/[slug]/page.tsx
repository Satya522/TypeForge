import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getServerAuthSession } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MicroLessonClient from '@/components/MicroLessonClient';

interface LessonPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/lesson/${slug}`);
  }
  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    include: { contentBlocks: { orderBy: { order: 'asc' } } },
  });
  if (!lesson) {
    notFound();
  }
  // Compose meta data from lesson
  const instructions = lesson.instructions;
  const title = lesson.title;
  const targetKeys = lesson.targetKeys;
  const xpReward = lesson.xpReward;
  const blocks = lesson.contentBlocks.map((block) => ({ id: block.id, content: block.content }));
  // Completed page is client component because we need interactive engine
  return (
    <div className="min-h-screen text-gray-200 selection:bg-accent-300/30 font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col pt-[80px] sm:pt-[100px] max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
        <MicroLessonClient 
          blocks={blocks} 
          lessonId={lesson.id} 
          xpReward={xpReward} 
          title={title}
          instructions={instructions}
          targetKeys={targetKeys}
        />
      </main>
    </div>
  );
}
