'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import {
  Lock, CheckCircle2, ChevronRight, Zap, Star,
  Sparkles, ArrowRight, Clock, BookOpen, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeroSection, MetricsStrip, ProgressRing, AmbientBackground } from './RoadmapParts';
import { MagneticButton } from '@/components/motion/MagneticButton';

// ── Types ──
type LessonStatus = 'completed' | 'current' | 'locked';

interface LessonNode {
  id: string; slug: string; title: string; description?: string | null;
  status: LessonStatus; stars: number; wpm?: number | null; accuracy?: number | null;
  xpReward: number; estimatedTime?: number | null; targetKeys?: string | null;
}

interface PathSection {
  id: string; title: string; slug: string; description?: string | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'; lessons: LessonNode[];
  completedCount: number; totalCount: number;
}

interface RoadmapClientProps {
  paths: PathSection[]; totalXP: number; totalCompleted: number;
  totalLessons: number; currentStreak: number; longestStreak: number;
}

const ease = [0.22, 1, 0.36, 1] as const;

const TIER: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  EASY: { label: 'Beginner', color: '#10b981', icon: <BookOpen className="w-4 h-4" /> },
  MEDIUM: { label: 'Intermediate', color: '#f59e0b', icon: <Zap className="w-4 h-4" /> },
  HARD: { label: 'Advanced', color: '#ef4444', icon: <Crown className="w-4 h-4" /> },
};



// ═══ LESSON CARD ═══
function LessonCard({ lesson, index }: { lesson: LessonNode; index: number }) {
  const done = lesson.status === 'completed';
  const curr = lesson.status === 'current';
  const locked = lesson.status === 'locked';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease }}
    >
      <Link
        href={locked ? '#' : `/lesson/${lesson.slug}`}
        onClick={e => locked && e.preventDefault()}
        className={cn(
          'group relative flex flex-col p-5 rounded-2xl transition-all duration-300 overflow-hidden',
          locked && 'opacity-40 cursor-not-allowed',
          !locked && 'hover:-translate-y-1',
        )}
        style={{
          background: done ? 'rgba(16,185,129,0.03)' : curr ? 'rgba(79,141,253,0.04)' : 'rgba(255,255,255,0.015)',
          border: `1px solid ${done ? 'rgba(16,185,129,0.15)' : curr ? 'rgba(79,141,253,0.2)' : 'rgba(255,255,255,0.05)'}`,
        }}
      >
        {/* Current pulse */}
        {curr && (
          <motion.div className="absolute top-0 inset-x-0 h-[2px]"
            style={{ background: 'linear-gradient(90deg, transparent, #4f8dfd, transparent)' }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }} />
        )}

        {/* Hover glow */}
        {!locked && (
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 100%, ${done ? 'rgba(16,185,129,0.06)' : 'rgba(79,141,253,0.06)'}, transparent 70%)` }} />
        )}

        {/* Top row */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-transform duration-300 group-hover:scale-110')}
            style={{
              background: done ? 'rgba(16,185,129,0.12)' : curr ? 'rgba(79,141,253,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${done ? 'rgba(16,185,129,0.25)' : curr ? 'rgba(79,141,253,0.25)' : 'rgba(255,255,255,0.06)'}`,
              color: done ? '#34d399' : curr ? '#4f8dfd' : '#4b5563',
            }}>
            {done ? <CheckCircle2 className="w-4 h-4" /> : locked ? <Lock className="w-3.5 h-3.5" /> : index + 1}
          </div>

          {done && lesson.stars > 0 && (
            <div className="flex gap-[2px]">
              {[1, 2, 3].map(s => (
                <Star key={s} className={cn('w-3.5 h-3.5', s <= lesson.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700/50')} />
              ))}
            </div>
          )}
          {curr && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
              style={{ letterSpacing: '0.08em', color: '#4f8dfd', background: 'rgba(79,141,253,0.08)', border: '1px solid rgba(79,141,253,0.15)' }}>
              Next
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className={cn('text-[15px] font-semibold mb-1 transition-colors leading-snug relative z-10',
          done ? 'text-gray-200' : curr ? 'text-white group-hover:text-[#4f8dfd]' : 'text-gray-500')}>
          {lesson.title}
        </h4>

        {lesson.description && (
          <p className="text-xs leading-relaxed mb-3 line-clamp-2 relative z-10" style={{ color: '#6b7280' }}>{lesson.description}</p>
        )}

        {/* Bottom meta */}
        <div className="mt-auto flex items-center justify-between pt-2 relative z-10">
          <div className="flex items-center gap-3 text-[11px]" style={{ color: '#6b7280' }}>
            {lesson.targetKeys && (
              <span className="font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)' }}>{lesson.targetKeys}</span>
            )}
            {lesson.estimatedTime && (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.ceil(lesson.estimatedTime / 60)}m</span>
            )}
            {lesson.xpReward > 0 && (
              <span className="flex items-center gap-1" style={{ color: 'rgba(251,191,36,0.6)' }}><Zap className="w-3 h-3" />{lesson.xpReward} XP</span>
            )}
          </div>

          {done && lesson.wpm && (
            <div className="flex items-center gap-2 text-[11px]">
              <span style={{ color: '#34d399' }}>{Math.round(lesson.wpm)} WPM</span>
              {lesson.accuracy && <span style={{ color: '#6b7280' }}>{Math.round(lesson.accuracy)}%</span>}
            </div>
          )}

          {curr && (
            <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{ background: 'rgba(79,141,253,0.1)', color: '#4f8dfd' }}>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Surface shine */}
        <div className="absolute top-0 inset-x-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.04) 50%, transparent 80%)' }} />
      </Link>
    </motion.div>
  );
}

// ═══ PATH SECTION (TIER ROW) ═══
function TierSection({ path, pathIndex }: { path: PathSection; pathIndex: number }) {
  const [expanded, setExpanded] = useState(pathIndex < 2);
  const tier = TIER[path.difficulty] || TIER.EASY;
  const pct = path.totalCount > 0 ? Math.round((path.completedCount / path.totalCount) * 100) : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 + pathIndex * 0.08, ease }}
      className="relative"
    >
      {/* Inter-section connector */}
      {pathIndex > 0 && (
        <div className="flex justify-start ml-[19px] mb-3">
          <div className="w-[2px] h-6" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.02))' }} />
        </div>
      )}

      {/* Tier Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left group relative rounded-2xl p-5 sm:p-6 transition-all duration-300 overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: `1px solid ${expanded ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
        }}
      >
        {/* Hover glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 0% 50%, ${tier.color}06, transparent 60%)` }} />

        {/* Surface shine */}
        <div className="absolute top-0 inset-x-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.04) 50%, transparent 90%)' }} />

        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* Left: Ring + Info */}
          <div className="flex items-center gap-4 sm:gap-5">
            <ProgressRing percent={pct} size={44} strokeWidth={3.5} color={tier.color} />

            <div>
              {/* Tier badge */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[10px] font-semibold uppercase"
                  style={{ letterSpacing: '0.08em', color: tier.color, background: `${tier.color}10`, border: `1px solid ${tier.color}18` }}>
                  {tier.icon}
                  {tier.label}
                </span>
                <span className="text-[11px] font-medium" style={{ color: '#6b7280' }}>
                  {path.completedCount}/{path.totalCount} lessons
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold text-[#f8f9fa] group-hover:text-white transition-colors">
                {path.title}
              </h3>
              {path.description && (
                <p className="text-sm mt-0.5 max-w-lg hidden sm:block" style={{ color: '#6b7280' }}>{path.description}</p>
              )}
            </div>
          </div>

          {/* Right: Progress bar + expand */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Mini progress bar */}
            <div className="hidden md:block w-28">
              <div className="h-[5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${tier.color}, ${tier.color}cc)` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1], delay: 0.5 }}
                />
              </div>
            </div>

            <motion.div
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#6b7280' }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </button>

      {/* Expanded lessons */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="overflow-hidden"
          >
            <div className="pt-4 pb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {path.lessons.map((lesson, idx) => (
                <LessonCard key={lesson.id} lesson={lesson} index={idx} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

// ═══════════════════════════════════
// ═══ MAIN ROADMAP CLIENT ═══
// ═══════════════════════════════════
export default function RoadmapClient({ paths, totalXP, totalCompleted, totalLessons, currentStreak, longestStreak }: RoadmapClientProps) {
  const pct = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />

      <div className="relative z-10">
        <HeroSection />

        <MetricsStrip
          totalXP={totalXP}
          totalCompleted={totalCompleted}
          totalLessons={totalLessons}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          overallPercent={pct}
        />



        {/* ── Tier Sections ── */}
        <div className="space-y-4">
          {paths.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <Sparkles className="w-14 h-14 mx-auto mb-5" style={{ color: 'rgba(79,141,253,0.3)' }} />
              <h3 className="text-2xl font-bold text-gray-200 mb-3">Coming Soon</h3>
              <p className="max-w-md mx-auto mb-6" style={{ color: '#6b7280' }}>
                The structured learning roadmap is being crafted by our team.
                In the meantime, explore the Practice Arena to sharpen your skills.
              </p>
              <Link href="/practice"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-black transition-colors"
                style={{ background: '#4f8dfd' }}>
                Go to Practice <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            paths.map((path, idx) => (
              <TierSection key={path.id} path={path} pathIndex={idx} />
            ))
          )}
        </div>

        {/* ── Bottom CTA ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-20 text-center">
          <div className="h-px w-full max-w-md mx-auto mb-10"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(79,141,253,0.15), transparent)' }} />
          <p className="text-sm mb-5" style={{ color: '#6b7280' }}>
            Can&apos;t wait for the next lesson? Practice with 25+ free-style modules.
          </p>
          <MagneticButton>
            <Link href="/practice"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
              style={{ color: '#4f8dfd', background: 'rgba(79,141,253,0.06)', border: '1px solid rgba(79,141,253,0.15)' }}>
              <Sparkles className="w-4 h-4" />
              Open Practice Arena
            </Link>
          </MagneticButton>
        </motion.div>
      </div>
    </div>
  );
}
