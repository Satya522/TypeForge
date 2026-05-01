'use client';
import { motion } from 'framer-motion';
import { Zap, Trophy, Flame, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const ease = [0.22, 1, 0.36, 1] as const;

/* ═══ HERO SECTION ═══ */
export function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative mb-16 sm:mb-20"
    >
      {/* Spotlight glow behind title */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(79,141,253,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease }}
        className="mb-6"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase"
          style={{ letterSpacing: '0.12em', color: 'rgba(79,141,253,0.9)', background: 'rgba(79,141,253,0.06)', border: '1px solid rgba(79,141,253,0.12)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#4f8dfd] animate-pulse" />
          Learning Roadmap
        </span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease }}
        className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold tracking-[-0.02em] leading-[1.05] text-[#f8f9fa] mb-5"
      >
        Your Typing{' '}
        <span className="text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(135deg, #4f8dfd 0%, #7b61ff 50%, #a78bfa 100%)' }}>
          Journey
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease }}
        className="text-[clamp(0.95rem,2vw,1.125rem)] leading-relaxed max-w-xl"
        style={{ color: '#b0b5c1' }}
      >
        Master touch typing through a structured journey — from home row basics to 200+ WPM.
        Every lesson unlocks new skills. Track your progress, earn XP, keep climbing.
      </motion.p>
    </motion.div>
  );
}

/* ═══ METRIC NODE ═══ */
function MetricNode({ icon, label, value, unit, color, delay }: {
  icon: React.ReactNode; label: string; value: string | number; unit?: string; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease }}
      className="group relative rounded-2xl p-5 transition-all duration-300 cursor-default"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 80%, ${color}08, transparent 70%)` }} />

      {/* Hover border lift */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ border: `1px solid ${color}20` }} />

      <div className="relative z-10">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-105"
          style={{ background: `${color}10` }}>
          <div style={{ color }}>{icon}</div>
        </div>

        {/* Label */}
        <p className="text-[11px] font-semibold uppercase mb-1.5"
          style={{ letterSpacing: '0.08em', color: '#6b7280' }}>{label}</p>

        {/* Value */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-none" style={{ color: '#f8f9fa' }}>
            {value}
          </span>
          {unit && <span className="text-sm" style={{ color: '#6b7280' }}>{unit}</span>}
        </div>
      </div>

      {/* Soft surface shine */}
      <div className="absolute top-0 left-0 right-0 h-px rounded-full pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.06) 50%, transparent 90%)' }} />
    </motion.div>
  );
}

/* ═══ METRICS STRIP ═══ */
export function MetricsStrip({ totalXP, totalCompleted, totalLessons, currentStreak, longestStreak, overallPercent }: {
  totalXP: number; totalCompleted: number; totalLessons: number; currentStreak: number; longestStreak: number; overallPercent: number;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-16 sm:mb-20">
      <MetricNode icon={<TrendingUp className="w-[18px] h-[18px]" />} label="Progress" value={`${overallPercent}%`} unit={`of ${totalLessons}`} color="#4f8dfd" delay={0.3} />
      <MetricNode icon={<Zap className="w-[18px] h-[18px]" />} label="Total XP" value={totalXP.toLocaleString()} color="#fbbf24" delay={0.36} />
      <MetricNode icon={<Trophy className="w-[18px] h-[18px]" />} label="Completed" value={totalCompleted} unit="lessons" color="#34d399" delay={0.42} />
      <MetricNode icon={<Flame className="w-[18px] h-[18px]" />} label="Streak" value={`${currentStreak}d`} unit={`best ${longestStreak}d`} color="#f97316" delay={0.48} />
      <MetricNode icon={<Target className="w-[18px] h-[18px]" />} label="Accuracy Goal" value="95%" unit="target" color="#a78bfa" delay={0.54} />
    </div>
  );
}

/* ═══ PROGRESS RING (SVG) ═══ */
export function ProgressRing({ percent, size = 40, strokeWidth = 3.5, color }: {
  percent: number; size?: number; strokeWidth?: number; color: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1], delay: 0.4 }}
          style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
        {percent}%
      </span>
    </div>
  );
}

/* ═══ AMBIENT BG ═══ */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {[
        { x: '15%', y: '10%', s: 300, c: '#4f8dfd', o: 0.04 },
        { x: '75%', y: '20%', s: 250, c: '#7b61ff', o: 0.03 },
        { x: '60%', y: '70%', s: 280, c: '#34d399', o: 0.025 },
      ].map((p, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ left: p.x, top: p.y, width: p.s, height: p.s, background: p.c, opacity: p.o, filter: 'blur(100px)' }}
          animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
