'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Zap, AlertTriangle, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import ChallengeEngine, { ChallengeMode } from './challenges/ChallengeEngine';

/* ══════════════════════════════════════════════════════════════
 *  Expanded Skill Modal — Clean SaaS Premium Design
 * ══════════════════════════════════════════════════════════════ */
export function ExpandedSkillModal({ 
  skill, 
  onClose 
}: { 
  skill: any, 
  onClose: () => void 
}) {
  const Icon = skill.icon || Zap;
  const mode = skill.id as ChallengeMode;
  const [hasStarted, setHasStarted] = useState(false);
  
  // Global Evaluation State
  const [completedEngines, setCompletedEngines] = useState<{accuracy: number, mistakes: number, totalChars: number}[]>([]);
  const [globalStatus, setGlobalStatus] = useState<'playing' | 'failed' | 'mastered' | 'processing'>('playing');
  const [resetKey, setResetKey] = useState(0);

  // Whack-A-Mole specific state
  const TOTAL_CHUNKS = 15;
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

  const handleEngineComplete = (stats: {accuracy: number, mistakes: number, totalChars: number}) => {
    if (mode !== 'parallel_processing') return;

    setCompletedEngines(prev => [...prev, stats]);
    
    setCompletedChunks(prev => {
      const newCount = prev + 1;
      
      if (newCount >= TOTAL_CHUNKS) {
        setGlobalStatus('processing');
      } else {
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
      
      if (globalAcc >= 97) setGlobalStatus('mastered');
      else setGlobalStatus('failed');
    }
  }, [globalStatus, completedEngines]);

  const handleResetGlobal = () => {
    if (mode === 'parallel_processing') {
      fetchExtremeQueue();
    } else {
      setCompletedEngines([]);
      setGlobalStatus('playing');
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
    }
  }, [hasStarted, mode]);

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
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors z-50"
        >
          <X className="w-5 h-5" />
        </button>

        {!hasStarted ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[60vh] max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-indigo-500/10 shadow-inner mb-6">
              <Icon className="h-10 w-10 text-indigo-400 drop-shadow-md" />
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-3">{skill.name}</h2>
            
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-[12px] font-black uppercase tracking-widest text-indigo-400 px-3 py-1 bg-indigo-500/10 rounded-md">
                {skill.rarity || 'RARE'}
              </span>
              <span className="text-sm font-medium text-zinc-500 flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-400" />
                +{skill.xpReward || 500} Mastery XP
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
                Complete the sequential challenge with <strong>&ge;97% global accuracy</strong> to achieve mastery. Mistakes are heavily penalized.
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
          <div className="p-8 lg:p-12 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar flex-1 h-[60vh]">
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

            <div className="relative flex-1 w-full h-full min-h-[300px]">
              {isFetchingQueue ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full gap-6 bg-black/40 rounded-xl border border-white/[0.02]">
                  <div className="relative">
                    <div className="w-16 h-16 border-2 border-cyan-500/20 rounded-full animate-ping absolute"></div>
                    <div className="w-16 h-16 border-t-2 border-cyan-400 rounded-full animate-spin"></div>
                    <Zap className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-cyan-400 font-mono text-sm tracking-[0.2em] uppercase font-bold animate-pulse">Initializing Thread Injection</span>
                    <span className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase">Connecting to Database Nexus...</span>
                  </div>
                </div>
              ) : (
                <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-5 w-full h-full min-h-0">
                  <ChallengeEngine 
                    key={`engine-1-${resetKey}`} 
                    mode={mode} 
                    isGlobalManaged={mode === 'parallel_processing'} 
                    isActive={mode === 'parallel_processing' ? activeEngineIndex === 0 : true}
                    forcedText={mode === 'parallel_processing' && activeEngineIndex === 0 ? queue[0] : null}
                    onComplete={handleEngineComplete} 
                  />
                  <ChallengeEngine 
                    key={`engine-2-${resetKey}`} 
                    mode={mode} 
                    isGlobalManaged={mode === 'parallel_processing'} 
                    isActive={mode === 'parallel_processing' ? activeEngineIndex === 1 : true}
                    forcedText={mode === 'parallel_processing' && activeEngineIndex === 1 ? queue[0] : null}
                    onComplete={handleEngineComplete} 
                  />
                  <ChallengeEngine 
                    key={`engine-3-${resetKey}`} 
                    mode={mode} 
                    isGlobalManaged={mode === 'parallel_processing'} 
                    isActive={mode === 'parallel_processing' ? activeEngineIndex === 2 : true}
                    forcedText={mode === 'parallel_processing' && activeEngineIndex === 2 ? queue[0] : null}
                    onComplete={handleEngineComplete} 
                  />
                  
                  {/* Global State Overlays */}
                  <AnimatePresence>
                    {globalStatus === 'failed' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md rounded-2xl border border-red-500/20"
                      >
                        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                        <span className="text-red-400 font-black tracking-[0.3em] text-3xl mb-4 drop-shadow-lg">CHALLENGE FAILED</span>
                        <span className="text-sm text-zinc-400 mb-8 font-mono">GLOBAL ENFORCEMENT: &lt; 97% AVERAGE ACC</span>
                        <div className="flex gap-4">
                          <button 
                            onClick={handleResetGlobal}
                            className="px-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold uppercase tracking-widest text-xs rounded-full border border-red-500/20 transition-all"
                          >
                            RETRY SEQUENCE
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {globalStatus === 'mastered' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md rounded-2xl border border-indigo-500/20"
                      >
                        <Trophy className="w-20 h-20 text-indigo-400 mb-6 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
                        <span className="text-white font-black tracking-[0.3em] text-4xl mb-4 drop-shadow-lg">MASTERY ACHIEVED</span>
                        <span className="text-sm text-zinc-400 mb-8 font-mono uppercase tracking-widest">Global Accuracy: &ge; 97%</span>
                        <button 
                          onClick={onClose}
                          className="px-10 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold uppercase tracking-widest text-sm rounded-full shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all"
                        >
                          CLAIM REWARD
                        </button>
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
