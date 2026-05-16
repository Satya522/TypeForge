"use client";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, ArrowRight, BarChart3, Flame, Gauge, LineChart, Target, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const trendData = [
  { day: 'Mon', wpm: 52, accuracy: 91 },
  { day: 'Tue', wpm: 58, accuracy: 93 },
  { day: 'Wed', wpm: 61, accuracy: 94 },
  { day: 'Thu', wpm: 66, accuracy: 96 },
  { day: 'Fri', wpm: 71, accuracy: 97 },
  { day: 'Sat', wpm: 74, accuracy: 97 },
  { day: 'Sun', wpm: 78, accuracy: 98 },
];

const metricCards = [
  { href: '/analytics', label: 'WPM', value: 78, suffix: '', detail: '+18% this week', signal: 'Speed lift', color: '#4f8dfd', icon: Gauge },
  { href: '/analytics', label: 'Accuracy', value: 98, suffix: '%', detail: 'Target locked', signal: 'Clean hits', color: '#55f0a3', icon: Target },
  { href: '/analytics', label: 'Consistency', value: 89, suffix: '%', detail: 'Stable rhythm', signal: 'Low wobble', color: '#a78bfa', icon: Activity },
  { href: '/achievements', label: 'Streak', value: 14, suffix: '', detail: 'Days active', signal: 'Habit heat', color: '#ffd43b', icon: Flame },
] as const;

const insightItems = [
  { href: '/practice/punctuation', label: 'Weak zone', value: 'Punctuation', detail: '12% more errors than letters', color: '#ff5fa2' },
  { href: '/code-practice', label: 'Best mode', value: 'Code Practice', detail: 'Highest rhythm retention', color: '#6fa7ff' },
  { href: '/practice/time-60', label: 'Next goal', value: '80 WPM Sprint', detail: 'Three clean runs remaining', color: '#55f0a3' },
] as const;

const chartSignals = [
  { href: '/practice/punctuation', label: 'Noisy keys isolated' },
  { href: '/practice/words', label: 'Rhythm stable' },
  { href: '/practice/time-60', label: 'Sprint ready' },
] as const;

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

function MetricCard({ metric, inView }: { metric: (typeof metricCards)[number]; inView: boolean }) {
  const count = useCounter(metric.value, inView);
  const Icon = metric.icon;

  return (
    <Link
      href={metric.href}
      className="group block h-full rounded-[1.35rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
    >
      <motion.div
        className="relative h-full overflow-hidden rounded-[1.35rem] border border-white/[0.075] p-5 sm:p-6"
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{
          background: `radial-gradient(circle at 12% 0%, ${metric.color}24, transparent 34%), linear-gradient(135deg, rgba(8,13,24,0.96), rgba(2,5,11,0.98))`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.055)',
        }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full opacity-35 blur-3xl transition-opacity duration-500 group-hover:opacity-65"
          style={{ backgroundColor: metric.color }}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/[0.09] bg-white/[0.04]"
            style={{ color: metric.color }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            {metric.signal}
          </span>
        </div>

        <div className="relative mt-6">
          <div className="text-[clamp(2.5rem,5vw,4.25rem)] font-black leading-none tracking-normal tabular-nums text-white">
            <span style={{ color: metric.color }}>{count}</span>{metric.suffix}
          </div>
          <div className="mt-2 text-xs font-black uppercase tracking-[0.24em] text-slate-500">{metric.label}</div>
          <div className="mt-2 text-sm font-semibold text-slate-400">{metric.detail}</div>
        </div>

        <div className="relative mt-6 flex items-end gap-1.5">
          {[34, 52, 44, 66, 58, 78].map((height, index) => (
            <motion.span
              key={`${metric.label}-${height}-${index}`}
              className="w-full rounded-t-md bg-white/[0.08]"
              initial={{ height: 10 }}
              animate={inView ? { height } : { height: 10 }}
              transition={{ duration: 0.7, delay: index * 0.07 }}
              style={{
                background: index > 2 ? `linear-gradient(180deg, ${metric.color}, ${metric.color}55)` : undefined,
              }}
            />
          ))}
        </div>
      </motion.div>
    </Link>
  );
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
    }, sectionRef.current);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} data-motion-skip className="relative py-14 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[#02050b]" />

      <div className="section-shell">
        <motion.div
          className="analytics-heading mx-auto mb-16 max-w-6xl text-center"
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#55f0a3]/35 bg-[#071b15]/75 px-4 py-2 shadow-[0_0_36px_rgba(85,240,163,0.14)] backdrop-blur-xl">
            <LineChart className="h-3.5 w-3.5 text-[#55f0a3]" />
            <span className="text-xs font-black uppercase tracking-normal text-[#bcfbd6]">Analytics</span>
          </div>
          <h2 className="mx-auto max-w-6xl text-[clamp(2.65rem,8.2vw,7rem)] font-black uppercase leading-[0.88] tracking-normal text-white">
            <span className="block">Read the</span>
            <span className="block py-[0.08em]">
              <span className="analytics-pop relative mx-1 inline-block -rotate-1 rounded-[0.22em] px-[0.16em] pb-[0.02em] text-[#02120b]">
                signals
              </span>
            </span>
            <span className="block">fix the drift.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-3xl text-sm font-bold uppercase leading-7 tracking-normal text-[#9fb1c8] sm:text-base">
            Pace, precision, consistency, and weak zones turn into a clean training command center.
          </p>
        </motion.div>

        <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((metric) => (
            <MetricCard key={metric.label} metric={metric} inView={inView} />
          ))}
        </div>

        <motion.div
          className="analytics-chart grid gap-5 lg:grid-cols-[1.35fr_0.65fr]"
          initial={{ opacity: 0, y: 42, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-8% 0px' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="relative overflow-hidden rounded-[1.35rem] border border-white/[0.075] p-5 sm:p-6"
            style={{
              background: 'radial-gradient(circle at 16% 0%, rgba(79,141,253,0.18), transparent 34%), linear-gradient(135deg, rgba(7,16,29,0.92) 0%, rgba(2,4,10,0.96) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-300/25 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.08]" />

            <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-black text-white">Weekly command graph</p>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Speed + precision overview</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full border border-[#55f0a3]/20 bg-[#55f0a3]/[0.07] px-3 py-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-[#55f0a3]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#bcfbd6]">7-day upward trend</span>
                </div>
                <Link
                  href="/analytics"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 transition-colors hover:border-[#55f0a3]/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#55f0a3]/80"
                >
                  Open analytics
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            <div className="relative h-64 sm:h-72 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="analytics-wpm-gradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#4f8dfd" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#4f8dfd" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="analytics-accuracy-gradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#55f0a3" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#55f0a3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="day" stroke="#4b5563" tickMargin={10} fontSize={12} />
                  <YAxis stroke="#4b5563" tickMargin={8} width={30} domain={[45, 100]} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(2,4,10,0.95)',
                      border: '1px solid rgba(79,141,253,0.15)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(20px)',
                    }}
                    labelStyle={{ color: '#dfe9ff' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="wpm"
                    stroke="#4f8dfd"
                    strokeWidth={2.5}
                    fill="url(#analytics-wpm-gradient)"
                    activeDot={{
                      r: 5,
                      fill: '#4f8dfd',
                      stroke: '#02040a',
                      strokeWidth: 2,
                      style: { filter: 'drop-shadow(0 0 6px rgba(79,141,253,0.5))' },
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#55f0a3"
                    strokeWidth={2}
                    fill="url(#analytics-accuracy-gradient)"
                    activeDot={{
                      r: 4,
                      fill: '#55f0a3',
                      stroke: '#02040a',
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
              {chartSignals.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-3 transition-colors duration-300 hover:border-[#55f0a3]/25 hover:bg-white/[0.055] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#55f0a3]/80"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Signal 0{index + 1}</span>
                  <p className="mt-1 text-sm font-bold text-slate-300 transition-colors group-hover:text-white">{item.label}</p>
                </Link>
              ))}
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-[1.35rem] border border-white/[0.075] p-5 sm:p-6"
            style={{
              background: 'radial-gradient(circle at 80% 0%, rgba(255,95,162,0.16), transparent 34%), linear-gradient(135deg, rgba(10,13,22,0.96), rgba(2,5,11,0.98))',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.055)',
            }}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#ff5fa2]/30 blur-3xl" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-black text-white">Coach readout</p>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Next best move</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/[0.09] bg-white/[0.04] text-[#ff5fa2]">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            <div className="relative mt-6 space-y-3">
              {insightItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                >
                  <motion.div
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 transition-colors duration-300 group-hover:border-white/[0.14] group-hover:bg-white/[0.055]"
                    whileHover={{ y: -3, scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{item.label}</span>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    </div>
                    <p className="mt-2 text-base font-black text-white">{item.value}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.detail}</p>
                  </motion.div>
                </Link>
              ))}
            </div>

            <Link
              href="/practice/punctuation"
              className="group relative mt-6 block rounded-2xl border border-[#55f0a3]/15 bg-[#55f0a3]/[0.05] p-4 transition-colors duration-300 hover:border-[#55f0a3]/30 hover:bg-[#55f0a3]/[0.075] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#55f0a3]/80"
            >
              <div className="flex items-center justify-between gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#bcfbd6]">
                <span className="inline-flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#55f0a3]" />
                  Precision plan
                </span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Run two punctuation drills, then one speed sprint. Keep errors under three before raising pace.
              </p>
            </Link>
          </div>
        </motion.div>
      </div>
      <style jsx>{`
        .analytics-pop {
          background:
            radial-gradient(circle at 32% 26%, #eafff1 0 8%, transparent 9%),
            linear-gradient(180deg, #9cffc8 0%, #55f0a3 48%, #12b76a 100%);
          box-shadow:
            0 0 0 0.07em #03150c,
            0 0 0 0.13em #b8ffd4,
            0 0 0.28em #55f0a3,
            0 0 0.55em rgba(85, 240, 163, 0.6),
            inset 0 -0.08em 0 rgba(0, 70, 38, 0.42),
            inset 0 0.06em 0 rgba(255, 255, 255, 0.82);
          text-shadow:
            0.035em 0.035em 0 rgba(255, 255, 255, 0.44),
            -0.035em -0.02em 0 rgba(0, 79, 45, 0.28);
        }
      `}</style>
    </section>
  );
}
