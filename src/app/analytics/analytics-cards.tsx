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
  SkillRadarDatum, WeakZoneModel, CoachInsight, PracticeSessionDatum 
} from "./analytics-model";

// ═══════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════

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

export function GlowCard({ children, className = "", hoverGlow = true }: any) {
  return (
    <motion.div
      whileHover={hoverGlow ? { y: -3 } : {}}
      className={cn("group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#141414] transition-all duration-500 hover:border-white/[0.12]", className)}
    >
      {hoverGlow && (
        <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
          <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
        </div>
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// KPI SECTION
// ═══════════════════════════════════════════════════════════════

const getIcon = (label: string) => {
  if (label.toLowerCase().includes("wpm")) return Zap;
  if (label.toLowerCase().includes("accur")) return Target;
  if (label.toLowerCase().includes("focus")) return Brain;
  return Layers;
};

export function KPICard({ metric, index }: { metric: SnapshotMetric; index: number }) {
  const Icon = getIcon(metric.label);
  const trendDir = metric.delta >= 0 ? "up" : "down";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlowCard className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ backgroundColor: `${metric.accent}15` }}>
              <Icon className="h-4 w-4" style={{ color: metric.accent }} strokeWidth={2} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-600">{metric.label}</span>
          </div>
          <div
            className={cn("flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold", 
              trendDir === "up" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20")}
          >
            {trendDir === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {metric.delta > 0 ? '+' : ''}{metric.delta}{metric.unit === '%' ? '%' : ''}
          </div>
        </div>

        <div className="font-mono text-4xl font-black tracking-[-0.06em] text-white">
          <AnimatedCounter value={metric.value} suffix={metric.unit === 'WPM' ? '' : metric.unit} />
        </div>

        <div className="mt-4 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metric.sparkline.map((v, i) => ({ i, v }))}>
              <defs>
                <linearGradient id={`grad-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metric.accent} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={metric.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={metric.accent} strokeWidth={2} fill={`url(#grad-${metric.key})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-3 text-xs text-zinc-600 leading-relaxed truncate">{metric.helper}</p>
      </GlowCard>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PERFORMANCE CHART
// ═══════════════════════════════════════════════════════════════

export function PerformanceChart({ data }: { data: GrowthPoint[] }) {
  const [activeRange, setActiveRange] = useState("30D");
  const ranges = ["7D", "30D", "90D"];
  const v = data.slice(-30);

  return (
    <motion.div className="lg:col-span-8 h-full" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
      <GlowCard className="p-6 h-full flex flex-col">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-600">Performance Observatory</p>
            <h2 className="mt-1 text-xl font-bold text-white">Velocity · Precision · Focus</h2>
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
          {[ { label: "WPM", color: "#A855F7" }, { label: "Accuracy", color: "#22C55E" }, { label: "Focus", color: "#06B6D4" } ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs" style={{ borderColor: `${item.color}25`, backgroundColor: `${item.color}10`, color: item.color }}>
              <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />{item.label}
            </div>
          ))}
        </div>

        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={v} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} strokeDasharray="3 6" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#52525b", fontSize: 12, fontFamily: "JetBrains Mono" }} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload) return null;
                return (
                  <div className="rounded-2xl border border-white/10 bg-[#1E1E1E]/95 p-4 shadow-2xl backdrop-blur-xl">
                    <p className="text-sm font-bold text-white mb-3">{label}</p>
                    {payload.map((p) => (
                      <div key={p.dataKey} className="flex items-center justify-between gap-8 text-sm mb-1">
                        <span className="flex items-center gap-2 text-zinc-400 capitalize"><span className="h-2 w-2 rounded-full" style={{ background: p.color }} />{p.dataKey}</span>
                        <span className="font-mono font-bold text-white">{Math.round(p.value as number)}</span>
                      </div>
                    ))}
                  </div>
                );
              }} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeDasharray: "4 4" }} />
              <defs><linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#A855F7" stopOpacity={0.15} /><stop offset="100%" stopColor="#A855F7" stopOpacity={0} /></linearGradient></defs>
              <Area type="monotone" dataKey="wpm" stroke="#A855F7" strokeWidth={3} fill="url(#wpmGrad)" dot={{ r: 4, fill: "#A855F7", stroke: "#141414", strokeWidth: 2 }} activeDot={{ r: 8, fill: "#A855F7", stroke: "#fff", strokeWidth: 2 }} />
              <Line type="monotone" dataKey="accuracy" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 3, fill: "#22C55E", stroke: "#141414", strokeWidth: 2 }} activeDot={{ r: 7, fill: "#22C55E", stroke: "#fff", strokeWidth: 2 }} />
              <Line type="monotone" dataKey="focus" stroke="#06B6D4" strokeWidth={2.5} dot={{ r: 3, fill: "#06B6D4", stroke: "#141414", strokeWidth: 2 }} activeDot={{ r: 7, fill: "#06B6D4", stroke: "#fff", strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </GlowCard>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SESSION INTELLIGENCE
// ═══════════════════════════════════════════════════════════════

export function SessionIntelligence({ sessionExtremes, pressure }: { sessionExtremes: SessionExtremes; pressure: PressureResponseModel }) {
  const cards = [
    { icon: Zap, title: "Peak Velocity", value: Math.round(sessionExtremes.personalBestWpm), unit: "WPM", subtitle: "Personal best", color: "#A855F7", trend: "+12%" },
    { icon: Target, title: "Accuracy Drift", value: "-2.1", unit: "%", subtitle: "After 20min", color: "#F59E0B", trend: "Stable" },
    { icon: Clock, title: "Recovery", value: pressure.recoveryWindow, unit: "", subtitle: "Post-error", color: "#06B6D4", trend: "Fast" },
  ];

  return (
    <div className="grid gap-4 lg:col-span-4">
      {cards.map((card, i) => (
        <motion.div key={card.title} className="h-full" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}>
          <GlowCard className="p-5 h-full" hoverGlow={true}>
            <div className="flex items-center justify-between mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="h-5 w-5" style={{ color: card.color }} strokeWidth={1.5} />
              </div>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">Live</span>
            </div>
            <p className="text-sm font-medium text-zinc-500">{card.title}</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-3xl font-black tracking-[-0.04em] text-white"><AnimatedCounter value={card.value} /></span>
              <span className="text-sm font-medium text-zinc-600">{card.unit}</span>
            </div>
            <div className="mt-3 flex items-center gap-2"><span className="text-xs font-bold" style={{ color: card.color }}>{card.trend}</span><span className="text-xs text-zinc-600">· {card.subtitle}</span></div>
          </GlowCard>
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SKILL MATRIX
// ═══════════════════════════════════════════════════════════════

export function SkillMatrix({ data }: { data: SkillRadarDatum[] }) {
  const cMap: any = { "Speed": "#A855F7", "Accuracy": "#22C55E", "Consistency": "#F59E0B", "Control": "#06B6D4", "Endurance": "#EF4444", "Recovery": "#EC4899" };
  const sData = data.map(d => ({ skill: d.skill, score: d.value, color: cMap[d.skill] || "#A855F7" }));
  return (
    <motion.div className="lg:col-span-5 h-full" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
      <GlowCard className="p-6 h-full flex flex-col justify-between">
        <div className="mb-6"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-600">Skill Matrix</p><h2 className="mt-1 text-xl font-bold text-white">Performance Dimensions</h2></div>
        <div className="flex justify-center">
          <ResponsiveContainer width={340} height={340}>
            <RadarChart data={sData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "#525252", fontSize: 12, fontWeight: 500 }} />
              <Radar name="Skills" dataKey="score" stroke="#A855F7" strokeWidth={2.5} fill="#A855F7" fillOpacity={0.12} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {sData.slice(0, 3).map((skill) => (
            <div key={skill.skill} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">{skill.skill}</p>
              <p className="mt-1 font-mono text-xl font-bold" style={{ color: skill.color }}>{skill.score}</p>
            </div>
          ))}
        </div>
      </GlowCard>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// KEYBOARD VISUALIZER
// ═══════════════════════════════════════════════════════════════

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

export function KeyboardVisualizer({ telemetryMode }: { telemetryMode: "live" | "preview" }) {
  const [selectedKey, setSelectedKey] = useState<string|null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const getKeyStyle = (key: any) => {
    const base = "relative flex items-center justify-center rounded-lg border font-mono text-sm font-bold transition-all duration-200 cursor-pointer select-none";
    if (!showHeatmap) return `${base} border-white/[0.06] bg-[#1A1A1A] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300`;
    switch (key.level) {
      case "critical": return `${base} border-red-400/40 bg-red-400/15 text-red-200 animate-pulse hover:scale-110 hover:shadow-[0_0_20px_rgba(248,113,113,0.3)]`;
      case "high": return `${base} border-amber-400/30 bg-amber-400/10 text-amber-200 hover:scale-110 hover:shadow-[0_0_16px_rgba(245,158,11,0.2)]`;
      case "watch": return `${base} border-cyan-400/25 bg-cyan-400/8 text-cyan-200 hover:scale-110 hover:shadow-[0_0_16px_rgba(6,182,212,0.2)]`;
      case "stable": return `${base} border-emerald-400/20 bg-emerald-400/8 text-emerald-200 hover:scale-110`;
      default: return `${base} border-white/[0.06] bg-[#1A1A1A] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300`;
    }
  };

  return (
    <motion.div className="lg:col-span-7 h-full w-full" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
      <GlowCard className="p-6 overflow-x-auto h-full flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-600">Keyboard Analysis</p>
            <h2 className="mt-1 text-xl font-bold text-white">Error Distribution Map</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHeatmap(!showHeatmap)} className={cn("rounded-lg px-3 py-1.5 text-xs font-bold transition", showHeatmap ? "bg-amber-500/10 text-amber-300 border border-amber-500/20" : "text-zinc-500 border border-white/[0.08]")}>
              {showHeatmap ? "Heatmap On" : "Heatmap Off"}
            </button>
            <button className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white transition">
              {telemetryMode === "live" ? "Live Data" : "Preview Data"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4 text-xs">
          {[ { label: "Clean", color: "#525252" }, { label: "Stable", color: "#22C55E" }, { label: "Watch", color: "#06B6D4" }, { label: "High", color: "#F59E0B" }, { label: "Critical", color: "#EF4444" } ].map((item) => (
            <span key={item.label} className="flex items-center gap-2 text-zinc-500"><span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />{item.label}</span>
          ))}
        </div>

        <div className="space-y-1.5 min-w-[700px]">
          {keyboardKeys.map((row) => (
            <div key={row.row} className="flex gap-1.5 justify-center">
              {row.keys.map((key: any) => {
                const w = key.w || 1;
                return (
                <motion.button key={key.k} whileHover={{ scale: 1.08, zIndex: 10 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedKey(selectedKey === key.k ? null : key.k)}
                  className={getKeyStyle(key)} style={{ width: `${w * 36 + (w - 1) * 6}px`, height: "44px", minWidth: "36px" }}>
                  <span className="text-xs">{key.k.trim()}</span>
                  {key.err && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-zinc-600">{key.err}</span>}
                  {key.level && key.level !== "clean" && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-3/4 -translate-x-1/2 rounded-full" style={{ backgroundColor: key.level === "critical" ? "#EF4444" : key.level === "high" ? "#F59E0B" : key.level === "watch" ? "#06B6D4" : "#22C55E" }} />
                  )}
                  <AnimatePresence>
                    {selectedKey === key.k && (
                      <motion.div initial={{ opacity: 0, y: 5, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.9 }} className="absolute -top-20 left-1/2 z-20 w-32 -translate-x-1/2 rounded-xl border border-white/10 bg-[#1E1E1E] p-3 shadow-xl">
                        <p className="text-xs font-bold text-white">{key.k}</p>
                        {key.err && <p className="text-[10px] text-red-400 mt-1">{key.err} errors</p>}
                        <p className="text-[10px] text-zinc-500 mt-1 capitalize">{key.level || "clean"}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
                )
              })}
            </div>
          ))}
        </div>
      </GlowCard>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AI COACH PANEL
// ═══════════════════════════════════════════════════════════════

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
            const priority = i === 0 ? "urgent" : i === 1 ? "high" : "medium";
            return (
              <motion.div key={insight.title} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }} className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/[0.10]">
                <div className="flex gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.05]"><Icon className="h-4 w-4 text-violet-400" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-white text-sm">{insight.title}</h3>
                      <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", priority === "urgent" ? "border-red-400/20 bg-red-400/10 text-red-400" : priority === "high" ? "border-amber-400/20 bg-amber-400/10 text-amber-400" : "border-cyan-400/20 bg-cyan-400/10 text-cyan-400")}>{priority}</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 leading-relaxed">{insight.body}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-600">Recommendation</span>
                      <button className="flex items-center gap-1 rounded-lg border border-white/[0.08] px-2.5 py-1 text-[10px] font-bold text-zinc-400 transition hover:bg-white/[0.05] hover:text-white">Action <ChevronRight className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-black text-black transition hover:bg-zinc-200"><Play className="h-4 w-4" /> Generate Practice Plan</motion.button>
      </GlowCard>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SESSION TABLE
// ═══════════════════════════════════════════════════════════════

export function SessionTable({ sessions }: { sessions: PracticeSessionDatum[] }) {
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const headers = [ { key: "date", label: "Session" }, { key: "mode", label: "Mode" }, { key: "wpm", label: "WPM" }, { key: "accuracy", label: "Accuracy" }, { key: "errors", label: "Errors" }, { key: "duration", label: "Duration" } ];
  
  const handleSort = (field: string) => { if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortField(field); setSortDir("desc"); } };
  const sorted = [...sessions].sort((a, b) => {
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
            <button className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-bold text-zinc-400 transition hover:bg-white/[0.05]"><Filter className="h-3.5 w-3.5" />Filter</button>
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

// ═══════════════════════════════════════════════════════════════
// WEAK ZONES PANEL
// ═══════════════════════════════════════════════════════════════

export function WeakZonesPanel({ zones }: { zones: WeakZoneModel[] }) {
  const weakZonesMock = [
    { zone: "Right Pinky Cluster", keys: ["P", "O", "L", ";"], errorRate: "18.3%", impact: "high", description: "Punctuation and far-right keys creating correction loops" },
    { zone: "Left Pinky Edge", keys: ["Q", "A", "Z", "1"], errorRate: "12.7%", impact: "medium", description: "Longer correction travel distance affecting rhythm" },
    { zone: "Right Index Cross", keys: ["Y", "N", "U", "M"], errorRate: "9.4%", impact: "medium", description: "Cross-hand transitions causing hesitation" },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
      <GlowCard className="p-6">
        <div className="mb-6"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-600">Focus Areas</p><h2 className="mt-1 text-xl font-bold text-white">Keys Requiring Attention</h2></div>
        <div className="space-y-4">
          {weakZonesMock.map((zone, i) => (
            <motion.div key={zone.zone} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white">{zone.zone}</h3>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", zone.impact === "high" ? "border-red-400/20 bg-red-400/10 text-red-400" : "border-amber-400/20 bg-amber-400/10 text-amber-400")}>{zone.errorRate}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">{zone.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">{zone.keys.map((k) => <motion.button key={k} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-1.5 font-mono text-sm font-bold text-red-300 transition hover:bg-red-400/20">{k}</motion.button>)}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="mt-5 w-full rounded-xl border border-white/[0.08] bg-[#1A1A1A] py-3.5 text-sm font-bold text-white transition hover:border-white/[0.14]">Start Weak Key Drill</motion.button>
      </GlowCard>
    </motion.div>
  );
}
