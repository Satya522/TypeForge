import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

import { redirect } from 'next/navigation';
import { getDisplayName, getResolvedAvatarUrl } from '@/lib/profile';
import { aggregateHeatmapFromTelemetry, parseTypingTelemetry } from '@/lib/typingTelemetry';
import DashboardExperience, { type DashboardPayload } from './DashboardExperience';
import DashboardV2 from '@/components/dashboard/DashboardV2';

export const metadata = {
  title: 'Dashboard – TypeForge',
  description: 'Your personal dashboard overview and quick access to your typing journey.',
};

export const dynamic = 'force-dynamic';

const DAY_MS = 24 * 60 * 60 * 1000;

function round(value: number, precision = 0) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getTrendDelta(current: number[], previous: number[]) {
  const currentAvg = average(current);
  const previousAvg = average(previous);
  if (previousAvg <= 0) return currentAvg > 0 ? round(currentAvg, 1) : 0;
  return round(((currentAvg - previousAvg) / previousAvg) * 100, 1);
}

export default async function DashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const userId = session.user.id;
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const since90 = new Date(todayUtc.getTime() - 89 * DAY_MS);

  const [user, lessonProgress, practiceSessionAggregate, recentSessions, streak, achievements] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        avatarUrl: true,
        email: true,
        eloRating: true,
        image: true,
        isPremium: true,
        name: true,
        nickname: true,
        rankTier: true,
        username: true,
      },
    }),
    prisma.userLessonProgress.aggregate({
      _count: true,
      where: { userId, completed: true },
    }),
    prisma.practiceSession.aggregate({
      where: { userId },
      _avg: {
        accuracy: true,
        consistency: true,
        rawWpm: true,
        wpm: true,
      },
      _count: { _all: true },
      _max: {
        accuracy: true,
        rawWpm: true,
        wpm: true,
      },
      _sum: {
        sessionDuration: true,
        totalErrors: true,
      },
    }),
    prisma.practiceSession.findMany({
      where: { userId, sessionDate: { gte: since90 } },
      orderBy: { sessionDate: 'desc' },
      take: 120,
      select: {
        accuracy: true,
        consistency: true,
        correctedErrors: true,
        customContent: true,
        rawWpm: true,
        sessionDate: true,
        sessionDuration: true,
        totalErrors: true,
        typingTelemetry: true,
        type: true,
        wpm: true,
      },
    }),
    prisma.streakTracking.findUnique({ where: { userId } }),
    prisma.userAchievement.aggregate({
      _count: { _all: true },
      where: { userId },
    }),
  ]);

  const totalLessonsCompleted = lessonProgress._count;
  const totalSessions = practiceSessionAggregate._count._all;
  const currentStreak = streak?.currentStreak ?? 0;
  const displayName = getDisplayName(
    {
      email: user?.email ?? session.user.email,
      name: user?.name ?? session.user.name,
      nickname: user?.nickname ?? session.user.nickname,
      username: user?.username ?? session.user.username,
    },
    'Typist'
  );

  const sessionsAsc = [...recentSessions].reverse();
  const last30Start = new Date(todayUtc.getTime() - 29 * DAY_MS);
  const previous30Start = new Date(todayUtc.getTime() - 59 * DAY_MS);
  const last30Sessions = recentSessions.filter((item) => item.sessionDate >= last30Start);
  const previous30Sessions = recentSessions.filter((item) => item.sessionDate >= previous30Start && item.sessionDate < last30Start);

  const trend = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(todayUtc.getTime() - (13 - index) * DAY_MS);
    const key = getDateKey(date);
    const daySessions = sessionsAsc.filter((item) => getDateKey(item.sessionDate) === key);
    const dayWpm = average(daySessions.map((item) => item.wpm));
    const dayAccuracy = average(daySessions.map((item) => item.accuracy));
    const minutes = Math.round(daySessions.reduce((sum, item) => sum + item.sessionDuration, 0) / 60);
    const output = daySessions.length > 0 ? Math.round(dayWpm * Math.max(1, daySessions.length) * Math.max(0.25, dayAccuracy / 100)) : 0;

    return {
      accuracy: round(dayAccuracy, 1),
      date: key,
      label: formatShortDate(date),
      minutes,
      output,
      sessions: daySessions.length,
      wpm: round(dayWpm, 1),
    };
  });

  const parsedTelemetry = recentSessions.map((item) => parseTypingTelemetry(item.typingTelemetry));
  const heatmap = aggregateHeatmapFromTelemetry(parsedTelemetry);
  const weakKeys = Object.entries(heatmap)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 6)
    .map(([key, value]) => ({
      key: key === ' ' ? 'Space' : key.toUpperCase(),
      value,
    }));

  const lastSession = recentSessions[0] ?? null;
  const avgWpm = practiceSessionAggregate._avg.wpm ?? 0;
  const avgAccuracy = practiceSessionAggregate._avg.accuracy ?? 0;
  const avgConsistency = practiceSessionAggregate._avg.consistency ?? 0;
  const bestWpm = practiceSessionAggregate._max.wpm ?? 0;
  const totalMinutes = Math.round((practiceSessionAggregate._sum.sessionDuration ?? 0) / 60);
  const totalErrors = practiceSessionAggregate._sum.totalErrors ?? 0;
  const last30ActiveDays = new Set(last30Sessions.map((item) => getDateKey(item.sessionDate))).size;
  const last30Minutes = Math.round(last30Sessions.reduce((sum, item) => sum + item.sessionDuration, 0) / 60);
  const last30AvgWpm = average(last30Sessions.map((item) => item.wpm));
  const last30AvgAccuracy = average(last30Sessions.map((item) => item.accuracy));
  const focusScore = Math.min(99, Math.max(0, Math.round(avgAccuracy * 0.56 + avgConsistency * 0.28 + Math.min(avgWpm, 120) * 0.16)));
  const commandScore = Math.min(
    100,
    Math.round(
      Math.min(avgWpm / 70, 1) * 32 +
        Math.min(avgAccuracy / 97, 1) * 30 +
        Math.min(last30ActiveDays / 20, 1) * 24 +
        Math.min(currentStreak / 14, 1) * 14
    )
  );

  const modeCounts = recentSessions.reduce<Record<string, number>>((accumulator, item) => {
    const mode = item.customContent || item.type || 'Practice';
    accumulator[mode] = (accumulator[mode] ?? 0) + 1;
    return accumulator;
  }, {});
  const topMode = Object.entries(modeCounts).sort((left, right) => right[1] - left[1])[0];

  const payload: DashboardPayload = {
    heatmap,
    quickActions: [
      {
        detail: weakKeys[0] ? `Repair ${weakKeys[0].key} friction first` : 'Start a clean baseline run',
        href: weakKeys[0] ? `/practice?focus=${encodeURIComponent(weakKeys[0].key.toLowerCase())}` : '/practice',
        label: 'Precision drill',
      },
      {
        detail: 'Continue the guided learning path',
        href: '/learn',
        label: 'Continue learning',
      },
      {
        detail: 'Open deep analytics and export reports',
        href: '/analytics',
        label: 'Open analytics',
      },
    ],
    recentSessions: recentSessions.slice(0, 5).map((item) => ({
      accuracy: round(item.accuracy, 1),
      duration: item.sessionDuration,
      label: formatShortDate(item.sessionDate),
      mode: item.customContent || item.type || 'Practice',
      wpm: round(item.wpm, 1),
    })),
    stats: {
      activeDays30: last30ActiveDays,
      achievements: achievements._count._all,
      avgAccuracy: round(avgAccuracy, 1),
      avgWpm: round(avgWpm, 1),
      bestWpm: round(bestWpm, 1),
      commandScore,
      consistency: round(avgConsistency, 1),
      currentStreak,
      focusScore,
      last30AvgAccuracy: round(last30AvgAccuracy, 1),
      last30AvgWpm: round(last30AvgWpm, 1),
      last30Minutes,
      lastSessionLabel: lastSession ? formatShortDate(lastSession.sessionDate) : 'No run',
      lessonsCompleted: totalLessonsCompleted,
      longestStreak: streak?.longestStreak ?? 0,
      modeLabel: topMode?.[0] ?? 'Practice',
      modeSessions: topMode?.[1] ?? 0,
      totalErrors,
      totalMinutes,
      totalSessions,
      trendAccuracy: getTrendDelta(last30Sessions.map((item) => item.accuracy), previous30Sessions.map((item) => item.accuracy)),
      trendWpm: getTrendDelta(last30Sessions.map((item) => item.wpm), previous30Sessions.map((item) => item.wpm)),
    },
    trend,
    user: {
      avatarUrl: getResolvedAvatarUrl(user) ?? getResolvedAvatarUrl(session.user),
      displayName,
      email: user?.email ?? session.user.email ?? null,
      isPremium: Boolean(user?.isPremium),
      rankTier: user?.rankTier ?? 'Bronze',
      rating: user?.eloRating ?? 1200,
    },
    weakKeys,
  };

  // Transform data for DashboardV2
  const dashboardV2Data = {
    progress: {
      streakDays: payload.stats.currentStreak,
      streakLabel: "DAY STREAK",
      topPercent: `Top ${Math.min(5 + Math.floor((100 - payload.stats.focusScore) / 20), 30)}%`,
      weekData: Array(7).fill(false).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return last30Sessions.some(s => getDateKey(s.sessionDate) === getDateKey(date));
      }),
    },
    analytics: {
      accuracy: payload.stats.avgAccuracy,
      accuracyChange: `+${Math.max(0, payload.stats.trendAccuracy.toFixed(1))}%`,
      avgSpeed: Math.round(payload.stats.avgWpm),
      speedChange: `+${Math.max(0, payload.stats.trendWpm.toFixed(0))} WPM`,
      weakKeys: weakKeys.slice(0, 3).map(k => k.key.slice(0, 1)),
    },
    lessons: {
      steps: [
        { name: "Beginner", status: "completed" },
        { name: "Rhythm", status: "completed" },
        { name: "Accuracy", status: totalLessonsCompleted > 2 ? "active" : "locked", percent: 74 },
        { name: "Mastery", status: "locked" }
      ],
      tags: ["Adaptive", "Structured", "Trackable"]
    },
    realtime: {
      wpm: Math.round(lastSession?.wpm ?? payload.stats.avgWpm),
      acc: Math.round(lastSession?.accuracy ?? payload.stats.avgAccuracy),
      rhythm: payload.stats.focusScore > 80 ? "Excellent" : payload.stats.focusScore > 60 ? "Good" : "Fair",
      rhythmScore: payload.stats.focusScore
    },
    practice: {
      modes: [
        { label: "Code", active: false },
        { label: "AI Prompts", active: topMode?.[0] === "ai-practice" },
        { label: "Dictation", active: topMode?.[0] === "dictation" },
        { label: "Sprint", active: topMode?.[0] === "race" },
        { label: "Focus", active: topMode?.[0] === "custom-practice" }
      ],
      inputPlaceholder: "// Generate AI prompt"
    }
  };

  return (
    <>
      <DashboardV2 {...dashboardV2Data} />
      <br />
      <br />
      <DashboardExperience payload={payload} />
    </>
  );
}
