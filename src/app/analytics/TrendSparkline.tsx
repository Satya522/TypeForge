"use client";

import { motion } from "framer-motion";
import { useId } from "react";

export function TrendSparkline({
  color,
  data,
}: {
  color: string;
  data: number[];
}) {
  const gradientId = useId().replace(/:/g, "");
  const safeData = data.length > 0 ? data : [0, 0, 0, 0];
  const min = Math.min(...safeData);
  const max = Math.max(...safeData);
  const range = Math.max(1, max - min);

  const points = safeData
    .map((value, index) => {
      const x = (index / Math.max(1, safeData.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-16 w-full overflow-visible">
      <defs>
        <linearGradient id={`sparkline-${gradientId}`} x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.42" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polyline
        fill="none"
        initial={{ pathLength: 0, opacity: 0.45 }}
        animate={{ pathLength: 1, opacity: 1 }}
        points={points}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        style={{ filter: `drop-shadow(0 0 10px ${color}55)` }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
      <polyline fill={`url(#sparkline-${gradientId})`} opacity="0.8" points={`0,100 ${points} 100,100`} />
    </svg>
  );
}
