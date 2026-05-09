"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { Target } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function AnimatedCounter({ from, to }: { from: number; to: number }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(from);
  const springValue = useSpring(motionValue, { stiffness: 50, damping: 20 });
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(to);
    } else if (inView) {
      motionValue.set(to);
    }
  }, [inView, motionValue, to, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    return springValue.on("change", (latest) => {
      setDisplay(Math.round(latest));
    });
  }, [springValue, reduceMotion]);

  return <span ref={ref}>{display}</span>;
}

export function NextMilestoneBar({
  currentRank,
  nextRank,
  currentPoints,
  targetPoints,
  currentWpm,
  targetWpm,
}: {
  currentRank: string;
  nextRank: string;
  currentPoints: number;
  targetPoints: number;
  currentWpm: number;
  targetWpm: number;
}) {
  const [shouldAnimate, setAnimate] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 85%",
      onEnter: () => setAnimate(true),
    });

    return () => {
      st.kill();
    };
  }, []);

  const ptsPercent = Math.min(100, Math.max(0, (currentPoints / targetPoints) * 100));
  const wpmPercent = Math.min(100, Math.max(0, (currentWpm / targetWpm) * 100));

  return (
    <article ref={containerRef} className="relative z-20 w-full rounded-2xl border border-white/[0.06] border-l-[3px] border-l-[#7c3aed] bg-[#111f16] p-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-[#7c3aed]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#6b8a76]">Next Milestone</span>
        </div>
        <div className="rounded-full border border-[#7c3aed]/20 bg-[#7c3aed]/10 px-2 py-0.5 text-xs text-[#7c3aed]">
          {currentRank} → {nextRank}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-[#6b8a76]">Rank Points</span>
            <span className="font-mono text-sm text-[#e8f5ee]">
              <AnimatedCounter from={0} to={currentPoints} /> / {targetPoints.toLocaleString()} pts
            </span>
          </div>
          <div className="relative h-2 w-full rounded-full bg-white/[0.05]" role="progressbar" aria-valuenow={currentPoints} aria-valuemin={0} aria-valuemax={targetPoints}>
            <motion.div
              initial={{ width: "0%" }}
              animate={shouldAnimate ? { width: `${ptsPercent}%` } : { width: "0%" }}
              transition={{ type: "spring", stiffness: 55, damping: 18, delay: 0.2 }}
              className="relative h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #7c3aed, #a78bfa)" }}
            >
              <div className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#a78bfa] shadow-[0_0_8px_#a78bfa]" />
            </motion.div>
          </div>
          <p className="mt-1.5 text-xs text-[#2d4035]">{Math.max(0, targetPoints - currentPoints).toLocaleString()} pts to {nextRank}</p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-[#6b8a76]">Speed Goal</span>
            <span className="font-mono text-sm text-[#e8f5ee]">
              <AnimatedCounter from={0} to={currentWpm} /> / {targetWpm} WPM
            </span>
          </div>
          <div className="relative h-2 w-full rounded-full bg-white/[0.05]" role="progressbar" aria-valuenow={currentWpm} aria-valuemin={0} aria-valuemax={targetWpm}>
            <motion.div
              initial={{ width: "0%" }}
              animate={shouldAnimate ? { width: `${wpmPercent}%` } : { width: "0%" }}
              transition={{ type: "spring", stiffness: 55, damping: 18, delay: 0.35 }}
              className="relative h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #00d4ff, #00ff88)" }}
            >
              <div className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88]" />
            </motion.div>
          </div>
          <p className="mt-1.5 text-xs text-[#2d4035]">+{Math.max(0, targetWpm - currentWpm)} WPM to unlock {nextRank}</p>
        </div>
      </div>
    </article>
  );
}
