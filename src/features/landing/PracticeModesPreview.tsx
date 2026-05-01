"use client";

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    icon: FileText,
    accent: '#4f8dfd',
  },
  {
    href: '/code-practice',
    title: 'Code Practice',
    description: 'Stay sharp with syntax-heavy snippets built for developer muscle memory.',
    tag: 'Developer',
    icon: Code2,
    accent: '#6fa7ff',
  },
  {
    href: '/ai-practice',
    title: 'AI Practice',
    description: 'Generate fresh prompts, passages, and targeted challenges on demand.',
    tag: 'Adaptive',
    icon: Sparkles,
    accent: '#7b61ff',
  },
  {
    href: '/dictation',
    title: 'Dictation',
    description: 'Improve listening, punctuation, and rhythm through spoken input drills.',
    tag: 'Listening',
    icon: Mic,
    accent: '#5bd2ff',
  },
  {
    href: '/race',
    title: 'Race',
    description: 'Push speed and composure in competitive runs built for quick reactions.',
    tag: 'Competitive',
    icon: Trophy,
    accent: '#dfe9ff',
  },
] as const;

export default function PracticeModesPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.pm-heading', { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
      gsap.fromTo('.pm-card', { y: 50, opacity: 0, scale: 0.92 }, {
        y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: '.pm-card', start: 'top 88%', once: true },
      });
    }, sectionRef.current);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-28 lg:py-32">
      {/* Subtle divider */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-1/4 top-1/3 h-[450px] w-[450px] rounded-full bg-accent-300/[0.025] blur-[130px]" />
      </div>

      <div className="section-shell">
        {/* Header */}
        <div className="pm-heading mx-auto mb-16 max-w-3xl text-center" style={{ opacity: 0 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-300/20 bg-accent-300/[0.05] px-4 py-2">
            <Sparkles className="h-3.5 w-3.5 text-accent-300" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-100">Practice Modes</span>
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Switch modes{' '}
            <span className="bg-gradient-to-r from-[#8bb6ff] to-accent-300 bg-clip-text text-transparent">without losing momentum</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-400 lg:text-lg">
            Train with the mode that matches your goal — from custom passages and code drills to AI sessions and live races.
          </p>
        </div>

        {/* Mode cards — horizontal scroll on mobile, grid on desktop */}
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
                    className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.04] p-5 transition-colors duration-500"
                    whileHover={{ y: -8, scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    animate={{ borderColor: isHovered ? `${mode.accent}20` : 'rgba(255,255,255,0.04)' }}
                  >
                    {/* Hover glow */}
                    <motion.div
                      className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
                      style={{ background: mode.accent }}
                      animate={{ opacity: isHovered ? 0.08 : 0 }}
                      transition={{ duration: 0.4 }}
                    />

                    {/* Top line */}
                    <motion.div
                      className="absolute inset-x-0 top-0 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${mode.accent}50, transparent)` }}
                      animate={{ opacity: isHovered ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />

                    <div className="relative flex items-center justify-between">
                      <motion.div
                        animate={isHovered ? { scale: 1.15, rotate: -8 } : { scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Icon
                          className="h-6 w-6 transition-colors duration-300"
                          style={{ color: isHovered ? mode.accent : '#6b7280' }}
                        />
                      </motion.div>
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300"
                        style={{
                          color: isHovered ? mode.accent : '#6b7280',
                          background: isHovered ? `${mode.accent}10` : 'transparent',
                          border: `1px solid ${isHovered ? `${mode.accent}20` : 'rgba(255,255,255,0.04)'}`,
                        }}
                      >
                        {mode.tag}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-gray-200 transition-colors duration-300 group-hover:text-white">
                      {mode.title}
                    </h3>
                    <p className="mt-2 flex-1 text-[13px] leading-relaxed text-gray-500">
                      {mode.description}
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors duration-300 group-hover:text-accent-300">
                      Open mode
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
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
    </section>
  );
}
