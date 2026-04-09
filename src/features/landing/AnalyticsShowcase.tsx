"use client";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const trendData = [
  { day: 'Mon', wpm: 52 },
  { day: 'Tue', wpm: 58 },
  { day: 'Wed', wpm: 61 },
  { day: 'Thu', wpm: 66 },
  { day: 'Fri', wpm: 71 },
  { day: 'Sat', wpm: 74 },
  { day: 'Sun', wpm: 78 },
];

const metricCards = [
  { label: 'WPM', value: 78, suffix: '', detail: '+18% this week', color: '#39ff14' },
  { label: 'Accuracy', value: 98, suffix: '%', detail: 'Target locked', color: '#4ade80' },
  { label: 'Consistency', value: 89, suffix: '%', detail: 'Stable rhythm', color: '#34d399' },
  { label: 'Streak', value: 14, suffix: '', detail: 'Days active', color: '#bcff9d' },
] as const;

const insightItems = [
  { label: 'Weak zone', value: 'Punctuation', emoji: '🎯' },
  { label: 'Best mode', value: 'Code Practice', emoji: '💻' },
  { label: 'Next goal', value: '80 WPM Sprint', emoji: '🚀' },
] as const;

/* Animated counter */
function useCounter(target: number, inView: boolean, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, inView, duration]);
  return count;
}

export default function AnalyticsShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        once: true,
        onEnter: () => setInView(true),
      });
      gsap.fromTo('.analytics-heading', { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
      gsap.fromTo('.analytics-chart', { y: 60, opacity: 0, scale: 0.96 }, {
        y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.analytics-chart', start: 'top 85%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/3 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-accent-300/[0.025] blur-[140px]" />
      </div>

      <div className="section-shell">
        {/* Header */}
        <div className="analytics-heading mx-auto mb-16 max-w-3xl text-center" style={{ opacity: 0 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-300/20 bg-accent-300/[0.05] px-4 py-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-300" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-100">Analytics</span>
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Progress you can{' '}
            <span className="bg-gradient-to-r from-accent-300 via-emerald-400 to-teal-400 bg-clip-text text-transparent">actually read</span>
            {' '}at a glance
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-400 lg:text-lg">
            Every session turns into clear signals — your pace, precision, streak, and the trends showing your growth.
          </p>
        </div>

        {/* Metric counters — clean, no boxes */}
        <div className="mb-14 flex flex-wrap items-center justify-center gap-10 sm:gap-16">
          {metricCards.map((metric) => {
            const count = useCounter(metric.value, inView);
            return (
              <motion.div
                key={metric.label}
                className="group flex flex-col items-center"
                whileHover={{ y: -6, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <span
                  className="text-4xl font-bold tabular-nums sm:text-5xl"
                  style={{ color: metric.color }}
                >
                  {count}{metric.suffix}
                </span>
                <span className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                  {metric.label}
                </span>
                <span className="mt-1 text-[11px] text-gray-600">{metric.detail}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="analytics-chart mx-auto max-w-4xl" style={{ opacity: 0 }}>
          <div
            className="relative overflow-hidden rounded-2xl border border-white/[0.04] p-5 sm:p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(13,17,11,0.7) 0%, rgba(6,9,8,0.85) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-300/25 to-transparent" />

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Weekly performance</p>
                <p className="text-xs text-gray-500">Speed + precision overview</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-accent-300/20 bg-accent-300/[0.06] px-3 py-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-300" />
                <span className="text-[11px] font-medium text-accent-100">7-day upward trend</span>
              </div>
            </div>

            <div className="h-56 sm:h-64 lg:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="analytics-wpm-gradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#39ff14" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#39ff14" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="day" stroke="#4b5563" tickMargin={10} fontSize={12} />
                  <YAxis stroke="#4b5563" tickMargin={8} width={30} domain={[45, 85]} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(6,9,8,0.95)',
                      border: '1px solid rgba(57,255,20,0.15)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(20px)',
                    }}
                    labelStyle={{ color: '#bcff9d' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="wpm"
                    stroke="#39ff14"
                    strokeWidth={2.5}
                    fill="url(#analytics-wpm-gradient)"
                    activeDot={{
                      r: 5,
                      fill: '#39ff14',
                      stroke: '#060908',
                      strokeWidth: 2,
                      style: { filter: 'drop-shadow(0 0 6px rgba(57,255,20,0.5))' },
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insight chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            {insightItems.map((item) => (
              <motion.div
                key={item.label}
                className="flex items-center gap-3 rounded-full border border-white/[0.04] px-4 py-2.5 transition-colors duration-300 hover:border-accent-300/15"
                whileHover={{ y: -3, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <span className="text-lg">{item.emoji}</span>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-gray-600">{item.label}</span>
                  <p className="text-sm font-medium text-gray-300">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
