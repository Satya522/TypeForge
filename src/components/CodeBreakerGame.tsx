"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldAlert, Cpu, Unlock, Target, Skull, Zap, Hash } from 'lucide-react';
import { useMechanicalSound } from '@/hooks/useMechanicalSound';

const HACK_PHRASES = [
  "sudo chmod -R 777 /sys/core/",
  "const exploit = new ZeroDay();",
  "[0x1A4] buffer_overflow(0xFF);",
  "ssh root@192.168.0.254 -p 22",
  "decrypt_hash(sha256_target);",
  "SELECT * FROM users WHERE admin=1--",
  "require('crypto').randomBytes(32);",
  "kernel.patch_memory(0x00000000);",
  "bypass_firewall(PORT_8080, FORCE);",
  "fetch('https://dark.net/payload');",
  "export SYSTEM_ACCESS=GRANTED;",
  "void inject() { asm(\"nop\"); }",
  "while(true) { spawn_botnet(); }",
  "if (trace == true) { self_destruct(); }",
  "netstat -tulpn | grep LISTEN",
  "ping -c 1 127.0.0.1",
  "mkdir /tmp/.hidden && cd /tmp/.hidden",
  "cat /etc/passwd | grep root",
  "nmap -sS -p- 192.168.1.1",
  "chown -R $USER:$USER /var/www",
  "docker exec -it root_container bash",
  "iptables -A INPUT -p tcp --dport 22 -j DROP",
  "tar -czvf payload.tar.gz ./scripts",
  "git commit -m 'added backdoor'",
  "chmod +x reverse_shell.sh",
  "curl -X POST -d 'auth=0' /api/login",
  "import sys, os, socket",
  "let admin = Boolean(1);"
];

const HEX_CHARS = "0123456789ABCDEF";
const generateMatrixText = () => {
  let str = "";
  for(let i=0; i<800; i++) str += HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)] + " ";
  return str;
};

// Extracted to prevent re-rendering the whole game every second
const MatrixBackground = memo(({ isActive }: { isActive: boolean }) => {
  const [matrixText, setMatrixText] = useState("");

  useEffect(() => {
    if (!isActive) return;
    setMatrixText(generateMatrixText());
    
    const itv = setInterval(() => {
      setMatrixText(generateMatrixText());
    }, 1500); 
    
    return () => clearInterval(itv);
  }, [isActive]);

  return (
    <div className="absolute inset-0 opacity-[0.03] whitespace-pre-wrap break-all leading-none text-xs pointer-events-none z-0 mix-blend-screen scale-105 overflow-hidden font-mono text-green-500">
      {matrixText}
    </div>
  );
});
MatrixBackground.displayName = 'MatrixBackground';


export default function CodeBreakerGame() {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover' | 'victory'>('intro');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  
  // Game Variables
  const [targetPhrase, setTargetPhrase] = useState("");
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [traceProgress, setTraceProgress] = useState(0); 
  const [hackProgress, setHackProgress] = useState(0); 
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [glitchFactor, setGlitchFactor] = useState(0);

  const traceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const playKeystroke = useMechanicalSound(true);

  const initLevel = useCallback(() => {
    setTargetPhrase(prev => {
      let phrase = prev;
      while (phrase === prev) {
        phrase = HACK_PHRASES[Math.floor(Math.random() * HACK_PHRASES.length)];
      }
      return phrase;
    });
    setTypedChars([]);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setLevel(1);
    setScore(0);
    setTraceProgress(0);
    setHackProgress(0);
    setStreak(0);
    setMultiplier(1);
    setGlitchFactor(0);
    initLevel();
  };

  // Trace Meter & Glitch Decay Logic (Stable interval)
  useEffect(() => {
    if (gameState === 'playing') {
      traceIntervalRef.current = setInterval(() => {
        // Trace Progress increase
        setTraceProgress(prev => {
          const speed = 0.5 + (level * 0.15); // Stable increment 
          if (prev + speed >= 100) {
            setGameState('gameover');
            return 100;
          }
          return prev + speed;
        });

        // Decay the glitch effect so it doesn't stay on forever
        setGlitchFactor(prev => {
          if (prev > 0) return Math.max(0, prev - 0.5);
          return 0;
        });
        
      }, 100);
    }
    return () => {
      if (traceIntervalRef.current) clearInterval(traceIntervalRef.current);
    };
  }, [gameState, level]);

  // Keydown Logic
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;

      const currentTargetChar = targetPhrase[typedChars.length];
      
      if (e.key === currentTargetChar) {
        // Correct Char
        setTypedChars(prev => [...prev, e.key]);
        setStreak(prev => prev + 1);
        setScore(prev => prev + (10 * multiplier));
        playKeystroke('normal');
        
        // Update multiplier
        if (streak > 0 && streak % 10 === 0) {
          setMultiplier(prev => Math.min(prev + 1, 5));
        }

        // Check if phrase is complete
        if (typedChars.length + 1 === targetPhrase.length) {
          // Word complete!
          setHackProgress(prev => {
            const added = 20 + Math.max(0, 10 - level); 
            if (prev + added >= 100) {
              // Level breached
              playKeystroke('space'); // Deeper thock for success
              setLevel(l => l + 1);
              setTraceProgress(0);
              setGlitchFactor(0);
              if (level === 10) { // Win at level 10
                setGameState('victory');
                return 100;
              }
              initLevel();
              return 0; 
            }
            initLevel();
            return prev + added;
          });
          // Push trace back slightly as a reward
          setTraceProgress(prev => Math.max(0, prev - 15));
        }
      } else {
        // Incorrect Char
        playKeystroke('error');
        setStreak(0);
        setMultiplier(1);
        setTraceProgress(prev => Math.min(100, prev + 5)); 
        setGlitchFactor(5); // Instantly set glitch, decays in interval
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, targetPhrase, typedChars, streak, multiplier, level, initLevel, playKeystroke]);

  // Stable dynamic style instead of jarring math.random in render
  const containerStyle = {
    filter: glitchFactor > 0 ? `brightness(1.2) hue-rotate(-20deg) contrast(1.5)` : 'none',
    transition: 'filter 0.1s ease'
  };

  return (
    <div 
      className="relative w-full h-full bg-[#050505] overflow-hidden text-green-500 font-mono select-none"
      style={containerStyle}
    >
      <MatrixBackground isActive={gameState === 'intro' || gameState === 'playing'} />

      <AnimatePresence mode="wait">
        {gameState === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 bg-black/80 backdrop-blur-sm"
          >
            <Terminal className="w-24 h-24 text-purple-500 mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400 mb-4 tracking-tighter uppercase relative">
              Code Breaker
              <span className="absolute -inset-1 blur-sm bg-gradient-to-r from-purple-400 to-green-400 opacity-30 z-[-1]" />
            </h1>
            <p className="text-gray-400 max-w-lg text-center mb-10 text-lg leading-relaxed">
              Infiltrate the mainframe. Type the active exploits with <strong className="text-white">absolute precision</strong> to bypass the ICE protocols. Mistakes will accelerate the system trace.
            </p>

            <button 
              onClick={startGame}
              className="px-8 py-4 bg-purple-600/20 border border-purple-500/50 text-purple-300 font-bold tracking-widest uppercase hover:bg-purple-500 hover:text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all flex items-center gap-3 group"
            >
              <Cpu className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Init Breach Protocol
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 flex flex-col pt-12 px-8 pb-32"
          >
            {/* Top HUD */}
            <div className="flex justify-between items-start mb-auto">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-purple-400 bg-purple-900/20 px-4 py-2 rounded border border-purple-500/30">
                  <ShieldAlert className="w-5 h-5" />
                  <span className="font-bold tracking-wider">Node: {level} / 10</span>
                </div>
                <div className="flex items-center gap-3 text-green-400 bg-green-900/20 px-4 py-2 rounded border border-green-500/30">
                  <Hash className="w-5 h-5" />
                  <span className="font-bold tracking-wider">Score: {score}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 text-right">
                <div className={`text-2xl font-black ${multiplier > 1 ? 'text-amber-400' : 'text-gray-500'} transition-colors`}>
                  {multiplier}x MULTIPLIER
                </div>
                <div className="text-gray-400">
                  Streak: <span className="text-white font-bold">{streak}</span>
                </div>
              </div>
            </div>

            {/* Central Hacking Interface */}
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center flex-1">
              <div className="w-full text-center mb-8 uppercase text-sm tracking-[0.5em] text-purple-400 opacity-60">
                Active Exploit Injection Target
              </div>
              
              <div className="relative text-5xl md:text-6xl font-bold tracking-tight bg-black/50 p-8 rounded-xl border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                {targetPhrase.split('').map((char, index) => {
                  const isTyped = index < typedChars.length;
                  const isCurrent = index === typedChars.length;
                  
                  return (
                    <span 
                      key={index}
                      className={`
                        relative inline-block transition-colors duration-75
                        ${isTyped ? 'text-green-500' : 'text-gray-600'}
                        ${isCurrent ? 'animate-pulse text-white' : ''}
                      `}
                    >
                      {char === ' ' ? '\u00A0' : char}
                      {/* Cursor Blinker */}
                      {isCurrent && (
                        <motion.span 
                          layoutId="cursor"
                          className="absolute left-0 bottom-0 top-0 w-[2px] bg-white pointer-events-none shadow-[0_0_10px_white]" 
                        />
                      )}
                    </span>
                  );
                })}
              </div>

              {/* Hack Progress Mini-Bar */}
              <div className="w-full max-w-2xl mt-12 bg-gray-900 h-2 rounded overflow-hidden flex shadow-inner border border-gray-800">
                <div 
                  className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-300"
                  style={{ width: `${hackProgress}%` }}
                />
              </div>
              <div className="text-blue-400 text-xs mt-2 font-bold tracking-widest uppercase">
                Node Breach Progress: {Math.floor(hackProgress)}%
              </div>
            </div>

            {/* Trace Meter Attack Bottom */}
            <div className="absolute bottom-0 left-0 w-full p-8 pt-0 outline-none">
              <div className="flex justify-between items-end mb-2 uppercase text-xs font-bold tracking-widest text-red-500">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" /> System Trace Initiated
                </div>
                <div>{Math.floor(traceProgress)}% WARNING</div>
              </div>
              <div className="w-full bg-red-950/40 h-8 rounded border border-red-900/50 overflow-hidden relative">
                {/* Meter Fill */}
                <div 
                  className={`h-full bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.8)] transition-all duration-100 ease-linear relative ${traceProgress > 80 ? 'animate-[pulse_0.5s_infinite]' : ''}`}
                  style={{ width: `${traceProgress}%` }}
                >
                  {/* Warning Stripes */}
                  <div className="absolute inset-0 opacity-20" 
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}
                  />
                </div>
              </div>
            </div>
            
            {/* Screen Glitch Overlay when making mistakes */}
            {glitchFactor > 0 && (
              <div className="absolute inset-0 bg-red-500 mix-blend-overlay pointer-events-none opacity-10" />
            )}
          </motion.div>
        )}

        {gameState === 'gameover' && (
          <motion.div 
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 text-red-500"
          >
            <Skull className="w-32 h-32 mb-8 drop-shadow-[0_0_40px_rgba(220,38,38,0.8)]" />
            <h2 className="text-7xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-800">
              System Lockout
            </h2>
            <div className="text-xl mb-12 text-red-300/80 uppercase tracking-widest">
              Trace Complete. Your origin has been logged.
            </div>
            <div className="grid grid-cols-2 gap-8 text-center text-gray-400 mb-12 bg-red-950/20 p-8 rounded-xl border border-red-900/50">
              <div>
                <div className="text-sm uppercase tracking-widest mb-1 text-red-400">Final Score</div>
                <div className="text-3xl font-bold text-white">{score}</div>
              </div>
              <div>
                <div className="text-sm uppercase tracking-widest mb-1 text-red-400">Node Reach</div>
                <div className="text-3xl font-bold text-white">{level}</div>
              </div>
            </div>
            <button 
              onClick={startGame}
              className="px-8 py-4 bg-red-600/20 border border-red-500/50 text-red-300 font-bold tracking-widest uppercase hover:bg-red-600 hover:text-white hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] transition-all flex items-center gap-3"
            >
              <Zap className="w-5 h-5" />
              Reboot Sequence
            </button>
          </motion.div>
        )}

        {gameState === 'victory' && (
          <motion.div 
            key="victory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#051505]/95 text-[#39FF14]"
          >
            <Unlock className="w-32 h-32 mb-8 drop-shadow-[0_0_40px_rgba(57,255,20,0.8)]" />
            <h2 className="text-7xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#39FF14] to-emerald-800">
              Root Access Granted
            </h2>
            <div className="text-xl mb-12 text-emerald-300/80 uppercase tracking-widest">
              Mainframe successfully compromised.
            </div>
            <div className="grid grid-cols-2 gap-8 text-center text-gray-400 mb-12 bg-emerald-950/20 p-8 rounded-xl border border-[#39FF14]/30">
              <div>
                <div className="text-sm uppercase tracking-widest mb-1 text-[#39FF14]">Total Score</div>
                <div className="text-3xl font-bold text-white">{score}</div>
              </div>
              <div>
                <div className="text-sm uppercase tracking-widest mb-1 text-[#39FF14]">Clearance</div>
                <div className="text-3xl font-bold text-white">Tier 10</div>
              </div>
            </div>
            <button 
              onClick={() => setGameState('intro')}
              className="px-8 py-4 bg-[#39FF14]/20 border border-[#39FF14]/50 text-[#39FF14] font-bold tracking-widest uppercase hover:bg-[#39FF14] hover:text-black hover:shadow-[0_0_30px_rgba(57,255,20,0.8)] transition-all flex items-center gap-3"
            >
              <Terminal className="w-5 h-5" />
              Return to Hub
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
