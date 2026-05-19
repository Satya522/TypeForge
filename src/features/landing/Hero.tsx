"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Target, Flame, ChevronRight, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import KeyboardHeatmap from '@/components/ui/KeyboardHeatmap';
import KineticHeadline from '@/components/hero/KineticHeadline';
import AnimatedHeroSubtitle from '@/components/hero/AnimatedHeroSubtitle';

/* ── Typing simulation text ── */
const typingLines = [
  "import { engine } from '@typeforge/core';",
  "const session = engine.init('practice');",
  "",
  "session.on('keystroke', (event) => {",
  "  const speed = keyboard.measure('wpm');",
  "  if (speed > 90) unlock('advanced_mode');",
  "  ",
  "  focus.set('home-row', precision);",
  "  streak.push({ day: 14, acc: 98 });",
  "  ",
  "  if (event.isCombo) {",
  "    multiplier.increase(1.5);",
  "  }",
  "});",
  "",
  "session.start({ strict: true });"
];

const floatingStats = [
  { href: '/analytics', icon: Zap, label: 'WPM', value: 92, suffix: '', color: 'text-[#58a6ff]', gradient: 'from-[#a5d6ff] to-[#388bfd]', glow: 'drop-shadow-[0_0_12px_rgba(88,166,255,0.45)]' },
  { href: '/analytics', icon: Target, label: 'Accuracy', value: 98, suffix: '%', color: 'text-[#56d364]', gradient: 'from-[#7ee787] to-[#2ea043]', glow: 'drop-shadow-[0_0_12px_rgba(86,211,100,0.45)]' },
  { href: '/achievements', icon: Flame, label: 'Streak', value: 14, suffix: 'd', color: 'text-[#ffa657]', gradient: 'from-[#ffd8a8] to-[#db6d28]', glow: 'drop-shadow-[0_0_12px_rgba(255,166,87,0.45)]' },
];

/* ── Library keyboard layout ── */
const heroKeyboardLayout = {
  default: [
    '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
    '{tab} Q W E R T Y U I O P [ ] \\',
    "{lock} A S D F G H J K L ; ' {enter}",
    '{shiftleft} Z X C V B N M , . / {shiftright}',
    '{ctrlleft} {metaleft} {altleft} {space} {altright} {fn} {ctrlright}',
  ],
};

const heroKeyboardDisplay = {
  '{bksp}': 'Backspace',
  '{tab}': 'Tab',
  '{lock}': 'Caps Lock',
  '{enter}': 'Enter',
  '{shiftleft}': 'Shift',
  '{shiftright}': 'Shift',
  '{ctrlleft}': 'Ctrl',
  '{ctrlright}': 'Ctrl',
  '{metaleft}': 'Win/Mac',
  '{altleft}': 'Alt',
  '{altright}': 'Alt',
  '{space}': '',
  '{fn}': 'Fn',
};

const heroKeyboardDemoKeys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'A', 'S', 'D', 'F', 'J', 'K', 'L', '1', '2', '3', '7', '8', '9'];

function renderCodeLine(line: string) {
  const tokens = line.split(/('(?:[^']*)'?|\bimport\b|\bfrom\b|\bconst\b|\bif\b|\bunlock\b|\bmeasure\b|\bset\b|\bpush\b|\binit\b|\bon\b|\bincrease\b|\bstart\b|\bkeyboard\b|\bfocus\b|\bstreak\b|\bspeed\b|\bday\b|\bacc\b|\bwpm\b|\bprecision\b|\badvanced_mode\b|\bengine\b|\bsession\b|\bevent\b|\bisCombo\b|\bmultiplier\b|\bstrict\b|\btrue\b|\d+(?:\.\d+)?)/g).filter(Boolean);

  return tokens.map((token, index) => {
    let color = 'text-[#64748b]';
    let glow = '';

    if (['import', 'from', 'const', 'if'].includes(token)) {
      color = 'text-[#c084fc]';
      glow = 'drop-shadow-[0_0_8px_rgba(192,132,252,0.4)]';
    } else if (token === 'true') {
      color = 'text-[#f472b6]';
      glow = 'drop-shadow-[0_0_8px_rgba(244,114,182,0.4)]';
    } else if (token.startsWith("'")) {
      color = 'text-[#2dd4bf]';
      glow = 'drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]';
    } else if (['unlock', 'measure', 'set', 'push', 'init', 'on', 'increase', 'start'].includes(token)) {
      color = 'text-[#60a5fa]';
      glow = 'drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]';
    } else if (['keyboard', 'focus', 'streak', 'engine', 'session', 'event', 'multiplier'].includes(token)) {
      color = 'text-[#e2e8f0]';
      glow = 'drop-shadow-[0_0_8px_rgba(226,232,240,0.3)]';
    } else if (['speed', 'day', 'acc', 'wpm', 'precision', 'advanced_mode', 'isCombo', 'strict'].includes(token)) {
      color = 'text-[#94a3b8]';
    } else if (/^\d+(?:\.\d+)?$/.test(token)) {
      color = 'text-[#fbbf24]';
      glow = 'drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]';
    }

    return (
      <span key={`${token}-${index}`} className={`${color} ${glow}`.trim()}>
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
  const [isTyping] = useState(true);

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
        setDisplayedLines(prev => [...prev.slice(-6), currentText]);
        setCurrentText('');
        setCharIndex(0);
        setLineIndex(prev => (prev + 1) % typingLines.length);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, lineIndex, isTyping, currentText]);

  return (
    <div 
      className="text-[0.85rem] font-medium leading-[2] tracking-normal h-full w-[380px] max-w-full overflow-hidden whitespace-pre"
      style={{ fontFamily: 'var(--font-code), "JetBrains Mono", monospace' }}
    >
      {displayedLines.map((line, i) => (
        <div key={i} className="flex items-baseline text-[#94a3b8]/70 opacity-70 transition-colors duration-500 py-0.5">
          <span className="mr-3 select-none text-[#4a5d74]/60">❯</span>
          {renderCodeLine(line)}
        </div>
      ))}
      <div className="-ml-3 flex items-baseline rounded-r-lg border-l-2 border-[#2dd4bf] bg-gradient-to-r from-[#2dd4bf]/[0.08] to-transparent py-0.5 pl-3 text-[#dde4f0] shadow-[-8px_0_16px_rgba(45,212,191,0.1)] relative">
        <span className="mr-3 select-none text-[#2dd4bf] drop-shadow-[0_0_6px_rgba(45,212,191,0.5)]">❯</span>
        {renderCodeLine(currentText)}
        <motion.span
          className="ml-1.5 inline-block h-[15px] w-[6px] align-middle rounded-[1px] bg-[#2dd4bf] drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]"
          animate={{ opacity: [1, 0.2] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
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
    const interval = setInterval(() => {
      const randomKey = heroKeyboardDemoKeys[Math.floor(Math.random() * heroKeyboardDemoKeys.length)];
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
        <div className="mx-auto mt-12 max-w-6xl">
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
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="group inline-flex rounded-2xl px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
                >
                  <motion.div
                    variants={statItemVariants}
                    className="flex flex-col items-center"
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
                </Link>
              );
            })}
          </motion.div>

          {/* Terminal + Keyboard combined view */}
          <motion.div
            variants={showcaseVariants}
            initial="hidden"
            animate="visible"
            className="grid items-stretch gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-8"
          >
            {/* Terminal */}
            <Link
              href="/code-practice"
              className="group block min-w-0 h-full w-full rounded-[28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
            >
              <motion.div
                className="relative flex h-full w-full flex-col overflow-hidden rounded-[16px] border border-white/[0.065] bg-[#000000] shadow-[0_20px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-2xl before:absolute before:inset-x-0 before:top-0 before:z-20 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#00d4b8]/25 before:to-transparent before:content-['']"
                whileHover={{ boxShadow: '0 28px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)' }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(0,212,184,0.08),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.035),transparent_58%)] opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Terminal header */}
                <div className="relative z-10 flex h-[38px] items-center justify-between border-b border-white/[0.04] bg-black/25 px-[14px] backdrop-blur-md">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56] transition-transform duration-150 group-hover:scale-[1.15]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e] transition-transform duration-150 group-hover:scale-[1.15]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f] transition-transform duration-150 group-hover:scale-[1.15]" />
                  </div>
                  <div className="absolute left-1/2 flex -translate-x-1/2 items-center" style={{ fontFamily: 'var(--font-code), "JetBrains Mono", monospace' }}>
                    <span className="bg-gradient-to-r from-[#00d4b8] to-[#7c3aed] bg-clip-text text-[0.72rem] font-medium tracking-normal text-transparent">
                      typeforge://
                    </span>
                    <span className="bg-gradient-to-r from-[#7c3aed] to-[#f472b6] bg-clip-text text-[0.72rem] font-medium tracking-normal text-transparent">
                      session
                    </span>
                  </div>
                  <div className="flex h-4 items-center gap-[2px]" aria-hidden="true">
                    {[0, 1, 2].map((bar) => (
                      <motion.span
                        key={bar}
                        className="w-[3px] rounded-full bg-[#00d4b8]"
                        animate={{ height: bar === 0 ? [8, 14, 6] : bar === 1 ? [14, 6, 10] : [6, 10, 14] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: bar * 0.2 }}
                      />
                    ))}
                  </div>
                </div>

                {/* Terminal body */}
                <div className="relative z-10 flex flex-1 items-start bg-transparent p-5 pt-6 sm:p-6 sm:pt-7">
                  <TypingSimulator />
                </div>

                {/* Bottom status bar */}
                <div 
                  className="relative z-10 mt-auto flex h-6 items-center gap-4 border-t border-white/[0.04] bg-black/30 px-3 text-[0.6rem] text-[#4a5d74] backdrop-blur-md"
                  style={{ fontFamily: 'var(--font-code), "JetBrains Mono", monospace' }}
                >
                  <span>UTF-8</span>
                  <span>·</span>
                  <span className="flex items-center gap-2">
                    <motion.span
                      className="h-[5px] w-[5px] rounded-full bg-[#2dd4a0]"
                      animate={{
                        scale: [1, 1.5, 1],
                        boxShadow: [
                          '0 0 6px rgba(45,212,160,0.5)',
                          '0 0 14px rgba(45,212,160,0.9)',
                          '0 0 6px rgba(45,212,160,0.5)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    LIVE
                  </span>
                  <span>·</span>
                  <span>LN 1, COL 1</span>
                  <span className="ml-auto bg-gradient-to-r from-[#00d4b8] to-[#7c3aed] bg-clip-text text-[0.6rem] text-transparent">
                    TypeForge
                  </span>
                </div>
              </motion.div>
            </Link>

            {/* Keyboard visualization */}
            <Link href="/practice/home-row" className="relative block min-w-0 w-full h-full rounded-[18px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70">
              <div
                className="group relative flex h-full flex-col overflow-hidden rounded-[16px] border border-white/[0.055] bg-[#000000] shadow-[0_28px_90px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-2xl before:absolute before:inset-x-0 before:top-0 before:z-20 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#7c3aed]/25 before:to-transparent before:content-['']"
              >
                {/* Background glowing orb inside container */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_76%_18%,rgba(124,58,237,0.055),transparent_42%),radial-gradient(ellipse_at_18%_82%,rgba(0,212,184,0.045),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.018),rgba(0,0,0,0.28))]" />
                <motion.div
                  className="pointer-events-none absolute inset-x-10 top-16 h-40 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(0,212,184,0.10),rgba(124,58,237,0.055)_48%,transparent_72%)] blur-2xl"
                  animate={{ opacity: [0.12, 0.28, 0.12], scale: [0.94, 1.06, 0.94] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
                />

                <div className="relative z-10 flex h-11 items-center justify-between px-4 pt-2">
                  <div className="flex items-center">
                    <Keyboard size={14} strokeWidth={1.5} className="text-[#4a5d74]" />
                    <span className="ml-2 bg-gradient-to-r from-[#00d4b8] to-[#7c3aed] bg-clip-text text-[0.65rem] font-bold uppercase tracking-[0.14em] text-transparent">
                      HEATMAP
                    </span>
                  </div>
                  <span className="flex items-center rounded-full border border-[#2dd4a0]/20 bg-[#2dd4a0]/[0.08] px-2.5 py-0.5">
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]"
                      animate={{ scale: [1, 1.45, 1], opacity: [0.65, 1, 0.65] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="ml-1 text-[0.7rem] font-semibold text-[#2dd4a0]">Live</span>
                  </span>
                </div>

                <motion.div
                  className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 pb-6"
                  initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <KeyboardHeatmap activeKey={activeKey ?? undefined} className="w-full" />
                </motion.div>
              </div>
            </Link>
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
