import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnalyticsDashboard from './AnalyticsDashboard';
import { redirect } from 'next/navigation';
import { Download, Sparkles } from 'lucide-react';

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
  since.setDate(since.getDate() - 89);
  const stats = await prisma.dailyStat.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: 'asc' },
  });
  // Fill missing dates
  const data: { date: string; wpm: number; accuracy: number; time: number; lessons: number; sessions: number }[] = [];
  for (let i = 0; i < 90; i++) {
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
      <main className="pt-28 pb-20 px-6 sm:px-10 lg:px-14 xl:px-20 w-full">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#39FF14]/20 bg-[#39FF14]/[0.05] px-3 py-1 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-[#39FF14]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#39FF14]">Performance metrics</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">
              Your Analytics
            </h1>
            <p className="text-gray-500 text-sm">Visualize your typing precision, speed trends, and session history over the last 30 days.</p>
          </div>
          
          {/* Export Button */}
          <a
            href="/api/analytics/export"
            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-2.5 transition-all hover:bg-white/[0.05] hover:border-white/20 active:scale-95"
          >
            <Download className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 group-hover:text-white transition-colors">
              Export CSV
            </span>
          </a>
        </div>

        <AnalyticsDashboard data={data} heatmapData={heatmapData} />
      </main>
      <Footer />
    </>
  );
}
