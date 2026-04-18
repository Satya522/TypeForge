"use client";

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen, Gauge, Keyboard, Sparkle, LockKey, CheckCircle } from '@phosphor-icons/react';
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
    color: '#39ff14',
    tag: 'STARTER',
  },
  {
    href: '/learn?view=home-row',
    title: 'Home Row',
    description: 'Dial in finger placement and muscle memory with focused core drills.',
    lessons: '12 drills',
    hint: 'Best first milestone',
    progress: 52,
    icon: Keyboard,
    color: '#4ade80',
    tag: 'CORE',
  },
  {
    href: '/learn?track=speed',
    title: 'Speed Building',
    description: 'Increase WPM while keeping rhythm, control, and accuracy in balance.',
    lessons: '14 sessions',
    hint: 'Goal: 70+ WPM',
    progress: 64,
    icon: Gauge,
    color: '#34d399',
    tag: 'SPEED',
  },
  {
    href: '/learn?level=advanced',
    title: 'Advanced',
    description: 'Take on dense passages, complex drills, and high-precision reps.',
    lessons: '16 lessons',
    hint: 'High-accuracy track',
    progress: 82,
    icon: Sparkle,
    color: '#a855f7',
    tag: 'ELITE',
  },
] as const;

function AnimatedProgressBar({ value, color, inView }: { value: number; color: string; inView: boolean }) {
  return (
    <div className="relative mt-4 h-1 w-full overflow-hidden rounded-full bg-white/[0.04]">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}60, ${color})` }}
        initial={{ width: '0%' }}
        animate={inView ? { width: `${value}%` } : { width: '0%' }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      />
      {/* Shimmer */}
      {inView && (
        <motion.div
          className="absolute inset-y-0 left-0 w-24 rounded-full blur-sm"
          style={{ background: color }}
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: `${value * 3}%`, opacity: [0, 0.5, 0] }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        />
      )}
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
        trigger: sectionRef.current, start: 'top 70%', once: true,
        onEnter: () => setInView(true),
      });
      gsap.fromTo('.lp-heading', { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
      gsap.fromTo('.lp-card', { y: 70, opacity: 0, scale: 0.93 }, {
        y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.lp-card', start: 'top 88%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 lg:py-40">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/4 h-[500px] w-[500px] rounded-full blur-[120px]" style={{ background: 'rgba(57,255,20,0.025)' }} />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full blur-[100px]" style={{ background: 'rgba(168,85,247,0.02)' }} />
      </div>

      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14 xl:px-20">
        {/* Header */}
        <div className="lp-heading mx-auto mb-20 max-w-3xl text-center" style={{ opacity: 0 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#39FF14]/20 bg-[#39FF14]/[0.05] px-5 py-2">
            <BookOpen className="h-3.5 w-3.5 text-[#39FF14]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#39FF14]/90">Learning Paths</span>
          </div>
          <h2 className="mb-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            A structured route for{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #39FF14 0%, #86efac 60%, #39FF14 100%)' }}>
              every typing goal
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-500 lg:text-lg">
            Move from fundamentals to faster, cleaner typing with tracks designed to build precision before raw speed.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {learningPaths.map((path, index) => {
            const Icon = path.icon;
            const isActive = activeIndex === index;
            return (
              <div key={path.title} className="lp-card" style={{ opacity: 0 }} onMouseEnter={() => setActiveIndex(index)}>
                <Link href={path.href} className="group block h-full">
                  <motion.div
                    className="relative h-full overflow-hidden rounded-2xl border p-6"
                    style={{
                      background: isActive
                        ? `linear-gradient(145deg, ${path.color}08 0%, transparent 60%)`
                        : 'rgba(255,255,255,0.01)',
                      transition: 'background 0.4s ease, border-color 0.4s ease, transform 0.3s ease',
                    }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                    animate={{ borderColor: isActive ? `${path.color}25` : 'rgba(255,255,255,0.05)' }}
                  >
                    {/* Top accent */}
                    <motion.div
                      className="absolute inset-x-0 top-0 h-[2px]"
                      style={{ background: `linear-gradient(90deg, transparent, ${path.color}, transparent)` }}
                      animate={{ opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    {/* Ambient glow */}
                    <motion.div
                      className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-3xl"
                      style={{ background: path.color }}
                      animate={{ opacity: isActive ? 0.06 : 0 }}
                      transition={{ duration: 0.5 }}
                    />

                    {/* Tag badge */}
                    <div className="mb-6 flex items-center justify-between">
                      <motion.div
                        className="flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300"
                        style={{
                          borderColor: isActive ? `${path.color}30` : 'rgba(255,255,255,0.06)',
                          background: isActive ? `${path.color}10` : 'rgba(255,255,255,0.03)',
                        }}
                        animate={isActive ? { rotate: [0, -6, 6, 0], scale: 1.1 } : { rotate: 0, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon weight="duotone" className="h-5 w-5 transition-colors duration-400" style={{ color: isActive ? path.color : 'rgba(255,255,255,0.5)' }} />
                      </motion.div>
                      <span
                        className="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300"
                        style={{
                          color: isActive ? path.color : '#444',
                          background: isActive ? `${path.color}12` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isActive ? path.color + '20' : 'rgba(255,255,255,0.04)'}`,
                        }}
                      >
                        {path.tag}
                      </span>
                    </div>

                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-700">{path.lessons}</div>
                    <h3 className="mb-3 text-2xl font-black text-gray-200 transition-colors duration-300 group-hover:text-white">
                      {path.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-400">
                      {path.description}
                    </p>

                    {/* Progress */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em]">
                        <span className="text-gray-700">{path.hint}</span>
                        <motion.span
                          className="font-black tabular-nums"
                          style={{ color: path.color }}
                          animate={inView ? { opacity: 1 } : { opacity: 0 }}
                        >
                          {path.progress}%
                        </motion.span>
                      </div>
                      <AnimatedProgressBar value={path.progress} color={path.color} inView={inView} />
                    </div>

                    {/* CTA */}
                    <div className="mt-6 flex items-center gap-2 text-[13px] font-bold text-gray-600 transition-all duration-300 group-hover:gap-3 group-hover:text-[#39FF14]">
                      Open path
                      <ArrowRight weight="bold" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* View all */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/learn" className="group inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-6 py-3 text-sm font-semibold text-gray-500 transition-all hover:border-[#39FF14]/20 hover:bg-[#39FF14]/[0.04] hover:text-[#39FF14]">
            View all learning paths
            <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
