"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface KeyboardHeatmapProps {
  activeKey?: string;
  heatmap?: Record<string, number>;
  className?: string;
}

const ROWS = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
  ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
  ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "Shift"],
  ["Ctrl", "Win", "Alt", "Space", "Alt", "Fn", "Ctrl"],
] as const;

const KEY_WIDTHS: Record<string, number> = {
  Backspace: 2,
  Tab: 1.5,
  Caps: 1.75,
  Enter: 2.25,
  Shift: 2.5,
  Space: 5,
  Ctrl: 1.4,
  Win: 1.4,
  Alt: 1.4,
  Fn: 1.2,
};

const DEFAULT_HEAT: Record<string, number> = {
  f: 95, j: 95, d: 80, k: 80, s: 72, l: 72, a: 68, ";": 65, e: 58, i: 55, t: 52, n: 50, r: 48, o: 45,
  Space: 70, h: 35, g: 30, c: 28, u: 32, m: 25, b: 20, w: 15, v: 12, y: 14, p: 13, ",": 10, ".": 10,
};

const EMPTY_HEATMAP: Record<string, number> = {};

type HeatStyle = Pick<CSSProperties, "background" | "borderColor" | "boxShadow" | "color" | "fontWeight">;

function getHeatStyle(value: number): HeatStyle {
  if (value <= 5) return { background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))", borderColor: "rgba(255,255,255,0.08)", color: "#64748b" };
  if (value <= 15) return { background: "rgba(13, 30, 28, 0.6)", borderColor: "rgba(45, 212, 191, 0.1)", color: "#0d9488" };
  if (value <= 35) return { background: "rgba(15, 45, 40, 0.7)", borderColor: "rgba(45, 212, 191, 0.2)", color: "#14b8a6", boxShadow: "0 0 10px rgba(45,212,191,0.05)" };
  if (value <= 60) return { background: "rgba(20, 70, 60, 0.8)", borderColor: "rgba(45, 212, 191, 0.4)", color: "#2dd4bf", boxShadow: "0 0 15px rgba(45,212,191,0.15)" };
  if (value <= 85) return { background: "rgba(35, 20, 65, 0.9)", borderColor: "rgba(168, 85, 247, 0.4)", color: "#a855f7", boxShadow: "0 0 20px rgba(168,85,247,0.2)" };
  return {
    background: "linear-gradient(180deg, rgba(76,29,149,1), rgba(46,16,101,1))",
    borderColor: "rgba(192, 132, 252, 0.6)",
    color: "#e9d5ff",
    fontWeight: 600,
    boxShadow: "0 0 25px rgba(168,85,247,0.3)",
  };
}

function normalizeKey(value: string | null | undefined) {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "{space}") return "space";
  return trimmed.toLowerCase();
}

const rowVariants: Variants = {
  hidden: {},
  visible: (i: number) => ({
    transition: { staggerChildren: 0.015, delayChildren: i * 0.07 },
  }),
};

const keyVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  pressed: {
    opacity: 1, y: 1, scale: 0.96,
    transition: { type: "spring", stiffness: 500, damping: 25 },
  },
};

const baseShadow = `0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -2px 0 rgba(0,0,0,0.5)`;
const pressedShadow = `0 1px 2px rgba(0,0,0,0.4), inset 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.02)`;

interface KeyProps {
  delayIndex: number;
  heat: number;
  isPressed: boolean;
  label: string;
}

function Key({ delayIndex, heat, isPressed, label }: KeyProps) {
  const heatStyle = getHeatStyle(heat);
  const width = KEY_WIDTHS[label] ?? 1;
  const isSpace = label === "Space";
  const heatGlow = !isPressed && !isSpace && heatStyle.boxShadow ? `, ${heatStyle.boxShadow}` : "";

  return (
    <motion.div
      variants={keyVariants}
      initial="hidden"
      animate={isPressed ? "pressed" : "visible"}
      whileHover={{ y: -1, scale: isPressed ? 0.96 : 1.02 }}
      style={{
        flexGrow: width,
        background: isSpace ? "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))" : heatStyle.background,
        borderColor: isPressed ? (heatStyle.color || "rgba(255,255,255,0.2)") : heatStyle.borderColor,
        color: isSpace ? "transparent" : heatStyle.color,
        fontWeight: heatStyle.fontWeight,
        boxShadow: isPressed ? pressedShadow : `${baseShadow}${heatGlow}`,
      }}
      className={cn(
        "relative flex items-center justify-center h-10 min-w-[2.2rem] rounded-lg",
        "cursor-default select-none text-[11px] font-medium tracking-wide",
        "border backdrop-blur-sm transition-colors duration-200",
        isSpace && "border-white/[0.03]"
      )}
    >
      <span 
        className={cn("relative z-10", isSpace && "h-1 w-8 rounded-full bg-white/[0.08]")}
        style={{ fontFamily: 'var(--font-code), "JetBrains Mono", monospace' }}
      >
        {!isSpace && label}
      </span>
    </motion.div>
  );
}

export default function KeyboardHeatmap({ activeKey, heatmap, className }: KeyboardHeatmapProps) {
  const [simulatedKey, setSimulatedKey] = useState<string | null>(null);
  const sourceHeatmap = heatmap ?? EMPTY_HEATMAP;

  const mergedHeat = useMemo(
    () => Object.keys(DEFAULT_HEAT).length > 0 && Object.keys(sourceHeatmap).length === 0
        ? DEFAULT_HEAT
        : { ...DEFAULT_HEAT, ...sourceHeatmap },
    [sourceHeatmap]
  );

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const interval = setInterval(() => {
      const hotKeys = Object.entries(mergedHeat).filter(([, value]) => value > 50).map(([key]) => key);
      if (hotKeys.length === 0) return;
      const pick = hotKeys[Math.floor(Math.random() * hotKeys.length)];
      setSimulatedKey(pick);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setSimulatedKey(null), 180);
    }, 1800);
    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [mergedHeat]);

  return (
    <div className={cn("relative flex flex-col gap-1.5 select-none w-max mx-auto p-2", className)}>
      {ROWS.map((row, rowIndex) => (
        <motion.div
          key={rowIndex}
          className="relative z-10 flex gap-1.5"
          custom={rowIndex}
          initial="hidden"
          animate="visible"
          variants={rowVariants}
        >
          {row.map((key, keyIndex) => {
            const heat = mergedHeat[key] ?? mergedHeat[key.toLowerCase()] ?? 0;
            const normalizedLabel = normalizeKey(key);
            const isPressed = normalizeKey(activeKey) === normalizedLabel || normalizeKey(simulatedKey) === normalizedLabel;
            return (
              <Key
                key={`${key}-${rowIndex}-${keyIndex}`}
                label={key}
                heat={heat}
                isPressed={isPressed}
                delayIndex={rowIndex * 14 + keyIndex}
              />
            );
          })}
        </motion.div>
      ))}
    </div>
  );
}
