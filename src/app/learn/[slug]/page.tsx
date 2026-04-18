import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { ArrowLeft, Lock, CheckCircle2, Clock, Zap, Star, ChevronRight, BookOpen } from 'lucide-react';

interface LearnPathPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

const TIER_CONFIG = {
  beginner: { color: '#39FF14', glow: 'rgba(57,255,20,0.12)', border: 'rgba(57,255,20,0.2)', icon: '🌱', badge: 'text-green-400 bg-green-500/10 border-green-500/20' },
  medium:   { color: '#06b6d4', glow: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.2)',  icon: '⚡', badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  advanced: { color: '#a855f7', glow: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.2)', icon: '🔥', badge: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
} as const;

function formatTime(seconds?: number | null) {
  if (!seconds) return null;
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60 > 0 ? `${seconds % 60}s` : ''}`.trim();
}

export default async function LearnPathPage({ params }: LearnPathPageProps) {
  const { slug } = await params;
  const session = await getServerAuthSession();
  const userId = session?.user?.id;

  const path = await prisma.lessonPath.findUnique({
    where: { slug },
    include: { lessons: { orderBy: { order: 'asc' } } },
  });
  if (!path) notFound();

  // Fetch user progress
  let progressMap: Record<string, { completed: boolean; wpm?: number | null; accuracy?: number | null; stars: number }> = {};
  if (userId) {
    const progresses = await prisma.userLessonProgress.findMany({
      where: { userId, lessonId: { in: path.lessons.map(l => l.id) } },
    });
    progressMap = Object.fromEntries(progresses.map(p => [p.lessonId, { completed: p.completed, wpm: p.wpm, accuracy: p.accuracy, stars: p.stars }]));
  }

  const cfg = TIER_CONFIG[slug as keyof typeof TIER_CONFIG] || TIER_CONFIG.beginner;
  const totalLessons = path.lessons.length;
  const completedCount = path.lessons.filter(l => progressMap[l.id]?.completed).length;
  const progressPct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  const totalXp = path.lessons.reduce((sum, l) => sum + (l.xpReward ?? 0), 0);
  const earnedXp = path.lessons.filter(l => progressMap[l.id]?.completed).reduce((sum, l) => sum + (l.xpReward ?? 0), 0);

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-5 mx-auto max-w-3xl">

        {/* ── Back ── */}
        <Link href="/learn"
          className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-200 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All Learning Paths
        </Link>

        {/* ── Path header ── */}
        <div className="rounded-2xl p-6 mb-8 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${cfg.glow.replace('0.12', '0.06')} 0%, rgba(10,12,10,0.99) 60%)`,
            border: `1px solid ${cfg.border}`,
            boxShadow: `0 0 40px ${cfg.glow}`,
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />

          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <span className="text-3xl mb-2 block">{cfg.icon}</span>
              <h1 className="text-3xl font-black text-white mb-1">{path.title}</h1>
              {path.description && <p className="text-gray-400 text-sm leading-relaxed mb-4">{path.description}</p>}

              {/* Stats row */}
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  <span className="text-[12px] text-gray-400 font-medium">{totalLessons} modules</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  <span className="text-[12px] text-gray-400 font-medium">{totalXp} XP total</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  <span className="text-[12px] text-gray-400 font-medium">{completedCount}/{totalLessons} completed</span>
                </div>
              </div>
            </div>

            {/* Circular progress */}
            <div className="shrink-0 flex flex-col items-center sm:items-end gap-1">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 80 80" className="rotate-[-90deg] w-full h-full">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke={cfg.color} strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPct / 100)}`}
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-white leading-none">{progressPct}%</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Progress</span>
              {userId && (
                <span className="text-[11px] font-bold" style={{ color: cfg.color }}>{earnedXp} / {totalXp} XP earned</span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {userId && progressPct > 0 && (
            <div className="mt-5">
              <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})` }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Module list ── */}
        <div className="space-y-3">
          {path.lessons.map((lesson, index) => {
            const progress = progressMap[lesson.id];
            const completed = progress?.completed ?? false;
            // Unlock: first lesson always unlocked; subsequent locked until previous is done
            const unlocked = index === 0 || !!progressMap[path.lessons[index - 1].id]?.completed;
            const isCurrent = !completed && unlocked;
            const timeStr = formatTime(lesson.estimatedTime);

            return (
              <div
                key={lesson.id}
                className="relative rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  background: completed
                    ? `linear-gradient(135deg, ${cfg.glow.replace('0.12','0.05')} 0%, rgba(10,12,10,0.98) 100%)`
                    : isCurrent
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(255,255,255,0.015)',
                  border: completed
                    ? `1px solid ${cfg.border}`
                    : isCurrent
                    ? '1px solid rgba(255,255,255,0.1)'
                    : '1px solid rgba(255,255,255,0.04)',
                  opacity: !unlocked ? 0.45 : 1,
                }}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Step number / status icon */}
                  <div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                    style={{
                      background: completed ? `${cfg.color}22` : isCurrent ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                      border: completed ? `1px solid ${cfg.color}44` : '1px solid rgba(255,255,255,0.08)',
                      color: completed ? cfg.color : !unlocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {completed ? <CheckCircle2 className="w-5 h-5" /> : !unlocked ? <Lock className="w-4 h-4" /> : String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={`font-bold text-[14px] leading-tight truncate ${completed ? 'text-white' : !unlocked ? 'text-gray-600' : 'text-gray-100'}`}>
                        {lesson.title}
                      </h3>
                      {isCurrent && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase"
                          style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
                          NEXT
                        </span>
                      )}
                    </div>
                    <p className={`text-[12px] line-clamp-1 ${completed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {lesson.description || 'Complete this module to progress.'}
                    </p>

                    {/* Meta: time + XP + stars */}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {timeStr && (
                        <span className="flex items-center gap-1 text-[10px] text-gray-600">
                          <Clock className="w-3 h-3" /> {timeStr}
                        </span>
                      )}
                      {lesson.xpReward > 0 && (
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: cfg.color }}>
                          <Zap className="w-3 h-3" /> {lesson.xpReward} XP
                        </span>
                      )}
                      {completed && progress?.stars && progress.stars > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-yellow-400">
                          {Array.from({ length: progress.stars }).map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-yellow-400" />)}
                        </span>
                      )}
                      {completed && progress?.wpm && (
                        <span className="text-[10px] text-gray-500">Best: {Math.round(progress.wpm)} WPM · {progress.accuracy ? Math.round(progress.accuracy) : '–'}% ACC</span>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="shrink-0">
                    {completed ? (
                      <Link href={`/lesson/${lesson.slug}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                        style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                        Redo
                      </Link>
                    ) : unlocked ? (
                      <Link href={`/lesson/${lesson.slug}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold transition-all group active:scale-95"
                        style={{
                          background: `linear-gradient(135deg, ${cfg.color}22, ${cfg.color}10)`,
                          border: `1px solid ${cfg.color}50`,
                          color: cfg.color,
                          boxShadow: `0 0 16px ${cfg.glow}`,
                        }}>
                        {index === 0 && completedCount === 0 ? 'Start' : 'Begin'}
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    ) : (
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-600">
                        <Lock className="w-3 h-3" /> Locked
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom progress line for current lesson */}
                {isCurrent && (
                  <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${cfg.color}60, transparent)` }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Completion message ── */}
        {completedCount === totalLessons && totalLessons > 0 && (
          <div className="mt-8 rounded-2xl p-6 text-center"
            style={{ background: `${cfg.glow}`, border: `1px solid ${cfg.border}` }}>
            <div className="text-4xl mb-3">🏆</div>
            <h2 className="text-xl font-black text-white mb-1">Path Complete!</h2>
            <p className="text-gray-400 text-sm mb-4">You've finished all {totalLessons} modules in the {path.title} path.</p>
            <Link href="/learn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all"
              style={{ background: cfg.color, color: '#000' }}>
              Continue to next path <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}
