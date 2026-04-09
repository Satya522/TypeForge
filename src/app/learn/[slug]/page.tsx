import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';

interface LearnPathPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function LearnPathPage({ params }: LearnPathPageProps) {
  const { slug } = await params;
  const path = await prisma.lessonPath.findUnique({
    where: { slug },
    include: { lessons: { orderBy: { order: 'asc' } } },
  });
  if (!path) notFound();
  const session = await getServerAuthSession();
  const userId = session?.user?.id;
  // fetch user progress for lessons
  let progressMap: Record<string, any> = {};
  if (userId) {
    const progresses = await prisma.userLessonProgress.findMany({ where: { userId, lessonId: { in: path.lessons.map((l) => l.id) } } });
    progressMap = Object.fromEntries(progresses.map((p) => [p.lessonId, p]));
  }
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-4">{path.title}</h1>
        {path.description && <p className="text-gray-400 mb-6">{path.description}</p>}
        <div className="space-y-4">
          {path.lessons.map((lesson, index) => {
            const progress = progressMap[lesson.id];
            const unlocked = index === 0 || !!progressMap[path.lessons[index - 1].id];
            return (
              <div key={lesson.id} className="flex items-center justify-between border border-surface-300 p-4 rounded-lg bg-surface-200">
                <div>
                  <h3 className="font-medium text-gray-100">{lesson.title}</h3>
                  <p className="text-sm text-gray-400">{lesson.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-3">
                  {progress?.completed ? (
                    <span className="text-xs text-accent-200">Completed</span>
                  ) : !unlocked ? (
                    <span className="text-xs text-gray-500">Locked</span>
                  ) : (
                    <Link href={`/lesson/${lesson.slug}`} className="text-accent-200 text-sm hover:underline">
                      Start
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
