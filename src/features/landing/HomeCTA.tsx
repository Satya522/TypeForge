"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Gauge, Keyboard, Rocket, Sparkles, Target } from 'lucide-react';

const trainingSignals = [
  {
    href: '/learn/beginner',
    label: 'Start clean',
    detail: 'Guided lessons put posture, rhythm, and reach in order first.',
    stat: '01',
    icon: BookOpen,
    color: '#4f8dfd',
  },
  {
    href: '/practice',
    label: 'Drill sharp',
    detail: 'Switch into custom text, code, AI prompts, dictation, or race pressure.',
    stat: '05',
    icon: Keyboard,
    color: '#a78bfa',
  },
  {
    href: '/analytics',
    label: 'Raise pace',
    detail: 'Use analytics to fix drift before you push for raw speed.',
    stat: '98%',
    icon: Gauge,
    color: '#55f0a3',
  },
] as const;

export default function HomeCTA() {
  return (
    <section data-motion-skip className="relative overflow-hidden py-8 sm:py-10 lg:py-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[#02050b]" />

      <div className="section-shell">
        <motion.div
          className="mx-auto max-w-6xl text-center"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#ffcf4a]/35 bg-[#241a05]/75 px-4 py-2 shadow-[0_0_36px_rgba(255,207,74,0.15)] backdrop-blur-xl">
            <Rocket className="h-3.5 w-3.5 text-[#ffcf4a]" />
            <span className="text-xs font-black uppercase tracking-normal text-[#ffe9a8]">Start Your Training</span>
          </div>

          <h2 className="mx-auto max-w-6xl text-[clamp(2.65rem,8.2vw,7rem)] font-black uppercase leading-[0.88] tracking-normal text-white">
            <span className="block">Start clean.</span>
            <span className="block">
              Build real{' '}
              <span className="training-pop relative mx-1 inline-block -rotate-1 rounded-[0.22em] px-[0.16em] pb-[0.02em] text-[#171000]">
                speed
              </span>
            </span>
            <span className="block">without guessing.</span>
          </h2>

          <p className="mx-auto mt-7 max-w-3xl text-sm font-bold uppercase leading-7 tracking-normal text-[#aeb8cb] sm:text-base">
            Lessons, practice modes, and analytics work together so every session has a clear next move.
          </p>
        </motion.div>

        <motion.div
          className="mt-14 grid gap-5 lg:grid-cols-3"
          initial={{ opacity: 0, y: 38 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-8% 0px' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        >
          {trainingSignals.map((signal) => {
            const Icon = signal.icon;
            return (
              <Link
                key={signal.label}
                href={signal.href}
                className="group block h-full rounded-[1.35rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
              >
                <motion.div
                  className="relative flex h-full min-h-[290px] flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.075] p-6 sm:p-7"
                  whileHover={{ y: -7, scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  style={{
                    background: `radial-gradient(circle at 12% 0%, ${signal.color}24, transparent 34%), linear-gradient(135deg, rgba(8,13,24,0.96), rgba(2,5,11,0.98))`,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.055)',
                  }}
                >
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-35 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
                    style={{ backgroundColor: signal.color }}
                  />
                  <div className="relative flex items-start justify-between gap-4">
                    <div
                      className="grid h-12 w-12 place-items-center rounded-2xl border border-white/[0.09] bg-white/[0.04]"
                      style={{ color: signal.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[clamp(2.2rem,4.5vw,4rem)] font-black leading-none tabular-nums" style={{ color: signal.color }}>
                      {signal.stat}
                    </span>
                  </div>

                  <div className="relative mt-12">
                    <span className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Training signal</span>
                    <h3 className="mt-2 text-2xl font-black tracking-normal text-white sm:text-3xl">{signal.label}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-[15px]">{signal.detail}</p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

        <motion.div
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href="/learn"
            className="group relative inline-flex min-h-[3.4rem] w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-[#ffcf4a] px-8 text-sm font-black uppercase tracking-[0.12em] text-[#171000] shadow-[0_18px_55px_rgba(255,207,74,0.22)] transition-transform duration-300 hover:-translate-y-1 sm:w-auto"
          >
            <span className="relative z-10">Explore Learning Paths</span>
            <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            <span className="absolute inset-0 translate-x-[-110%] bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover:translate-x-[110%]" />
          </Link>

          <Link
            href="/practice"
            className="group inline-flex min-h-[3.4rem] w-full items-center justify-center gap-3 rounded-full border border-white/[0.09] bg-white/[0.035] px-8 text-sm font-black uppercase tracking-[0.12em] text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-[#a78bfa]/35 hover:text-white sm:w-auto"
          >
            Open Practice Modes
            <Sparkles className="h-4 w-4 text-[#a78bfa] transition-transform duration-300 group-hover:rotate-12" />
          </Link>

          <Link
            href="/analytics"
            className="group inline-flex min-h-[3.4rem] w-full items-center justify-center gap-3 rounded-full border border-white/[0.09] bg-white/[0.035] px-8 text-sm font-black uppercase tracking-[0.12em] text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-[#55f0a3]/35 hover:text-white sm:w-auto"
          >
            View Analytics
            <Target className="h-4 w-4 text-[#55f0a3] transition-transform duration-300 group-hover:scale-110" />
          </Link>
        </motion.div>
      </div>

      <style jsx>{`
        .training-pop {
          background:
            radial-gradient(circle at 32% 26%, #fff6ca 0 8%, transparent 9%),
            linear-gradient(180deg, #ffe98d 0%, #ffcf4a 48%, #f59e0b 100%);
          box-shadow:
            0 0 0 0.07em #1c1200,
            0 0 0 0.13em #fff0a9,
            0 0 0.28em #ffcf4a,
            0 0 0.55em rgba(255, 207, 74, 0.58),
            inset 0 -0.08em 0 rgba(110, 65, 0, 0.42),
            inset 0 0.06em 0 rgba(255, 255, 255, 0.82);
          text-shadow:
            0.035em 0.035em 0 rgba(255, 255, 255, 0.44),
            -0.035em -0.02em 0 rgba(99, 61, 0, 0.28);
        }
      `}</style>
    </section>
  );
}
