"use client";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
    stage: '01',
    signal: 'Clean baseline',
    route: 'Posture / rhythm / reach',
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
    stage: '02',
    signal: 'Finger map',
    route: 'Home keys / accuracy / recall',
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
    stage: '03',
    signal: 'Tempo control',
    route: 'Pace / burst / recovery',
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
    stage: '04',
    signal: 'Precision reps',
    route: 'Dense text / symbols / flow',
    progress: 82,
    icon: Sparkles,
    color: '#dfe9ff',
  },
] as const;

function AnimatedProgress({ value, color, inView }: { value: number; color: string; inView: boolean }) {
  return (
    <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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
      <div className="absolute inset-y-0 left-[33%] w-px bg-black/35" />
      <div className="absolute inset-y-0 left-[66%] w-px bg-black/35" />
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
      gsap.fromTo('.lp-card', { y: 60, opacity: 0, rotateY: 8 }, {
        y: 0, opacity: 1, rotateY: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.lp-card', start: 'top 85%', once: true },
      });
    }, sectionRef.current);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} data-motion-skip className="relative py-14 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[#02050b]" />

      <div className="section-shell">
        {/* Header */}
        <motion.div
          className="lp-heading mx-auto mb-16 max-w-6xl text-center"
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#6fa7ff]/35 bg-[#08142a]/75 px-4 py-2 shadow-[0_0_36px_rgba(79,141,253,0.16)] backdrop-blur-xl">
            <BookOpen className="h-3.5 w-3.5 text-[#6fa7ff]" />
            <span className="text-xs font-black uppercase tracking-normal text-[#b7d5ff]">Learning Paths</span>
          </div>
          <h2 className="mx-auto max-w-6xl text-[clamp(2.75rem,8.6vw,7.35rem)] font-black uppercase leading-[0.86] tracking-normal text-white">
            <span className="block">No messy typing.</span>
            <span className="block">Pick your</span>
            <span className="block py-[0.08em]">
              <span className="route-pop relative mx-1 inline-block -rotate-1 rounded-[0.22em] px-[0.16em] pb-[0.02em] text-[#02050b]">
                route
              </span>
            </span>
            <span className="block mt-[0.03em]">and move cleaner.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-3xl text-sm font-bold uppercase leading-7 tracking-normal text-[#98a7c7] sm:text-base">
            Fundamentals first. Precision locked. Speed follows when your hands stop guessing.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-5 lg:grid-cols-2">
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
                    className="relative flex min-h-[320px] h-full flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.07] p-6 transition-colors duration-500 sm:p-7"
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{
                      background: isActive
                        ? `radial-gradient(circle at 12% 0%, ${path.color}2e, transparent 34%), linear-gradient(135deg, rgba(12,18,31,0.98), rgba(3,7,14,0.98) 58%, rgba(2,5,11,0.98))`
                        : `radial-gradient(circle at 12% 0%, ${path.color}14, transparent 30%), linear-gradient(135deg, rgba(7,12,22,0.92), rgba(2,5,11,0.98))`,
                      boxShadow: isActive
                        ? `0 30px 90px -54px ${path.color}, inset 0 1px 0 rgba(255,255,255,0.08)`
                        : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                    }}
                    animate={{ borderColor: isActive ? `${path.color}55` : 'rgba(255,255,255,0.07)' }}
                  >
                    <div
                      className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
                      style={{ backgroundColor: path.color }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px] opacity-[0.08]" />
                    <motion.div
                      className="absolute inset-x-0 top-0 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${path.color}, transparent)` }}
                      animate={{ opacity: isActive ? 0.9 : 0.35 }}
                      transition={{ duration: 0.4 }}
                    />

                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <motion.div
                          className="grid h-12 w-12 place-items-center rounded-2xl border border-white/[0.09] bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                          animate={isActive ? { scale: 1.05, rotate: -3 } : { scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          style={{ color: path.color }}
                        >
                          <Icon className="h-5 w-5" />
                        </motion.div>
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-white/35">
                            Track {path.stage}
                          </span>
                          <span className="mt-1 block text-xs font-bold uppercase tracking-[0.2em]" style={{ color: path.color }}>
                            {path.signal}
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        {path.lessons}
                      </span>
                    </div>

                    <div className="relative mt-9">
                      <h3 className="text-2xl font-black tracking-normal text-white transition-colors duration-300 group-hover:text-white sm:text-3xl">
                        {path.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400 sm:text-[15px]">
                        {path.description}
                      </p>
                    </div>

                    <div className="relative mt-6 flex flex-wrap items-center gap-2">
                      {path.route.split(' / ').map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center rounded-full border border-white/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="relative mt-auto pt-8">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.15em]">
                        <span className="font-bold text-slate-500">{path.hint}</span>
                        <motion.span
                          className="font-black tabular-nums"
                          style={{ color: path.color }}
                          animate={inView ? { opacity: 1 } : { opacity: 0 }}
                        >
                          {path.progress}%
                        </motion.span>
                      </div>
                      <AnimatedProgress value={path.progress} color={path.color} inView={inView} />
                    </div>

                    <div className="relative mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2].map((dot) => (
                          <span
                            key={dot}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: dot === 0 || path.progress > 50 + dot * 12 ? path.color : 'rgba(148,163,184,0.28)' }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-slate-400 transition-colors duration-300 group-hover:text-white">
                        Open path
                        <span
                          className="grid h-8 w-8 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] transition-transform duration-300 group-hover:translate-x-1"
                          style={{ color: path.color }}
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
      <style jsx>{`
        .route-pop {
          background:
            radial-gradient(circle at 34% 28%, #dff4ff 0 8%, transparent 9%),
            linear-gradient(180deg, #74d9ff 0%, #2fb9ff 48%, #008ce3 100%);
          box-shadow:
            0 0 0 0.07em #071526,
            0 0 0 0.13em #7ce4ff,
            0 0 0.28em #31c8ff,
            0 0 0.55em rgba(49, 200, 255, 0.72),
            inset 0 -0.08em 0 rgba(0, 29, 62, 0.42),
            inset 0 0.06em 0 rgba(255, 255, 255, 0.8);
          text-shadow:
            0.035em 0.035em 0 rgba(255, 255, 255, 0.45),
            -0.035em -0.02em 0 rgba(0, 55, 105, 0.28);
        }
      `}</style>
    </section>
  );
}
