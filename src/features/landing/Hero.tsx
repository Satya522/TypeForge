"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, Zap, Target, Flame, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import KineticHeadline from '@/components/hero/KineticHeadline';
import AnimatedHeroSubtitle from '@/components/hero/AnimatedHeroSubtitle';

const SimpleKeyboard = dynamic(() => import('react-simple-keyboard'), { ssr: false });

/* ── Typing simulation text ── */
const typingLines = [
  "const speed = keyboard.measure('wpm');",
  "if (speed > 90) unlock('advanced');",
  "focus.set('home-row', precision);",
  "streak.push({ day: 14, acc: 98 });",
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
            className="grid items-center gap-6 lg:grid-cols-[1.04fr_1fr]"
          >
            {/* Terminal */}
            <Link
              href="/code-practice"
              className="group block h-full rounded-[28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
            >
              <motion.div
                className="relative flex h-full min-h-[344px] flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#080d19]/88 shadow-[0_32px_100px_rgba(0,0,0,0.54),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl"
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
            </Link>

            {/* Keyboard visualization */}
            <Link href="/practice/home-row" className="relative mx-auto block w-full max-w-[760px] rounded-[18px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70">
              <div
                className="group relative flex min-h-[336px] flex-col overflow-hidden rounded-[18px] border border-white/[0.065] bg-[#020306] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.66),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl sm:p-6 lg:min-h-[350px]"
              >
                {/* Background glowing orb inside container */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.026),transparent_45%,rgba(255,255,255,0.012))]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
                <motion.div
                  className="pointer-events-none absolute inset-x-10 top-16 h-40 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(111,167,255,0.16),rgba(45,212,191,0.055)_42%,transparent_70%)] blur-2xl"
                  animate={{ opacity: [0.18, 0.34, 0.18], scale: [0.96, 1.04, 0.96] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                />

                <div className="relative z-10 mb-4 flex items-center justify-between">
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

                <motion.div
                  className="tf-keyboard-stage relative z-10 flex flex-1 items-center rounded-[14px] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012)_38%,rgba(0,0,0,0.08))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-4"
                  initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -2 }}
                >
                  <SimpleKeyboard
                    layout={heroKeyboardLayout}
                    layoutName="default"
                    display={heroKeyboardDisplay}
                    theme="hg-theme-default tf-simple-keyboard"
                    buttonTheme={[
                      { class: 'tf-key-home', buttons: 'A S D F J K L ;' },
                      ...(activeKey ? [{ class: 'tf-key-active', buttons: activeKey }] : []),
                    ]}
                    physicalKeyboardHighlight={false}
                    disableButtonHold
                  />
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

        .tf-hero-keyboard {
          --tf-key-bg:
            linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.035) 16%, transparent 17%),
            linear-gradient(180deg, #121821 0%, #080c12 48%, #030509 100%);
          --tf-key-home-bg:
            linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 16%, transparent 17%),
            linear-gradient(180deg, #142027 0%, #081016 50%, #030609 100%);
          --tf-key-border: rgba(154, 171, 195, 0.2);
          --tf-key-text: #d0d7e2;
          min-width: 0;
        }

        .tf-keyboard-stage::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(120deg, transparent, rgba(111,167,255,0.24), rgba(45,212,191,0.12), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.62;
          pointer-events: none;
        }

        .tf-keyboard-stage::after {
          content: '';
          position: absolute;
          inset: 8px 12px auto;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent);
          opacity: 0.72;
          pointer-events: none;
        }

        .tf-simple-keyboard.simple-keyboard {
          width: 100%;
          background: transparent;
          padding: 0;
          font-family: var(--font-code), 'JetBrains Mono', 'Cascadia Code', monospace;
          user-select: none;
        }

        .tf-simple-keyboard .hg-rows {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tf-simple-keyboard .hg-row {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin: 0;
        }

        .tf-simple-keyboard .hg-button {
          position: relative;
          isolation: isolate;
          flex: 0 0 38px !important;
          width: 38px !important;
          max-width: 38px;
          height: 38px;
          min-width: 38px;
          border: 1px solid var(--tf-key-border);
          border-radius: 3px;
          background: var(--tf-key-bg);
          box-shadow:
            0 10px 20px rgba(0, 0, 0, 0.54),
            0 1px 0 rgba(255, 255, 255, 0.035),
            inset 0 1px 0 rgba(255, 255, 255, 0.18),
            inset 0 -10px 18px rgba(0, 0, 0, 0.46);
          color: var(--tf-key-text);
          overflow: hidden;
          font-size: 12px;
          font-weight: 800;
          line-height: 1;
          text-shadow: 0 1px 7px rgba(255, 255, 255, 0.08);
          transition:
            transform 160ms cubic-bezier(0.16, 1, 0.3, 1),
            border-color 160ms ease,
            background 160ms ease,
            box-shadow 160ms ease,
            color 160ms ease;
        }

        .tf-simple-keyboard .hg-button::before {
          content: '';
          position: absolute;
          inset: 1px 1px auto;
          z-index: -1;
          height: 46%;
          border-radius: 2px 2px 1px 1px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.04)),
            linear-gradient(90deg, transparent, rgba(111,167,255,0.12), transparent);
          opacity: 0.86;
          pointer-events: none;
        }

        .tf-simple-keyboard .hg-button::after {
          content: '';
          position: absolute;
          inset: -24px auto -24px -58%;
          z-index: 0;
          width: 46%;
          transform: skewX(-18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
          opacity: 0;
          pointer-events: none;
        }

        .tf-simple-keyboard .hg-button:hover::after,
        .tf-simple-keyboard .tf-key-active::after {
          animation: tf-key-shine 1050ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes tf-key-shine {
          0% {
            transform: translateX(0) skewX(-18deg);
            opacity: 0;
          }
          22% {
            opacity: 0.72;
          }
          100% {
            transform: translateX(310%) skewX(-18deg);
            opacity: 0;
          }
        }

        .tf-simple-keyboard .hg-button span {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          white-space: normal;
        }

        .tf-simple-keyboard .hg-functionBtn {
          color: #aeb8c8;
          font-size: 9px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .tf-simple-keyboard .hg-button-bksp {
          flex-basis: 88px !important;
          width: 88px !important;
          max-width: 88px;
        }

        .tf-simple-keyboard .hg-button-tab {
          flex-basis: 58px !important;
          width: 58px !important;
          max-width: 58px;
        }

        .tf-simple-keyboard .hg-button-lock {
          flex-basis: 86px !important;
          width: 86px !important;
          max-width: 86px;
        }

        .tf-simple-keyboard .hg-button-enter {
          flex-basis: 82px !important;
          width: 82px !important;
          max-width: 82px;
        }

        .tf-simple-keyboard .hg-button-shiftleft,
        .tf-simple-keyboard .hg-button-shiftright {
          flex-basis: 82px !important;
          width: 82px !important;
          max-width: 82px;
        }

        .tf-simple-keyboard .hg-button-ctrlleft,
        .tf-simple-keyboard .hg-button-ctrlright,
        .tf-simple-keyboard .hg-button-altleft,
        .tf-simple-keyboard .hg-button-altright,
        .tf-simple-keyboard .hg-button-fn {
          flex-basis: 58px !important;
          width: 58px !important;
          max-width: 58px;
        }

        .tf-simple-keyboard .hg-button-metaleft {
          flex-basis: 78px !important;
          width: 78px !important;
          max-width: 78px;
        }

        .tf-simple-keyboard .hg-button-space {
          flex-basis: 206px !important;
          width: 206px !important;
          max-width: 206px;
        }

        .tf-simple-keyboard .tf-key-home {
          background: var(--tf-key-home-bg);
          border-color: rgba(45, 212, 191, 0.28);
          color: #eef7ff;
          box-shadow:
            0 12px 24px rgba(0, 0, 0, 0.52),
            0 0 16px rgba(45, 212, 191, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.18),
            inset 0 -10px 18px rgba(0, 0, 0, 0.34);
        }

        .tf-simple-keyboard .tf-key-active {
          transform: translateY(-1px);
          border-color: rgba(111, 167, 255, 0.78);
          background:
            radial-gradient(circle at 50% -10%, rgba(111, 167, 255, 0.42), transparent 62%),
            linear-gradient(180deg, #1b2a42 0%, #0c1422 54%, #05080e 100%);
          color: #ffffff;
          box-shadow:
            0 0 0 1px rgba(111, 167, 255, 0.34),
            0 18px 38px rgba(79, 141, 253, 0.28),
            0 0 26px rgba(111, 167, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -10px 18px rgba(0, 0, 0, 0.3);
        }

      `}</style>
    </section>
  );
}
