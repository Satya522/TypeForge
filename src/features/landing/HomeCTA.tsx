"use client";

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CaretRight, Terminal } from '@phosphor-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const featureChips = [
  'Guided curriculum',
  'Focused practice',
  'Progress analytics',
  'AI-generated drills',
  'Live race mode',
];

export default function HomeCTA() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.cta-content', { y: 60, opacity: 0, scale: 0.96 }, {
        y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 lg:py-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14 xl:px-20">
        {/* Outer glow ring */}
        <div className="cta-content relative mx-auto max-w-5xl" style={{ opacity: 0 }}>

          {/* Beast card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] p-10 sm:p-14 lg:p-20 text-center"
            style={{ background: 'linear-gradient(160deg, #0a120a 0%, #060a06 50%, #0a0e12 100%)' }}
          >
            {/* Top neon line */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#39FF14] to-transparent" />
            {/* Scanlines */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.015]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.3) 2px, rgba(57,255,20,0.3) 3px)', backgroundSize: '100% 5px' }}
            />

            {/* Animated orbs */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.1, 0.04] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute -left-32 -top-16 h-80 w-80 rounded-full blur-[90px]"
              style={{ background: '#39FF14' }}
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.07, 0.03] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="pointer-events-none absolute -right-24 -bottom-12 h-72 w-72 rounded-full blur-[80px]"
              style={{ background: '#a855f7' }}
            />
            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#39FF14]/20 rounded-tl-xl" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#39FF14]/20 rounded-tr-xl" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#39FF14]/20 rounded-bl-xl" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#39FF14]/20 rounded-br-xl" />

            <div className="relative z-10">
              {/* Eyebrow */}
              <motion.div
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#39FF14]/25 bg-[#39FF14]/[0.06] px-5 py-2.5"
                whileHover={{ scale: 1.05, borderColor: 'rgba(57,255,20,0.5)' }}
              >
                <Terminal weight="duotone" className="h-3.5 w-3.5 text-[#39FF14]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#39FF14]/90">
                  Start Your Training
                </span>
                <span className="inline-block w-1 h-3.5 bg-[#39FF14]/60 rounded-sm animate-pulse" />
              </motion.div>

              {/* Headline */}
              <h2 className="mb-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                Build speed, accuracy,{' '}
                <br className="hidden sm:block" />
                and{' '}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #39FF14 0%, #86efac 50%, #39FF14 100%)' }}>
                  confidence
                </span>
              </h2>

              <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-gray-500 lg:text-lg">
                Start with structured lessons, sharpen your rhythm with premium practice, and track every gain
                with analytics that make progress obvious.
              </p>

              {/* Feature chips */}
              <div className="mb-12 flex flex-wrap items-center justify-center gap-2.5">
                {featureChips.map((point, i) => (
                  <motion.span
                    key={point}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-[11px] font-semibold text-gray-500 transition-all hover:border-[#39FF14]/20 hover:text-[#39FF14] cursor-default"
                    whileHover={{ y: -3, scale: 1.05 }}
                  >
                    <span className="h-1 w-1 rounded-full bg-[#39FF14]/50" />
                    {point}
                  </motion.span>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/learn">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative flex items-center gap-2.5 overflow-hidden rounded-2xl bg-[#39FF14] px-10 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:bg-white hover:shadow-[0_0_50px_rgba(57,255,20,0.5)]"
                  >
                    <span className="relative z-10">Explore Learning Paths</span>
                    <ArrowRight weight="bold" className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.button>
                </Link>
                <Link href="/practice">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-10 py-4 text-sm font-bold tracking-wide text-gray-300 backdrop-blur-sm transition-all hover:border-[#39FF14]/25 hover:bg-[#39FF14]/[0.06] hover:text-white"
                  >
                    Open Practice Modes
                    <CaretRight weight="bold" className="h-4 w-4" />
                  </motion.button>
                </Link>
              </div>

              {/* Terminal bottom hint */}
              <div className="mt-12 font-mono text-[11px] text-gray-800 flex items-center justify-center gap-2">
                <span className="text-[#39FF14]/30">&gt;</span>
                <span>typeforge</span>
                <span className="text-[#39FF14]/30">--start</span>
                <span className="text-[#39FF14]/60">training</span>
                <span className="inline-block w-1.5 h-3.5 bg-[#39FF14]/30 rounded-sm animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
