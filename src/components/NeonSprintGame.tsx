"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Timer, Trophy, Zap, Activity } from "lucide-react";

const GAME_DURATION = 60;
const COUNTDOWN_FROM = 3;

const WORD_POOL = [
  "velocity", "quantum", "neon", "overdrive", "hyperlink", "cyber", "mainframe",
  "sprint", "lightspeed", "system", "override", "network", "matrix", "synth",
  "pulse", "processor", "grid", "firewall", "bypass", "protocol", "bandwidth",
  "terminal", "encrypt", "vector", "orbital", "stellar", "nebula", "hologram",
  "nexus", "phantom", "void", "static", "glitch", "arcade", "retro", "flux",
  "horizon", "engine", "core", "kinetic", "resonance", "synthetic"
];

function getRandomWord(previous?: string) {
  let word = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
  while (word === previous) {
    word = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
  }
  return word;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  color: string;
}

export default function NeonSprintGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [status, setStatus] = useState<"idle" | "countdown" | "playing" | "gameover">("idle");
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [currentWord, setCurrentWord] = useState("");
  const [typed, setTyped] = useState("");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [combo, setCombo] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  // Engine state for 3D Warp Rendering
  const engine = useRef({
    particles: [] as Particle[],
    rafId: 0,
    velocity: 0, // Current speed
    targetVelocity: 10,
    startTime: 0,
    shake: 0,
    warpColor: "200, 0, 255", // RGB string for purple
    width: 800,
    height: 600
  });

  const playSound = useCallback((type: "type" | "boost" | "fail" | "launch") => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === "type") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600 + Math.random() * 200, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "boost") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "fail") {
        osc.type = "square";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "launch") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.8);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
      }
    } catch {}
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    // Set actual internal resolution to match screen
    canvas.width = w;
    canvas.height = h;
    engine.current.width = w;
    engine.current.height = h;

    // Init 3D Particles
    if (engine.current.particles.length === 0) {
      const p = [];
      for (let i = 0; i < 400; i++) {
        p.push({
          x: (Math.random() - 0.5) * 2000,
          y: (Math.random() - 0.5) * 2000,
          z: Math.random() * 2000,
          color: Math.random() > 0.5 ? "0, 255, 255" : "200, 0, 255" // cyan or purple
        });
      }
      engine.current.particles = p;
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  const resetGame = useCallback(() => {
    setWordsCompleted(0);
    setWpm(0);
    setCombo(0);
    setSpeedMultiplier(1);
    setTimeLeft(GAME_DURATION);
    engine.current.targetVelocity = 10;
    engine.current.velocity = 0;
    engine.current.warpColor = "200, 0, 255";
  }, []);

  const initGame = useCallback(() => {
    setStatus("countdown");
    setCountdown(COUNTDOWN_FROM);
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    if (status === "countdown") {
      if (countdown > 0) {
        playSound("type");
        const t = setTimeout(() => setCountdown(c => c - 1), 800);
        return () => clearTimeout(t);
      } else {
        playSound("launch");
        setCurrentWord(getRandomWord());
        setTyped("");
        engine.current.startTime = Date.now();
        setStatus("playing");
      }
    }
  }, [status, countdown, playSound]);

  useEffect(() => {
    if (status === "playing") {
      const t = setInterval(() => {
        setTimeLeft(l => {
          if (l <= 1) {
            setStatus("gameover");
            return 0;
          }
          return l - 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }
  }, [status]);

  useEffect(() => {
    if (status !== "playing") return;
    const focusTimer = setInterval(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearInterval(focusTimer);
  }, [status]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status !== "playing") return;
    const val = e.target.value.toLowerCase().trim();
    
    // Error handling
    if (!currentWord.startsWith(val)) {
      playSound("fail");
      setCombo(0);
      setSpeedMultiplier(1);
      engine.current.targetVelocity = Math.max(5, engine.current.targetVelocity - 10);
      engine.current.warpColor = "255, 0, 0"; // Red error flash
      engine.current.shake = 15;
      return;
    }

    setTyped(val);
    playSound("type");

    // Word completed
    if (val === currentWord) {
      playSound("boost");
      const nextWords = wordsCompleted + 1;
      const nextCombo = combo + 1;
      setWordsCompleted(nextWords);
      setCombo(nextCombo);
      setTyped("");
      setCurrentWord(getRandomWord(currentWord));

      // WPM calculation
      const elapsedMins = (Date.now() - engine.current.startTime) / 60000;
      setWpm(Math.round(nextWords / elapsedMins));

      // Speed boost
      const newMult = Math.min(5, 1 + nextCombo * 0.2);
      setSpeedMultiplier(newMult);
      engine.current.targetVelocity = 10 + (newMult * 15);
      
      // Upgrade color on high combos
      if (nextCombo > 10) engine.current.warpColor = "57, 255, 20"; // Neon Green Level 999
      else if (nextCombo > 5) engine.current.warpColor = "0, 255, 255"; // Cyan Boost
      else engine.current.warpColor = "200, 0, 255"; // Base Purple

      engine.current.shake = 5;
    }
  };

          // Render Engine (3D Warp Tunnel)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf: number;
    const loop = () => {
      const eng = engine.current;
      ctx.fillStyle = "rgba(4, 2, 10, 0.1)"; // Trail effect (Optimized Motion Blur for longer trails)
      ctx.fillRect(0, 0, eng.width, eng.height);

      // Central Nebula Warp Hole Glow
      const grd = ctx.createRadialGradient(eng.width/2, eng.height/2, 0, eng.width/2, eng.height/2, eng.width/2.5);
      grd.addColorStop(0, `rgba(${eng.warpColor}, 0.08)`);
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, eng.width, eng.height);

      if (status === "idle" || status === "gameover") {
        eng.targetVelocity = 2; // slow drift
      }

      // Smooth velocity interpolation
      eng.velocity += (eng.targetVelocity - eng.velocity) * 0.05;

      // Camera shake
      let cx = eng.width / 2;
      let cy = eng.height / 2;
      if (eng.shake > 0.1) {
        cx += (Math.random() - 0.5) * eng.shake;
        cy += (Math.random() - 0.5) * eng.shake;
        eng.shake *= 0.8;
      }

      // Fade back to normal color slowly if it was red error
      if (eng.warpColor === "255, 0, 0" && Math.random() > 0.9) {
          eng.warpColor = "200, 0, 255";
      }

      // Render 3D Particles
      const fov = 300;
      ctx.save();
      ctx.translate(cx, cy);

      for (let i = 0; i < eng.particles.length; i++) {
        const p = eng.particles[i];
        p.z -= eng.velocity;

        // Reset particle if it passes camera
        if (p.z < 1) {
          p.z = 2000;
          p.x = (Math.random() - 0.5) * 2000;
          p.y = (Math.random() - 0.5) * 2000;
        }

        // 3D to 2D Projection
        const scale = fov / p.z;
        const x2d = p.x * scale;
        const y2d = p.y * scale;

        // Draw Line (Hyper-speed effect)
        const prevScale = fov / (p.z + eng.velocity * 2); // stretch based on speed
        const prevX = p.x * prevScale;
        const prevY = p.y * prevScale;

        const alpha = Math.min(1, Math.max(0, 1 - (p.z / 2000)));

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x2d, y2d);
        
        ctx.lineWidth = scale * 2 + 1;
        ctx.strokeStyle = `rgba(${eng.warpColor}, ${alpha})`;
        ctx.lineCap = "round";
        ctx.stroke();

        // Glow
        if (eng.velocity > 20) {
            ctx.shadowColor = `rgba(${eng.warpColor}, 1)`;
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
      }
      ctx.restore();

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status]);

  return (
    <div className="relative w-full h-full bg-[#04020a] overflow-hidden flex flex-col items-center justify-center font-mono" onClick={() => inputRef.current?.focus()}>
      {/* 3D Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${status === 'idle' ? 'opacity-30' : 'opacity-100'}`}
      />

      {/* Epic CRT Scanlines Overlay */}
      <div className="pointer-events-none absolute inset-0 z-[100] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] mix-blend-overlay"></div>

      {/* Hidden Input field */}
      {status === "playing" && (
        <input 
          ref={inputRef}
          className="fixed top-0 left-0 w-px h-px opacity-0 pointer-events-none -z-50"
          value={typed}
          onChange={handleInput}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-form-type="other"
          data-1p-ignore="true"
        />
      )}

      {/* HUD - Strictly minimal */}
      {status === "playing" && (
        <>
          {/* Top Info Bar */}
          <div className="absolute top-8 w-full max-w-4xl px-8 flex justify-between items-center z-20">
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs font-black tracking-widest uppercase mb-1">Target Velocity</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{wpm}</span>
                <span className="text-sm text-cyan-400 font-bold tracking-widest">WPM</span>
              </div>
            </div>
            
            <div className="flex bg-[#04020a]/80 backdrop-blur-md border border-cyan-500/30 px-6 py-2 rounded-xl items-center gap-3 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
              <Timer className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`} />
              <span className={`text-2xl font-black tabular-nums tracking-widest ${timeLeft <= 10 ? 'text-red-500 drop-shadow-[0_0_10px_red]' : 'text-white'}`}>{timeLeft}s</span>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-gray-500 text-xs font-black tracking-widest uppercase mb-1">Words Decrypted</span>
              <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{wordsCompleted}</span>
            </div>
          </div>

          {/* Central Target Reticle */}
          <div className="z-20 flex flex-col items-center justify-center mt-[-100px]">
            {/* Speed Multiplier Badge */}
            <div className={`mb-4 px-6 py-1.5 rounded-sm border bg-[#04020a]/80 backdrop-blur transition-all duration-300 ${combo > 10 ? 'border-[#39FF14] text-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.4)]' : combo > 5 ? 'border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'border-purple-500/50 text-purple-400'}`}>
              <span className="text-xs font-black tracking-[0.4em] uppercase flex items-center gap-2">
                <Zap className={`w-3 h-3 fill-current ${combo > 10 && 'animate-pulse'}`}/>
                Mach {speedMultiplier.toFixed(1)}
              </span>
            </div>

            {/* The Text Viewer */}
            <div className="flex items-center gap-6 mt-4">
              {/* Left Futuristic Bracket */}
              <div className={`hidden sm:block w-8 h-[70px] border-l-4 border-y-4 rounded-l-xl transition-colors duration-300 ${combo > 10 ? 'border-[#39FF14]/50 shadow-[0_0_20px_rgba(57,255,20,0.3)]' : combo > 5 ? 'border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'border-purple-500/30'}`}></div>

              <div className="relative">
                {/* Ghost string */}
                <div className="absolute inset-0 flex text-7xl font-black tracking-[0.14em] text-white/5 blur-[2px]">
                  {currentWord.toUpperCase()}
                </div>
                
                {/* Actual typing string */}
                <div className="relative flex text-7xl font-black tracking-[0.14em] drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                  {currentWord.split('').map((char, i) => {
                    const isTyped = i < typed.length;
                    const isCurrent = i === typed.length;
                    
                    return (
                      <span 
                        key={i} 
                        className={`
                          transition-all duration-100
                          ${isTyped ? 'text-cyan-400 drop-shadow-[0_0_20px_rgba(0,255,255,0.8)]' : 'text-white/20'}
                          ${isCurrent ? 'text-white animate-pulse border-b-8 border-cyan-400 scale-110 -translate-y-1' : 'border-b-8 border-transparent'}
                        `}
                      >
                        {char.toUpperCase()}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Right Futuristic Bracket */}
              <div className={`hidden sm:block w-8 h-[70px] border-r-4 border-y-4 rounded-r-xl transition-colors duration-300 ${combo > 10 ? 'border-[#39FF14]/50 shadow-[0_0_20px_rgba(57,255,20,0.3)]' : combo > 5 ? 'border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'border-purple-500/30'}`}></div>
            </div>
          </div>

          {/* Player Ship / Dashboard (CSS DOM Layer) */}
          <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none z-30 perspective-[1000px] flex justify-center items-end">
             {/* Simple Glass Cockpit */}
             <div className="w-[600px] h-[150px] relative">
                {/* Dashboard Arch */}
                <div className="absolute bottom-0 w-full h-[150px] border-t-4 border-cyan-400/50 bg-gradient-to-t from-[#04020a] to-[#04020a]/20 backdrop-blur-md rounded-t-[50%] shadow-[0_-20px_50px_rgba(0,255,255,0.15)] flex items-center justify-center">
                   {/* Center Console */}
                   <div className="w-56 h-36 mt-12 border-t-[3px] border-x-[3px] border-cyan-500/30 bg-black/80 rounded-t-[2rem] flex flex-col items-center pt-5 shadow-[inset_0_15px_30px_rgba(0,0,0,1)] relative overflow-hidden">
                      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                      <Activity className={`w-10 h-10 ${combo > 10 ? 'text-[#39FF14] animate-pulse drop-shadow-[0_0_15px_#39FF14]' : combo > 5 ? 'text-cyan-400 animate-[pulse_0.5s_ease-in-out_infinite] drop-shadow-[0_0_10px_cyan]' : 'text-purple-500 drop-shadow-[0_0_10px_purple]'}`} />
                      <div className="mt-3 text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase">Reactor Core</div>
                   </div>
                </div>
             </div>
          </div>
        </>
      )}

      {/* Menus */}
      {(status === "idle" || status === "gameover") && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#04020A]/60 backdrop-blur-sm">
          <div className="text-center">
            {status === "idle" ? (
              <>
                <div className="w-24 h-24 mx-auto mb-6 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(200,0,255,0.2)]">
                  <Zap className="w-12 h-12 text-cyan-400 fill-cyan-400" />
                </div>
                <h1 className="text-6xl font-black text-white tracking-[0.2em] mb-4">Warp<span className="text-cyan-400">Sprint</span></h1>
                <p className="text-gray-400 text-sm tracking-widest uppercase mb-12">The 3D Quantum Slipstream</p>
                
                <Button onClick={initGame} variant="primary" size="lg" className="w-64 h-16 bg-cyan-500 hover:bg-cyan-400 text-white font-black tracking-widest text-lg shadow-[0_0_30px_rgba(0,255,255,0.4)]">
                  <Play className="w-6 h-6 mr-2 fill-current" /> INITIATE JUMP
                </Button>
              </>
            ) : (
              <>
                <Trophy className="w-24 h-24 mx-auto mb-6 text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,0.5)]" />
                <h2 className="text-4xl font-black text-white tracking-[0.2em] mb-8">JUMP TERMINATED</h2>
                
                <div className="flex gap-8 justify-center mb-12">
                  <div className="bg-black/50 border border-white/10 px-8 py-6 rounded-2xl">
                    <div className="text-gray-500 text-xs font-black tracking-widest uppercase mb-2">Final WPM</div>
                    <div className="text-5xl font-black text-cyan-400 drop-shadow-[0_0_15px_cyan]">{wpm}</div>
                  </div>
                  <div className="bg-black/50 border border-white/10 px-8 py-6 rounded-2xl">
                    <div className="text-gray-500 text-xs font-black tracking-widest uppercase mb-2">Words Clear</div>
                    <div className="text-5xl font-black text-[#39FF14]">{wordsCompleted}</div>
                  </div>
                </div>

                <Button onClick={initGame} variant="primary" size="lg" className="w-64 h-16 bg-purple-600 hover:bg-purple-500 text-white font-black tracking-widest text-lg shadow-[0_0_30px_rgba(200,0,255,0.4)]">
                  JUMP AGAIN
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {status === "countdown" && (
        <div className="z-50 text-[12rem] font-black text-white drop-shadow-[0_0_50px_white]">
          {countdown}
        </div>
      )}
    </div>
  );
}
