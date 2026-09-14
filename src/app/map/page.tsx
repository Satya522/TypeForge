import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

import Footer from '@/components/Footer';
import { redirect } from 'next/navigation';
import RoadmapClient from './RoadmapClient';

/**
 * Roadmap page — Premium structured learning journey
 *
 * Displays all lesson paths in a visual, progress-tracked layout.
 * Users can navigate to lessons they've unlocked, see completion stats,
 * and track their overall typing journey with XP, streaks, and analytics.
 */
export const metadata = {
  title: 'Roadmap – TypeForge',
  description: 'Your structured typing mastery journey. From beginner to expert.',
};

export const dynamic = 'force-dynamic';

export default async function MapPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return (
      <>
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 xl:px-12 pt-24 pb-20 sm:pt-32">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold tracking-widest uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Roadmap
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">Your Typing Journey</h1>
            <p className="text-lg text-gray-400 max-w-xl mb-8">Sign in to unlock your personalized roadmap, track your progress across learning paths, and see your XP and streaks.</p>
            <a href="/login?callbackUrl=/map" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all duration-200 shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)]">
              Sign in to view Roadmap
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const userId = session.user.id;

  // Fetch all data in parallel for performance
  const [paths, progresses, streak] = await Promise.all([
    prisma.lessonPath.findMany({
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            contentBlocks: { select: { id: true } },
          },
        },
      },
      orderBy: { order: 'asc' },
    }),
    prisma.userLessonProgress.findMany({
      where: { userId },
    }),
    prisma.streakTracking.findFirst({
      where: { userId },
    }),
  ]);

  // Build progress lookup
  const progressMap = Object.fromEntries(progresses.map((p) => [p.lessonId, p]));

  // Calculate total XP earned
  let totalXP = 0;
  let totalCompleted = 0;
  let totalLessons = 0;

  // Transform data for client
  const pathSections = paths.map((path) => {
    let completedCount = 0;

    const lessons = path.lessons.map((lesson, index) => {
      totalLessons++;
      const progress = progressMap[lesson.id];
      const isCompleted = !!progress?.completed;

      // Unlock logic: first lesson always unlocked, or if previous lesson completed
      const prevLesson = index > 0 ? path.lessons[index - 1] : null;
      const isUnlocked = index === 0 || (prevLesson && !!progressMap[prevLesson.id]?.completed);

      if (isCompleted) {
        completedCount++;
        totalCompleted++;
        totalXP += lesson.xpReward;
      }

      // Determine status
      let status: 'completed' | 'current' | 'locked' = 'locked';
      if (isCompleted) {
        status = 'completed';
      } else if (isUnlocked) {
        status = 'current';
      }

      return {
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        status,
        stars: progress?.stars ?? 0,
        wpm: progress?.wpm ?? null,
        accuracy: progress?.accuracy ?? null,
        xpReward: lesson.xpReward,
        estimatedTime: lesson.estimatedTime,
        targetKeys: lesson.targetKeys,
      };
    });

    return {
      id: path.id,
      title: path.title,
      slug: path.slug,
      description: path.description,
      difficulty: path.difficulty,
      lessons,
      completedCount,
      totalCount: path.lessons.length,
    };
  });

  return (
    <>
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 xl:px-12 pt-24 pb-20 sm:pt-32">
        <RoadmapClient
          paths={pathSections}
          totalXP={totalXP}
          totalCompleted={totalCompleted}
          totalLessons={totalLessons}
          currentStreak={streak?.currentStreak ?? 0}
          longestStreak={streak?.longestStreak ?? 0}
        />
      </main>
      <Footer />
    </>
  );
}
