"use client";

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen, Gauge, Keyboard, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const learningPaths = [
  {
    href: '/learn?level=beginner',
    title: 'Beginner',
    description: 'Start with posture, rhythm, and clean key reach before pushing speed.',
    lessons: '18 lessons',
    hint: 'Foundation track',
    progress: 35,
    icon: BookOpen,
    color: '#4f8dfd',
  },
  {
    href: '/learn?view=home-row',
    title: 'Home Row',
    description: 'Dial in finger placement and muscle memory with focused core drills.',
    lessons: '12 drills',
    hint: 'Best first milestone',
    progress: 52,
    icon: Keyboard,
    color: '#6fa7ff',
  },
  {
    href: '/learn?track=speed',
    title: 'Speed Building',
    description: 'Increase WPM while keeping rhythm, control, and accuracy in balance.',
    lessons: '14 sessions',
    hint: 'Goal: 70+ WPM',
    progress: 64,
    icon: Gauge,
    color: '#7b61ff',
  },
  {
    href: '/learn?level=advanced',
    title: 'Advanced',
    description: 'Take on dense passages, complex drills, and high-precision reps.',
    lessons: '16 lessons',
    hint: 'High-accuracy track',
    progress: 82,
    icon: Sparkles,
    color: '#dfe9ff',
  },
] as const;

function AnimatedProgress({ value, color, inView }: { value: number; color: string; inView: boolean }) {
  return (
    <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
        initial={{ width: '0%' }}
        animate={inView ? { width: `${value}%` } : { width: '0%' }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      />
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full blur-sm"
        style={{ background: color }}
        initial={{ width: '0%', opacity: 0 }}
        animate={inView ? { width: `${value}%`, opacity: 0.4 } : { width: '0%', opacity: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      />
    </div>
  );
}

export default function LearningPathsPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
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
      gsap.fromTo('.lp-heading', { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
      gsap.fromTo('.lp-card', { y: 60, opacity: 0, rotateY: 8 }, {
        y: 0, opacity: 1, rotateY: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.lp-card', start: 'top 85%', once: true },
      });
    }, sectionRef.current);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-28 lg:py-32">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/4 h-[400px] w-[400px] rounded-full bg-accent-300/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-[#5f9aff]/[0.04] blur-[100px]" />
      </div>

      <div className="section-shell">
        {/* Header */}
        <div className="lp-heading mx-auto mb-16 max-w-3xl text-center" style={{ opacity: 0 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-300/20 bg-accent-300/[0.05] px-4 py-2">
            <BookOpen className="h-3.5 w-3.5 text-accent-300" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-100">Learning Paths</span>
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            A structured route for{' '}
            <span className="bg-gradient-to-r from-accent-300 to-[#8bb6ff] bg-clip-text text-transparent">every typing goal</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-400 lg:text-lg">
            Move from fundamentals to faster, cleaner typing with tracks designed to build precision before raw speed.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {learningPaths.map((path, index) => {
            const Icon = path.icon;
            const isActive = activeIndex === index;

            return (
              <motion.div
                key={path.title}
                className="lp-card"
                style={{ opacity: 0 }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <Link href={path.href} className="group relative block h-full">
                  <motion.div
                    className="relative h-full overflow-hidden rounded-2xl border border-white/[0.04] p-6 transition-colors duration-500"
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, rgba(79,141,253,0.04) 0%, transparent 60%)`
                        : 'transparent',
                    }}
                    animate={{ borderColor: isActive ? 'rgba(79,141,253,0.12)' : 'rgba(255,255,255,0.04)' }}
                  >
                    {/* Top accent */}
                    <motion.div
                      className="absolute inset-x-0 top-0 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${path.color}40, transparent)` }}
                      animate={{ opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.4 }}
                    />

                    <div className="flex items-center justify-between">
                      <motion.div
                        animate={isActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Icon className="h-6 w-6 text-gray-500 transition-colors duration-300 group-hover:text-accent-300" />
                      </motion.div>
                      <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-gray-600">
                        {path.lessons}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-gray-200 transition-colors duration-300 group-hover:text-white">
                      {path.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">
                      {path.description}
                    </p>

                    <div className="mt-6">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.15em]">
                        <span className="text-gray-600">{path.hint}</span>
                        <motion.span
                          className="font-semibold tabular-nums"
                          style={{ color: path.color }}
                          animate={inView ? { opacity: 1 } : { opacity: 0 }}
                        >
                          {path.progress}%
                        </motion.span>
                      </div>
                      <AnimatedProgress value={path.progress} color={path.color} inView={inView} />
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors duration-300 group-hover:text-accent-300">
                      Open path
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View all link */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/learn"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-accent-300"
          >
            View all learning paths
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
