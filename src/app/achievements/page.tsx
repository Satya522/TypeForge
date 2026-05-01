import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

import Footer from '@/components/Footer';
import { redirect } from 'next/navigation';
import { BadgeCheck, CircleOff } from 'lucide-react';

export const metadata = {
  title: 'Achievements – TypeForge',
  description: 'View and track your achievements and badges.',
};

export const dynamic = 'force-dynamic';

export default async function AchievementsPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/achievements');
  }
  const userId = session.user.id;
  const [achievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.userAchievement.findMany({ where: { userId } }),
  ]);
  const achievedIds = new Set(userAchievements.map((ua) => ua.achievementId));
  return (
    <>
      
      <main className="pt-24 pb-12 px-6 mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">Achievements</h1>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {achievements.map((ach) => {
            const achieved = achievedIds.has(ach.id);
            return (
              <div
                key={ach.id}
                className={`rounded-lg border p-4 transition-colors ${achieved ? 'bg-surface-200 border-surface-300' : 'bg-surface-300 border-surface-400'} `}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold text-gray-100">{ach.name}</div>
                  {achieved ? (
                    <BadgeCheck className="h-6 w-6 text-accent-200" />
                  ) : (
                    <CircleOff className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-400">{ach.description}</p>
                <p className="mt-2 text-xs text-gray-500">XP: {ach.xpReward}</p>
                {achieved && (
                  <p className="mt-2 text-xs text-accent-100">Achieved on {new Date(userAchievements.find((ua) => ua.achievementId === ach.id)!.achievedAt).toLocaleDateString()}</p>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
