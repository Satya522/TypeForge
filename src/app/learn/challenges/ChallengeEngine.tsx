'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trophy, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ChallengeMode = 
  | 'parallel_processing' 
  | 'devour_engine' 
  | 'infinite_recall' 
  | 'phantom_reflex'
  | 'chaos_sync'
  | 'hyper_focus'
  | 'code_assimilation'
  | 'flow_state'
  | 'precision_dominion'
  | 'keyboard_instinct';

interface ChallengeEngineProps {
  mode: ChallengeMode;
  onMastered?: () => void;
}

const TEXT_POOLS: Record<ChallengeMode, string[]> = {
  parallel_processing: [
    'async function sync() { await Promise.all([task1, task2]); }',
    'Thread-1: active | Thread-2: waiting | Thread-3: resolving...',
  ],
  devour_engine: [
    'Absorb this quickly before it fades into the void.',
    'Speed is everything. Do not let the text vanish.',
  ],
  infinite_recall: [
    'Memorize this exact sequence. 0x9F2A-B7C1-4D',
    'Once this vanishes, you must trust your subconscious memory.',
  ],
  phantom_reflex: [
    'Burst! -> [SPEED] -> Sudden stop. Now type.',
    'Reaction time is key. *&^%$#@! Wait for it...',
  ],
  chaos_sync: [
    'Typing in the middle of an absolute visual earthquake.',
    'Focus through the distortion. Do not lose your rhythm.',
  ],
  hyper_focus: [
    'One single mistake will reset everything. Stay completely locked in.',
    'Endurance test initiated. Keep your heart rate steady and type.',
  ],
  code_assimilation: [
    'const x = () => { return { a: 1, b: [2, 3] }; };',
    '<div id="root" class="flex items-center justify-center"></div>',
  ],
  flow_state: [
    'Like water flowing down a stream, typing should be effortless.',
    'Do not break the combo. Keep the rhythm perfectly synchronized.',
  ],
  precision_dominion: [
    'P!r#c$s%i^o&n. M@s*t(e)r_y. N0_r00m_f0r_3rr0r5.',
    'aAaBbBcCcdDdEeEfFfGgGhHhIiIjJjKkKlLlMmMnNnOoOpPp',
  ],
  keyboard_instinct: [
    'Blind typing mode active. You should not need to look anymore.',
    'Your fingers already know where the keys are. Trust them completely.',
  ]
};

export default function ChallengeEngine({ mode }: ChallengeEngineProps) {
  const [status, setStatus] = useState<'idle' | 'typing' | 'failed' | 'mastered'>('idle');
  const [textToType, setTextToType] = useState('');
  const [input, setInput] = useState('');
  const [mistakes, setMistakes] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mode specific states
  const [isMemoryHidden, setIsMemoryHidden] = useState(false);
  const [opacityFade, setOpacityFade] = useState(1);
  const [chaosOffset, setChaosOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    resetChallenge();
  }, [mode]);

  const resetChallenge = () => {
    const pool = TEXT_POOLS[mode] || TEXT_POOLS.flow_state;
    setTextToType(pool[Math.floor(Math.random() * pool.length)]);
    setInput('');
    setMistakes(0);
    setStatus('idle');
    setIsMemoryHidden(false);
    setOpacityFade(1);
    setChaosOffset({ x: 0, y: 0 });
    inputRef.current?.focus();
  };

  // Live Accuracy
  const accuracy = useMemo(() => {
    if (input.length === 0) return 100;
    return Math.max(0, 100 - (mistakes / input.length) * 100);
  }, [input, mistakes]);

  // Strict Fail Condition
  useEffect(() => {
    if (status === 'typing') {
      if (input.length > 5 && accuracy < 97) setStatus('failed');
      if (input.length === textToType.length) {
        if (accuracy >= 97) setStatus('mastered');
        else setStatus('failed');
      }
    }
  }, [input, accuracy, status, textToType]);

  // Special Mechanics Timers
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'typing') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 100);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status !== 'typing') return;

    if (mode === 'infinite_recall' && timeElapsed > 2500) {
      setIsMemoryHidden(true); // Hide text after 2.5s
    }
    if (mode === 'devour_engine') {
      setOpacityFade(Math.max(0.1, 1 - (timeElapsed / 5000))); // Fade out over 5s
    }
    if (mode === 'chaos_sync' && timeElapsed % 300 === 0) {
      setChaosOffset({
        x: (Math.random() - 0.5) * 15,
        y: (Math.random() - 0.5) * 15
      });
    }
  }, [timeElapsed, mode, status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status === 'failed' || status === 'mastered') return;
    
    const val = e.target.value;
    if (status === 'idle' && val.length > 0) setStatus('typing');

    // Strict mistake blocking
    if (val.length > input.length) {
      const char = val[val.length - 1];
      const targetChar = textToType[val.length - 1];
      if (char !== targetChar) {
        setMistakes(m => m + 1);
        return; 
      }
    }
    setInput(val);
  };

  return (
    <div 
      onClick={() => inputRef.current?.focus()}
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 transition-all duration-300 min-h-[160px] flex flex-col justify-center",
        status === 'idle' && "border-white/[0.08] bg-[#0a0a0c]/80",
        status === 'typing' && "border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]",
        status === 'failed' && "border-red-500/50 bg-red-950/30 grayscale",
        status === 'mastered' && "border-amber-400/50 bg-amber-400/10 shadow-[0_0_30px_rgba(251,191,36,0.2)]"
      )}
    >
      {/* Visual Tracking UI */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
          {mode.replace('_', ' ')} <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
        </span>
        <div className="flex gap-4">
          <span className={cn("text-[11px] font-mono font-bold tracking-widest", accuracy < 97 ? "text-red-400" : "text-emerald-400")}>
            {accuracy.toFixed(1)}% ACC
          </span>
          <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-500">
            {mistakes} ERR
          </span>
        </div>
      </div>

      <input 
        ref={inputRef}
        type="text" 
        value={input}
        onChange={handleInputChange}
        className="absolute opacity-0 -z-10"
        autoComplete="off"
        spellCheck="false"
      />

      {/* Typing Text Display */}
      <motion.div 
        animate={mode === 'chaos_sync' ? { x: chaosOffset.x, y: chaosOffset.y } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        style={{ opacity: mode === 'devour_engine' ? opacityFade : 1 }}
        className="font-mono text-[15px] sm:text-[17px] leading-relaxed tracking-wide flex flex-wrap break-all relative z-10 mt-6"
      >
        {textToType.split('').map((char, i) => {
          let state = 'pending';
          if (i < input.length) state = input[i] === char ? 'correct' : 'incorrect';
          
          const isHidden = isMemoryHidden && state === 'pending' && i !== input.length;

          return (
            <span 
              key={i}
              className={cn(
                "transition-all duration-150",
                state === 'pending' && (isHidden ? "opacity-0" : "text-zinc-600"),
                state === 'correct' && (status === 'mastered' ? "text-amber-300 drop-shadow-md" : "text-zinc-200"),
                state === 'incorrect' && "text-red-500 bg-red-500/20 rounded-sm",
                i === input.length && status !== 'failed' && status !== 'mastered' && "border-l-2 border-indigo-400 animate-pulse bg-indigo-500/20"
              )}
            >
              {mode === 'keyboard_instinct' && state === 'pending' && i !== input.length ? '*' : char}
            </span>
          );
        })}
      </motion.div>

      {/* State Overlays */}
      <AnimatePresence>
        {status === 'failed' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
            <span className="text-red-400 font-bold tracking-widest mb-4">CHALLENGE FAILED</span>
            <span className="text-xs text-zinc-400 mb-6 font-mono">STRICT ENFORCEMENT: &lt; 97% ACC</span>
            <button 
              onClick={(e) => { e.stopPropagation(); resetChallenge(); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 text-zinc-300 text-xs font-bold tracking-widest rounded-full hover:bg-zinc-700 transition-colors shadow-lg"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> RETRY PROTOCOL
            </button>
          </motion.div>
        )}

        {status === 'mastered' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-amber-500/10 backdrop-blur-sm border border-amber-400/50"
          >
            <Trophy className="w-12 h-12 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] mb-3" />
            <span className="text-amber-300 font-black tracking-[0.3em] text-xl drop-shadow-lg">MASTERED</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
