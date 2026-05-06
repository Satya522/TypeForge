"use client";

import React, { memo, useMemo, useState, useRef, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { AreaChart, ProgressBar } from "@tremor/react";
import { ActivityCalendar } from "react-activity-calendar";
import {
  ArrowUpRight, Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Flame, Zap, Target, Activity, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter, GlowCard } from "./analytics-cards";

type HeatmapDay = {
  date: string;
  count: number;
};

type MomentumPoint = {
  date: string;
  output: number;
};

type MilestoneItem = {
  id: string;
  label: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  icon: "Flame" | "Zap" | "Target" | "Calendar";
  colorClass: "emerald" | "violet" | "amber";
};

type TrainingCommandData = {
  rangeLabel: string;
  routineScore: number;
  activeDays: number;
  targetActiveDays: number;
  sessionsPerActiveDay: number;
  consistencyPercent: number;
  goalConsistencyPercent: number;
  bestOutput: number;
  bestOutputDate?: string;
  heatmapData: HeatmapDay[];
  momentumSeries: MomentumPoint[];
  velocityData: Array<{ date: string; sessions: number }>;
  milestones: MilestoneItem[];
  activeMilestoneId: string;
};

interface TrainingCommandSectionProps {
  data?: TrainingCommandData;
  isLoading?: boolean;
  onGetPracticePlan?: () => void;
  onStartRoutine?: () => void;
  onRepeatPeak?: () => void;
  onTwoBlockPlan?: () => void;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const noMotion = { hidden: {}, show: {} };

const HEATMAP_WINDOW = 91; 
const VELOCITY_DAYS = 14;
const BAR_MAX_H = 40;
const BAR_MIN_H = 4;
const BAR_W = 10;
const MILESTONE_ICONS = { Flame, Zap, Target, Calendar: CalendarIcon } as const;
const MILESTONE_COLORS: Record<string, string> = {
  emerald: "emerald", violet: "violet", amber: "amber",
};

function formatShortDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function toActivityData(days: HeatmapDay[]) {
  return days.map((d) => ({
    date: d.date,
    count: d.count,
    level: Math.min(4, d.count) as 0 | 1 | 2 | 3 | 4,
  }));
}

function isEmptyData(data?: TrainingCommandData): boolean {
  if (!data) return true;
  return data.routineScore === 0 && data.activeDays === 0 && data.bestOutput === 0;
}

function getCompactHeatmapRange(monthOffset = 0) {
  const today = new Date();
  const year = today.getFullYear();
  const targetMonth = today.getMonth() + monthOffset;

  const endYear = year + Math.floor(targetMonth / 12);
  const endMonth = ((targetMonth % 12) + 12) % 12;

  let startMonth = endMonth - 2;
  let startYear = endYear;
  if (startMonth < 0) {
    startMonth += 12;
    startYear -= 1;
  }

  const from = new Date(startYear, startMonth, 1);
  
  const end = new Date(endYear, endMonth + 1, 0);

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return { from: fmt(from), to: fmt(end) };
}

function padHeatmapToWindow(days: HeatmapDay[], monthOffset: number): HeatmapDay[] {
  const { from, to } = getCompactHeatmapRange(monthOffset);
  const map = new Map(days.map((d) => [d.date, d.count]));
  const result: HeatmapDay[] = [];
  
  const [fY, fM, fD] = from.split('-').map(Number);
  const [tY, tM, tD] = to.split('-').map(Number);
  
  const cursor = new Date(fY, fM - 1, fD);
  const endObj = new Date(tY, tM - 1, tD);
  
  while (cursor <= endObj) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;
    
    result.push({ date: key, count: map.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

const DIAL_SIZE = 200;
const DIAL_R = 76;
const DIAL_C = 2 * Math.PI * DIAL_R;
const DIAL_STROKE = 12;

const PremiumScoreDial = memo(function PremiumScoreDial({
  score,
  reduced,
}: {
  score: number;
  reduced: boolean;
}) {
  const offset = DIAL_C * (1 - score / 100);
  const angle = (score / 100) * 360;

  const colorStart = "#3b82f6"; 
  const colorMid = "#8b5cf6"; 
  const colorEnd = "#d946ef"; 

  return (
    <div className="relative flex shrink-0 items-center justify-center">
      {}
      <motion.div
        className="absolute inset-0 rounded-full bg-violet-600/20 blur-[32px]"
        animate={reduced ? {} : {
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {}
      <div className="absolute h-[140px] w-[140px] rounded-full border border-white/5 bg-white/[0.01] shadow-[inset_0_4px_20px_rgba(255,255,255,0.02)] backdrop-blur-md" />

      {}
      <svg
        width={DIAL_SIZE}
        height={DIAL_SIZE}
        viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`}
        className="relative z-10 drop-shadow-2xl"
        role="img"
        aria-label={`Routine score: ${score} out of 100`}
      >
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorStart} />
            <stop offset="50%" stopColor={colorMid} />
            <stop offset="100%" stopColor={colorEnd} />
          </linearGradient>
          
          <filter id="glowArc" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {}
        <motion.circle
          cx={DIAL_SIZE / 2}
          cy={DIAL_SIZE / 2}
          r={DIAL_R + 14}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          strokeDasharray="2 8"
          animate={reduced ? {} : { rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ originX: "50%", originY: "50%" }}
        />

        {}
        <motion.circle
          cx={DIAL_SIZE / 2}
          cy={DIAL_SIZE / 2}
          r={DIAL_R + 6}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="2"
          strokeDasharray="1 12"
          opacity="0.3"
          animate={reduced ? {} : { rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ originX: "50%", originY: "50%" }}
        />

        {}
        <circle
          cx={DIAL_SIZE / 2}
          cy={DIAL_SIZE / 2}
          r={DIAL_R}
          fill="none"
          strokeWidth="12"
          className="stroke-black/60"
        />
        <circle
          cx={DIAL_SIZE / 2}
          cy={DIAL_SIZE / 2}
          r={DIAL_R}
          fill="none"
          strokeWidth="10"
          className="stroke-white/[0.04]"
        />
        
        {}
        <motion.circle
          cx={DIAL_SIZE / 2}
          cy={DIAL_SIZE / 2}
          r={DIAL_R}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={DIAL_C}
          filter="url(#glowArc)"
          style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
          {...(reduced
            ? { strokeDashoffset: offset }
            : {
                initial: { strokeDashoffset: DIAL_C },
                animate: { strokeDashoffset: offset },
                transition: { type: "spring", stiffness: 40, damping: 12, delay: 0.1 },
              })}
        />

        {}
        {score > 0 && (
          <motion.g
            style={{ transformOrigin: "center" }}
            {...(reduced 
              ? { rotate: angle - 90 }
              : {
                initial: { rotate: -90 },
                animate: { rotate: angle - 90 },
                transition: { type: "spring", stiffness: 40, damping: 12, delay: 0.1 }
              }
            )}
          >
            <circle cx={DIAL_SIZE/2 + DIAL_R} cy={DIAL_SIZE/2} r="5" fill="#ffffff" filter="url(#glowArc)" />
            <circle cx={DIAL_SIZE/2 + DIAL_R} cy={DIAL_SIZE/2} r="2.5" fill="#ffffff" />
          </motion.g>
        )}
      </svg>

      {}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
        <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-[56px] font-black tracking-tighter text-transparent drop-shadow-md">
          {score || 0}
        </span>
        <span className="mt-1 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
          Score
        </span>
      </div>
    </div>
  );
});

const SessionDotColumns = memo(function SessionDotColumns({
  heatmap,
}: {
  heatmap: HeatmapDay[];
}) {
  const activeDays = heatmap.filter((d) => d.count > 0).slice(-7);
  const cols = activeDays.length > 0 ? activeDays : Array.from({ length: 7 }, () => ({ count: 0 }));

  return (
    <ol className="flex items-end gap-2" aria-hidden="true">
      {cols.map((day, i) => (
        <li key={i} className="flex flex-col gap-1">
          {[2, 1, 0].map((row) => (
            <span
              key={row}
              className={cn(
                "h-5 w-5 rounded-full transition-colors",
                day.count > row ? "bg-violet-500" : "bg-white/10",
              )}
            />
          ))}
        </li>
      ))}
    </ol>
  );
});

function PanelSkeleton() {
  return (
    <span className="block h-72 animate-pulse rounded-3xl bg-white/[0.03]" aria-busy="true" />
  );
}

function CardSkeleton() {
  return (
    <span className="block h-64 animate-pulse rounded-3xl bg-white/[0.03]" aria-busy="true" />
  );
}

function EmptyState() {
  return (
    <GlowCard className="p-10 lg:p-14" hoverGlow={false} accentColor="#10b981">
      <figure className="flex flex-col items-center text-center">
        <CalendarIcon className="h-10 w-10 text-white/20" strokeWidth={1.5} />
        <p className="mt-4 text-lg font-bold text-white/50">No sessions yet</p>
        <p className="mt-2 max-w-sm text-sm text-white/40 leading-relaxed">
          Complete your first typing session to unlock your consistency map.
        </p>
        <a
          href="/practice"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-bold text-emerald-400 transition hover:border-emerald-500/60 hover:bg-emerald-500/20"
        >
          Start first session
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </figure>
    </GlowCard>
  );
}

function TrainingHeader({
  onGetPracticePlan,
}: {
  onGetPracticePlan?: () => void;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <hgroup>
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Training Command
        </p>
        <h2
          id="training-command-title"
          className="mt-2 bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent lg:text-3xl"
        >
          Practice consistency map
        </h2>
        <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-white/70">
          See how often you show up — and how that shapes your typing gains.
        </p>
      </hgroup>

      <nav className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onGetPracticePlan}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-400 transition-all duration-200 hover:border-emerald-500/60 hover:bg-emerald-500/20"
          aria-label="Get a practice plan"
        >
          Get practice plan
          <ArrowUpRight className="h-4 w-4" />
        </button>
        <a
          href="/analytics?tab=habits"
          className="text-sm font-medium text-white/40 transition hover:text-white/70"
        >
          View habits →
        </a>
      </nav>
    </header>
  );
}

const DAY_LABELS = ["S","M","T","W","T","F","S"];

const VelocityBars = memo(function VelocityBars({
  velocityData,
  reduced,
}: {
  velocityData: Array<{ date: string; sessions: number }>;
  reduced: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeLast14 = velocityData.filter((d) => d.sessions > 0).length;
  const maxSessions = Math.max(1, ...velocityData.map((d) => d.sessions));
  const totalSessions = velocityData.reduce((a, d) => a + d.sessions, 0);
  const avgSessions = activeLast14 > 0 ? (totalSessions / activeLast14).toFixed(1) : "0";

  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#0c0c0c] to-[#060606]">
      {}
      <header className="flex items-center justify-between px-5 pt-5 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 ring-1 ring-emerald-500/20">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-white/60">Velocity</p>
            <p className="text-[9px] font-medium text-white/20">Practice intensity</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="bg-gradient-to-r from-emerald-400 to-[#10ff98] bg-clip-text text-lg font-black tabular-nums leading-none text-transparent">
            {totalSessions}
          </span>
          <span className="text-[9px] font-medium text-white/20">total sessions</span>
        </div>
      </header>

      {}
      <div className="relative mt-5 px-5">
        {}
        <div className="pointer-events-none absolute inset-x-5 top-0 flex h-16 flex-col justify-between">
          <div className="h-px w-full bg-white/[0.03]" />
          <div className="h-px w-full bg-white/[0.03]" />
          <div className="h-px w-full bg-white/[0.03]" />
          <div className="h-px w-full bg-white/[0.03]" />
        </div>

        <div className="relative flex h-16 w-full items-end gap-[4px]">
          {velocityData.map((day, i) => {
            const isToday = i === velocityData.length - 1;
            const pct = day.sessions > 0 ? Math.max(0.18, day.sessions / maxSessions) : 0;
            const isHovered = hovered === i;
            const dateObj = new Date(day.date + "T00:00:00");
            const dayLabel = DAY_LABELS[dateObj.getDay()];
            const dateNum = dateObj.getDate();

            return (
              <div
                key={day.date}
                className="relative flex h-full flex-1 flex-col items-center justify-end cursor-crosshair"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {}
                {isHovered && (
                  <div className="absolute -top-9 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#1a1a1a] px-2.5 py-1.5 shadow-2xl">
                    <div className="text-[10px] font-bold text-white">{day.sessions} session{day.sessions !== 1 ? "s" : ""}</div>
                    <div className="text-[9px] text-white/40">{dayLabel} · {dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                    <div className="absolute -bottom-[5px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-[#1a1a1a]" />
                  </div>
                )}

                {}
                {isHovered && day.sessions > 0 && (
                  <div className="absolute bottom-0 left-1/2 h-full w-full -translate-x-1/2 rounded-t bg-[#10ff98]/5" />
                )}

                {}
                {day.sessions > 0 ? (
                  <motion.div
                    className={cn(
                      "relative w-full rounded-[3px] transition-all duration-200",
                      isHovered
                        ? "bg-[#10ff98] shadow-[0_0_16px_rgba(16,255,152,0.5),0_0_4px_rgba(16,255,152,0.8)]"
                        : "bg-gradient-to-t from-emerald-800 via-emerald-500 to-emerald-300"
                    )}
                    {...(reduced
                      ? { style: { height: `${pct * 100}%`, originY: 1 } }
                      : {
                          style: { originY: 1 },
                          initial: { height: "0%" },
                          animate: { height: `${pct * 100}%` },
                          transition: { delay: i * 0.035, type: "spring", stiffness: 100, damping: 12 },
                        })}
                  >
                    {}
                    <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-[3px] bg-white/40" />
                  </motion.div>
                ) : (
                  <div
                    className={cn(
                      "h-[3px] w-full rounded-sm transition-all duration-200",
                      isHovered ? "bg-white/15 shadow-[0_0_6px_rgba(255,255,255,0.05)]" : "bg-white/[0.04]"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {}
        <div className="mt-1.5 flex w-full gap-[4px]">
          {velocityData.map((day, i) => {
            const isToday = i === velocityData.length - 1;
            const dateObj = new Date(day.date + "T00:00:00");
            const dayLabel = DAY_LABELS[dateObj.getDay()];
            return (
              <div key={i} className="flex flex-1 justify-center">
                <span className={cn(
                  "text-[8px] font-bold",
                  isToday ? "text-[#10ff98]" : "text-white/15"
                )}>{dayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      {}
      <div className="mx-5 mt-4 flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2.5">
        <div className="flex flex-1 items-center gap-2">
          <TrendingUp className="h-3 w-3 text-emerald-500/60" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black tabular-nums text-white/60">{avgSessions}</span>
            <span className="text-[8px] text-white/20">AVG / DAY</span>
          </div>
        </div>
        <div className="h-5 w-px bg-white/[0.06]" />
        <div className="flex flex-1 items-center gap-2">
          <Zap className="h-3 w-3 text-amber-500/60" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black tabular-nums text-white/60">{maxSessions}</span>
            <span className="text-[8px] text-white/20">PEAK</span>
          </div>
        </div>
        <div className="h-5 w-px bg-white/[0.06]" />
        <div className="flex flex-1 items-center gap-2">
          <Flame className="h-3 w-3 text-orange-500/60" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black tabular-nums text-white/60">{activeLast14}/14</span>
            <span className="text-[8px] text-white/20">HIT RATE</span>
          </div>
        </div>
      </div>

      {}
      <footer className="mt-3 flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          {activeLast14 > 0 ? (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10ff98] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#10ff98]" />
            </span>
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
          )}
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            activeLast14 > 0 ? "text-[#10ff98]/60" : "text-white/30"
          )}>
            {activeLast14 > 0 ? "active" : "inactive"}
          </span>
        </div>
        <span className="text-[9px] font-medium uppercase tracking-widest text-white/15">14-day window</span>
      </footer>
    </section>
  );
});

const MILESTONE_GRADIENT: Record<string, { from: string; to: string; text: string; ring: string }> = {
  emerald: { from: "from-emerald-500", to: "to-cyan-400", text: "text-emerald-400", ring: "ring-emerald-500/30" },
  violet:  { from: "from-violet-500",  to: "to-purple-400", text: "text-violet-400", ring: "ring-violet-500/30" },
  amber:   { from: "from-amber-500",   to: "to-orange-400", text: "text-amber-400", ring: "ring-amber-500/30" },
};

const NextMilestoneCard = memo(function NextMilestoneCard({
  milestones,
  initialId,
}: {
  milestones: MilestoneItem[];
  initialId: string;
}) {
  const startIdx = Math.max(0, milestones.findIndex((m) => m.id === initialId));
  const [idx, setIdx] = useState(startIdx);
  const [dir, setDir] = useState(0);
  if (milestones.length === 0) return null;
  const ms = milestones[idx];
  const Icon = MILESTONE_ICONS[ms.icon] ?? Target;
  const done = ms.current >= ms.target;
  const pct = Math.min(100, Math.round((ms.current / ms.target) * 100));
  const grad = MILESTONE_GRADIENT[ms.colorClass] ?? MILESTONE_GRADIENT.emerald;
  const remaining = ms.target - ms.current;

  const go = (d: number) => {
    setDir(d);
    setIdx((prev) => (prev + d + milestones.length) % milestones.length);
  };

  return (
    <section className="flex items-center gap-3">
      {}
      <button
        type="button"
        onClick={() => go(-1)}
        className="shrink-0 rounded-full p-1.5 text-white/40 ring-1 ring-white/10 transition-all hover:bg-white/[0.06] hover:text-white hover:ring-white/20 active:scale-90"
        aria-label="Previous milestone"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={ms.id}
          initial={{ x: dir * 16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: dir * -16, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          {}
          <Icon className={cn("h-5 w-5 shrink-0", grad.text)} strokeWidth={2.5} />

          {}
          <p className="shrink-0 text-sm font-bold text-white">{ms.label}</p>

          {}
          <p className="hidden truncate text-xs text-white/40 md:block">{ms.description}</p>

          {}
          <span className="ml-auto flex shrink-0 items-center gap-3">
            {}
            <span className="relative h-2 w-28 overflow-hidden rounded-full bg-white/[0.08]">
              <motion.span
                className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r", grad.from, grad.to)}
                initial={{ width: "0%" }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.1 }}
              />
            </span>

            {}
            <span className={cn("text-xs font-black tabular-nums", grad.text)}>
              {ms.current}<span className="text-white/35">/{ms.target}</span>
            </span>
            <span className="text-[11px] font-medium text-white/35">{ms.unit}</span>
          </span>

          {}
          {done ? (
            <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 ring-1 ring-emerald-500/25">
              ✓ Unlocked
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-bold text-white/50 ring-1 ring-white/[0.08]">
              {remaining} more
            </span>
          )}
        </motion.article>
      </AnimatePresence>

      {}
      <button
        type="button"
        onClick={() => go(1)}
        className="shrink-0 rounded-full p-1.5 text-white/40 ring-1 ring-white/10 transition-all hover:bg-white/[0.06] hover:text-white hover:ring-white/20 active:scale-90"
        aria-label="Next milestone"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </section>
  );
});

const THEME_LEVELS = [
  "bg-[#050505] border border-white/[0.06] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]", 
  "bg-emerald-900/60 border border-emerald-700/50", 
  "bg-emerald-600/80 border border-emerald-400/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]", 
  "bg-emerald-400 border border-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.5)]", 
  "bg-[#10ff98] border border-white shadow-[0_0_16px_rgba(16,255,152,0.8)]", 
];

type HeatmapDataProps = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}[];

function PremiumHeatmap({ data }: { data: HeatmapDataProps }) {
  
  const monthsData: { monthIndex: number; days: HeatmapDataProps }[] = [];
  
  data.forEach((day) => {
    const date = new Date(day.date + "T00:00:00");
    const mIdx = date.getMonth();
    
    let lastMonth = monthsData[monthsData.length - 1];
    if (!lastMonth || lastMonth.monthIndex !== mIdx) {
      monthsData.push({ monthIndex: mIdx, days: [] });
      lastMonth = monthsData[monthsData.length - 1];
    }
    lastMonth.days.push(day);
  });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="flex gap-4">
      {monthsData.map((m, mIdx) => {
        
        const firstDayDate = new Date(m.days[0].date + "T00:00:00");
        const startWeekday = firstDayDate.getDay(); 

        const paddedDays: (HeatmapDataProps[0] | null)[] = Array(startWeekday).fill(null);
        paddedDays.push(...m.days);

        const weeks: (typeof paddedDays)[] = [];
        for (let i = 0; i < paddedDays.length; i += 7) {
          weeks.push(paddedDays.slice(i, i + 7));
        }

        return (
          <div key={mIdx} className="flex flex-col gap-2.5">
            {}
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
              {monthNames[m.monthIndex]}
            </div>
            
            {}
            <div className="flex flex-col gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex gap-1">
                  {week.map((d, rIdx) => {
                    if (!d) {
                      return <div key={`empty-${rIdx}`} className="h-3 w-3 shrink-0" />;
                    }
                    return (
                      <div
                        key={rIdx}
                        title={`${d.count} sessions on ${formatShortDate(d.date)}`}
                        className={cn(
                          "h-3 w-3 shrink-0 rounded-[3px] transition-all duration-300 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1 hover:ring-offset-black cursor-crosshair",
                          THEME_LEVELS[d.level]
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RoutineSummaryPanel({
  data,
  reduced,
}: {
  data: TrainingCommandData;
  reduced: boolean;
}) {
  const [monthOffset, setMonthOffset] = useState(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (scrollTimeout.current) return;

    const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const delta = isHorizontal ? e.deltaX : e.deltaY;

    if (Math.abs(delta) < 10) return;

    if (delta > 0) {
      setMonthOffset((p) => Math.min(0, p + 1));
    } else {
      setMonthOffset((p) => p - 1);
    }

    scrollTimeout.current = setTimeout(() => {
      scrollTimeout.current = null;
    }, 400); 
  }, []);

  const { startYear, endYear } = useMemo(() => {
    const today = new Date();
    const targetMonth = today.getMonth() + monthOffset;
    const endY = today.getFullYear() + Math.floor(targetMonth / 12);
    const endM = ((targetMonth % 12) + 12) % 12;
    
    let startM = endM - 2;
    let startY = endY;
    if (startM < 0) {
      startY -= 1;
    }
    return { startYear: startY, endYear: endY };
  }, [monthOffset]);

  const yearLabel = startYear === endYear ? `${startYear}` : `${startYear} - ${endYear}`;

  const compactHeatmap = useMemo(() => {
    const padded = padHeatmapToWindow(data.heatmapData, monthOffset);
    return toActivityData(padded);
  }, [data.heatmapData, monthOffset]);

  return (
    <motion.article
      {...(reduced ? {} : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      })}
    >
      <GlowCard className="p-6 lg:p-8" accentColor="#10b981">
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.6fr] lg:gap-10">
          {}
          <figure className="relative flex flex-col items-center justify-center gap-10 sm:flex-row sm:items-center sm:justify-start">
            
            <PremiumScoreDial score={data.routineScore} reduced={reduced} />
            
            <figcaption className="relative z-10 flex min-w-0 flex-col items-center sm:items-start">
              {}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/5 bg-white/[0.02] px-3.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
                </span>
                <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-[9px] font-black uppercase tracking-[0.25em] text-transparent">
                  Routine Status
                </span>
              </div>
              
              <div className="mt-6 flex items-baseline gap-3">
                <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-6xl font-black tracking-tighter text-transparent drop-shadow-xl">
                  <AnimatedCounter value={data.activeDays} />
                </span>
                <span className="text-base font-black tracking-widest text-white/40 uppercase">Active Days</span>
              </div>
              
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent px-3 py-1.5 text-sm font-black text-white shadow-2xl backdrop-blur-md">
                  {data.sessionsPerActiveDay.toFixed(1)}x
                </div>
                <span className="text-xs font-bold tracking-widest text-white/30 uppercase">Avg Sessions/Day</span>
              </div>

              <p className="mt-6 border-l-2 border-violet-500/30 pl-4 text-sm font-medium leading-relaxed text-white/35 sm:max-w-[260px]">
                Maintain consistency. Your score grows as your sessions multiply and align.
              </p>
            </figcaption>
          </figure>

          {}
          <aside className="flex flex-col gap-6">
            {}
            <section className="relative">
              <header className="mb-2.5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">Consistency Core</span>
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-lg font-black tracking-tighter text-transparent">
                  {data.consistencyPercent}%
                </span>
              </header>
              
              {}
              <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-white/[0.03] bg-[#0a0a0a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                {}
                <motion.div
                  className="absolute bottom-0 left-0 top-0 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                  {...(reduced
                    ? { style: { width: `${data.consistencyPercent}%` } }
                    : {
                        initial: { width: "0%" },
                        animate: { width: `${data.consistencyPercent}%` },
                        transition: { duration: 1.5, type: "spring", bounce: 0.2 },
                      })}
                >
                  {}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                  {}
                  <div className="absolute bottom-0 right-0 top-0 w-6 bg-gradient-to-l from-white/80 to-transparent blur-[2px]" />
                </motion.div>
              </div>

              <footer className="mt-2.5 flex items-center justify-between text-[11px] font-bold tracking-wider text-white/30">
                <span className="uppercase">Target Node {data.goalConsistencyPercent}%</span>
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent uppercase tracking-wider">
                  Peak {formatShortDate(data.bestOutputDate)}
                </span>
              </footer>
            </section>

            {}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[55fr_45fr]">
              {}
              <figure 
                role="img" 
                aria-label="Consistency heatmap for last 3 months" 
                className="hidden flex-col sm:flex"
                onWheel={handleWheel}
              >
                <header className="mb-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">{yearLabel}</span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setMonthOffset(p => p - 1)}
                      className="rounded p-1 text-white/30 transition hover:bg-white/5 hover:text-white"
                      aria-label="Previous months"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => setMonthOffset(p => p + 1)}
                      disabled={monthOffset >= 0}
                      className={cn("rounded p-1 transition", monthOffset >= 0 ? "opacity-30 cursor-not-allowed text-white/20" : "text-white/30 hover:bg-white/5 hover:text-white")}
                      aria-label="Next months"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </header>
                
                <div className="overflow-x-auto pb-1">
                  <PremiumHeatmap data={compactHeatmap} />
                </div>
                
                {}
                <footer className="mt-3 flex items-center text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  <span>{data.heatmapData.reduce((acc, d) => acc + d.count, 0)} Total Activities in {new Date().getFullYear()}</span>
                </footer>
              </figure>
              {}
              <VelocityBars velocityData={data.velocityData} reduced={reduced} />
            </section>

            {}
            <span className="h-px w-full bg-white/[0.06]" aria-hidden="true" />

            {}
            <NextMilestoneCard milestones={data.milestones} initialId={data.activeMilestoneId} />
          </aside>
        </section>
      </GlowCard>
    </motion.article>
  );
}

function InsightCard({
  eyebrow,
  badge,
  badgeClass,
  metric,
  body,
  children,
  footer,
  accentColor,
}: {
  eyebrow: string;
  badge: string;
  badgeClass: string;
  metric: React.ReactNode;
  body?: string;
  children?: React.ReactNode;
  footer: React.ReactNode;
  accentColor: string;
}) {
  return (
    <GlowCard className="flex h-full flex-col p-5 lg:p-6" accentColor={accentColor}>
      <header className="flex items-start justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
          {eyebrow}
        </span>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
            badgeClass,
          )}
        >
          {badge}
        </span>
      </header>
      <p className="mt-3 text-3xl font-bold tracking-tight text-white">{metric}</p>
      {body && <p className="mt-2 text-sm leading-relaxed text-white/70">{body}</p>}
      {children && <figure className="mt-4" aria-hidden="true">{children}</figure>}
      <footer className="mt-auto pt-4">{footer}</footer>
    </GlowCard>
  );
}

function ConsistencyInsightCard({
  data,
  reduced,
  onStartRoutine,
}: {
  data: TrainingCommandData;
  reduced: boolean;
  onStartRoutine?: () => void;
}) {
  const calendarData = useMemo(() => toActivityData(data.heatmapData), [data.heatmapData]);

  return (
    <motion.article variants={reduced ? noMotion.show : item}>
      <InsightCard
        eyebrow="Consistency"
        badge="Big Win"
        badgeClass="border-emerald-500/25 bg-emerald-500/15 text-emerald-400"
        metric={
          <>
            <AnimatedCounter value={data.activeDays} />/{data.targetActiveDays} active days
          </>
        }
        accentColor="#10b981"
        footer={
          <button
            type="button"
            onClick={onStartRoutine}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-400 transition-all duration-200 hover:border-emerald-500/50 hover:bg-emerald-500/20 sm:w-auto"
          >
            Start routine <ArrowUpRight className="h-4 w-4" />
          </button>
        }
      >
        <div className="w-full flex flex-1 mt-6 mb-2">
          <ActivityCalendar
            data={calendarData}
            blockSize={11}
            blockMargin={4}
            colorScheme="dark"
            theme={{ dark: ["#1a2a1a", "#166534", "#16a34a", "#22c55e", "#4ade80"] }}
          />
        </div>
        <p className="mt-auto text-center text-[11px] font-bold text-white/30 uppercase tracking-widest">Recommended: 4–5 days/week</p>
      </InsightCard>
    </motion.article>
  );
}

function SessionLoadInsightCard({
  data,
  reduced,
  onTwoBlockPlan,
  peakDay,
  avgSessionLength,
  bestTimeBlock,
  totalSessionsMonth,
}: {
  data: TrainingCommandData;
  reduced: boolean;
  onTwoBlockPlan?: () => void;
  peakDay?: string;
  avgSessionLength?: number;
  bestTimeBlock?: string;
  totalSessionsMonth?: number;
}) {
  
  const computedStats = useMemo(() => {
    const hm = data.heatmapData;
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    hm.forEach((d) => {
      const dayIdx = new Date(d.date + "T00:00:00").getDay();
      dayCounts[dayIdx] += d.count;
    });
    const peakIdx = dayCounts.indexOf(Math.max(...dayCounts));
    const computedPeakDay = dayCounts[peakIdx] > 0 ? dayNames[peakIdx] : undefined;

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const monthSessions = hm
      .filter((d) => {
        const dt = new Date(d.date + "T00:00:00");
        return dt.getMonth() === thisMonth && dt.getFullYear() === thisYear;
      })
      .reduce((sum, d) => sum + d.count, 0);

    return {
      peakDay: computedPeakDay,
      monthSessions,
    };
  }, [data.heatmapData]);

  const statItems = [
    { label: "Peak day", value: peakDay ?? computedStats.peakDay ?? "—" },
    { label: "Avg length", value: avgSessionLength != null ? `${avgSessionLength} min` : "—" },
    { label: "Best block", value: bestTimeBlock ?? "—" },
    { label: "This month", value: `${totalSessionsMonth ?? computedStats.monthSessions} sessions` },
  ];

  return (
    <motion.article variants={reduced ? noMotion.show : item}>
      <InsightCard
        eyebrow="Session Load"
        badge="Routine"
        badgeClass="border-violet-500/25 bg-violet-500/15 text-violet-400"
        metric={<>{data.sessionsPerActiveDay.toFixed(1)} sessions / active day</>}
        accentColor="#7c3aed"
        footer={
          <button
            type="button"
            onClick={onTwoBlockPlan}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-2.5 text-sm font-bold text-violet-400 transition-all duration-200 hover:border-violet-500/50 hover:bg-violet-500/20 sm:w-auto"
          >
            Two-block plan <ArrowUpRight className="h-4 w-4" />
          </button>
        }
      >
        <SessionDotColumns heatmap={data.heatmapData} />

        {}
        <div className="my-3 h-px w-full bg-white/[0.06]" />

        {}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {statItems.map((s) => (
            <div key={s.label}>
              <span className="text-[10px] uppercase tracking-widest text-white/30">{s.label}</span>
              <p className="text-sm font-semibold text-white/80">{s.value}</p>
            </div>
          ))}
        </div>
      </InsightCard>
    </motion.article>
  );
}

function MomentumInsightCard({
  data,
  reduced,
  onRepeatPeak,
  weekOverWeekChange,
  bestTimeWindow,
  outputTrend,
  totalSessions,
}: {
  data: TrainingCommandData;
  reduced: boolean;
  onRepeatPeak?: () => void;
  weekOverWeekChange?: number;
  bestTimeWindow?: string;
  outputTrend?: "Growing" | "Stable" | "Declining";
  totalSessions?: number;
}) {
  const hasOutput = data.bestOutput > 0;

  const computedTrend = outputTrend ?? (data.momentumSeries.length >= 2 
    ? (data.momentumSeries[data.momentumSeries.length - 1].output > data.momentumSeries[data.momentumSeries.length - 2].output ? "Growing" : "Stable") 
    : "Stable");

  const statItems = [
    {
      label: "vs last week",
      value: weekOverWeekChange !== undefined ? `${weekOverWeekChange > 0 ? '+' : ''}${weekOverWeekChange}%` : "—",
      colorClass: weekOverWeekChange && weekOverWeekChange > 0 ? "text-emerald-400" : weekOverWeekChange && weekOverWeekChange < 0 ? "text-red-400" : "text-white/80"
    },
    {
      label: "Best window",
      value: bestTimeWindow ?? "—",
      colorClass: "text-white/80"
    },
    {
      label: "Trend",
      value: outputTrend ?? computedTrend ?? "—",
      colorClass: (outputTrend ?? computedTrend) === "Growing" ? "text-emerald-400" : (outputTrend ?? computedTrend) === "Declining" ? "text-red-400" : "text-white/60"
    },
    {
      label: "Sessions",
      value: totalSessions !== undefined ? `${totalSessions} total` : "—",
      colorClass: "text-white/80"
    }
  ];

  return (
    <motion.article variants={reduced ? noMotion.show : item}>
      <InsightCard
        eyebrow="Momentum"
        badge="Best Time"
        badgeClass="border-amber-500/25 bg-amber-500/15 text-amber-400"
        metric={hasOutput ? <><AnimatedCounter value={data.bestOutput} /> output</> : "No data yet"}
        accentColor="#f59e0b"
        footer={
          <button
            type="button"
            onClick={onRepeatPeak}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-sm font-bold text-amber-400 transition-all duration-200 hover:border-amber-500/50 hover:bg-amber-500/20 sm:w-auto"
          >
            Repeat peak <ArrowUpRight className="h-4 w-4" />
          </button>
        }
      >
        {data.momentumSeries.length > 1 && (
          <AreaChart
            data={data.momentumSeries}
            index="date"
            categories={["output"]}
            colors={["amber"]}
            showXAxis={false}
            showYAxis={false}
            showGridLines={false}
            showLegend={false}
            showTooltip
            className="mb-1 mt-2 h-20"
            curveType="monotone"
          />
        )}

        {}
        <div className="my-3 h-px w-full bg-white/[0.06]" />

        {}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {statItems.map((s) => (
            <div key={s.label}>
              <span className="text-[10px] uppercase tracking-widest text-white/30">{s.label}</span>
              <p className={cn("text-sm font-semibold", s.colorClass)}>{s.value}</p>
            </div>
          ))}
        </div>
      </InsightCard>
    </motion.article>
  );
}

function TrainingCommandSection({
  data,
  isLoading = false,
  onGetPracticePlan,
  onStartRoutine,
  onRepeatPeak,
  onTwoBlockPlan,
}: TrainingCommandSectionProps) {
  const prefersReduced = useReducedMotion();
  const reduced = !!prefersReduced;

  if (isLoading) {
    return (
      <section aria-labelledby="training-command-title" className="space-y-5">
        <TrainingHeader onGetPracticePlan={onGetPracticePlan} />
        <PanelSkeleton />
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </section>
      </section>
    );
  }

  if (isEmptyData(data)) {
    return (
      <section aria-labelledby="training-command-title" className="space-y-5">
        <TrainingHeader onGetPracticePlan={onGetPracticePlan} />
        <EmptyState />
      </section>
    );
  }

  const d = data!;

  return (
    <section aria-labelledby="training-command-title" className="space-y-5">
      <TrainingHeader onGetPracticePlan={onGetPracticePlan} />

      {}
      <RoutineSummaryPanel data={d} reduced={reduced} />

      {}
      <motion.section
        variants={reduced ? noMotion : container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5"
      >
        <ConsistencyInsightCard data={d} reduced={reduced} onStartRoutine={onStartRoutine} />
        <SessionLoadInsightCard data={d} reduced={reduced} onTwoBlockPlan={onTwoBlockPlan} />
        <MomentumInsightCard data={d} reduced={reduced} onRepeatPeak={onRepeatPeak} />
      </motion.section>
    </section>
  );
}

export default memo(TrainingCommandSection);
