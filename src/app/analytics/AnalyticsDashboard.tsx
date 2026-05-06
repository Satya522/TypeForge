"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Download, RefreshCcw } from "lucide-react";
import {
  KPICard, PerformanceChart, SessionIntelligence,
  SkillMatrix, KeyboardVisualizer, AICoachPanel, SessionTable, WeakZonesPanel
} from "./analytics-cards";
import { AnalyticsInteractiveAreaChart } from "./analytics-interactive-area-chart";
import TrainingCommandSection from "./TrainingCommandSection";
import {
  buildAnalyticsModel, type DailyAnalyticsDatum,
  type PracticeSessionDatum, type SessionExtremes, type StreakSnapshot,
} from "./analytics-model";
import { aggregateHeatmapFromTelemetry } from "@/lib/typingTelemetry";
import { cardVariants } from "@/components/SectionTransition";

interface Props {
  data: DailyAnalyticsDatum[];
  exportHref: string;
  heatmapData: Record<string, number>;
  sessionExtremes: SessionExtremes;
  sessions: PracticeSessionDatum[];
  streak: StreakSnapshot;
  telemetryMode?: "live" | "preview";
}

const sectionEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const sectionVariants = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.45,
      ease: sectionEase,
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: {
      duration: 0.25,
      ease: sectionEase,
    },
  },
};

const TABS = ["Overview", "Detailed", "Raw"] as const;
type GlobalRange = "today" | "7d" | "30d" | "90d" | "all";
type SessionScope = "all" | "tests";

const RANGE_OPTIONS: Array<{ label: string; value: GlobalRange }> = [
  { label: "Today", value: "today" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "All time", value: "all" },
];

const EXPORT_FORMATS = [
  { label: "Google Sheets", value: "google-sheets" },
  { label: "Excel XLS", value: "xls" },
  { label: "CSV", value: "csv" },
  { label: "TSV", value: "tsv" },
  { label: "JSON", value: "json" },
  { label: "NDJSON", value: "ndjson" },
  { label: "HTML", value: "html" },
  { label: "Markdown", value: "md" },
  { label: "XML", value: "xml" },
  { label: "Text", value: "txt" },
] as const;

const parseDateKey = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return Number.NaN;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();
};

const deriveSessionExtremes = (items: PracticeSessionDatum[]): SessionExtremes => {
  if (!items.length) {
    return {
      averageAccuracy: 0,
      averageRawWpm: 0,
      averageWpm: 0,
      personalBestAccuracy: 0,
      personalBestRawWpm: 0,
      personalBestWpm: 0,
      totalSessions: 0,
    };
  }

  const total = items.length;
  const sum = items.reduce(
    (acc, session) => ({
      accuracy: acc.accuracy + session.accuracy,
      rawWpm: acc.rawWpm + session.rawWpm,
      wpm: acc.wpm + session.wpm,
    }),
    { accuracy: 0, rawWpm: 0, wpm: 0 },
  );

  return {
    averageAccuracy: sum.accuracy / total,
    averageRawWpm: sum.rawWpm / total,
    averageWpm: sum.wpm / total,
    personalBestAccuracy: Math.max(...items.map((session) => session.accuracy)),
    personalBestRawWpm: Math.max(...items.map((session) => session.rawWpm)),
    personalBestWpm: Math.max(...items.map((session) => session.wpm)),
    totalSessions: total,
  };
};

export default function AnalyticsDashboard({
  data, exportHref, heatmapData, sessionExtremes, sessions, streak, telemetryMode = "preview"
}: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [globalRange, setGlobalRange] = useState<GlobalRange>("30d");
  const [sessionScope, setSessionScope] = useState<SessionScope>("all");
  const buildExportUrl = (format: string) => `${exportHref}${exportHref.includes("?") ? "&" : "?"}format=${format}`;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let lastRefresh = 0;
    const refreshAnalytics = () => {
      const now = Date.now();
      if (now - lastRefresh < 15000) return;
      lastRefresh = now;
      router.refresh();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshAnalytics();
    };

    window.addEventListener("focus", refreshAnalytics);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", refreshAnalytics);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [router]);

  const latestDataTime = data.reduce((latest, day) => {
    const time = parseDateKey(day.date);
    return Number.isFinite(time) ? Math.max(latest, time) : latest;
  }, 0);
  const rangeStart =
    globalRange === "all"
      ? Number.NEGATIVE_INFINITY
      : globalRange === "today"
        ? latestDataTime
        : latestDataTime - ((globalRange === "7d" ? 6 : globalRange === "90d" ? 89 : 29) * 24 * 60 * 60 * 1000);
  const scopedSessions = sessionScope === "tests"
    ? sessions.filter((session) => /test/i.test(session.type || ""))
    : sessions;
  const filteredData = data.filter((day) => {
    const time = parseDateKey(day.date);
    return Number.isFinite(time) && time >= rangeStart && time <= latestDataTime;
  });
  const filteredSessions = scopedSessions.filter((session) => {
    const time = parseDateKey(session.sessionDate);
    return Number.isFinite(time) && time >= rangeStart && time <= latestDataTime + 24 * 60 * 60 * 1000 - 1;
  });
  const periodExtremes = deriveSessionExtremes(filteredSessions);
  const periodHeatmap = aggregateHeatmapFromTelemetry(filteredSessions.map((session) => session.typingTelemetry));
  const syncedHeatmapData = Object.keys(periodHeatmap).length > 0 ? periodHeatmap : heatmapData;
  const m = buildAnalyticsModel({
    data: filteredData,
    heatmapData: syncedHeatmapData,
    range: globalRange,
    sessionExtremes: periodExtremes,
    sessions: filteredSessions,
    streak,
    telemetryMode,
  });
  const growthSeries = m.growthSeries;

  const trainingData = React.useMemo(() => {
    const last35 = growthSeries.slice(-35);
    const activeDaysArr = last35.filter((p) => p.sessions > 0);
    const activeDays = activeDaysArr.length;
    const totalSessions = last35.reduce((s, p) => s + p.sessions, 0);
    const sessionsPerActiveDay = activeDays > 0 ? totalSessions / activeDays : 0;
    const peakEntry = last35.reduce((best, p) => (p.wpm > (best?.wpm ?? 0) ? p : best), last35[0]);
    const activeRatio = last35.length > 0 ? activeDays / last35.length : 0;
    const avgDensity = Math.min(sessionsPerActiveDay / 2, 1);
    const goalWpm = peakEntry ? Math.min(peakEntry.wpm / 70, 1) * 0.55 : 0;
    const goalAcc = peakEntry ? Math.min(peakEntry.accuracy / 95, 1) * 0.45 : 0;
    const goalProgress = Math.round((goalWpm + goalAcc) * 100);
    const routineScore = Math.round(activeRatio * 46 + avgDensity * 24 + goalProgress * 0.3);

    const last14 = growthSeries.slice(-14);
    const velocityData = last14.map((p) => ({ date: p.date, sessions: p.sessions }));

    let streak = 0;
    for (let i = growthSeries.length - 1; i >= 0; i--) {
      if (growthSeries[i].sessions > 0) streak++;
      else break;
    }

    const milestones = [
      { id: "streak-7", label: "7-day streak", description: "Practice 7 days in a row", current: Math.min(streak, 7), target: 7, unit: "days", icon: "Flame" as const, colorClass: "amber" as const },
      { id: "active-20", label: "20 active days", description: "Reach 20 active practice days", current: Math.min(activeDays, 20), target: 20, unit: "days", icon: "Calendar" as const, colorClass: "emerald" as const },
      { id: "wpm-50", label: "50 WPM average", description: "Hit 50 WPM average speed", current: Math.min(Math.round(peakEntry?.wpm ?? 0), 50), target: 50, unit: "WPM", icon: "Zap" as const, colorClass: "violet" as const },
    ];

    return {
      rangeLabel: globalRange,
      routineScore: Math.min(routineScore, 100),
      activeDays,
      targetActiveDays: Math.min(last35.length, 30),
      sessionsPerActiveDay,
      consistencyPercent: Math.round(activeRatio * 100),
      goalConsistencyPercent: 70,
      bestOutput: peakEntry?.wpm ?? 0,
      bestOutputDate: peakEntry?.date,
      heatmapData: last35.map((p) => ({ date: p.date, count: p.sessions })),
      momentumSeries: last35.map((p) => ({ date: p.date, output: p.wpm })),
      velocityData,
      milestones,
      activeMilestoneId: "streak-7",
    };
  }, [growthSeries, globalRange]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="h-12 w-12 rounded-xl border-2 border-violet-400 border-t-transparent"
          />
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm font-medium text-zinc-600"
          >
            Loading analytics...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white antialiased selection:bg-violet-400/30">
      
      {}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/3 top-0 h-[500px] w-[500px] rounded-full bg-violet-500/[0.03] blur-[150px]" />
        <div className="absolute bottom-0 right-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.03] blur-[120px]" />
        <div className="absolute left-0 top-1/2 h-[300px] w-[300px] rounded-full bg-fuchsia-500/[0.02] blur-[100px]" />
      </div>

      <main className="relative z-10 w-full mx-auto max-w-[1480px] pt-[78px]">
        {}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: sectionEase }}
          className="relative z-30 border-b border-white/[0.06] bg-[#0A0A0A]/92 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-3 lg:grid-cols-[auto_minmax(0,1fr)]">
            <div className="col-span-2 flex items-center gap-3 lg:col-span-1">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/[0.09] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <BarChart3 className="h-5 w-5 text-zinc-300" />
              </div>
              <h1 className="text-2xl font-black tracking-[-0.04em] text-white">Analytics</h1>
            </div>

            <div className="col-start-2 flex min-w-0 items-center justify-start gap-1.5 overflow-x-auto pb-1 lg:col-start-auto lg:justify-end lg:overflow-visible lg:pb-0">
              <label className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                Range
                <select
                  aria-label="Select analytics time range"
                  className="bg-transparent text-xs font-black normal-case tracking-normal text-white outline-none"
                  value={globalRange}
                  onChange={(event) => setGlobalRange(event.target.value as GlobalRange)}
                >
                  {RANGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#111315] text-zinc-100">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex h-10 shrink-0 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                {(["all", "tests"] as const).map((scope) => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => setSessionScope(scope)}
                    className={`rounded-full px-2.5 text-xs font-black transition ${
                      sessionScope === scope ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    {scope === "all" ? "All sessions" : "Tests only"}
                  </button>
                ))}
              </div>
              <div className="flex h-10 shrink-0 items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.025] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.toLowerCase();
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab.toLowerCase())}
                      className="relative h-8 min-w-[4.35rem] rounded-full px-2.5 text-[13px] font-bold transition-colors duration-200"
                      style={{ color: isActive ? "#ffffff" : "rgba(161,161,170,1)" }}
                    >
                      <span className="relative z-10">{tab}</span>
                      {isActive && (
                        <motion.span
                          layoutId="analytics-tab-pill"
                          className="absolute inset-0 rounded-full bg-violet-500 shadow-[0_10px_26px_rgba(139,92,246,0.32)]"
                          style={{ zIndex: 0 }}
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <motion.button
                  type="button"
                  onClick={() => router.refresh()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="grid h-10 w-10 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-zinc-400 transition hover:bg-white/[0.055] hover:text-white"
                  aria-label="Refresh analytics"
                >
                  <RefreshCcw className="h-4 w-4" />
                </motion.button>
                <motion.label
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 text-zinc-400 transition hover:bg-white/[0.055] hover:text-white"
                >
                  <Download className="h-4 w-4" />
                  <select
                    aria-label="Download analytics format"
                    defaultValue=""
                    className="cursor-pointer bg-transparent text-xs font-black text-zinc-200 outline-none"
                    onChange={(event) => {
                      const format = event.currentTarget.value;
                      if (!format) return;
                      window.location.assign(buildExportUrl(format));
                      event.currentTarget.value = "";
                    }}
                  >
                    <option value="" disabled className="bg-[#111315] text-zinc-100">
                      Export
                    </option>
                    {EXPORT_FORMATS.map((format) => (
                      <option key={format.value} value={format.value} className="bg-[#111315] text-zinc-100">
                        {format.label}
                      </option>
                    ))}
                  </select>
                </motion.label>
              </div>
            </div>
          </div>
        </motion.header>

        {}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              variants={sectionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {activeTab === "overview" && (
                <>
                  {}
                  <motion.section
                    variants={cardVariants}
                    className="grid grid-cols-1 gap-4 lg:grid-cols-2"
                  >
                    {m.snapshotMetrics.map((metric, i) => (
                      <KPICard key={metric.key} metric={metric} index={i} />
                    ))}
                  </motion.section>

                  <motion.section variants={cardVariants} className="mt-5">
                    <AnalyticsInteractiveAreaChart
                      data={growthSeries}
                      heatmapData={syncedHeatmapData}
                      sessions={filteredSessions}
                    />
                  </motion.section>

                  <motion.section variants={cardVariants} className="mt-5">
                    <TrainingCommandSection data={trainingData} />
                  </motion.section>

                  {}
                  <motion.section
                    variants={cardVariants}
                    className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12"
                  >
                    <PerformanceChart data={growthSeries} />
                    <SessionIntelligence sessionExtremes={periodExtremes} pressure={m.pressure} />
                  </motion.section>

                  {}
                  <motion.section
                    variants={cardVariants}
                    className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12"
                  >
                    <SkillMatrix data={m.skillRadar} dailyData={filteredData} />
                    <KeyboardVisualizer telemetryMode={m.telemetryMode} heatmapData={syncedHeatmapData} />
                  </motion.section>

                  {}
                  <motion.section variants={cardVariants} className="mt-5">
                    <AICoachPanel insights={m.coachInsights} />
                  </motion.section>
                </>
              )}

              {activeTab === "detailed" && (
                <>
                  {}
                  <motion.section
                    variants={cardVariants}
                    className="grid grid-cols-1 gap-4 lg:grid-cols-2"
                  >
                    {m.snapshotMetrics.map((metric, i) => (
                      <KPICard key={metric.key} metric={metric} index={i} />
                    ))}
                  </motion.section>

                  <motion.section variants={cardVariants} className="mt-5">
                    <AnalyticsInteractiveAreaChart
                      data={growthSeries}
                      heatmapData={syncedHeatmapData}
                      sessions={filteredSessions}
                    />
                  </motion.section>

                  {}
                  <motion.section variants={cardVariants} className="mt-5">
                    <SessionTable sessions={filteredSessions} />
                  </motion.section>

                  {}
                  <motion.section
                    variants={cardVariants}
                    className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12"
                  >
                    <SkillMatrix data={m.skillRadar} dailyData={filteredData} />
                    <KeyboardVisualizer telemetryMode={m.telemetryMode} heatmapData={syncedHeatmapData} />
                  </motion.section>

                  {}
                  <motion.section variants={cardVariants} className="mt-5">
                    <AICoachPanel insights={m.coachInsights} />
                  </motion.section>
                </>
              )}

              {activeTab === "raw" && (
                <>
                  {}
                  <motion.section variants={cardVariants} className="mt-0">
                    <SessionTable sessions={filteredSessions} />
                  </motion.section>

                  {}
                  <motion.section variants={cardVariants} className="mt-5 pb-12">
                    <WeakZonesPanel zones={m.topWeakZones} />
                  </motion.section>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
