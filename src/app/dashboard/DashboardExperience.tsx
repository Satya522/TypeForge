"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  Flame,
  Keyboard,
  Map,
  Play,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import Footer from "@/components/Footer";

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

const DASH_FALLBACK_SESSIONS: RecentSession[] = [
  { accuracy: 47, duration: 420, label: "Apr 16", mode: "Practice", wpm: 9 },
  { accuracy: 89, duration: 480, label: "Apr 10", mode: "Practice", wpm: 31 },
  { accuracy: 99, duration: 390, label: "Apr 9", mode: "Practice", wpm: 22 },
  { accuracy: 92, duration: 360, label: "Apr 9", mode: "Practice", wpm: 14 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "Satya";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getWpmTone(wpm: number) {
  if (wpm < 15) return "danger";
  if (wpm <= 25) return "warning";
  return "success";
}

function getAccuracyTone(accuracy: number) {
  if (accuracy < 60) return "danger";
  if (accuracy <= 85) return "warning";
  return "success";
}

function getVerdict(wpm: number, accuracy: number) {
  if (wpm < 15 && accuracy < 60) return "Needs Work";
  if (wpm > 25 && accuracy > 85) return "Good Run";
  if (wpm <= 25 && accuracy > 95) return "Solid Accuracy";
  if (wpm < 15 && accuracy > 85) return "Slow but Precise";
  return "Keep Building";
}

function progressStyle(value: number, delay: string): CSSProperties {
  return {
    "--dash-progress-target": `${clamp(value, 0, 100)}%`,
    "--dash-progress-delay": delay,
  } as CSSProperties;
}

export default function DashboardExperience({ payload }: { payload: DashboardPayload }) {
  const { stats, user } = payload;
  const name = firstName(user.displayName);
  const readiness = clamp(Math.round(stats.commandScore || 35), 0, 100);
  const readinessOffset = 314.16 * (1 - readiness / 100);
  const rankPoints = user.rating || 1200;
  const targetPoints = 2000;
  const currentWpm = stats.bestWpm || stats.last30AvgWpm || 31;
  const targetWpm = 40;
  const rankPercent = clamp((rankPoints / targetPoints) * 100, 0, 100);
  const speedPercent = clamp((currentWpm / targetWpm) * 100, 0, 100);
  const activeSessions = clamp(stats.activeDays30 || 1, 0, 30);
  const sessionCards = Array.from({ length: 4 }, (_, index) => payload.recentSessions[index] ?? DASH_FALLBACK_SESSIONS[index]);
  const sparkValues = sessionCards.map((session) => session.wpm);

  return (
    <main className="dash-root">
      <div className="dash-orb dash-orb-one" aria-hidden="true" />
      <div className="dash-orb dash-orb-two" aria-hidden="true" />
      <div className="dash-grid-glow" aria-hidden="true" />

      <div className="dash-shell">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="dash-hero"
        >
          <div className="dash-hero-copy relative z-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="dash-kicker text-white/50 tracking-[0.3em]">WELCOME BACK,</motion.div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="dash-title bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">{name}.</motion.h1>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="dash-subline">
              <p className="text-white/60 font-medium">Your command center is live.</p>
              <span className="dash-live-pill backdrop-blur-md border border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <span className="dash-live-dot bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                LIVE WORKSPACE
              </span>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="dash-hero-actions" aria-label="Dashboard actions">
            <Link href="/practice" className="dash-button dash-button-primary bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 border border-white/20 shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:shadow-[0_0_60px_rgba(6,182,212,0.6)] hover:border-white/40 group relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Play className="dash-button-icon relative z-10" fill="currentColor" />
              <span className="relative z-10 text-white font-black tracking-wide">Start Next Run</span>
              <ArrowRight className="dash-button-arrow relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/analytics" className="dash-button dash-button-secondary backdrop-blur-md border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all">
              <BarChart3 className="dash-button-icon text-white/70" />
              <span className="text-white/90 font-bold">Deep Analytics</span>
            </Link>
          </motion.div>
        </motion.section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8" aria-label="Typing status overview">
          <motion.article 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden group rounded-[20px] p-5 bg-[#0a0a0c]/80 border border-white/[0.05] flex flex-col justify-between min-h-[130px]"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px -10px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:text-emerald-400 group-hover:bg-emerald-400/10 transition-all duration-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">Readiness</p>
              </div>
              <div className="flex items-center justify-center w-7 h-7">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
              </div>
            </div>

            <div className="relative z-10 mt-4 flex items-end justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                  {readiness}
                </span>
                <span className="text-white/30 font-semibold text-xs mb-1">/ 100</span>
              </div>
              
              <div className="w-11 h-11 relative" style={{ "--dash-ring-offset": readinessOffset } as CSSProperties}>
                <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" viewBox="0 0 120 120">
                  <circle className="stroke-white/10" cx="60" cy="60" r="50" strokeWidth="10" fill="none" />
                  <motion.circle 
                    initial={{ strokeDashoffset: 314.16 }}
                    animate={{ strokeDashoffset: readinessOffset }} 
                    transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                    className="stroke-emerald-400"
                    cx="60" cy="60" r="50" strokeWidth="10" fill="none"
                    style={{ strokeDasharray: 314.16, strokeLinecap: "round" }}
                  />
                </svg>
              </div>
            </div>
          </motion.article>

          <StatCard
            delay="0.2s"
            icon={<Flame />}
            label="STREAK"
            value={`${stats.currentStreak ?? 0}d`}
            tone="warning"
            hint="Start a session to ignite!"
          />
          <StatCard
            delay="0.3s"
            icon={<Star />}
            label="BADGES"
            value={`${stats.achievements ?? 0}`}
            tone="gold"
            hint="Complete sessions to earn"
          />
          
          <motion.article 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden group rounded-[20px] p-5 bg-[#0a0a0c]/80 border border-white/[0.05] flex flex-col justify-between min-h-[130px]"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px -10px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:text-cyan-400 group-hover:bg-cyan-400/10 transition-all duration-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">Active</p>
              </div>
            </div>

            <div className="relative z-10 mt-4">
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                  {activeSessions}
                </span>
                <span className="text-white/30 font-semibold text-xs mb-1">/ 30</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(activeSessions / 30) * 100}%` }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                />
              </div>
            </div>
          </motion.article>
        </section>

        <section className="dash-two-col">
          <motion.article 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden group rounded-[20px] p-5 md:p-6 bg-[#0B0D14] border border-white/5 flex flex-col justify-between"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 40px -10px rgba(0,0,0,0.5)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none">
              <Trophy className="w-32 h-32 text-violet-400 blur-2xl transform rotate-12" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">Next Milestone</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-stone-400 to-stone-200">Bronze</h2>
                  <ArrowRight className="w-4 h-4 text-white/20" />
                  <h2 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Silver</h2>
                </div>
              </div>
            </div>

            <div className="relative z-10 space-y-5">
              {/* Rank Points Row */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[10px] font-bold tracking-widest text-white/50 uppercase">Rank Points</p>
                  <div className="text-right flex items-baseline gap-1">
                    <span className="text-sm font-black text-white">{formatNumber(rankPoints)}</span>
                    <span className="text-[10px] font-bold text-white/40">/ {formatNumber(targetPoints)}</span>
                  </div>
                </div>
                <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+PHJlY3QgeD0nMCcgeT0nMCcgd2lkdGg9JzEnIGhlaWdodD0nMTAnIGZpbGw9J3JnYmEoMjU1LDI1NSwyNTUsMC4wNSknLz48L3N2Zz4=')] opacity-50" />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${rankPercent}%` }}
                    transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                  />
                  <motion.div
                    initial={{ left: "-10%" }}
                    animate={{ left: `${rankPercent}%` }}
                    transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
                    className="absolute top-0 bottom-0 w-8 -ml-4 bg-white/40 blur-[2px] rounded-full mix-blend-overlay"
                  />
                </div>
              </div>

              {/* Speed Goal Row */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[10px] font-bold tracking-widest text-white/50 uppercase">Speed Goal</p>
                  <div className="text-right flex items-baseline gap-1">
                    <span className="text-sm font-black text-white">{Math.round(currentWpm)}</span>
                    <span className="text-[10px] font-bold text-white/40">/ {targetWpm}</span>
                  </div>
                </div>
                <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+PHJlY3QgeD0nMCcgeT0nMCcgd2lkdGg9JzEnIGhlaWdodD0nMTAnIGZpbGw9J3JnYmEoMjU1LDI1NSwyNTUsMC4wNSknLz48L3N2Zz4=')] opacity-50" />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${speedPercent}%` }}
                    transition={{ delay: 0.9, duration: 1.5, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  />
                  <motion.div
                    initial={{ left: "-10%" }}
                    animate={{ left: `${speedPercent}%` }}
                    transition={{ delay: 0.9, duration: 1.5, ease: "easeOut" }}
                    className="absolute top-0 bottom-0 w-8 -ml-4 bg-white/40 blur-[2px] rounded-full mix-blend-overlay"
                  />
                </div>
              </div>
            </div>
          </motion.article>

          <article className="dash-card dash-route-card dash-animate" style={{ "--dash-delay": "0.4s" } as CSSProperties}>
            <header className="dash-card-header dash-tight-header">
              <div>
                <p className="dash-section-label">Today&apos;s Route</p>
                <h2 className="dash-card-title">Training Map</h2>
              </div>
              <Map className="dash-header-icon" />
            </header>

            <ol className="dash-route-list">
              <RouteStep
                state="done"
                number="1"
                title="Warm Up"
                badge="0 Lessons"
                description="Completed rhythm check. Your hands are awake."
              />
              <RouteStep
                state="active"
                number="2"
                title="Core Drill"
                badge="4 Runs"
                description="Active focus block. Turn friction into flow."
              />
              <RouteStep
                state="pending"
                number="3"
                title="Finish"
                badge="19 WPM"
                description="Close with one clean sprint."
              />
            </ol>
          </article>
        </section>

        <section className="dash-card dash-run-log dash-animate" style={{ "--dash-delay": "0.5s" } as CSSProperties}>
          <header className="dash-run-header">
            <div className="dash-run-title-group">
              <span className="dash-run-icon">
                <Trophy />
              </span>
              <div>
                <p className="dash-section-label">Run Log</p>
                <h2 className="dash-card-title">Recent Sessions</h2>
              </div>
            </div>
            <div className="dash-run-tools">
              <Sparkline values={sparkValues} />
              <Link href="/analytics" className="dash-view-all">
                View All <ArrowRight />
              </Link>
            </div>
          </header>

          <div className="dash-session-grid">
            {sessionCards.map((session, index) => (
              <SessionCard key={`${session.label}-${session.wpm}-${session.accuracy}-${index}`} session={session} />
            ))}
          </div>

          <footer className="dash-run-footer">
            Your last run hit {Math.round(sessionCards[0].wpm)} WPM with {Math.round(sessionCards[0].accuracy)}% precision. Keep pushing, {name}.
          </footer>
        </section>

        <p className="dash-footer-quote dash-animate" style={{ "--dash-delay": "0.6s" } as CSSProperties}>
          Consistency beats perfection. — keep typing, {name}. 🚀
        </p>
      </div>

      <style>{`
        .dash-root {
          --dash-bg: #0a0a0f;
          --dash-surface: rgba(17, 17, 24, 0.82);
          --dash-surface-strong: rgba(20, 20, 30, 0.94);
          --dash-surface-soft: rgba(255, 255, 255, 0.035);
          --dash-border: rgba(255, 255, 255, 0.075);
          --dash-border-hover: rgba(124, 58, 237, 0.38);
          --dash-text: #f8fafc;
          --dash-subtle: #cbd5e1;
          --dash-muted: #94a3b8;
          --dash-faint: #64748b;
          --dash-violet: #7c3aed;
          --dash-violet-bright: #a78bfa;
          --dash-cyan: #06b6d4;
          --dash-cyan-bright: #67e8f9;
          --dash-green: #10b981;
          --dash-lime: #a3e635;
          --dash-amber: #f59e0b;
          --dash-gold: #facc15;
          --dash-red: #fb7185;
          --dash-shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(circle at 18% 4%, rgba(124, 58, 237, 0.16), transparent 30%),
            radial-gradient(circle at 82% 10%, rgba(6, 182, 212, 0.14), transparent 28%),
            linear-gradient(180deg, #0a0a0f 0%, #07070c 58%, #090a10 100%);
          color: var(--dash-text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          isolation: isolate;
          padding: 104px 32px 42px;
        }

        .dash-root *,
        .dash-root *::before,
        .dash-root *::after {
          box-sizing: border-box;
        }

        .dash-shell {
          position: relative;
          z-index: 2;
          width: min(1400px, 100%);
          margin: 0 auto;
        }

        .dash-grid-glow {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.28;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: radial-gradient(circle at 50% 18%, black 0%, transparent 68%);
          pointer-events: none;
        }

        .dash-orb {
          position: absolute;
          z-index: 0;
          border-radius: 999px;
          filter: blur(100px);
          opacity: 0.52;
          pointer-events: none;
        }

        .dash-orb-one {
          width: 420px;
          height: 420px;
          left: -140px;
          top: 70px;
          background: rgba(124, 58, 237, 0.18);
        }

        .dash-orb-two {
          width: 460px;
          height: 460px;
          right: -180px;
          top: 240px;
          background: rgba(6, 182, 212, 0.13);
        }

        .dash-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 28px;
          margin-bottom: 20px;
        }

        .dash-kicker,
        .dash-section-label {
          color: var(--dash-muted);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .dash-title {
          margin: 4px 0 0;
          color: var(--dash-text);
          font-size: clamp(48px, 7vw, 84px);
          font-weight: 850;
          line-height: 0.94;
          letter-spacing: -0.07em;
          text-wrap: balance;
        }

        .dash-subline {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 16px;
        }

        .dash-subline p {
          margin: 0;
          color: var(--dash-subtle);
          font-size: 16px;
        }

        .dash-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(16, 185, 129, 0.34);
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.08);
          box-shadow: 0 0 28px rgba(16, 185, 129, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          color: #bbf7d0;
          padding: 8px 12px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.16em;
        }

        .dash-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: var(--dash-green);
          box-shadow: 0 0 14px rgba(16, 185, 129, 0.9);
          animation: dash-live-blink 2s ease-in-out infinite;
        }

        .dash-hero-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          flex-wrap: wrap;
          min-width: 340px;
        }

        .dash-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 52px;
          border-radius: 999px;
          padding: 0 22px;
          overflow: hidden;
          text-decoration: none;
          color: var(--dash-text);
          font-size: 14px;
          font-weight: 800;
          letter-spacing: -0.01em;
          transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), border-color 200ms, box-shadow 200ms, color 200ms;
        }

        .dash-button-primary {
          background: linear-gradient(135deg, var(--dash-violet) 0%, #2563eb 50%, var(--dash-cyan) 100%);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 16px 44px rgba(124, 58, 237, 0.28);
          animation: dash-cta-pulse 3s ease-in-out infinite;
        }

        .dash-button-primary::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-140%) skewX(-18deg);
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.24), transparent);
          transition: transform 760ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .dash-button-primary:hover::after {
          transform: translateX(140%) skewX(-18deg);
        }

        .dash-button-secondary {
          border: 1px solid rgba(255, 255, 255, 0.11);
          background: rgba(255, 255, 255, 0.035);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
          color: var(--dash-subtle);
        }

        .dash-button:hover {
          transform: translateY(-1px) scale(1.025);
        }

        .dash-button-secondary:hover {
          border-color: rgba(6, 182, 212, 0.42);
          color: var(--dash-cyan-bright);
          box-shadow: 0 14px 34px rgba(6, 182, 212, 0.1);
        }

        .dash-button-icon,
        .dash-button-arrow {
          width: 16px;
          height: 16px;
          position: relative;
          z-index: 1;
        }

        .dash-button-arrow {
          transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .dash-button-primary:hover .dash-button-arrow {
          transform: translateX(3px);
        }

        .dash-stats {
          display: grid;
          grid-template-columns: 1.25fr repeat(3, 1fr);
          gap: 16px;
          align-items: stretch;
          margin-bottom: 16px;
        }

        .dash-card {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--dash-border);
          border-radius: 28px;
          background:
            linear-gradient(140deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.018)),
            var(--dash-surface);
          box-shadow: var(--dash-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(22px);
          transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), border-color 200ms, box-shadow 200ms, background 200ms;
        }

        .dash-card::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.7;
          background:
            radial-gradient(circle at 16% 12%, rgba(124, 58, 237, 0.14), transparent 34%),
            radial-gradient(circle at 84% 16%, rgba(6, 182, 212, 0.1), transparent 36%);
          pointer-events: none;
        }

        .dash-card > * {
          position: relative;
          z-index: 1;
        }

        .dash-card:hover {
          transform: scale(1.015);
          border-color: var(--dash-border-hover);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.42), 0 0 42px rgba(124, 58, 237, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .dash-stat-card {
          min-height: 178px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .dash-readiness-card {
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .dash-ring-wrap {
          position: relative;
          width: 122px;
          height: 122px;
        }

        .dash-ring {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
          overflow: visible;
        }

        .dash-ring-track,
        .dash-ring-value {
          fill: none;
          stroke-width: 8;
        }

        .dash-ring-track {
          stroke: rgba(255, 255, 255, 0.08);
        }

        .dash-ring-value {
          stroke: url(#dash-readiness-gradient);
          stroke-linecap: round;
          stroke-dasharray: 314.16;
          stroke-dashoffset: 314.16;
          filter: drop-shadow(0 0 12px rgba(163, 230, 53, 0.35));
          animation: dash-ring-draw 1.5s ease-out 0.5s forwards;
        }

        .dash-ring-center {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .dash-ring-number {
          color: var(--dash-text);
          font-size: 34px;
          font-weight: 850;
          letter-spacing: -0.08em;
        }

        .dash-ring-total {
          align-self: center;
          color: var(--dash-muted);
          font-size: 13px;
          font-weight: 700;
        }

        .dash-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.22);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        .dash-stat-icon svg {
          width: 20px;
          height: 20px;
        }

        .dash-tone-warning {
          color: #fb923c;
          border-color: rgba(251, 146, 60, 0.22);
          background: rgba(251, 146, 60, 0.08);
        }

        .dash-tone-gold {
          color: var(--dash-gold);
          border-color: rgba(250, 204, 21, 0.22);
          background: rgba(250, 204, 21, 0.08);
        }

        .dash-tone-cyan {
          color: var(--dash-cyan-bright);
          border-color: rgba(6, 182, 212, 0.24);
          background: rgba(6, 182, 212, 0.08);
        }

        .dash-stat-value,
        .dash-active-number {
          color: var(--dash-text);
          font-size: 42px;
          font-weight: 850;
          line-height: 0.9;
          letter-spacing: -0.08em;
        }

        .dash-active-number span {
          color: var(--dash-cyan-bright);
        }

        .dash-active-number small {
          margin-left: 5px;
          color: var(--dash-faint);
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.05em;
        }

        .dash-stat-label {
          margin: 0;
          color: var(--dash-muted);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.18em;
        }

        .dash-cyan {
          color: var(--dash-cyan-bright);
        }

        .dash-stat-hint {
          margin: 0;
          color: var(--dash-faint);
          font-size: 12px;
          font-style: italic;
        }

        .dash-stat-hint-warning {
          color: #fdba74;
        }

        .dash-mini-progress {
          width: 100%;
          height: 3px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.08);
        }

        .dash-mini-progress span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, var(--dash-cyan), var(--dash-cyan-bright));
          box-shadow: 0 0 14px rgba(6, 182, 212, 0.46);
        }

        .dash-two-col {
          display: grid;
          grid-template-columns: minmax(0, 3fr) minmax(340px, 2fr);
          gap: 16px;
          margin-bottom: 16px;
        }

        .dash-rank-card,
        .dash-route-card,
        .dash-run-log {
          padding: 26px;
        }

        .dash-card-header,
        .dash-run-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
        }

        .dash-card-title {
          margin: 4px 0 0;
          color: var(--dash-text);
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.045em;
        }

        .dash-rank-badge,
        .dash-view-all {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          border: 1px solid rgba(124, 58, 237, 0.28);
          background: rgba(124, 58, 237, 0.1);
          color: var(--dash-violet-bright);
          padding: 9px 12px;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
        }

        .dash-rank-badge svg,
        .dash-view-all svg,
        .dash-header-icon {
          width: 16px;
          height: 16px;
        }

        .dash-header-icon {
          color: var(--dash-cyan-bright);
        }

        .dash-progress-stack {
          display: grid;
          gap: 22px;
          margin-top: 28px;
        }

        .dash-progress-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .dash-progress-label,
        .dash-progress-value {
          margin: 0;
          font-size: 13px;
          font-weight: 800;
        }

        .dash-progress-label {
          color: var(--dash-subtle);
        }

        .dash-progress-value {
          color: var(--dash-text);
          font-variant-numeric: tabular-nums;
        }

        .dash-progress-track {
          height: 12px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.075);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.32);
        }

        .dash-progress-fill {
          position: relative;
          display: block;
          width: 0;
          height: 100%;
          border-radius: inherit;
          overflow: hidden;
          animation: dash-progress-fill 1.2s ease-out var(--dash-progress-delay) forwards;
        }

        .dash-progress-fill::after {
          content: "";
          position: absolute;
          inset: 0;
          width: 44%;
          transform: translateX(-120%) skewX(-20deg);
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.42), transparent);
          animation: dash-progress-shimmer 3s ease-in-out calc(var(--dash-progress-delay) + 1.4s) infinite;
        }

        .dash-progress-violet {
          background: linear-gradient(90deg, var(--dash-violet), #6366f1, var(--dash-violet-bright));
          box-shadow: 0 0 18px rgba(124, 58, 237, 0.32);
        }

        .dash-progress-cyan {
          background: linear-gradient(90deg, #0891b2, var(--dash-cyan), var(--dash-cyan-bright));
          box-shadow: 0 0 18px rgba(6, 182, 212, 0.28);
        }

        .dash-progress-hint {
          margin: 9px 0 0;
          color: var(--dash-faint);
          font-size: 12px;
          font-weight: 650;
        }

        .dash-route-list {
          position: relative;
          display: grid;
          gap: 10px;
          margin: 22px 0 0;
          padding: 0;
          list-style: none;
        }

        .dash-route-list::before {
          content: "";
          position: absolute;
          left: 19px;
          top: 42px;
          bottom: 42px;
          width: 2px;
          border-radius: 999px;
          background: linear-gradient(180deg, var(--dash-green), rgba(6, 182, 212, 0.45), rgba(255, 255, 255, 0.08));
        }

        .dash-route-step {
          position: relative;
          display: grid;
          grid-template-columns: 40px 1fr;
          gap: 14px;
          align-items: flex-start;
          padding: 12px;
          border-radius: 20px;
        }

        .dash-route-step-active {
          border-left: 2px solid var(--dash-violet-bright);
          background: linear-gradient(90deg, rgba(124, 58, 237, 0.16), rgba(6, 182, 212, 0.045));
          box-shadow: inset 0 0 0 1px rgba(124, 58, 237, 0.16);
          animation: dash-active-step-glow 2s ease-in-out infinite;
        }

        .dash-route-node {
          position: relative;
          z-index: 1;
          width: 40px;
          height: 40px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #0a0a0f;
          color: var(--dash-muted);
          font-size: 13px;
          font-weight: 850;
        }

        .dash-route-step-done .dash-route-node {
          border-color: rgba(16, 185, 129, 0.4);
          background: var(--dash-green);
          color: #02130d;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.28);
        }

        .dash-route-step-active .dash-route-node {
          border-color: rgba(124, 58, 237, 0.45);
          background: linear-gradient(135deg, var(--dash-violet), var(--dash-cyan));
          color: white;
          box-shadow: 0 0 24px rgba(124, 58, 237, 0.45);
        }

        .dash-route-content {
          min-width: 0;
        }

        .dash-route-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .dash-route-title {
          margin: 0;
          color: var(--dash-text);
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .dash-route-step-pending .dash-route-title,
        .dash-route-step-pending .dash-route-desc {
          color: var(--dash-faint);
        }

        .dash-route-desc {
          margin: 5px 0 0;
          color: var(--dash-muted);
          font-size: 13px;
          line-height: 1.45;
        }

        .dash-route-badge {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.045);
          color: var(--dash-muted);
          padding: 6px 9px;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .dash-route-step-active .dash-route-badge {
          border-color: rgba(6, 182, 212, 0.34);
          background: rgba(6, 182, 212, 0.12);
          color: var(--dash-cyan-bright);
          box-shadow: 0 0 18px rgba(6, 182, 212, 0.14);
        }

        .dash-run-log {
          margin-bottom: 16px;
        }

        .dash-run-title-group,
        .dash-run-tools {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .dash-run-tools {
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .dash-run-icon {
          width: 46px;
          height: 46px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(250, 204, 21, 0.2);
          background: rgba(250, 204, 21, 0.08);
          color: var(--dash-gold);
        }

        .dash-run-icon svg {
          width: 20px;
          height: 20px;
        }

        .dash-view-all {
          border-color: rgba(6, 182, 212, 0.24);
          background: rgba(6, 182, 212, 0.08);
          color: var(--dash-cyan-bright);
        }

        .dash-sparkline {
          width: 116px;
          height: 42px;
          color: var(--dash-cyan-bright);
          filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.22));
        }

        .dash-session-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-top: 22px;
        }

        .dash-session-card {
          position: relative;
          min-height: 190px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 22px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.018));
          padding: 18px;
          transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), border-color 200ms, background 200ms;
        }

        .dash-session-card:hover {
          transform: scale(1.015);
          border-color: rgba(6, 182, 212, 0.28);
          background: linear-gradient(145deg, rgba(6, 182, 212, 0.09), rgba(124, 58, 237, 0.035));
        }

        .dash-session-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .dash-session-date,
        .dash-session-kind {
          margin: 0;
          color: var(--dash-muted);
          font-size: 12px;
          font-weight: 700;
        }

        .dash-session-kind {
          margin-top: 8px;
          color: var(--dash-faint);
          font-size: 10px;
          letter-spacing: 0.18em;
        }

        .dash-session-key {
          width: 38px;
          height: 38px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.2);
          color: var(--dash-muted);
        }

        .dash-session-key svg {
          width: 18px;
          height: 18px;
        }

        .dash-session-metric {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-top: 22px;
        }

        .dash-session-wpm {
          font-size: 44px;
          font-weight: 850;
          line-height: 0.9;
          letter-spacing: -0.08em;
        }

        .dash-session-unit {
          color: var(--dash-faint);
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.12em;
        }

        .dash-session-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 18px;
        }

        .dash-accuracy-pill {
          border-radius: 999px;
          border: 1px solid currentColor;
          padding: 7px 10px;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.04em;
        }

        .dash-session-verdict {
          margin: 0;
          color: var(--dash-muted);
          font-size: 12px;
          font-style: italic;
          text-align: right;
        }

        .dash-tone-success {
          color: var(--dash-green);
        }

        .dash-tone-warning-text {
          color: var(--dash-amber);
        }

        .dash-tone-danger {
          color: var(--dash-red);
        }

        .dash-pill-success {
          background: rgba(16, 185, 129, 0.1);
          color: #86efac;
        }

        .dash-pill-warning {
          background: rgba(245, 158, 11, 0.1);
          color: #fcd34d;
        }

        .dash-pill-danger {
          background: rgba(251, 113, 133, 0.1);
          color: #fda4af;
        }

        .dash-run-footer {
          margin-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          padding-top: 16px;
          color: var(--dash-muted);
          font-size: 13px;
          font-style: italic;
          line-height: 1.5;
        }

        .dash-footer-quote {
          margin: 0;
          color: rgba(148, 163, 184, 0.68);
          text-align: center;
          font-size: 13px;
          font-style: italic;
        }

        .dash-animate {
          opacity: 0;
          transform: translateY(20px);
          animation: dash-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: var(--dash-delay, 0s);
        }

        @keyframes dash-fade-up {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dash-ring-draw {
          from {
            stroke-dashoffset: 314.16;
          }
          to {
            stroke-dashoffset: var(--dash-ring-offset);
          }
        }

        @keyframes dash-progress-fill {
          to {
            width: var(--dash-progress-target);
          }
        }

        @keyframes dash-progress-shimmer {
          0% {
            transform: translateX(-120%) skewX(-20deg);
            opacity: 0;
          }
          18% {
            opacity: 0.72;
          }
          100% {
            transform: translateX(260%) skewX(-20deg);
            opacity: 0;
          }
        }

        @keyframes dash-cta-pulse {
          0%, 100% {
            box-shadow: 0 16px 44px rgba(124, 58, 237, 0.26), 0 0 0 rgba(6, 182, 212, 0);
          }
          50% {
            box-shadow: 0 18px 54px rgba(124, 58, 237, 0.36), 0 0 34px rgba(6, 182, 212, 0.2);
          }
        }

        @keyframes dash-active-step-glow {
          0%, 100% {
            box-shadow: inset 2px 0 0 rgba(167, 139, 250, 0.55), inset 0 0 0 1px rgba(124, 58, 237, 0.14);
          }
          50% {
            box-shadow: inset 2px 0 0 rgba(167, 139, 250, 1), inset 0 0 0 1px rgba(124, 58, 237, 0.2), 0 0 24px rgba(124, 58, 237, 0.14);
          }
        }

        @keyframes dash-live-blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        @media (max-width: 1365px) {
          .dash-root {
            padding-top: 96px;
          }

          .dash-two-col {
            grid-template-columns: 1fr;
          }

          .dash-session-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 1023px) {
          .dash-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .dash-root {
            padding: 88px 16px 32px;
          }

          .dash-hero {
            align-items: flex-start;
            flex-direction: column;
          }

          .dash-title {
            font-size: 36px;
            letter-spacing: -0.055em;
          }

          .dash-hero-actions {
            width: 100%;
            min-width: 0;
          }

          .dash-button {
            width: 100%;
          }

          .dash-button-secondary {
            display: none;
          }

          .dash-stats,
          .dash-session-grid {
            grid-template-columns: 1fr;
          }

          .dash-rank-card,
          .dash-route-card,
          .dash-run-log {
            padding: 20px;
            border-radius: 24px;
          }

          .dash-card-header,
          .dash-run-header,
          .dash-progress-head,
          .dash-session-bottom {
            align-items: flex-start;
            flex-direction: column;
          }

          .dash-route-row {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dash-root *,
          .dash-root *::before,
          .dash-root *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }

          .dash-animate {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
      <Footer />
    </main>
  );
}

function StatCard({
  delay,
  hint,
  icon,
  label,
  tone,
  value,
}: {
  delay: string;
  hint: string;
  icon: React.ReactNode;
  label: string;
  tone: "warning" | "gold";
  value: string;
}) {
  const numericDelay = parseFloat(delay);
  const isWarning = tone === "warning";
  
  const textHover = isWarning ? "group-hover:text-amber-400" : "group-hover:text-yellow-400";
  const bgHover = isWarning ? "group-hover:bg-amber-400/10" : "group-hover:bg-yellow-400/10";
  const gradient = isWarning ? "from-amber-500/10" : "from-yellow-500/10";
  const borderTop = isWarning ? "via-amber-500/20" : "via-yellow-500/20";
  const textColor = isWarning ? "text-amber-500/80" : "text-yellow-500/80";

  return (
    <motion.article 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: numericDelay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden group rounded-[20px] p-5 bg-[#0a0a0c]/80 border border-white/[0.05] flex flex-col justify-between min-h-[130px]"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px -10px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
      <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent ${borderTop} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
      
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 ${textHover} ${bgHover} transition-all duration-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`}>
            <div className="[&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</div>
          </div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">{label}</p>
        </div>
      </div>

      <div className="relative z-10 mt-4 flex flex-col justify-end">
        <span className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 leading-none">
          {value}
        </span>
        <span className={`text-[9px] font-bold uppercase tracking-wider mt-2 ${textColor}`}>{hint}</span>
      </div>
    </motion.article>
  );
}

function ProgressRow({
  delay,
  hint,
  label,
  percent,
  tone,
  value,
}: {
  delay: string;
  hint: string;
  label: string;
  percent: number;
  tone: "violet" | "cyan";
  value: string;
}) {
  return (
    <div className="dash-progress-row">
      <div className="dash-progress-head">
        <p className="dash-progress-label">{label}</p>
        <p className="dash-progress-value">{value}</p>
      </div>
      <div className="dash-progress-track" aria-hidden="true">
        <span className={`dash-progress-fill dash-progress-${tone}`} style={progressStyle(percent, delay)} />
      </div>
      <p className="dash-progress-hint">{hint}</p>
    </div>
  );
}

function RouteStep({
  badge,
  description,
  number,
  state,
  title,
}: {
  badge: string;
  description: string;
  number: string;
  state: "done" | "active" | "pending";
  title: string;
}) {
  return (
    <li className={`dash-route-step dash-route-step-${state}`}>
      <span className="dash-route-node">{state === "done" ? <Check /> : number}</span>
      <div className="dash-route-content">
        <div className="dash-route-row">
          <h3 className="dash-route-title">{title}</h3>
          <span className="dash-route-badge">{badge}</span>
        </div>
        <p className="dash-route-desc">{description}</p>
      </div>
    </li>
  );
}

function SessionCard({ session }: { session: RecentSession }) {
  const wpmTone = getWpmTone(session.wpm);
  const accTone = getAccuracyTone(session.accuracy);
  const wpmClass = wpmTone === "success" ? "dash-tone-success" : wpmTone === "warning" ? "dash-tone-warning-text" : "dash-tone-danger";
  const accClass = accTone === "success" ? "dash-pill-success" : accTone === "warning" ? "dash-pill-warning" : "dash-pill-danger";

  return (
    <article className="dash-session-card">
      <div className="dash-session-top">
        <div>
          <p className="dash-session-date">{session.label}</p>
          <p className="dash-session-kind">PRACTICE</p>
        </div>
        <span className="dash-session-key">
          <Keyboard />
        </span>
      </div>
      <div className="dash-session-metric">
        <span className={`dash-session-wpm ${wpmClass}`}>{Math.round(session.wpm)}</span>
        <span className="dash-session-unit">WPM</span>
      </div>
      <div className="dash-session-bottom">
        <span className={`dash-accuracy-pill ${accClass}`}>{Math.round(session.accuracy)}% ACC</span>
        <p className="dash-session-verdict">{getVerdict(session.wpm, session.accuracy)}</p>
      </div>
    </article>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const safeValues = values.length ? values : [9, 31, 22, 14];
  const min = Math.min(...safeValues);
  const max = Math.max(...safeValues);
  const range = Math.max(1, max - min);
  const points = safeValues
    .map((value, index) => {
      const x = 6 + (index * 104) / Math.max(1, safeValues.length - 1);
      const y = 34 - ((value - min) / range) * 24;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="dash-sparkline" viewBox="0 0 116 42" aria-label="WPM trend sparkline" role="img">
      <path d="M6 35H110" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {safeValues.map((value, index) => {
        const x = 6 + (index * 104) / Math.max(1, safeValues.length - 1);
        const y = 34 - ((value - min) / range) * 24;
        return <circle key={`${value}-${index}`} cx={x} cy={y} r="3" fill="currentColor" />;
      })}
    </svg>
  );
}
