'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trophy, RefreshCcw, CheckCircle2, Brain, Zap, Ghost, Activity, Aperture, Code, Waves, Crosshair, EyeOff, Flame, Timer, Heart, Shield } from 'lucide-react';
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
  isGlobalManaged?: boolean;
  isActive?: boolean;
  isCompleted?: boolean;
  forcedText?: string | null;
  onComplete?: (stats: { accuracy: number, mistakes: number, totalChars: number }) => void;
}

/* ══════════════════════════════════════════════════════════════════════════
 *  MODE THEME SYSTEM — Every mode has its own unique DNA
 * ══════════════════════════════════════════════════════════════════════════ */
const MODE_THEMES: Record<ChallengeMode, {
  label: string;
  subtitle: string;
  icon: React.ElementType;
  accentColor: string;
  borderColor: string;
  bgGlow: string;
  badgeClass: string;
  failMessage: string;
  cursorColor: string;
  typedGlow: string;
}> = {
  parallel_processing: {
    label: 'PARALLEL THREADS',
    subtitle: 'Multi-stream injection active',
    icon: Activity,
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/20',
    bgGlow: 'bg-cyan-500/5',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    failMessage: 'Thread synchronization lost.',
    cursorColor: 'text-cyan-400 bg-cyan-500/20',
    typedGlow: 'text-cyan-100 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]',
  },
  infinite_recall: {
    label: 'NEURAL MEMORY',
    subtitle: 'Synaptic recall protocol',
    icon: Brain,
    accentColor: 'text-violet-400',
    borderColor: 'border-violet-500/20',
    bgGlow: 'bg-violet-500/5',
    badgeClass: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    failMessage: 'Memory fragmentation detected.',
    cursorColor: 'text-violet-400 bg-violet-500/20',
    typedGlow: 'text-violet-100 drop-shadow-[0_0_6px_rgba(167,139,250,0.6)]',
  },
  phantom_reflex: {
    label: 'GHOST PROTOCOL',
    subtitle: 'Reaction cortex engaged',
    icon: Ghost,
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    bgGlow: 'bg-emerald-500/5',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    failMessage: 'Reflex threshold exceeded. Too slow.',
    cursorColor: 'text-emerald-400 bg-emerald-500/20',
    typedGlow: 'text-emerald-100 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]',
  },
  chaos_sync: {
    label: 'CHAOS MATRIX',
    subtitle: 'Dimensional instability active',
    icon: Flame,
    accentColor: 'text-orange-400',
    borderColor: 'border-orange-500/20',
    bgGlow: 'bg-orange-500/5',
    badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    failMessage: 'Lost sync with the chaos field.',
    cursorColor: 'text-orange-400 bg-orange-500/20',
    typedGlow: 'text-orange-100 drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]',
  },
  devour_engine: {
    label: 'VOID CONSUMER',
    subtitle: 'Entropy absorption required',
    icon: Zap,
    accentColor: 'text-red-400',
    borderColor: 'border-red-500/20',
    bgGlow: 'bg-red-500/5',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
    failMessage: 'The void consumed the signal.',
    cursorColor: 'text-red-400 bg-red-500/20',
    typedGlow: 'text-red-100 drop-shadow-[0_0_6px_rgba(248,113,113,0.6)]',
  },
  hyper_focus: {
    label: 'ZERO TOLERANCE',
    subtitle: 'Perfection enforcement active',
    icon: Aperture,
    accentColor: 'text-rose-400',
    borderColor: 'border-rose-500/20',
    bgGlow: 'bg-rose-500/5',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    failMessage: 'Perfection compromised. Zero tolerance breached.',
    cursorColor: 'text-rose-400 bg-rose-500/20',
    typedGlow: 'text-rose-100 drop-shadow-[0_0_6px_rgba(251,113,133,0.6)]',
  },
  code_assimilation: {
    label: 'SYNTAX CORE',
    subtitle: 'Compiler handshake initiated',
    icon: Code,
    accentColor: 'text-green-400',
    borderColor: 'border-green-500/20',
    bgGlow: 'bg-green-500/5',
    badgeClass: 'bg-green-500/15 text-green-400 border-green-500/30',
    failMessage: 'Syntax tree corrupted.',
    cursorColor: 'text-green-400 bg-green-500/20',
    typedGlow: 'text-green-100 drop-shadow-[0_0_6px_rgba(74,222,128,0.6)]',
  },
  flow_state: {
    label: 'RHYTHM ENGINE',
    subtitle: 'Continuous momentum required',
    icon: Waves,
    accentColor: 'text-sky-400',
    borderColor: 'border-sky-500/20',
    bgGlow: 'bg-sky-500/5',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    failMessage: 'Rhythm broken. Flow state collapsed.',
    cursorColor: 'text-sky-400 bg-sky-500/20',
    typedGlow: 'text-sky-100 drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]',
  },
  precision_dominion: {
    label: 'SURGICAL STRIKE',
    subtitle: 'Molecular precision demanded',
    icon: Crosshair,
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    bgGlow: 'bg-amber-500/5',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    failMessage: 'Precision threshold violated.',
    cursorColor: 'text-amber-400 bg-amber-500/20',
    typedGlow: 'text-amber-100 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]',
  },
  keyboard_instinct: {
    label: 'BLIND PROTOCOL',
    subtitle: 'Visual cortex disabled',
    icon: EyeOff,
    accentColor: 'text-pink-400',
    borderColor: 'border-pink-500/20',
    bgGlow: 'bg-pink-500/5',
    badgeClass: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    failMessage: 'Instinct override failed.',
    cursorColor: 'text-pink-400 bg-pink-500/20',
    typedGlow: 'text-pink-100 drop-shadow-[0_0_6px_rgba(244,114,182,0.6)]',
  },
};

/* ══════════════════════════════════════════════════════════════════════════
 *  MASSIVE TEXT POOLS — Real, diverse, challenging content
 * ══════════════════════════════════════════════════════════════════════════ */
const TEXT_POOLS: Record<ChallengeMode, string[]> = {
  parallel_processing: [],
  devour_engine: [
    'The server crashed at 3:47 AM and nobody noticed until morning.',
    'Quantum entanglement allows particles to share states instantly.',
    'Her password was "Tr0ub4dor&3" but she forgot it by Tuesday.',
    'The API rate limit is 1000 requests per minute per API key.',
    'Lightning strikes the Earth approximately 100 times per second.',
    'The package.json file contained 847 dependencies, most unused.',
    'Mars is approximately 225 million kilometers from Earth on average.',
    'The database migration failed silently, corrupting 12,000 records.',
  ],
  infinite_recall: [
    'Serial: X7-K9F2-DELTA-0043',
    'MAC: 3C:22:FB:19:A0:E7',
    'Coordinates: 41.40338, 2.17403',
    'Hash: a94a8fe5ccb19ba61c4c0873',
    'License: MIT-2026-FORGE-7X9',
    'UUID: 550e8400-e29b-41d4-a716',
    'Token: eyJhbGciOiJIUzI1NiJ9',
    'Endpoint: /api/v3/auth/refresh',
    'Config: NODE_ENV=production PORT=3000',
    'Key: sk-proj-4f8a2b1c9d7e6f0g',
  ],
  phantom_reflex: [
    'EXECUTE NOW',
    'Override alpha-7!',
    'console.log("fired");',
    'BREACH DETECTED',
    'rm -rf /tmp/cache/*',
    'Signal received: ACK',
    'STATUS: 200 OK',
    'git push --force',
    'DEPLOY TO PROD',
    'sudo systemctl restart',
  ],
  chaos_sync: [
    'The earthquake rattled every window but the code kept compiling.',
    'Stability is an illusion when the ground beneath you shifts.',
    'In the eye of the storm, the cursor blinks patiently, waiting.',
    'Turbulence ahead: maintain formation and do not deviate from course.',
    'The signal degraded to 12% but the transmission must continue.',
    'Every pixel on screen vibrated as the upload reached 99 percent.',
    'The world shakes but your fingers must remain perfectly still.',
    'Seismic activity detected in sector 7. Continue typing protocol.',
  ],
  hyper_focus: [
    'The difference between good and perfect is one single keystroke.',
    'Precision is not a skill, it is a state of absolute being.',
    'Every character you type is a commitment. There is no undo here.',
    'Breathe in. Focus. Each letter is a surgical operation.',
    'The margin for error is exactly zero. Welcome to the endgame.',
    'One wrong move and the entire sequence collapses into nothing.',
    'Your heartbeat should be steady. Your fingers, even steadier.',
    'This is not a test of speed. This is a test of absolute control.',
  ],
  code_assimilation: [
    'const debounce = <T extends (...args: any[]) => void>(fn: T, ms: number) => {};',
    'SELECT DISTINCT p.name, COUNT(*) OVER (PARTITION BY p.category_id) FROM products p;',
    'const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;',
    'app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));',
    'type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };',
    'docker run -d --name redis -p 6379:6379 -v redis_data:/data redis:alpine',
    'git log --oneline --graph --all --decorate | head -20',
    'interface Props extends React.HTMLAttributes<HTMLDivElement> { variant?: "ghost" | "solid"; }',
    'kubectl get pods -n production --sort-by=.metadata.creationTimestamp -o wide',
    'const [data, setData] = useState<Map<string, Set<number>>>(new Map());',
  ],
  flow_state: [
    'The river does not pause to consider its path it simply flows onward.',
    'A thousand keystrokes blend into one seamless motion of pure intent.',
    'Rhythm is the invisible thread that connects every letter to the next.',
    'When the mind is quiet the fingers dance across keys like rainfall.',
    'Speed without interruption is the hallmark of a true flow master.',
    'Let go of thinking and allow the muscle memory to take full control.',
    'The best typists do not type words they type feelings and thoughts.',
    'Momentum is everything stop for one heartbeat and the chain shatters.',
  ],
  precision_dominion: [
    '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`',
    'aA1! bB2@ cC3# dD4$ eE5% fF6^ gG7&',
    '{fn: (x: T) => [K in keyof T]?: T[K]}',
    'P@$$w0rd_V4l!d8: [A-Za-z0-9!@#]{12,}',
    '0xDEADBEEF 0xCAFEBABE 0x8BADF00D',
    '192.168.1.1:8080/api?key=x&val=y#ref',
    'Math.floor(((a ** 2) + (b ** 2)) ** 0.5)',
    'user@host:~/dir$ chmod 755 ./script.sh',
    'C:\\Users\\Admin\\AppData\\Local\\Temp\\*.log',
    '(a && b) || (!c ?? d) ? e?.f : g![0]',
  ],
  keyboard_instinct: [
    'The quick brown fox jumps over the lazy dog near the riverbank.',
    'Pack my box with five dozen liquor jugs said the bartender.',
    'How vexingly quick daft zebras jump over the sleeping wolf.',
    'Amazingly few discotheques provide jukeboxes that work properly.',
    'The five boxing wizards jump quickly through the morning fog.',
    'Sphinx of black quartz judge my vow under the pale moonlight.',
    'Crazy Frederick bought many very exquisite opal jewels today.',
    'We promptly judged antique ivory buckles for the next prize.',
  ],
};

/* ══════════════════════════════════════════════════════════════════════════
 *  CHALLENGE ENGINE — The Beast
 * ══════════════════════════════════════════════════════════════════════════ */
export default function ChallengeEngine({ mode, isGlobalManaged, isActive = true, isCompleted = false, forcedText, onComplete }: ChallengeEngineProps) {
  const [status, setStatus] = useState<'idle' | 'typing' | 'failed' | 'mastered' | 'finished'>('idle');
  const [textToType, setTextToType] = useState('');
  const [input, setInput] = useState('');
  const [mistakes, setMistakes] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const theme = MODE_THEMES[mode];
  const ThemeIcon = theme.icon;

  // Mechanic States
  const [isMemoryHidden, setIsMemoryHidden] = useState(false);
  const [memoryCountdown, setMemoryCountdown] = useState(3);
  const [opacityFade, setOpacityFade] = useState(1);
  const [chaosOffset, setChaosOffset] = useState({ x: 0, y: 0, rotate: 0, scale: 1 });
  const [chaosHue, setChaosHue] = useState(0);
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number>(0);
  const [flowCombo, setFlowCombo] = useState(0);
  const [flowMaxCombo, setFlowMaxCombo] = useState(0);
  const [phantomReady, setPhantomReady] = useState(false);
  const [phantomFlash, setPhantomFlash] = useState(false);
  const [heartbeatPulse, setHeartbeatPulse] = useState(false);
  const [wpmLive, setWpmLive] = useState(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isGlobalManaged) {
      if (isActive && forcedText) {
        setTextToType(forcedText);
        resetInternalState();
        setTimeout(() => inputRef.current?.focus(), 10);
      } else if (isActive && !forcedText) {
        resetChallenge();
      } else if (!isActive && !isCompleted) {
        setTextToType('');
        resetInternalState();
      }
    } else {
      resetChallenge();
    }
  }, [mode, isActive, forcedText, isGlobalManaged, isCompleted]);

  const resetInternalState = () => {
    setInput('');
    setMistakes(0);
    setStatus('idle');
    setTimeElapsed(0);
    setIsMemoryHidden(false);
    setMemoryCountdown(3);
    setOpacityFade(1);
    setChaosOffset({ x: 0, y: 0, rotate: 0, scale: 1 });
    setChaosHue(0);
    setPhantomReady(false);
    setPhantomFlash(false);
    setFlowCombo(0);
    setFlowMaxCombo(0);
    setHeartbeatPulse(false);
    setWpmLive(0);
    startTimeRef.current = 0;
  };

  const resetChallenge = () => {
    const pool = TEXT_POOLS[mode] || TEXT_POOLS.flow_state;
    const newText = pool[Math.floor(Math.random() * pool.length)] || '';
    setTextToType(newText);
    resetInternalState();
    if (isActive) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const accuracy = useMemo(() => {
    if (input.length === 0) return 100;
    return Math.max(0, 100 - (mistakes / Math.max(1, input.length)) * 100);
  }, [input, mistakes]);

  // WPM calculation
  useEffect(() => {
    if (status === 'typing' && startTimeRef.current > 0) {
      const elapsed = (Date.now() - startTimeRef.current) / 60000; // minutes
      if (elapsed > 0) {
        setWpmLive(Math.round((input.length / 5) / elapsed));
      }
    }
  }, [input, status]);

  // Completion and fail logic
  useEffect(() => {
    if (status === 'typing') {
      if (!isGlobalManaged && input.length > 5 && accuracy < 97) {
        setStatus('failed');
      }
      if (mode === 'hyper_focus' && mistakes > 0) {
        setHeartbeatPulse(true);
        setTimeout(() => setStatus('failed'), 300);
        return;
      }

      if (input.length === textToType.length && textToType.length > 0) {
        if (isGlobalManaged) {
          setStatus('finished');
          onComplete?.({ accuracy, mistakes, totalChars: textToType.length });
        } else {
          if (accuracy >= 97) setStatus('mastered');
          else setStatus('failed');
        }
      }
    }
  }, [input, accuracy, status, textToType, isGlobalManaged, mode, mistakes]); 

  // Visual mechanics engine (the beating heart)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Phantom reflex: delayed trigger
    if (mode === 'phantom_reflex' && status === 'idle' && isActive && !isCompleted && textToType) {
      const delay = Math.random() * 2500 + 1500; // 1.5-4s random delay
      const timeout = setTimeout(() => {
        setPhantomFlash(true);
        setTimeout(() => setPhantomFlash(false), 150);
        setPhantomReady(true);
        setLastKeystrokeTime(Date.now());
      }, delay);
      return () => clearTimeout(timeout);
    }

    if (status === 'typing' || (mode === 'phantom_reflex' && phantomReady && status === 'idle')) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const t = prev + 100;

          // Infinite Recall: countdown then hide
          if (mode === 'infinite_recall') {
            if (t <= 3000) {
              setMemoryCountdown(Math.ceil((3000 - t) / 1000));
            }
            if (t > 3000 && !isMemoryHidden) {
              setIsMemoryHidden(true);
              setMemoryCountdown(0);
            }
          }

          // Devour Engine: draining opacity
          if (mode === 'devour_engine') {
            setOpacityFade(prev => {
              const newVal = Math.max(0, prev - 0.015);
              if (newVal <= 0.01) setStatus('failed');
              return newVal;
            });
          }

          // Chaos Sync: insane screen distortion
          if (mode === 'chaos_sync') {
            const intensity = Math.min(1, t / 8000); // Ramps up over 8 seconds
            setChaosOffset({
              x: (Math.random() - 0.5) * 30 * intensity,
              y: (Math.random() - 0.5) * 25 * intensity,
              rotate: (Math.random() - 0.5) * 8 * intensity,
              scale: 1 + (Math.random() - 0.5) * 0.06 * intensity,
            });
            setChaosHue(prev => (prev + 15) % 360);
          }

          // Hyper Focus: heartbeat pulse
          if (mode === 'hyper_focus' && t % 1000 === 0) {
            setHeartbeatPulse(true);
            setTimeout(() => setHeartbeatPulse(false), 200);
          }

          // Flow State: check pause
          if (mode === 'flow_state' && status === 'typing') {
            if (Date.now() - lastKeystrokeTime > 1500) {
              setStatus('failed');
            }
          }

          // Phantom Reflex: reaction window 
          if (mode === 'phantom_reflex' && phantomReady && status === 'idle') {
            if (Date.now() - lastKeystrokeTime > 1200) {
              setStatus('failed');
            }
          }

          return t;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [status, mode, phantomReady, isActive, isCompleted, textToType, isMemoryHidden, lastKeystrokeTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status === 'failed' || status === 'mastered' || status === 'finished') return;
    if (mode === 'phantom_reflex' && !phantomReady) return;
    
    const val = e.target.value;
    if (status === 'idle' && val.length > 0) {
      setStatus('typing');
      setLastKeystrokeTime(Date.now());
      startTimeRef.current = Date.now();
    }

    if (mode === 'devour_engine') {
      setOpacityFade(prev => Math.min(1, prev + 0.12));
    }
    
    setLastKeystrokeTime(Date.now());

    if (val.length > input.length) {
      const char = val[val.length - 1];
      const targetChar = textToType[val.length - 1];
      if (char !== targetChar) {
        setMistakes(m => m + 1);
        if (mode === 'flow_state') {
          setFlowCombo(0); // Reset combo on mistake
        }
        return; 
      }
      // Correct character
      if (mode === 'flow_state') {
        setFlowCombo(prev => {
          const next = prev + 1;
          setFlowMaxCombo(max => Math.max(max, next));
          return next;
        });
      }
    }
    setInput(val);
  };

  const progress = textToType.length > 0 ? (input.length / textToType.length) * 100 : 0;

  /* ════════════════════════════════════════════════════════════
   *  RENDER: Completed State
   * ════════════════════════════════════════════════════════════ */
  if (isCompleted) {
    return (
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn("relative overflow-hidden rounded-2xl border transition-all duration-500 min-h-[200px] flex flex-col items-center justify-center", theme.borderColor, theme.bgGlow)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mb-3 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        </motion.div>
        <span className="text-emerald-400 font-mono text-xs tracking-[0.3em] uppercase font-black">Protocol Complete</span>
        <span className="text-zinc-600 font-mono text-[9px] tracking-widest mt-1">Thread terminated successfully</span>
      </motion.div>
    );
  }

  /* ════════════════════════════════════════════════════════════
   *  RENDER: Waiting State (Inactive)
   * ════════════════════════════════════════════════════════════ */
  if (isGlobalManaged && !isActive) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.03] bg-[#060608]/60 transition-all duration-300 min-h-[200px] flex flex-col items-center justify-center pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01),transparent_70%)]" />
        <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
          <ThemeIcon className={cn("w-8 h-8 mb-3", theme.accentColor, "opacity-20")} />
        </motion.div>
        <span className="text-zinc-700 font-mono text-[10px] tracking-[0.3em] uppercase">Awaiting Activation...</span>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
   *  RENDER: Text Characters
   * ════════════════════════════════════════════════════════════ */
  const renderText = () => {
    if (mode === 'phantom_reflex' && !phantomReady) {
      return (
        <div className="flex flex-col items-center gap-3">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <Ghost className="w-10 h-10 text-emerald-500/40" />
          </motion.div>
          <span className="text-emerald-500/30 font-mono tracking-[0.4em] text-xs uppercase animate-pulse">
            Awaiting signal...
          </span>
        </div>
      );
    }

    return textToType.split('').map((char, i) => {
      let colorClass = 'text-zinc-600';
      
      if (i < input.length) {
        colorClass = theme.typedGlow;
        // Keyboard instinct: show asterisks for typed chars
        if (mode === 'keyboard_instinct') {
          return (
            <span key={i} className={cn("transition-colors duration-75 inline-block", theme.typedGlow)}>
              <span className="opacity-60">*</span>
            </span>
          );
        }
      } else if (i === input.length) {
        colorClass = cn(theme.cursorColor, 'animate-pulse rounded-sm px-[1px]');
      } else if (isMemoryHidden) {
        return (
          <span key={i} className="inline-block w-[0.6em] h-[1.2em] bg-zinc-800/60 rounded-[2px] mx-[1px] align-middle" />
        );
      }

      return (
        <span key={i} className={cn("transition-colors duration-75 inline-block", colorClass)}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    });
  };

  /* ════════════════════════════════════════════════════════════
   *  RENDER: Mode-specific HUD indicators
   * ════════════════════════════════════════════════════════════ */
  const renderModeHUD = () => {
    switch (mode) {
      case 'infinite_recall':
        return (
          <div className="flex items-center gap-2">
            {!isMemoryHidden ? (
              <motion.span 
                key={memoryCountdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-violet-500/20 text-violet-400 border border-violet-500/30 px-2.5 py-0.5 rounded text-[10px] font-black tracking-widest"
              >
                MEMORIZE: {memoryCountdown}s
              </motion.span>
            ) : (
              <span className="bg-violet-500/30 text-violet-300 border border-violet-400/40 px-2.5 py-0.5 rounded text-[10px] font-black tracking-widest animate-pulse">
                RECALL PHASE
              </span>
            )}
          </div>
        );
      case 'hyper_focus':
        return (
          <motion.span 
            animate={heartbeatPulse ? { scale: [1, 1.2, 1], opacity: [1, 0.5, 1] } : {}}
            className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded text-[10px] font-black tracking-widest flex items-center gap-1.5"
          >
            <Heart className="w-3 h-3" /> ZERO TOLERANCE
          </motion.span>
        );
      case 'flow_state':
        return (
          <div className="flex items-center gap-2">
            <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 rounded text-[10px] font-black tracking-widest flex items-center gap-1.5">
              <Flame className="w-3 h-3" /> COMBO: {flowCombo}
            </span>
            {flowCombo >= 10 && (
              <motion.span 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[9px] font-black tracking-widest"
              >
                ON FIRE
              </motion.span>
            )}
          </div>
        );
      case 'devour_engine':
        return (
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2.5 py-0.5 rounded text-[10px] font-black tracking-widest border",
              opacityFade > 0.5 ? "bg-green-500/20 text-green-400 border-green-500/30" :
              opacityFade > 0.25 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse" :
              "bg-red-500/30 text-red-400 border-red-500/40 animate-pulse"
            )}>
              SIGNAL: {Math.round(opacityFade * 100)}%
            </span>
          </div>
        );
      case 'phantom_reflex':
        return phantomReady ? (
          <motion.span 
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded text-[10px] font-black tracking-widest animate-pulse"
          >
            TYPE NOW!
          </motion.span>
        ) : null;
      case 'chaos_sync':
        return (
          <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded text-[10px] font-black tracking-widest">
            INSTABILITY: {Math.min(100, Math.round((timeElapsed / 8000) * 100))}%
          </span>
        );
      case 'keyboard_instinct':
        return (
          <span className="bg-pink-500/20 text-pink-400 border border-pink-500/30 px-2.5 py-0.5 rounded text-[10px] font-black tracking-widest flex items-center gap-1.5">
            <EyeOff className="w-3 h-3" /> BLIND MODE
          </span>
        );
      case 'code_assimilation':
        return (
          <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2.5 py-0.5 rounded text-[10px] font-black tracking-widest flex items-center gap-1.5">
            <Code className="w-3 h-3" /> SYNTAX LOCK
          </span>
        );
      default:
        return null;
    }
  };

  /* ════════════════════════════════════════════════════════════
   *  MAIN RENDER
   * ════════════════════════════════════════════════════════════ */
  return (
    <div 
      onClick={() => inputRef.current?.focus()}
      style={{
        opacity: mode === 'devour_engine' ? opacityFade : 1,
        transform: mode === 'chaos_sync' 
          ? `translate(${chaosOffset.x}px, ${chaosOffset.y}px) rotate(${chaosOffset.rotate}deg) scale(${chaosOffset.scale})`
          : undefined,
        filter: mode === 'chaos_sync' && status === 'typing' ? `hue-rotate(${chaosHue}deg)` : undefined,
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 transition-all duration-100 min-h-[200px] flex flex-col justify-between shadow-lg group cursor-text",
        (status === 'idle' || status === 'typing') && cn("bg-[#080810]/90", theme.borderColor),
        status === 'failed' && "border-red-500/50 bg-red-950/30 shadow-[0_0_60px_rgba(248,113,113,0.15)]",
        status === 'mastered' && "border-amber-400/50 bg-amber-400/10 shadow-[0_0_40px_rgba(251,191,36,0.2)]",
        heartbeatPulse && mode === 'hyper_focus' && status === 'typing' && "shadow-[0_0_40px_rgba(251,113,133,0.3)]",
      )}
    >
      {/* Background glow effect per mode */}
      {status === 'typing' && (
        <div className={cn(
          "absolute -inset-1 rounded-2xl opacity-30 blur-xl pointer-events-none transition-opacity duration-500",
          mode === 'chaos_sync' && "bg-gradient-to-r from-orange-500/20 via-red-500/20 to-yellow-500/20",
          mode === 'hyper_focus' && "bg-gradient-to-r from-rose-500/10 to-transparent",
          mode === 'infinite_recall' && "bg-gradient-to-r from-violet-500/10 to-transparent",
          mode === 'flow_state' && flowCombo >= 10 && "bg-gradient-to-r from-sky-500/20 via-cyan-500/20 to-sky-500/20",
        )} />
      )}

      {/* Phantom reflex flash effect */}
      <AnimatePresence>
        {phantomFlash && (
          <motion.div 
            initial={{ opacity: 1 }} 
            animate={{ opacity: 0 }} 
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-50 bg-emerald-400/30 rounded-2xl pointer-events-none" 
          />
        )}
      </AnimatePresence>

      {/* ═══ TOP BAR: Mode badge + Stats ═══ */}
      <div className="flex items-start justify-between w-full mb-4 pointer-events-none z-20">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <ThemeIcon className={cn("w-3.5 h-3.5", theme.accentColor)} />
            <span className={cn("text-[9px] font-black uppercase tracking-[0.25em]", theme.accentColor)}>
              {theme.label}
            </span>
          </div>
          <span className="text-[8px] text-zinc-600 font-mono tracking-widest uppercase">
            {theme.subtitle}
          </span>
        </div>

        <div className="flex items-center gap-3 bg-black/70 px-3 py-1.5 rounded-full border border-white/[0.06] backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-medium text-zinc-600 uppercase tracking-widest">WPM</span>
            <span className={cn("text-[11px] font-mono font-bold tabular-nums", theme.accentColor)}>
              {wpmLive}
            </span>
          </div>
          <div className="w-[1px] h-3 bg-white/10" />
          <motion.div 
            key={`acc-${Math.round(accuracy)}`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1, color: accuracy < 97 ? '#f87171' : '#34d399' }}
            className="flex items-center gap-1.5"
          >
            <span className="text-[8px] font-medium text-zinc-600 uppercase tracking-widest">ACC</span>
            <span className="text-[11px] font-mono font-bold tabular-nums">
              {accuracy.toFixed(1)}%
            </span>
          </motion.div>
          <div className="w-[1px] h-3 bg-white/10" />
          <motion.div 
            key={`err-${mistakes}`}
            initial={mistakes > 0 ? { scale: 1.4, color: '#f87171' } : false}
            animate={{ scale: 1, color: mistakes > 0 ? '#f87171' : '#3f3f46' }}
            className="flex items-center gap-1.5"
          >
            <span className="text-[8px] font-medium text-zinc-600 uppercase tracking-widest">ERR</span>
            <span className="text-[11px] font-mono font-bold tabular-nums">{mistakes}</span>
          </motion.div>
        </div>
      </div>

      {/* ═══ MODE HUD: Mode-specific indicators ═══ */}
      <div className="flex items-center gap-2 mb-3 min-h-[22px]">
        {renderModeHUD()}
      </div>

      {/* ═══ HIDDEN INPUT ═══ */}
      <input 
        ref={inputRef}
        type="text" 
        value={input}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="fixed -top-[2000px] left-0 opacity-0 pointer-events-none w-px h-px"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-gramm="false"
      />

      {/* ═══ TEXT DISPLAY ═══ */}
      <div className="relative z-10 w-full flex-1 flex items-center">
        <div className={cn(
            "font-mono text-lg md:text-xl leading-relaxed whitespace-pre-wrap select-none break-words w-full",
            !isFocused && status !== 'failed' && status !== 'mastered' && status !== 'finished' && "opacity-20 blur-[3px] transition-all duration-300"
          )}
        >
          {renderText()}
        </div>
      </div>

      {/* ═══ PROGRESS BAR ═══ */}
      {status === 'typing' && (
        <div className="w-full mt-4">
          <div className="w-full h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div 
              className={cn("h-full rounded-full", 
                mode === 'hyper_focus' ? "bg-gradient-to-r from-rose-500 to-rose-400" :
                mode === 'chaos_sync' ? "bg-gradient-to-r from-orange-500 to-yellow-500" :
                mode === 'flow_state' ? "bg-gradient-to-r from-sky-500 to-cyan-400" :
                "bg-gradient-to-r from-indigo-500 to-cyan-400"
              )}
              style={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[8px] text-zinc-700 font-mono tracking-widest">{input.length}/{textToType.length}</span>
            <span className="text-[8px] text-zinc-700 font-mono tracking-widest">{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      {/* ═══ CLICK TO INITIALIZE OVERLAY ═══ */}
      <AnimatePresence>
        {!isFocused && status === 'idle' && !(mode === 'phantom_reflex' && !phantomReady) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-[3px] rounded-2xl cursor-pointer"
          >
            <div className={cn(
              "px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 font-mono font-bold tracking-widest text-xs hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2",
            )}>
              <ThemeIcon className="w-4 h-4" />
              CLICK TO INITIALIZE
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ FAILED OVERLAY ═══ */}
      <AnimatePresence>
        {status === 'failed' && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a0005]/95 backdrop-blur-sm rounded-2xl border border-red-500/10"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
              <AlertTriangle className="w-14 h-14 text-red-500 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            </motion.div>
            <span className="text-red-500 font-black tracking-[0.3em] text-2xl mb-2">PROTOCOL FAILED</span>
            <span className="text-red-400/50 font-mono text-[10px] uppercase tracking-[0.2em] mb-6 max-w-[80%] text-center">
              {theme.failMessage}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); resetChallenge(); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full font-bold tracking-widest text-xs transition-all border border-red-500/20 hover:border-red-500/30"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> REINITIALIZE
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
