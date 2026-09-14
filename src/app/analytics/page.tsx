import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

import Footer from '@/components/Footer';
import AnalyticsDashboard from './AnalyticsDashboard';
import { aggregateHeatmapFromTelemetry, parseTypingTelemetry } from '@/lib/typingTelemetry';

export const metadata = {
  title: 'Analytics – TypeForge',
  description: 'Visualize your typing progress and trends over time.',
};

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return (
      <>
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 xl:px-12 pt-24 pb-20 sm:pt-32">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold tracking-widest uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Analytics
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">Your Typing Analytics</h1>
            <p className="text-lg text-gray-400 max-w-xl mb-8">Sign in to view detailed charts of your typing speed, accuracy trends, heatmaps, and session history.</p>
            <a href="/login?callbackUrl=/analytics" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.4)]">
              Sign in to view Analytics
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  const userId = session.user.id;

  const today = new Date();
  const since = new Date(today.getFullYear(), 0, 1);

  const [stats, sessionAggregate, sessionRows, streak] = await Promise.all([
    prisma.dailyStat.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'asc' },
    }),
    prisma.practiceSession.aggregate({
      where: { userId },
      _avg: {
        accuracy: true,
        consistency: true,
        rawWpm: true,
        wpm: true,
      },
      _count: {
        _all: true,
      },
      _max: {
        accuracy: true,
        rawWpm: true,
        wpm: true,
      },
    }),
    prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { sessionDate: 'desc' },
      take: 48,
      select: {
        id: true,
        accuracy: true,
        consistency: true,
        correctedErrors: true,
        correctChars: true,
        incorrectChars: true,
        rawWpm: true,
        sessionDate: true,
        sessionDuration: true,
        totalErrors: true,
        typingTelemetry: true,
        type: true,
        uncorrectedErrors: true,
        wpm: true,
      },
    }),
    prisma.streakTracking.findUnique({
      where: { userId },
      select: {
        currentStreak: true,
        lastPracticeAt: true,
        longestStreak: true,
      },
    }),
  ]);

  const data: { date: string; wpm: number; accuracy: number; time: number; lessons: number; sessions: number }[] = [];
  const totalDays = Math.max(1, Math.floor((today.getTime() - since.getTime()) / (24 * 60 * 60 * 1000)) + 1);
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(since.getTime());
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const stat = stats.find((s) => s.date.toISOString().slice(0, 10) === key);
    const completedSessions = stat?.practiceSessions ?? 0;
    data.push({
      date: key,
      wpm: stat && completedSessions > 0 ? stat.averageWpm / completedSessions : 0,
      accuracy: stat && completedSessions > 0 ? stat.averageAccuracy / completedSessions : 0,
      time: stat ? stat.totalTimePracticed : 0,
      lessons: stat ? stat.lessonsCompleted : 0,
      sessions: completedSessions,
    });
  }

  const sessions = [...sessionRows]
    .reverse()
    .map((practiceSession) => ({
      accuracy: practiceSession.accuracy,
      consistency: practiceSession.consistency,
      correctedErrors: practiceSession.correctedErrors,
      correctChars: practiceSession.correctChars,
      id: practiceSession.id,
      incorrectChars: practiceSession.incorrectChars,
      rawWpm: practiceSession.rawWpm,
      sessionDate: practiceSession.sessionDate.toISOString(),
      sessionDuration: practiceSession.sessionDuration,
      totalErrors: practiceSession.totalErrors,
      typingTelemetry: parseTypingTelemetry(practiceSession.typingTelemetry),
      type: practiceSession.type,
      uncorrectedErrors: practiceSession.uncorrectedErrors,
      wpm: practiceSession.wpm,
    }));

  const fallbackHeatmapData: Record<string, number> = {
    a: 1, c: 2, e: 2, i: 1, k: 3, m: 5, n: 4, o: 2,
    p: 7, q: 6, r: 2, s: 1, t: 2, u: 3, v: 3, w: 2,
    x: 5, y: 2, z: 6, '1': 4, '7': 2, '8': 3, '9': 5,
    '0': 6, ';': 4, ',': 2, '.': 3, '/': 4, ' ': 3,
  };
  const liveHeatmapData = aggregateHeatmapFromTelemetry(
    sessions.map((practiceSession) => practiceSession.typingTelemetry),
  );
  const heatmapData = Object.keys(liveHeatmapData).length > 0 ? liveHeatmapData : fallbackHeatmapData;
  const telemetryMode = Object.keys(liveHeatmapData).length > 0 ? 'live' : 'preview';
  return (
    <>
      
      <AnalyticsDashboard
        data={data}
        exportHref="/api/analytics/export"
        heatmapData={heatmapData}
        sessionExtremes={{
          averageAccuracy: sessionAggregate._avg.accuracy ?? 0,
          averageRawWpm: sessionAggregate._avg.rawWpm ?? 0,
          averageWpm: sessionAggregate._avg.wpm ?? 0,
          personalBestAccuracy: sessionAggregate._max.accuracy ?? 0,
          personalBestRawWpm: sessionAggregate._max.rawWpm ?? 0,
          personalBestWpm: sessionAggregate._max.wpm ?? 0,
          totalSessions: sessionAggregate._count._all,
        }}
        sessions={sessions}
        streak={{
          currentStreak: streak?.currentStreak ?? 0,
          lastPracticeAt: streak?.lastPracticeAt?.toISOString() ?? null,
          longestStreak: streak?.longestStreak ?? 0,
        }}
        telemetryMode={telemetryMode}
      />
      <Footer />
    </>
  );
}
