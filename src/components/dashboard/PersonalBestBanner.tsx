"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy, X } from "lucide-react";
import gsap from "gsap";

export function PersonalBestBanner({
  newPb,
  pbWpm,
  pbDate,
}: {
  newPb: boolean;
  pbWpm: number;
  pbDate: string;
}) {
  const [visible, setVisible] = useState(newPb);

  useEffect(() => {
    if (!visible) return;

    if (typeof window !== "undefined") {
      const dots = document.querySelectorAll(".pb-confetti-dot");
      gsap.to(dots, {
        x: () => gsap.utils.random(-40, 40),
        y: () => gsap.utils.random(-30, 30),
        opacity: 0,
        scale: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.05,
      });
    }

    const timer = setTimeout(() => {
      setVisible(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-label="Personal best achievement notification"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative z-40 mb-6 flex w-full items-center justify-between gap-4 rounded-xl border border-white/[0.08] border-l-[3px] border-l-[#00ff88] px-5 py-3"
          style={{
            background: "linear-gradient(90deg, rgba(0,255,136,0.07), rgba(0,212,255,0.05))",
          }}
        >
          <div className="flex items-center gap-4">
            <Trophy className="h-[18px] w-[18px] text-[#00ff88]" />
            <div>
              <p className="text-sm font-medium text-[#6b8a76]">
                🎯 New Personal Best — <span className="font-mono font-bold text-[#00ff88]">{pbWpm} WPM</span>!
              </p>
              <p className="text-xs text-[#2d4035]">Achieved {pbDate} · Keep pushing</p>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="pb-confetti-dot absolute h-1.5 w-1.5 rounded-full bg-[#00ff88]"
              />
            ))}
            <button
              onClick={() => setVisible(false)}
              aria-label="Dismiss personal best notification"
              className="z-10 text-[#2d4035] transition-colors hover:text-[#6b8a76]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
