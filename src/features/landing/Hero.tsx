"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Target, Flame, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
const keyToneGroups = [
  {
    keys: new Set(['Q', 'W', 'A', 'S', 'Z', 'X']),
    idle: 'border-[#30363d] bg-[#0d1117] text-[#79c0ff] hover:border-[#58a6ff]/55 hover:bg-[#111827]',
    active: 'border-[#58a6ff]/80 bg-[#1f6feb]/24 text-[#dff0ff] shadow-[0_0_20px_rgba(88,166,255,0.28)]',
    marker: 'bg-[#58a6ff]/70',
  },
  {
    keys: new Set(['E', 'R', 'D', 'F', 'C', 'V']),
    idle: 'border-[#30363d] bg-[#0d1117] text-[#a5d6ff] hover:border-[#79c0ff]/50 hover:bg-[#111827]',
    active: 'border-[#79c0ff]/78 bg-[#388bfd]/20 text-[#e6f4ff] shadow-[0_0_20px_rgba(121,192,255,0.24)]',
    marker: 'bg-[#79c0ff]/65',
  },
  {
    keys: new Set(['T', 'Y', 'G', 'H', 'B', 'N']),
    idle: 'border-[#30363d] bg-[#0d1117] text-[#7ee787] hover:border-[#56d364]/45 hover:bg-[#0f1a14]',
    active: 'border-[#56d364]/72 bg-[#238636]/22 text-[#eaffef] shadow-[0_0_20px_rgba(86,211,100,0.22)]',
    marker: 'bg-[#56d364]/58',
  },
  {
    keys: new Set(['U', 'I', 'J', 'K', 'M']),
    idle: 'border-[#30363d] bg-[#0d1117] text-[#d2a8ff] hover:border-[#bc8cff]/48 hover:bg-[#17111f]',
    active: 'border-[#bc8cff]/74 bg-[#8957e5]/22 text-[#f1e5ff] shadow-[0_0_20px_rgba(188,140,255,0.24)]',
    marker: 'bg-[#bc8cff]/62',
  },
  {
    keys: new Set(['O', 'P', 'L']),
    idle: 'border-[#30363d] bg-[#0d1117] text-[#ffa657] hover:border-[#ffa657]/44 hover:bg-[#1f1710]',
    active: 'border-[#ffa657]/70 bg-[#9e6a03]/24 text-[#fff2df] shadow-[0_0_20px_rgba(255,166,87,0.22)]',
    marker: 'bg-[#ffa657]/58',
  },
];

function getKeyTone(key: string) {
  return keyToneGroups.find((group) => group.keys.has(key)) ?? keyToneGroups[0];
}

function renderCodeLine(line: string) {
  const tokens = line.split(/('(?:[^']*)'?|\bconst\b|\bif\b|\bunlock\b|\bmeasure\b|\bset\b|\bpush\b|\bkeyboard\b|\bfocus\b|\bstreak\b|\bspeed\b|\bday\b|\bacc\b|\bwpm\b|\bprecision\b|\badvanced\b|\d+)/g).filter(Boolean);

  return tokens.map((token, index) => {
    let color = 'text-[#c9d1d9]';

    if (token === 'const' || token === 'if') color = 'text-[#ff7b72]';
    else if (token.startsWith("'")) color = 'text-[#a5d6ff]';
    else if (['unlock', 'measure', 'set', 'push'].includes(token)) color = 'text-[#d2a8ff]';
    else if (['keyboard', 'focus', 'streak', 'speed'].includes(token)) color = 'text-[#79c0ff]';
    else if (['day', 'acc', 'wpm', 'precision', 'advanced'].includes(token)) color = 'text-[#ffa657]';
    else if (/^\d+$/.test(token)) color = 'text-[#79c0ff]';

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
    <div className="font-mono text-[13px] leading-relaxed sm:text-sm">
      {displayedLines.map((line, i) => (
        <div key={i} className="text-[#8b949e]/70 opacity-70 transition-colors duration-500">
          <span className="mr-3 select-none text-[#484f58]">{i + 1}</span>
          {renderCodeLine(line)}
        </div>
      ))}
      <div className="text-[#c9d1d9]">
        <span className="mr-3 select-none text-[#58a6ff]/55">{displayedLines.length + 1}</span>
        {renderCodeLine(currentText)}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block h-[18px] w-[2px] translate-y-[3px] bg-[#58a6ff] shadow-[0_0_8px_rgba(88,166,255,0.55)]"
        />
      </div>
    </div>
  );
}

/* ── Hero phrase data ── */
const heroPhrasesData = [
  { before: "Type ", highlight: "faster", after: "." },
  { before: "Think ", highlight: "sharper", after: "." },
  { before: "Build ", highlight: "mastery", after: "." },
];

/* ── Framer Motion animation config ── */
const smoothSpring = { type: 'spring' as const, stiffness: 360, damping: 34, mass: 0.8 };
const softEase = [0.22, 1, 0.36, 1] as const;

const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.18,
    },
  },
};

const phraseVariants = {
  hidden: { opacity: 0, y: 34, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: smoothSpring },
};

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

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative isolate min-h-[720px] overflow-hidden bg-[#02050b] pb-12 pt-20 sm:pt-24 lg:min-h-[760px] lg:pt-24"
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
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent-300/25 bg-accent-300/[0.06] px-4 py-2 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-300" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-100">
              Precision-first typing platform
            </span>
          </motion.div>

          {/* Headline — phrase-by-phrase reveal */}
          <motion.h1
            ref={headlineRef}
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
            className="overflow-hidden text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl"
          >
            {heroPhrasesData.map((phrase, i) => (
              <motion.span
                key={i}
                variants={phraseVariants}
                className="inline-block"
                style={{ marginRight: i < heroPhrasesData.length - 1 ? '0.25em' : '0' }}
              >
                <span className="text-white">{phrase.before}</span>
                <span className="hero-gradient-word bg-gradient-to-r from-blue-400 via-emerald-400 to-sky-300 bg-[length:200%_100%] bg-clip-text text-transparent">
                  {phrase.highlight}
                </span>
                <span className="text-white">{phrase.after}</span>
              </motion.span>
            ))}
          </motion.h1>

          {/* Subheadline — fades in after heading */}
          <motion.p
            initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.75, duration: 0.45, ease: softEase }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg lg:text-xl"
          >
            Master your keyboard through guided learning paths, real-time precision tracking,
            and AI-driven practice sessions that adapt to your rhythm.
          </motion.p>

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
            className="mb-7 flex items-center justify-center gap-8 sm:gap-14"
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
                  <span className={`text-3xl font-bold tabular-nums ${stat.color} sm:text-4xl`}>
                    {counters[i]}{stat.suffix}
                  </span>
                  <span className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
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
              className="group relative flex min-h-[274px] flex-col overflow-hidden rounded-2xl border border-[#30363d]"
              whileHover={{ borderColor: 'rgba(88,166,255,0.28)' }}
              style={{
                background: 'radial-gradient(circle at 18% 12%, rgba(88,166,255,0.075), transparent 38%), radial-gradient(circle at 82% 20%, rgba(126,231,135,0.04), transparent 36%), linear-gradient(180deg, rgba(13,17,23,0.96) 0%, rgba(3,7,10,0.98) 100%)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Top glow line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#58a6ff]/26 to-transparent" />

              {/* Terminal header */}
              <div className="flex items-center gap-2 border-b border-[#30363d]/70 px-5 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                <span className="ml-3 text-[11px] font-medium text-[#8b949e]">typeforge://session</span>
                <motion.div
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-[#58a6ff] shadow-[0_0_10px_rgba(88,166,255,0.65)]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              {/* Terminal body */}
              <div className="flex flex-1 items-start p-5 pt-7 sm:p-6 sm:pt-8">
                <TypingSimulator />
              </div>

              {/* Bottom status bar */}
              <div className="mt-auto flex items-center justify-between border-t border-[#30363d]/70 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#8b949e]">
                <span>UTF-8</span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#58a6ff]/70" />
                  Live
                </span>
                <span>Ln 1, Col 1</span>
              </div>
            </motion.div>

            {/* Keyboard visualization */}
            <div className="relative">
              <div
                className="group relative overflow-hidden rounded-2xl border border-white/[0.065] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-5"
                style={{
                  background: 'radial-gradient(circle at 18% 12%, rgba(88,166,255,0.08), transparent 38%), radial-gradient(circle at 84% 20%, rgba(126,231,135,0.045), transparent 36%), linear-gradient(180deg, rgba(13,17,23,0.96) 0%, rgba(3,7,10,0.98) 100%)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#58a6ff]/26 to-transparent" />
                <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[#30363d] to-transparent" />

                <div className="mb-4 flex items-center justify-between">
                  <span className="bg-gradient-to-r from-[#79c0ff] via-[#a5d6ff] to-[#7ee787] bg-clip-text text-xs font-semibold uppercase tracking-[0.22em] text-transparent">
                    Keyboard Heatmap
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full border border-[#30363d] bg-[#0d1117] px-2.5 py-1 text-[11px] font-medium text-[#79c0ff]/90">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#58a6ff] shadow-[0_0_10px_rgba(88,166,255,0.68)]" />
                    Tracking
                  </span>
                </div>

                <div className="space-y-2">
                  {keyRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center justify-center gap-1.5" style={{ paddingLeft: `${rowIndex * 12}px` }}>
                      {row.map((key) => {
                        const isHome = homeRowKeys.has(key);
                        const isActive = activeKey === key;
                        const tone = getKeyTone(key);

                        return (
                          <motion.div
                            key={key}
                            animate={isActive ? { scale: [1, 0.92, 1.04], y: [0, 2, -1] } : {}}
                            transition={{ duration: 0.18 }}
                            className={`
                              relative flex h-9 w-9 items-center justify-center rounded-lg border font-mono text-xs font-semibold shadow-[inset_0_-1px_0_rgba(0,0,0,0.7),0_8px_18px_rgba(0,0,0,0.14)] transition-all duration-200 sm:h-10 sm:w-10 sm:text-sm
                              ${isActive
                                ? tone.active
                                : isHome
                                  ? tone.idle
                                  : `${tone.idle} opacity-75`
                              }
                            `}
                          >
                            {key}
                            {isHome && !isActive && (
                              <span className={`absolute bottom-1 left-1/2 h-0.5 w-2 -translate-x-1/2 rounded-full ${tone.marker}`} />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Space bar */}
                <div className="mt-2 flex justify-center" style={{ paddingLeft: '36px' }}>
                  <div className="h-9 w-48 rounded-lg border border-[#30363d] bg-[#0d1117] shadow-[inset_0_-1px_0_rgba(0,0,0,0.72),0_8px_20px_rgba(0,0,0,0.14)] sm:h-10 sm:w-56" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`
        .hero-premium-base {
          background: #02050b;
        }

        .hero-premium-cursor-sheen {
          background: radial-gradient(circle, rgba(57, 255, 20, 0.075), transparent 64%);
          filter: blur(28px);
        }

        @keyframes gradient-shine {
          0% { background-position: 200% center; }
          100% { background-position: 0% center; }
        }

        .hero-gradient-word {
          animation: gradient-shine 2.5s ease-in-out infinite;
          animation-delay: 1.2s;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-gradient-word {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
