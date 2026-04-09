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
    <>
      <Navbar />
      <div className="pt-24 pb-12 px-6 mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">{title}</h1>
        <p className="text-sm text-gray-400 mb-4">{instructions}</p>
        {targetKeys && (
          <p className="mb-4 text-xs uppercase text-accent-100">Target Keys: {targetKeys}</p>
        )}
        {/* MicroLessonClient steps through each content block sequentially */}
        <MicroLessonClient blocks={blocks} lessonId={lesson.id} xpReward={xpReward} />
      </div>
      <Footer />
    </>
  );
}
