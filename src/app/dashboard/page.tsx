import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard – TypeForge',
  description: 'Your personal dashboard overview and quick access to your typing journey.',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard');
  }
  // Fetch minimal stats
  const userId = session.user.id;
  const [lessonProgress, practiceSessions, streak] = await Promise.all([
    prisma.userLessonProgress.aggregate({
      _count: true,
      where: { userId, completed: true },
    }),
    prisma.practiceSession.aggregate({ _count: true, where: { userId } }),
    prisma.streakTracking.findUnique({ where: { userId } }),
  ]);
  const totalLessonsCompleted = lessonProgress._count;
  const totalSessions = practiceSessions._count;
  const currentStreak = streak?.currentStreak ?? 0;
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">Welcome back{session.user.name ? `, ${session.user.name}` : ''}!</h1>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-xl bg-surface-200 p-6 border border-surface-300 shadow-sm">
            <h3 className="text-sm uppercase text-gray-400">Current Streak</h3>
            <p className="mt-2 text-3xl font-semibold text-accent-200">{currentStreak} days</p>
          </div>
          <div className="rounded-xl bg-surface-200 p-6 border border-surface-300 shadow-sm">
            <h3 className="text-sm uppercase text-gray-400">Lessons Completed</h3>
            <p className="mt-2 text-3xl font-semibold text-accent-200">{totalLessonsCompleted}</p>
          </div>
          <div className="rounded-xl bg-surface-200 p-6 border border-surface-300 shadow-sm">
            <h3 className="text-sm uppercase text-gray-400">Practice Sessions</h3>
            <p className="mt-2 text-3xl font-semibold text-accent-200">{totalSessions}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/learn">
            <Button size="lg">Continue Learning</Button>
          </Link>
          <Link href="/practice">
            <Button variant="secondary" size="lg">Start Practice</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
