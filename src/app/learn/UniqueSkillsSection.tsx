'use client';

import { motion } from 'framer-motion';
import { 
  Zap, Shield, Eye, Brain, Radar, 
  Crosshair, Code, EyeOff, Activity, Flame, 
  Target, Aperture, Waves, Ghost, Crown,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ExpandedSkillModal } from './MasteryChallengeSystem';
import { AnimatePresence } from 'framer-motion';
import { PremiumSpotlightCard } from './LearnPathCards';

type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  rarity: Rarity;
  xpReward: number;
  isUnlocked: boolean;
  progress: number; // 0 to 100
}

const UNIQUE_SKILLS: Skill[] = [
  { id: 'parallel_processing', name: 'Parallel Processing', description: 'Train brain multitasking and rapid context switching with 3 parallel typing boxes.', icon: Activity, rarity: 'Epic', xpReward: 500, isUnlocked: true, progress: 100 },
  { id: 'devour_engine', name: 'Devour Engine', description: 'Train ultra-fast text consumption. Text continuously fades and speeds up.', icon: Zap, rarity: 'Legendary', xpReward: 800, isUnlocked: false, progress: 40 },
  { id: 'infinite_recall', name: 'Infinite Recall', description: 'Train advanced memory typing. Text appears briefly then disappears entirely.', icon: Brain, rarity: 'Legendary', xpReward: 1000, isUnlocked: false, progress: 10 },
  { id: 'phantom_reflex', name: 'Phantom Reflex', description: 'Train near-instant key transition reflexes with unpredictable sudden bursts.', icon: Ghost, rarity: 'Epic', xpReward: 700, isUnlocked: false, progress: 5 },
  { id: 'chaos_sync', name: 'Chaos Sync', description: 'Train typing stability under extreme chaos. Screen distortions and moving text.', icon: Target, rarity: 'Legendary', xpReward: 1500, isUnlocked: false, progress: 0 },
  { id: 'hyper_focus', name: 'Hyper Focus Core', description: 'Deep concentration endurance. Zero distraction mode with heavy punishments.', icon: Aperture, rarity: 'Epic', xpReward: 900, isUnlocked: false, progress: 0 },
  { id: 'code_assimilation', name: 'Code Assimilation', description: 'Developer-level mastery. Rapidly changing HTML, CSS, JS, and JSON syntax.', icon: Code, rarity: 'Rare', xpReward: 400, isUnlocked: false, progress: 0 },
  { id: 'flow_state', name: 'Flow State', description: 'Continuous rhythm typing. Speed is synchronized with your accuracy.', icon: Waves, rarity: 'Epic', xpReward: 800, isUnlocked: false, progress: 0 },
  { id: 'precision_dominion', name: 'Precision Dominion', description: 'Perfect accuracy control. Extremely difficult text with tiny error margins.', icon: Crosshair, rarity: 'Legendary', xpReward: 2000, isUnlocked: false, progress: 0 },
  { id: 'keyboard_instinct', name: 'Keyboard Instinct', description: 'Subconscious typing mastery. Blind typing sequences with adaptive scaling.', icon: EyeOff, rarity: 'Legendary', xpReward: 5000, isUnlocked: false, progress: 0 },
];

const rarityColors = {
  Common: 'from-blue-500 to-cyan-400',
  Rare: 'from-emerald-500 to-teal-400',
  Epic: 'from-purple-500 to-pink-500',
  Legendary: 'from-amber-400 to-orange-500'
};

const rarityText = {
  Common: 'text-cyan-400',
  Rare: 'text-emerald-400',
  Epic: 'text-fuchsia-400',
  Legendary: 'text-amber-400'
};

import { useMotionValue, useMotionTemplate } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

function SkillCard({ skill, onClick }: { skill: Skill; onClick: () => void }) {
  const Icon = skill.icon;
  const isLocked = !skill.isUnlocked;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Determine glow color based on rarity (using Tailwind hex approximations)
  const glowColors = {
    Common: 'rgba(6,182,212,0.15)', // cyan
    Rare: 'rgba(16,185,129,0.15)',  // emerald
    Epic: 'rgba(217,70,239,0.15)',  // fuchsia
    Legendary: 'rgba(245,158,11,0.2)' // amber
  };

  return (
    <motion.div
      layoutId={`skill-${skill.id}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      whileHover={!isLocked ? { scale: 1.02, y: -4 } : { scale: 1.01 }}
      className={cn(
        "group relative flex h-full w-full flex-col rounded-2xl border bg-[#050505] overflow-hidden shadow-2xl transition-all duration-500 cursor-pointer min-h-[220px]",
        isLocked 
          ? "border-white/[0.03] grayscale hover:grayscale-0" 
          : "border-white/[0.04] hover:border-white/[0.1] hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)]"
      )}
    >
      {/* Spotlight Border Mask overlay */}
      {!isLocked && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-500 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                400px circle at ${mouseX}px ${mouseY}px,
                ${glowColors[skill.rarity]},
                transparent 80%
              )
            `
          }}
        />
      )}

      {/* Inner Content Container */}
      <div className={cn(
        "relative z-10 flex h-full flex-col p-6 sm:p-8 backdrop-blur-xl transition-colors duration-500 m-[1px] rounded-[15px]",
        isLocked ? "bg-zinc-950/80" : "bg-[#0a0a0a]/90 group-hover:bg-[#0a0a0a]/40"
      )}>
        
        {/* Header Icon & XP */}
        <div className="flex items-start justify-between mb-6">
          <div className={cn(
            "inline-flex items-center justify-center w-12 h-12 rounded-xl border transition-transform duration-500 group-hover:scale-105 shadow-inner",
            isLocked 
              ? "bg-zinc-900 border-white/[0.05]" 
              : `bg-gradient-to-br ${rarityColors[skill.rarity]} bg-opacity-10 border-white/10`
          )}>
            {isLocked ? (
              <Lock className="h-5 w-5 text-zinc-500" />
            ) : (
              <Icon className="h-6 w-6 text-white drop-shadow-md" />
            )}
          </div>
          
          <div className="flex flex-col items-end gap-1 text-right">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md",
              isLocked ? "bg-zinc-900 text-zinc-600" : `bg-white/5 ${rarityText[skill.rarity]}`
            )}>
              {skill.rarity}
            </span>
          </div>
        </div>
        
        {/* Title & Description */}
        <h3 className={cn(
          "text-[22px] font-bold tracking-tight mb-2",
          isLocked ? "text-zinc-500" : "text-white"
        )}>
          {skill.name}
        </h3>
        <p className={cn(
          "text-[13px] leading-relaxed max-w-[95%] mb-8",
          isLocked ? "text-zinc-600" : "text-zinc-400"
        )}>
          {skill.description}
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-white/[0.04] pt-5">
          <span className="text-[11px] font-bold tracking-widest flex items-center gap-1.5 text-zinc-500">
             <Zap className={cn("w-3.5 h-3.5", isLocked ? "text-zinc-600" : "text-amber-400")} />
             +{skill.xpReward} MASTERY XP
          </span>
          <span className={cn(
            "flex items-center gap-1.5 text-[12px] font-black tracking-[0.1em] transition-all duration-300",
            isLocked ? "text-zinc-700" : "text-zinc-300 opacity-40 group-hover:opacity-100 group-hover:text-indigo-400"
          )}>
            {isLocked ? 'LOCKED' : 'ENTER'} {!isLocked && <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />}
          </span>
        </div>

        {/* Locked Progress Bar */}
        {isLocked && skill.progress > 0 && (
          <div className="absolute bottom-0 left-0 h-1 bg-white/[0.05] w-full rounded-b-[15px] overflow-hidden">
            <div 
              className="h-full bg-zinc-700" 
              style={{ width: `${skill.progress}%` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function UniqueSkillsSection() {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  return (
    <section className="relative mx-auto mt-32 max-w-6xl w-full border-t border-white/[0.04] pt-24 pb-12">
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 top-0 -z-10 flex justify-center">
        <div className="h-[2px] w-[20%] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 blur-[2px]" />
      </div>
      <div className="pointer-events-none absolute -top-48 left-1/2 -z-10 h-96 w-[800px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />

      {/* Section Header */}
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-300">
          <Crown className="h-3 w-3" />
          Evolution System
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Unique Skills
        </h2>
        <p className="max-w-xl text-sm text-zinc-400 leading-relaxed">
          Unlock legendary abilities and game-changing passives as you forge your typing mastery. Some skills require deep focus to awaken.
        </p>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {UNIQUE_SKILLS.map((skill, index) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <SkillCard skill={skill} onClick={() => setSelectedSkill(skill)} />
          </motion.div>
        ))}
      </div>

      {/* Skill Details Expansion Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <ExpandedSkillModal 
            skill={selectedSkill} 
            onClose={() => setSelectedSkill(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
}
