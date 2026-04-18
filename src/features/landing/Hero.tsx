"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Lightning, Target, Fire, CaretRight, Pulse } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';

/* ── Data ── */
const typingLines = [
  "const speed = keyboard.measure('wpm');",
  "if (speed > 90) unlock('advanced');",
  "focus.set('home-row', precision);",
  "streak.push({ day: 14, acc: 98 });",
];

const floatingStats = [
  { icon: Lightning, label: 'WPM', value: 92, suffix: '', color: '#39FF14', glow: 'rgba(57,255,20,0.5)' },
  { icon: Target, label: 'Accuracy', value: 98, suffix: '%', color: '#34d399', glow: 'rgba(52,211,153,0.5)' },
  { icon: Fire, label: 'Streak', value: 14, suffix: 'd', color: '#f59e0b', glow: 'rgba(245,158,11,0.5)' },
];

const keyRows = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];
const homeRowKeys = new Set(['A','S','D','F','J','K','L']);
const accentKeys = new Set(['F','J']); // guide bumps

/* ── Animated counter ── */
function useAnimatedCounter(target: number, duration = 2000, delay = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setCount(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return count;
}

/* ── Typing Simulator ── */
function TypingSimulator() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [wpm, setWpm] = useState(0);

  useEffect(() => {
    const currentLine = typingLines[lineIndex];
    if (charIndex < currentLine.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + currentLine[charIndex]);
        setCharIndex(prev => prev + 1);
        setWpm(Math.floor(55 + Math.random() * 40));
      }, 35 + Math.random() * 40);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => [...prev.slice(-3), currentText]);
        setCurrentText('');
        setCharIndex(0);
        setLineIndex(prev => (prev + 1) % typingLines.length);
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, lineIndex, currentText]);

  const colorize = (text: string) => {
    const keywords = ['const', 'if', 'let', 'var', 'return', 'focus', 'streak', 'unlock'];
    const parts = text.split(/(\s+|[(){}[\].,;'"])/);
    return parts.map((part, i) => {
      if (keywords.includes(part)) return <span key={i} className="text-[#a855f7]">{part}</span>;
      if (/^['"].*['"]$/.test(part)) return <span key={i} className="text-[#f59e0b]">{part}</span>;
      if (/^\d+$/.test(part)) return <span key={i} className="text-[#06b6d4]">{part}</span>;
      if (['(',')','{','}','[',']','.', ',', ';', '>',].includes(part)) return <span key={i} className="text-gray-500">{part}</span>;
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="font-mono text-[12px] leading-relaxed sm:text-[13px]">
      {displayedLines.map((line, i) => (
        <div key={i} className="flex items-start gap-3 text-gray-600 transition-all duration-500">
          <span className="shrink-0 select-none text-gray-700 w-4 text-right">{i + 1}</span>
          <span className="opacity-50">{line}</span>
        </div>
      ))}
      <div className="flex items-start gap-3 text-[#39FF14]">
        <span className="shrink-0 select-none text-[#39FF14]/40 w-4 text-right">{displayedLines.length + 1}</span>
        <span>
          {colorize(currentText)}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            className="inline-block h-[14px] w-[2px] translate-y-[2px] bg-[#39FF14] shadow-[0_0_8px_rgba(57,255,20,0.8)]"
          />
        </span>
      </div>
    </div>
  );
}

/* ── Matrix-style Canvas Background ── */
function MatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cols = Math.floor(W / 22);
    const drops = Array.from({ length: cols }, () => Math.random() * H / 18);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}[]();=><.,:'.split('');
    let animId: number;
    const draw = () => {
      ctx.fillStyle = 'rgba(3,4,3,0.06)';
      ctx.fillRect(0, 0, W, H);
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const alpha = Math.random() > 0.95 ? 0.8 : Math.random() * 0.06;
        ctx.fillStyle = `rgba(57,255,20,${alpha})`;
        ctx.font = '12px monospace';
        ctx.fillText(char, i * 22, y * 18);
        if (y * 18 > H && Math.random() > 0.975) drops[i] = 0;
        else drops[i]++;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 opacity-[0.035]" aria-hidden />;
}

/* ── Main Hero ── */
export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const wpm = useAnimatedCounter(92, 2200, 1000);
  const accuracy = useAnimatedCounter(98, 2200, 1200);
  const streak = useAnimatedCounter(14, 1800, 1400);
  const counters = [wpm, accuracy, streak];
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  // Smooth spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

  // Random key simulation
  useEffect(() => {
    const allKeys = keyRows.flat();
    const interval = setInterval(() => {
      const key = allKeys[Math.floor(Math.random() * allKeys.length)];
      setActiveKey(key);
      setTimeout(() => setActiveKey(null), 180);
    }, 350);
    return () => clearInterval(interval);
  }, []);

  // GSAP entrance
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.fromTo('.hero-eyebrow', { y: 24, opacity: 0, scale: 0.92 }, { y: 0, opacity: 1, scale: 1, duration: 0.8 })
        .fromTo('.hero-headline-word', { y: 90, opacity: 0, rotateX: 50 }, { y: 0, opacity: 1, rotateX: 0, duration: 1.1, stagger: 0.09 }, '-=0.4')
        .fromTo('.hero-sub', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
        .fromTo('.hero-cta', { y: 18, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1 }, '-=0.5')
        .fromTo('.hero-stat', { y: 40, opacity: 0, scale: 0.7 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.12 }, '-=0.4')
        .fromTo('.hero-terminal', { y: 50, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 1 }, '-=0.5')
        .fromTo('.hero-keyboard', { y: 60, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 1 }, '-=0.7');
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const headlineWords = [
    { word: 'Type', accent: false },
    { word: 'faster.', accent: true },
    { word: 'Think', accent: false },
    { word: 'sharper.', accent: true },
    { word: 'Build', accent: false },
    { word: 'mastery.', accent: true },
  ];

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative z-0 min-h-screen overflow-hidden pb-20 pt-24 sm:pt-28 lg:pt-32"
      style={{ background: 'linear-gradient(180deg, #030403 0%, #050704 100%)' }}
    >
      {/* ── Matrix background ── */}
      <MatrixCanvas />

      {/* ── Static background layers ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Central radial */}
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(57,255,20,0.06) 0%, transparent 65%)' }}
        />
        {/* Left accent */}
        <div className="absolute -left-40 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full blur-[100px]"
          style={{ background: 'rgba(57,255,20,0.04)' }}
        />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#030403] to-transparent" />
        {/* Scanlines */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.3) 2px, rgba(57,255,20,0.3) 3px)', backgroundSize: '100% 6px' }}
        />
      </div>

      {/* ── Mouse spotlight ── */}
      <motion.div
        className="pointer-events-none absolute -z-5 h-[600px] w-[600px] rounded-full"
        style={{
          left: springX,
          top: springY,
          x: '-50%',
          y: '-50%',
          background: 'radial-gradient(circle, rgba(57,255,20,0.06) 0%, transparent 65%)',
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14 xl:px-20">

        {/* ── Eyebrow badge ── */}
        <div className="mb-10 flex justify-center">
          <motion.div
            className="hero-eyebrow inline-flex items-center gap-3 rounded-full border border-[#39FF14]/20 bg-[#39FF14]/[0.05] px-5 py-2.5 backdrop-blur-sm"
            style={{ opacity: 0 }}
            whileHover={{ scale: 1.04, borderColor: 'rgba(57,255,20,0.4)' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39FF14] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14]" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#39FF14]/90">
              Precision-first typing platform
            </span>
            <Pulse weight="duotone" className="h-3.5 w-3.5 text-[#39FF14]/60" />
          </motion.div>
        </div>

        {/* ── Headline ── */}
        <div className="mx-auto max-w-5xl text-center" style={{ perspective: '1000px' }}>
          <h1 className="mb-8 overflow-hidden text-6xl font-black leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl xl:text-9xl">
            {headlineWords.map(({ word, accent }, i) => (
              <span key={i} className="hero-headline-word mr-[0.25em] inline-block last:mr-0" style={{ opacity: 0 }}>
                {accent ? (
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(135deg, #39FF14 0%, #86efac 50%, #39FF14 100%)' }}
                  >
                    {word}
                  </span>
                ) : (
                  <span className="text-white">{word}</span>
                )}
              </span>
            ))}
          </h1>

          <p className="hero-sub mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl" style={{ opacity: 0 }}>
            Master your keyboard through guided learning paths, real-time precision tracking,
            and AI-driven practice sessions that adapt to your rhythm.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/learn" className="hero-cta w-full sm:w-auto" style={{ opacity: 0 }}>
              <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}>
                <button className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#39FF14] px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:bg-white hover:shadow-[0_0_40px_rgba(57,255,20,0.4)] sm:w-auto">
                  <span className="relative z-10">Start Training</span>
                  <ArrowRight weight="bold" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  />
                </button>
              </motion.div>
            </Link>
            <Link href="/practice" className="hero-cta w-full sm:w-auto" style={{ opacity: 0 }}>
              <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}>
                <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4 text-sm font-bold tracking-wide text-gray-300 backdrop-blur-sm transition-all hover:border-[#39FF14]/30 hover:bg-[#39FF14]/[0.06] hover:text-white sm:w-auto">
                  Try Practice
                  <CaretRight weight="bold" className="h-4 w-4" />
                </button>
              </motion.div>
            </Link>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="mx-auto mt-16 flex items-center justify-center gap-10 sm:gap-20">
          {floatingStats.map((stat, i) => {
            const Icon = stat.icon;
            const isHov = hoveredStat === i;
            return (
              <motion.div
                key={stat.label}
                className="hero-stat group flex flex-col items-center cursor-default"
                style={{ opacity: 0 }}
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
                whileHover={{ y: -10, scale: 1.1 }}
              >
                <div className="relative mb-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-[#030604] transition-colors group-hover:bg-[#060a06]">
                    <Icon weight="duotone" className="h-5 w-5" style={{ color: stat.color }} />
                  </div>
                  {isHov && <div className="absolute inset-0 rounded-full blur-lg" style={{ background: stat.glow }} />}
                </div>
                <span className="text-4xl font-black tabular-nums sm:text-5xl" style={{ color: stat.color, textShadow: isHov ? `0 0 20px ${stat.glow}` : 'none' }}>
                  {counters[i]}{stat.suffix}
                </span>
                <span className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-gray-600">{stat.label}</span>
              </motion.div>
            );
          })}
        </div>

        {/* ── Terminal + Keyboard ── */}
        <div className="mx-auto mt-16 max-w-5xl grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">

          {/* Terminal */}
          <motion.div
            className="hero-terminal group relative overflow-hidden rounded-2xl border border-white/[0.06] transition-all duration-500 hover:border-[#39FF14]/20 hover:shadow-[0_0_40px_rgba(57,255,20,0.06)]"
            style={{ opacity: 0, background: 'linear-gradient(135deg, rgba(10,14,10,0.95) 0%, rgba(5,8,5,0.98) 100%)', backdropFilter: 'blur(24px)' }}
            whileHover={{ scale: 1.01 }}
          >
            {/* Top neon line */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#39FF14]/50 to-transparent" />
            {/* Glow orb */}
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'rgba(57,255,20,0.08)' }} />

            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-white/[0.04] px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60 hover:bg-red-500 transition-colors cursor-pointer" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60 hover:bg-yellow-500 transition-colors cursor-pointer" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/60 hover:bg-green-500 transition-colors cursor-pointer" />
              <div className="mx-2 flex-1 rounded-md border border-white/[0.05] bg-white/[0.02] px-3 py-0.5 text-center">
                <span className="text-[10px] font-mono text-gray-600">typeforge://session</span>
              </div>
              <motion.div className="h-1.5 w-1.5 rounded-full bg-[#39FF14]" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6">
              <TypingSimulator />
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between border-t border-white/[0.04] px-4 py-1.5 text-[9px] font-mono uppercase tracking-[0.2em] text-gray-700">
              <span>UTF-8</span>
              <span className="flex items-center gap-1.5" style={{ color: '#39FF14', opacity: 0.6 }}>
                <span className="h-1 w-1 rounded-full bg-[#39FF14] animate-pulse" />
                Live
              </span>
              <span>Ln 1, Col 1</span>
            </div>
          </motion.div>

          {/* Keyboard */}
          <div className="hero-keyboard relative" style={{ opacity: 0 }}>
            <div
              className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.06] p-5 transition-all duration-500 hover:border-white/[0.1] hover:shadow-[0_0_30px_rgba(57,255,20,0.04)]"
              style={{ background: 'linear-gradient(180deg, rgba(10,14,10,0.8) 0%, rgba(5,8,5,0.9) 100%)', backdropFilter: 'blur(24px)' }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-600">Keyboard Heatmap</span>
                <span className="flex items-center gap-1.5 text-[10px] text-[#39FF14]/70">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#39FF14]" />
                  Tracking
                </span>
              </div>

              <div className="space-y-1.5">
                {keyRows.map((row, ri) => (
                  <div key={ri} className="flex items-center justify-center gap-1" style={{ paddingLeft: `${ri * 10}px` }}>
                    {row.map((key) => {
                      const isHome = homeRowKeys.has(key);
                      const isAccent = accentKeys.has(key);
                      const isActive = activeKey === key;
                      return (
                        <motion.div
                          key={key}
                          animate={isActive ? { scale: 0.87, y: 2 } : { scale: 1, y: 0 }}
                          transition={{ duration: 0.12, type: 'spring', stiffness: 700 }}
                          className={`relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all duration-100 sm:h-10 sm:w-10`}
                          style={{
                            background: isActive
                              ? 'rgba(57,255,20,0.2)'
                              : isHome
                                ? 'rgba(57,255,20,0.06)'
                                : 'rgba(255,255,255,0.025)',
                            border: isActive
                              ? '1px solid rgba(57,255,20,0.5)'
                              : isHome
                                ? '1px solid rgba(57,255,20,0.12)'
                                : '1px solid rgba(255,255,255,0.05)',
                            color: isActive ? '#39FF14' : isHome ? 'rgba(57,255,20,0.6)' : '#555',
                            boxShadow: isActive ? '0 0 16px rgba(57,255,20,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                          }}
                        >
                          {key}
                          {isAccent && !isActive && (
                            <span className="absolute bottom-1 left-1/2 h-0.5 w-2.5 -translate-x-1/2 rounded-full bg-[#39FF14]/40" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
                <div className="flex justify-center" style={{ paddingLeft: '30px' }}>
                  <motion.div
                    animate={activeKey === ' ' ? { scale: 0.95, y: 2 } : { scale: 1, y: 0 }}
                    className="h-9 w-40 rounded-lg border border-white/[0.05] bg-white/[0.02] sm:h-10 sm:w-48"
                    style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
