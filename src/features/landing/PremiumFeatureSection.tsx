"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { BookOpen, ActivitySquare, Keyboard, Target, BarChart3, Trophy, CheckCircle2, TrendingUp } from 'lucide-react';

export default function PremiumFeatureSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollDist, setScrollDist] = useState(2000);

  const measure = useCallback(() => {
    if (trackRef.current) {
      const dist = trackRef.current.scrollWidth - window.innerWidth + 120;
      setScrollDist(Math.max(800, dist));
    }
  }, []);

  useEffect(() => {
    measure();
    const t1 = setTimeout(measure, 300);
    const t2 = setTimeout(measure, 1000);
    window.addEventListener('resize', measure);
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener('resize', measure); };
  }, [measure]);

  /* scroll trackers */
  const { scrollYProgress: imgProg } = useScroll({
    target: sectionRef,
    offset: ['start end', '0.2 start'],
  });

  const { scrollYProgress: hProg } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  /* all transforms at top level (rules of hooks) */
  const imgScale = useTransform(imgProg, [0, 1], [0.8, 1.15]);
  const imgOpacity = useTransform(imgProg, [0, 0.35, 1], [0, 1, 1]);
  const headingOp = useTransform(hProg, [0, 0.06, 0.12], [1, 1, 0]);
  const imgFadeOut = useTransform(hProg, [0.06, 0.18], [1, 0]);
  const cardsOp = useTransform(hProg, [0.1, 0.2], [0, 1]);
  const hintOp = useTransform(hProg, [0.15, 0.22, 0.88, 0.95], [0, 1, 1, 0]);
  const tx = useTransform(hProg, [0.15, 0.92], [0, -scrollDist]);

  /* total section height = viewport + scroll distance for cards */
  const sectionHeight = typeof window !== 'undefined' ? window.innerHeight + scrollDist + 600 : 4000;

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${sectionHeight}px` }}
    >
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* ── ambient glows ── */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[20%] top-[20%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.06),transparent_50%)] blur-[120px]" />
          <div className="absolute right-[15%] top-[40%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.06),transparent_50%)] blur-[120px]" />
          <div className="absolute left-[40%] bottom-[15%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.04),transparent_50%)] blur-[100px]" />
        </div>

        {/* ═══ PHASE 1: Heading + Image ═══ */}
        <motion.div
          className="absolute inset-x-0 top-0 z-20 flex flex-col items-center pt-16 sm:pt-20 text-center px-4"
          style={{ opacity: headingOp }}
        >
          <span className="mb-3 inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[10px] font-bold tracking-[0.2em] text-[#38bdf8] uppercase">
            Feature System
          </span>
          <h2 className="mb-4 max-w-2xl text-3xl font-semibold tracking-tight text-[#f8fafc] sm:text-4xl md:text-5xl">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#a855f7] bg-clip-text text-transparent">
              master the keyboard
            </span>
          </h2>
          <p className="max-w-xl text-sm text-[#94a3b8] sm:text-base leading-relaxed">
            From guided lessons to live analytics — a complete system for speed, precision, and progress.
          </p>
        </motion.div>

        <motion.div
          className="relative z-10 w-[88vw] max-w-[960px] overflow-hidden rounded-2xl"
          style={{ scale: imgScale, opacity: imgFadeOut }}
        >
          <div className="relative aspect-[16/9]">
            <Image src="/media/images/feature-showcase.png" alt="TypeForge Showcase" fill className="object-cover" sizes="90vw" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-[#02050b] via-transparent to-transparent opacity-60" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.08]" />
          </div>
        </motion.div>

        {/* ═══ PHASE 2: Horizontal Cards ═══ */}
        <motion.div
          className="absolute inset-0 flex items-center"
          style={{ opacity: cardsOp }}
        >
          <motion.p
            className="absolute top-8 left-1/2 -translate-x-1/2 text-[11px] text-[#475569] tracking-widest z-30 uppercase font-medium"
            style={{ opacity: hintOp }}
          >
            scroll to explore →
          </motion.p>

          <motion.div
            ref={trackRef}
            className="flex items-center gap-5 pl-8 pr-[50vw] sm:gap-7 sm:pl-14"
            style={{ x: tx }}
          >
            {/* ── CARD 1: Guided Lessons ── */}
            <Card accent="#38bdf8" label="Structured Learning" title="Guided Lessons" desc="Step-by-step paths from fundamentals to precision-first mastery.">
              <div className="flex items-center gap-5">
                <div className="flex flex-col gap-2">
                  {['Beginner', 'Rhythm', 'Accuracy (74%)', 'Mastery'].map((s, i) => (
                    <div key={s} className="flex items-center gap-2.5">
                      <div className={`h-[18px] w-[18px] rounded-full flex items-center justify-center shrink-0 ${i < 2 ? 'bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.4)]' : i === 2 ? 'border-2 border-[#38bdf8]' : 'border border-white/10'}`}>
                        {i < 2 && <CheckCircle2 className="h-3 w-3 text-[#080c16]" />}
                        {i === 2 && <div className="h-[6px] w-[6px] rounded-full bg-[#38bdf8] animate-pulse" />}
                      </div>
                      <span className={`text-[13px] ${i < 2 ? 'text-[#cbd5e1] font-medium' : i === 2 ? 'font-bold text-[#38bdf8]' : 'text-[#3e4a65]'}`}>{s}</span>
                    </div>
                  ))}
                </div>
                <div className="ml-auto flex flex-wrap gap-1.5 self-end">
                  {['Adaptive', 'Structured', 'Trackable'].map(t => (
                    <span key={t} className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-[3px] text-[9px] font-semibold uppercase tracking-wider text-[#64748b]">{t}</span>
                  ))}
                </div>
              </div>
            </Card>

            {/* ── CARD 2: Real-Time Feedback ── */}
            <Card accent="#2dd4bf" label="Live Signals" title="Real-Time Feedback" desc="WPM, accuracy, rhythm, and consistency update instantly as you type.">
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { l: 'Speed', v: '92', u: 'WPM', c: '#2dd4bf' },
                  { l: 'Precision', v: '98.4', u: '%', c: '#f8fafc' },
                  { l: 'Rhythm', v: 'Perfect', u: '', c: '#10b981' },
                ].map(m => (
                  <div key={m.l} className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-3 text-center transition-colors duration-300 group-hover:bg-white/[0.04]">
                    <p className="text-[9px] uppercase tracking-wider text-[#475569] font-bold">{m.l}</p>
                    <p className="mt-1.5 text-lg font-bold" style={{ color: m.c }}>{m.v}</p>
                    {m.u && <p className="text-[9px] text-[#536079] mt-0.5">{m.u}</p>}
                  </div>
                ))}
              </div>
            </Card>

            {/* ── CARD 3: Practice Modes ── */}
            <Card accent="#a855f7" label="Custom Sessions" title="Practice Modes" desc="Train with custom text, code, AI prompts, dictation, races and focused drills.">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {['Code', 'AI Prompts', 'Dictation', 'Sprint', 'Focus'].map((m, i) => (
                    <span key={m} className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 ${i === 1 ? 'border border-[#a855f7]/50 bg-[#a855f7]/15 text-[#d8b4fe] shadow-[0_0_12px_rgba(168,85,247,0.2)]' : 'border border-white/[0.06] bg-white/[0.03] text-[#94a3b8] group-hover:bg-white/[0.06]'}`}>{m}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/30 p-3 transition-colors duration-300 group-hover:border-[#a855f7]/20">
                  <span className="text-[11px] font-mono text-[#a855f7]/70">// Generate AI prompt</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-white/[0.08] text-[10px] text-white/60">↵</span>
                </div>
              </div>
            </Card>

            {/* ── CARD 4: Progress Tracking ── */}
            <Card accent="#f59e0b" label="Momentum" title="Progress Tracking" desc="Streaks, milestones, and habit signals that keep your growth moving forward.">
              <div className="flex items-end justify-between">
                <div className="flex items-end gap-3">
                  <span className="text-[34px] font-extrabold text-[#f59e0b] leading-none drop-shadow-[0_0_14px_rgba(245,158,11,0.35)]">12</span>
                  <div className="mb-1 flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#536079]">Day Streak</span>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-md border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-2 py-0.5 text-[10px] font-bold text-[#fbbf24]">
                      <TrendingUp className="h-3 w-3" /> Top 5%
                    </span>
                  </div>
                </div>
                <div className="flex items-end gap-[3px] h-12">
                  {[30, 45, 25, 60, 80, 50, 95].map((h, i) => (
                    <div key={i} className={`w-[14px] rounded-t transition-colors duration-300 ${i === 6 ? 'bg-gradient-to-t from-[#f59e0b] to-[#fbbf24] shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'bg-white/[0.06] group-hover:bg-white/[0.1]'}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </Card>

            {/* ── CARD 5: Analytics ── */}
            <Card accent="#f43f5e" label="Precision Data" title="Analytics" desc="See trends, weak zones, and measurable performance gains in every session.">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-3 transition-colors duration-300 group-hover:bg-white/[0.04]">
                  <p className="text-[9px] uppercase tracking-widest text-[#475569] font-bold">Accuracy</p>
                  <div className="flex items-baseline gap-1.5 mt-1"><span className="text-lg font-bold text-white">96.2%</span><span className="text-[10px] font-semibold text-[#10b981]">+4.2%</span></div>
                </div>
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-3 transition-colors duration-300 group-hover:bg-white/[0.04]">
                  <p className="text-[9px] uppercase tracking-widest text-[#475569] font-bold">Avg Speed</p>
                  <div className="flex items-baseline gap-1.5 mt-1"><span className="text-lg font-bold text-white">84</span><span className="text-[10px] font-semibold text-[#10b981]">+11 WPM</span></div>
                </div>
                <div className="col-span-2 rounded-xl border border-white/[0.05] bg-white/[0.025] p-3 flex items-center justify-between transition-colors duration-300 group-hover:border-[#f43f5e]/25 group-hover:bg-[#f43f5e]/[0.04]">
                  <span className="text-[9px] uppercase tracking-widest text-[#475569] font-bold group-hover:text-[#fb7185] transition-colors">Weak Keys</span>
                  <div className="flex gap-1.5">
                    {['X', 'C', 'P'].map(k => (
                      <span key={k} className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold border border-[#f43f5e]/30 bg-[#f43f5e]/10 text-[#fb7185]">{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* ── CARD 6: Achievements ── */}
            <Card accent="#eab308" label="Milestones" title="Achievements" desc="Unlock badges and track milestones as you master new skills.">
              <div className="flex flex-col gap-3">
                <div className="flex gap-2.5">
                  {[
                    { e: '🔥', n: 'On Fire', d: '7-day streak' },
                    { e: '⚡', n: 'Speed Demon', d: '100+ WPM' },
                    { e: '🎯', n: 'Precision', d: '99% acc' },
                  ].map(b => (
                    <div key={b.n} className="flex-1 flex flex-col items-center rounded-xl border border-white/[0.05] bg-white/[0.025] p-2.5 text-center transition-colors duration-300 group-hover:bg-white/[0.04]">
                      <span className="text-xl">{b.e}</span>
                      <span className="mt-1 text-[10px] font-semibold text-[#e2e8f0]">{b.n}</span>
                      <span className="text-[8px] text-[#475569] mt-0.5">{b.d}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#eab308]/20 bg-[#eab308]/[0.06] px-3.5 py-2.5">
                  <span className="text-[11px] font-semibold text-[#fbbf24]">12 / 24 unlocked</span>
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#eab308] to-[#fbbf24] shadow-[0_0_6px_rgba(234,179,8,0.4)]" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Reusable Card Shell ── */
function Card({ accent, label, title, desc, children }: {
  accent: string; label: string; title: string; desc: string; children: React.ReactNode;
}) {
  return (
    <div
      className="group relative flex-shrink-0 flex flex-col overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#080b14]/95 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-white/[0.14] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      style={{ width: 'clamp(300px, 30vw, 380px)', height: 'clamp(320px, 40vh, 400px)' }}
    >
      {/* top accent glow line */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent 10%, ${accent}50, transparent 90%)` }} />
      {/* subtle hover radial glow */}
      <div className="pointer-events-none absolute inset-0 rounded-[22px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(500px circle at 50% 0%, ${accent}0a, transparent 60%)` }} />
      {/* inner content */}
      <div className="relative z-10 flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] transition-colors duration-300 group-hover:border-white/[0.12]">
            <div className="h-4 w-4 rounded-sm" style={{ background: `${accent}30` }} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>{label}</span>
        </div>
        <h3 className="mb-1.5 text-[19px] font-semibold text-[#f1f5f9] leading-tight">{title}</h3>
        <p className="mb-auto text-[13px] leading-relaxed text-[#64748b]">{desc}</p>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
