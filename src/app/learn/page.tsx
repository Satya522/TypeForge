import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { getServerAuthSession } from '@/lib/auth';
import Link from 'next/link';
import { ArrowRight, Lock, CheckCircle2, Star, Zap, Target, ChevronRight, Compass, Swords, BrainCircuit } from 'lucide-react';

export const metadata = {
  title: 'Learning Paths – TypeForge',
  description: 'Master touch typing from beginner to elite. Structured learning paths with guided modules.',
};

export const dynamic = 'force-dynamic';

const TIER_CONFIG = {
  beginner: {
    label: 'Beginner',
    color: '#39FF14',
    glow: 'rgba(57,255,20,0.15)',
    border: 'rgba(57,255,20,0.25)',
    badge: 'bg-green-500/10 border-green-500/20 text-green-400',
    icon: <Compass className="w-3 h-3" />,
    tagline: 'Zero to typing fluency',
    gradient: 'linear-gradient(135deg, rgba(57,255,20,0.08) 0%, rgba(0,0,0,0) 60%)',
  },
  medium: {
    label: 'Medium',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.15)',
    border: 'rgba(6,182,212,0.25)',
    badge: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    icon: <Swords className="w-3 h-3" />,
    tagline: 'Speed & full keyboard control',
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(0,0,0,0) 60%)',
  },
  advanced: {
    label: 'Advanced',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.15)',
    border: 'rgba(168,85,247,0.25)',
    badge: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    icon: <BrainCircuit className="w-3 h-3" />,
    tagline: 'Elite speed, code & precision',
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(0,0,0,0) 60%)',
  },
} as const;

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const d = difficulty.toLowerCase();
  const cfg = d === 'easy' ? TIER_CONFIG.beginner : d === 'medium' ? TIER_CONFIG.medium : TIER_CONFIG.advanced;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${cfg.badge}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export default async function LearnPage() {
  const session = await getServerAuthSession();
  const userId = session?.user?.id;

  const lessonPaths = await prisma.lessonPath.findMany({
    orderBy: { order: 'asc' },
    include: { lessons: { select: { id: true, order: true } } },
  });

  // Fetch user progress for all lessons across all paths
  let progressMap: Record<string, boolean> = {};
  if (userId) {
    const completedLessons = await prisma.userLessonProgress.findMany({
      where: { userId, completed: true },
      select: { lessonId: true },
    });
    progressMap = Object.fromEntries(completedLessons.map(p => [p.lessonId, true]));
  }

  // Compute completion % per path
  const pathStats = lessonPaths.map(path => {
    const total = path.lessons.length;
    const completed = path.lessons.filter(l => progressMap[l.id]).length;
    return { ...path, total, completed, pct: total ? Math.round((completed / total) * 100) : 0 };
  });

  // Beginner must be ≥60% complete to unlock Medium; Medium ≥60% for Advanced
  const beginnerPct  = pathStats.find(p => p.slug === 'beginner')?.pct  ?? 0;
  const mediumPct    = pathStats.find(p => p.slug === 'medium')?.pct    ?? 0;

  function isUnlocked(slug: string) {
    if (slug === 'beginner') return true;
    if (slug === 'medium')   return beginnerPct >= 60;
    if (slug === 'advanced') return mediumPct   >= 60;
    return false;
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-5 mx-auto max-w-6xl">

        {/* ── Hero header ── */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4"
            style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.2)', color: '#39FF14' }}>
            <Zap className="w-3 h-3" /> Structured Learning
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
            Learning <span style={{ background: 'linear-gradient(135deg, #39FF14, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Paths</span>
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Follow a structured journey from your first keystroke to elite-level typing. Complete modules in order to unlock the next tier.
          </p>
        </div>

        {/* ── Progress ribbon ── */}
        {userId && (
          <div className="flex gap-3 mb-10 flex-wrap justify-center">
            {pathStats.map(path => {
              const slug = path.slug as keyof typeof TIER_CONFIG;
              const cfg = TIER_CONFIG[slug] || TIER_CONFIG.beginner;
              const unlocked = isUnlocked(path.slug);
              return (
                <div key={path.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${cfg.border}` }}>
                  <span>{cfg.icon}</span>
                  <span style={{ color: cfg.color }}>{path.title}</span>
                  {unlocked ? (
                    <span className="text-gray-500">{path.pct}% done</span>
                  ) : (
                    <Lock className="w-3 h-3 text-gray-600" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Path cards ── */}
        <div className="grid gap-8 md:grid-cols-3">
          {pathStats.map((path, idx) => {
            const slug = path.slug as keyof typeof TIER_CONFIG;
            const cfg = TIER_CONFIG[slug] || TIER_CONFIG.beginner;
            const unlocked = isUnlocked(path.slug);
            const isStarted = path.pct > 0;
            const isComplete = path.pct === 100;

            return (
              <div
                key={path.id}
                className="relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
                style={{
                  background: `${cfg.gradient}, linear-gradient(180deg, rgba(18,20,18,0.98) 0%, rgba(10,12,10,0.99) 100%)`,
                  border: `1px solid ${unlocked ? cfg.border : 'rgba(255,255,255,0.05)'}`,
                  boxShadow: unlocked ? `0 0 40px ${cfg.glow}, 0 2px 0 ${cfg.border}` : 'none',
                  opacity: unlocked ? 1 : 0.5,
                }}
              >
                {/* Top accent line */}
                {unlocked && (
                  <div className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }}
                  />
                )}

                {/* Lock overlay */}
                {!unlocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-2xl" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}>
                    <Lock className="w-8 h-8 text-gray-600 mb-2" />
                    <p className="text-gray-500 text-sm font-medium">
                      Complete {idx === 1 ? 'Beginner' : 'Medium'} (60%+) to unlock
                    </p>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-3xl mb-2">{cfg.icon}</div>
                      <h2 className="text-2xl font-black text-white mb-0.5">{path.title}</h2>
                      <p className="text-xs font-bold tracking-widest" style={{ color: cfg.color }}>{cfg.tagline}</p>
                    </div>
                    <DifficultyBadge difficulty={path.difficulty} />
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed mb-5 flex-1">
                    {path.description}
                  </p>

                  {/* Stats row */}
                  <div className="flex gap-4 mb-5">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                      <span className="text-[11px] text-gray-400 font-medium">{path.total} modules</span>
                    </div>
                    {userId && isStarted && (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                        <span className="text-[11px] text-gray-400 font-medium">{path.completed} done</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {userId && isStarted && (
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Progress</span>
                        <span className="text-[11px] font-bold" style={{ color: cfg.color }}>{path.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${path.pct}%`, background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  {unlocked && (
                    <Link
                      href={`/learn/${path.slug}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 group active:scale-95"
                      style={{
                        background: isComplete
                          ? `${cfg.color}22`
                          : `${cfg.color}18`,
                        border: `1px solid ${cfg.color}44`,
                        color: cfg.color,
                        boxShadow: `0 0 20px ${cfg.glow}`,
                      }}
                    >
                      {isComplete ? (
                        <><CheckCircle2 className="w-4 h-4" /> Review Path</>
                      ) : isStarted ? (
                        <>Continue <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                      ) : (
                        <>Start Path <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                      )}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Journey info ── */}
        <div className="mt-12 rounded-2xl p-6 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex justify-center gap-8 flex-wrap">
            {[
              { icon: '🌱', label: 'Beginner', desc: 'Home row, posture, basic keys' },
              { icon: '→', label: '', desc: '' },
              { icon: '⚡', label: 'Medium', desc: 'Full keyboard, numbers, speed' },
              { icon: '→', label: '', desc: '' },
              { icon: '🔥', label: 'Advanced', desc: 'Code, symbols, elite mastery' },
            ].map((step, i) => (
              step.label ? (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="text-sm font-bold text-gray-200">{step.label}</span>
                  <span className="text-[11px] text-gray-500 max-w-[100px] text-center">{step.desc}</span>
                </div>
              ) : (
                <div key={i} className="flex items-center text-gray-700 text-xl font-bold self-start mt-3">{step.icon}</div>
              )
            ))}
          </div>
          <p className="text-gray-600 text-xs mt-4">Complete 60% of each level to unlock the next. Your progress is saved automatically.</p>
        </div>

      </main>
      <Footer />
    </>
  );
}
