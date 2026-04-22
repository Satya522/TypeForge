"use client";

import { motion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const glowStyles = {
  accent: "from-[#39ff14]/18 via-transparent to-transparent",
  amber: "from-amber-300/16 via-transparent to-transparent",
  cyan: "from-cyan-400/18 via-transparent to-transparent",
  fuchsia: "from-fuchsia-400/18 via-transparent to-transparent",
} as const;

export function AnalyticsPanel({
  aside,
  children,
  className,
  description,
  eyebrow,
  glow = "accent",
  title,
}: {
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: string;
  eyebrow?: string;
  glow?: keyof typeof glowStyles;
  title?: string;
}) {
  return (
    <section
      className={cn(
        "panel relative overflow-hidden border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,14,0.96),rgba(8,11,12,0.92))] shadow-[0_30px_100px_rgba(0,0,0,0.42)]",
        className,
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-100", glowStyles[glow])} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative">
        {eyebrow || title || description || aside ? (
          <div className="flex flex-col gap-5 border-b border-white/8 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-2xl">
                {eyebrow ? (
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-gray-500">{eyebrow}</p>
                ) : null}
                {title ? <h2 className="mt-3 text-2xl font-black tracking-tight text-white">{title}</h2> : null}
                {description ? <p className="mt-3 text-sm leading-7 text-gray-400">{description}</p> : null}
              </div>
              {aside ? <div className="shrink-0">{aside}</div> : null}
            </div>
          </div>
        ) : null}

        <div className={cn(eyebrow || title || description || aside ? "px-5 py-5 sm:px-6" : "p-5 sm:p-6")}>{children}</div>
      </div>
    </section>
  );
}

export function AnimatedNumber({
  className,
  decimals = 0,
  prefix = "",
  suffix = "",
  value,
}: {
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  value: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 700;
    const start = performance.now();
    let animationFrame = 0;

    const tick = (time: number) => {
      const progress = Math.min(1, (time - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayValue(value * eased);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [value]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function ToneBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "accent" | "amber" | "cyan" | "fuchsia" | "neutral";
}) {
  const toneClasses = {
    accent: "border-[#39ff14]/25 bg-[#39ff14]/10 text-[#bcff9d]",
    amber: "border-amber-300/25 bg-amber-300/10 text-amber-100",
    cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-100",
    fuchsia: "border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-100",
    neutral: "border-white/10 bg-white/[0.04] text-gray-300",
  } as const;

  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.28em]", toneClasses[tone])}>
      {label}
    </span>
  );
}

export function TrendPill({
  value,
  suffix = "",
}: {
  suffix?: string;
  value: number;
}) {
  const tone =
    value > 0
      ? "border-[#39ff14]/25 bg-[#39ff14]/10 text-[#bcff9d]"
      : value < 0
        ? "border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-100"
        : "border-white/10 bg-white/[0.04] text-gray-300";

  const label = value > 0 ? `+${value}` : `${value}`;

  return <span className={cn("inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.22em]", tone)}>{label}{suffix}</span>;
}

export function Reveal({
  children,
  delay = 0,
  y = 18,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
