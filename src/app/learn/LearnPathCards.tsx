'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Keyboard, Layers, Trophy, Zap } from 'lucide-react';

/* ── Types ── */
export interface LessonPathData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  lessonCount: number;
}

/* ── Typing simulation text ── */
const typingText = 'The quick brown fox jumps over the lazy dog';
const keyboardRows = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];

/* ── Helper ── */
function getPathKey(title: string) {
  const l = title.toLowerCase();
  if (l.includes('medium') || l.includes('intermediate')) return 'medium';
  if (l.includes('advanced') || l.includes('expert') || l.includes('elite')) return 'advanced';
  return 'beginner';
}

/* ══════════════════════════════════════════════
 *  Main Export
 * ══════════════════════════════════════════════ */
export default function LearnPathCards({ paths }: { paths: LessonPathData[] }) {
  const beginner = paths.find(p => getPathKey(p.title) === 'beginner');
  const medium = paths.find(p => getPathKey(p.title) === 'medium');
  const advanced = paths.find(p => getPathKey(p.title) === 'advanced');

  return (
    <div className="space-y-6">
      {/* Row 1: Full-width Beginner hero */}
      {beginner && <BeginnerSection path={beginner} index={0} />}

      {/* Row 2: Medium + Advanced side by side */}
      {(medium || advanced) && (
        <MediumSection
          path={medium || paths[1]}
          advancedPath={advanced || paths[2]}
          index={1}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 *  BEGINNER — Full-width hero section with LIVE typing demo
 *  Jitter-inspired: vibrant blue world, large interactive keyboard
 * ══════════════════════════════════════════════════════════════ */
function BeginnerSection({ path, index }: { path: LessonPathData; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [typedIndex, setTypedIndex] = useState(0);
  const [activeKey, setActiveKey] = useState('');

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setTypedIndex(prev => {
        const next = prev >= typingText.length ? 0 : prev + 1;
        setActiveKey(typingText[next]?.toUpperCase() || '');
        return next;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.15 }}
    >
      <Link href={`/learn/${path.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-[2.2rem] border border-[#4f8dfd]/20 bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#081430] min-h-[520px] lg:min-h-[480px]">
          {/* Orb glow */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#4f8dfd]/[0.12] blur-[100px] transition-all duration-700 group-hover:bg-[#4f8dfd]/[0.2]" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-[300px] w-[400px] rounded-full bg-[#2dd4bf]/[0.06] blur-[80px]" />
          {/* Grid */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:48px_48px]" />
          {/* Top line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4f8dfd]/60 to-transparent" />

          <div className="relative z-10 grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12 lg:p-12">
            {/* Left: Text */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#4f8dfd]/30 bg-[#4f8dfd]/10 px-4 py-1.5">
                <Keyboard className="h-3.5 w-3.5 text-[#6fa7ff]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9fcbff]">Foundation</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
                {path.title}
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#8facc8]">
                {path.description || 'Master the keyboard from scratch. Home row, basic keys, and building muscle memory.'}
              </p>
              <div className="mt-6 flex items-center gap-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#4f8dfd]/15 px-4 py-2 text-[12px] font-bold text-[#6fa7ff]">
                  <Zap className="h-3.5 w-3.5" /> {path.lessonCount} lessons
                </span>
                <span className="flex items-center gap-2 text-[14px] font-bold text-white/60 transition-colors group-hover:text-white">
                  Start Learning <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                </span>
              </div>
            </div>

            {/* Right: LIVE Keyboard + Typing Demo */}
            <div className="relative">
              {/* Typing output */}
              <div className="mb-4 rounded-2xl border border-white/[0.06] bg-black/30 px-5 py-4 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#4f8dfd] animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4f8dfd]/70">Live Typing</span>
                </div>
                <p className="font-mono text-[15px] leading-relaxed">
                  <span className="text-white">{typingText.slice(0, typedIndex)}</span>
                  <span className="animate-pulse text-[#4f8dfd]">|</span>
                  <span className="text-white/15">{typingText.slice(typedIndex)}</span>
                </p>
              </div>

              {/* Keyboard */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#060e1c]/80 p-4 backdrop-blur-sm">
                {keyboardRows.map((row, ri) => (
                  <div key={ri} className="flex justify-center gap-1.5 mb-1.5" style={{ paddingLeft: ri === 1 ? '12px' : ri === 2 ? '28px' : '0' }}>
                    {row.map(k => {
                      const isActive = activeKey === k;
                      const isHomeRow = 'ASDFGHJKL'.includes(k);
                      return (
                        <motion.span
                          key={k}
                          animate={isActive ? { scale: 0.88, backgroundColor: '#4f8dfd' } : { scale: 1, backgroundColor: isHomeRow ? 'rgba(79,141,253,0.12)' : 'rgba(255,255,255,0.05)' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-bold shadow-[inset_0_-2px_0_rgba(0,0,0,0.3)] sm:h-10 sm:w-10"
                          style={{
                            color: isActive ? '#fff' : isHomeRow ? '#6fa7ff' : '#6b7a94',
                            border: isActive ? '1px solid #4f8dfd' : isHomeRow ? '1px solid rgba(79,141,253,0.25)' : '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          {k}
                        </motion.span>
                      );
                    })}
                  </div>
                ))}
                {/* Spacebar */}
                <div className="mt-1.5 flex justify-center">
                  <motion.span
                    animate={activeKey === ' ' ? { scale: 0.97, backgroundColor: '#4f8dfd' } : { scale: 1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    className="h-9 w-[55%] rounded-lg border border-white/[0.06] shadow-[inset_0_-2px_0_rgba(0,0,0,0.3)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
 *  MEDIUM + ADVANCED — 2-col layout, each with unique world
 * ══════════════════════════════════════════════════════════════ */
function MediumSection({ path, advancedPath, index }: { path: LessonPathData; advancedPath: LessonPathData; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [wpm, setWpm] = useState(42);

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setWpm(prev => {
        if (prev >= 78) return 42;
        return prev + Math.floor(Math.random() * 3) + 1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [inView]);

  const gaugeAngle = -90 + (wpm / 100) * 180;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="mt-6 lg:mt-0"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* MEDIUM — Purple world with speed gauge */}
        <Link href={`/learn/${path.slug}`} className="group block">
          <div className="relative overflow-hidden rounded-[2.2rem] border border-[#b36bff]/20 bg-gradient-to-br from-[#14082a] via-[#1a0e38] to-[#0f0820] min-h-[420px]">
            <div className="pointer-events-none absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full bg-[#b36bff]/[0.1] blur-[90px] transition-all duration-700 group-hover:bg-[#b36bff]/[0.18]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(rgba(179,107,255,0.5)_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b36bff]/60 to-transparent" />

            <div className="relative z-10 flex flex-col p-8 sm:p-10 h-full">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[#b36bff]/30 bg-[#b36bff]/10 px-4 py-1.5">
                <Layers className="h-3.5 w-3.5 text-[#c4a0ff]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#d4b8ff]">Expansion</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{path.title}</h2>
              <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-[#9b8aaf]">
                {path.description || 'Expand to the full keyboard with real words and speed building.'}
              </p>

              {/* Speed Gauge — Jitter style live visual */}
              <div className="mt-auto pt-8 flex items-center justify-center">
                <div className="relative w-[200px] h-[120px]">
                  <svg viewBox="0 0 200 120" className="w-full h-full">
                    <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="rgba(179,107,255,0.15)" strokeWidth="8" strokeLinecap="round" />
                    <motion.path
                      d="M 20 110 A 80 80 0 0 1 180 110"
                      fill="none" stroke="url(#purpleGrad)" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray="251" animate={{ strokeDashoffset: 251 - (wpm / 100) * 251 }}
                      transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                    />
                    <defs><linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#c084fc" /></linearGradient></defs>
                  </svg>
                  <div className="absolute inset-x-0 bottom-1 text-center">
                    <motion.span className="text-4xl font-black text-white tabular-nums" key={wpm}>{wpm}</motion.span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#b36bff]/60 mt-0.5">WPM</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#b36bff]/70">{path.lessonCount} lessons</span>
                <span className="flex items-center gap-2 text-[13px] font-bold text-white/50 group-hover:text-white transition-colors">
                  Open Path <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* ADVANCED — Gold/amber world with elite rank */}
        <AdvancedInner path={advancedPath} />
      </div>
    </motion.div>
  );
}

function AdvancedInner({ path: p }: { path: LessonPathData }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [rank, setRank] = useState(847);

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setRank(prev => Math.max(12, prev - Math.floor(Math.random() * 40) - 5));
    }, 600);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 60 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
      <Link href={`/learn/${p.slug}`} className="group block h-full">
        <div className="relative overflow-hidden rounded-[2.2rem] border border-[#f59e0b]/20 bg-gradient-to-br from-[#1a1208] via-[#231a0a] to-[#14100a] min-h-[420px] h-full">
          <div className="pointer-events-none absolute -left-16 -top-16 h-[350px] w-[350px] rounded-full bg-[#f59e0b]/[0.08] blur-[80px] transition-all duration-700 group-hover:bg-[#f59e0b]/[0.15]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(rgba(245,158,11,0.6)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f59e0b]/60 to-transparent" />

          <div className="relative z-10 flex flex-col p-8 sm:p-10 h-full">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-4 py-1.5">
              <Trophy className="h-3.5 w-3.5 text-[#fbbf24]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#fcd34d]">Elite</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{p.title}</h2>
            <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-[#a89272]">
              {p.description || 'Push your speed and accuracy to the limit with elite-level drills.'}
            </p>

            {/* Climbing rank visualization */}
            <div className="mt-auto pt-8">
              <div className="rounded-2xl border border-[#f59e0b]/15 bg-black/20 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f59e0b]/60">Global Leaderboard</span>
                  <span className="rounded-full bg-[#f59e0b]/15 px-3 py-1 text-[10px] font-bold text-[#fbbf24]">LIVE</span>
                </div>
                <div className="flex items-end gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Your Rank</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[11px] text-[#fbbf24]/70">#</span>
                      <motion.span className="text-5xl font-black tabular-nums text-[#fbbf24]" key={rank}>
                        {rank}
                      </motion.span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-end gap-1 h-16">
                    {[28, 42, 35, 56, 48, 62, 72, 55, 80, 68, 90, 85].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{ background: i >= 10 ? '#fbbf24' : i >= 8 ? '#f59e0b80' : 'rgba(251,191,36,0.15)' }}
                        initial={{ height: 0 }}
                        animate={inView ? { height: `${h}%` } : {}}
                        transition={{ delay: i * 0.05 + 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#f59e0b]/70">{p.lessonCount} lessons</span>
              <span className="flex items-center gap-2 text-[13px] font-bold text-white/50 group-hover:text-white transition-colors">
                Open Path <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}


