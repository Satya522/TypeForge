"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Target, Flame, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';

/* ── Typing simulation text ── */
const typingLines = [
  "const speed = keyboard.measure('wpm');",
  "if (speed > 90) unlock('advanced');",
  "focus.set('home-row', precision);",
  "streak.push({ day: 14, acc: 98 });",
];

/* ── Floating stats ── */
const floatingStats = [
  { icon: Zap, label: 'WPM', value: 92, suffix: '', color: 'text-accent-300' },
  { icon: Target, label: 'Accuracy', value: 98, suffix: '%', color: 'text-emerald-400' },
  { icon: Flame, label: 'Streak', value: 14, suffix: 'd', color: 'text-yellow-400' },
];

/* ── Keyboard keys ── */
const keyRows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];
const homeRowKeys = new Set(['A', 'S', 'D', 'F', 'J', 'K', 'L']);

/* ── Animated counter hook ── */
function useAnimatedCounter(target: number, duration = 2000, delay = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const startTime = performance.now();
      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(start + (target - start) * eased));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return count;
}

/* ── Typing simulator component ── */
function TypingSimulator() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!isTyping) return;
    const currentLine = typingLines[lineIndex];
    if (charIndex < currentLine.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + currentLine[charIndex]);
        setCharIndex(prev => prev + 1);
      }, 35 + Math.random() * 45);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => [...prev.slice(-2), currentText]);
        setCurrentText('');
        setCharIndex(0);
        setLineIndex(prev => (prev + 1) % typingLines.length);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, lineIndex, isTyping, currentText]);

  return (
    <div className="font-mono text-[13px] leading-relaxed sm:text-sm">
      {displayedLines.map((line, i) => (
        <div key={i} className="text-gray-500/70 transition-colors duration-500">
          <span className="mr-3 select-none text-gray-600/40">{i + 1}</span>
          {line}
        </div>
      ))}
      <div className="text-accent-300/90">
        <span className="mr-3 select-none text-accent-300/30">{displayedLines.length + 1}</span>
        {currentText}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block h-[18px] w-[2px] translate-y-[3px] bg-accent-300 shadow-[0_0_8px_rgba(57,255,20,0.6)]"
        />
      </div>
    </div>
  );
}

/* ── Floating particle ── */
function FloatingParticle({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-accent-300/20"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.15, 0.4, 0.15],
        scale: [1, 1.3, 1],
      }}
      transition={{
        duration: 4 + Math.random() * 3,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

/* ── Main Hero ── */
export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const wpm = useAnimatedCounter(92, 2200, 1000);
  const accuracy = useAnimatedCounter(98, 2200, 1200);
  const streak = useAnimatedCounter(14, 1800, 1400);
  const counters = [wpm, accuracy, streak];

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlightX = useTransform(mouseX, (v) => `${v}px`);
  const spotlightY = useTransform(mouseY, (v) => `${v}px`);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

  /* Simulate random key presses */
  useEffect(() => {
    const allKeys = keyRows.flat();
    const interval = setInterval(() => {
      const randomKey = allKeys[Math.floor(Math.random() * allKeys.length)];
      setActiveKey(randomKey);
      setTimeout(() => setActiveKey(null), 200);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  /* GSAP entrance */
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.hero-eyebrow', { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.8 })
        .fromTo('.hero-headline-word', { y: 80, opacity: 0, rotateX: 45 }, { y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: 0.08 }, '-=0.4')
        .fromTo('.hero-sub', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5')
        .fromTo('.hero-cta', { y: 20, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.1 }, '-=0.4')
        .fromTo('.hero-stat-card', { y: 40, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.12 }, '-=0.3')
        .fromTo('.hero-terminal', { y: 50, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 1 }, '-=0.5')
        .fromTo('.hero-keyboard', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, '-=0.6');
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const headlineWords = ['Type', 'faster.', 'Think', 'sharper.', 'Build', 'mastery.'];

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative isolate min-h-screen overflow-hidden pb-20 pt-24 sm:pt-28 lg:pt-32"
    >
      {/* ── Cinematic background ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#040804] via-surface-100 to-surface-100" />

        {/* Animated orbs */}
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-32 top-20 h-[500px] w-[500px] rounded-full bg-accent-300/[0.06] blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -right-32 top-40 h-[450px] w-[450px] rounded-full bg-emerald-500/[0.04] blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-accent-300/[0.05] blur-[160px]"
        />

        {/* Grid pattern fading out */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(57,255,20,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.03) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 30%, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 30%, black 20%, transparent 70%)',
          }}
        />

        {/* Floating particles */}
        <FloatingParticle delay={0} x="10%" y="20%" size={4} />
        <FloatingParticle delay={1.5} x="85%" y="15%" size={3} />
        <FloatingParticle delay={0.8} x="70%" y="60%" size={5} />
        <FloatingParticle delay={2.2} x="25%" y="70%" size={3} />
        <FloatingParticle delay={3} x="55%" y="45%" size={4} />
        <FloatingParticle delay={1} x="40%" y="25%" size={3} />
        <FloatingParticle delay={2.5} x="15%" y="55%" size={4} />
        <FloatingParticle delay={0.3} x="90%" y="40%" size={3} />
      </div>

      {/* Mouse spotlight */}
      <motion.div
        className="pointer-events-none absolute -z-5 h-[500px] w-[500px] rounded-full opacity-30"
        style={{
          left: spotlightX,
          top: spotlightY,
          x: '-50%',
          y: '-50%',
          background: 'radial-gradient(circle, rgba(57,255,20,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="section-shell relative">
        {/* ── Top: centered headline block ── */}
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <div className="hero-eyebrow mb-8 inline-flex items-center gap-2 rounded-full border border-accent-300/25 bg-accent-300/[0.06] px-4 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-300" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-100">
              Precision-first typing platform
            </span>
          </div>

          {/* Headline with per-word animation */}
          <h1 ref={headlineRef} className="overflow-hidden text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl" style={{ perspective: '800px' }}>
            {headlineWords.map((word, i) => (
              <span key={word} className="hero-headline-word mr-[0.3em] inline-block" style={{ opacity: 0 }}>
                <span className={
                  i % 2 === 1
                    ? 'bg-gradient-to-r from-accent-300 via-emerald-400 to-accent-200 bg-clip-text text-transparent'
                    : 'text-white'
                }>
                  {word}
                </span>
              </span>
            ))}
          </h1>

          {/* Subheadline */}
          <p className="hero-sub mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg lg:text-xl" style={{ opacity: 0 }}>
            Master your keyboard through guided learning paths, real-time precision tracking,
            and AI-driven practice sessions that adapt to your rhythm.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/learn" className="hero-cta w-full sm:w-auto" style={{ opacity: 0 }}>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button variant="primary" size="lg" className="group relative w-full gap-2 overflow-hidden px-8 sm:w-auto" style={{ background: '#4f8dfd', color: '#ffffff' }}>
                  <span className="relative z-10 text-white">Start Training</span>
                  <ArrowRight className="relative z-10 h-4 w-4 text-white transition-transform group-hover:translate-x-1" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#4f8dfd] via-[#8bb6ff] to-[#4f8dfd] opacity-0 transition-opacity group-hover:opacity-20"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                </Button>
              </motion.div>
            </Link>
            <Link href="/practice" className="hero-cta w-full sm:w-auto" style={{ opacity: 0 }}>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button variant="secondary" size="lg" className="w-full gap-2 border-white/10 px-8 hover:border-accent-300/20 sm:w-auto">
                  Try Practice
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>

        {/* ── Bottom: interactive showcase ── */}
        <div className="mx-auto mt-20 max-w-5xl">
          {/* Stats row − clean, no boxes */}
          <div className="mb-12 flex items-center justify-center gap-8 sm:gap-16">
            {floatingStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="hero-stat-card group flex flex-col items-center"
                  whileHover={{ y: -8, scale: 1.05 }}
                  style={{ opacity: 0 }}
                >
                  <div className="relative mb-3">
                    <Icon className={`h-5 w-5 ${stat.color} transition-all group-hover:scale-110`} />
                    <div className={`absolute inset-0 ${stat.color} blur-lg opacity-0 transition-opacity group-hover:opacity-40`} />
                  </div>
                  <span className={`text-3xl font-bold tabular-nums ${stat.color} sm:text-4xl`}>
                    {counters[i]}{stat.suffix}
                  </span>
                  <span className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                    {stat.label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Terminal + Keyboard combined view */}
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Terminal */}
            <motion.div
              className="hero-terminal group relative overflow-hidden rounded-2xl border border-white/[0.06]"
              whileHover={{ borderColor: 'rgba(57,255,20,0.15)' }}
              style={{
                opacity: 0,
                background: 'linear-gradient(135deg, rgba(13,17,11,0.9) 0%, rgba(6,9,8,0.95) 100%)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Top glow line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-300/40 to-transparent" />

              {/* Terminal header */}
              <div className="flex items-center gap-2 border-b border-white/[0.04] px-5 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                <span className="ml-3 text-[11px] font-medium text-gray-500">typeforge://session</span>
                <motion.div
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-300"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              {/* Terminal body */}
              <div className="p-5 sm:p-6">
                <TypingSimulator />
              </div>

              {/* Bottom status bar */}
              <div className="flex items-center justify-between border-t border-white/[0.04] px-5 py-2 text-[10px] uppercase tracking-[0.2em] text-gray-600">
                <span>UTF-8</span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-300/50" />
                  Live
                </span>
                <span>Ln 1, Col 1</span>
              </div>
            </motion.div>

            {/* Keyboard visualization */}
            <div className="hero-keyboard relative" style={{ opacity: 0 }}>
              <div
                className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-4 sm:p-5"
                style={{
                  background: 'linear-gradient(180deg, rgba(13,17,11,0.7) 0%, rgba(6,9,8,0.85) 100%)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Keyboard Heatmap</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-accent-300/70">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-300" />
                    Tracking
                  </span>
                </div>

                <div className="space-y-2">
                  {keyRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center justify-center gap-1.5" style={{ paddingLeft: `${rowIndex * 12}px` }}>
                      {row.map((key) => {
                        const isHome = homeRowKeys.has(key);
                        const isActive = activeKey === key;

                        return (
                          <motion.div
                            key={key}
                            animate={isActive ? { scale: [1, 0.9, 1], y: [0, 2, 0] } : {}}
                            transition={{ duration: 0.15 }}
                            className={`
                              relative flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition-all duration-150 sm:h-10 sm:w-10 sm:text-sm
                              ${isActive
                                ? 'bg-accent-300/25 text-accent-100 shadow-[0_0_20px_rgba(57,255,20,0.3)] border-accent-300/40'
                                : isHome
                                  ? 'bg-accent-300/[0.08] text-accent-200/80 border border-accent-300/15'
                                  : 'bg-white/[0.03] text-gray-500 border border-white/[0.06]'
                              }
                            `}
                          >
                            {key}
                            {isHome && !isActive && (
                              <span className="absolute bottom-1 left-1/2 h-0.5 w-2 -translate-x-1/2 rounded-full bg-accent-300/30" />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Space bar */}
                <div className="mt-2 flex justify-center" style={{ paddingLeft: '36px' }}>
                  <div className="h-9 w-48 rounded-lg border border-white/[0.06] bg-white/[0.02] sm:h-10 sm:w-56" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
