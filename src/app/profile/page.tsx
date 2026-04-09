import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export const metadata = {
  title: 'Profile – TypeForge',
  description: 'View your profile, stats and achievements.',
};

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/profile');
  }
  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect('/login');
  const [lessonProgress, practiceAgg, streak] = await Promise.all([
    prisma.userLessonProgress.aggregate({
      _count: true,
      _max: { wpm: true, accuracy: true },
      where: { userId, completed: true },
    }),
    prisma.practiceSession.aggregate({
      _max: { wpm: true, accuracy: true },
      _avg: { wpm: true, accuracy: true },
      where: { userId },
    }),
    prisma.streakTracking.findUnique({ where: { userId } }),
  ]);
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">Profile</h1>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0">
            {user.image ? (
              <Image src={user.image} alt="avatar" width={96} height={96} className="rounded-full" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-surface-300 flex items-center justify-center text-3xl text-accent-200">
                {user.name?.[0] ?? 'U'}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-100">{user.name}</h2>
            {user.username && <p className="text-sm text-gray-400">@{user.username}</p>}
            {user.bio && <p className="mt-2 text-gray-400">{user.bio}</p>}
            <p className="mt-2 text-xs text-gray-500">Joined {user.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-surface-300 bg-surface-200 p-4">
            <p className="text-xs uppercase text-gray-400">Lessons Completed</p>
            <p className="text-2xl font-bold text-accent-200">{lessonProgress._count}</p>
          </div>
          <div className="rounded-lg border border-surface-300 bg-surface-200 p-4">
            <p className="text-xs uppercase text-gray-400">Best WPM</p>
            <p className="text-2xl font-bold text-accent-200">{Math.max(lessonProgress._max.wpm ?? 0, practiceAgg._max.wpm ?? 0)}</p>
          </div>
          <div className="rounded-lg border border-surface-300 bg-surface-200 p-4">
            <p className="text-xs uppercase text-gray-400">Best Accuracy</p>
            <p className="text-2xl font-bold text-accent-200">{Math.max(lessonProgress._max.accuracy ?? 0, practiceAgg._max.accuracy ?? 0)}%</p>
          </div>
          <div className="rounded-lg border border-surface-300 bg-surface-200 p-4">
            <p className="text-xs uppercase text-gray-400">Current Streak</p>
            <p className="text-2xl font-bold text-accent-200">{streak?.currentStreak ?? 0} days</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
