'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Zap, AlertTriangle, Trophy, Brain, Ghost, Activity, Aperture, Code, Waves, Crosshair, EyeOff, Flame, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import ChallengeEngine, { ChallengeMode } from './challenges/ChallengeEngine';

/* ══════════════════════════════════════════════════════════════════════════
 *  MODE VISUAL CONFIG — Unique glow colors and gradients per mode
 * ══════════════════════════════════════════════════════════════════════════ */
const MODE_VISUALS: Record<string, {
  glowFrom: string;
  glowTo: string;
  accentText: string;
  accentBg: string;
  borderAccent: string;
  icon: React.ElementType;
}> = {
  parallel_processing: { glowFrom: 'from-cyan-500/10', glowTo: 'to-blue-500/10', accentText: 'text-cyan-400', accentBg: 'bg-cyan-500', borderAccent: 'border-cyan-500/20', icon: Activity },
  infinite_recall: { glowFrom: 'from-violet-500/10', glowTo: 'to-purple-500/10', accentText: 'text-violet-400', accentBg: 'bg-violet-500', borderAccent: 'border-violet-500/20', icon: Brain },
  phantom_reflex: { glowFrom: 'from-emerald-500/10', glowTo: 'to-green-500/10', accentText: 'text-emerald-400', accentBg: 'bg-emerald-500', borderAccent: 'border-emerald-500/20', icon: Ghost },
  chaos_sync: { glowFrom: 'from-orange-500/10', glowTo: 'to-red-500/10', accentText: 'text-orange-400', accentBg: 'bg-orange-500', borderAccent: 'border-orange-500/20', icon: Flame },
  devour_engine: { glowFrom: 'from-red-500/10', glowTo: 'to-rose-500/10', accentText: 'text-red-400', accentBg: 'bg-red-500', borderAccent: 'border-red-500/20', icon: Zap },
  hyper_focus: { glowFrom: 'from-rose-500/10', glowTo: 'to-pink-500/10', accentText: 'text-rose-400', accentBg: 'bg-rose-500', borderAccent: 'border-rose-500/20', icon: Aperture },
  code_assimilation: { glowFrom: 'from-green-500/10', glowTo: 'to-emerald-500/10', accentText: 'text-green-400', accentBg: 'bg-green-500', borderAccent: 'border-green-500/20', icon: Code },
  flow_state: { glowFrom: 'from-sky-500/10', glowTo: 'to-cyan-500/10', accentText: 'text-sky-400', accentBg: 'bg-sky-500', borderAccent: 'border-sky-500/20', icon: Waves },
  precision_dominion: { glowFrom: 'from-amber-500/10', glowTo: 'to-yellow-500/10', accentText: 'text-amber-400', accentBg: 'bg-amber-500', borderAccent: 'border-amber-500/20', icon: Crosshair },
  keyboard_instinct: { glowFrom: 'from-pink-500/10', glowTo: 'to-fuchsia-500/10', accentText: 'text-pink-400', accentBg: 'bg-pink-500', borderAccent: 'border-pink-500/20', icon: EyeOff },
};

/* ══════════════════════════════════════════════════════════════════════════
 *  Expanded Skill Modal — 2030 Premium Design
 * ══════════════════════════════════════════════════════════════════════════ */
export function ExpandedSkillModal({ 
  skill, 
  onClose 
}: { 
  skill: any, 
  onClose: () => void 
}) {
  const Icon = skill.icon || Zap;
  const mode = skill.id as ChallengeMode;
  const visual = MODE_VISUALS[mode] || MODE_VISUALS.parallel_processing;
  const [hasStarted, setHasStarted] = useState(false);
  
  // Global Evaluation State
  const [completedEngines, setCompletedEngines] = useState<{accuracy: number, mistakes: number, totalChars: number}[]>([]);
  const [globalStatus, setGlobalStatus] = useState<'playing' | 'failed' | 'mastered' | 'processing'>('playing');
  const [resetKey, setResetKey] = useState(0);

  const TOTAL_CHUNKS = mode === 'parallel_processing' ? 15 : 3;
  const [queue, setQueue] = useState<string[]>([]);
  const [activeEngineIndex, setActiveEngineIndex] = useState<number>(0);
  const [completedChunks, setCompletedChunks] = useState<number>(0);
  const [isFetchingQueue, setIsFetchingQueue] = useState<boolean>(false);

  const fetchExtremeQueue = async () => {
    setIsFetchingQueue(true);
    try {
      const res = await fetch('/api/challenges/extreme');
      if (res.ok) {
        const data = await res.json();
        setQueue(data.queue || []);
      } else {
        setQueue(Array.from({ length: TOTAL_CHUNKS }, () => "API_ERROR_FALLBACK"));
      }
    } catch (e) {
      setQueue(Array.from({ length: TOTAL_CHUNKS }, () => "NETWORK_ERROR_FALLBACK"));
    } finally {
      setIsFetchingQueue(false);
      setCompletedEngines([]);
      setGlobalStatus('playing');
      setCompletedChunks(0);
      setActiveEngineIndex(Math.floor(Math.random() * 3));
      setResetKey(prev => prev + 1);
    }
  };

  const isEngineActive = (index: number) => {
    if (mode === 'parallel_processing') return activeEngineIndex === index;
    return completedEngines.length === index;
  };

  const isEngineCompleted = (index: number) => {
    if (mode === 'parallel_processing') return false;
    return completedEngines.length > index;
  };

  const getEngineForcedText = (index: number) => {
    if (mode === 'parallel_processing') return activeEngineIndex === index ? queue[0] : null;
    return null;
  };

  const handleEngineComplete = (stats: {accuracy: number, mistakes: number, totalChars: number}) => {
    setCompletedEngines(prev => [...prev, stats]);
    
    setCompletedChunks(prev => {
      const newCount = prev + 1;
      
      if (newCount >= TOTAL_CHUNKS) {
        setGlobalStatus('processing');
      } else if (mode === 'parallel_processing') {
        setQueue(q => q.slice(1));
        setActiveEngineIndex(currentIndex => {
          let nextIndex = Math.floor(Math.random() * 3);
          while (nextIndex === currentIndex) {
            nextIndex = Math.floor(Math.random() * 3);
          }
          return nextIndex;
        });
      }
      return newCount;
    });
  };

  useEffect(() => {
    if (globalStatus === 'processing' && completedEngines.length === TOTAL_CHUNKS) {
      const totalMistakes = completedEngines.reduce((acc, curr) => acc + curr.mistakes, 0);
      const totalChars = completedEngines.reduce((acc, curr) => acc + curr.totalChars, 0);
      const globalAcc = Math.max(0, 100 - (totalMistakes / totalChars) * 100);
      
      setTimeout(() => {
        if (globalAcc >= 97) setGlobalStatus('mastered');
        else setGlobalStatus('failed');
      }, 800); // Dramatic pause before verdict
    }
  }, [globalStatus, completedEngines]);

  const handleResetGlobal = () => {
    if (mode === 'parallel_processing') {
      fetchExtremeQueue();
    } else {
      setCompletedEngines([]);
      setGlobalStatus('playing');
      setCompletedChunks(0);
      setResetKey(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!hasStarted) {
      setQueue([]);
      setCompletedEngines([]);
      setGlobalStatus('playing');
      setCompletedChunks(0);
      setResetKey(prev => prev + 1);
    } else if (mode === 'parallel_processing') {
      fetchExtremeQueue();
    } else {
      setCompletedEngines([]);
      setGlobalStatus('playing');
      setCompletedChunks(0);
      setResetKey(prev => prev + 1);
    }
  }, [hasStarted, mode]);

  const globalProgress = (completedChunks / TOTAL_CHUNKS) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl"
      onClick={onClose}
    >
      <motion.div 
        layoutId={`skill-${skill.id}`}
        className="relative w-full max-w-7xl rounded-3xl border border-white/[0.06] bg-[#030305] shadow-[0_0_120px_rgba(0,0,0,0.9)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic glow effects based on mode */}
        <div className={cn("absolute -top-40 -left-40 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none opacity-60", `bg-gradient-to-br ${visual.glowFrom} ${visual.glowTo}`)} />
        <div className={cn("absolute -bottom-40 -right-40 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none opacity-40", `bg-gradient-to-tl ${visual.glowFrom} ${visual.glowTo}`)} />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-white/[0.03] text-zinc-500 hover:bg-white/[0.08] hover:text-white transition-all z-50 border border-white/[0.04]"
        >
          <X className="w-4 h-4" />
        </button>

        {!hasStarted ? (
          /* ═══ PHASE 1: Epic Intro Screen ═══ */
          <div className="flex flex-col items-center justify-center p-16 text-center h-full min-h-[65vh] max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Mode Icon */}
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={cn("flex h-24 w-24 items-center justify-center rounded-3xl border shadow-2xl mb-8", visual.borderAccent, `${visual.glowFrom.replace('from-', 'bg-').replace('/10', '/10')}`)}
            >
              <Icon className={cn("h-12 w-12 drop-shadow-lg", visual.accentText)} />
            </motion.div>

            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black text-white mb-4 tracking-tight"
            >
              {skill.name}
            </motion.h2>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <span className={cn("text-[11px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border", visual.accentText, visual.borderAccent, `${visual.glowFrom.replace('from-', 'bg-').replace('/10', '/5')}`)}>
                {skill.rarity || 'RARE'}
              </span>
              <span className="text-sm font-medium text-zinc-500 flex items-center gap-1.5">
                <Sparkles className={cn("w-4 h-4", visual.accentText)} />
                +{skill.xpReward || 500} XP
              </span>
            </motion.div>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-zinc-500 text-lg leading-relaxed max-w-xl mb-10"
            >
              {skill.description}
            </motion.p>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={cn("p-6 rounded-2xl border mb-10 max-w-lg w-full", visual.borderAccent, `${visual.glowFrom.replace('from-', 'bg-').replace('/10', '/3')}`)}
            >
              <p className={cn("text-xs font-bold mb-2 flex items-center justify-center gap-2 uppercase tracking-widest", visual.accentText)}>
                <Shield className="w-4 h-4" /> Mastery Protocol
              </p>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Complete <strong className="text-zinc-300">3 sequential challenges</strong> with <strong className={visual.accentText}>&ge;97% global accuracy</strong>. Each engine must be cleared before the next unlocks.
              </p>
            </motion.div>

            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setHasStarted(true)}
              className={cn(
                "px-12 py-4 rounded-full text-white font-black tracking-[0.25em] text-sm transition-all",
                visual.accentBg,
                `shadow-[0_0_40px_rgba(0,0,0,0.3)] hover:shadow-[0_0_60px_rgba(0,0,0,0.4)]`
              )}
            >
              INITIALIZE PROTOCOL
            </motion.button>
          </div>
        ) : (
          /* ═══ PHASE 2: Challenge Arena ═══ */
          <div className="p-8 lg:p-10 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar flex-1 min-h-[65vh]">
            {/* Header with global progress */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.04]">
              <div className="flex items-center gap-4">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", visual.borderAccent, `${visual.glowFrom.replace('from-', 'bg-').replace('/10', '/10')}`)}>
                  <Icon className={cn("h-5 w-5", visual.accentText)} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{skill.name}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-600">
                      {mode === 'parallel_processing' ? 'Whack-A-Mole Protocol' : 'Sequential Protocol'}
                    </span>
                    <span className={cn("text-[9px] uppercase tracking-widest font-black", visual.accentText)}>
                      {completedChunks}/{TOTAL_CHUNKS}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setHasStarted(false)}
                className="text-[10px] font-bold tracking-[0.2em] text-zinc-600 hover:text-red-400 transition-colors uppercase px-4 py-2 rounded-full border border-white/[0.04] hover:border-red-500/20 hover:bg-red-500/5"
              >
                ABORT
              </button>
            </div>

            {/* Global progress bar */}
            <div className="w-full mb-6">
              <div className="w-full h-[4px] bg-white/[0.03] rounded-full overflow-hidden">
                <motion.div 
                  className={cn("h-full rounded-full", `bg-gradient-to-r ${visual.glowFrom.replace('/10', '')} ${visual.glowTo.replace('/10', '')}`)}
                  animate={{ width: `${globalProgress}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
              </div>
            </div>

            {/* Challenge Grid */}
            <div className="relative flex-1 w-full h-full min-h-[300px]">
              {isFetchingQueue ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full gap-6 bg-black/40 rounded-2xl border border-white/[0.02]">
                  <div className="relative">
                    <div className={cn("w-20 h-20 border-2 rounded-full animate-ping absolute", visual.borderAccent)} />
                    <div className={cn("w-20 h-20 border-t-2 rounded-full animate-spin", visual.borderAccent)} />
                    <Zap className={cn("w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse", visual.accentText)} />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className={cn("font-mono text-sm tracking-[0.2em] uppercase font-bold animate-pulse", visual.accentText)}>Initializing Thread Injection</span>
                    <span className="text-zinc-600 font-mono text-[10px] tracking-widest uppercase">Connecting to Database Nexus...</span>
                  </div>
                </div>
              ) : (
                <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-5 w-full h-full min-h-0">
                  <ChallengeEngine 
                    key={`engine-1-${resetKey}`} 
                    mode={mode} 
                    isGlobalManaged={true} 
                    isActive={isEngineActive(0)}
                    forcedText={getEngineForcedText(0)}
                    isCompleted={isEngineCompleted(0)}
                    onComplete={handleEngineComplete} 
                  />
                  <ChallengeEngine 
                    key={`engine-2-${resetKey}`} 
                    mode={mode} 
                    isGlobalManaged={true} 
                    isActive={isEngineActive(1)}
                    forcedText={getEngineForcedText(1)}
                    isCompleted={isEngineCompleted(1)}
                    onComplete={handleEngineComplete} 
                  />
                  <ChallengeEngine 
                    key={`engine-3-${resetKey}`} 
                    mode={mode} 
                    isGlobalManaged={true} 
                    isActive={isEngineActive(2)}
                    forcedText={getEngineForcedText(2)}
                    isCompleted={isEngineCompleted(2)}
                    onComplete={handleEngineComplete} 
                  />
                  
                  {/* ═══ GLOBAL OVERLAYS ═══ */}
                  <AnimatePresence>
                    {globalStatus === 'processing' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl rounded-2xl"
                      >
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                          <div className={cn("w-12 h-12 border-t-2 rounded-full", visual.borderAccent)} />
                        </motion.div>
                        <span className="text-zinc-500 font-mono text-xs tracking-[0.3em] uppercase mt-4 animate-pulse">
                          Evaluating Global Accuracy...
                        </span>
                      </motion.div>
                    )}

                    {globalStatus === 'failed' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#080005]/98 backdrop-blur-xl rounded-2xl border border-red-500/10"
                      >
                        <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }}>
                          <AlertTriangle className="w-20 h-20 text-red-500 mb-6 drop-shadow-[0_0_25px_rgba(239,68,68,0.5)]" />
                        </motion.div>
                        <span className="text-red-500 font-black tracking-[0.35em] text-4xl mb-3 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">SEQUENCE FAILED</span>
                        <span className="text-red-400/40 font-mono text-xs uppercase tracking-[0.2em] mb-8">Global accuracy below 97% enforcement threshold</span>
                        <button 
                          onClick={handleResetGlobal}
                          className="px-10 py-3.5 bg-red-500/10 hover:bg-red-500/15 text-red-400 font-black uppercase tracking-[0.25em] text-xs rounded-full border border-red-500/20 transition-all hover:border-red-500/30"
                        >
                          REINITIALIZE SEQUENCE
                        </button>
                      </motion.div>
                    )}

                    {globalStatus === 'mastered' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn("absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#030008]/98 backdrop-blur-xl rounded-2xl border", visual.borderAccent)}
                      >
                        <motion.div 
                          initial={{ scale: 0, rotate: -90 }} 
                          animate={{ scale: 1, rotate: 0 }} 
                          transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
                        >
                          <Trophy className={cn("w-24 h-24 mb-8 drop-shadow-[0_0_30px_rgba(129,140,248,0.5)]", visual.accentText)} />
                        </motion.div>
                        <motion.span 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="text-white font-black tracking-[0.35em] text-5xl mb-4 drop-shadow-lg"
                        >
                          MASTERY ACHIEVED
                        </motion.span>
                        <motion.span 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          className={cn("text-sm mb-10 font-mono uppercase tracking-[0.2em]", visual.accentText)}
                        >
                          Global Accuracy: &ge; 97% • Protocol Cleared
                        </motion.span>
                        <motion.button 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={onClose}
                          className={cn(
                            "px-12 py-4 text-white font-black uppercase tracking-[0.25em] text-sm rounded-full transition-all",
                            visual.accentBg,
                            "shadow-[0_0_40px_rgba(0,0,0,0.3)]"
                          )}
                        >
                          CLAIM REWARD
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
