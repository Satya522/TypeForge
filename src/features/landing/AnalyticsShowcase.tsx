"use client";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendUp, Lightning, Target, Fire, ChartBar } from '@phosphor-icons/react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const trendData = [
  { day: 'Mon', wpm: 52, accuracy: 91 },
  { day: 'Tue', wpm: 58, accuracy: 93 },
  { day: 'Wed', wpm: 61, accuracy: 94 },
  { day: 'Thu', wpm: 66, accuracy: 95 },
  { day: 'Fri', wpm: 71, accuracy: 96 },
  { day: 'Sat', wpm: 74, accuracy: 97 },
  { day: 'Sun', wpm: 78, accuracy: 98 },
];

const metricCards = [
  { label: 'WPM', value: 78, suffix: '', detail: '+18% this week', color: '#39ff14', icon: Lightning },
  { label: 'Accuracy', value: 98, suffix: '%', detail: 'Target locked', color: '#4ade80', icon: Target },
  { label: 'Consistency', value: 89, suffix: '%', detail: 'Stable rhythm', color: '#34d399', icon: ChartBar },
  { label: 'Streak', value: 14, suffix: 'd', detail: 'Days active', color: '#f59e0b', icon: Fire },
] as const;

const insightItems = [
  { label: 'Weak zone', value: 'Punctuation', emoji: '🎯', color: '#f59e0b' },
  { label: 'Best mode', value: 'Code Practice', emoji: '💻', color: '#06b6d4' },
  { label: 'Next goal', value: '80 WPM Sprint', emoji: '🚀', color: '#39ff14' },
] as const;

function useCounter(target: number, inView: boolean, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, inView, duration]);
  return count;
}

function MetricCard({ metric, inView }: { metric: typeof metricCards[number]; inView: boolean }) {
  const count = useCounter(metric.value, inView);
  const Icon = metric.icon;
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      className="group flex flex-col items-center cursor-default"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      whileHover={{ y: -8, scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
    >
      <div className="relative mb-2 flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300"
        style={{ borderColor: hov ? `${metric.color}30` : 'rgba(255,255,255,0.06)', background: hov ? `${metric.color}10` : 'rgba(255,255,255,0.03)' }}
      >
        <Icon weight="duotone" className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" style={{ color: hov ? metric.color : 'rgba(255,255,255,0.7)' }} />
        {hov && <div className="absolute inset-0 rounded-xl blur-md" style={{ background: `${metric.color}20` }} />}
      </div>
      <span className="text-4xl font-black tabular-nums sm:text-5xl transition-all duration-300"
        style={{ color: metric.color, textShadow: hov ? `0 0 20px ${metric.color}60` : 'none' }}
      >
        {count}{metric.suffix}
      </span>
      <span className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-gray-600">{metric.label}</span>
      <span className="mt-1 text-[11px] text-gray-700 transition-colors duration-300 group-hover:text-gray-500">{metric.detail}</span>
    </motion.div>
  );
}

export default function AnalyticsShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current, start: 'top 70%', once: true,
        onEnter: () => setInView(true),
      });
      gsap.fromTo('.analytics-heading', { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
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
    <section ref={sectionRef} className="relative py-24 sm:py-32 lg:py-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/3 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full blur-[150px]" style={{ background: 'rgba(57,255,20,0.02)' }} />
      </div>

      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14 xl:px-20">
        {/* Header */}
        <div className="analytics-heading mx-auto mb-20 max-w-3xl text-center" style={{ opacity: 0 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#39FF14]/20 bg-[#39FF14]/[0.05] px-5 py-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#39FF14]/90">Analytics</span>
          </div>
          <h2 className="mb-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Progress you can{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #39FF14 0%, #34d399 50%, #06b6d4 100%)' }}>
              actually read
            </span>{' '}
            at a glance
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-500 lg:text-lg">
            Every session turns into clear signals — your pace, precision, streak, and the trends showing your growth.
          </p>
        </div>

        {/* Metric counters */}
        <div className="mb-16 flex flex-wrap items-center justify-center gap-12 sm:gap-20">
          {metricCards.map((metric) => (
            <MetricCard key={metric.label} metric={metric} inView={inView} />
          ))}
        </div>

        {/* Chart panel */}
        <div className="analytics-chart mx-auto max-w-5xl" style={{ opacity: 0 }}>
          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 transition-all duration-500 hover:border-white/[0.1] hover:shadow-[0_0_40px_rgba(57,255,20,0.04)] sm:p-8"
            style={{ background: 'linear-gradient(135deg, rgba(10,14,10,0.95) 0%, rgba(5,8,5,0.98) 100%)', backdropFilter: 'blur(24px)' }}
          >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#39FF14]/40 to-transparent" />
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'rgba(57,255,20,0.08)' }} />

            {/* Chart header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">Weekly Performance</p>
                <p className="text-xs text-gray-600">Speed + precision overview</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#39FF14] shadow-[0_0_6px_#39FF14]" />
                  <span className="text-[10px] font-bold text-gray-600">WPM</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-[#39FF14]/20 bg-[#39FF14]/[0.06] px-3 py-1">
                  <TrendUp weight="bold" className="h-3 w-3 text-[#39FF14]" />
                  <span className="text-[10px] font-bold text-[#39FF14]/90">+50% growth</span>
                </div>
              </div>
            </div>

            <div className="h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="wpmGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#39ff14" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#39ff14" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="day" stroke="#3a3a3a" tick={{ fontSize: 11, fill: '#555' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#3a3a3a" tick={{ fontSize: 11, fill: '#555' }} width={30} domain={[45, 85]} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(5,8,5,0.96)', border: '1px solid rgba(57,255,20,0.15)', borderRadius: '14px', backdropFilter: 'blur(20px)' }}
                    labelStyle={{ color: '#bcff9d', fontWeight: 'bold', fontSize: 12 }}
                    itemStyle={{ color: '#f3f4f6', fontSize: 12 }}
                  />
                  <ReferenceLine y={70} stroke="rgba(57,255,20,0.1)" strokeDasharray="4 4" label={{ value: 'Target', position: 'right', fill: '#39FF14', fontSize: 9, opacity: 0.5 }} />
                  <Area type="monotone" dataKey="wpm" stroke="#39ff14" strokeWidth={2.5} fill="url(#wpmGrad)"
                    activeDot={{ r: 6, fill: '#39ff14', stroke: '#060908', strokeWidth: 2, style: { filter: 'drop-shadow(0 0 8px rgba(57,255,20,0.6))' } }}
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
                className="group flex cursor-default items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-5 py-3 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04]"
                whileHover={{ y: -4, scale: 1.04 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              >
                <span className="text-xl">{item.emoji}</span>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-700">{item.label}</span>
                  <p className="text-sm font-bold text-gray-300 transition-colors duration-300 group-hover:text-white">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Link to full analytics */}
        <motion.div className="mt-12 text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
          <Link href="/analytics" className="group inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-6 py-3 text-sm font-semibold text-gray-500 transition-all hover:border-[#39FF14]/20 hover:bg-[#39FF14]/[0.04] hover:text-[#39FF14]">
            View your analytics
            <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
