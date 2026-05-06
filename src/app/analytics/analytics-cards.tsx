"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, BarChart3, ChevronDown, Download, Flame, Gauge,
  Keyboard, LineChart as LineChartIcon, Play, RefreshCcw, Sparkles, Target,
  TrendingUp, Zap, Trophy, BookOpen, Home, User, Command,
  ArrowUpRight, CheckCircle2, AlertTriangle, Info, Clock,
  Calendar, ChevronRight, Star, Award, TrendingDown,
  MousePointer2, Eye, Brain, Heart, Wind, Layers,
  Filter
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ComposedChart, Scatter, ZAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import type { 
  SnapshotMetric, GrowthPoint, SessionExtremes, PressureResponseModel, 
  CompositeScoreModel, FocusBand, SessionStaminaModel, StreakQualityModel, 
  SkillRadarDatum, WeakZoneModel, CoachInsight, PracticeSessionDatum, DailyAnalyticsDatum 
} from "./analytics-model";
import { SkillRadarCard } from "./SkillRadarCard";
import type { DailyStats } from "./SkillRadarCard";

export function AnimatedCounter({ value, duration = 1.5, suffix = "" }: any) {
  const [display, setDisplay] = useState<string | number>(0);

  useEffect(() => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      setDisplay(value);
      return;
    }
    const startTime = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = num * eased;
      setDisplay(Number.isInteger(num) ? Math.floor(current) : current.toFixed(1));
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplay(value);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{display}{suffix}</span>;
}

export function GlowCard({ children, className = "", hoverGlow = true, accentColor = "#8b5cf6" }: any) {
  return (
    <motion.div
      whileHover={hoverGlow ? { y: -4, scale: 1.01 } : {}}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/[0.04] bg-gradient-to-b from-[#141414]/90 to-[#0A0A0A]/90 backdrop-blur-xl transition-all duration-500",
        className
      )}
      style={{
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.02), 0 10px 30px -10px rgba(0,0,0,0.5)"
      }}
    >
      {}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
      
      {}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {}
      {hoverGlow && (
        <div className="absolute inset-0 opacity-0 transition-all duration-700 group-hover:opacity-100 pointer-events-none">
          <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-[60px]" style={{ backgroundColor: accentColor, opacity: 0.15 }} />
          <div className="absolute inset-0 rounded-3xl border transition-colors duration-500" style={{ borderColor: `${accentColor}30` }} />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

const getIcon = (label: string) => {
  if (label.toLowerCase().includes("wpm")) return Zap;
  if (label.toLowerCase().includes("accur")) return Target;
  if (label.toLowerCase().includes("focus")) return Brain;
  return Layers;
};

const formatAnalyticsDate = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthLabels[Number(match[2]) - 1] ?? match[2]} ${Number(match[3])}`;
};

export function KPICard({ metric, index }: { metric: SnapshotMetric; index: number }) {
  const Icon = getIcon(metric.label);
  const trendDir = metric.delta >= 0 ? "up" : "down";
  const sparkline = Array.isArray(metric.sparkline) ? metric.sparkline : [];
  const chartData = sparkline.map((v, i) => ({ i, v }));
  const hasMetricValue = Number.isFinite(Number(metric.value));
  const hasChartData = chartData.length > 1;
  const formattedDelta = `${metric.delta > 0 ? '+' : ''}${metric.delta}${metric.unit === '%' ? '%' : ''}`;
  const gradientId = `kpi-area-${metric.label.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${index}`;
  const glowId = `kpi-glow-${metric.label.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${index}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.006 }}
      className="group h-full rounded-[1.35rem]"
    >
      <div
        className="relative flex min-h-[15.5rem] h-full flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.075] bg-[#101113] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.045)] transition-all duration-500 group-hover:border-white/[0.13]"
        style={{
          backgroundImage: `radial-gradient(circle at 88% 12%, ${metric.accent}22, transparent 34%), radial-gradient(circle at 12% 0%, rgba(255,255,255,0.055), transparent 28%), linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.012) 34%, rgba(0,0,0,0.18))`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle at 78% 14%, ${metric.accent}24, transparent 34%)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-px opacity-75"
          aria-hidden="true"
          style={{ background: `linear-gradient(90deg, transparent, ${metric.accent}66, transparent)` }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.018]"
          aria-hidden="true"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 0.7px, transparent 0.7px)",
            backgroundSize: "14px 14px",
          }}
        />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-black/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 14px 34px ${metric.accent}12` }}
            >
              <div className="absolute inset-0 rounded-xl opacity-[0.16]" style={{ backgroundColor: metric.accent }} />
              <Icon className="h-4 w-4 relative z-10" style={{ color: metric.accent }} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-[11px] font-black uppercase tracking-[0.24em] text-zinc-300/80">{metric.label}</span>
              <span className="mt-1 block truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{metric.quality}</span>
              {metric.context && (
                <span
                  className="mt-2 inline-flex max-w-full truncate rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]"
                  style={{
                    backgroundColor: `${metric.accent}10`,
                    borderColor: `${metric.accent}26`,
                    color: metric.accent,
                  }}
                >
                  {metric.context}
                </span>
              )}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.86, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.22, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
              trendDir === "up" ? "border-emerald-400/20 bg-emerald-400/[0.075] text-emerald-300" : "border-red-400/20 bg-red-400/[0.075] text-red-300"
            )}
          >
            {trendDir === "up" ? <TrendingUp className="h-3 w-3" strokeWidth={2.5} /> : <TrendingDown className="h-3 w-3" strokeWidth={2.5} />}
            {formattedDelta}
          </motion.div>
        </div>

        <div className="relative z-10 mt-7 flex items-end justify-between gap-4">
          {hasMetricValue ? (
            <div className="flex items-end gap-2">
              <div className="font-mono text-[3.2rem] font-black leading-[0.86] text-white">
                <AnimatedCounter value={metric.value} suffix={metric.unit === 'WPM' ? '' : metric.unit} />
              </div>
              {metric.unit === 'WPM' && <span className="pb-1 text-sm font-bold uppercase tracking-wide text-zinc-500">WPM</span>}
            </div>
          ) : (
            <div className="h-12 w-32 animate-pulse rounded-xl bg-white/[0.06]" />
          )}
        </div>

        <div className="relative z-10 mt-5 h-[4.75rem] w-full overflow-hidden">
          {hasChartData ? (
            <>
              <div
                className="pointer-events-none absolute inset-x-10 bottom-0 h-8 rounded-full blur-2xl"
                style={{ backgroundColor: metric.accent, opacity: 0.08 }}
                aria-hidden="true"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#101113] to-transparent" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#101113] to-transparent" aria-hidden="true" />
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 4, bottom: 4, left: 4 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={metric.accent} stopOpacity={0.18} />
                      <stop offset="70%" stopColor={metric.accent} stopOpacity={0.035} />
                      <stop offset="100%" stopColor={metric.accent} stopOpacity={0} />
                    </linearGradient>
                    <filter id={glowId} x="-10%" y="-60%" width="120%" height="220%">
                      <feGaussianBlur stdDeviation="1.4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={metric.accent}
                    strokeWidth={2.25}
                    fill={`url(#${gradientId})`}
                    filter={`url(#${glowId})`}
                    isAnimationActive={true}
                    animationBegin={index * 80}
                    animationDuration={1100}
                    animationEasing="ease-out"
                    dot={false}
                    activeDot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="flex h-full items-end gap-2">
              <div className="h-8 flex-1 animate-pulse rounded-lg bg-white/[0.05]" />
              <div className="h-12 flex-1 animate-pulse rounded-lg bg-white/[0.035]" />
              <div className="h-9 flex-1 animate-pulse rounded-lg bg-white/[0.045]" />
              <div className="h-14 flex-1 animate-pulse rounded-lg bg-white/[0.03]" />
            </div>
          )}
        </div>

        <div className="relative z-10 mt-4 border-t border-white/[0.055] pt-4">
          {metric.helper ? (
            <div className="flex items-start gap-2.5">
              <div
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: metric.accent, boxShadow: `0 0 16px ${metric.accent}70` }}
                aria-hidden="true"
              />
              <p className="text-[12px] font-medium leading-relaxed text-zinc-400 line-clamp-2">
                {metric.helper}
              </p>
            </div>
          ) : (
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-white/[0.05]" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function PerformanceChart({ data }: { data: GrowthPoint[] }) {
  const [activeRange, setActiveRange] = useState("30D");
  const [visibleSeries, setVisibleSeries] = useState({ accuracy: true, focus: true, wpm: true });
  const ranges = ["7D", "30D", "90D"];
  const rangeLength = activeRange === "7D" ? 7 : activeRange === "90D" ? 90 : 30;
  const v = data.slice(-rangeLength);
  const activePoints = v.filter((point) => point.sessions > 0);
  const hasPerformanceSignal = activePoints.length >= 2;
  const seriesControls = [
    { key: "wpm", label: "Speed", color: "#A855F7", unit: " WPM" },
    { key: "accuracy", label: "Accuracy", color: "#22C55E", unit: "%" },
    { key: "focus", label: "Focus", color: "#FBBF24", unit: "" },
  ] as const;
  const toggleSeries = (key: keyof typeof visibleSeries) => {
    setVisibleSeries((current) => {
      const activeCount = Object.values(current).filter(Boolean).length;
      if (current[key] && activeCount === 1) return current;
      return { ...current, [key]: !current[key] };
    });
  };

  return (
    <motion.div className="lg:col-span-8 h-full" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
      <GlowCard className="p-6 h-full flex flex-col">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-600">Performance Observatory</p>
            <h2 className="mt-1 text-xl font-bold text-white">Velocity · Precision · Focus</h2>
            <p className="mt-1 text-sm text-zinc-500">Typing speed, accuracy, and focus over time.</p>
          </div>
          <div className="flex items-center gap-2">
            {ranges.map((r) => (
              <button key={r} onClick={() => setActiveRange(r)}
                className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200", 
                  activeRange === r ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]")}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          {seriesControls.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleSeries(item.key)}
              aria-pressed={visibleSeries[item.key]}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition",
                visibleSeries[item.key] ? "opacity-100" : "opacity-40 grayscale hover:opacity-70"
              )}
              style={{ borderColor: `${item.color}25`, backgroundColor: `${item.color}10`, color: item.color }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />{item.label}
            </button>
          ))}
        </div>

        <div className="h-[360px]">
          {hasPerformanceSignal ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={v} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} strokeDasharray="3 6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={formatAnalyticsDate} tick={{ fill: "#52525b", fontSize: 12, fontFamily: "JetBrains Mono" }} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload) return null;
                  return (
                    <div className="rounded-2xl border border-white/10 bg-[#1E1E1E]/95 p-4 shadow-2xl backdrop-blur-xl">
                      <p className="text-sm font-bold text-white mb-3">{formatAnalyticsDate(String(label))}</p>
                      {payload
                        .filter((p) => visibleSeries[p.dataKey as keyof typeof visibleSeries])
                        .map((p) => {
                          const control = seriesControls.find((item) => item.key === p.dataKey);
                          return (
                        <div key={p.dataKey} className="flex items-center justify-between gap-8 text-sm mb-1">
                          <span className="flex items-center gap-2 text-zinc-400"><span className="h-2 w-2 rounded-full" style={{ background: p.color }} />{control?.label ?? p.dataKey}</span>
                          <span className="font-mono font-bold text-white">{Math.round(p.value as number)}{control?.unit ?? ""}</span>
                        </div>
                          );
                        })}
                    </div>
                  );
                }} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeDasharray: "4 4" }} />
                <defs><linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#A855F7" stopOpacity={0.15} /><stop offset="100%" stopColor="#A855F7" stopOpacity={0} /></linearGradient></defs>
                {visibleSeries.wpm && <Area type="monotone" dataKey="wpm" stroke="#A855F7" strokeWidth={3} fill="url(#wpmGrad)" dot={{ r: 4, fill: "#A855F7", stroke: "#141414", strokeWidth: 2 }} activeDot={{ r: 8, fill: "#A855F7", stroke: "#fff", strokeWidth: 2 }} />}
                {visibleSeries.accuracy && <Line type="monotone" dataKey="accuracy" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 3, fill: "#22C55E", stroke: "#141414", strokeWidth: 2 }} activeDot={{ r: 7, fill: "#22C55E", stroke: "#fff", strokeWidth: 2 }} />}
                {visibleSeries.focus && <Line type="monotone" dataKey="focus" stroke="#FBBF24" strokeWidth={2.5} dot={{ r: 3, fill: "#FBBF24", stroke: "#141414", strokeWidth: 2 }} activeDot={{ r: 7, fill: "#FBBF24", stroke: "#fff", strokeWidth: 2 }} />}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.025] px-6 text-center">
              <div>
                <p className="text-base font-black text-white">Do 3 more sessions to unlock this insight.</p>
                <p className="mt-2 text-sm text-zinc-500">Velocity, precision, and focus need a few active days before the trend becomes useful.</p>
              </div>
            </div>
          )}
        </div>
      </GlowCard>
    </motion.div>
  );
}

export function SessionIntelligence({ sessionExtremes, pressure }: { sessionExtremes: SessionExtremes; pressure: PressureResponseModel }) {
  const recoveryMatch = String(pressure.recoveryWindow).match(/^([+-]?\d+(?:\.\d+)?\s*[a-z%]*)\s*(.*)$/i);
  const recoveryValue = recoveryMatch?.[1]?.replace(/\s+/g, "") || pressure.recoveryWindow;
  const recoveryDetail = recoveryMatch?.[2] || "stabilization";
  const cards = [
    { icon: Zap, title: "Peak Velocity", value: Math.round(sessionExtremes.personalBestWpm), unit: "WPM", detail: "", subtitle: "Personal best", color: "#A855F7", trend: "+12%", info: "Peak Velocity: your fastest clean speed ceiling so far." },
    { icon: Target, title: "Accuracy Drift", value: "-2.1", unit: "%", detail: "", subtitle: "After 20min", color: "#22C55E", trend: "Stable", info: "Accuracy Drift: how much precision changes as the session gets longer." },
    { icon: Clock, title: "Recovery", value: recoveryValue, unit: "", detail: recoveryDetail, subtitle: "Post-error", color: "#FBBF24", trend: "Fast", info: "Recovery: error ke baad pace kitni jaldi normal hota hai." },
  ];

  return (
    <div className="grid gap-4 lg:col-span-4">
      {cards.map((card, i) => (
        <motion.div key={card.title} className="h-full" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}>
          <GlowCard className="p-5 h-full min-h-[11rem]" hoverGlow={true}>
            <div className="flex items-center justify-between mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="h-5 w-5" style={{ color: card.color }} strokeWidth={1.5} />
              </div>
              <div className="flex items-center gap-2">
                <div className="group/info relative">
                  <button type="button" className="grid h-7 w-7 place-items-center rounded-full border border-white/[0.08] bg-white/[0.035] text-zinc-500 transition hover:text-white" aria-label={`${card.title} info`}>
                    <Info className="h-3.5 w-3.5" />
                  </button>
                  <div className="pointer-events-none absolute right-0 top-8 z-30 w-52 rounded-2xl border border-white/10 bg-[#111315]/95 p-3 text-xs font-medium leading-relaxed text-zinc-300 opacity-0 shadow-2xl backdrop-blur-xl transition group-hover/info:opacity-100">
                    {card.info}
                  </div>
                </div>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">Live</span>
              </div>
            </div>
            <p className="text-sm font-medium text-zinc-500">{card.title}</p>
            <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-mono text-3xl font-black leading-none text-white">
                <AnimatedCounter value={card.value} />
              </span>
              {card.unit && <span className="text-sm font-medium text-zinc-600">{card.unit}</span>}
              {card.detail && <span className="text-sm font-semibold text-zinc-400">{card.detail}</span>}
            </div>
            <div className="mt-3 flex items-center gap-2"><span className="text-xs font-bold" style={{ color: card.color }}>{card.trend}</span><span className="text-xs text-zinc-600">· {card.subtitle}</span></div>
          </GlowCard>
        </motion.div>
      ))}
    </div>
  );
}

const radarMonthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getDateParts = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return {
    day: Number(match[3]),
    month: Number(match[2]) - 1,
    year: Number(match[1]),
  };
};

const getDailyRadarScore = (day: DailyAnalyticsDatum) => {
  const wpmScore = Math.max(0, Math.min(100, day.wpm));
  const accuracyScore = Math.max(0, Math.min(100, day.accuracy));
  const sessionLift = Math.min(10, Math.max(0, day.sessions - 1) * 2);
  return Math.round(Math.min(100, accuracyScore * 0.68 + wpmScore * 0.28 + sessionLift));
};

export function SkillMatrix({ data, dailyData = [] }: { data: SkillRadarDatum[]; dailyData?: DailyAnalyticsDatum[] }) {
  const averageSkill = data.length
    ? Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length)
    : 0;

  type ParsedDaily = { day: DailyAnalyticsDatum; parts: NonNullable<ReturnType<typeof getDateParts>> };
  const parsedDaily = dailyData.reduce<ParsedDaily[]>((items, day) => {
    const parts = getDateParts(day.date);
    if (parts) items.push({ day, parts });
    return items;
  }, []);

  const latestParts = parsedDaily.reduce<ReturnType<typeof getDateParts>>((latest, item) => {
    const parts = item.parts;
    if (!latest) return parts;
    if (parts.year > latest.year) return parts;
    if (parts.year === latest.year && parts.month > latest.month) return parts;
    if (parts.year === latest.year && parts.month === latest.month && parts.day > latest.day) return parts;
    return latest;
  }, null);

  const initialYear = latestParts?.year ?? 2024;
  const initialMonthIndex = latestParts?.month ?? 11;
  const yearOptions = Array.from(new Set(parsedDaily.map((item) => item.parts.year))).sort((a, b) => b - a);
  if (!yearOptions.length) yearOptions.push(initialYear);

  const dailyStatsByDate: Record<string, DailyStats> = {};
  parsedDaily.forEach(({ day }) => {
    dailyStatsByDate[day.date] = {
      date: day.date,
      score: getDailyRadarScore(day),
      wpm: Math.round(day.wpm),
      accuracy: Math.round(day.accuracy),
      sessions: day.sessions,
      minutes: Math.round(day.time)
    };
  });

  const getMonthlyScore = (year: number, monthIndex: number) => {
    const monthDays = parsedDaily.filter((item) => item.parts.year === year && item.parts.month === monthIndex);
    const activeDays = monthDays
      .map((item) => item.day)
      .filter((day) => day.sessions > 0 || day.lessons > 0 || day.time > 0);
    return activeDays.length
      ? Math.round(activeDays.reduce((sum, day) => sum + getDailyRadarScore(day), 0) / activeDays.length)
      : 0;
  };

  const renderRadar = (mode: 'monthly' | 'daily', activeScore: number | undefined, selectedYear: number, selectedMonthIndex: number, selectedDay: number | null) => {
    const sData = radarMonthLabels.map((month, index) => {
      const monthDays = parsedDaily.filter((item) => item.parts.year === selectedYear && item.parts.month === index);
      const activeDays = monthDays
        .map((item) => item.day)
        .filter((day) => day.sessions > 0 || day.lessons > 0 || day.time > 0);
      const source = data[index % Math.max(data.length, 1)];
      const sourceScore = source ? Math.round(source.value) : averageSkill;
      const seasonalLift = Math.round(Math.sin((index + 1) * 0.92) * 7 + Math.cos(index * 0.47) * 4);
      const fallbackScore = Math.max(18, Math.min(99, Math.round(sourceScore * 0.72 + averageSkill * 0.28 + seasonalLift)));
      const realScore = activeDays.length
        ? Math.round(activeDays.reduce((sum, day) => sum + getDailyRadarScore(day), 0) / activeDays.length)
        : 0;
      const score = activeDays.length ? realScore : 0;
      const benchmark = Math.max(14, Math.min(94, Math.round(averageSkill * 0.74 + 12 + Math.cos(index * 0.7) * 5)));
  
      return {
        activeDays,
        benchmark,
        daysInMonth: new Date(selectedYear, index + 1, 0).getDate(),
        fallbackScore,
        index,
        month,
        monthDays,
        realScore,
        score,
      };
    });

    const isDaily = mode === 'daily' && activeScore !== undefined;
    
    const finalRadarData = isDaily
      ? sData.map((item) => ({
          ...item,
          benchmark: item.score,
          score: item.index === selectedMonthIndex ? activeScore : 0,
          displayScore: item.index === selectedMonthIndex ? activeScore : item.score,
        }))
      : sData.map((item) => ({ ...item, displayScore: item.score }));

    const centerScore = isDaily ? activeScore : sData[selectedMonthIndex]?.score ?? 0;
    const centerLabel = isDaily ? `${sData[selectedMonthIndex]?.month} ${selectedDay}` : sData[selectedMonthIndex]?.month ?? "Avg";

    return (
      <div className="relative mx-auto aspect-square w-full max-w-[360px] shrink-0">
        <div className="pointer-events-none absolute inset-8 rounded-full bg-cyan-400/[0.045] blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-200/15 bg-[#0f1218]/90 shadow-[0_0_34px_rgba(103,232,249,0.12)]">
          <div className="text-center">
            <p className="font-mono text-lg font-black leading-none text-white">{centerScore}</p>
            <p className="mt-1 text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">{centerLabel}</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={finalRadarData} cx="50%" cy="50%" outerRadius="58%" margin={{ top: 30, right: 38, bottom: 30, left: 38 }}>
          <defs>
            <linearGradient id="monthlyRadarScore" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.42} />
              <stop offset="52%" stopColor="#8b5cf6" stopOpacity={0.34} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="dailyRadarScore" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f472b6" stopOpacity={0.65} />
              <stop offset="100%" stopColor="#ec4899" stopOpacity={0.15} />
            </linearGradient>
            <linearGradient id="monthlyRadarBenchmark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f8fafc" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <PolarGrid stroke="rgba(148,163,184,0.18)" radialLines={true} />
          <PolarAngleAxis
            dataKey="month"
            tick={({ cx, cy, x, y, textAnchor, index, ...props }) => {
              const item = finalRadarData[index];
              if (!item || typeof x !== "number" || typeof y !== "number" || typeof cx !== "number" || typeof cy !== "number") return <g />;

              const dx = x - cx;
              const dy = y - cy;
              const length = Math.sqrt(dx * dx + dy * dy) || 1;
              const pushOut = 16; 
              const finalX = x + (dx / length) * pushOut;
              const finalY = y + (dy / length) * pushOut;

              return (
                <g>
                  <text
                    x={finalX}
                    y={finalY + (index === 0 ? -12 : 2)}
                    textAnchor={textAnchor}
                    fontSize={12}
                    fontWeight={800}
                    {...props}
                    fill="#e0f2fe"
                  >
                    <tspan fill="#e0f2fe">{item.displayScore}</tspan>
                    <tspan fill="#8b5cf6">/100</tspan>
                    <tspan x={finalX} dy="1rem" fontSize={11} fontWeight={800} fill="#60a5fa">
                      {item.month}
                    </tspan>
                  </text>
                </g>
              );
            }}
          />
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0]?.payload as typeof sData[number];
            return (
              <div className="rounded-2xl border border-white/10 bg-[#111315]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{item.month}</p>
                <p className="mt-2 font-mono text-2xl font-black text-white">{item.score}<span className="text-sm text-zinc-500">/100</span></p>
                <p className="mt-1 text-xs font-semibold text-zinc-500">{item.activeDays.length}/{item.daysInMonth} active days</p>
              </div>
            );
          }} cursor={false} />
          <Radar dataKey="benchmark" fill="url(#monthlyRadarBenchmark)" fillOpacity={0.72} stroke="#94a3b8" strokeOpacity={0.45} strokeWidth={1.6} />
          <Radar 
            name={isDaily ? "Daily score" : "Monthly score"} 
            dataKey="score" 
            stroke={isDaily ? "#f472b6" : "#67e8f9"} 
            strokeWidth={isDaily ? 3.5 : 2.7} 
            fill={isDaily ? "url(#dailyRadarScore)" : "url(#monthlyRadarScore)"} 
            fillOpacity={0.76} 
          />
        </RadarChart>
      </ResponsiveContainer>
      </div>
    );
  };

  return (
    <motion.div className="lg:col-span-5 h-full" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
      <SkillRadarCard
        yearOptions={yearOptions}
        monthOptions={radarMonthLabels}
        dailyStatsByDate={dailyStatsByDate}
        initialYear={initialYear}
        initialMonthIndex={initialMonthIndex}
        monthlyStats={{ monthScore: getMonthlyScore(initialYear, initialMonthIndex) }}
        getMonthlyScore={getMonthlyScore}
        renderRadar={renderRadar}
      />
    </motion.div>
  );
}

const keyboardKeys = [
  { row: 1, keys: [
    { k: "`", w: 1 }, { k: "1", err: 2, level: "watch" }, { k: "2", w: 1 }, { k: "3", w: 1 }, { k: "4", w: 1 },
    { k: "5", w: 1 }, { k: "6", w: 1 }, { k: "7", w: 1 }, { k: "8", w: 1 }, { k: "9", w: 1 }, { k: "0", err: 5, level: "high" },
    { k: "-", w: 1 }, { k: "=", w: 1 }, { k: "⌫", w: 2 },
  ]},
  { row: 2, keys: [
    { k: "Tab", w: 1.5 }, { k: "Q", err: 8, level: "high" }, { k: "W", w: 1 }, { k: "E", w: 1 }, { k: "R", w: 1 },
    { k: "T", err: 3, level: "watch" }, { k: "Y", err: 4, level: "watch" }, { k: "U", w: 1 }, { k: "I", w: 1 },
    { k: "O", err: 12, level: "critical" }, { k: "P", err: 15, level: "critical" }, { k: "[", w: 1 }, { k: "]", w: 1 }, { k: "\\", w: 1.5 },
  ]},
  { row: 3, keys: [
    { k: "Caps", w: 1.8 }, { k: "A", w: 1 }, { k: "S", w: 1 }, { k: "D", w: 1 }, { k: "F", w: 1 },
    { k: "G", err: 3, level: "watch" }, { k: "H", w: 1 }, { k: "J", w: 1 }, { k: "K", w: 1 },
    { k: "L", err: 11, level: "critical" }, { k: ";", err: 9, level: "high" }, { k: "'", w: 1 }, { k: "Enter", w: 2.2 },
  ]},
  { row: 4, keys: [
    { k: "Shift", w: 2.4 }, { k: "Z", err: 7, level: "high" }, { k: "X", err: 6, level: "high" }, { k: "C", w: 1 },
    { k: "V", w: 1 }, { k: "B", err: 4, level: "watch" }, { k: "N", err: 5, level: "high" }, { k: "M", err: 3, level: "watch" },
    { k: ",", w: 1 }, { k: ".", w: 1 }, { k: "/", err: 10, level: "critical" }, { k: "Shift ", w: 2.4 },
  ]},
  { row: 5, keys: [
    { k: "Ctrl", w: 1.3 }, { k: "Fn", w: 1 }, { k: "Alt", w: 1.3 }, { k: "Space", w: 6.5 },
    { k: "Alt ", w: 1.3 }, { k: "Fn ", w: 1 }, { k: "Ctrl ", w: 1.3 },
  ]},
];

const normalizeKeyboardKey = (key: string) => {
  const trimmed = key.trim();
  if (trimmed === "Space") return " ";
  if (trimmed === "⌫") return "backspace";
  return trimmed.toLowerCase();
};

const getHeatLevel = (count: number, maxCount: number): "clean" | "stable" | "watch" | "high" | "critical" => {
  if (count <= 0) return "clean";
  const ratio = count / Math.max(maxCount, 1);
  if (ratio >= 0.78) return "critical";
  if (ratio >= 0.52) return "high";
  if (ratio >= 0.28) return "watch";
  if (count > 0) return "stable";
  return "clean";
};

const keyTone = {
  clean: { accent: "#3f4654", bg: "#15171b", border: "rgba(255,255,255,0.075)", text: "#7d8491" },
  stable: { accent: "#2563eb", bg: "#152033", border: "rgba(59,130,246,0.26)", text: "#bfdbfe" },
  watch: { accent: "#0891b2", bg: "#102a32", border: "rgba(34,211,238,0.32)", text: "#cffafe" },
  high: { accent: "#d97706", bg: "#302312", border: "rgba(245,158,11,0.38)", text: "#fde68a" },
  critical: { accent: "#e11d48", bg: "#351620", border: "rgba(244,63,94,0.42)", text: "#ffe4e8" },
};

export function KeyboardVisualizer({ telemetryMode, heatmapData = {} }: { telemetryMode: "live" | "preview"; heatmapData?: Record<string, number> }) {
  const [selectedKey, setSelectedKey] = useState<string|null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const hasLiveHeatmap = Object.values(heatmapData).some((value) => value > 0);
  const previewCounts = keyboardKeys.flatMap((row) => row.keys.map((key: any) => key.err ?? 0));
  const liveCounts = Object.values(heatmapData);
  const maxMistakes = Math.max(1, ...(hasLiveHeatmap ? liveCounts : previewCounts));
  const enrichedRows = keyboardKeys.map((row) => ({
    ...row,
    keys: row.keys.map((key: any) => {
      const telemetryKey = normalizeKeyboardKey(key.k);
      const liveCount = heatmapData[telemetryKey] ?? 0;
      const err = hasLiveHeatmap ? liveCount : (key.err ?? 0);
      return {
        ...key,
        err,
        level: getHeatLevel(err, maxMistakes),
        telemetryKey,
      };
    }),
  }));
  const topProblemKeys = Object.entries(
    hasLiveHeatmap
      ? heatmapData
      : Object.fromEntries(
          keyboardKeys
            .flatMap((row) => row.keys)
            .filter((key: any) => key.err)
            .map((key: any) => [normalizeKeyboardKey(key.k), key.err])
        )
  )
    .filter(([, count]) => count > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);

  const getKeyStyle = (key: any) => {
    const tone = showHeatmap ? keyTone[key.level as keyof typeof keyTone] : keyTone.clean;
    return {
      background: `linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.018) 45%, rgba(0,0,0,0.18)), ${tone.bg}`,
      borderColor: tone.border,
      boxShadow: key.err > 0 ? `inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -10px 18px rgba(0,0,0,0.16), 0 10px 24px rgba(0,0,0,0.24), 0 0 16px ${tone.accent}18` : "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -10px 18px rgba(0,0,0,0.18), 0 10px 22px rgba(0,0,0,0.22)",
      color: tone.text,
    };
  };

  return (
    <motion.div className="lg:col-span-7 h-full w-full" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
      <GlowCard className="p-6 h-full flex flex-col justify-center">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-zinc-600">Keyboard Analysis</p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-white">Keyboard Heatmap</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHeatmap(!showHeatmap)} className={cn("rounded-full px-3 py-1.5 text-[11px] font-black transition", showHeatmap ? "border border-cyan-300/20 bg-cyan-300/10 text-cyan-100" : "text-zinc-500 border border-white/[0.08]")}>
              Heatmap
            </button>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[11px] font-black text-zinc-500">
              {hasLiveHeatmap || telemetryMode === "live" ? "Live" : "Preview"}
            </span>
          </div>
        </div>

        {topProblemKeys.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">Top Problem Keys</span>
            {topProblemKeys.map(([key, count]) => {
              const level = getHeatLevel(count, maxMistakes);
              const tone = keyTone[level];
              return (
                <button
                  key={key}
                  type="button"
                  className="rounded-xl border px-3 py-1.5 font-mono text-xs font-black"
                  style={{ borderColor: tone.border, backgroundColor: tone.bg, color: tone.text }}
                  onClick={() => setSelectedKey(key === " " ? "Space" : key.toUpperCase())}
                >
                  {key === " " ? "Space" : key.toUpperCase()} {count}
                </button>
              );
            })}
          </div>
        )}

        <div className="rounded-[1.75rem] border border-[#22252c] bg-[#090a0d] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
          <div className="space-y-1.5">
          {enrichedRows.map((row) => (
            <div key={row.row} className="flex justify-center gap-1.5">
              {row.keys.map((key: any) => {
                const w = key.w || 1;
                return (
                <motion.button key={key.k} whileHover={{ y: -2, scale: 1.035, zIndex: 10 }} whileTap={{ scale: 0.97 }} onClick={() => setSelectedKey(selectedKey === key.k ? null : key.k)}
                  className="relative flex items-center justify-center rounded-xl border font-mono text-xs font-black transition-all duration-200 cursor-pointer select-none"
                  style={{ ...getKeyStyle(key), width: `${w * 32 + (w - 1) * 5}px`, height: "39px", minWidth: "32px" }}>
                  <span>{key.k.trim()}</span>
                  <AnimatePresence>
                    {selectedKey === key.k && (
                      <motion.div initial={{ opacity: 0, y: 5, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.94 }} className="absolute -top-24 left-1/2 z-20 w-40 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#111315]/95 p-3 text-left shadow-2xl backdrop-blur-xl">
                        <p className="text-xs font-black text-white">{key.k.trim() || "Space"}</p>
                        <p className="mt-1 text-[10px] font-bold" style={{ color: keyTone[key.level as keyof typeof keyTone].accent }}>{key.err} mistakes</p>
                        <p className="mt-1 text-[10px] capitalize text-zinc-500">{key.level} friction</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
                )
              })}
            </div>
          ))}
          </div>
        </div>

      </GlowCard>
    </motion.div>
  );
}

export function AICoachPanel({ insights }: { insights: CoachInsight[] }) {
  const getIcon = (tone: string) => tone === "accent" ? Star : tone === "amber" ? Eye : Wind;
  return (
    <motion.div className="h-full" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
      <GlowCard className="p-6 h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10"><Sparkles className="h-5 w-5 text-violet-400" /></div>
          <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-400">AI Coach</p><p className="text-xs text-zinc-600">Personalized insights</p></div>
        </div>
        <div className="space-y-3">
          {insights.slice(0, 3).map((insight, i) => {
            const Icon = getIcon(insight.tone);
            const priority = i === 0 ? "Big win" : i === 1 ? "Quick fix" : "Long-term";
            const actionLabel = insight.title.toLowerCase().includes("key")
              ? "Start weak-key drill"
              : insight.title.toLowerCase().includes("session")
                ? "Try short session"
                : "Start practice";
            return (
              <motion.div key={insight.title} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }} className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/[0.10]">
                <div className="flex gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.05]"><Icon className="h-4 w-4 text-violet-400" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-white text-sm">{insight.title}</h3>
                      <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", i === 0 ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400" : i === 1 ? "border-amber-400/20 bg-amber-400/10 text-amber-400" : "border-cyan-400/20 bg-cyan-400/10 text-cyan-400")}>{priority}</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 leading-relaxed">{insight.body}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-600">Recommendation</span>
                      <a href="/practice" className="flex items-center gap-1 rounded-lg border border-white/[0.08] px-2.5 py-1 text-[10px] font-bold text-zinc-400 transition hover:bg-white/[0.05] hover:text-white">{actionLabel} <ChevronRight className="h-3 w-3" /></a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-violet-300/[0.12] bg-[radial-gradient(circle_at_20%_0%,rgba(139,92,246,0.16),transparent_38%),rgba(255,255,255,0.025)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-black tracking-[-0.02em] text-white">Need a plan instead of random practice?</h3>
            <p className="mt-1 max-w-2xl text-sm font-medium text-zinc-500">Let the AI coach design a 7-day routine from your speed, weak keys, focus and load.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <motion.a href="/practice" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-zinc-200"><Play className="h-4 w-4" /> Generate Practice Plan</motion.a>
            <motion.a href="/practice" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm font-black text-zinc-300 transition hover:bg-white/[0.06] hover:text-white">Preview drills</motion.a>
          </div>
        </div>
      </GlowCard>
    </motion.div>
  );
}

export function SessionTable({ sessions }: { sessions: PracticeSessionDatum[] }) {
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [modeFilter, setModeFilter] = useState("all");
  const headers = [ { key: "date", label: "Session" }, { key: "mode", label: "Mode" }, { key: "wpm", label: "WPM" }, { key: "accuracy", label: "Accuracy" }, { key: "errors", label: "Errors" }, { key: "duration", label: "Duration" } ];
  const modeOptions = ["all", ...Array.from(new Set(sessions.map((session) => session.type || "Practice")))];
  
  const handleSort = (field: string) => { if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortField(field); setSortDir("desc"); } };
  const filteredSessions = modeFilter === "all" ? sessions : sessions.filter((session) => (session.type || "Practice") === modeFilter);
  const sorted = [...filteredSessions].sort((a, b) => {
    const av = sortField === "date" ? new Date(a.sessionDate).getTime() : sortField === "wpm" ? a.wpm : sortField === "accuracy" ? a.accuracy : sortField === "errors" ? a.totalErrors : a.sessionDuration;
    const bv = sortField === "date" ? new Date(b.sessionDate).getTime() : sortField === "wpm" ? b.wpm : sortField === "accuracy" ? b.accuracy : sortField === "errors" ? b.totalErrors : b.sessionDuration;
    return sortDir === "desc" ? bv - av : av - bv;
  }).slice(0, 10);

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
      <GlowCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-600">Session History</p><h2 className="mt-1 text-xl font-bold text-white">Recent Practice Sessions</h2></div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-bold text-zinc-400 transition hover:bg-white/[0.05]">
              <Filter className="h-3.5 w-3.5" />
              <select
                aria-label="Filter sessions by mode"
                className="bg-transparent text-xs font-bold uppercase outline-none"
                value={modeFilter}
                onChange={(event) => setModeFilter(event.target.value)}
              >
                {modeOptions.map((mode) => (
                  <option key={mode} value={mode} className="bg-[#111315] text-zinc-100">
                    {mode === "all" ? "All modes" : mode}
                  </option>
                ))}
              </select>
            </label>
            <button className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-bold text-zinc-400 transition hover:bg-white/[0.05]"><Download className="h-3.5 w-3.5" />Export</button>
          </div>
        </div>
        <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-white/[0.06]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {headers.map((h) => (
                  <th key={h.key} onClick={() => handleSort(h.key)} className="cursor-pointer px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-600 transition hover:text-zinc-400 whitespace-nowrap">
                    <span className="flex items-center gap-1">{h.label}{sortField === h.key && <motion.span animate={{ rotate: sortDir === "asc" ? 0 : 180 }} className="text-zinc-500">↑</motion.span>}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((session, i) => (
                <motion.tr key={session.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="border-t border-white/[0.04] text-zinc-400 transition hover:bg-white/[0.03]">
                  <td className="px-4 py-4 min-w-[120px]"><div><p className="text-sm font-medium text-white">{new Date(session.sessionDate).toLocaleDateString()}</p></div></td>
                  <td className="px-4 py-4 min-w-[100px]"><span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold uppercase"><div className={cn("h-1.5 w-1.5 rounded-full", session.type === "Race" ? "bg-violet-400" : session.type === "Test" ? "bg-amber-400" : "bg-emerald-400")} />{session.type || "Practice"}</span></td>
                  <td className="px-4 py-4 font-mono text-sm font-bold text-white">{Math.round(session.wpm)}</td>
                  <td className="px-4 py-4 min-w-[100px]"><span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-xs font-bold", session.accuracy >= 95 ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400" : session.accuracy >= 85 ? "border-amber-400/20 bg-amber-400/10 text-amber-400" : "border-red-400/20 bg-red-400/10 text-red-400")}>{session.accuracy >= 95 && <CheckCircle2 className="h-3 w-3" />}{Math.round(session.accuracy)}%</span></td>
                  <td className="px-4 py-4 font-mono text-sm">{session.totalErrors}</td>
                  <td className="px-4 py-4 text-sm text-zinc-600 min-w-[80px]">{Math.ceil(session.sessionDuration / 60)}m</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowCard>
    </motion.div>
  );
}

export function WeakZonesPanel({ zones }: { zones: WeakZoneModel[] }) {
  const maxLoad = Math.max(1, ...zones.map((zone) => zone.load));
  const formatKey = (key: string) => key === " " ? "Space" : key.toUpperCase();
  const getImpact = (load: number) => {
    const ratio = load / maxLoad;
    if (ratio >= 0.72) return { label: "High", className: "border-red-400/20 bg-red-400/10 text-red-300" };
    if (ratio >= 0.38) return { label: "Medium", className: "border-amber-400/20 bg-amber-400/10 text-amber-300" };
    return { label: "Watch", className: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300" };
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
      <GlowCard className="p-6">
        <div className="mb-6"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-600">Focus Areas</p><h2 className="mt-1 text-xl font-bold text-white">Keys Requiring Attention</h2></div>
        {zones.length > 0 ? (
          <div className="space-y-4">
            {zones.map((zone, i) => {
              const impact = getImpact(zone.load);

              return (
                <motion.div key={zone.label} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-white">{zone.label}</h3>
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", impact.className)}>{impact.label}</span>
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-500">{zone.load} mistakes</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">{zone.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(zone.keys.length ? zone.keys : ["Focus"]).map((key) => (
                          <motion.a
                            key={key}
                            href={`/practice?focus=${encodeURIComponent(key)}`}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-1.5 font-mono text-sm font-bold text-red-300 transition hover:bg-red-400/20"
                          >
                            {formatKey(key)}
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.025] p-6 text-sm font-semibold text-zinc-500">
            Complete a few practice sessions to unlock real weak-zone telemetry.
          </div>
        )}
        <motion.a href="/practice?focus=weak-keys" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="mt-5 flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-[#1A1A1A] py-3.5 text-sm font-bold text-white transition hover:border-white/[0.14]">Start Weak Key Drill</motion.a>
      </GlowCard>
    </motion.div>
  );
}
