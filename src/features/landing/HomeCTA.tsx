"use client";

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
    <section ref={sectionRef} className="relative py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

      <div className="section-shell">
        <div className="cta-content relative mx-auto max-w-4xl text-center" style={{ opacity: 0 }}>
          {/* Background orbs */}
          <div className="pointer-events-none absolute -z-10">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-40 -top-20 h-[400px] w-[400px] rounded-full bg-accent-300/[0.06] blur-[100px]"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.03, 0.06, 0.03] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -right-32 top-0 h-[350px] w-[350px] rounded-full bg-emerald-500/[0.05] blur-[100px]"
            />
          </div>

          {/* Eyebrow */}
          <motion.div
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent-300/25 bg-accent-300/[0.06] px-4 py-2"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="h-3.5 w-3.5 text-accent-300" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-100">
              Start Your Training
            </span>
          </motion.div>

          {/* Headline */}
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            Build speed, accuracy, and{' '}
            <span className="bg-gradient-to-r from-accent-300 via-emerald-400 to-accent-200 bg-clip-text text-transparent">
              confidence
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-400 lg:text-lg">
            Start with structured lessons, sharpen your rhythm with premium practice, and track every gain
            with analytics that make progress obvious.
          </p>

          {/* Feature chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {['Guided curriculum', 'Focused practice', 'Progress analytics'].map((point) => (
              <motion.span
                key={point}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] px-4 py-2 text-xs font-medium text-gray-400 transition-colors hover:border-accent-300/15 hover:text-accent-300"
                whileHover={{ y: -2, scale: 1.04 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <span className="h-1 w-1 rounded-full bg-accent-300/50" />
                {point}
              </motion.span>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/learn">
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Button variant="primary" size="lg" className="group relative gap-2 overflow-hidden px-10">
                  <span className="relative z-10">Explore Learning Paths</span>
                  <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-accent-300 via-emerald-400 to-accent-300 opacity-0 transition-opacity group-hover:opacity-20"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                </Button>
              </motion.div>
            </Link>
            <Link href="/practice">
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Button variant="secondary" size="lg" className="gap-2 border-white/10 px-10 hover:border-accent-300/20">
                  Open Practice Modes
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </div>

          {/* Subtle bottom decoration */}
          <motion.div
            className="mx-auto mt-16 h-px w-32 bg-gradient-to-r from-transparent via-accent-300/30 to-transparent"
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: 128, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
        </div>
      </div>
    </section>
  );
}
