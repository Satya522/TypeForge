"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Crosshair, Shield, Zap, Skull, HeartPulse } from "lucide-react";
import { useMechanicalSound } from "@/hooks/useMechanicalSound";

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

  const generateTarget = useCallback((): TargetNode => {
    return {
      id: Math.random().toString(36).substring(2, 9),
      text: SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)],
      x: 10 + Math.random() * 80, // Spawn between 10% and 90% width
      y: -10, // Start slightly above the screen
      speed: 0.05 + Math.random() * 0.05 // Falling speed
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
        playSound('type');
        const t = setTimeout(() => setCountdown(c => c - 1), 800);
        return () => clearTimeout(t);
      } else {
        playSound('space');
        setStatus("playing");
        setTargets([generateTarget(), generateTarget()]); // Start with 2 targets
        engine.current.lastSpawnTime = Date.now();
      }
    }
  }, [status, countdown, playSound, generateTarget]);

  // Main Game Loop (Canvas & Logic)
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
        // Clear canvas cleanly (No ghosting, just pure dark red grid)
        ctx.clearRect(0, 0, eng.width, eng.height);

        // Render Laser Beams
        for (let i = eng.lasers.length - 1; i >= 0; i--) {
          const l = eng.lasers[i];
          ctx.beginPath();
          ctx.moveTo(l.x1, l.y1);
          ctx.lineTo(l.x2, l.y2);
          ctx.lineWidth = l.alpha * 15;
          ctx.strokeStyle = `rgba(245, 158, 11, ${l.alpha})`; // Amber
          ctx.lineCap = "round";
          ctx.stroke();
          
          ctx.lineWidth = l.alpha * 5;
          ctx.strokeStyle = `rgba(255, 255, 255, ${l.alpha})`; // White core
          ctx.stroke();

          l.alpha -= 0.05 * (dt / 16);
          if (l.alpha <= 0) eng.lasers.splice(i, 1);
        }

        // Render Particles (Explosions)
        for (let i = eng.particles.length - 1; i >= 0; i--) {
          const p = eng.particles[i];
          p.x += p.vx * (dt / 16);
          p.y += p.vy * (dt / 16);
          p.life -= (dt / 16);
          
          const alpha = Math.max(0, p.life / p.maxLife);
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.random() * 3 + 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
          ctx.fill();

          if (p.life <= 0) eng.particles.splice(i, 1);
        }
      }

      // Logic: Update targets falling
      setTargets(prev => {
        let newHealth = health;
        const nextTargets = prev.map(t => ({
          ...t,
          y: t.y + t.speed * (dt / 16)
        })).filter(t => {
          if (t.y > 105) {
            // Target reached bottom
            newHealth -= 10;
            if (activeTargetId === t.id) {
              setActiveTargetId(null);
              setTypedTargetText("");
              setCombo(0);
            }
            // Screen shake or damage flash could go here
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

      // Logic: Spawn new targets
      if (now - eng.lastSpawnTime > eng.spawnInterval) {
        setTargets(prev => [...prev, generateTarget()]);
        eng.lastSpawnTime = now;
        eng.spawnInterval = Math.max(500, eng.spawnInterval - 20); // Get faster
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    
    // Timer
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

  // Keep focus
  useEffect(() => {
    if (status !== "playing") return;
    const focusTimer = setInterval(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearInterval(focusTimer);
  }, [status]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status !== "playing") return;
    const val = e.target.value.toLowerCase();
    const lastChar = val.slice(-1);
    
    // Determine target
    let currentTarget = targets.find(t => t.id === activeTargetId);
    
    // If no active target, try to lock onto one starting with the typed letter
    if (!currentTarget && val.length === 1) {
      const possibleTargets = targets.filter(t => t.text.toLowerCase().startsWith(val));
      if (possibleTargets.length > 0) {
        // Lock onto the lowest one (highest y)
        currentTarget = possibleTargets.reduce((prev, current) => (prev.y > current.y) ? prev : current);
        setActiveTargetId(currentTarget.id);
      } else {
        // Missed initial lock-on
        playSound('error');
        setCombo(0);
        return;
      }
    }

    if (!currentTarget) return; // Still no target

    const expectedText = currentTarget.text.toLowerCase().substring(0, val.length);
    
    if (val === expectedText) {
      // Correct keystroke
      playSound('type');
      setTypedTargetText(val);

      if (val === currentTarget.text.toLowerCase()) {
        // DESTROYED
        playSound('space');
        setCombo(c => c + 1);
        setScore(s => s + 100 + combo * 10);
        
        // Visual effects
        if (containerRef.current) {
           const rect = containerRef.current.getBoundingClientRect();
           const tx = (currentTarget.x / 100) * engine.current.width;
           const ty = (currentTarget.y / 100) * engine.current.height;
           
           // Shoot Laser
           engine.current.lasers.push({
             x1: engine.current.width / 2,
             y1: engine.current.height - 50,
             x2: tx,
             y2: ty,
             alpha: 1
           });

           // Explosion Particles
           for (let i=0; i<30; i++) {
               engine.current.particles.push({
                   x: tx, y: ty,
                   vx: (Math.random() - 0.5) * 15,
                   vy: (Math.random() - 0.5) * 15,
                   life: 20 + Math.random() * 20,
                   maxLife: 40,
                   color: Math.random() > 0.5 ? "245, 158, 11" : "225, 29, 72" // Amber or Rose
               });
           }
        }

        // Cleanup
        setTargets(prev => prev.filter(t => t.id !== currentTarget!.id));
        setActiveTargetId(null);
        setTypedTargetText("");
      }
    } else {
      // Wrong keystroke
      playSound('error');
      setCombo(0);
      try {
         // Create a small misfire particle effect at the turret
         engine.current.particles.push({
             x: engine.current.width / 2,
             y: engine.current.height - 50,
             vx: (Math.random() - 0.5) * 5,
             vy: -Math.random() * 10,
             life: 10, maxLife: 10,
             color: "255, 0, 0"
         });
      } catch {}
    }
  };

  return (
    <div 
      className="relative w-full h-full bg-[#0a0202] overflow-hidden flex flex-col items-center justify-center font-mono" 
      onClick={() => inputRef.current?.focus()}
      ref={containerRef}
    >
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
           style={{
             backgroundImage: `linear-gradient(rgba(225, 29, 72, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(225, 29, 72, 0.4) 1px, transparent 1px)`,
             backgroundSize: '40px 40px',
             transform: 'perspective(500px) rotateX(60deg) scale(2) translateY(-100px)',
             transformOrigin: 'top center',
             animation: 'gridMove 3s linear infinite'
           }}>
      </div>
      <style>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
      `}</style>
      
      {/* Subdued Vignette Overlay */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0a0202_80%)] pointer-events-none" />

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
        />
      )}

      {/* HUD Bar */}
      {status === "playing" && (
        <div className="absolute top-6 left-0 right-0 px-8 flex justify-between items-start z-20 pointer-events-none">
          {/* Health & Combo */}
          <div className="flex flex-col gap-3 backdrop-blur-xl bg-black/40 border border-rose-500/20 px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(225,29,72,0.1)]">
             <div className="flex items-center gap-3">
               <HeartPulse className={`w-5 h-5 ${health < 30 ? 'text-red-500 animate-pulse' : 'text-rose-400'}`} />
               <div className="w-32 h-2.5 bg-black/50 rounded-full overflow-hidden border border-rose-500/30">
                 <div className="h-full bg-gradient-to-r from-rose-600 to-amber-400 transition-all duration-300" style={{ width: `${health}%` }} />
               </div>
             </div>
             <div className="flex items-center gap-2">
               <Zap className="w-4 h-4 text-amber-400" />
               <span className="text-amber-400 font-black tracking-widest text-sm">COMBO x{combo}</span>
             </div>
          </div>

          {/* Time Limit */}
          <div className="flex bg-black/60 backdrop-blur-2xl border border-rose-500/30 px-8 py-3 rounded-2xl items-center gap-4 shadow-[#e11d48_0_0_30px_-5px]">
             <span className={`text-4xl font-black tabular-nums tracking-widest ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`} style={{ textShadow: "0 0 20px rgba(225,29,72,0.4)" }}>
               {timeLeft}s
             </span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-end backdrop-blur-xl bg-black/40 border border-amber-500/20 px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(245,158,11,0.1)]">
             <div className="text-[10px] text-amber-500 font-black tracking-[0.2em] uppercase mb-1">Total Score</div>
             <div className="text-4xl font-black text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}>{score}</div>
          </div>
        </div>
      )}

      {/* Floating Syntax Targets */}
      {status === "playing" && targets.map(target => {
        const isActive = target.id === activeTargetId;
        return (
          <div 
            key={target.id}
            className={`absolute z-20 flex flex-col items-center transition-transform duration-100 linear`}
            style={{ 
              left: `${target.x}%`, 
              top: `${target.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {isActive && (
              <div className="absolute -inset-4 border border-rose-500/50 rounded-lg animate-[spin_4s_linear_infinite] shadow-[inset_0_0_15px_rgba(225,29,72,0.5)]">
                 <div className="absolute top-0 left-1/2 w-2 h-2 bg-rose-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#f43f5e]" />
              </div>
            )}
            
            <div className={`px-4 py-2 rounded-md backdrop-blur-md border border-white/10 ${isActive ? 'bg-rose-950/80 shadow-[0_0_30px_rgba(225,29,72,0.4)]' : 'bg-black/80'}`}>
               <div className="flex text-2xl font-black tracking-widest text-[#f59e0b]">
                 {target.text.split('').map((char, i) => {
                    const typed = isActive && i < typedTargetText.length;
                    return (
                       <span key={i} className={typed ? 'text-white drop-shadow-[0_0_10px_white] opacity-20' : 'text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]'}>
                         {char}
                       </span>
                    )
                 })}
               </div>
            </div>
            {isActive && (
               <Crosshair className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-rose-500/30 animate-pulse pointer-events-none" />
            )}
          </div>
        )
      })}

      {/* The Sentry Turret */}
      {status === "playing" && (
        <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="w-48 h-32 bg-gradient-to-t from-rose-950 to-black border-t-4 border-amber-500/50 rounded-t-full flex items-start justify-center pt-4 shadow-[0_-20px_60px_rgba(225,29,72,0.3)]">
             {/* Gun Barrel Glow */}
             <div className="w-12 h-12 rounded-full border-4 border-rose-500/50 bg-rose-900/40 shadow-[inset_0_0_20px_rgba(225,29,72,0.8)] flex items-center justify-center">
                 <div className={`w-4 h-4 bg-white rounded-full transition-all duration-100 ${typedTargetText.length > 0 ? 'scale-150 shadow-[0_0_20px_#fff,0_0_40px_#f59e0b]' : 'shadow-[0_0_10px_#fff]'}`} />
             </div>
          </div>
        </div>
      )}

      {/* Start / Game Over Screens */}
      {(status === "idle" || status === "gameover") && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0202]/80 backdrop-blur-md">
          <div className="text-center bg-black/40 border border-rose-500/20 p-12 rounded-3xl shadow-[0_0_80px_rgba(225,29,72,0.15)] flex flex-col items-center">
            {status === "idle" ? (
              <>
                <div className="w-24 h-24 mx-auto mb-6 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(225,29,72,0.2)]">
                  <Crosshair className="w-12 h-12 text-rose-500" />
                </div>
                <h1 className="text-7xl font-black tracking-[0.2em] mb-4 text-transparent bg-clip-text bg-gradient-to-br from-rose-400 to-amber-500 filter drop-shadow-[0_0_20px_rgba(225,29,72,0.4)]">
                  SYNTAX<br/>SHOOTER
                </h1>
                <p className="text-gray-400 text-sm tracking-widest uppercase mb-12">Target Acquisition Protocol: OVERRIDE</p>
                
                <Button onClick={initGame} variant="primary" size="lg" className="w-72 h-16 bg-rose-600 hover:bg-rose-500 text-white font-black tracking-widest text-lg shadow-[0_0_40px_rgba(225,29,72,0.5)]">
                  <Play className="w-6 h-6 mr-3 fill-current" /> ENGAGE
                </Button>
              </>
            ) : (
              <>
                <Skull className="w-24 h-24 mx-auto mb-6 text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.5)]" />
                <h2 className="text-5xl font-black text-rose-500 tracking-[0.2em] mb-8 drop-shadow-[0_0_20px_rgba(225,29,72,0.5)]">SYSTEM FAILURE</h2>
                
                <div className="flex gap-8 justify-center mb-12">
                  <div className="bg-black/50 border border-white/5 px-8 py-6 rounded-2xl">
                    <div className="text-gray-500 text-xs font-black tracking-widest uppercase mb-2">Final Score</div>
                    <div className="text-5xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">{score}</div>
                  </div>
                </div>

                <Button onClick={initGame} variant="primary" size="lg" className="w-72 h-16 bg-amber-500 hover:bg-amber-400 text-black font-black tracking-widest text-xl shadow-[0_0_40px_rgba(245,158,11,0.5)]">
                  RETRY
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {status === "countdown" && (
        <div className="z-50 text-[15rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-rose-400 to-amber-500 drop-shadow-[0_0_50px_rgba(225,29,72,0.8)] filter">
          {countdown}
        </div>
      )}
    </div>
  );
}
