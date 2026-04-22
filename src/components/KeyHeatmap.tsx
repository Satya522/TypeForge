"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";

type KeyHeatmapProps = {
  data: Record<string, number>;
};

type KeyDef = {
  id: string;
  label: string;
  shifted?: string;
  width?: number;
  telemetryKey?: string;
};

type StatusLevel = "clean" | "stable" | "watch" | "high" | "critical";

interface KeyStatus {
  level: StatusLevel;
  value: number;
  label: string;
  description: string;
}

const KEY_ROWS: KeyDef[][] = [
  [
    { id: "`", label: "`", shifted: "~" },
    { id: "1", label: "1", shifted: "!" },
    { id: "2", label: "2", shifted: "@" },
    { id: "3", label: "3", shifted: "#" },
    { id: "4", label: "4", shifted: "$" },
    { id: "5", label: "5", shifted: "%" },
    { id: "6", label: "6", shifted: "^" },
    { id: "7", label: "7", shifted: "&" },
    { id: "8", label: "8", shifted: "*" },
    { id: "9", label: "9", shifted: "(" },
    { id: "0", label: "0", shifted: ")" },
    { id: "-", label: "-", shifted: "_" },
    { id: "=", label: "=", shifted: "+" },
    { id: "backspace", label: "Backspace", width: 2.15 },
  ],
  [
    { id: "tab", label: "Tab", width: 1.55 },
    { id: "q", label: "Q" },
    { id: "w", label: "W" },
    { id: "e", label: "E" },
    { id: "r", label: "R" },
    { id: "t", label: "T" },
    { id: "y", label: "Y" },
    { id: "u", label: "U" },
    { id: "i", label: "I" },
    { id: "o", label: "O" },
    { id: "p", label: "P" },
    { id: "[", label: "[", shifted: "{" },
    { id: "]", label: "]", shifted: "}" },
    { id: "\\", label: "\\", shifted: "|", width: 1.6 },
  ],
  [
    { id: "caps", label: "Caps", width: 1.9 },
    { id: "a", label: "A" },
    { id: "s", label: "S" },
    { id: "d", label: "D" },
    { id: "f", label: "F" },
    { id: "g", label: "G" },
    { id: "h", label: "H" },
    { id: "j", label: "J" },
    { id: "k", label: "K" },
    { id: "l", label: "L" },
    { id: ";", label: ";", shifted: ":" },
    { id: "'", label: "'", shifted: '"' },
    { id: "enter", label: "Enter", width: 2.25 },
  ],
  [
    { id: "shift-left", label: "Shift", width: 2.45 },
    { id: "z", label: "Z" },
    { id: "x", label: "X" },
    { id: "c", label: "C" },
    { id: "v", label: "V" },
    { id: "b", label: "B" },
    { id: "n", label: "N" },
    { id: "m", label: "M" },
    { id: ",", label: ",", shifted: "<" },
    { id: ".", label: ".", shifted: ">" },
    { id: "/", label: "/", shifted: "?" },
    { id: "shift-right", label: "Shift", width: 2.55 },
  ],
  [
    { id: "ctrl-left", label: "Ctrl", width: 1.4 },
    { id: "fn", label: "Fn", width: 1.2 },
    { id: "alt-left", label: "Alt", width: 1.2 },
    { id: "space", label: "Space", width: 6.1, telemetryKey: " " },
    { id: "alt-right", label: "Alt", width: 1.2 },
    { id: "ctrl-right", label: "Ctrl", width: 1.4 },
  ],
];

const STATUS_CONFIG: Record<StatusLevel, { label: string; description: string; color: string }> = {
  clean: { label: "Clean", description: "No measurable strain", color: "#6b7280" },
  stable: { label: "Stable", description: "Minor load detected", color: "#39ff14" },
  watch: { label: "Watch", description: "Growing strain — monitor", color: "#22d3ee" },
  high: { label: "High", description: "Friction zone — drill soon", color: "#fbbf24" },
  critical: { label: "Critical", description: "Priority drilling needed", color: "#e879f9" },
};

function getTelemetryKey(def: KeyDef) {
  return def.telemetryKey ?? def.id.toLowerCase();
}

function getKeyStatus(value: number): KeyStatus {
  if (value <= 0) {
    return { level: "clean", value, ...STATUS_CONFIG.clean };
  }
  if (value <= 2) {
    return { level: "stable", value, ...STATUS_CONFIG.stable };
  }
  if (value <= 4) {
    return { level: "watch", value, ...STATUS_CONFIG.watch };
  }
  if (value <= 6) {
    return { level: "high", value, ...STATUS_CONFIG.high };
  }
  return { level: "critical", value, ...STATUS_CONFIG.critical };
}

function getTone(value: number) {
  if (value <= 0) {
    return {
      bar: "bg-white/20",
      border: "border-white/[0.04]",
      chip: "bg-white/[0.03] text-gray-500",
      label: "text-gray-400",
      shell: "bg-gradient-to-b from-white/[0.03] to-transparent",
      glow: "",
      barGlow: "",
      shadow: "",
    };
  }

  if (value <= 2) {
    return {
      bar: "bg-[#39ff14]",
      border: "border-[#39ff14]/30",
      chip: "bg-[#39ff14]/10 text-[#39ff14]",
      label: "text-[#d6ffca]",
      shell: "bg-gradient-to-b from-[#39ff14]/[0.08] to-[#39ff14]/[0.02]",
      glow: "shadow-[0_0_20px_rgba(57,255,20,0.12)]",
      barGlow: "shadow-[0_0_8px_rgba(57,255,20,0.6)]",
      shadow: "shadow-[0_4px_20px_rgba(57,255,20,0.08),inset_0_1px_0_rgba(57,255,20,0.1)]",
    };
  }

  if (value <= 4) {
    return {
      bar: "bg-cyan-400",
      border: "border-cyan-400/35",
      chip: "bg-cyan-400/12 text-cyan-300",
      label: "text-cyan-100",
      shell: "bg-gradient-to-b from-cyan-400/[0.1] to-cyan-400/[0.02]",
      glow: "shadow-[0_0_24px_rgba(34,211,238,0.15)]",
      barGlow: "shadow-[0_0_8px_rgba(34,211,238,0.6)]",
      shadow: "shadow-[0_4px_24px_rgba(34,211,238,0.1),inset_0_1px_0_rgba(34,211,238,0.12)]",
    };
  }

  if (value <= 6) {
    return {
      bar: "bg-amber-400",
      border: "border-amber-400/40",
      chip: "bg-amber-400/15 text-amber-200",
      label: "text-amber-50",
      shell: "bg-gradient-to-b from-amber-400/[0.12] to-amber-400/[0.03]",
      glow: "shadow-[0_0_28px_rgba(251,191,36,0.18)]",
      barGlow: "shadow-[0_0_10px_rgba(251,191,36,0.7)]",
      shadow: "shadow-[0_4px_28px_rgba(251,191,36,0.12),inset_0_1px_0_rgba(251,191,36,0.15)]",
    };
  }

  return {
    bar: "bg-fuchsia-400",
    border: "border-fuchsia-400/45",
    chip: "bg-fuchsia-400/18 text-fuchsia-200",
    label: "text-fuchsia-50",
    shell: "bg-gradient-to-b from-fuchsia-400/[0.15] to-fuchsia-400/[0.04]",
    glow: "shadow-[0_0_32px_rgba(232,121,249,0.22)]",
    barGlow: "shadow-[0_0_12px_rgba(232,121,249,0.8)]",
    shadow: "shadow-[0_4px_32px_rgba(232,121,249,0.15),inset_0_1px_0_rgba(232,121,249,0.18)]",
  };
}

function AnimatedNumber({ value }: { value: string }) {
  const numericValue = parseInt(value.replace(/\D/g, "")) || 0;
  const suffix = value.replace(/[0-9]/g, "");
  const shouldReduceMotion = useReducedMotion() === true;

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
      className="tabular-nums"
    >
      {value}
    </motion.span>
  );
}

export default function KeyHeatmap({ data }: KeyHeatmapProps) {
  const [hoveredKey, setHoveredKey] = useState<{ id: string; label: string; value: number } | null>(null);
  const shouldReduceMotion = useReducedMotion() === true;

  const { trackedKeys, activeKeys, peak, peakLabel, averageLoad, cleanRatio } = useMemo(() => {
    const tracked = KEY_ROWS.flat().map((key) => ({
      label: key.label,
      telemetryKey: getTelemetryKey(key),
      value: Math.max(0, data[getTelemetryKey(key)] ?? 0),
    }));

    const active = tracked.filter((key) => key.value > 0);
    const sorted = [...active].sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

    const peakValue = sorted[0]?.value ?? 0;
    const peakLbl = sorted[0]?.label;
    const avgLoad = active.length
      ? active.reduce((sum, key) => sum + key.value, 0) / active.length
      : 0;
    const cleanPct = tracked.length
      ? Math.round((tracked.filter((key) => key.value === 0).length / tracked.length) * 100)
      : 0;

    return {
      trackedKeys: tracked,
      activeKeys: active,
      peak: peakValue,
      peakLabel: peakLbl,
      averageLoad: avgLoad,
      cleanRatio: cleanPct,
    };
  }, [data]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.02,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const keyVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0c0a] p-8 sm:p-10 lg:p-12">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#39ff14]/[0.02] blur-[150px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-fuchsia-500/[0.02] blur-[150px]" />
      </div>

      <div className="relative">
        {/* Header Section */}
        <div className="mb-12">
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#39ff14]/20 bg-[#39ff14]/5 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#39ff14]" />
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#39ff14]">
              Precision Heatmap
            </span>
          </motion.div>

          {/* Title and Stats Row */}
          <div className="flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-xl">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : 0.1 }}
                className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl"
              >
                See exactly where your board{" "}
                <span className="text-gray-500">starts fighting back</span>.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : 0.2 }}
                className="mt-4 text-sm leading-relaxed text-gray-500"
              >
                Hot zones stay bright, calm lanes stay quiet. Each key tells the story of where your fingers struggle most.
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : 0.2 }}
              className="flex flex-wrap gap-6"
            >
              <StatCard
                label="Peak Load"
                value={peak > 0 ? String(peak) : "—"}
                detail={peakLabel ? `${peakLabel} key` : "No hotspots"}
                delay={0}
              />
              <StatCard
                label="Active Caps"
                value={String(activeKeys.length)}
                detail="keys under strain"
                delay={0.1}
              />
              <StatCard
                label="Clean Ratio"
                value={`${cleanRatio}%`}
                detail={`${averageLoad.toFixed(1)} avg load`}
                delay={0.2}
              />
            </motion.div>
          </div>
        </div>

        {/* Keyboard Instrument Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : 0.3 }}
          className="relative rounded-[2rem] border border-white/[0.04] bg-gradient-to-b from-white/[0.02] to-black/20 p-6 sm:p-8"
        >
          {/* Panel Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-gray-500">Keyboard Deck</p>
              <p className="mt-1 text-xs text-gray-600">Diagnostic visualization of key-level performance</p>
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap items-center gap-4">
              <LegendItem level="clean" />
              <LegendItem level="stable" />
              <LegendItem level="watch" />
              <LegendItem level="high" />
              <LegendItem level="critical" />
            </div>
          </div>

          {/* Keyboard Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="overflow-x-auto pb-4"
          >
            <div className="min-w-[1000px] rounded-[1.5rem] border border-white/[0.03] bg-black/40 p-5">
              <div className="space-y-2.5">
                {KEY_ROWS.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-2">
                    {row.map((keyDef) => {
                      const value = Math.max(0, data[getTelemetryKey(keyDef)] ?? 0);
                      const status = getKeyStatus(value);
                      const tone = getTone(value);
                      const barWidth = peak > 0 && value > 0
                        ? `${Math.max(8, (value / peak) * 100)}%`
                        : "0%";

                      return (
                        <motion.div
                          key={keyDef.id}
                          variants={keyVariants}
                          className="min-w-0"
                          style={{ flexBasis: 0, flexGrow: keyDef.width ?? 1 }}
                          onMouseEnter={() => setHoveredKey({
                            id: keyDef.id,
                            label: keyDef.label,
                            value,
                          })}
                          onMouseLeave={() => setHoveredKey(null)}
                        >
                          <KeyCap
                            keyDef={keyDef}
                            value={value}
                            status={status}
                            tone={tone}
                            barWidth={barWidth}
                            isHovered={hoveredKey?.id === keyDef.id}
                            shouldReduceMotion={shouldReduceMotion}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Key Detail Tooltip */}
          <AnimatePresence>
            {hoveredKey && hoveredKey.value > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                className="pointer-events-none absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/10 bg-black/90 px-4 py-3 shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-semibold text-white">{hoveredKey.label}</span>
                  <div className="h-4 w-px bg-white/10" />
                  <span className="text-sm text-gray-400">{hoveredKey.value} errors</span>
                  <div className="h-4 w-px bg-white/10" />
                  <span className={cn("text-sm font-medium", getTone(hoveredKey.value).label)}>
                    {getKeyStatus(hoveredKey.value).label}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({ label, value, detail, delay }: { label: string; value: string; detail: string; delay: number }) {
  const shouldReduceMotion = useReducedMotion() === true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : 0.3 + delay }}
      className="group"
    >
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-gray-600">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight text-white">{value}</span>
      </div>
      <p className="mt-1 text-xs text-gray-600">{detail}</p>
    </motion.div>
  );
}

function LegendItem({ level }: { level: StatusLevel }) {
  const config = STATUS_CONFIG[level];
  const shouldReduceMotion = useReducedMotion() === true;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
      className="flex items-center gap-2"
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: config.color, boxShadow: `0 0 8px ${config.color}` }}
      />
      <span className="text-[0.65rem] font-medium text-gray-400">{config.label}</span>
    </motion.div>
  );
}

interface KeyCapProps {
  keyDef: KeyDef;
  value: number;
  status: KeyStatus;
  tone: ReturnType<typeof getTone>;
  barWidth: string;
  isHovered: boolean;
  shouldReduceMotion: boolean | undefined;
}

function KeyCap({ keyDef, value, status, tone, barWidth, isHovered, shouldReduceMotion }: KeyCapProps) {
  const isClean = value <= 0;
  const showErrorBadge = value > 0 && keyDef.label.length <= 3;

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative flex h-[72px] flex-col justify-between overflow-hidden rounded-xl border px-3 py-2.5 transition-shadow duration-300",
        tone.border,
        tone.shell,
        tone.shadow,
        isHovered && tone.glow,
        isClean && "hover:border-white/[0.08]"
      )}
      aria-label={`${keyDef.label} key, ${status.label} status, ${value} errors`}
      role="button"
      tabIndex={0}
    >
      {/* Subtle inner glow on hover */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
          isHovered && "opacity-100"
        )}
      >
        <div className={cn("absolute inset-0 opacity-10", tone.bar)} />
      </div>

      {/* Key content */}
      <div className="relative flex items-start justify-between">
        <div className="flex flex-col">
          {keyDef.shifted && (
            <span className="text-[0.6rem] font-medium text-gray-600">{keyDef.shifted}</span>
          )}
          <span
            className={cn(
              "font-mono text-sm font-semibold tracking-wide",
              tone.label,
              keyDef.label.length > 5 && "text-xs"
            )}
          >
            {keyDef.label}
          </span>
        </div>

        {/* Error count badge */}
        {showErrorBadge && value > 0 && (
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[0.6rem] font-semibold",
              tone.chip
            )}
          >
            {value}
          </span>
        )}
      </div>

      {/* Load bar */}
      <div className="relative mt-auto">
        <div className="h-1 rounded-full bg-white/[0.03]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: barWidth }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : 0.4 }}
            className={cn("h-full rounded-full", tone.bar, tone.barGlow)}
          />
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ detail, label, value }: { detail: string; label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-[1.5rem] border border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] px-5 py-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] backdrop-blur-sm transition-all duration-300 hover:border-white/[0.1] hover:shadow-[0_0_30px_rgba(57,255,20,0.05)]"
    >
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-gray-500">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs leading-5 text-gray-500">{detail}</p>
    </motion.div>
  );
}

function LegendPill({ label, tone, dot }: { label: string; tone: string; dot: string }) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-[0.65rem] font-bold uppercase tracking-[0.28em] text-gray-400 backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.12]">
      <span className={cn("h-2 w-2 rounded-full", dot)} />
      {label}
    </span>
  );
}

function GuideRow({ detail, label, indicator }: { detail: string; label: string; indicator: string }) {
  return (
    <div className="group flex items-start gap-4 rounded-[1.3rem] border border-white/[0.05] bg-black/20 px-5 py-4 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.02]">
      <div className={cn("mt-1 h-3 w-3 shrink-0 rounded-full", indicator)} />
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="mt-1 text-xs leading-5 text-gray-500">{detail}</p>
      </div>
    </div>
  );
}
