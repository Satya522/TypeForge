import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

import Footer from '@/components/Footer';
import AnalyticsDashboard from './AnalyticsDashboard';
import { redirect } from 'next/navigation';
import { aggregateHeatmapFromTelemetry, parseTypingTelemetry } from '@/lib/typingTelemetry';

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

  const since = new Date();
  since.setDate(since.getDate() - 59);

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
  for (let i = 0; i < 60; i++) {
    const d = new Date(since.getTime());
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const stat = stats.find((s) => s.date.toISOString().slice(0, 10) === key);
    const completedSessions = stat?.practiceSessions ?? 0;
    data.push({
      date: key.substring(5), // MM-DD for chart
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
    a: 1,
    c: 2,
    e: 2,
    i: 1,
    k: 3,
    m: 5,
    n: 4,
    o: 2,
    p: 7,
    q: 6,
    r: 2,
    s: 1,
    t: 2,
    u: 3,
    v: 3,
    w: 2,
    x: 5,
    y: 2,
    z: 6,
    '1': 4,
    '7': 2,
    '8': 3,
    '9': 5,
    '0': 6,
    ';': 4,
    ',': 2,
    '.': 3,
    '/': 4,
    ' ': 3,
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
