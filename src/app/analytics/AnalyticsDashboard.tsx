'use client'

import { motion } from 'framer-motion'
import { BrainCircuit, Download, Layers3, Sparkles, Target } from 'lucide-react'
import { useState, useTransition } from 'react'
import {
  motionDistances,
  motionDurations,
  motionEasing,
  motionGroupStaggerMs,
} from '@/components/motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  AICoachInsights,
  BenchmarkComparisonCard,
  CompositeScorePanel,
  ErrorHeatmapCard,
  FocusDriftCard,
  GrowthTrajectoryCard,
  MetricCard,
  PressureResponseCard,
  RecommendationPanel,
  RhythmTimelineCard,
  SessionReplayCard,
  SessionStaminaCard,
  SkillRadarCard,
  StreakQualityCard,
  TypingDNAProfile,
} from './analytics-cards'
import {
  buildAnalyticsModel,
  type AnalyticsRange,
  type DailyAnalyticsDatum,
  type PracticeSessionDatum,
  type SessionExtremes,
  type StreakSnapshot,
} from './analytics-model'
import { Reveal, ToneBadge } from './analytics-primitives'

interface AnalyticsDashboardProps {
  data: DailyAnalyticsDatum[]
  exportHref: string
  heatmapData: Record<string, number>
  sessionExtremes: SessionExtremes
  sessions: PracticeSessionDatum[]
  streak: StreakSnapshot
  telemetryMode?: 'live' | 'preview'
}

const rangeOptions: Array<{
  helper: string
  label: string
  value: AnalyticsRange
}> = [
  { helper: 'Recent pulse', label: '7D', value: '7d' },
  { helper: 'Primary view', label: '30D', value: '30d' },
  { helper: 'Behavioral lens', label: '12 Sessions', value: 'sessions' },
]

export default function AnalyticsDashboard({
  data,
  exportHref,
  heatmapData,
  sessionExtremes,
  sessions,
  streak,
  telemetryMode = 'preview',
}: AnalyticsDashboardProps) {
  const [range, setRange] = useState<AnalyticsRange>('30d')
  const [isPending, startTransition] = useTransition()

  const model = buildAnalyticsModel({
    data,
    heatmapData,
    range,
    sessionExtremes,
    sessions,
    streak,
    telemetryMode,
  })

  return (
    <motion.div
      animate="show"
      className="section-shell mt-10 space-y-8 pb-28 pt-24 sm:pt-28"
      initial="hidden"
      variants={{
        hidden: { opacity: 0, y: motionDistances.sm },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            delayChildren: 0.05,
            duration: motionDurations.medium,
            ease: motionEasing.premium,
            staggerChildren: motionGroupStaggerMs.panel / 1000,
          },
        },
      }}
    >
      <Reveal>
        <section className="panel relative overflow-hidden border border-white/10 bg-[linear-gradient(135deg,rgba(5,10,9,0.98),rgba(8,12,16,0.94)_48%,rgba(12,10,18,0.94))] shadow-[0_40px_120px_rgba(0,0,0,0.48)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(57,255,20,0.16),transparent_26%),radial-gradient(circle_at_80%_18%,rgba(34,211,238,0.14),transparent_22%),radial-gradient(circle_at_68%_72%,rgba(244,114,182,0.12),transparent_24%)]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
              backgroundSize: '46px 46px',
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="relative px-6 py-7 sm:px-8 sm:py-9 lg:px-10">
            <div className="grid gap-8 xl:grid-cols-[1.16fr_0.84fr] xl:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <ToneBadge label="Performance intelligence" tone="accent" />
                  <ToneBadge
                    label={model.header.statusPill}
                    tone={telemetryMode === 'live' ? 'cyan' : 'amber'}
                  />
                  <ToneBadge label={model.header.windowLabel} tone="neutral" />
                </div>

                <h1 className="mt-6 max-w-5xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-[4.5rem] lg:leading-[0.98]">
                  {model.header.headline}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-gray-300 sm:text-lg">
                  {model.header.intro}
                </p>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 sm:text-base">
                  {model.header.subline}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <motion.a
                    className="inline-flex items-center gap-2 rounded-full border border-[#39ff14]/30 bg-[#39ff14]/10 px-5 py-3 text-sm font-semibold text-[#bcff9d] transition-colors hover:border-[#39ff14]/60 hover:bg-[#39ff14]/14 hover:text-white"
                    href={exportHref}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Download className="h-4 w-4" />
                    Export session intelligence
                  </motion.a>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-gray-400">
                    <BrainCircuit className="h-4 w-4 text-cyan-300" />
                    {model.header.readinessLabel}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-gray-400">
                    <Target className="h-4 w-4 text-fuchsia-300" />
                    {model.totalSessions} sessions in memory
                  </div>
                </div>
              </div>

              <div className="rounded-[1.9rem] border border-white/10 bg-black/25 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-gray-500">
                      Signal readiness
                    </p>
                    <p className="mt-3 text-6xl font-black tracking-tight text-white">
                      {model.header.readiness}%
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] p-3">
                    <Layers3 className="h-5 w-5 text-[#bcff9d]" />
                  </div>
                </div>
                <div className="mt-5 h-3 rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#39ff14] via-cyan-300 to-white"
                    style={{ width: `${model.header.readiness}%` }}
                  />
                </div>
                <p className="mt-4 text-sm leading-7 text-gray-400">
                  {model.lowData
                    ? 'The system already sees your broad typing shape, but it needs more signal to make the DNA, replay, and pressure modules truly personal.'
                    : 'You have enough signal for the system to distinguish between pace, control, rhythm, pressure recovery, and weak-zone drag.'}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {rangeOptions.map((option) => (
                    <Button
                      key={option.value}
                      className={cn(
                        'h-auto rounded-full border px-4 py-3 text-left transition-all duration-200',
                        range === option.value
                          ? 'border-[#39ff14]/35 bg-[#39ff14]/10 text-white shadow-[0_0_24px_rgba(57,255,20,0.12)]'
                          : 'border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-white'
                      )}
                      onClick={() =>
                        startTransition(() => setRange(option.value))
                      }
                      type="button"
                      variant="ghost"
                    >
                      <span className="flex flex-col gap-1">
                        <span className="text-sm font-semibold uppercase tracking-[0.22em]">
                          {option.label}
                        </span>
                        <span className="text-[0.7rem] font-medium tracking-[0.16em] text-gray-500">
                          {option.helper}
                        </span>
                      </span>
                    </Button>
                  ))}
                </div>
                {isPending ? (
                  <p className="mt-3 text-sm text-cyan-200">
                    Recomputing the intelligence layer for this range.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {model.snapshotMetrics.map((metric) => (
          <Reveal key={metric.key} delay={0.05}>
            <MetricCard metric={metric} />
          </Reveal>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Reveal>
          <CompositeScorePanel model={model.composite} />
        </Reveal>
        <div className="space-y-6">
          <Reveal delay={0.04}>
            <AICoachInsights insights={model.coachInsights} />
          </Reveal>
          <Reveal delay={0.08}>
            <BenchmarkComparisonCard rows={model.benchmarkRows} />
          </Reveal>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <Reveal>
          <GrowthTrajectoryCard data={model.growthSeries} />
        </Reveal>
        <div className="space-y-6">
          <Reveal delay={0.04}>
            <StreakQualityCard model={model.streakQuality} />
          </Reveal>
          <Reveal delay={0.08}>
            <SessionReplayCard
              events={model.sessionReplay.events}
              summary={model.sessionReplay.summary}
            />
          </Reveal>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Reveal>
          <TypingDNAProfile
            profile={model.typingDNA}
            unlockCount={model.unlocks.dna}
          />
        </Reveal>
        <Reveal delay={0.04}>
          <SkillRadarCard data={model.skillRadar} />
        </Reveal>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <RhythmTimelineCard
            timeline={model.rhythmTimeline}
            unlockCount={model.unlocks.replay}
          />
        </Reveal>
        <div className="space-y-6">
          <Reveal delay={0.04}>
            <PressureResponseCard
              model={model.pressure}
              unlockCount={model.unlocks.pressure}
            />
          </Reveal>
          <Reveal delay={0.08}>
            <FocusDriftCard
              bands={model.focusDrift.bands}
              driftWindow={model.focusDrift.driftWindow}
              narrative={model.focusDrift.narrative}
              score={model.focusDrift.score}
            />
          </Reveal>
        </div>
      </div>

      <Reveal>
        <SessionStaminaCard model={model.sessionStamina} />
      </Reveal>

      <Reveal>
        <ErrorHeatmapCard
          data={heatmapData}
          telemetryMode={model.telemetryMode}
          weakZones={model.topWeakZones}
        />
      </Reveal>

      <Reveal>
        <RecommendationPanel recommendations={model.recommendations} />
      </Reveal>

      <Reveal>
        <div className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(135deg,rgba(11,15,18,0.96),rgba(8,10,13,0.92))] px-6 py-6 shadow-[0_25px_80px_rgba(0,0,0,0.34)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-gray-500">
                Launch note
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-white">
                Analytics now behaves like a premium typing lab.
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
                It is purpose-built around typing pace, control, recovery,
                rhythm, weak zones, focus drift, and streak quality. Even
                low-data states stay intentional and premium.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-gray-400">
              <Sparkles className="h-4 w-4 text-fuchsia-300" />
              Designed for screenshots, tuned for real progress
            </div>
          </div>
        </div>
      </Reveal>
    </motion.div>
  )
}
