"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  BrainCircuit,
  Gauge,
  HeartPulse,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import KeyHeatmap from "@/components/KeyHeatmap";
import { cn } from "@/lib/utils";
import type {
  BenchmarkRow,
  CoachInsight,
  CompositeScoreModel,
  FocusBand,
  GrowthPoint,
  PressureResponseModel,
  Recommendation,
  SessionReplayEvent,
  SessionStaminaModel,
  SkillRadarDatum,
  SnapshotMetric,
  StreakQualityModel,
  TimelinePoint,
  TypingDNAProfileModel,
  WeakZoneModel,
} from "./analytics-model";
import { AnalyticsPanel, AnimatedNumber, ToneBadge, TrendPill } from "./analytics-primitives";
import { TrendSparkline } from "./TrendSparkline";

type TooltipPayload = {
  color?: string;
  dataKey?: string | number;
  name?: string | number;
  value?: Array<number | string> | number | string;
};

export function MetricCard({ metric }: { metric: SnapshotMetric }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,16,18,0.95),rgba(8,11,12,0.94))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(circle_at_top_right, ${metric.accent}26, transparent 38%)` }} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-gray-500">{metric.label}</p>
          <p className="mt-3 text-4xl font-black tracking-tight text-white">
            <AnimatedNumber suffix={metric.unit} value={metric.value} />
          </p>
        </div>
        <TrendPill suffix={metric.unit === "%" ? "%" : ""} value={metric.delta} />
      </div>

      <div className="mt-5">
        <TrendSparkline color={metric.accent} data={metric.sparkline} />
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <p className="text-sm leading-6 text-gray-400">{metric.helper}</p>
        <ToneBadge label={metric.quality} tone={getToneFromAccent(metric.accent)} />
      </div>
    </motion.div>
  );
}

export function CompositeScorePanel({ model }: { model: CompositeScoreModel }) {
  return (
    <AnalyticsPanel
      className="h-full"
      description="A layered read on the six systems that make typing feel fast, stable, and resilient."
      eyebrow="Composite score"
      glow="accent"
      title="Performance command core"
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative flex justify-center">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(57,255,20,0.18),transparent_45%)] blur-3xl" />
          <div
            className="relative flex h-72 w-72 items-center justify-center rounded-full border border-white/10 p-4 shadow-[0_0_60px_rgba(57,255,20,0.08)]"
            style={{
              background: `conic-gradient(#39ff14 0deg ${model.overall * 3.6}deg, rgba(255,255,255,0.08) ${model.overall * 3.6}deg 360deg)`,
            }}
          >
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),rgba(10,13,14,0.96)_55%)] text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <Gauge className="h-5 w-5 text-[#bcff9d]" />
              </div>
              <p className="mt-4 text-6xl font-black tracking-tight text-white">
                <AnimatedNumber value={model.overall} />
              </p>
              <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-gray-500">Overall score</p>
              <p className="mt-4 max-w-[14rem] text-sm leading-6 text-gray-400">{model.status}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-base leading-7 text-gray-300">{model.narrative}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {model.pillars.map((pillar) => (
              <div key={pillar.label} className="rounded-[1.35rem] border border-white/8 bg-black/20 px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-white">{pillar.label}</p>
                  <span className="text-lg font-black text-white">{pillar.value}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${pillar.accent}, rgba(255,255,255,0.9))`,
                      boxShadow: `0 0 18px ${pillar.accent}55`,
                      width: `${pillar.value}%`,
                    }}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-500">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnalyticsPanel>
  );
}

export function AICoachInsights({ insights }: { insights: CoachInsight[] }) {
  return (
    <AnalyticsPanel
      description="Concise, premium observations generated from your pace, control, pressure, and weak-zone patterns."
      eyebrow="AI coach"
      glow="cyan"
      title="What the system sees"
    >
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            className="rounded-[1.35rem] border border-white/8 bg-black/20 px-4 py-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.55 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]", getInsightTone(insight.tone).iconShell)}>
                  {getInsightTone(insight.tone).icon}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-white">{insight.title}</p>
                    <ToneBadge label={insight.tag} tone={insight.tone} />
                  </div>
                  <p className="mt-2 text-sm leading-7 text-gray-400">{insight.body}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AnalyticsPanel>
  );
}

export function BenchmarkComparisonCard({ rows }: { rows: BenchmarkRow[] }) {
  return (
    <AnalyticsPanel
      description="Current performance against your own ceilings, recent baselines, and comparable load bands."
      eyebrow="Adaptive benchmark layer"
      glow="amber"
      title="Where you sit against yourself"
    >
      <div className="space-y-3">
        {rows.map((row) => {
          const ratio = row.reference > 0 ? Math.min(100, (row.current / row.reference) * 100) : 0;

          return (
            <div key={row.label} className="rounded-[1.35rem] border border-white/8 bg-black/20 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{row.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-gray-500">{row.context}</p>
                </div>
                <TrendPill value={row.delta} />
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/[0.06]">
                <div
                  className={cn(
                    "h-full rounded-full",
                    row.tone === "up"
                      ? "bg-gradient-to-r from-[#39ff14] to-white"
                      : row.tone === "down"
                        ? "bg-gradient-to-r from-fuchsia-400 to-rose-200"
                        : "bg-gradient-to-r from-white/50 to-white/80",
                  )}
                  style={{ width: `${Math.max(6, ratio)}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <span className="text-gray-400">Current {formatMetric(row.current, row.label)}</span>
                <span className="text-white">Reference {formatMetric(row.reference, row.label)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </AnalyticsPanel>
  );
}

export function TypingDNAProfile({
  profile,
  unlockCount,
}: {
  profile: TypingDNAProfileModel;
  unlockCount: number;
}) {
  return (
    <AnalyticsPanel
      description="A visual signature of how your pace, flow, and pressure habits combine into one recognizable style."
      eyebrow="Typing DNA"
      glow="fuchsia"
      title={profile.archetype}
    >
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(244,114,182,0.1),rgba(15,18,22,0.78))] p-5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-fuchsia-100/80">{profile.subtitle}</p>
          <p className="mt-4 text-4xl font-black tracking-tight text-white">{profile.fingerprint}</p>
          <div className="mt-4 h-2 rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-pink-300 to-white" style={{ width: `${profile.confidence}%` }} />
          </div>
          <p className="mt-3 text-sm leading-7 text-gray-300">{profile.narrative}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.badges.map((badge) => (
              <ToneBadge key={badge} label={badge} tone="fuchsia" />
            ))}
          </div>
          {unlockCount > 0 ? (
            <p className="mt-4 text-sm leading-6 text-amber-100">Complete {unlockCount} more sessions to sharpen this profile from broad behavior into a stable signature.</p>
          ) : null}
        </div>

        <div className="space-y-3">
          {profile.signatureScores.map((score) => (
            <div key={score.label} className="rounded-[1.35rem] border border-white/8 bg-black/20 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{score.label}</p>
                <span className="text-lg font-black text-white">{score.value}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-white" style={{ width: `${score.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnalyticsPanel>
  );
}

export function SkillRadarCard({ data }: { data: SkillRadarDatum[] }) {
  return (
    <AnalyticsPanel
      description="A six-axis read on the parts of typing performance that matter most once basic speed is no longer enough."
      eyebrow="Skill radar"
      glow="cyan"
      title="Strength profile"
    >
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              dataKey="value"
              fill="rgba(34,211,238,0.26)"
              fillOpacity={1}
              stroke="#22d3ee"
              strokeWidth={2.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsPanel>
  );
}

export function RhythmTimelineCard({
  timeline,
  unlockCount,
}: {
  timeline: TimelinePoint[];
  unlockCount: number;
}) {
  return (
    <AnalyticsPanel
      description="A smart reconstruction of how your rhythm, focus, and correction load likely behaved inside a typical session."
      eyebrow="Rhythm timeline"
      glow="accent"
      title="Where flow breaks and where it comes back"
    >
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="rhythm-pace-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#39ff14" stopOpacity={0.34} />
                <stop offset="100%" stopColor="#39ff14" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="rhythm-focus-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 8" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} width={34} />
            <Tooltip content={(props) => <ChartTooltip {...props} />} cursor={{ stroke: "rgba(255,255,255,0.14)", strokeWidth: 1 }} />
            <Area dataKey="pace" fill="url(#rhythm-pace-fill)" stroke="#39ff14" strokeWidth={2.2} />
            <Area dataKey="focus" fill="url(#rhythm-focus-fill)" stroke="#22d3ee" strokeWidth={2} />
            <Line dataKey="flow" dot={false} stroke="#f472b6" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {timeline
          .filter((point) => point.event)
          .map((point) => (
            <div key={point.label} className="rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-gray-500">{point.event}</p>
              <p className="mt-2 text-lg font-black text-white">{point.pace} WPM</p>
              <p className="mt-1 text-sm text-gray-400">Focus {point.focus} • Flow {point.flow}</p>
            </div>
          ))}
      </div>

      {unlockCount > 0 ? (
        <p className="mt-4 text-sm leading-6 text-amber-100">Complete {unlockCount} more sessions to make this reconstruction less inferred and more session-specific.</p>
      ) : null}
    </AnalyticsPanel>
  );
}

export function PressureResponseCard({
  model,
  unlockCount,
}: {
  model: PressureResponseModel;
  unlockCount: number;
}) {
  return (
    <AnalyticsPanel
      description="How your performance behaves after the first real mistake, when the session stops being comfortable."
      eyebrow="Pressure response"
      glow="amber"
      title={model.state}
    >
      <div className="flex flex-col gap-5">
        <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-gray-500">Recovery score</p>
              <p className="mt-3 text-5xl font-black tracking-tight text-white">
                <AnimatedNumber value={model.score} />
              </p>
            </div>
            <ToneBadge label={model.recoveryWindow} tone="amber" />
          </div>
          <div className="mt-5 h-3 rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-300 via-[#39ff14] to-cyan-300" style={{ width: `${model.score}%` }} />
          </div>
          <p className="mt-4 text-sm leading-7 text-gray-400">{model.narrative}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {model.breakdown.map((item) => (
            <div key={item.label} className="rounded-[1.3rem] border border-white/8 bg-black/20 px-4 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-gray-500">{item.label}</p>
              <p className="mt-3 text-2xl font-black text-white">{item.value}%</p>
              <div className="mt-3 h-2 rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-white" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>

        {unlockCount > 0 ? (
          <p className="text-sm leading-6 text-amber-100">Add {unlockCount} more sessions to sharpen this pressure model from broad behavior into a confident read.</p>
        ) : null}
      </div>
    </AnalyticsPanel>
  );
}

export function FocusDriftCard({
  bands,
  driftWindow,
  narrative,
  score,
}: {
  bands: FocusBand[];
  driftWindow: string;
  narrative: string;
  score: number;
}) {
  return (
    <AnalyticsPanel
      description="Attention does not fail all at once. This reads where the session begins to lose its clean mental lock."
      eyebrow="Focus drift detector"
      glow="cyan"
      title={`Most visible drift: ${driftWindow}`}
    >
      <div className="space-y-5">
        <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-gray-500">Focus score</p>
              <p className="mt-3 text-5xl font-black tracking-tight text-white">
                <AnimatedNumber value={score} />
              </p>
            </div>
            <ToneBadge label={driftWindow} tone={score >= 82 ? "cyan" : "amber"} />
          </div>
          <p className="mt-4 text-sm leading-7 text-gray-400">{narrative}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {bands.map((band) => (
            <div key={band.label} className="rounded-[1.25rem] border border-white/8 bg-black/20 px-3 py-4">
              <div className="flex h-24 items-end">
                <div
                  className={cn(
                    "w-full rounded-t-[1rem]",
                    band.state === "steady"
                      ? "bg-gradient-to-t from-cyan-500 to-cyan-300"
                      : band.state === "watch"
                        ? "bg-gradient-to-t from-amber-400 to-amber-200"
                        : "bg-gradient-to-t from-fuchsia-500 to-rose-300",
                  )}
                  style={{ height: `${Math.max(16, band.focus)}%` }}
                />
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{band.label}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-gray-500">Load {band.load}</p>
            </div>
          ))}
        </div>
      </div>
    </AnalyticsPanel>
  );
}

export function SessionStaminaCard({ model }: { model: SessionStaminaModel }) {
  return (
    <AnalyticsPanel
      description="The difference between a fast first 20 seconds and a pace you can actually hold."
      eyebrow="Session stamina"
      glow="fuchsia"
      title={`Retention ${model.retention}%`}
    >
      <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-gray-500">Endurance score</p>
            <p className="mt-3 text-5xl font-black tracking-tight text-white">
              <AnimatedNumber value={model.score} />
            </p>
          </div>
          <HeartPulse className="h-8 w-8 text-fuchsia-300" />
        </div>
        <p className="mt-4 text-sm leading-7 text-gray-400">{model.narrative}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {model.segments.map((segment) => (
          <div key={segment.label} className="rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-gray-500">{segment.label}</p>
            <p className="mt-3 text-2xl font-black text-white">{segment.pace || 0} WPM</p>
            <p className="mt-1 text-sm text-gray-400">{segment.sessions} sessions</p>
          </div>
        ))}
      </div>
    </AnalyticsPanel>
  );
}

export function SessionReplayCard({
  events,
  summary,
}: {
  events: SessionReplayEvent[];
  summary: string;
}) {
  return (
    <AnalyticsPanel
      description="Not a literal replay. A premium reconstruction of where your run surges, shakes, and regains shape."
      eyebrow="Session replay insights"
      glow="accent"
      title="One run, reconstructed"
    >
      <p className="text-sm leading-7 text-gray-400">{summary}</p>
      <div className="mt-5 space-y-3">
        {events.map((event) => (
          <div key={event.label} className="rounded-[1.3rem] border border-white/8 bg-black/20 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={cn("h-2.5 w-2.5 rounded-full", getReplayTone(event.tone))} />
                <p className="text-sm font-semibold text-white">{event.label}</p>
              </div>
              <span className="text-sm font-black text-white">{event.strength}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-gray-400">{event.detail}</p>
          </div>
        ))}
      </div>
    </AnalyticsPanel>
  );
}

export function GrowthTrajectoryCard({ data }: { data: GrowthPoint[] }) {
  const visible = data.slice(-30);
  const currentWpm = visible[visible.length - 1]?.wpm ?? 0;
  const firstWpm = visible[0]?.wpm ?? 0;
  const currentFocus = visible[visible.length - 1]?.focus ?? 0;
  const firstFocus = visible[0]?.focus ?? 0;

  return (
    <AnalyticsPanel
      description="Longer-term trend lines for pace and focus, so you can see if the whole system is actually getting stronger."
      eyebrow="Comparative growth"
      glow="accent"
      title="Trend over time"
      aside={
        <div className="flex flex-wrap gap-2">
          <TrendPill value={currentWpm - firstWpm} />
          <TrendPill value={currentFocus - firstFocus} />
        </div>
      }
    >
      <div className="h-[330px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={visible} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="growth-wpm-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#39ff14" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#39ff14" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 8" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} width={36} />
            <Tooltip content={(props) => <ChartTooltip {...props} />} cursor={{ stroke: "rgba(255,255,255,0.14)", strokeWidth: 1 }} />
            <Area dataKey="wpm" fill="url(#growth-wpm-fill)" stroke="#39ff14" strokeWidth={2.4} />
            <Line dataKey="focus" dot={false} stroke="#22d3ee" strokeWidth={2} />
            <Line dataKey="accuracy" dot={false} stroke="#f472b6" strokeWidth={1.8} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsPanel>
  );
}

export function StreakQualityCard({ model }: { model: StreakQualityModel }) {
  return (
    <AnalyticsPanel
      description="A streak is only useful if the sessions inside it are actually making you stronger."
      eyebrow="Streak quality"
      glow="amber"
      title={model.label}
    >
      <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-gray-500">Current streak</p>
            <p className="mt-3 text-5xl font-black tracking-tight text-white">
              <AnimatedNumber suffix="d" value={model.currentStreak} />
            </p>
          </div>
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-gray-500">Quality score</p>
            <p className="mt-3 text-5xl font-black tracking-tight text-white">
              <AnimatedNumber value={model.quality} />
            </p>
          </div>
        </div>
        <div className="mt-5 h-2 rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-white" style={{ width: `${model.quality}%` }} />
        </div>
        <p className="mt-4 text-sm leading-7 text-gray-400">{model.detail}</p>
        <p className="mt-3 text-sm text-gray-500">Best streak on record: {model.longestStreak} days</p>
      </div>
    </AnalyticsPanel>
  );
}

export function ErrorHeatmapCard({
  data,
  telemetryMode,
  weakZones,
}: {
  data: Record<string, number>;
  telemetryMode: "live" | "preview";
  weakZones: WeakZoneModel[];
}) {
  return (
    <div className="space-y-4">
      <AnalyticsPanel
        description="Keyboard-level error intelligence, clustered by physical weak zones so the next drill target is obvious."
        eyebrow="Error heatmap intelligence"
        glow="amber"
        title="Where your keyboard still pushes back"
        aside={<ToneBadge label={telemetryMode === "live" ? "Live heatmap" : "Preview heatmap"} tone={telemetryMode === "live" ? "accent" : "amber"} />}
      >
        <div className="grid gap-3 md:grid-cols-3">
          {weakZones.map((zone) => (
            <div key={zone.label} className="rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4">
              <p className="text-sm font-semibold text-white">{zone.label}</p>
              <p className="mt-2 text-sm leading-6 text-gray-400">{zone.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {zone.keys.length > 0 ? zone.keys.map((key) => <ToneBadge key={key} label={key === " " ? "Space" : key.toUpperCase()} tone="amber" />) : <span className="text-sm text-gray-500">Telemetry still broad here.</span>}
              </div>
            </div>
          ))}
        </div>
      </AnalyticsPanel>

      <KeyHeatmap data={data} />
    </div>
  );
}

export function RecommendationPanel({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <AnalyticsPanel
      description="Specific drills to run next so the analytics system turns into actual speed gains, not just interesting visuals."
      eyebrow="Recommendation panel"
      glow="accent"
      title="What to improve next"
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {recommendations.map((recommendation) => (
          <motion.div
            key={recommendation.label}
            whileHover={{ y: -3 }}
            className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-5"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-lg font-black tracking-tight text-white">{recommendation.label}</p>
              <ToneBadge label={recommendation.priority} tone={recommendation.priority === "urgent" ? "amber" : recommendation.priority === "high" ? "accent" : "cyan"} />
            </div>
            <p className="mt-3 text-sm leading-7 text-gray-400">{recommendation.detail}</p>
            <div className="mt-5 rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-gray-500">Suggested drill</p>
              <p className="mt-2 text-sm font-semibold text-white">{recommendation.drill}</p>
              <p className="mt-2 text-sm leading-6 text-gray-400">{recommendation.impact}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </AnalyticsPanel>
  );
}

function ChartTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-[#080b0c]/95 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-gray-500">{label}</p>
      <div className="mt-3 space-y-2">
        {payload.map((item) => (
          <div key={`${item.dataKey}-${item.name}`} className="flex items-center justify-between gap-5 text-sm">
            <span className="inline-flex items-center gap-2 text-gray-400">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color ?? "#39ff14" }} />
              {formatDataKey(String(item.dataKey ?? item.name ?? ""))}
            </span>
            <span className="font-semibold text-white">{formatTooltipValue(String(item.dataKey ?? ""), Number(item.value ?? 0))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDataKey(dataKey: string) {
  if (dataKey === "wpm" || dataKey === "pace") return "Pace";
  if (dataKey === "focus") return "Focus";
  if (dataKey === "accuracy") return "Accuracy";
  if (dataKey === "flow") return "Flow";
  return dataKey;
}

function formatMetric(value: number, label: string) {
  if (label.toLowerCase().includes("accuracy")) return `${value}%`;
  return `${value} WPM`;
}

function formatTooltipValue(dataKey: string, value: number) {
  if (dataKey === "accuracy" || dataKey === "focus" || dataKey === "flow") return `${value}`;
  if (dataKey === "wpm" || dataKey === "pace") return `${value} WPM`;
  return `${value}`;
}

function getInsightTone(tone: CoachInsight["tone"]) {
  if (tone === "accent") {
    return {
      icon: <TrendingUp className="h-5 w-5 text-[#bcff9d]" />,
      iconShell: "",
    };
  }

  if (tone === "cyan") {
    return {
      icon: <BrainCircuit className="h-5 w-5 text-cyan-200" />,
      iconShell: "",
    };
  }

  if (tone === "amber") {
    return {
      icon: <AlertTriangle className="h-5 w-5 text-amber-100" />,
      iconShell: "",
    };
  }

  return {
    icon: <Sparkles className="h-5 w-5 text-fuchsia-100" />,
    iconShell: "",
  };
}

function getReplayTone(tone: SessionReplayEvent["tone"]) {
  if (tone === "accent") return "bg-[#39ff14]";
  if (tone === "cyan") return "bg-cyan-400";
  if (tone === "amber") return "bg-amber-300";
  return "bg-fuchsia-400";
}

function getToneFromAccent(accent: string): "accent" | "amber" | "cyan" | "fuchsia" | "neutral" {
  if (accent === "#39ff14") return "accent";
  if (accent === "#22d3ee") return "cyan";
  if (accent === "#fbbf24") return "amber";
  if (accent === "#f472b6") return "fuchsia";
  return "neutral";
}
