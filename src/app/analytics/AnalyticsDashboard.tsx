"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Download, RefreshCcw } from "lucide-react";
import {
  KPICard, PerformanceChart, SessionIntelligence,
  SkillMatrix, KeyboardVisualizer, AICoachPanel, SessionTable, WeakZonesPanel
} from "./analytics-cards";
import {
  buildAnalyticsModel, type DailyAnalyticsDatum,
  type PracticeSessionDatum, type SessionExtremes, type StreakSnapshot,
} from "./analytics-model";
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

// ─── Transition easing & variants ───────────────────────────────
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

export default function AnalyticsDashboard({
  data, exportHref, heatmapData, sessionExtremes, sessions, streak, telemetryMode = "preview"
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const m = buildAnalyticsModel({ data, heatmapData, range: "30d", sessionExtremes, sessions, streak, telemetryMode });

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
      
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/3 top-0 h-[500px] w-[500px] rounded-full bg-violet-500/[0.03] blur-[150px]" />
        <div className="absolute bottom-0 right-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.03] blur-[120px]" />
        <div className="absolute left-0 top-1/2 h-[300px] w-[300px] rounded-full bg-fuchsia-500/[0.02] blur-[100px]" />
      </div>

      <main className="relative z-10 w-full mx-auto max-w-[1480px] pt-24">
        {/* Sticky Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: sectionEase }}
          className="relative z-30 border-b border-white/[0.06] bg-[#0A0A0A]/80 px-4 py-5 sm:px-6 lg:px-8 backdrop-blur-2xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <BarChart3 className="h-5 w-5 text-zinc-300" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black tracking-[-0.04em] text-white">Analytics</h1>
                  <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[11px] font-black text-amber-300">
                    PREVIEW
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600">
                  Typing performance, accuracy drift, weak keys, and AI coaching intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* ─── Tab bar with animated pill ─── */}
              <div className="flex items-center gap-1 rounded-full border border-transparent bg-transparent p-1">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.toLowerCase();
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab.toLowerCase())}
                      className="relative min-w-[5.9rem] rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200"
                      style={{
                        color: isActive
                          ? "#ffffff"
                          : "rgba(161,161,170,1)", /* zinc-500 */
                      }}
                    >
                      <span className="relative z-10">{tab}</span>
                      {isActive && (
                        <motion.span
                          layoutId="analytics-tab-pill"
                          className="absolute inset-0 rounded-full bg-violet-500 shadow-[0_10px_26px_rgba(139,92,246,0.32)]"
                          style={{ zIndex: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 34,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                <RefreshCcw className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                <Download className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* ─── Tab Content with AnimatePresence ─── */}
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
                  {/* KPI Grid */}
                  <motion.section
                    variants={cardVariants}
                    className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
                  >
                    {m.snapshotMetrics.map((metric, i) => (
                      <KPICard key={metric.key} metric={metric} index={i} />
                    ))}
                  </motion.section>

                  {/* Chart + Intelligence */}
                  <motion.section
                    variants={cardVariants}
                    className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12"
                  >
                    <PerformanceChart data={m.growthSeries} />
                    <SessionIntelligence sessionExtremes={sessionExtremes} pressure={m.pressure} />
                  </motion.section>

                  {/* Skill + Keyboard */}
                  <motion.section
                    variants={cardVariants}
                    className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12"
                  >
                    <SkillMatrix data={m.skillRadar} />
                    <KeyboardVisualizer telemetryMode={m.telemetryMode} />
                  </motion.section>

                  {/* AI Coach */}
                  <motion.section variants={cardVariants} className="mt-5">
                    <AICoachPanel insights={m.coachInsights} />
                  </motion.section>
                </>
              )}

              {activeTab === "detailed" && (
                <>
                  {/* KPI Grid */}
                  <motion.section
                    variants={cardVariants}
                    className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
                  >
                    {m.snapshotMetrics.map((metric, i) => (
                      <KPICard key={metric.key} metric={metric} index={i} />
                    ))}
                  </motion.section>

                  {/* Session Table */}
                  <motion.section variants={cardVariants} className="mt-5">
                    <SessionTable sessions={sessions} />
                  </motion.section>

                  {/* Skill + Keyboard */}
                  <motion.section
                    variants={cardVariants}
                    className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12"
                  >
                    <SkillMatrix data={m.skillRadar} />
                    <KeyboardVisualizer telemetryMode={m.telemetryMode} />
                  </motion.section>

                  {/* AI Coach */}
                  <motion.section variants={cardVariants} className="mt-5">
                    <AICoachPanel insights={m.coachInsights} />
                  </motion.section>
                </>
              )}

              {activeTab === "raw" && (
                <>
                  {/* Session Table */}
                  <motion.section variants={cardVariants} className="mt-0">
                    <SessionTable sessions={sessions} />
                  </motion.section>

                  {/* Weak Zones */}
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
