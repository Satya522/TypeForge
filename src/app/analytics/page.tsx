import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnalyticsDashboard from './AnalyticsDashboard';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Analytics – TypeForge',
  description: 'Visualize your typing progress and trends over time.',
};

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/analytics');
  }
  const userId = session.user.id;
  // fetch last 30 days stats
  const since = new Date();
  since.setDate(since.getDate() - 29);
  const stats = await prisma.dailyStat.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: 'asc' },
  });
  // Fill missing dates
  const data: { date: string; wpm: number; accuracy: number; time: number; lessons: number; sessions: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(since.getTime());
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const stat = stats.find((s) => s.date.toISOString().slice(0, 10) === key);
    data.push({
      date: key.substring(5), // MM-DD for chart
      wpm: stat ? stat.averageWpm : 0,
      accuracy: stat ? stat.averageAccuracy : 0,
      time: stat ? stat.totalTimePracticed : 0,
      lessons: stat ? stat.lessonsCompleted : 0,
      sessions: stat ? stat.practiceSessions : 0,
    });
  }
  // Compute totals
  const totalTime = data.reduce((sum, d) => sum + d.time, 0);
  const totalLessons = data.reduce((sum, d) => sum + d.lessons, 0);
  const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);

  // For demonstration purposes, generate a simple heatmap of per-key errors.
  // In a real implementation this data would be aggregated from user sessions.
  const heatmapData: Record<string, number> = {};
  const keys = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
  keys.forEach((k) => {
    heatmapData[k] = Math.floor(Math.random() * 10);
  });
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">Your Analytics</h1>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-surface-200 p-4 border border-surface-300">
            <p className="text-xs uppercase text-gray-400">Total Time Practiced</p>
            <p className="text-2xl font-bold text-accent-200">{Math.round(totalTime / 60)} mins</p>
          </div>
          <div className="rounded-lg bg-surface-200 p-4 border border-surface-300">
            <p className="text-xs uppercase text-gray-400">Lessons Completed</p>
            <p className="text-2xl font-bold text-accent-200">{totalLessons}</p>
          </div>
          <div className="rounded-lg bg-surface-200 p-4 border border-surface-300">
            <p className="text-xs uppercase text-gray-400">Practice Sessions</p>
            <p className="text-2xl font-bold text-accent-200">{totalSessions}</p>
          </div>
        </div>
        {/* Export analytics data as CSV */}
        <div className="mt-4">
          <a
            href="/api/analytics/export"
            className="text-sm text-accent-200 underline hover:text-accent-100"
          >
            Download CSV Report
          </a>
        </div>
        <AnalyticsDashboard data={data} heatmapData={heatmapData} />
      </main>
      <Footer />
    </>
  );
}
