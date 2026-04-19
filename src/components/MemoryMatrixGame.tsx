"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Play, ShieldAlert, Zap, Skull, Shield, TriangleAlert, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMechanicalSound } from "@/hooks/useMechanicalSound";

// Random strings for memory. Mix of words or hex depending on level.
const generateSequence = (level: number): string => {
  const chars = 'ABCDEF1234567890';
  const length = Math.min(4 + Math.floor(level / 2), 12);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const getFlashDuration = (level: number) => {
  // Base 2000ms. add 200ms per extra character, but cap it.
  const length = Math.min(4 + Math.floor(level / 2), 12);
  return 1500 + (length * 150);
};

export default function MemoryMatrixGame() {
  const [gameState, setGameState] = useState<"idle" | "countdown" | "memorize" | "recall" | "gameover">("idle");
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  
  const [targetSequence, setTargetSequence] = useState("");
  const [typedSequence, setTypedSequence] = useState("");
  const [flashTimeLeft, setFlashTimeLeft] = useState(0);
  const [initialFlashTime, setInitialFlashTime] = useState(0);
  
  const [isShaking, setIsShaking] = useState(false);
  const playSound = useMechanicalSound(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Background Neural Network Matrix Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef({ width: 800, height: 600, nodes: [] as any[] });

  const initGame = () => {
    setGameState("countdown");
    setLevel(1);
    setLives(3);
    setScore(0);
    setTargetSequence("");
    setTypedSequence("");
    setFlashTimeLeft(0);
  };

  const startLevel = useCallback((lvl: number) => {
    const seq = generateSequence(lvl);
    setTargetSequence(seq);
    setTypedSequence("");
    
    const flashDur = getFlashDuration(lvl);
    setInitialFlashTime(flashDur);
    setFlashTimeLeft(flashDur);
    setGameState("memorize");
    playSound("error"); // Sci-fi blip for data transmission
  }, [playSound]);

  // Countdown Logic
  const [countdown, setCountdown] = useState(3);
  useEffect(() => {
    if (gameState === "countdown") {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            startLevel(level);
            return 0;
          }
          playSound("type");
          return c - 1;
        });
      }, 800);
      return () => clearInterval(timer);
    }
  }, [gameState, level, playSound, startLevel]);

  // Memorize Timer Logic
  useEffect(() => {
    if (gameState === "memorize") {
      const interval = 50;
      const timer = setInterval(() => {
        setFlashTimeLeft(prev => {
          if (prev <= interval) {
            clearInterval(timer);
            setGameState("recall");
            playSound("space"); 
            return 0;
          }
          return prev - interval;
        });
      }, interval);
      return () => clearInterval(timer);
    }
  }, [gameState, playSound]);

  // Maintain focus
  useEffect(() => {
    if (gameState === "recall") {
      const focusInterval = setInterval(() => {
        inputRef.current?.focus();
      }, 500);
      inputRef.current?.focus();
      return () => clearInterval(focusInterval);
    }
  }, [gameState]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== "recall") return;
    
    const val = e.target.value.toUpperCase();
    const lastChar = val[val.length - 1];
    const expectedChar = targetSequence[val.length - 1];

    if (val.length <= typedSequence.length) {
       // Backspacing not allowed
       return;
    }

    if (lastChar === expectedChar) {
      playSound("type");
      setTypedSequence(val);
      setScore(s => s + 50 + (level * 10));

      if (val.length === targetSequence.length) {
        playSound("space");
        setScore(s => s + 500 + (level * 100));
        setTimeout(() => {
          setLevel(l => l + 1);
          startLevel(level + 1);
        }, 1000); // 1 sec pause before next level
      }
    } else {
      // Mistake!
      playSound("error");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      
      setLives(l => l - 1);
      if (lives <= 1) {
        setGameState("gameover");
      } else {
        // Punish by clearing typed so far or let them continue? Wait, if they make a mistake, 
        // in Simon Says you usually have to restart the sequence or you fail completely.
        // Let's reset the typed sequence and immediately show them the string again!
        setTypedSequence("");
        setTimeout(() => {
           startLevel(level); // Flash it again
        }, 600);
      }
    }
  };

  // Canvas Neural Network Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      engine.current.width = window.innerWidth;
      engine.current.height = window.innerHeight;
      canvas.width = engine.current.width;
      canvas.height = engine.current.height;
    };
    window.addEventListener("resize", resize);
    resize();

    // Init nodes
    const eng = engine.current;
    if (eng.nodes.length === 0) {
      for (let i = 0; i < 70; i++) {
        eng.nodes.push({
          x: Math.random() * eng.width,
          y: Math.random() * eng.height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          radius: Math.random() * 2 + 1
        });
      }
    }

    let raf: number;
    const loop = () => {
      ctx.clearRect(0, 0, eng.width, eng.height);
      ctx.fillStyle = "#030005"; // very dark violet
      ctx.fillRect(0, 0, eng.width, eng.height);

      ctx.globalCompositeOperation = "lighter";

      // Update & Draw Nodes
      for (let i = 0; i < eng.nodes.length; i++) {
        const n = eng.nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > eng.width) n.vx *= -1;
        if (n.y < 0 || n.y > eng.height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 121, 249, ${gameState === "memorize" ? 0.8 : 0.3})`; // fuchsia-400
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#e879f9";
        ctx.fill();

        // Connect nodes
        for (let j = i + 1; j < eng.nodes.length; j++) {
          const n2 = eng.nodes[j];
          const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            // Highlight connections if memorizing
            const alpha = (1 - dist / 120) * (gameState === "memorize" ? 0.6 : 0.15);
            ctx.strokeStyle = `rgba(45, 212, 191, ${alpha})`; // teal-400
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [gameState]);

  return (
    <div className="relative w-full h-full bg-[#030005] overflow-hidden flex flex-col items-center justify-center font-mono selection:bg-pink-500/30">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
           style={{
             backgroundImage: 'radial-gradient(ellipse at center, transparent 0%, #030005 80%), linear-gradient(rgba(232, 121, 249, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(232, 121, 249, 0.15) 1px, transparent 1px)',
             backgroundSize: '100% 100%, 40px 40px, 40px 40px',
           }} />

      {/* Hidden input */}
      {gameState === "recall" && (
        <input 
          ref={inputRef}
          className="fixed top-0 left-0 w-px h-px opacity-0 pointer-events-none -z-50"
          value={typedSequence}
          onChange={handleInput}
          autoFocus
        />
      )}

      {/* Main HUD */}
      {(gameState === "memorize" || gameState === "recall") && (
        <div className="absolute top-6 left-8 right-8 flex justify-between items-start z-20 pointer-events-none">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex gap-6">
            <div className="bg-[#0f0418]/80 backdrop-blur-xl border border-pink-500/20 px-6 py-4 rounded-2xl flex flex-col shadow-[0_0_30px_rgba(232,121,249,0.1)]">
               <span className="text-[10px] text-pink-400/60 font-black tracking-[0.3em] uppercase mb-1">Matrix Level</span>
               <div className="flex items-center gap-2 text-3xl font-black text-pink-400 drop-shadow-[0_0_10px_#e879f9]">
                 <Hash className="w-6 h-6" /> {level}
               </div>
            </div>
            
            <div className="bg-[#0f0418]/80 backdrop-blur-xl border border-teal-500/20 px-6 py-4 rounded-2xl flex flex-col shadow-[0_0_30px_rgba(45,212,191,0.1)]">
               <span className="text-[10px] text-teal-400/60 font-black tracking-[0.3em] uppercase mb-1">Score</span>
               <span className="text-3xl font-black text-teal-400 drop-shadow-[0_0_10px_#2dd4bf] tabular-nums">{score}</span>
            </div>
          </motion.div>

          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="bg-[#0f0418]/80 backdrop-blur-xl border border-rose-500/20 px-6 py-4 rounded-2xl flex gap-2 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
               {[1, 2, 3].map(i => (
                 <Shield key={i} className={`w-8 h-8 transition-all duration-300 ${i <= lives ? 'text-rose-500 drop-shadow-[0_0_15px_#f43f5e] fill-rose-500' : 'text-gray-800'}`} />
               ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Game Area */}
      <AnimatePresence mode="wait">
        {gameState === "memorize" && (
          <motion.div 
            key="memorize"
            initial={{ scale: 0.8, opacity: 0, filter: "blur(20px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 1.2, opacity: 0, filter: "blur(20px)" }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="absolute inset-0 bg-pink-500/10 blur-[100px] w-full h-full rounded-full" />
            <span className="text-[10px] sm:text-xs text-pink-400/80 font-black tracking-[0.5em] uppercase mb-8 animate-pulse flex items-center gap-2">
              <TriangleAlert className="w-4 h-4" /> Memorize Node Sequence
            </span>
            <div className="text-6xl sm:text-8xl md:text-9xl font-black text-white tracking-[0.2em] drop-shadow-[0_0_30px_#e879f9] filter">
              {targetSequence}
            </div>
            {/* Countdown bar */}
            <div className="w-full max-w-lg h-2 bg-black/50 rounded-full mt-12 overflow-hidden border border-pink-500/30">
               <motion.div 
                 className="h-full bg-gradient-to-r from-teal-400 via-pink-400 to-pink-500 shadow-[0_0_15px_#e879f9]"
                 initial={{ width: "100%" }}
                 animate={{ width: `${(flashTimeLeft / initialFlashTime) * 100}%` }}
                 transition={{ duration: 0.05, ease: "linear" }}
               />
            </div>
          </motion.div>
        )}

        {gameState === "recall" && (
          <motion.div 
            key="recall"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              x: isShaking ? [0, -15, 15, -15, 15, 0] : 0,
              filter: isShaking ? ["hue-rotate(0deg)", "hue-rotate(90deg)", "hue-rotate(0deg)"] : "hue-rotate(0deg)",
              transition: { duration: 0.4 }
            }}
            className="relative z-10 flex flex-col items-center"
          >
            <span className="text-[10px] sm:text-xs text-teal-400/80 font-black tracking-[0.5em] uppercase mb-12 flex items-center gap-2 shadow-black drop-shadow-md">
              <Zap className="w-4 h-4" /> Rewrite Sequence
            </span>

            <div className="flex gap-3 sm:gap-4 md:gap-6 flex-wrap justify-center max-w-[90vw]">
              {targetSequence.split("").map((char, i) => {
                const isTyped = i < typedSequence.length;
                const isCurrent = i === typedSequence.length;
                
                return (
                  <div key={i} className="relative group">
                    {/* The Block */}
                    <div className={`
                      w-12 h-16 sm:w-16 sm:h-20 md:w-20 md:h-24 lg:w-24 lg:h-32 rounded-xl sm:rounded-2xl flex items-center justify-center text-3xl sm:text-5xl md:text-6xl font-black transition-all duration-300
                      ${isTyped ? 'bg-teal-500/20 border-2 border-teal-400 shadow-[0_0_30px_rgba(45,212,191,0.4)] text-teal-300' : 
                        isCurrent ? 'bg-pink-500/10 border-2 border-pink-400/60 shadow-[0_0_20px_rgba(232,121,249,0.3)] scale-110' : 
                        'bg-black/40 border border-white/5 text-transparent'}
                    `}>
                      {isTyped ? char : "?"}
                    </div>
                    {/* Underline for current */}
                    {isCurrent && (
                       <motion.div layoutId="recall-cursor" className="absolute -bottom-4 left-0 right-0 h-1 bg-pink-400 rounded-full shadow-[0_0_10px_#e879f9]" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === "countdown" && (
          <motion.div 
            key={countdown}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute z-50 text-[15rem] sm:text-[20rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-teal-400 via-pink-500 to-purple-600 drop-shadow-[0_0_80px_rgba(232,121,249,0.8)] filter"
          >
            {countdown}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Overlays for Idle and GameOver */}
      <AnimatePresence>
        {(gameState === "idle" || gameState === "gameover") && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#030005]/80"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="text-center bg-[#0f0418]/80 border border-pink-500/30 p-8 md:p-12 lg:p-16 w-[90%] max-w-2xl rounded-[40px] shadow-[0_0_100px_rgba(232,121,249,0.15)] flex flex-col items-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-pink-400 to-purple-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-teal-500/5 pointer-events-none" />
              
              {gameState === "idle" ? (
                <>
                  <div className="w-24 h-24 rounded-3xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mb-8 relative group">
                    <div className="absolute inset-0 bg-pink-500/20 blur-xl group-hover:bg-pink-500/40 transition-colors" />
                    <BrainCircuit className="w-12 h-12 text-pink-400 relative z-10" />
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-black tracking-widest mb-4 text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-teal-300 filter drop-shadow-[0_0_20px_rgba(232,121,249,0.5)]">
                    MEMORY MATRIX
                  </h1>
                  
                  <p className="text-gray-400 text-sm md:text-base font-bold mb-10 max-w-sm leading-relaxed">
                    A sequence will flash briefly. Memorize it. Recall it perfectly. One mistake resets the cipher.
                  </p>
                  
                  <Button 
                    onClick={initGame} 
                    className="group relative w-full h-16 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black tracking-widest text-xl shadow-[0_0_40px_rgba(232,121,249,0.4)] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 shrink-0"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:200%_0,0_0] bg-no-repeat transition-[background-position_0s_ease] hover:bg-[position:-20%_0,0_0] hover:duration-[1000ms]" />
                    <Play className="w-6 h-6 mr-3 fill-current group-hover:scale-125 transition-transform duration-300" /> ENTER NEURAL NET
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-red-500/20 blur-xl" />
                    <Skull className="w-12 h-12 text-red-400 relative z-10" />
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-[0.2em] mb-8 filter drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">LINK SEVERED</h2>
                  
                  <div className="flex gap-6 justify-center mb-10">
                    <div className="bg-black/40 border border-pink-500/20 px-8 py-4 rounded-2xl flex flex-col items-center">
                      <div className="text-pink-400/60 text-xs font-black tracking-widest uppercase mb-1">Final Level</div>
                      <div className="text-4xl font-black text-pink-400">{level}</div>
                    </div>
                    <div className="bg-black/40 border border-teal-500/20 px-8 py-4 rounded-2xl flex flex-col items-center">
                      <div className="text-teal-400/60 text-xs font-black tracking-widest uppercase mb-1">Data Extracted</div>
                      <div className="text-4xl font-black text-teal-400">{score}</div>
                    </div>
                  </div>

                  <Button 
                    onClick={initGame} 
                    className="w-full h-16 bg-black/60 hover:bg-black border border-pink-500/50 text-pink-400 hover:text-pink-300 font-black tracking-widest text-lg shadow-[0_0_20px_rgba(232,121,249,0.2)] rounded-2xl hover:scale-105 transition-all duration-300"
                  >
                    RECONNECT
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
