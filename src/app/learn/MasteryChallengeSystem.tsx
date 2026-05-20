'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChallengeEngine, { ChallengeMode } from './challenges/ChallengeEngine';

/* ══════════════════════════════════════════════════════════════
 *  Expanded Skill Modal
 * ══════════════════════════════════════════════════════════════ */
export function ExpandedSkillModal({ 
  skill, 
  onClose 
}: { 
  skill: any, 
  onClose: () => void 
}) {
  const Icon = skill.icon;
  const mode = skill.id as ChallengeMode;
  const [hasStarted, setHasStarted] = useState(false);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div 
        layoutId={`skill-${skill.id}`}
        className="relative w-full max-w-6xl rounded-3xl border border-white/[0.08] bg-[#050505] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors z-50"
        >
          <X className="w-5 h-5" />
        </button>

        {!hasStarted ? (
          /* Phase 1: Intro Screen */
          <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[60vh] max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-indigo-500/10 shadow-inner mb-6">
              <Icon className="h-10 w-10 text-indigo-400 drop-shadow-md" />
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-3">{skill.name}</h2>
            
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-[12px] font-black uppercase tracking-widest text-indigo-400 px-3 py-1 bg-indigo-500/10 rounded-md">
                {skill.rarity}
              </span>
              <span className="text-sm font-medium text-zinc-500 flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-400" />
                +{skill.xpReward} Mastery XP
              </span>
            </div>
            
            <p className="text-zinc-400 text-base leading-relaxed max-w-lg mb-8">
              {skill.description}
            </p>

            <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 mb-8 max-w-lg w-full">
              <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> ELITE REQUIREMENT
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Complete all 3 parallel challenges with <strong>&ge;97% accuracy</strong> to achieve mastery. Mistakes are heavily penalized.
              </p>
            </div>

            <button 
              onClick={() => setHasStarted(true)}
              className="px-10 py-3.5 rounded-full bg-indigo-500 text-white font-black tracking-[0.2em] text-sm hover:bg-indigo-400 transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] hover:scale-105"
            >
              START MASTERY
            </button>
          </div>
        ) : (
          /* Phase 2: Horizontal Challenges Layout */
          <div className="p-8 lg:p-12 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.04]">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{skill.name}</h3>
                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Live Calibration • Extreme Mastery</span>
              </div>
              <button 
                onClick={() => setHasStarted(false)}
                className="text-xs font-bold tracking-widest text-zinc-500 hover:text-red-400 transition-colors uppercase px-3 py-1.5 rounded-full border border-transparent hover:border-red-500/20 hover:bg-red-500/10"
              >
                Abort Protocol
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
              <ChallengeEngine mode={mode} />
              <ChallengeEngine mode={mode} />
              <ChallengeEngine mode={mode} />
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
