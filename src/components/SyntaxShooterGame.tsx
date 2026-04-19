"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Crosshair, Zap, Skull, Activity, Timer } from "lucide-react";
import { useMechanicalSound } from "@/hooks/useMechanicalSound";
import { motion, AnimatePresence } from "framer-motion";

const SNIPPETS = [
  "const a = 1;", "() => {}", "display: flex;", "margin: 0;", "import React",
  "function run()", "return null;", "if (err) throw err;", "console.log()", "justify-center",
  "git push -f", "try {", "} catch (e) {", "Array.isArray()", "Object.keys()",
  "await fetch()", "JSON.stringify()", "export default", "opacity: 0.5;",
  "setTimeout()", "clearTimeout()", "let index = 0;", "border-radius: 8px;"
];

const GAME_DURATION = 60;
const MAX_HEALTH = 100;

interface TargetNode {
  id: string;
  text: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  speed: number;
  hue: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function SyntaxShooterGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const playSound = useMechanicalSound(true);

  const [status, setStatus] = useState<"idle" | "countdown" | "playing" | "gameover">("idle");
  const [countdown, setCountdown] = useState(3);
  const [health, setHealth] = useState(MAX_HEALTH);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

  const [targets, setTargets] = useState<TargetNode[]>([]);
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [typedTargetText, setTypedTargetText] = useState("");

  const engine = useRef({
    particles: [] as Particle[],
    lasers: [] as { x1: number, y1: number, x2: number, y2: number, alpha: number }[],
    lastSpawnTime: 0,
    spawnInterval: 2000,
    width: 800,
    height: 600
  });

  const generateTarget = useCallback((existing: TargetNode[] = []): TargetNode => {
    let safeX = 15 + Math.random() * 70;
    for (let i = 0; i < 15; i++) {
       // Avoid overlapping with anything in the upper 35% of the screen within 25% horizontal space
       if (!existing.find(t => t.y < 35 && Math.abs(t.x - safeX) < 25)) break;
       safeX = 15 + Math.random() * 70;
    }
    const hues = ['text-cyan-400', 'text-emerald-400', 'text-fuchsia-400', 'text-indigo-400', 'text-rose-300', 'text-blue-400'];
    
    return {
      id: Math.random().toString(36).substring(2, 9),
      text: SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)],
      x: safeX,
      y: -10, // Start above the screen
      speed: 0.03 + Math.random() * 0.04, // Falling speed slightly reduced
      hue: hues[Math.floor(Math.random() * hues.length)]
    };
  }, []);

  const resize = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    engine.current.width = containerRef.current.clientWidth;
    engine.current.height = containerRef.current.clientHeight;
    canvasRef.current.width = engine.current.width;
    canvasRef.current.height = engine.current.height;
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  const initGame = () => {
    setStatus("countdown");
    setCountdown(3);
    setHealth(MAX_HEALTH);
    setScore(0);
    setCombo(0);
    setTimeLeft(GAME_DURATION);
    setTargets([]);
    setActiveTargetId(null);
    setTypedTargetText("");
    engine.current.particles = [];
    engine.current.lasers = [];
    engine.current.spawnInterval = 2000;
  };

  useEffect(() => {
    if (status === "countdown") {
      if (countdown > 0) {
        playSound('normal');
        const t = setTimeout(() => setCountdown(c => c - 1), 800);
        return () => clearTimeout(t);
      } else {
        playSound('space');
        setStatus("playing");
        setTargets(prev => {
          const first = generateTarget([]);
          const second = generateTarget([first]);
          return [first, second];
        }); 
        engine.current.lastSpawnTime = Date.now();
      }
    }
  }, [status, countdown, playSound, generateTarget]);

  // Main Game Loop
  useEffect(() => {
    if (status !== "playing") return;

    let rafId: number;
    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const dt = now - lastTime;
      lastTime = now;
      const eng = engine.current;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && canvas) {
        ctx.clearRect(0, 0, eng.width, eng.height);
        
        ctx.globalCompositeOperation = 'lighter';

        // Render Laser Beams
        for (let i = eng.lasers.length - 1; i >= 0; i--) {
          const l = eng.lasers[i];
          ctx.beginPath();
          ctx.moveTo(l.x1, l.y1);
          ctx.lineTo(l.x2, l.y2);
          
          ctx.shadowBlur = 40;
          ctx.shadowColor = `rgba(244, 63, 94, ${l.alpha})`;
          ctx.lineWidth = 14 * l.alpha;
          ctx.strokeStyle = `rgba(244, 63, 94, ${l.alpha * 0.9})`; 
          ctx.lineCap = "round";
          ctx.stroke();
          
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(255, 255, 255, ${l.alpha})`;
          ctx.lineWidth = 4 * l.alpha;
          ctx.strokeStyle = `rgba(255, 255, 255, ${l.alpha})`; 
          ctx.stroke();

          ctx.shadowBlur = 0; 
          l.alpha -= 0.04 * (dt / 16);
          if (l.alpha <= 0) eng.lasers.splice(i, 1);
        }

        // Render Particles
        for (let i = eng.particles.length - 1; i >= 0; i--) {
          const p = eng.particles[i];
          p.x += p.vx * (dt / 16);
          p.y += p.vy * (dt / 16);
          p.life -= (dt / 16);
          
          const alpha = Math.max(0, p.life / p.maxLife);
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.random() * 2 + 1, 0, Math.PI * 2);
          ctx.shadowBlur = 20;
          ctx.shadowColor = `rgba(${p.color}, ${alpha})`;
          ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
          ctx.fill();
          ctx.shadowBlur = 0;

          if (p.life <= 0) eng.particles.splice(i, 1);
        }
        ctx.globalCompositeOperation = 'source-over';
      }

      setTargets(prev => {
        let newHealth = health;
        const nextTargets = prev.map(t => ({
          ...t,
          y: t.y + t.speed * (dt / 16)
        })).filter(t => {
          if (t.y > 105) {
            newHealth -= 10;
            if (activeTargetId === t.id) {
              setActiveTargetId(null);
              setTypedTargetText("");
              setCombo(0);
            }
            return false;
          }
          return true;
        });

        if (newHealth !== health) {
             setHealth(newHealth);
             playSound('error');
             if (newHealth <= 0) setStatus('gameover');
        }
        
        return nextTargets;
      });

      if (now - eng.lastSpawnTime > eng.spawnInterval) {
        setTargets(prev => [...prev, generateTarget(prev)]);
        eng.lastSpawnTime = now;
        eng.spawnInterval = Math.max(600, eng.spawnInterval - 30);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    
    const timerInterval = setInterval(() => {
      setTimeLeft(l => {
        if (l <= 1) {
          setStatus("gameover");
          return 0;
        }
        return l - 1;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(timerInterval);
    };
  }, [status, health, activeTargetId, playSound, generateTarget]);

  useEffect(() => {
    if (status !== "playing") return;
    const focusTimer = setInterval(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearInterval(focusTimer);
  }, [status]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status !== "playing") return;
    const val = e.target.value;
    
    let currentTarget = targets.find(t => t.id === activeTargetId);
    
    if (!currentTarget && val.length === 1) {
      const charTyped = val.toLowerCase();
      const possibleTargets = targets.filter(t => t.text[0].toLowerCase() === charTyped);
      if (possibleTargets.length > 0) {
        currentTarget = possibleTargets.reduce((prev, current) => (prev.y > current.y) ? prev : current);
        setActiveTargetId(currentTarget.id);
      } else {
        playSound('error');
        setCombo(0);
        return;
      }
    }

    if (!currentTarget) return;

    const expectedMatch = currentTarget.text.substring(0, val.length);
    
    if (val.toLowerCase() === expectedMatch.toLowerCase()) {
      playSound('normal');
      setTypedTargetText(currentTarget.text.substring(0, val.length));

      if (val.toLowerCase() === currentTarget.text.toLowerCase()) {
        playSound('space');
        setCombo(c => c + 1);
        setScore(s => s + 100 + combo * 15);
        
        if (containerRef.current) {
           const tx = (currentTarget.x / 100) * engine.current.width;
           const ty = (currentTarget.y / 100) * engine.current.height;
           
           engine.current.lasers.push({
             x1: engine.current.width / 2,
             y1: engine.current.height - 30,
             x2: tx,
             y2: ty,
             alpha: 1
           });

           for (let i=0; i<40; i++) {
               engine.current.particles.push({
                   x: tx, y: ty,
                   vx: (Math.random() - 0.5) * 20,
                   vy: (Math.random() - 0.5) * 20,
                   life: 20 + Math.random() * 30,
                   maxLife: 50,
                   color: Math.random() > 0.5 ? "245, 158, 11" : "244, 63, 94"
               });
           }
        }

        setTargets(prev => prev.filter(t => t.id !== currentTarget!.id));
        setActiveTargetId(null);
        setTypedTargetText("");
      }
    } else {
      playSound('error');
      setCombo(0);
      try {
         engine.current.particles.push({
             x: engine.current.width / 2,
             y: engine.current.height - 30,
             vx: (Math.random() - 0.5) * 8,
             vy: -Math.random() * 10,
             life: 15, maxLife: 15,
             color: "255, 0, 0"
         });
      } catch {}
    }
  };

  return (
    <div 
      className="relative w-full h-full bg-[#050204] overflow-hidden flex flex-col items-center justify-center font-mono selection:bg-rose-500/30" 
      onClick={() => inputRef.current?.focus()}
      ref={containerRef}
    >
      {/* Background Deep Space Radar Grid */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none"
           style={{
             backgroundImage: 'linear-gradient(rgba(244, 63, 94, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(244, 63, 94, 0.2) 1px, transparent 1px)',
             backgroundSize: '100px 100px',
             transform: 'perspective(1200px) rotateX(70deg) scale(2.5) translateY(-50px)',
             transformOrigin: 'top center',
             animation: 'gridMove 5s linear infinite'
           }}>
      </div>
      <style>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 100px; }
        }
      `}</style>
      
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom,_transparent_0%,_#050204_85%)] pointer-events-none" />

      {/* FX Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" />

      {/* Hidden input field */}
      {status === "playing" && (
        <input 
          ref={inputRef}
          className="fixed top-0 left-0 w-px h-px opacity-0 pointer-events-none -z-50"
          value={activeTargetId ? typedTargetText : ""}
          onChange={handleInput}
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
      )}

      {/* Futuristic HUD */}
      {status === "playing" && (
        <div className="absolute top-6 left-8 right-8 flex justify-between items-start z-20 pointer-events-none">
          
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col gap-4">
            <div className="group relative bg-[#0a0204]/60 backdrop-blur-3xl border border-rose-500/10 px-6 py-4 rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Activity className={`w-5 h-5 ${health <= 30 ? 'text-rose-500 animate-pulse drop-shadow-[0_0_10px_#f43f5e]' : 'text-rose-400/80'}`} />
                <div className="w-40 h-1.5 bg-black/80 rounded-full overflow-hidden border border-rose-950/50">
                  <div className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-amber-300 transition-all duration-300 shadow-[0_0_10px_rgba(244,63,94,0.8)]" style={{ width: `${health}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-rose-500/60 font-black tracking-[0.2em] uppercase">System Integrity</span>
                <span className="text-xs text-rose-300 font-bold tracking-widest">{health}%</span>
              </div>
            </div>
            
            <AnimatePresence>
              {combo > 2 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-amber-500/10 backdrop-blur-xl border-l-[3px] border-amber-400 px-4 py-2 rounded-r-xl flex items-center justify-between"
                >
                  <span className="text-[9px] text-amber-500/80 font-black tracking-[0.3em] uppercase">Combo</span>
                  <div className="flex items-center gap-1 text-amber-400 font-black ml-4">
                    <Zap className="w-4 h-4 fill-amber-400 drop-shadow-[0_0_10px_#f59e0b]" /> x{combo}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Side: Score & Timer */}
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col items-end gap-3 pointer-events-none">
            <div className="flex items-center gap-6 bg-[#0a0204]/60 backdrop-blur-3xl border border-rose-500/10 px-6 py-4 rounded-xl">
               <div className="flex flex-col items-end border-r border-rose-500/20 pr-6">
                 <span className="text-[10px] text-amber-500/60 font-black tracking-[0.3em] uppercase mb-1">Score</span>
                 <span className="text-3xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] tabular-nums">{score}</span>
               </div>
               <div className="flex flex-col items-center">
                 <Timer className={`w-4 h-4 mb-1 ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-rose-400/60'}`} />
                 <span className={`text-2xl font-black tabular-nums tracking-widest ${timeLeft <= 10 ? 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]' : 'text-white'}`}>
                   {timeLeft}
                 </span>
               </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Floating Glowing Typography Nodes (No background box, pure premium) */}
      {status === "playing" && targets.map(target => {
        const isActive = target.id === activeTargetId;
        return (
          <div 
            key={target.id}
            className="absolute z-20 transition-[top,left] duration-100 ease-linear flex items-center justify-center font-mono pointer-events-none"
            style={{ 
              left: `${target.x}%`, 
              top: `${target.y}%`,
              transform: 'translate(-50%, -50%) perspective(1000px)'
            }}
          >
            {/* Target Reticle Lock */}
            <AnimatePresence>
              {isActive && (
                <motion.div 
                  initial={{ scale: 1.5, opacity: 0, rotate: -45 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute -inset-6 z-0 pointer-events-none flex items-center justify-center"
                >
                  {/* Hexagon style high-tech brackets */}
                  <svg className="w-full h-full absolute inset-0 text-amber-500/40 drop-shadow-[0_0_8px_#f59e0b] fill-none stroke-current stroke-2" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M 0 20 L 0 0 L 20 0" />
                    <path d="M 80 0 L 100 0 L 100 20" />
                    <path d="M 100 80 L 100 100 L 80 100" />
                    <path d="M 20 100 L 0 100 L 0 80" />
                  </svg>
                  <div className="absolute top-1/2 left-[-20px] w-2 h-px bg-amber-400" />
            <div className="absolute top-1/2 right-[-20px] w-2 h-px bg-amber-400" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        layoutId={target.id}
        className={`relative z-10 px-2 py-1 transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'} whitespace-nowrap`}
      >
         <div className="relative flex text-xl md:text-[22px] font-black tracking-wider bg-black/40 px-2 py-1 rounded shadow-black drop-shadow-[0_2px_4px_rgba(0,0,0,1)] hover:z-30">
           {target.text.split('').map((char, i) => {
              const typed = isActive && i < typedTargetText.length;
              const isCurrent = isActive && i === typedTargetText.length;
              return (
                 <span 
                   key={i} 
                   className={`transition-all duration-150 relative 
                     ${typed ? 'text-white opacity-20 drop-shadow-none' : 
                       isActive ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]' : 
                       `${target.hue} opacity-90`}
                     ${isCurrent && isActive ? 'text-amber-300 drop-shadow-[0_0_15px_#f59e0b] -translate-y-1 inline-block z-10' : ''}
                   `}
                   style={(!isActive && !typed) ? { textShadow: `0 0 10px currentColor` } : {}}
                 >
                   {char === ' ' ? '\u00A0' : char}
                   {isCurrent && isActive && (
                           <motion.span layoutId="cursor" className="absolute -bottom-2 left-0 right-0 h-[3px] bg-amber-400 rounded-full shadow-[0_0_12px_#f59e0b]" />
                         )}
                       </span>
                    )
                 })}
               </div>
            </motion.div>
          </div>
        )
      })}

      {/* Cyberpunk Mainframe Cannon at the bottom */}
      {status === "playing" && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
          
          {/* Holographic Aim Line */}
          <div className="w-[1px] h-40 bg-gradient-to-t from-rose-500/50 to-transparent absolute bottom-12 filter drop-shadow-[0_0_10px_#f43f5e]" />

          {/* Cannon Core Orb */}
          <div className="relative w-20 h-20 mb-[-30px] z-20">
             <div className="absolute inset-1 border-2 border-dashed border-amber-500/60 rounded-full animate-[spin_4s_linear_infinite]" />
             <div className="absolute inset-0 border border-rose-500/40 rounded-full bg-[#050204]/80 backdrop-blur-sm shadow-[0_0_40px_rgba(244,63,94,0.4)_inset] flex items-center justify-center">
                <div className={`w-5 h-5 rounded-full transition-all duration-75 ${typedTargetText.length > 0 ? 'bg-amber-100 shadow-[0_0_30px_#fcd34d,0_0_60px_#f59e0b] scale-150' : 'bg-rose-500 shadow-[0_0_20px_#f43f5e]'}`} />
             </div>
          </div>

          {/* Cannon Turret Wings Platform */}
          <div className="flex items-end shadow-[0_-20px_100px_rgba(244,63,94,0.3)] pointer-events-none filter drop-shadow-[0_0_10px_rgba(0,0,0,1)]">
             <div className="w-20 h-10 bg-gradient-to-tr from-black to-rose-950/60 border-t border-r border-rose-500/40 rounded-tr-[40px]" />
             
             <div className="w-[320px] h-20 bg-[#020101] border-t border-rose-500/50 rounded-t-[30px] flex justify-center items-end pb-4 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
                
                {/* Vents glowing */}
                <div className="flex gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-10 h-[3px] bg-rose-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 w-1/2 animate-[pulse_1s_infinite] shadow-[0_0_10px_#f43f5e]" style={{ animationDelay: `${i * 0.1}s` }} />
                    </div>
                  ))}
                </div>
             </div>

             <div className="w-20 h-10 bg-gradient-to-tl from-black to-rose-950/60 border-t border-l border-rose-500/40 rounded-tl-[40px]" />
          </div>
        </div>
      )}

      {/* Start / Game Over Screens (Untouched structurally, already fully responsive) */}
      <AnimatePresence>
        {(status === "idle" || status === "gameover") && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#050204]/60"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="text-center bg-black/40 border border-rose-500/20 p-6 md:p-10 lg:p-14 w-[90%] max-w-3xl rounded-[40px] shadow-[0_0_100px_rgba(244,63,94,0.1)] flex flex-col items-center relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-amber-500/5 pointer-events-none rounded-[40px]" />
              
              {status === "idle" ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-6 relative flex items-center justify-center"
                  >
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-rose-500/40" />
                    <div className="absolute inset-2 rounded-full border border-amber-500/30 rotate-45" />
                    <Crosshair className="w-12 h-12 text-rose-400" />
                  </motion.div>
                  
                  <h1 className="text-4xl md:text-7xl font-black tracking-[0.1em] mb-3 md:mb-4 text-transparent bg-clip-text bg-gradient-to-br from-rose-400 via-rose-500 to-amber-500 filter drop-shadow-[0_0_30px_rgba(244,63,94,0.3)] leading-tight">
                    SYNTAX<br/>SHOOTER
                  </h1>
                  
                  <p className="text-amber-500/60 text-xs md:text-sm font-black tracking-[0.4em] uppercase mb-8 md:mb-12">Target Acquisition Protocol</p>
                  
                  <Button 
                    onClick={initGame} 
                    className="group relative w-64 md:w-80 h-16 md:h-20 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black tracking-widest text-xl md:text-2xl shadow-[0_0_40px_rgba(244,63,94,0.4)] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 shrink-0"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:200%_0,0_0] bg-no-repeat transition-[background-position_0s_ease] hover:bg-[position:-20%_0,0_0] hover:duration-[1500ms]" />
                    <Play className="w-8 h-8 mr-4 fill-current group-hover:scale-125 transition-transform duration-300" /> SYSTEM OVERRIDE
                  </Button>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <Skull className="w-28 h-28 mx-auto mb-6 text-rose-500 filter drop-shadow-[0_0_40px_rgba(244,63,94,0.6)]" />
                  </motion.div>
                  
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-[0.2em] mb-6 md:mb-10 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">SYSTEM OFFLINE</h2>
                  
                  <div className="flex gap-10 justify-center mb-12">
                    <div className="bg-[#0a0204]/80 backdrop-blur-md border border-amber-500/20 px-8 py-6 rounded-3xl flex flex-col items-center">
                      <div className="text-rose-400/60 text-[10px] md:text-xs font-black tracking-[0.3em] uppercase mb-2">Target Score</div>
                      <div className="text-6xl md:text-7xl font-black text-amber-500 filter drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">{score}</div>
                    </div>
                  </div>

                  <Button 
                    onClick={initGame} 
                    className="w-80 h-20 bg-black/60 hover:bg-black border border-rose-500/50 text-rose-400 hover:text-rose-300 font-black tracking-[0.2em] text-xl shadow-[0_0_30px_rgba(244,63,94,0.2)] rounded-2xl hover:scale-105 transition-all duration-300"
                  >
                    REBOOT SEQUENCE
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {status === "countdown" && (
          <motion.div 
            key={countdown}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute z-50 text-[20rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-rose-400 via-rose-500 to-amber-500 drop-shadow-[0_0_80px_rgba(244,63,94,0.8)] filter"
          >
            {countdown}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
