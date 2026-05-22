'use client';

import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate, useTransform, useSpring } from 'framer-motion';
import { 
  Zap, Shield, Eye, Brain, Radar, 
  Crosshair, Code, EyeOff, Activity, Flame, 
  Target, Aperture, Waves, Ghost, Crown,
  Lock, ArrowRight, X, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { ExpandedSkillModal } from './MasteryChallengeSystem';
import Lenis from 'lenis';
import { Outfit, Bricolage_Grotesque } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'] });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], weight: ['700', '800'] });

type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  rarity: Rarity;
  xpReward: number;
  isUnlocked: boolean;
  progress: number;
}

// TODO: REVERT ALL THESE TO isUnlocked: false ONCE TESTING/LAYOUT REVIEW IS DONE
const UNIQUE_SKILLS: Skill[] = [
  { id: 'parallel_processing', name: 'Parallel Processing', description: 'Train brain multitasking and rapid context switching with 3 parallel typing boxes.', icon: Activity, rarity: 'Epic', xpReward: 500, isUnlocked: true, progress: 100 },
  { id: 'devour_engine', name: 'Devour Engine', description: 'Train ultra-fast text consumption. Text continuously fades and speeds up.', icon: Zap, rarity: 'Legendary', xpReward: 800, isUnlocked: true, progress: 40 },
  { id: 'infinite_recall', name: 'Infinite Recall', description: 'Train advanced memory typing. Text appears briefly then disappears entirely.', icon: Brain, rarity: 'Legendary', xpReward: 1000, isUnlocked: true, progress: 10 },
  { id: 'phantom_reflex', name: 'Phantom Reflex', description: 'Train near-instant key transition reflexes with unpredictable sudden bursts.', icon: Ghost, rarity: 'Epic', xpReward: 700, isUnlocked: true, progress: 5 },
  { id: 'chaos_sync', name: 'Chaos Sync', description: 'Train typing stability under extreme chaos. Screen distortions and moving text.', icon: Target, rarity: 'Legendary', xpReward: 1500, isUnlocked: true, progress: 0 },
  { id: 'hyper_focus', name: 'Hyper Focus Core', description: 'Deep concentration endurance. Zero distraction mode with heavy punishments.', icon: Aperture, rarity: 'Epic', xpReward: 900, isUnlocked: true, progress: 0 },
  { id: 'code_assimilation', name: 'Code Assimilation', description: 'Developer-level mastery. Rapidly changing HTML, CSS, JS, and JSON syntax.', icon: Code, rarity: 'Rare', xpReward: 400, isUnlocked: true, progress: 0 },
  { id: 'flow_state', name: 'Flow State', description: 'Continuous rhythm typing. Speed is synchronized with your accuracy.', icon: Waves, rarity: 'Epic', xpReward: 800, isUnlocked: true, progress: 0 },
  { id: 'precision_dominion', name: 'Precision Dominion', description: 'Perfect accuracy control. Extremely difficult text with tiny error margins.', icon: Crosshair, rarity: 'Legendary', xpReward: 2000, isUnlocked: true, progress: 0 },
  { id: 'keyboard_instinct', name: 'Keyboard Instinct', description: 'Subconscious typing mastery. Blind typing sequences with adaptive scaling.', icon: EyeOff, rarity: 'Legendary', xpReward: 5000, isUnlocked: true, progress: 0 },
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

function SkillCard({ skill, onClick }: { skill: Skill; onClick: () => void }) {
  const Icon = skill.icon;
  const isLocked = !skill.isUnlocked;
  
  // 3D Tilt Logic
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current || isLocked) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // For Tilt
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    x.set(xPct);
    y.set(yPct);
    
    // For Spotlight Glow
    mouseX.set(mouseXPos);
    mouseY.set(mouseYPos);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const glowColors = {
    Common: 'rgba(6,182,212,0.3)',
    Rare: 'rgba(16,185,129,0.3)',
    Epic: 'rgba(217,70,239,0.3)',
    Legendary: 'rgba(245,158,11,0.4)'
  };

  return (
    <motion.div
      ref={ref}
      layoutId={`skill-${skill.id}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: !isLocked ? rotateX : 0,
        rotateY: !isLocked ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "group relative flex h-full w-full flex-col rounded-3xl border bg-[#020202]/90 backdrop-blur-xl overflow-hidden shadow-2xl transition-all duration-300 cursor-pointer min-h-[220px]",
        isLocked 
          ? "border-white/[0.03] grayscale hover:grayscale-0" 
          : "border-white/[0.08] hover:border-white/[0.2] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
      )}
    >
      {!isLocked && (
        <>
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-500 group-hover:opacity-100 z-20"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  600px circle at ${mouseX}px ${mouseY}px,
                  ${glowColors[skill.rarity]},
                  transparent 80%
                )
              `
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </>
      )}

      <div 
        className={cn(
          "relative z-10 flex h-full flex-col p-6 sm:p-8 m-[1px] rounded-[23px] overflow-hidden",
          isLocked ? "bg-[#050505]" : "bg-[#050505]/95 group-hover:bg-black/40 transition-colors duration-500"
        )}
        style={{ transform: "translateZ(30px)" }} // Pop out effect on tilt
      >
        
        {/* Dynamic Scanline Effect */}
        {!isLocked && <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity duration-500 z-0" />}

        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className={cn(
            "inline-flex items-center justify-center w-14 h-14 rounded-2xl border transition-all duration-500 group-hover:scale-110 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
            isLocked 
              ? "bg-zinc-900 border-white/[0.05]" 
              : `bg-gradient-to-br ${rarityColors[skill.rarity]} bg-opacity-20 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]`
          )}>
            {isLocked ? (
              <Lock className="h-6 w-6 text-zinc-500" />
            ) : (
              <Icon className="h-7 w-7 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            )}
          </div>
          
          <div className="flex flex-col items-end gap-1 text-right">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1 rounded-full border",
              isLocked ? "bg-zinc-900 border-white/5 text-zinc-600" : `bg-black/50 border-white/10 ${rarityText[skill.rarity]} shadow-[0_0_15px_rgba(0,0,0,0.5)]`
            )}>
              {skill.rarity}
            </span>
          </div>
        </div>
        
        <h3 className={cn(
          "text-[24px] font-bold tracking-tight mb-2 relative z-10",
          isLocked ? "text-zinc-500" : "text-white"
        )} style={{ transform: "translateZ(40px)" }}>
          {skill.name}
        </h3>
        <p className={cn(
          "text-[14px] leading-relaxed max-w-[95%] mb-8 relative z-10",
          isLocked ? "text-zinc-600" : "text-zinc-300"
        )} style={{ transform: "translateZ(20px)" }}>
          {skill.description}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-white/[0.08] pt-6 relative z-10" style={{ transform: "translateZ(30px)" }}>
          <span className="text-[12px] font-bold tracking-widest flex items-center gap-2 text-zinc-500">
             <Sparkles className={cn("w-4 h-4", isLocked ? "text-zinc-600" : "text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]")} />
             <span className={cn(!isLocked && "text-zinc-300")}>+{skill.xpReward} MASTERY XP</span>
          </span>
          <span className={cn(
            "flex items-center gap-2 text-[13px] font-black tracking-[0.15em] transition-all duration-300",
            isLocked ? "text-zinc-700" : "text-zinc-400 opacity-60 group-hover:opacity-100 group-hover:text-white"
          )}>
            {isLocked ? 'LOCKED' : 'ENTER'} {!isLocked && <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />}
          </span>
        </div>

        {isLocked && skill.progress > 0 && (
          <div className="absolute bottom-0 left-0 h-1.5 bg-white/[0.02] w-full overflow-hidden">
            <div 
              className="h-full bg-zinc-700 shadow-[0_0_10px_rgba(255,255,255,0.1)]" 
              style={{ width: `${skill.progress}%` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function EvolutionRealmOverlay({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void 
}) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Body lock & Scroll reset
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Reset scroll position on open
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      window.history.replaceState(null, '', '#evolution');
    } else {
      if (window.location.hash === '#evolution') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [isOpen]);

  if (!mounted) return null;

  const overlayContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={cn("fixed inset-0 z-[200] antialiased", outfit.className)}
        >
          {/* Deep Cinematic Background */}
          <div className="absolute inset-0 bg-[#020202]">
            {/* Animated Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,black,transparent)] opacity-50" />
            {/* Intense Core Glows */}
            <div className="absolute top-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[150px] mix-blend-screen pointer-events-none" />
            <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-600/10 blur-[150px] mix-blend-screen pointer-events-none" />
            {/* CSS Noise Texture */}
            <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
          </div>

          {/* CSS to hide scrollbar */}
          <style dangerouslySetInnerHTML={{__html: `
            .lenis-hide-scrollbar::-webkit-scrollbar { display: none; }
          `}} />

          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef} 
            data-lenis-prevent="true"
            className="relative z-[1] h-full overflow-y-auto no-scrollbar scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* THIS MUST BE THE ONLY DIRECT CHILD FOR LENIS */}
            <div className="relative mx-auto max-w-6xl w-full pt-8 pb-20 px-6 sm:px-8 lg:px-12 min-h-screen flex flex-col">
              
              {/* Top Bar Navigation */}
              <div className="flex items-center justify-between mb-10">
                <motion.button 
                  onClick={onClose}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="relative z-10 inline-flex items-center gap-3 text-[14px] font-bold text-zinc-400 hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-white/5"
                >
                  <ArrowRight className="w-5 h-5 rotate-180 transition-transform duration-300 group-hover:-translate-x-2" />
                  Return to Matrix
                </motion.button>
              </div>

              {/* Clean Cinematic Header */}
              <div className="mb-14 flex flex-col items-center text-center">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
                  className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-300 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                >
                  <Crown className="h-4 w-4 text-indigo-400" />
                  Evolution Realm Active
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 mb-6 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] leading-[1.05]"
                >
                  Unique Skills
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                  className="max-w-2xl text-base sm:text-lg text-zinc-400/80 leading-relaxed font-medium"
                >
                  Unlock legendary abilities and game-changing passives. All skills enforce a strict <span className="text-white font-bold tracking-wide">&ge;97% accuracy</span> anomaly threshold.
                </motion.p>
              </div>

              {/* Staggered Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {UNIQUE_SKILLS.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.7, 
                      delay: 0.5 + (index * 0.08), 
                      ease: [0.21, 0.47, 0.32, 0.98] 
                    }}
                    className="flex"
                  >
                    <SkillCard skill={skill} onClick={() => setSelectedSkill(skill)} />
                  </motion.div>
                ))}
              </div>

              {/* Bottom Fade Gradient for smooth scroll feeling */}
              <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020202] to-transparent pointer-events-none z-10" />
            </div>
          </div>

          <AnimatePresence>
            {selectedSkill && (
              <ExpandedSkillModal 
                skill={selectedSkill} 
                onClose={() => setSelectedSkill(null)} 
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(overlayContent, document.body);
}
