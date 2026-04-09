import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Leaderboard – TypeForge',
  description: 'See how you rank against other typists.',
};

export const dynamic = 'force-dynamic';

function getDateRange(period: string) {
  const now = new Date();
  switch (period) {
    case 'weekly': {
      const start = new Date();
      start.setDate(now.getDate() - 7);
      return start;
    }
    case 'all':
      return undefined;
    case 'daily':
    default: {
      const start = new Date();
      start.setDate(now.getDate() - 1);
      return start;
    }
  }
}

interface LeaderboardPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/leaderboard');
  }
  const { period = 'daily' } = await searchParams;
  const since = getDateRange(period);
  // Group by userId, compute max wpm and avg accuracy; join user table
  const leaderboard = await prisma.practiceSession.groupBy({
    by: ['userId'],
    where: {
      type: 'PRACTICE',
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    _max: {
      wpm: true,
    },
    _avg: {
      accuracy: true,
    },
    take: 10,
    orderBy: {
      _max: {
        wpm: 'desc',
      },
    },
  });
  // fetch user details for each entry
  const userIds = leaderboard.map((entry) => entry.userId);
  const users = await prisma.user.findMany({ where: { id: { in: userIds } } });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">Leaderboard</h1>
        <div className="mb-4 flex gap-4">
          <a href="?period=daily" className={`px-3 py-1 rounded-md border ${period === 'daily' ? 'bg-accent-300 text-surface-100 border-accent-300 shadow-[0_0_24px_rgba(57,255,20,0.15)]' : 'bg-surface-200 border-surface-300 text-gray-300'}`}>Daily</a>
          <a href="?period=weekly" className={`px-3 py-1 rounded-md border ${period === 'weekly' ? 'bg-accent-300 text-surface-100 border-accent-300 shadow-[0_0_24px_rgba(57,255,20,0.15)]' : 'bg-surface-200 border-surface-300 text-gray-300'}`}>Weekly</a>
          <a href="?period=all" className={`px-3 py-1 rounded-md border ${period === 'all' ? 'bg-accent-300 text-surface-100 border-accent-300 shadow-[0_0_24px_rgba(57,255,20,0.15)]' : 'bg-surface-200 border-surface-300 text-gray-300'}`}>All‑time</a>
        </div>
        {leaderboard.length === 0 ? (
          <p className="text-gray-400">No entries yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-300 text-sm text-gray-400">
                <th className="py-2">Rank</th>
                <th className="py-2">User</th>
                <th className="py-2">Best WPM</th>
                <th className="py-2">Avg Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => {
                const user = userMap[entry.userId];
                return (
                  <tr key={entry.userId} className="border-b border-surface-300">
                    <td className="py-2 text-gray-300">#{idx + 1}</td>
                    <td className="py-2 text-gray-300">{user?.name || user?.email || 'User'}</td>
                    <td className="py-2 text-accent-200 font-semibold">{entry._max.wpm?.toFixed(0)}</td>
                    <td className="py-2 text-gray-300">{entry._avg.accuracy?.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </main>
      <Footer />
    </>
  );
}
