import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Trophy, Star, Zap, Lock, Flame, Target, Keyboard, Medal, Crown } from 'lucide-react';

export const metadata = {
  title: 'Achievements & Badges – TypeForge',
  description: 'Track your milestones, earned badges, and typing accolades.',
};

export const dynamic = 'force-dynamic';

function getAchievementConfig(slug: string) {
  switch (slug) {
    case 'first-lesson': return { icon: <Star className="w-8 h-8" />, color: '#3b82f6', bg: 'bg-blue-500/10' };
    case '50-wpm': return { icon: <Zap className="w-8 h-8" />, color: '#eab308', bg: 'bg-yellow-500/10' };
    case '100-wpm': return { icon: <Flame className="w-8 h-8 focus-pulse" />, color: '#ef4444', bg: 'bg-red-500/10' };
    case '95-accuracy': return { icon: <Target className="w-8 h-8" />, color: '#22c55e', bg: 'bg-green-500/10' };
    case 'perfect-session': return { icon: <Target className="w-8 h-8" />, color: '#14b8a6', bg: 'bg-teal-500/10' };
    case 'home-row-hero': return { icon: <Keyboard className="w-8 h-8" />, color: '#a855f7', bg: 'bg-purple-500/10' };
    case 'medium-complete': return { icon: <Medal className="w-8 h-8" />, color: '#8b5cf6', bg: 'bg-violet-500/10' };
    case 'advanced-complete': return { icon: <Crown className="w-8 h-8" />, color: '#d946ef', bg: 'bg-fuchsia-500/10' };
    case 'streak-7': return { icon: <Flame className="w-8 h-8" />, color: '#f97316', bg: 'bg-orange-500/10' };
    case 'code-whisperer': return { icon: <Keyboard className="w-8 h-8" />, color: '#6366f1', bg: 'bg-indigo-500/10' };
    default: return { icon: <Trophy className="w-8 h-8" />, color: '#eab308', bg: 'bg-yellow-500/10' };
  }
}

export default async function AchievementsPage() {
  const session = await getServerAuthSession();
  let userAchievements: any[] = [];
  let userId = '';

  if (session?.user?.id) {
    userId = session.user.id;
    userAchievements = await prisma.userAchievement.findMany({ where: { userId } });
  } else {
    redirect('/login?callbackUrl=/achievements');
  }

  const achievements = await prisma.achievement.findMany({ orderBy: { xpReward: 'asc' } });
  const achievedIds = new Set(userAchievements.map((ua) => ua.achievementId));
  const totalEarned = achievedIds.size;
  const totalAvailable = achievements.length;
  const progressPct = totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0;
  
  const totalEarnedXp = achievements
    .filter(a => achievedIds.has(a.id))
    .reduce((sum, a) => sum + a.xpReward, 0);

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-5 mx-auto max-w-6xl">
        
        {/* ── Header Area ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4"
              style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', color: '#eab308' }}>
              <Trophy className="w-3 h-3" /> Player Awards
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
              Achievements
            </h1>
            <p className="text-gray-400 text-base max-w-xl">
              Unlock prestigious badges by reaching typing milestones, maintaining streaks, and conquering rigorous courses.
            </p>
          </div>

          {/* User Stats Card */}
          <div className="shrink-0 p-5 rounded-2xl flex flex-col items-center justify-center min-w-[240px]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Completion</div>
            <div className="text-4xl font-black text-white mb-2">{progressPct}%</div>
            
            <div className="w-full bg-surface-400 h-2 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full" style={{ width: `${progressPct}%` }}></div>
            </div>

            <div className="flex justify-between w-full text-xs font-semibold text-gray-500">
              <span>{totalEarned} Unlocked</span>
              <span className="text-yellow-500">{totalEarnedXp} XP</span>
            </div>
          </div>
        </div>

        {/* ── Badges Grid ── */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {achievements.map((ach) => {
            const achieved = achievedIds.has(ach.id);
            const userAch = userAchievements.find((ua) => ua.achievementId === ach.id);
            const cfg = getAchievementConfig(ach.slug);

            return (
              <div
                key={ach.id}
                className="relative group rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
                style={{
                  background: achieved 
                    ? `linear-gradient(145deg, rgba(20,20,22,0.95) 0%, rgba(10,10,12,0.98) 100%)` 
                    : `rgba(10,10,12,0.6)`,
                  border: achieved 
                    ? `1px solid ${cfg.color}50` 
                    : `1px solid rgba(255,255,255,0.05)`,
                  boxShadow: achieved ? `0 8px 30px ${cfg.color}15` : 'none',
                  filter: achieved ? 'none' : 'grayscale(100%) opacity(0.6)',
                }}
              >
                {/* Glow effect on hover for unlocked */}
                {achieved && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at center, ${cfg.color}15 0%, transparent 70%)` }}
                  />
                )}

                <div className="p-6 flex flex-col items-center text-center relative z-10">
                  {/* Icon Container */}
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 relative transform transition-transform duration-500 ${achieved ? 'group-hover:scale-110 group-hover:rotate-3' : ''}`}
                    style={{ 
                      background: achieved ? `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}10)` : 'rgba(255,255,255,0.05)',
                      border: achieved ? `1px solid ${cfg.color}60` : '1px solid rgba(255,255,255,0.1)',
                      color: achieved ? cfg.color : '#6b7280',
                      boxShadow: achieved ? `inset 0 0 20px ${cfg.color}20, 0 0 20px ${cfg.color}30` : 'none',
                    }}
                  >
                    {achieved ? cfg.icon : <Lock className="w-8 h-8 opacity-50" />}
                    
                    {/* Tiny XP Badge */}
                    <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black border"
                      style={{ 
                        background: achieved ? '#1a1a1a' : '#111', 
                        color: achieved ? cfg.color : '#666',
                        borderColor: achieved ? `${cfg.color}40` : '#333'
                      }}>
                      {ach.xpReward} XP
                    </div>
                  </div>

                  <h3 className={`text-lg font-black mb-2 ${achieved ? 'text-white' : 'text-gray-500'}`}>
                    {ach.name}
                  </h3>
                  <p className={`text-sm mb-4 line-clamp-2 min-h-[40px] ${achieved ? 'text-gray-400' : 'text-gray-600'}`}>
                    {ach.description}
                  </p>

                  {/* Status Bar */}
                  <div className="mt-auto w-full pt-4 border-t border-white/[0.05]">
                    {achieved && userAch ? (
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: cfg.color }}>
                        Unlocked {new Date(userAch.achievedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>
      <Footer />
    </>
  );
}
