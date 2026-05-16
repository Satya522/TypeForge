'use client';

import { useMotionTemplate, useMotionValue, motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Terminal, Layers, Trophy, Sparkles } from 'lucide-react';

/* ── Types ── */
export interface LessonPathData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  lessonCount: number;
}

/* ── Helper ── */
function getPathKey(title: string) {
  const l = title.toLowerCase();
  if (l.includes('medium') || l.includes('intermediate')) return 'medium';
  if (l.includes('advanced') || l.includes('expert') || l.includes('elite')) return 'advanced';
  return 'beginner';
}

/* ══════════════════════════════════════════════
 *  Spotlight Card Base
 * ══════════════════════════════════════════════ */
function PremiumSpotlightCard({ children, pathSlug, delay, glowColor = "rgba(255,255,255,0.08)" }: { children: React.ReactNode, pathSlug?: string, delay: number, glowColor?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const Wrapper = pathSlug ? Link : "div";
  const wrapperProps = pathSlug ? { href: `/learn/${pathSlug}`, className: "block h-full outline-none" } : { className: "block h-full" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className="h-full"
    >
      <Wrapper {...wrapperProps as any} className="group relative flex h-full w-full mx-auto flex-col rounded-2xl border border-white/[0.04] bg-[#050505] overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/[0.1] hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)]" onMouseMove={handleMouseMove}>
        
        {/* Spotlight Border Mask overlay */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-500 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                400px circle at ${mouseX}px ${mouseY}px,
                ${glowColor},
                transparent 80%
              )
            `
          }}
        />

        {/* Inner Content Container */}
        <div className="relative z-10 flex h-full flex-col p-6 sm:p-8 bg-[#0a0a0a]/90 backdrop-blur-xl transition-colors duration-500 group-hover:bg-[#0a0a0a]/40 m-[1px] rounded-[15px]">
           {children}
        </div>
      </Wrapper>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
 *  Main Export
 * ══════════════════════════════════════════════ */
export default function LearnPathCards({ paths }: { paths: LessonPathData[] }) {
  const beginner = paths.find(p => getPathKey(p.title) === 'beginner');
  const medium = paths.find(p => getPathKey(p.title) === 'medium');
  const advanced = paths.find(p => getPathKey(p.title) === 'advanced');

  return (
    <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {beginner && <PathCard path={beginner} icon={<Terminal className="w-4 h-4 text-zinc-300" />} delay={0} />}
      {medium && <PathCard path={medium} icon={<Layers className="w-4 h-4 text-zinc-300" />} delay={0.1} />}
      {advanced && <PathCard path={advanced} icon={<Trophy className="w-4 h-4 text-zinc-300" />} delay={0.2} />}
      <BeelzebubCard delay={0.3} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 *  Clean, Minimal Card
 * ══════════════════════════════════════════════════════════════ */
function PathCard({ path, icon, delay }: { path: LessonPathData; icon: React.ReactNode; delay: number }) {
  return (
    <PremiumSpotlightCard pathSlug={path.slug} delay={delay}>
      <div className="mb-6 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform duration-500">
        {icon}
      </div>
      
      <h3 className="text-[20px] font-semibold tracking-tight text-zinc-100 mb-2 flex items-center">
        {path.title}
      </h3>
      <p className="text-[13px] leading-relaxed text-zinc-500 mb-8 max-w-[90%]">
        {path.description || 'Structured drills for elite typing performance.'}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-white/[0.04] pt-5">
        <span className="text-[11px] font-bold tracking-widest text-zinc-600">{path.lessonCount} LESSONS</span>
        <span className="flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-zinc-300 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
          ENTER <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </PremiumSpotlightCard>
  );
}

/* ══════════════════════════════════════════════════════════════
 *  Unique Skill Beelzebub Card
 * ══════════════════════════════════════════════════════════════ */
function BeelzebubCard({ delay }: { delay: number }) {
  return (
    <PremiumSpotlightCard delay={delay} glowColor="rgba(99,102,241,0.25)">
      <div className="mb-5 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-[inset_0_1px_0_rgba(99,102,241,0.2)] group-hover:scale-105 transition-transform duration-500">
        <Sparkles className="w-4 h-4 text-indigo-400" />
      </div>
      
      <h3 className="text-[20px] font-semibold tracking-tight text-white mb-1">
        Unique Skill: Beelzebub
      </h3>
      <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400/80 mb-6">
        Lord of Gluttony (Tensura)
      </p>
      
      <ul className="space-y-3 mt-auto mb-2">
        <li className="text-[12px] leading-relaxed flex items-start gap-2.5">
           <span className="w-1 h-1 rounded-full bg-indigo-500 mt-[7px] shrink-0 shadow-[0_0_5px_rgba(99,102,241,0.8)]" />
           <span className="text-zinc-500"><span className="text-zinc-300 font-medium">Predation:</span> Absorbs the target.</span>
        </li>
        <li className="text-[12px] leading-relaxed flex items-start gap-2.5">
           <span className="w-1 h-1 rounded-full bg-indigo-500 mt-[7px] shrink-0 shadow-[0_0_5px_rgba(99,102,241,0.8)]" />
           <span className="text-zinc-500"><span className="text-zinc-300 font-medium">Stomach:</span> Stores & isolates harmful matter.</span>
        </li>
        <li className="text-[12px] leading-relaxed flex items-start gap-2.5">
           <span className="w-1 h-1 rounded-full bg-indigo-500 mt-[7px] shrink-0 shadow-[0_0_5px_rgba(99,102,241,0.8)]" />
           <span className="text-zinc-500"><span className="text-zinc-300 font-medium">Mimicry:</span> Replicates forms & skills.</span>
        </li>
        <li className="text-[12px] leading-relaxed flex items-start gap-2.5">
           <span className="w-1 h-1 rounded-full bg-indigo-500 mt-[7px] shrink-0 shadow-[0_0_5px_rgba(99,102,241,0.8)]" />
           <span className="text-zinc-500"><span className="text-zinc-300 font-medium">Soul Consumption:</span> Bypasses defenses.</span>
        </li>
      </ul>
    </PremiumSpotlightCard>
  );
}



