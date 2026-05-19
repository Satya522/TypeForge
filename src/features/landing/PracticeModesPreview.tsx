"use client";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Code2, FileText, Mic, Sparkles, Trophy } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const practiceModes = [
  {
    href: '/custom-practice',
    title: 'Custom Practice',
    description: 'Paste your own text and drill the exact patterns you want to improve.',
    tag: 'Flexible',
    signal: 'Target weak words',
    metric: 'Custom',
    preview: 'text',
    icon: FileText,
    accent: '#4f8dfd',
  },
  {
    href: '/code-practice',
    title: 'Code Practice',
    description: 'Stay sharp with syntax-heavy snippets built for developer muscle memory.',
    tag: 'Developer',
    signal: 'Syntax rhythm',
    metric: 'Logic',
    preview: 'code',
    icon: Code2,
    accent: '#6fa7ff',
  },
  {
    href: '/ai-practice',
    title: 'AI Practice',
    description: 'Generate fresh prompts, passages, and targeted challenges on demand.',
    tag: 'Adaptive',
    signal: 'Instant drills',
    metric: 'AI',
    preview: 'ai',
    icon: Sparkles,
    accent: '#7b61ff',
  },
  {
    href: '/dictation',
    title: 'Dictation',
    description: 'Improve listening, punctuation, and rhythm through spoken input drills.',
    tag: 'Listening',
    signal: 'Audio recall',
    metric: 'Voice',
    preview: 'wave',
    icon: Mic,
    accent: '#5bd2ff',
  },
  {
    href: '/race',
    title: 'Race',
    description: 'Push speed and composure in competitive runs built for quick reactions.',
    tag: 'Competitive',
    signal: 'Pressure run',
    metric: 'Live',
    preview: 'race',
    icon: Trophy,
    accent: '#dfe9ff',
  },
] as const;

function ModeSignal({ type, accent }: { type: (typeof practiceModes)[number]['preview']; accent: string }) {
  if (type === 'code') {
    return (
      <div className="mode-signal">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        </div>
        <div className="font-code mt-4 space-y-2 text-[11px] font-medium leading-none text-slate-400">
          <div><span style={{ color: accent }}>const</span> speed = precision + rhythm</div>
          <div><span className="text-slate-600">if</span> (errors &lt; 2) pushPace()</div>
          <div className="h-1.5 w-3/4 rounded-full" style={{ backgroundColor: `${accent}66` }} />
        </div>
      </div>
    );
  }

  if (type === 'ai') {
    return (
      <div className="mode-signal">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>
          <Sparkles className="h-3.5 w-3.5" />
          Prompt Engine
        </div>
        <div className="font-code mt-4 rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 text-[11px] font-medium text-slate-300">
          // Generate accuracy drill
        </div>
        <div className="mt-3 flex gap-2">
          {['focus', 'speed', 'symbols'].map((item) => (
            <span key={item} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'wave') {
    return (
      <div className="mode-signal flex items-end gap-2">
        {[28, 48, 36, 62, 44, 70, 38, 54, 30].map((height, index) => (
          <motion.span
            key={`${height}-${index}`}
            className="w-full rounded-full"
            style={{ background: `linear-gradient(180deg, ${accent}, ${accent}44)`, height }}
            animate={{ scaleY: [0.72, 1, 0.78] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.08, ease: 'easeInOut' }}
          />
        ))}
      </div>
    );
  }

  if (type === 'race') {
    return (
      <div className="mode-signal space-y-3">
        {[
          ['01', 'You', '94 WPM'],
          ['02', 'Nora', '89 WPM'],
          ['03', 'Kai', '84 WPM'],
        ].map(([rank, name, stat], index) => (
          <div key={rank} className="flex items-center justify-between gap-3 text-xs">
            <span className="font-black" style={{ color: index === 0 ? accent : '#64748b' }}>{rank}</span>
            <span className="flex-1 font-bold text-slate-300">{name}</span>
            <span className="font-black text-slate-500">{stat}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mode-signal space-y-3">
      {[92, 68, 84].map((width, index) => (
        <div key={width} className="h-3 rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${accent}66, ${accent})` }}
            initial={{ width: '0%' }}
            whileInView={{ width: `${width}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: index * 0.12 }}
          />
        </div>
      ))}
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
        <span>Pattern lock</span>
        <span style={{ color: accent }}>Ready</span>
      </div>
    </div>
  );
}

export default function PracticeModesPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.pm-card', { y: 50, opacity: 0, scale: 0.92 }, {
        y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: '.pm-card', start: 'top 88%', once: true },
      });
    }, sectionRef.current);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} data-motion-skip className="relative py-6 sm:py-8 lg:py-10">
      {/* Subtle divider */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-[#02050b]" />

      <div className="section-shell">
        {/* Header */}
        <motion.div
          className="pm-heading mx-auto mb-16 max-w-6xl text-center"
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#9f7bff]/35 bg-[#130b2a]/75 px-4 py-2 shadow-[0_0_36px_rgba(123,97,255,0.18)] backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 text-[#a78bfa]" />
            <span className="text-xs font-black uppercase tracking-normal text-[#d8ccff]">Practice Modes</span>
          </div>
          <h2 className="mx-auto max-w-6xl text-[clamp(2.6rem,8vw,6.8rem)] font-black uppercase leading-[0.88] tracking-normal text-white">
            <span className="block">Switch the drill.</span>
            <span className="block">
              Keep the{' '}
              <span className="mode-pop relative mx-1 inline-block -rotate-1 rounded-[0.22em] px-[0.16em] pb-[0.02em] text-[#08030f]">
                momentum
              </span>
            </span>
          </h2>
          <p className="mx-auto mt-7 max-w-3xl text-sm font-bold uppercase leading-7 tracking-normal text-[#a9b4cf] sm:text-base">
            Custom text, code, AI prompts, dictation, and races tuned for the exact skill you want next.
          </p>
        </motion.div>

        {/* Mode cards */}
        <div className="grid gap-5 lg:grid-cols-6">
          {practiceModes.map((mode, index) => {
            const Icon = mode.icon;
            const isHovered = hoveredIndex === index;
            const spanClass = index < 3 ? 'lg:col-span-2' : 'lg:col-span-3';

            return (
              <motion.div
                key={mode.title}
                className={`pm-card ${spanClass}`}
                style={{ opacity: 0 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Link href={mode.href} className="group relative block h-full">
                  <motion.div
                    className="relative flex min-h-[360px] h-full flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.07] p-6 transition-colors duration-500 sm:p-7"
                    whileHover={{ y: -8, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    animate={{ borderColor: isHovered ? `${mode.accent}55` : 'rgba(255,255,255,0.07)' }}
                    style={{
                      background: isHovered
                        ? `radial-gradient(circle at 20% 0%, ${mode.accent}2f, transparent 34%), linear-gradient(135deg, rgba(12,18,31,0.98), rgba(4,7,15,0.98) 62%, rgba(2,5,11,0.98))`
                        : `radial-gradient(circle at 20% 0%, ${mode.accent}16, transparent 32%), linear-gradient(135deg, rgba(7,12,22,0.94), rgba(2,5,11,0.98))`,
                      boxShadow: isHovered
                        ? `0 30px 90px -54px ${mode.accent}, inset 0 1px 0 rgba(255,255,255,0.08)`
                        : 'inset 0 1px 0 rgba(255,255,255,0.045)',
                    }}
                  >
                    <div
                      className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full opacity-35 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
                      style={{ backgroundColor: mode.accent }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.10)_1px,transparent_0)] bg-[size:22px_22px] opacity-[0.05]" />
                    <motion.div
                      className="absolute inset-x-0 top-0 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${mode.accent}, transparent)` }}
                      animate={{ opacity: isHovered ? 0.9 : 0.35 }}
                      transition={{ duration: 0.3 }}
                    />

                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <motion.div
                          className="grid h-12 w-12 place-items-center rounded-2xl border border-white/[0.09] bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                          animate={isHovered ? { scale: 1.06, rotate: -5 } : { scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          style={{ color: mode.accent }}
                        >
                          <Icon className="h-5 w-5" />
                        </motion.div>
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-white/35">
                            Mode 0{index + 1}
                          </span>
                          <span className="mt-1 block text-xs font-bold uppercase tracking-[0.2em]" style={{ color: mode.accent }}>
                            {mode.signal}
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        {mode.tag}
                      </span>
                    </div>

                    <div className="relative mt-8">
                      <h3 className="text-2xl font-black tracking-normal text-white sm:text-3xl">
                        {mode.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400 sm:text-[15px]">
                        {mode.description}
                      </p>
                    </div>

                    <div className="relative mt-6">
                      <ModeSignal type={mode.preview} accent={mode.accent} />
                    </div>

                    <div className="relative mt-auto flex items-center justify-between pt-6">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {mode.metric} signal
                      </span>
                      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-slate-400 transition-colors duration-300 group-hover:text-white">
                        Open mode
                        <span
                          className="grid h-8 w-8 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] transition-transform duration-300 group-hover:translate-x-1"
                          style={{ color: mode.accent }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/practice"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-accent-300"
          >
            Explore all modes
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
      <style jsx>{`
        .mode-pop {
          background:
            radial-gradient(circle at 32% 26%, #f6edff 0 8%, transparent 9%),
            linear-gradient(180deg, #d9c7ff 0%, #9b5cff 50%, #6d28d9 100%);
          box-shadow:
            0 0 0 0.07em #150923,
            0 0 0 0.13em #d9c7ff,
            0 0 0.28em #9b5cff,
            0 0 0.55em rgba(155, 92, 255, 0.65),
            inset 0 -0.08em 0 rgba(36, 10, 76, 0.45),
            inset 0 0.06em 0 rgba(255, 255, 255, 0.82);
          text-shadow:
            0.035em 0.035em 0 rgba(255, 255, 255, 0.48),
            -0.035em -0.02em 0 rgba(38, 9, 79, 0.32);
        }

        .mode-signal {
          min-height: 7rem;
          border-radius: 1.05rem;
          border: 1px solid rgba(255, 255, 255, 0.075);
          background:
            linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02)),
            rgba(0, 0, 0, 0.14);
          padding: 1rem;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.045);
        }
      `}</style>
    </section>
  );
}
