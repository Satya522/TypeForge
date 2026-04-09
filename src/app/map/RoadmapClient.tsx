'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Lock, CheckCircle2, ChevronRight, Zap, Star, Trophy, Target,
  Flame, Sparkles, ArrowRight, Clock, BookOpen, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──
type LessonStatus = 'completed' | 'current' | 'locked';

interface LessonNode {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  status: LessonStatus;
  stars: number;
  wpm?: number | null;
  accuracy?: number | null;
  xpReward: number;
  estimatedTime?: number | null;
  targetKeys?: string | null;
}

interface PathSection {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  lessons: LessonNode[];
  completedCount: number;
  totalCount: number;
}

interface RoadmapClientProps {
  paths: PathSection[];
  totalXP: number;
  totalCompleted: number;
  totalLessons: number;
  currentStreak: number;
  longestStreak: number;
}

// ── Difficulty Config ──
const DIFFICULTY_META: Record<string, { label: string; color: string; glow: string; border: string; bg: string; icon: React.ReactNode }> = {
  EASY: {
    label: 'Beginner',
    color: 'text-emerald-400',
    glow: 'rgba(52,211,153,0.15)',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10',
    icon: <BookOpen className="w-4 h-4" />,
  },
  MEDIUM: {
    label: 'Intermediate',
    color: 'text-amber-400',
    glow: 'rgba(251,191,36,0.15)',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
    icon: <Zap className="w-4 h-4" />,
  },
  HARD: {
    label: 'Advanced',
    color: 'text-rose-400',
    glow: 'rgba(244,63,94,0.15)',
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/10',
    icon: <Crown className="w-4 h-4" />,
  },
};

// ── Floating Particle ──
function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4 + Math.random() * 6,
            height: 4 + Math.random() * 6,
            background: `rgba(57, 255, 20, ${0.08 + Math.random() * 0.12})`,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 5 + Math.random() * 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
}

// ── Progress Ring SVG ──
function ProgressRing({ percent, size = 56, stroke = 4 }: { percent: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#ring-gradient)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
      />
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#39FF14" />
          <stop offset="100%" stopColor="#00D4AA" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Stat Card ──
function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative group rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm p-5 overflow-hidden hover:border-accent-300/20 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent-300/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-accent-300/10 flex items-center justify-center text-accent-300">
            {icon}
          </div>
          <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{label}</span>
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ── Lesson Node Card ──
function LessonCard({ lesson, index, pathSlug }: { lesson: LessonNode; index: number; pathSlug: string }) {
  const isCompleted = lesson.status === 'completed';
  const isCurrent = lesson.status === 'current';
  const isLocked = lesson.status === 'locked';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link
        href={isLocked ? '#' : `/lesson/${lesson.slug}`}
        className={cn(
          'group relative flex flex-col p-5 rounded-2xl border transition-all duration-300 overflow-hidden',
          isCompleted && 'bg-emerald-500/[0.04] border-emerald-500/20 hover:border-emerald-400/40',
          isCurrent && 'bg-accent-300/[0.06] border-accent-300/30 hover:border-accent-300/50 shadow-[0_0_30px_rgba(57,255,20,0.08)]',
          isLocked && 'bg-white/[0.01] border-white/[0.04] opacity-50 cursor-not-allowed',
          !isLocked && 'hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]'
        )}
        onClick={e => isLocked && e.preventDefault()}
      >
        {/* Current Indicator Pulse */}
        {isCurrent && (
          <motion.div
            className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent-300 to-transparent"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Top Row: Number + Status */}
        <div className="flex items-center justify-between mb-3">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border',
            isCompleted && 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
            isCurrent && 'bg-accent-300/20 border-accent-300/40 text-accent-300',
            isLocked && 'bg-white/[0.04] border-white/[0.08] text-gray-600',
          )}>
            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isLocked ? <Lock className="w-3.5 h-3.5" /> : index + 1}
          </div>

          {/* Stars */}
          {isCompleted && lesson.stars > 0 && (
            <div className="flex gap-0.5">
              {[1, 2, 3].map(s => (
                <Star key={s} className={cn('w-3.5 h-3.5', s <= lesson.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700')} />
              ))}
            </div>
          )}

          {isCurrent && (
            <span className="text-[10px] uppercase tracking-widest font-bold text-accent-300 bg-accent-300/10 px-2 py-0.5 rounded-full">
              Next
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className={cn(
          'text-[15px] font-semibold mb-1 transition-colors',
          isCompleted ? 'text-gray-200' : isCurrent ? 'text-white group-hover:text-accent-300' : 'text-gray-500'
        )}>
          {lesson.title}
        </h4>

        {/* Description */}
        {lesson.description && (
          <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{lesson.description}</p>
        )}

        {/* Bottom Meta */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-[11px] text-gray-600">
            {lesson.targetKeys && (
              <span className="font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">{lesson.targetKeys}</span>
            )}
            {lesson.estimatedTime && (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.ceil(lesson.estimatedTime / 60)}m</span>
            )}
            {lesson.xpReward > 0 && (
              <span className="flex items-center gap-1 text-accent-300/60"><Zap className="w-3 h-3" />{lesson.xpReward} XP</span>
            )}
          </div>

          {/* Stats for completed */}
          {isCompleted && lesson.wpm && (
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-emerald-400">{Math.round(lesson.wpm)} WPM</span>
              {lesson.accuracy && <span className="text-gray-500">{Math.round(lesson.accuracy)}%</span>}
            </div>
          )}

          {/* Arrow for current */}
          {isCurrent && (
            <div className="w-7 h-7 rounded-full bg-accent-300/10 flex items-center justify-center text-accent-300 group-hover:bg-accent-300 group-hover:text-black transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ── Path Section ──
function PathSectionComponent({ path, pathIndex }: { path: PathSection; pathIndex: number }) {
  const [isExpanded, setIsExpanded] = useState(pathIndex < 2); // First 2 expanded by default
  const meta = DIFFICULTY_META[path.difficulty] || DIFFICULTY_META.EASY;
  const percent = path.totalCount > 0 ? Math.round((path.completedCount / path.totalCount) * 100) : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: pathIndex * 0.1 }}
      className="relative"
    >
      {/* Connector Line */}
      {pathIndex > 0 && (
        <div className="absolute -top-8 left-8 w-px h-8 bg-gradient-to-b from-transparent via-accent-300/20 to-accent-300/10" />
      )}

      {/* Section Header — Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full text-left relative rounded-2xl border p-6 transition-all duration-300 overflow-hidden group',
          'bg-[#090C0B]/80 backdrop-blur-md',
          isExpanded ? 'border-white/[0.08]' : 'border-white/[0.04] hover:border-white/[0.08]',
        )}
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at 0% 50%, ${meta.glow}, transparent 60%)` }} />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* Progress Ring */}
            <div className="relative">
              <ProgressRing percent={percent} size={56} />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {percent}%
              </span>
            </div>

            <div>
              {/* Difficulty Badge */}
              <div className={cn('inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold mb-1.5 px-2 py-0.5 rounded-full', meta.bg, meta.color)}>
                {meta.icon}
                {meta.label}
              </div>

              <h3 className="text-xl font-bold text-white">{path.title}</h3>
              {path.description && <p className="text-sm text-gray-500 mt-0.5 max-w-xl">{path.description}</p>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="hidden sm:flex items-center gap-3 text-sm text-gray-500">
              <span>{path.completedCount}/{path.totalCount} lessons</span>
            </div>

            {/* Expand Arrow */}
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-gray-400 group-hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </button>

      {/* Lessons Grid — Animated */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-4 pb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {path.lessons.map((lesson, idx) => (
                <LessonCard key={lesson.id} lesson={lesson} index={idx} pathSlug={path.slug} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

// ══════════════════════════════════════
// ── MAIN ROADMAP CLIENT ──
// ══════════════════════════════════════
export default function RoadmapClient({ paths, totalXP, totalCompleted, totalLessons, currentStreak, longestStreak }: RoadmapClientProps) {
  const overallPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <div className="relative min-h-screen">
      <FloatingOrbs />

      {/* ── Hero Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative mb-12"
      >
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-accent-400/10 border border-accent-400/20 text-accent-300 text-xs font-bold tracking-widest uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
          Learning Roadmap
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
          Your Typing{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 via-emerald-400 to-cyan-400">
            Journey
          </span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
          Master touch typing from ground zero to 200+ WPM. Follow the structured path, earn XP, unlock advanced
          techniques, and track your progress every step of the way.
        </p>
      </motion.div>

      {/* ── Stats Dashboard ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-14"
      >
        {/* Overall Progress — Large Card */}
        <div className="col-span-2 lg:col-span-1 relative rounded-2xl border border-accent-300/20 bg-accent-300/[0.03] backdrop-blur-sm p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-300/[0.06] to-transparent" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative mb-3">
              <ProgressRing percent={overallPercent} size={80} stroke={5} />
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">{overallPercent}%</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-accent-300/80 font-semibold">Overall Progress</p>
            <p className="text-sm text-gray-500 mt-0.5">{totalCompleted}/{totalLessons} lessons</p>
          </div>
        </div>

        <StatCard icon={<Zap className="w-4 h-4" />} label="Total XP" value={totalXP.toLocaleString()} sub="Experience earned" />
        <StatCard icon={<Trophy className="w-4 h-4" />} label="Completed" value={totalCompleted} sub={`of ${totalLessons} lessons`} />
        <StatCard icon={<Flame className="w-4 h-4" />} label="Streak" value={`${currentStreak}d`} sub={`Best: ${longestStreak}d`} />
        <StatCard icon={<Target className="w-4 h-4" />} label="Accuracy Goal" value="95%+" sub="Maintain focus" />
      </motion.div>

      {/* ── Path Sections ── */}
      <div className="space-y-6">
        {paths.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Sparkles className="w-12 h-12 text-accent-300/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Coming Soon</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              The structured learning roadmap is being crafted by our team. 
              In the meantime, explore the Practice Arena to sharpen your skills.
            </p>
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-accent-300 text-black font-bold text-sm hover:bg-accent-200 transition-colors"
            >
              Go to Practice <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          paths.map((path, idx) => (
            <PathSectionComponent key={path.id} path={path} pathIndex={idx} />
          ))
        )}
      </div>

      {/* ── Bottom CTA ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 text-center"
      >
        <div className="h-px w-full max-w-lg mx-auto bg-gradient-to-r from-transparent via-accent-300/20 to-transparent mb-10" />
        <p className="text-gray-500 text-sm mb-4">
          Can&apos;t wait for the next lesson? Practice with 25+ free-style modules.
        </p>
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-accent-300/30 text-accent-300 font-semibold text-sm hover:bg-accent-300/10 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Open Practice Arena
        </Link>
      </motion.div>
    </div>
  );
}
