"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ActivitySquare,
  BarChart3,
  Bot,
  CheckCircle2,
  Circle,
  Gauge,
  GraduationCap,
  Keyboard,
  LineChart,
  Medal,
  Target,
  Trophy,
  Wand2,
  Zap,
} from 'lucide-react';

const lessonSteps = ['Beginner', 'Rhythm', 'Accuracy (74%)', 'Mastery'];
const practiceModes = ['Code', 'AI Prompts', 'Dictation', 'Sprint', 'Focus'];
const weakKeys = ['X', 'C', 'P'];
const reelNavItems = [
  { label: 'Dashboard', href: '/dashboard', Icon: BarChart3 },
  { label: 'Lessons', href: '/learn', Icon: GraduationCap },
  { label: 'Practice', href: '/practice', Icon: Target },
  { label: 'Analytics', href: '/analytics', Icon: LineChart },
] as const;

export default function PremiumFeatureSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reelViewportRef = useRef<HTMLDivElement>(null);
  const reelTrackRef = useRef<HTMLDivElement>(null);
  const [scrollDistance, setScrollDistance] = useState(900);
  const [viewportWidth, setViewportWidth] = useState(1024);
  const [viewportHeight, setViewportHeight] = useState(900);
  const scrollYProgress = useMotionValue(0);

  const updateProgress = useCallback(() => {
    if (typeof window === 'undefined' || !sectionRef.current) return;

    const rect = sectionRef.current.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const scrollableDistance = Math.max(1, sectionRef.current.offsetHeight - window.innerHeight);
    const nextProgress = (window.scrollY - sectionTop) / scrollableDistance;

    scrollYProgress.set(Math.min(1, Math.max(0, nextProgress)));
  }, [scrollYProgress]);

  const measure = useCallback(() => {
    if (typeof window === 'undefined') return;

    setViewportHeight(window.innerHeight);
    setViewportWidth(window.innerWidth);

    const viewportWidth = reelViewportRef.current?.clientWidth ?? window.innerWidth;
    const trackWidth = reelTrackRef.current?.scrollWidth ?? viewportWidth;
    const distance = Math.max(560, trackWidth - viewportWidth + 72);

    setScrollDistance(distance);
    window.requestAnimationFrame(updateProgress);
  }, [updateProgress]);

  useEffect(() => {
    measure();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(measure)
        : null;

    if (reelViewportRef.current) resizeObserver?.observe(reelViewportRef.current);
    if (reelTrackRef.current) resizeObserver?.observe(reelTrackRef.current);

    const firstPass = window.setTimeout(measure, 300);
    const imagePass = window.setTimeout(measure, 900);

    window.addEventListener('resize', measure);
    window.addEventListener('scroll', updateProgress, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      window.clearTimeout(firstPass);
      window.clearTimeout(imagePass);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', updateProgress);
    };
  }, [measure, updateProgress]);

  const headingOpacity = useTransform(scrollYProgress, [0, 0.12, 0.24], [1, 1, 0]);
  const headingY = useTransform(scrollYProgress, [0, 0.24], [0, -72]);
  const compactShowreel = viewportWidth < 640;
  const displayScale = useTransform(scrollYProgress, [0, 0.2, 0.38, 1], [compactShowreel ? 0.76 : 0.5, compactShowreel ? 0.84 : 0.74, compactShowreel ? 0.98 : 0.96, compactShowreel ? 0.98 : 0.96]);
  const displayY = useTransform(scrollYProgress, [0, 0.32, 1], [compactShowreel ? 88 : 260, compactShowreel ? 68 : 126, compactShowreel ? 24 : 68]);
  const screenshotOpacity = useTransform(scrollYProgress, [0, 0.5, 0.66], [1, 1, 0.28]);
  const screenshotBlur = useTransform(scrollYProgress, [0.52, 0.68], [0, 2.4]);
  const screenshotFilter = useTransform(screenshotBlur, (value) => `blur(${value}px)`);
  const reelOpacity = useTransform(scrollYProgress, [0.56, 0.68], [0, 1]);
  const reelIntroY = useTransform(scrollYProgress, [0.56, 0.68], [28, 0]);
  const reelX = useTransform(scrollYProgress, [0.68, 0.96], [0, -scrollDistance]);
  const progressScaleX = useTransform(scrollYProgress, [0.68, 0.96], [0.08, 1]);

  const sectionHeight = Math.max(2500, viewportHeight * 2.8 + scrollDistance);

  useEffect(() => {
    updateProgress();
  }, [sectionHeight, updateProgress]);

  return (
    <section
      ref={sectionRef}
      data-testid="premium-feature-showreel"
      data-motion-skip
      className="relative isolate bg-[#02050b]"
      style={{ height: `${sectionHeight}px` }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#02050b_0%,#050916_48%,#02050b_100%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-[#4f8dfd]/40 to-transparent" />

        <motion.div
          className="absolute inset-x-0 top-4 z-20 mx-auto flex max-w-6xl flex-col items-center px-4 text-center sm:top-6 lg:top-8"
          style={{ opacity: headingOpacity, y: headingY }}
        >
          <span className="inline-flex rounded-full border border-[#6fa7ff]/35 bg-[#07142c]/75 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.34em] text-[#9fcbff] shadow-[0_0_32px_rgba(79,141,253,0.18)] backdrop-blur-xl sm:px-4 sm:py-2">
            TypeForge reel
          </span>
          <h2 className="mt-3 max-w-6xl text-[clamp(2.85rem,8.6vw,7.4rem)] font-black uppercase leading-[0.84] tracking-normal text-white sm:mt-4">
            <span className="block">Signals</span>
            <span className="block">
              <span className="showreel-pop relative mx-1 inline-block -rotate-1 rounded-[0.22em] px-[0.16em] pb-[0.02em] text-[#02050b]">
                inside
              </span>
            </span>
            <span className="block mt-[0.03em]">the display</span>
          </h2>
          <p className="mt-4 max-w-xl text-xs font-bold uppercase leading-6 tracking-normal text-[#90a4cf] sm:text-sm">
            Zoom. Lock. Scroll the system.
          </p>
        </motion.div>

        <motion.div
          className="relative z-10 w-full max-w-[1120px]"
          style={{ scale: displayScale, y: displayY }}
        >
          <div className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#050914] shadow-[0_36px_120px_rgba(0,0,0,0.62)]">
            <div className="relative aspect-[1880/1320]">
              <motion.div
                className="absolute inset-0"
                style={{ opacity: screenshotOpacity, filter: screenshotFilter }}
              >
                <Image
                  src="/media/images/typeforge-display-dashboard.png"
                  alt="TypeForge dashboard display"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 96vw, 1120px"
                  priority
                />
              </motion.div>

              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),transparent_14%,transparent_84%,rgba(79,141,253,0.12))]" />
              <div className="pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-inset ring-white/[0.08]" />

              <motion.div className="absolute inset-0" style={{ opacity: reelOpacity, y: reelIntroY }}>
                <div className="absolute inset-y-[6%] left-[3.6%] hidden w-[13.8%] border-r border-white/[0.07] sm:block">
                  <div className="mb-[12%] flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#7c5cff]/30 bg-[#7c5cff]/15">
                      <Keyboard className="h-4 w-4 text-[#c4b5fd]" />
                    </div>
                    <span className="text-[clamp(0.55rem,0.9vw,0.78rem)] font-bold tracking-normal text-[#f8fafc]">
                      TYPEFORGE
                    </span>
                  </div>
                  <div className="space-y-3">
                    {reelNavItems.map(({ label, href, Icon }) => (
                      <Link
                        key={label}
                        href={href}
                        className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.035] px-2.5 py-2 text-[clamp(0.52rem,0.82vw,0.72rem)] font-medium text-[#aebbe0] transition-colors duration-300 hover:border-[#6fa7ff]/35 hover:bg-[#6fa7ff]/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6fa7ff]/80"
                      >
                        <Icon className="h-3.5 w-3.5 text-[#6fa7ff]" />
                        <span>{label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="absolute left-[5%] right-[5%] top-[11%] bottom-[7%] overflow-hidden sm:left-[19%] sm:right-[3.8%]">
                  <div className="mb-3 hidden items-center justify-between border-b border-white/[0.06] pb-3 sm:flex">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6fa7ff]">
                        Live System Reel
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        TypeForge learning engine
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-[#2dd4bf]/25 bg-[#2dd4bf]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#77f7df]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4bf]" />
                      Active
                    </div>
                  </div>

                  <div ref={reelViewportRef} className="h-[calc(100%-0.35rem)] overflow-hidden sm:h-[calc(100%-4.25rem)]">
                    <motion.div
                      ref={reelTrackRef}
                      className="flex h-full items-center gap-3 pr-[40vw] sm:gap-4 lg:gap-5"
                      style={{ x: reelX }}
                    >
                      <FeatureCard
                        href="/learn/beginner"
                        accent="#6fa7ff"
                        Icon={GraduationCap}
                        label="Structured Learning"
                        title="Guided Lessons"
                        description="Step-by-step paths that take you from fundamentals to precision-first mastery."
                      >
                        <div className="grid flex-1 grid-cols-[1fr_auto] gap-4">
                          <div className="space-y-2.5 sm:space-y-3">
                          {lessonSteps.map((step, index) => (
                            <div key={step} className="flex items-center gap-2.5">
                              {index < 2 ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#6fa7ff]" />
                              ) : index === 2 ? (
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#6fa7ff]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#6fa7ff]" />
                                </span>
                              ) : (
                                <Circle className="h-4 w-4 shrink-0 text-[#536079]" />
                              )}
                              <span className={`text-[12px] font-semibold sm:text-sm ${index === 2 ? 'text-[#9fcbff]' : index === 3 ? 'text-[#536079]' : 'text-[#cbd5e1]'}`}>
                                {step}
                              </span>
                            </div>
                          ))}
                          </div>
                          <div className="hidden w-16 items-end gap-1 sm:flex">
                            {[34, 54, 70, 88].map((height, index) => (
                              <span
                                key={height}
                                className={`w-3 rounded-full ${index === 3 ? 'bg-[#6fa7ff]' : 'bg-[#253452]'}`}
                                style={{ height: `${height}%` }}
                              />
                            ))}
                          </div>
                          <div className="col-span-2 flex flex-wrap gap-1.5 self-end pt-2">
                            {['Adaptive', 'Structured', 'Trackable'].map((chip) => (
                              <span key={chip} className="rounded-full bg-[#12213b] px-2.5 py-1 text-[10px] font-semibold text-[#9fcbff]">
                                {chip}
                              </span>
                            ))}
                          </div>
                        </div>
                      </FeatureCard>

                      <FeatureCard
                        href="/practice/words"
                        accent="#2dd4bf"
                        Icon={ActivitySquare}
                        label="Live Signals"
                        title="Real-Time Feedback"
                        description="WPM, accuracy, rhythm, and consistency update instantly as you type."
                      >
                        <div className="grid flex-1 content-center gap-4">
                          <div className="relative h-28 overflow-hidden rounded-2xl border border-[#2dd4bf]/20 bg-[#071b23]/70">
                            <div className="absolute inset-x-5 top-1/2 h-px bg-[#2dd4bf]/30" />
                            <div className="absolute left-5 right-5 top-[36%] h-12 rounded-full bg-[#2dd4bf]/10 blur-xl" />
                            {[18, 38, 62, 84].map((left, index) => (
                              <span
                                key={left}
                                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#2dd4bf] shadow-[0_0_24px_rgba(45,212,191,0.7)]"
                                style={{ left: `${left}%`, transform: `translateY(${index % 2 ? -24 : 12}px)` }}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-3 gap-2.5">
                          {[
                            ['92', 'WPM', '#60f0c8'],
                            ['98%', 'ACC', '#6fa7ff'],
                            ['Good', 'Rhythm', '#facc15'],
                          ].map(([value, label, color]) => (
                            <div key={label} className="rounded-xl bg-white/[0.045] px-2 py-3 text-center ring-1 ring-white/[0.06]">
                              <p className="text-lg font-bold leading-none sm:text-2xl" style={{ color }}>
                                {value}
                              </p>
                              <p className="mt-2 text-[10px] font-medium text-[#7d8ab0] sm:text-xs">
                                {label}
                              </p>
                            </div>
                          ))}
                          </div>
                        </div>
                      </FeatureCard>

                      <FeatureCard
                        href="/practice"
                        accent="#b36bff"
                        Icon={Bot}
                        label="Custom Sessions"
                        title="Practice Modes"
                        description="Train with custom text, code, AI prompts, dictation, races and focused drills."
                      >
                        <div className="grid flex-1 content-center gap-4">
                          <div className="rounded-2xl border border-[#b36bff]/20 bg-[#160f2a]/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#d9b7ff]">
                              <Wand2 className="h-3.5 w-3.5" />
                              Smart prompt
                            </div>
                            <div className="font-code space-y-2 text-[11px] font-medium text-[#d9b7ff]">
                              <p>// generate focus drill</p>
                              <p className="text-[#8f9bbd]">target: weak keys + rhythm</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {practiceModes.map((mode) => (
                              <span
                                key={mode}
                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${mode === 'AI Prompts' ? 'bg-[#9d4edd] text-white' : 'bg-[#1a2238] text-[#8f9bbd]'}`}
                              >
                                {mode}
                              </span>
                            ))}
                          </div>
                        </div>
                      </FeatureCard>

                      <FeatureCard
                        href="/achievements"
                        accent="#ffd21f"
                        Icon={Zap}
                        label="Momentum"
                        title="Progress Tracking"
                        description="Streaks, milestones, and habit signals that keep your growth moving forward."
                      >
                        <div className="grid flex-1 content-center gap-4">
                          <div className="flex items-end gap-3">
                            <span className="text-4xl font-extrabold leading-none text-[#ffd21f] sm:text-5xl">
                              12
                            </span>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7d8ab0]">
                                Day Streak
                              </p>
                              <p className="mt-1 inline-flex rounded-full bg-[#3a310d] px-3 py-1 text-[11px] font-bold text-[#ffdf5c]">
                                Top 5%
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-7 gap-1.5 rounded-2xl border border-[#ffd21f]/15 bg-[#201b0d]/55 p-3">
                            {[40, 40, 40, 40, 40, 40, 72].map((height, index) => (
                              <div
                                key={`${height}-${index}`}
                                className={`rounded-md ${index === 6 ? 'bg-[#ffd21f]' : 'bg-[#232a43]'}`}
                                style={{ height: `${height}px` }}
                              />
                            ))}
                          </div>
                        </div>
                      </FeatureCard>

                      <FeatureCard
                        href="/analytics"
                        accent="#ff7ac8"
                        Icon={Gauge}
                        label="Precision Data"
                        title="Analytics"
                        description="See trends, weak zones and measurable performance gains in every session."
                      >
                        <div className="grid flex-1 content-center gap-2.5">
                          {[
                            ['Accuracy', '96.2%', '+4.2%'],
                            ['Avg Speed', '84 WPM', '+11 WPM'],
                          ].map(([label, value, delta]) => (
                            <div key={label} className="flex items-center justify-between rounded-lg bg-[#202840] px-3 py-2.5">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a96b8]">
                                  {label}
                                </p>
                                <p className="mt-1 text-lg font-bold text-[#63f49a]">{value}</p>
                              </div>
                              <span className="text-xs font-bold text-[#63f49a]">{delta}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between rounded-lg bg-[#202840] px-3 py-2.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a96b8]">
                              Weak Keys
                            </span>
                            <div className="flex gap-1.5">
                              {weakKeys.map((keyName) => (
                                <span key={keyName} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#df2c7d] text-xs font-bold text-white">
                                  {keyName}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </FeatureCard>

                      <FeatureCard
                        href="/achievements"
                        accent="#f59e0b"
                        Icon={Trophy}
                        label="Milestones"
                        title="Achievements"
                        description="Unlock badges and turn practice history into clear progression signals."
                      >
                        <div className="grid flex-1 content-center gap-4">
                          <div className="grid grid-cols-3 gap-2.5">
                          {[
                            ['Streak', Medal],
                            ['Speed', LineChart],
                            ['Focus', Target],
                          ].map(([label, Icon]) => {
                            const BadgeIcon = Icon as LucideIcon;
                            return (
                              <div key={label as string} className="rounded-xl bg-white/[0.045] p-3 text-center ring-1 ring-white/[0.06]">
                                <BadgeIcon className="mx-auto h-5 w-5 text-[#fbbf24]" />
                                <p className="mt-2 text-[11px] font-bold text-[#f8fafc]">{label as string}</p>
                                <p className="mt-1 text-[9px] text-[#7d8ab0]">Unlocked</p>
                              </div>
                            );
                          })}
                          </div>
                          <div className="rounded-2xl border border-[#f59e0b]/20 bg-[#2a1b07]/60 px-4 py-3">
                            <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-[#fbbf24]">
                              <span>Season</span>
                              <span>12/24</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                              <div className="h-full w-1/2 rounded-full bg-[#fbbf24]" />
                            </div>
                          </div>
                        </div>
                      </FeatureCard>
                    </motion.div>
                  </div>
                </div>

                <div className="absolute bottom-[3.2%] left-[19%] right-[3.8%] hidden h-1 rounded-full bg-white/[0.06] sm:block">
                  <motion.div
                    className="h-full origin-left rounded-full bg-gradient-to-r from-[#6fa7ff] via-[#2dd4bf] to-[#ffd21f]"
                    style={{ scaleX: progressScaleX }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
      <style jsx>{`
        .showreel-pop {
          background:
            radial-gradient(circle at 34% 28%, #dff4ff 0 8%, transparent 9%),
            linear-gradient(180deg, #86d9ff 0%, #5ca4ff 48%, #2767ef 100%);
          box-shadow:
            0 0 0 0.07em #071526,
            0 0 0 0.13em #9adfff,
            0 0 0.28em #5ca4ff,
            0 0 0.62em rgba(92, 164, 255, 0.64),
            inset 0 -0.08em 0 rgba(0, 42, 112, 0.42),
            inset 0 0.06em 0 rgba(255, 255, 255, 0.82);
          text-shadow:
            0.035em 0.035em 0 rgba(255, 255, 255, 0.45),
            -0.035em -0.02em 0 rgba(0, 55, 105, 0.28);
        }
      `}</style>
    </section>
  );
}

function FeatureCard({
  href,
  accent,
  Icon,
  label,
  title,
  description,
  children,
}: {
  href: string;
  accent: string;
  Icon: LucideIcon;
  label: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative flex h-[min(88%,500px)] w-[min(76vw,310px)] shrink-0 rounded-[28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80 sm:w-[min(38vw,420px)] lg:w-[390px]"
    >
      <article
        className="relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#080d19]/92 p-4 shadow-[0_26px_90px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl transition-transform duration-300 group-hover:-translate-y-1 sm:p-5 lg:p-6"
        style={{
          backgroundImage: `
            radial-gradient(circle at 18% 12%, ${accent}24, transparent 34%),
            linear-gradient(145deg, ${accent}16, rgba(8,13,25,0.95) 34%, rgba(6,10,20,0.98))
          `,
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="absolute inset-x-8 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        <div className="relative mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <Icon className="h-[18px] w-[18px]" style={{ color: accent }} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: accent }}>
            {label}
          </span>
        </div>
        <h3 className="relative text-lg font-black leading-tight tracking-normal text-[#f8fafc] sm:text-2xl">
          {title}
        </h3>
        <p className="relative mt-2 text-[11px] leading-5 text-[#a3acc9] sm:text-sm sm:leading-6">
          {description}
        </p>
        <div className="relative flex flex-1 flex-col pt-4">{children}</div>
      </article>
    </Link>
  );
}
