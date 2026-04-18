"use client";

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Code, FileText, Microphone, Sparkle, Trophy, Play, LockKey } from '@phosphor-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const practiceModes = [
  {
    href: '/custom-practice',
    title: 'Custom Practice',
    description: 'Paste your own text and drill the exact patterns you want to improve.',
    tag: 'Flexible',
    icon: FileText,
    accent: '#39ff14',
    stat: '∞ texts',
  },
  {
    href: '/code-practice',
    title: 'Code Practice',
    description: 'Stay sharp with syntax-heavy snippets built for developer muscle memory.',
    tag: 'Developer',
    icon: Code,
    accent: '#4ade80',
    stat: '18 languages',
    badge: 'HOT',
  },
  {
    href: '/ai-practice',
    title: 'AI Practice',
    description: 'Generate fresh prompts, passages, and targeted challenges on demand.',
    tag: 'Adaptive',
    icon: Sparkle,
    accent: '#a855f7',
    stat: 'GPT-powered',
    badge: 'NEW',
  },
  {
    href: '/dictation',
    title: 'Dictation',
    description: 'Improve listening, punctuation, and rhythm through spoken input drills.',
    tag: 'Listening',
    icon: Microphone,
    accent: '#06b6d4',
    stat: 'Voice sync',
  },
  {
    href: '/race',
    title: 'Race Mode',
    description: 'Push speed and composure in live competitive runs with real opponents.',
    tag: 'Competitive',
    icon: Trophy,
    accent: '#f59e0b',
    stat: 'Multiplayer',
    badge: 'LIVE',
  },
] as const;

export default function PracticeModesPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.pm-heading', { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
      gsap.fromTo('.pm-card', { y: 60, opacity: 0, scale: 0.9 }, {
        y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.pm-card', start: 'top 90%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 lg:py-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-1/4 top-1/3 h-[500px] w-[500px] rounded-full blur-[140px]" style={{ background: 'rgba(57,255,20,0.02)' }} />
        <div className="absolute left-1/4 bottom-1/3 h-[350px] w-[350px] rounded-full blur-[100px]" style={{ background: 'rgba(168,85,247,0.02)' }} />
      </div>

      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14 xl:px-20">
        {/* Header */}
        <div className="pm-heading mx-auto mb-20 max-w-3xl text-center" style={{ opacity: 0 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#39FF14]/20 bg-[#39FF14]/[0.05] px-5 py-2">
            <Sparkle weight="duotone" className="h-3.5 w-3.5 text-[#39FF14]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#39FF14]/90">Practice Modes</span>
          </div>
          <h2 className="mb-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Switch modes{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #4ade80 0%, #39FF14 50%, #06b6d4 100%)' }}>
              without losing momentum
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-500 lg:text-lg">
            Train with the mode that matches your goal — from custom passages and code drills to AI sessions and live races.
          </p>
        </div>

        {/* Mode cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {practiceModes.map((mode, index) => {
            const Icon = mode.icon;
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={mode.title}
                className="pm-card"
                style={{ opacity: 0 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Link href={mode.href} className="group relative block h-full">
                  <motion.div
                    className="relative flex h-full flex-col overflow-hidden rounded-2xl border p-5"
                    style={{
                      background: isHovered ? `linear-gradient(160deg, ${mode.accent}09 0%, transparent 60%)` : 'rgba(255,255,255,0.01)',
                      transition: 'background 0.4s ease, border-color 0.4s ease, transform 0.3s ease',
                    }}
                    whileHover={{ y: -10, scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    animate={{ borderColor: isHovered ? `${mode.accent}30` : 'rgba(255,255,255,0.05)' }}
                  >
                    {/* Hover glow */}
                    <motion.div
                      className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-[50px]"
                      style={{ background: mode.accent }}
                      animate={{ opacity: isHovered ? 0.1 : 0 }}
                      transition={{ duration: 0.4 }}
                    />
                    {/* Top line */}
                    <motion.div
                      className="absolute inset-x-0 top-0 h-[2px]"
                      style={{ background: `linear-gradient(90deg, transparent, ${mode.accent}, transparent)` }}
                      animate={{ opacity: isHovered ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Icon + badge */}
                    <div className="relative mb-5 flex items-center justify-between">
                      <motion.div
                        className="flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-300"
                        style={{
                          borderColor: isHovered ? `${mode.accent}35` : 'rgba(255,255,255,0.06)',
                          background: isHovered ? `${mode.accent}12` : 'rgba(255,255,255,0.03)',
                        }}
                        animate={isHovered ? { rotate: [0, -8, 8, 0], scale: 1.12 } : { rotate: 0, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Icon weight="duotone" className="h-6 w-6 transition-colors duration-300" style={{ color: isHovered ? mode.accent : '#555' }} />
                      </motion.div>

                      <div className="flex flex-col items-end gap-1">
                        {'badge' in mode && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest"
                            style={{
                              color: mode.accent,
                              background: `${mode.accent}15`,
                              border: `1px solid ${mode.accent}25`,
                            }}
                          >
                            {mode.badge}
                          </span>
                        )}
                        <span
                          className="rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] transition-all duration-300"
                          style={{
                            color: isHovered ? mode.accent : '#444',
                            border: `1px solid ${isHovered ? mode.accent + '25' : 'rgba(255,255,255,0.04)'}`,
                          }}
                        >
                          {mode.tag}
                        </span>
                      </div>
                    </div>

                    <h3 className="mb-2 text-lg font-black text-gray-200 transition-colors duration-300 group-hover:text-white">
                      {mode.title}
                    </h3>
                    <p className="flex-1 text-[13px] leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-400">
                      {mode.description}
                    </p>

                    {/* Stat chip */}
                    <div className="mt-4 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300"
                      style={{ color: isHovered ? `${mode.accent}90` : '#333' }}
                    >
                      {mode.stat}
                    </div>

                    {/* CTA */}
                    <div className="mt-4 flex items-center gap-2 text-[13px] font-bold text-gray-700 transition-all duration-300 group-hover:gap-3"
                      style={{ color: isHovered ? mode.accent : undefined }}>
                      <Play weight="duotone" className="h-3 w-3" />
                      Open mode
                      <ArrowRight weight="bold" className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/practice" className="group inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-6 py-3 text-sm font-semibold text-gray-500 transition-all hover:border-[#39FF14]/20 hover:bg-[#39FF14]/[0.04] hover:text-[#39FF14]">
            Explore all modes
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
