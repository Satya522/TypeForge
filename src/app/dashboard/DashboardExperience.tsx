"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  Gauge,
  Keyboard,
  Play,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { PersonalBestBanner } from "@/components/dashboard/PersonalBestBanner";
import { NextMilestoneBar } from "@/components/dashboard/NextMilestoneBar";

// --- TYPES ---

type TrendPoint = {
  accuracy: number;
  date: string;
  label: string;
  minutes: number;
  output: number;
  sessions: number;
  wpm: number;
};

type QuickAction = {
  detail: string;
  href: string;
  label: string;
};

type RecentSession = {
  accuracy: number;
  duration: number;
  label: string;
  mode: string;
  wpm: number;
};

export type DashboardPayload = {
  heatmap: Record<string, number>;
  quickActions: QuickAction[];
  recentSessions: RecentSession[];
  stats: {
    achievements: number;
    activeDays30: number;
    avgAccuracy: number;
    avgWpm: number;
    bestWpm: number;
    commandScore: number;
    consistency: number;
    currentStreak: number;
    focusScore: number;
    last30AvgAccuracy: number;
    last30AvgWpm: number;
    last30Minutes: number;
    lastSessionLabel: string;
    lessonsCompleted: number;
    longestStreak: number;
    modeLabel: string;
    modeSessions: number;
    totalErrors: number;
    totalMinutes: number;
    totalSessions: number;
    trendAccuracy: number;
    trendWpm: number;
  };
  trend: TrendPoint[];
  user: {
    avatarUrl: string | null;
    displayName: string;
    email: string | null;
    isPremium: boolean;
    rankTier: string;
    rating: number;
  };
  weakKeys: Array<{ key: string; value: number }>;
};

// --- ANIMATION VARIANTS ---

const rise = {
  hidden: { opacity: 0, y: 30, scale: 0.95, filter: "blur(12px)" },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  }),
};

// --- CONSTANTS ---

const routeSteps = [
  {
    accent: "violet",
    icon: Keyboard,
    label: "Warm up",
    text: "Clean rhythm run before speed work.",
  },
  {
    accent: "cyan",
    icon: Zap,
    label: "Core drill",
    text: "Repair today’s highest friction key.",
  },
  {
    accent: "emerald",
    icon: CheckCircle2,
    label: "Finish",
    text: "Stop on one clean win, not on fatigue.",
  },
] as const;

function formatMinutes(seconds: number) {
  return `${Math.max(1, Math.round(seconds / 60))}m`;
}

// --- MAIN COMPONENT ---

export default function DashboardExperience({ payload }: { payload: DashboardPayload }) {
  const { stats } = payload;
  const weakKey = payload.weakKeys[0]?.key ?? "baseline";
  const bestRecent = payload.recentSessions[0];

  return (
    <main className="relative min-h-screen bg-[#02040a] px-4 pb-16 pt-24 text-white sm:px-6 lg:px-8 selection:bg-[#4f8dfd]/30 font-sans">
      <DashboardBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-[1400px]">
        <PersonalBestBanner newPb={true} pbWpm={31} pbDate="Apr 10" />
      </div>

      <motion.section
        initial="hidden"
        animate="show"
        variants={rise}
        className="relative z-10 mx-auto grid w-full max-w-[1400px] gap-6 xl:grid-cols-[minmax(0,1fr)_440px]"
      >
        <HeroPanel payload={payload} weakKey={weakKey} />
        <PilotCard payload={payload} />
      </motion.section>

      <motion.div 
        custom={0.1}
        initial="hidden"
        animate="show"
        variants={rise}
        className="relative z-10 mx-auto mt-6 w-full max-w-[1400px]"
      >
        <NextMilestoneBar
          currentRank="Bronze"
          nextRank="Silver"
          currentPoints={1200}
          targetPoints={2000}
          currentWpm={31}
          targetWpm={40}
        />
      </motion.div>

      <section className="relative z-10 mx-auto mt-6 grid w-full max-w-[1400px] gap-6 lg:grid-cols-2">
        {/* Training Map */}
        <SpotlightArticle
          custom={0.15}
          initial="hidden"
          animate="show"
          variants={rise}
          className="flex flex-col p-8 sm:p-10"
        >
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-400">Training Map</h2>
              <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">Today’s Route</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <CalendarDays className="h-5 w-5" />
            </div>
          </header>

          <ol className="relative mt-10 flex-1 space-y-8">
            <span className="absolute bottom-10 left-[23px] top-10 w-px bg-gradient-to-b from-violet-500/40 via-violet-500/10 to-transparent" aria-hidden="true" />
            {routeSteps.map((step, index) => (
              <RouteStep
                key={step.label}
                accent={step.accent}
                icon={step.icon}
                label={step.label}
                text={
                  index === 1
                    ? weakKey === "baseline"
                      ? "Run a baseline session to unlock drill targeting."
                      : `Focus ${weakKey} until mistakes calm down.`
                    : step.text
                }
                value={
                  index === 0
                    ? `${stats.lessonsCompleted} lessons`
                    : index === 1
                      ? `${stats.modeSessions} runs`
                      : `${stats.avgWpm || stats.last30AvgWpm} WPM`
                }
              />
            ))}
          </ol>
        </SpotlightArticle>

        {/* Run Log */}
        <SpotlightArticle
          custom={0.2}
          initial="hidden"
          animate="show"
          variants={rise}
          className="flex flex-col p-8 sm:p-10"
        >
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00d4ff]">Run Log</h2>
              <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">Recent Sessions</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#00d4ff]/20 bg-[#00d4ff]/10 text-[#00d4ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <Trophy className="h-5 w-5" />
            </div>
          </header>

          <ul className="mt-8 flex-1 space-y-2">
            {payload.recentSessions.length > 0 ? (
              payload.recentSessions.slice(0, 4).map((item) => (
                <li
                  key={`${item.label}-${item.mode}-${item.wpm}-${item.accuracy}`}
                  className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-transparent p-4 transition-all hover:border-white/[0.04] hover:bg-white/[0.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.04] bg-white/[0.02] text-zinc-400 transition-colors group-hover:border-[#00d4ff]/20 group-hover:bg-[#00d4ff]/10 group-hover:text-[#00d4ff]">
                      <Keyboard className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white transition-colors group-hover:text-[#00d4ff]">{item.mode}</h3>
                      <p className="mt-0.5 text-xs font-semibold tracking-wide text-zinc-500">
                        {item.label} <span className="mx-1 text-zinc-700">•</span> {formatMinutes(item.duration)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge label="WPM" value={item.wpm} accent="cyan" />
                    <Badge label="ACC" value={item.accuracy} accent="green" suffix="%" />
                  </div>
                </li>
              ))
            ) : (
              <li className="py-12 text-center text-sm font-bold text-zinc-500">No sessions yet. Start practice to build your log.</li>
            )}
          </ul>
        </SpotlightArticle>
      </section>

      <motion.section
        custom={0.25}
        initial="hidden"
        animate="show"
        variants={rise}
        className="relative z-10 mx-auto mt-6 flex w-full max-w-[1400px] flex-col gap-4 rounded-[2rem] border border-[#00ff88]/20 bg-gradient-to-r from-[#00ff88]/10 via-[#00d4ff]/5 to-transparent p-6 shadow-[0_0_40px_rgba(0,255,136,0.1)] backdrop-blur-3xl transition-colors hover:border-[#00ff88]/30 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm font-bold tracking-wide text-zinc-200">
          {bestRecent
            ? `Your last run hit ${bestRecent.wpm} WPM with ${bestRecent.accuracy}% precision.`
            : "One focused run will unlock your live dashboard."}
        </p>
        <Link href="/practice" className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black text-black transition-all hover:scale-105 hover:bg-zinc-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]">
          Start Next Run <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.section>
    </main>
  );
}

// --- SUB-COMPONENTS ---

function HeroPanel({ payload, weakKey }: { payload: DashboardPayload; weakKey: string }) {
  const { stats, user } = payload;

  return (
    <SpotlightArticle className="relative flex min-h-[440px] flex-col justify-between p-8 sm:p-12">
      <header className="relative z-10">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 shadow-inner backdrop-blur-md">
          <div className="relative flex h-2 w-2 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ff88] opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88]"></span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Live Workspace</span>
        </div>

        <h1 className="mt-8 text-5xl font-black leading-[1.05] tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl">
          <span className="block text-zinc-600">Welcome,</span>
          <span className="bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent drop-shadow-sm">
            {user.displayName}.
          </span>
        </h1>
        
        <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-zinc-400">
          Your command center is online. Train your muscle memory, analyze your faults, and dominate the keyboard.
        </p>
      </header>

      <div className="relative z-10 mt-12 flex flex-wrap items-center gap-4">
        <Link
          href="/practice"
          className="group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full bg-white px-8 text-sm font-black text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
        >
          <div className="absolute inset-0 -translate-x-[150%] skew-x-[-45deg] bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 group-hover:translate-x-[150%]"></div>
          <Play className="h-4 w-4 fill-black" />
          Start Session
        </Link>
        <Link
          href="/analytics"
          className="group inline-flex h-14 items-center gap-3 rounded-full border border-white/10 bg-white/[0.02] px-8 text-sm font-black text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-md transition-all hover:bg-white/[0.06] hover:shadow-[0_4px_30px_rgba(255,255,255,0.1)]"
        >
          <BarChart3 className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-white" />
          Deep Analytics
        </Link>
      </div>
    </SpotlightArticle>
  );
}

function PilotCard({ payload }: { payload: DashboardPayload }) {
  const { stats, user } = payload;

  return (
    <SpotlightArticle className="relative flex flex-col items-center justify-center p-8 text-center sm:p-12">
      <div className="relative flex h-56 w-56 items-center justify-center">
        {/* Glow Effects */}
        <div className="absolute inset-0 rounded-full bg-[#00ff88]/5 blur-2xl" />
        
        {/* Insane SVG Progress Ring */}
        <svg className="absolute inset-0 h-full w-full -rotate-90 drop-shadow-[0_0_15px_rgba(0,255,136,0.3)]" viewBox="0 0 100 100">
          <defs>
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="100%" stopColor="#00ff88" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="url(#ring-grad)"
            strokeLinecap="round"
            strokeWidth="3.5"
            filter="url(#neon-glow)"
            initial={{ strokeDashoffset: 289 }}
            animate={{ strokeDashoffset: 289 - (289 * stats.commandScore) / 100 }}
            strokeDasharray={289}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        
        <div className="flex flex-col items-center">
          <p className="text-[5rem] font-black leading-none tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            <AnimatedNumber value={stats.commandScore} />
          </p>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#00ff88]">Readiness</p>
        </div>
      </div>

      <div className="mt-10 flex w-full items-center justify-between rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Avatar src={user.avatarUrl} name={user.displayName} size={36} className="border border-white/20 shadow-lg" />
          <div className="text-left">
            <p className="text-sm font-bold text-white">{user.displayName}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff]">{user.rankTier} Rank</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid w-full grid-cols-3 gap-2">
        <StatItem label="Streak" value={`${stats.currentStreak}d`} />
        <StatItem label="Badges" value={`${stats.achievements}`} />
        <StatItem label="Active" value={`${stats.activeDays30}/30`} />
      </div>
    </SpotlightArticle>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.02] bg-white/[0.01] py-4 text-center transition-colors hover:bg-white/[0.03]">
      <p className="text-xl font-black text-white">{value}</p>
      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</p>
    </div>
  );
}

function RouteStep({
  accent,
  icon: Icon,
  label,
  text,
  value,
}: {
  accent: "cyan" | "emerald" | "violet";
  icon: typeof Keyboard;
  label: string;
  text: string;
  value: string;
}) {
  const tone =
    accent === "cyan"
      ? "border-[#00d4ff]/30 bg-[#00d4ff]/10 text-[#00d4ff] shadow-[0_0_15px_rgba(0,212,255,0.15)]"
      : accent === "emerald"
        ? "border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.15)]"
        : "border-[#7c3aed]/30 bg-[#7c3aed]/10 text-[#7c3aed] shadow-[0_0_15px_rgba(124,58,237,0.15)]";

  return (
    <li className="relative z-10 grid grid-cols-[48px_1fr] gap-6">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-full border", tone)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="group rounded-[1.5rem] border border-white/[0.04] bg-white/[0.01] p-5 backdrop-blur-md transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.03] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-black text-white">{label}</h3>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            {value}
          </span>
        </header>
        <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-400 transition-colors group-hover:text-zinc-300">{text}</p>
      </div>
    </li>
  );
}

function Badge({ value, label, accent, suffix = "" }: { value: number | string; label: string; accent: "cyan" | "green" | "violet"; suffix?: string }) {
  const colors = {
    cyan: "border-[#00d4ff]/20 bg-[#00d4ff]/10 text-[#00d4ff]",
    green: "border-[#00ff88]/20 bg-[#00ff88]/10 text-[#00ff88]",
    violet: "border-[#7c3aed]/20 bg-[#7c3aed]/10 text-[#7c3aed]",
  };

  return (
    <div className={cn("inline-flex items-center justify-center rounded-full border px-3 py-1 font-mono text-xs font-bold shadow-inner transition-transform hover:scale-105", colors[accent])}>
      {value}{suffix}
      <span className="ml-1.5 text-[9px] uppercase tracking-widest opacity-60">{label}</span>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
    mass: 1,
  });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
    } else {
      motionValue.set(value);
    }
  }, [motionValue, value, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    return springValue.on("change", (latest) => {
      setDisplay(Math.round(latest));
    });
  }, [springValue, reduceMotion]);

  return <span>{display}</span>;
}

const SpotlightArticle = React.forwardRef<HTMLElement, any>(
  ({ children, className, onMouseMove, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const internalRef = useRef<HTMLElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
      if (!internalRef.current) return;
      const rect = internalRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
      if (onMouseMove) onMouseMove(e);
    };

    return (
      <motion.article
        ref={(node) => {
          // @ts-ignore
          internalRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={(e) => {
          setIsHovered(true);
          if (onMouseEnter) onMouseEnter(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          if (onMouseLeave) onMouseLeave(e);
        }}
        className={cn("group relative overflow-hidden rounded-[2.5rem] bg-[#060b14]/60 backdrop-blur-3xl border border-white/[0.04] shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-colors duration-500 hover:bg-[#060b14]/80 hover:border-white/[0.08]", className)}
        {...props}
      >
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-700 ease-out group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                700px circle at ${mouseX}px ${mouseY}px,
                rgba(255,255,255,0.06),
                transparent 40%
              )
            `,
          }}
        />
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[2.5rem] opacity-0 transition duration-700 ease-out group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                400px circle at ${mouseX}px ${mouseY}px,
                rgba(0,212,255,0.06),
                transparent 40%
              )
            `,
          }}
        />
        {children}
      </motion.article>
    );
  }
);
SpotlightArticle.displayName = "SpotlightArticle";

function DashboardBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[#02040a]">
      <div 
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black 40%, transparent 100%)"
        }}
      />
      <div className="absolute left-1/2 top-0 h-[600px] w-[1200px] -translate-x-1/2 rounded-full bg-[#00d4ff]/[0.05] blur-[150px]" />
      <div className="absolute right-0 top-1/4 h-[800px] w-[800px] rounded-full bg-[#00ff88]/[0.03] blur-[150px]" />
    </div>
  );
}
