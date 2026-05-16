"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Target, Flame, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import KineticHeadline from '@/components/hero/KineticHeadline';
import AnimatedHeroSubtitle from '@/components/hero/AnimatedHeroSubtitle';

/* ── Typing simulation text ── */
const typingLines = [
  "const speed = keyboard.measure('wpm');",
  "if (speed > 90) unlock('advanced');",
  "focus.set('home-row', precision);",
  "streak.push({ day: 14, acc: 98 });",
];

const floatingStats = [
  { icon: Zap, label: 'WPM', value: 92, suffix: '', color: 'text-[#58a6ff]', gradient: 'from-[#a5d6ff] to-[#388bfd]', glow: 'drop-shadow-[0_0_12px_rgba(88,166,255,0.45)]' },
  { icon: Target, label: 'Accuracy', value: 98, suffix: '%', color: 'text-[#56d364]', gradient: 'from-[#7ee787] to-[#2ea043]', glow: 'drop-shadow-[0_0_12px_rgba(86,211,100,0.45)]' },
  { icon: Flame, label: 'Streak', value: 14, suffix: 'd', color: 'text-[#ffa657]', gradient: 'from-[#ffd8a8] to-[#db6d28]', glow: 'drop-shadow-[0_0_12px_rgba(255,166,87,0.45)]' },
];

/* ── Keyboard keys ── */
const keyRows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];
const homeRowKeys = new Set(['A', 'S', 'D', 'F', 'J', 'K', 'L']);
const keyToneGroups = [
  {
    keys: new Set(['Q', 'A', 'Z', 'P']), // Pinkies (Rose)
    active: 'bg-gradient-to-b from-[#f43f5e] to-[#be123c] text-white shadow-[0_0_20px_rgba(244,63,94,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-[#f43f5e]',
    orb: 'bg-[#f43f5e]',
  },
  {
    keys: new Set(['W', 'S', 'X', 'O', 'L']), // Rings (Purple)
    active: 'bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] text-white shadow-[0_0_20px_rgba(139,92,246,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-[#8b5cf6]',
    orb: 'bg-[#8b5cf6]',
  },
  {
    keys: new Set(['E', 'D', 'C', 'I', 'K']), // Middles (Amber)
    active: 'bg-gradient-to-b from-[#f59e0b] to-[#b45309] text-white shadow-[0_0_20px_rgba(245,158,11,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-[#f59e0b]',
    orb: 'bg-[#f59e0b]',
  },
  {
    keys: new Set(['R', 'F', 'V', 'T', 'G', 'B']), // Left Index (Cyan)
    active: 'bg-gradient-to-b from-[#38bdf8] to-[#0ea5e9] text-white shadow-[0_0_20px_rgba(56,189,248,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-[#38bdf8]',
    orb: 'bg-[#38bdf8]',
  },
  {
    keys: new Set(['Y', 'H', 'N', 'U', 'J', 'M']), // Right Index (Emerald)
    active: 'bg-gradient-to-b from-[#10b981] to-[#047857] text-white shadow-[0_0_20px_rgba(16,185,129,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-[#10b981]',
    orb: 'bg-[#10b981]',
  },
];

function getKeyTone(key: string) {
  return keyToneGroups.find((group) => group.keys.has(key)) ?? keyToneGroups[0];
}

function renderCodeLine(line: string) {
  const tokens = line.split(/('(?:[^']*)'?|\bconst\b|\bif\b|\bunlock\b|\bmeasure\b|\bset\b|\bpush\b|\bkeyboard\b|\bfocus\b|\bstreak\b|\bspeed\b|\bday\b|\bacc\b|\bwpm\b|\bprecision\b|\badvanced\b|\d+)/g).filter(Boolean);

  return tokens.map((token, index) => {
    let color = 'text-[#e2e8f0]';

    if (token === 'const' || token === 'if') color = 'text-[#f43f5e] font-semibold drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]';
    else if (token.startsWith("'")) color = 'text-[#2dd4bf] drop-shadow-[0_0_8px_rgba(45,212,191,0.3)]';
    else if (['unlock', 'measure', 'set', 'push'].includes(token)) color = 'text-[#38bdf8] drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]';
    else if (['keyboard', 'focus', 'streak', 'speed', 'day', 'acc', 'wpm', 'precision', 'advanced'].includes(token)) color = 'text-[#f8fafc] drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]';
    else if (/^\d+$/.test(token)) color = 'text-[#c084fc] drop-shadow-[0_0_8px_rgba(192,132,252,0.3)]';

    return (
      <span key={`${token}-${index}`} className={color}>
        {token}
      </span>
    );
  });
}

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
    <div className="font-code text-[13.5px] font-medium leading-[1.85] tracking-normal sm:text-[14.5px]">
      {displayedLines.map((line, i) => (
        <div key={i} className="text-[#94a3b8]/70 opacity-80 transition-colors duration-500">
          <span className="mr-5 inline-block w-4 select-none text-right text-[0.92em] font-medium tabular-nums text-[#334155]">{i + 1}</span>
          {renderCodeLine(line)}
        </div>
      ))}
      <div className="text-[#f8fafc]">
        <span className="mr-5 inline-block w-4 select-none text-right text-[0.92em] font-semibold tabular-nums text-[#38bdf8]/90 drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]">{displayedLines.length + 1}</span>
        {renderCodeLine(currentText)}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
          className="ml-1 inline-block h-[18px] w-[2px] translate-y-[3px] bg-[#2dd4bf] shadow-[0_0_10px_rgba(45,212,191,0.8)]"
        />
      </div>
    </div>
  );
}

/* ── Framer Motion animation config ── */
const softEase = [0.22, 1, 0.36, 1] as const;

const badgeVariants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(8px)', scale: 0.94 },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)', scale: 1,
    transition: { duration: 0.5, ease: softEase },
  },
};

const statsContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 1.1,
    },
  },
};

const statItemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.8 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: softEase } },
};

const showcaseVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { delay: 1.2, duration: 0.9, ease: softEase } },
};

/* ── Main Hero ── */
export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
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

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      data-motion-skip
      className="relative isolate min-h-[720px] overflow-hidden bg-[#02050b] pb-16 pt-20 sm:pt-24 lg:min-h-[790px] lg:pt-24"
    >
      {/* ── Cinematic background ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="hero-premium-base absolute inset-0" />
      </div>

      {/* Mouse spotlight */}
      <motion.div
        className="hero-premium-cursor-sheen pointer-events-none absolute -z-5 h-[420px] w-[420px] opacity-30"
        style={{
          left: spotlightX,
          top: spotlightY,
          x: '-50%',
          y: '-50%',
        }}
      />

      <div className="section-shell relative">
        {/* ── Top: centered headline block ── */}
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow badge — appears first */}
          <motion.div
            variants={badgeVariants}
            initial="hidden"
            animate="visible"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#6fa7ff]/30 bg-[#07142c]/70 px-4 py-2 shadow-[0_0_34px_rgba(79,141,253,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2dd4bf] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6fa7ff]" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b9d3ff]">
              Precision-first typing platform
            </span>
          </motion.div>

          {/* Headline — Jitter-inspired kinetic typography */}
          <KineticHeadline />

          {/* Subheadline — fades in after heading */}
          <AnimatedHeroSubtitle />

          {/* CTAs — appear after subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ delay: 0.95, type: 'spring', stiffness: 380, damping: 30 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/learn" className="w-full sm:w-auto">
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
            <Link href="/practice" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button variant="secondary" size="lg" className="w-full gap-2 border-white/10 px-8 hover:border-accent-300/20 sm:w-auto">
                  Try Practice
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* ── Bottom: interactive showcase ── */}
        <div className="mx-auto mt-12 max-w-5xl">
          {/* Stats row − clean, no boxes */}
          <motion.div
            variants={statsContainerVariants}
            initial="hidden"
            animate="visible"
            className="mb-10 flex items-center justify-center gap-10 sm:gap-16"
          >
            {floatingStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={statItemVariants}
                  className="group flex flex-col items-center"
                  whileHover={{ y: -8, scale: 1.05 }}
                >
                  <div className="relative mb-3">
                    <Icon className={`h-5 w-5 ${stat.color} transition-all group-hover:scale-110`} />
                    <div className={`absolute inset-0 ${stat.color} blur-lg opacity-0 transition-opacity group-hover:opacity-40`} />
                  </div>
                  <span
                    className={`bg-gradient-to-b ${stat.gradient} ${stat.glow} bg-clip-text text-[36px] font-bold tabular-nums text-transparent sm:text-[44px]`}
                    style={{ fontFamily: "'Google Sans', system-ui, sans-serif", letterSpacing: '-0.02em' }}
                  >
                    {counters[i]}{stat.suffix}
                  </span>
                  <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8b949e] sm:text-xs">
                    {stat.label}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Terminal + Keyboard combined view */}
          <motion.div
            variants={showcaseVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
          >
            {/* Terminal */}
            <motion.div
              className="group relative flex min-h-[274px] flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#080d19]/88 shadow-[0_32px_100px_rgba(0,0,0,0.54),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl"
              whileHover={{ boxShadow: '0 0 0 1px rgba(111,167,255,0.16), 0 34px 110px rgba(0,0,0,0.64)' }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(111,167,255,0.16),transparent_30%),linear-gradient(145deg,rgba(255,255,255,0.045),transparent_58%)] opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent" />

              {/* Terminal header */}
              <div className="relative flex items-center justify-between border-b border-white/[0.06] bg-[#030711]/50 px-6 py-4 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] shadow-[0_0_8px_rgba(255,95,87,0.4)]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e] shadow-[0_0_8px_rgba(254,188,46,0.4)]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28c840] shadow-[0_0_8px_rgba(40,200,64,0.4)]" />
                </div>
                <div className="absolute left-1/2 flex -translate-x-1/2 items-center">
                  <span className="font-code bg-gradient-to-b from-[#f8fafc] to-[#94a3b8] bg-clip-text text-[11px] font-bold tracking-normal text-transparent">
                    typeforge://session
                  </span>
                </div>
              </div>

              {/* Terminal body */}
              <div className="font-code relative flex flex-1 items-start bg-transparent p-5 pt-7 sm:p-6 sm:pt-8">
                <TypingSimulator />
              </div>

              {/* Bottom status bar */}
              <div className="font-code mt-auto flex items-center justify-between border-t border-white/[0.06] bg-[#030711]/50 px-6 py-3.5 text-[10px] font-bold uppercase tracking-normal text-[#64748b] backdrop-blur-md">
                <span>UTF-8</span>
                <span className="flex items-center gap-2 text-[#2dd4bf]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4bf] shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
                  LIVE
                </span>
                <span>LN 1, COL 1</span>
              </div>
            </motion.div>

            {/* Keyboard visualization */}
            <div className="relative h-full">
              <div
                className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#080d19]/88 p-5 shadow-[0_32px_100px_rgba(0,0,0,0.54),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:p-6"
              >
                {/* Background glowing orb inside container */}
                <div className={`absolute left-1/2 top-1/2 -z-10 h-[200px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[80px] transition-colors duration-500 ${activeKey ? getKeyTone(activeKey).orb : 'bg-[#38bdf8]'}`} />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="mb-8 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-white/[0.06] border border-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                      <svg className="h-4 w-4 text-[#e2e8f0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e2e8f0] drop-shadow-md">
                      Heatmap
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#38bdf8] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#38bdf8] opacity-75"></span>
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#38bdf8]"></span>
                    </span>
                    Live
                  </span>
                </div>

                <div className="space-y-2.5 relative z-10 flex-1 flex flex-col justify-center">
                  {keyRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center justify-center gap-1.5 sm:gap-2" style={{ paddingLeft: `${rowIndex * 14}px` }}>
                      {row.map((key) => {
                        const isHome = homeRowKeys.has(key);
                        const isActive = activeKey === key;
                        const tone = getKeyTone(key);

                        return (
                          <motion.div
                            key={key}
                            animate={isActive ? { scale: [1, 0.9, 1.08], y: [0, 2, -2] } : {}}
                            transition={{ duration: 0.15 }}
                            className={`
                              font-code relative flex h-9 w-9 items-center justify-center rounded-[10px] text-[13px] font-bold transition-all duration-200 sm:h-11 sm:w-11 sm:text-[15px]
                              ${isActive
                                ? tone.active
                                : isHome
                                  ? 'bg-gradient-to-b from-white/[0.08] to-white/[0.02] text-[#f8fafc] shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/[0.12]'
                                  : 'bg-gradient-to-b from-white/[0.04] to-transparent text-[#94a3b8] shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-white/[0.06]'
                              }
                            `}
                          >
                            {key}
                            {isHome && !isActive && (
                              <span className="absolute bottom-1.5 left-1/2 h-0.5 w-2.5 -translate-x-1/2 rounded-full bg-white/[0.15]" />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ))}
                  {/* Space bar */}
                  <div className="mt-2.5 flex justify-center" style={{ paddingLeft: '42px' }}>
                    <div className="h-9 w-48 rounded-[10px] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] sm:h-11 sm:w-[260px]" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`
        .hero-premium-base {
          background:
            radial-gradient(circle at 50% 0%, rgba(79, 141, 253, 0.16), transparent 26%),
            radial-gradient(circle at 18% 38%, rgba(45, 212, 191, 0.11), transparent 28%),
            radial-gradient(circle at 82% 48%, rgba(255, 210, 31, 0.09), transparent 27%),
            linear-gradient(180deg, #02050b 0%, #040817 48%, #02050b 100%);
        }

        .hero-premium-base::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.18;
          background-image:
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: linear-gradient(180deg, rgba(0,0,0,0.72), rgba(0,0,0,0.16) 84%, transparent);
        }

        .hero-premium-base::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(2,5,11,0.1), transparent 18%, rgba(2,5,11,0.48) 100%),
            radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.42) 100%);
        }

        .hero-premium-cursor-sheen {
          background: radial-gradient(circle, rgba(111, 167, 255, 0.12), rgba(45, 212, 191, 0.05) 42%, transparent 68%);
          filter: blur(28px);
        }

      `}</style>
    </section>
  );
}
