"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Brain,
  CalendarCheck2,
  ChevronDown,
  Clock,
  Gauge,
  Keyboard,
  Play,
  RefreshCcw,
  Sparkles,
  Target,
} from "lucide-react";
import gsap from "gsap";

import type { GrowthPoint, PracticeSessionDatum } from "./analytics-model";
import "./training-command.css";

type TimeRange = "30d" | "14d" | "7d";
type LoadPoint = GrowthPoint & {
  outputIndex: number;
  outputRaw: number;
  sessionLoad: number;
  sessionsActual: number;
};

interface AnalyticsInteractiveAreaChartProps {
  data: GrowthPoint[];
  heatmapData?: Record<string, number>;
  sessions?: PracticeSessionDatum[];
}

const rangeOptions: Array<{ label: string; value: TimeRange }> = [
  { label: "Last 30 days", value: "30d" },
  { label: "Last 14 days", value: "14d" },
  { label: "Last 7 days", value: "7d" },
];

const rangeDays: Record<TimeRange, number> = {
  "30d": 30,
  "14d": 14,
  "7d": 7,
};

const LEFT_HAND_KEYS = new Set("`12345qwertasdfgzxcvb".split(""));
const RIGHT_HAND_KEYS = new Set("67890yuiophjklnm".split(""));

const formatDate = (value: string) => {
  const [, , month, day] = value.match(/^(\d{4})-(\d{2})-(\d{2})/) ?? [];
  if (!month || !day) return value;

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthLabels[Number(month) - 1] ?? month} ${Number(day)}`;
};

const keyLabel = (key: string) => {
  if (key === " ") return "Space";
  if (key.length > 1) return key.replace("-", " ");
  return key.toUpperCase();
};

const average = (values: number[]) => {
  const clean = values.filter((value) => Number.isFinite(value));
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : 0;
};

const round = (value: number) => Math.round(Number.isFinite(value) ? value : 0);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as LoadPoint | undefined;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111315]/95 px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">{formatDate(label)}</p>
      <div className="space-y-2">
        {payload.map((item: any) => (
          <div key={item.dataKey} className="flex min-w-36 items-center justify-between gap-8 text-sm">
            <span className="flex items-center gap-2 font-medium text-zinc-400">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="font-mono font-black text-white">
              {item.dataKey === "sessionLoad"
                ? point?.sessionsActual ?? 0
                : Math.round(point?.outputRaw ?? Number(item.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

function CalendarStrip({ points }: { points: LoadPoint[] }) {
  const days = points.slice(-35);
  const paddedDays = [
    ...Array.from({ length: Math.max(0, 35 - days.length) }, (_, index) => ({
      date: `empty-${index}`,
      sessionsActual: 0,
      outputIndex: 0,
    })),
    ...days,
  ];
  const activeDayCount = days.filter((day) => day.sessionsActual > 0).length;

  const cellColors = [
    "border-[#30363d]/60 bg-[#161b22]/60",
    "border-[#0e4429]/80 bg-[#0e4429]",
    "border-[#006d32]/80 bg-[#006d32]",
    "border-[#26a641] bg-[#26a641] shadow-[0_0_10px_rgba(38,166,65,0.18)]",
    "border-[#39d353] bg-[#39d353] shadow-[0_0_16px_rgba(57,211,83,0.28)] tc-cell-active-4",
  ];

  return (
    <figure className="rounded-2xl border border-[#30363d]/50 bg-[#0d1117]/70 p-3.5 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <figcaption className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7d8590]">Last 35 days</span>
        <span className="rounded-full border border-[#39d353]/30 bg-[#0e4429]/50 px-2.5 py-1 text-[10px] font-black text-[#7ee787] shadow-[0_0_12px_rgba(57,211,83,0.1)]">
          {activeDayCount} active
        </span>
      </figcaption>
      <nav className="flex items-end justify-between gap-4">
        <ol className="grid grid-flow-col grid-rows-7 gap-[5px]">
          {paddedDays.map((day) => {
            const level = day.sessionsActual === 0 ? 0 : day.sessionsActual === 1 ? 1 : day.sessionsActual === 2 ? 2 : day.sessionsActual === 3 ? 3 : 4;
            return (
              <li
                key={day.date}
                title={day.date.startsWith("empty") ? "No data" : `${formatDate(day.date)} – ${day.sessionsActual} sessions`}
                className={`h-[15px] w-[15px] rounded-[0.25rem] border ${cellColors[level]} transition-all duration-200 hover:scale-[1.35] hover:z-10`}
              />
            );
          })}
        </ol>
        <legend className="hidden items-center gap-1.5 text-[10px] font-bold text-[#7d8590] sm:flex">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span key={level} className={`h-3 w-3 rounded-[0.2rem] border ${cellColors[level]}`} />
          ))}
          <span>More</span>
        </legend>
      </nav>
    </figure>
  );
}

function SessionBars({ points }: { points: LoadPoint[] }) {
  const bars = points.slice(-12);
  const maxSessions = Math.max(1, ...bars.map((point) => point.sessionsActual));

  return (
    <div className="flex h-16 items-end gap-1.5">
      {bars.map((point) => (
        <span
          key={point.date}
          title={`${formatDate(point.date)} - ${point.sessionsActual} sessions`}
          className="flex-1 rounded-t-lg bg-gradient-to-t from-cyan-400/20 to-cyan-300/75 shadow-[0_0_18px_rgba(34,211,238,0.12)]"
          style={{ height: `${Math.max(8, (point.sessionsActual / maxSessions) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function MiniArea({ color, data, dataKey }: { color: string; data: LoadPoint[]; dataKey: keyof LoadPoint }) {
  return (
    <div className="h-16">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.slice(-14)} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
          <Area
            type="natural"
            dataKey={dataKey as string}
            stroke={color}
            strokeWidth={2}
            fill={color}
            fillOpacity={0.1}
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function CommandCard({
  accent,
  action,
  children,
  href,
  icon: Icon,
  label,
  metric,
  tag,
  text,
}: {
  accent: string;
  action: string;
  children: React.ReactNode;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  metric: string;
  tag: string;
  text: string;
}) {
  return (
    <motion.a
      href={href}
      whileHover={{ y: -6, scale: 1.012 }}
      whileTap={{ scale: 0.985 }}
      className="tc-holo-card tc-spotlight group relative flex min-h-[14rem] flex-col overflow-hidden rounded-[1.35rem] border border-[#30363d]/50 bg-[#0a0d12] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-white/[0.14] sm:p-5"
      style={{
        backgroundImage: `radial-gradient(circle at 84% 0%, ${accent}1a, transparent 40%), linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.008) 44%, rgba(0,0,0,0.2))`,
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--tc-spot-x", `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty("--tc-spot-y", `${e.clientY - rect.top}px`);
      }}
    >
      {}
      <span className="pointer-events-none absolute inset-x-6 top-0 h-px opacity-60" aria-hidden="true" style={{ background: `linear-gradient(90deg, transparent, ${accent}90, transparent)` }} />

      {}
      <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition duration-500 group-hover:opacity-100" aria-hidden="true" style={{ backgroundColor: accent }} />

      <header className="relative flex items-start justify-between gap-4">
        <figure className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#30363d]/60 bg-[#161b22] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" style={{ color: accent }}>
            <Icon className="h-4 w-4" />
          </span>
          <figcaption className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">{label}</p>
            <p className="mt-1 truncate text-base font-black text-white">{metric}</p>
          </figcaption>
        </figure>
        <span className="rounded-full border border-[#30363d]/60 bg-[#161b22] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#7d8590]">
          {tag}
        </span>
      </header>

      <p className="relative mt-4 text-sm font-medium leading-relaxed text-zinc-300">{text}</p>
      <figure className="relative mt-4">{children}</figure>
      <span className="relative mt-4 inline-flex w-fit items-center gap-2 rounded-xl border border-[#30363d]/60 bg-[#161b22] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-200 transition group-hover:border-white/20 group-hover:bg-[#1c2b22] group-hover:text-[#7ee787]">
        {action}
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </motion.a>
  );
}

function IntelligenceTile({
  accent,
  cta,
  href,
  icon: Icon,
  label,
  metric,
  text,
  value,
}: {
  accent: string;
  cta?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  metric: string;
  text: string;
  value?: number;
}) {
  const progress = typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : null;
  const ringR = 18;
  const ringC = 2 * Math.PI * ringR;
  const ringOffset = progress !== null ? ringC * (1 - progress / 100) : ringC;

  const content = (
    <>
      <header className="flex items-start justify-between gap-3">
        {}
        <figure className="relative">
          <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0">
            <circle cx="22" cy="22" r={ringR} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
            {progress !== null && (
              <circle
                cx="22" cy="22" r={ringR}
                fill="none"
                stroke={accent}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={ringC}
                strokeDashoffset={ringOffset}
                className="tc-mini-ring"
                style={{ filter: `drop-shadow(0 0 6px ${accent}60)` }}
              />
            )}
          </svg>
          <span className="absolute inset-0 grid place-items-center" style={{ color: accent }}>
            <Icon className="h-4 w-4" />
          </span>
        </figure>
        {cta && <span className="rounded-full border border-white/[0.06] bg-black/25 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">{cta}</span>}
      </header>
      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-1 truncate text-[1.35rem] font-black leading-tight tracking-[-0.03em] text-white">{metric}</p>
      <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-zinc-400">{text}</p>
    </>
  );

  const className =
    "tc-holo-card tc-spotlight group relative block h-full min-h-[9.5rem] overflow-hidden rounded-[1.15rem] border border-white/[0.055] bg-[#0a0d12] p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.035]";

  const spotHandler = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--tc-spot-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--tc-spot-y", `${e.clientY - rect.top}px`);
  };

  if (!href) {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.008 }}
        className={className}
        style={{ backgroundImage: `radial-gradient(circle at 100% 0%, ${accent}14, transparent 42%)` }}
        onMouseMove={spotHandler}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.a
      href={href}
      whileHover={{ y: -4, scale: 1.008 }}
      whileTap={{ scale: 0.99 }}
      className={className}
      style={{ backgroundImage: `radial-gradient(circle at 100% 0%, ${accent}14, transparent 42%)` }}
      onMouseMove={spotHandler}
    >
      {content}
    </motion.a>
  );
}

export function AnalyticsInteractiveAreaChart({ data, heatmapData = {}, sessions = [] }: AnalyticsInteractiveAreaChartProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("30d");
  const commandRef = React.useRef<HTMLDivElement | null>(null);

  const filteredData = React.useMemo<LoadPoint[]>(() => {
    if (!data.length) return [];

    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const lastDate = new Date(sorted[sorted.length - 1]?.date);
    const sliced = Number.isNaN(lastDate.getTime())
      ? sorted.slice(-rangeDays[timeRange])
      : sorted.filter((item) => {
          const date = new Date(item.date);
          const startDate = new Date(lastDate);
          startDate.setDate(startDate.getDate() - rangeDays[timeRange]);
          return !Number.isNaN(date.getTime()) && date >= startDate;
        });

    const maxSessions = Math.max(1, ...sliced.map((item) => item.sessions));
    const maxOutput = Math.max(1, ...sliced.map((item) => item.sessions * item.wpm));

    return sliced.map((item) => {
      const outputRaw = item.sessions * item.wpm;
      return {
        ...item,
        outputIndex: Math.round((outputRaw / maxOutput) * 100),
        outputRaw,
        sessionLoad: Math.round((item.sessions / maxSessions) * 100),
        sessionsActual: item.sessions,
      };
    });
  }, [data, timeRange]);

  const hasData = filteredData.length > 1;
  const activeDays = filteredData.filter((item) => item.sessionsActual > 0).length;
  const totalSessions = filteredData.reduce((sum, item) => sum + item.sessionsActual, 0);
  const averageSessions = activeDays ? totalSessions / activeDays : 0;
  const peakOutput = filteredData.reduce<LoadPoint | null>(
    (best, item) => (!best || item.outputRaw > best.outputRaw ? item : best),
    null,
  );
  const latestActive = [...filteredData].reverse().find((point) => point.sessionsActual > 0);
  const previousActive = [...filteredData].reverse().filter((point) => point.sessionsActual > 0)[1];
  const weeklyDelta = latestActive && previousActive ? round(latestActive.wpm - previousActive.wpm) : 0;
  const goalProgress = latestActive
    ? Math.min(100, round(((latestActive.wpm / 70) * 0.55 + (latestActive.accuracy / 95) * 0.45) * 100))
    : 0;
  const activeRatio = filteredData.length ? activeDays / filteredData.length : 0;
  const routineScore = Math.min(
    100,
    round((activeRatio * 46) + (Math.min(averageSessions / 2, 1) * 24) + (goalProgress * 0.3)),
  );

  const topKeys = Object.entries(heatmapData)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topKey = topKeys[0]?.[0];

  const leftLoad = Object.entries(heatmapData).reduce((sum, [key, value]) => sum + (LEFT_HAND_KEYS.has(key.toLowerCase()) ? value : 0), 0);
  const rightLoad = Object.entries(heatmapData).reduce((sum, [key, value]) => sum + (RIGHT_HAND_KEYS.has(key.toLowerCase()) ? value : 0), 0);
  const handTotal = Math.max(1, leftLoad + rightLoad);
  const leftPercent = round((leftLoad / handTotal) * 100);
  const rightPercent = round((rightLoad / handTotal) * 100);

  const hourBuckets = sessions.reduce<Record<string, { accuracy: number[]; count: number; wpm: number[] }>>((acc, session) => {
    const date = new Date(session.sessionDate);
    if (Number.isNaN(date.getTime())) return acc;
    const label = `${date.getHours().toString().padStart(2, "0")}:00`;
    acc[label] ??= { accuracy: [], count: 0, wpm: [] };
    acc[label].accuracy.push(session.accuracy);
    acc[label].wpm.push(session.wpm);
    acc[label].count += 1;
    return acc;
  }, {});
  const bestHour = Object.entries(hourBuckets)
    .map(([hour, bucket]) => ({ hour, score: average(bucket.wpm) * (average(bucket.accuracy) / 100), count: bucket.count }))
    .sort((a, b) => b.score - a.score)[0];

  const shortSessions = sessions.filter((session) => session.sessionDuration <= 120);
  const longSessions = sessions.filter((session) => session.sessionDuration > 120);
  const fatigueDrop = shortSessions.length && longSessions.length
    ? Math.max(0, average(shortSessions.map((session) => session.accuracy)) - average(longSessions.map((session) => session.accuracy)))
    : 0;
  const totalErrors = sessions.reduce((sum, session) => sum + session.totalErrors, 0);
  const correctedErrors = sessions.reduce((sum, session) => sum + session.correctedErrors, 0);
  const recoveryScore = totalErrors ? round((correctedErrors / totalErrors) * 100) : 100;
  const modeStats = Object.values(sessions.reduce<Record<string, { count: number; label: string; wpm: number[] }>>((acc, session) => {
    const label = session.type || "Practice";
    acc[label] ??= { count: 0, label, wpm: [] };
    acc[label].count += 1;
    acc[label].wpm.push(session.wpm);
    return acc;
  }, {})).sort((a, b) => average(b.wpm) - average(a.wpm));
  const bestMode = modeStats[0];

  const commandCards = [
    {
      accent: "#22c55e",
      action: "Start Routine",
      href: "/practice?focus=consistency",
      icon: CalendarCheck2,
      label: "Consistency",
      metric: `${activeDays}/${filteredData.length || rangeDays[timeRange]} active days`,
      tag: activeDays >= Math.min(filteredData.length, 5) ? "Stable" : "Big Win",
      text: activeDays >= Math.min(filteredData.length, 5)
        ? "Your rhythm is forming. Keep days evenly spread."
        : "More active days will smooth the trend faster.",
      visual: "calendar",
    },
    {
      accent: "#38bdf8",
      action: "Two-Block Plan",
      href: "/practice?focus=session-load",
      icon: Gauge,
      label: "Session Load",
      metric: `${averageSessions.toFixed(1)} / active day`,
      tag: averageSessions >= 2 ? "Healthy" : "Routine",
      text: averageSessions >= 2
        ? "Density is healthy. Avoid stacking too much."
        : "Use two short blocks instead of one long burst.",
      visual: "bars",
    },
    {
      accent: "#a855f7",
      action: "Repeat Peak",
      href: "/practice?focus=momentum",
      icon: Sparkles,
      label: "Momentum",
      metric: peakOutput ? `${round(peakOutput.outputRaw)} output` : "Needs data",
      tag: peakOutput ? "Best Time" : "Unlock",
      text: peakOutput
        ? `Best output hit ${formatDate(peakOutput.date)}. Repeat that pattern.`
        : "More sessions will reveal your strongest window.",
      visual: "sparkline",
    },
  ];

  const insightTiles = [
    {
      accent: "#fbbf24",
      cta: "Timing",
      href: "/practice?focus=peak-window",
      icon: Clock,
      label: "Best time",
      metric: bestHour ? bestHour.hour : "Calibrating",
      text: bestHour ? `${bestHour.count} sessions point to this window.` : "Practice at different times to unlock it.",
      value: bestHour ? Math.min(100, bestHour.count * 32) : 12,
    },
    {
      accent: "#fb7185",
      cta: "Fatigue",
      href: "/practice?focus=endurance",
      icon: Activity,
      label: "Fatigue detection",
      metric: longSessions.length ? `${fatigueDrop.toFixed(1)}% drift` : "Needs long run",
      text: longSessions.length ? "Accuracy change between short and longer sessions." : "Do one 3+ min session to calibrate.",
      value: longSessions.length ? Math.max(8, 100 - fatigueDrop * 18) : 18,
    },
    {
      accent: "#34d399",
      cta: "Reset",
      href: "/practice?focus=recovery",
      icon: RefreshCcw,
      label: "Error recovery",
      metric: `${recoveryScore}% clean`,
      text: totalErrors ? "Corrected-error ratio from real sessions." : "No error pressure yet.",
      value: recoveryScore,
    },
    {
      accent: "#22d3ee",
      cta: "Drill",
      href: `/practice?focus=${encodeURIComponent(topKey ?? "weak-keys")}`,
      icon: Keyboard,
      label: "Weak keys",
      metric: topKeys.length ? topKeys.slice(0, 3).map(([key]) => keyLabel(key)).join(" / ") : "Clean",
      text: topKeys.length ? "Highest-friction keys from heatmap telemetry." : "No heavy key friction found.",
      value: topKeys.length ? Math.min(100, topKeys[0][1] * 12) : 100,
    },
    {
      accent: "#c084fc",
      cta: "Pattern",
      href: `/practice?focus=${encodeURIComponent(topKeys.slice(0, 3).map(([key]) => key).join("") || "patterns")}`,
      icon: Brain,
      label: "Word patterns",
      metric: topKeys.length ? `${topKeys.slice(0, 3).map(([key]) => keyLabel(key)).join("")} ladder` : "Pending",
      text: topKeys.length ? "Pattern drill generated from weak-key clusters." : "Word-level telemetry will sharpen this.",
      value: topKeys.length ? Math.min(100, topKeys.slice(0, 3).reduce((sum, [, value]) => sum + value, 0) * 6) : 12,
    },
    {
      accent: "#60a5fa",
      cta: "Balance",
      icon: BarChart3,
      label: "Hand balance",
      metric: `L ${leftPercent}% / R ${rightPercent}%`,
      text: "Mistake load split across keyboard sides.",
      value: Math.max(0, 100 - Math.abs(leftPercent - rightPercent)),
    },
    {
      accent: "#a78bfa",
      cta: "Goal",
      href: "/practice?focus=70wpm-95accuracy",
      icon: Target,
      label: "Goal progress",
      metric: `${goalProgress}%`,
      text: "Progress toward 70 WPM and 95% accuracy.",
      value: goalProgress,
    },
    {
      accent: "#f472b6",
      cta: "Weekly",
      icon: Sparkles,
      label: "AI summary",
      metric: weeklyDelta >= 0 ? `+${weeklyDelta} WPM` : `${weeklyDelta} WPM`,
      text: activeDays ? `${activeDays} active days. ${topKey ? `${keyLabel(topKey)} needs focus.` : "Keep the routine steady."}` : "Start sessions to build a weekly read.",
      value: Math.min(100, activeRatio * 100),
    },
    {
      accent: "#14b8a6",
      cta: "Modes",
      href: "/practice?focus=mode-compare",
      icon: Play,
      label: "Mode compare",
      metric: bestMode ? bestMode.label : "No modes",
      text: bestMode ? `${bestMode.count} sessions. Best average mode by WPM.` : "Run tests in multiple modes.",
      value: bestMode ? Math.min(100, bestMode.count * 24) : 8,
    },
  ];

  React.useEffect(() => {
    if (!commandRef.current) return;

    const cards = commandRef.current.querySelectorAll("[data-command-card], [data-insight-tile]");
    gsap.fromTo(
      cards,
      { autoAlpha: 0, y: 28, scale: 0.96, filter: "blur(6px)" },
      { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.7, ease: "power3.out", stagger: 0.055, clearProps: "filter" },
    );
  }, [timeRange]);

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#101113] shadow-[0_24px_70px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.045)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(168,85,247,0.08),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(56,189,248,0.1),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.018]" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.55) 0.7px, transparent 0.7px)",
          backgroundSize: "14px 14px",
        }} />

        <div className="relative z-10 flex flex-col gap-4 border-b border-white/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-zinc-500">Practice Load</p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-white">Volume & Output Area</h2>
            <p className="mt-1 text-sm text-zinc-500">Session volume and output momentum.</p>
          </div>

          <label className="relative w-full sm:w-44">
            <span className="sr-only">Select chart range</span>
            <select
              value={timeRange}
              onChange={(event) => setTimeRange(event.target.value as TimeRange)}
              className="h-10 w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.045] px-3 pr-10 text-sm font-semibold text-zinc-200 outline-none transition hover:border-white/[0.14] hover:bg-white/[0.065] focus:border-cyan-300/35 focus:ring-2 focus:ring-cyan-300/10"
              aria-label="Select chart range"
            >
              {rangeOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#101113] text-zinc-100">
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          </label>
        </div>

        <div className="relative z-10 px-2 pb-5 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[250px] w-full">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="typeforgeOutputFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.42} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="typeforgeSessionFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.34} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.015} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.045)" vertical={false} strokeDasharray="3 8" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    minTickGap={28}
                    tickFormatter={formatDate}
                    tick={{ fill: "#71717a", fontSize: 12, fontWeight: 700 }}
                  />
                  <YAxis hide domain={[0, 118]} />
                  <Tooltip cursor={{ stroke: "rgba(255,255,255,0.12)", strokeDasharray: "4 4" }} content={<CustomTooltip />} />
                  <Area
                    dataKey="sessionLoad"
                    name="Sessions"
                    type="natural"
                    fill="url(#typeforgeSessionFill)"
                    stroke="#38bdf8"
                    strokeWidth={2.25}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#101113", fill: "#38bdf8" }}
                  />
                  <Area
                    dataKey="outputIndex"
                    name="Output"
                    type="natural"
                    fill="url(#typeforgeOutputFill)"
                    stroke="#a855f7"
                    strokeWidth={2.25}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#101113", fill: "#a855f7" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.025]">
                <p className="text-sm font-semibold text-zinc-500">Do 3 more sessions to unlock this insight.</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 px-3 text-xs font-bold text-zinc-500 sm:px-0">
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#a855f7]" /> Output index</span>
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#38bdf8]" /> Sessions</span>
          </div>
        </div>
      </section>
    </>
  );
}
