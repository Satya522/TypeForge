"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Crosshair, Zap, Trophy, Play, Rocket } from 'lucide-react';

interface FlyingLetter {
  id: number;
  char: string;
  x: number;
  y: number;
  speed: number;
  size: number;
  color: string;
  glow: string;
  opacity: number;
  rot: number;
  rotSpeed: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

interface LaserBeam {
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

export default function LetterGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Game States
  const [status, setStatus] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hp, setHp] = useState(100);

  // Mutable Game Engine State
  const engine = useRef({
    letters: [] as FlyingLetter[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    lasers: [] as LaserBeam[],
    lastLetterSpawn: 0,
    spawnInterval: 1200,
    baseSpeed: 1.5,
    frames: 0,
    screenShake: 0,
    score: 0,
    combo: 0,
    hp: 100,
    width: 800,
    height: 500,
    idCounter: 0,
    rafId: 0,
    gridOffset: 0
  }).current;

  // Sync state to ref so handler can access latest
  useEffect(() => {
    engine.score = score;
    engine.combo = combo;
    engine.hp = hp;
  }, [score, combo, hp, engine]);

  // Handle Resize
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const { clientWidth, clientHeight } = container;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = clientWidth * dpr;
    canvas.height = clientHeight * dpr;
    engine.width = clientWidth;
    engine.height = clientHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, [engine]);

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Audio Engine
  const playSound = useCallback((type: 'laser' | 'error' | 'start' | 'gameover') => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        return;
      }
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    
    if (type === 'laser') {
      // High pitched PEW
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'error') {
      // Harsh low buzz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'start') {
      // Ascending sequence
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'gameover') {
      // Descending sad tone
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.8);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  }, []);

  // Start the Game
  const startGame = useCallback(() => {
    playSound('start');
    setScore(0);
    setCombo(0);
    setHp(100);
    engine.score = 0;
    engine.combo = 0;
    engine.hp = 100;
    engine.letters = [];
    engine.particles = [];
    engine.floatingTexts = [];
    engine.lasers = [];
    engine.frames = 0;
    engine.spawnInterval = 1200;
    engine.baseSpeed = 1.0;
    engine.gridOffset = 0;
    setStatus('playing');
    
    setTimeout(resizeCanvas, 10);
  }, [engine, resizeCanvas, playSound]);

  // Core Game Loop
  useEffect(() => {
    if (status !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;
      engine.frames++;
      engine.gridOffset += 1; // Moving cyber grid

      // Difficulty progression
      const diffMultiplier = 1 + (engine.frames / 5000);
      engine.spawnInterval = Math.max(300, 1500 / diffMultiplier);
      const currentSpeed = engine.baseSpeed * (0.8 + diffMultiplier * 0.2);

      // Spawn new letter logic
      if (time - engine.lastLetterSpawn > engine.spawnInterval) {
        engine.lastLetterSpawn = time;
        const char = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        const isGolden = Math.random() > 0.95;
        const isDanger = Math.random() > 0.85;

        let color = '#39FF14'; 
        let glow = 'rgba(57, 255, 20, 0.5)';
        
        if (isGolden) {
          color = '#F59E0B';
          glow = 'rgba(245, 158, 11, 0.6)';
        } else if (isDanger) {
          color = '#EF4444';
          glow = 'rgba(239, 68, 68, 0.6)';
        }

        const size = Math.random() * 8 + 14;

        engine.letters.push({
          id: ++engine.idCounter,
          char,
          x: Math.random() * (engine.width - size * 2.5) + size * 1.5,
          y: -40,
          speed: currentSpeed + Math.random() * (currentSpeed * 0.5),
          size,
          color,
          glow,
          opacity: 1,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.05
        });
      }

      // Drawing - Vantablack backdrop with motion blur
      ctx.fillStyle = 'rgba(3, 4, 3, 0.4)';
      ctx.fillRect(0, 0, engine.width, engine.height);

      // Screen shake effect
      if (engine.screenShake > 0) {
        ctx.save();
        const dx = (Math.random() - 0.5) * engine.screenShake;
        const dy = (Math.random() - 0.5) * engine.screenShake;
        ctx.translate(dx, dy);
        engine.screenShake -= engine.screenShake * 0.1;
      } else {
        ctx.save();
      }

      // Draw Retro Grid Background
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(57, 255, 20, 0.05)';
      ctx.lineWidth = 1;
      // Vertical lines
      for (let x = 0; x <= engine.width; x += 50) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, engine.height);
      }
      // Horizontal moving lines
      const moveY = engine.gridOffset % 50;
      for (let y = 0; y <= engine.height + 50; y += 50) {
        ctx.moveTo(0, y + moveY - 50);
        ctx.lineTo(engine.width, y + moveY - 50);
      }
      ctx.stroke();
      
      // Render Lasers
      for (let i = engine.lasers.length - 1; i >= 0; i--) {
        const laser = engine.lasers[i];
        laser.life -= 1;
        if (laser.life <= 0) {
          engine.lasers.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        const originX = engine.width / 2;
        const originY = engine.height - 80; // tip of the spaceship (adjusted for UI component)
        ctx.moveTo(originX, originY);
        ctx.lineTo(laser.x, laser.y);
        
        // Premium Laser Shading
        const laserGrad = ctx.createLinearGradient(originX, originY, laser.x, laser.y);
        laserGrad.addColorStop(0, '#FFFFFF'); // Hot white core
        laserGrad.addColorStop(0.3, laser.color);
        laserGrad.addColorStop(1, 'transparent');
        
        ctx.strokeStyle = laserGrad;
        ctx.lineWidth = (laser.life / laser.maxLife) * 8;
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = 25;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Render Letters
      for (let i = engine.letters.length - 1; i >= 0; i--) {
        const letter = engine.letters[i];
        letter.y += letter.speed;
        letter.rot += letter.rotSpeed;

        ctx.save();
        ctx.translate(letter.x, letter.y);
        ctx.rotate(letter.rot);
        
        // High-Tech Outer Orbit Ring
        ctx.beginPath();
        ctx.arc(0, 0, letter.size * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = letter.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.4;
        ctx.setLineDash([8, 6]);
        // Slight counter rotation for the dash
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1.0;

        // Inner Core Geometry (Octagon with counter-spin)
        ctx.beginPath();
        for (let j = 0; j < 8; j++) {
          const angle = (Math.PI / 4) * j - letter.rot * 2; // Counter rotating
          const px = Math.cos(angle) * letter.size;
          const py = Math.sin(angle) * letter.size;
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        
        // Premium Glassmorphic Core Fill
        const bgGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, letter.size);
        bgGrad.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
        bgGrad.addColorStop(1, 'rgba(20, 25, 20, 0.7)');
        ctx.fillStyle = bgGrad;
        ctx.fill();
        
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = letter.color;
        ctx.shadowColor = letter.glow;
        ctx.shadowBlur = 20;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = letter.color;
        ctx.font = `bold ${letter.size * 1.1}px Space Mono, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.rotate(-letter.rot);
        ctx.fillText(letter.char.toUpperCase(), 0, 1);
        ctx.restore();

        // Hit Bottom Detection
        if (letter.y - letter.size > engine.height) {
          engine.letters.splice(i, 1);
          setHp((h) => Math.max(0, h - 5));
          engine.hp -= 5;
          setCombo(0);
          engine.combo = 0;
          engine.screenShake = 15;
          playSound('error');
          spawnFloatingText(letter.x, engine.height - 20, "MISSED", "#EF4444");

          if (engine.hp <= 0) {
            setStatus('gameover');
            playSound('gameover');
            return;
          }
        }
      }

      // Render Particles
      for (let i = engine.particles.length - 1; i >= 0; i--) {
        const p = engine.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // Gravity
        p.life -= 1;
        p.size *= 0.96;

        if (p.life <= 0) {
          engine.particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10 * (p.life / p.maxLife);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Render Floating Text
      for (let i = engine.floatingTexts.length - 1; i >= 0; i--) {
        const ft = engine.floatingTexts[i];
        ft.y -= 1.5;
        ft.life -= 1;
        
        if (ft.life <= 0) {
          engine.floatingTexts.splice(i, 1);
          continue;
        }

        ctx.font = "900 16px Inter, monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.life / ft.maxLife;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1.0;
      }

      ctx.restore(); // Restore screen shake
      engine.rafId = requestAnimationFrame(loop);
    };

    engine.rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(engine.rafId);
  }, [status, engine, playSound]);

  // Handle User Input
  useEffect(() => {
    if (status !== 'playing') return;

    const spawnExplosion = (x: number, y: number, color: string) => {
      for (let i = 0; i < 20; i++) {
        engine.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12 - 4, // burst upwards
          life: 30 + Math.random() * 20,
          maxLife: 50,
          color,
          size: Math.random() * 5 + 2
        });
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      
      const key = e.key.toLowerCase();
      let targetIdx = -1;
      let maxY = -100;

      for (let i = 0; i < engine.letters.length; i++) {
        const l = engine.letters[i];
        if (l.char === key && l.y > maxY) {
          maxY = l.y;
          targetIdx = i;
        }
      }

      if (targetIdx !== -1) {
        // HIT
        playSound('laser');
        const hitL = engine.letters.splice(targetIdx, 1)[0];
        const comboMulti = 1 + Math.floor(engine.combo / 10) * 0.5;
        let points = 10;
        
        if (hitL.color === '#F59E0B') points = 50; 
        else if (hitL.color === '#EF4444') points = 25; 
        
        const earned = points * comboMulti;
        
        // Spawn Premium Laser Beam
        const premiumLaserColors = ['#00FFFF', '#FF00FF', '#FFFF00', '#39FF14', '#FF3366', '#A855F7'];
        const randomLaserColor = premiumLaserColors[Math.floor(Math.random() * premiumLaserColors.length)];
        
        engine.lasers.push({
          x: hitL.x,
          y: hitL.y,
          color: randomLaserColor,
          life: 15,
          maxLife: 15
        });
        
        setScore(s => s + earned);
        setCombo(c => c + 1);
        spawnExplosion(hitL.x, hitL.y, hitL.color);
        spawnFloatingText(hitL.x, hitL.y, `+${earned}`, hitL.color);
        
        engine.screenShake = 3; 
      } else {
        // MISS PENALTY
        playSound('error');
        setCombo(0);
        engine.combo = 0;
        engine.screenShake = 8;
        
        // Negative screen flash particle effect
        engine.particles.push({
          x: engine.width / 2, y: engine.height / 2,
          vx: 0, vy: 0,
          life: 10, maxLife: 10,
          color: 'rgba(255,0,0,0.2)', size: engine.width
        });
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status, engine, playSound]);

  const spawnFloatingText = (x: number, y: number, text: string, color: string) => {
    engine.floatingTexts.push({ x, y, text, color, life: 40, maxLife: 40 });
  };

  return (
    <div className="w-full h-full flex justify-center bg-[#030403]">
      <div 
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
      >
        {status !== 'idle' && (
          <canvas 
            ref={canvasRef} 
            className="block w-full h-full"
            style={{ imageRendering: 'pixelated' }}
          />
        )}

        {/* Premium Spaceship Asset (DOM based for high-fidelity glowing/SVG render) */}
        {status === 'playing' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
            {/* Core Turret Body */}
            <div className="relative">
              <div className={`w-16 h-16 rounded-full bg-black/60 border-2 backdrop-blur-xl flex items-center justify-center transition-all duration-300 ${combo > 5 ? 'border-[#39FF14] shadow-[0_0_40px_rgba(57,255,20,0.4)]' : 'border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]'}`}>
                <Rocket className={`w-8 h-8 transition-all duration-300 transform -translate-y-1 ${combo > 5 ? 'text-[#39FF14] animate-pulse drop-shadow-[0_0_10px_#39FF14]' : 'text-gray-400'}`} />
              </div>
              
              {/* Energy Rings */}
              <div className="absolute inset-0 border-2 border-[#39FF14]/30 rounded-full animate-ping opacity-20" style={{ animationDuration: '2s' }} />
              {combo > 5 && (
                <div className="absolute inset-[-10px] border border-[#39FF14]/50 rounded-full animate-pulse shadow-[inset_0_0_20px_rgba(57,255,20,0.2)]" />
              )}
            </div>
            {/* Bottom Thruster Base */}
            <div className={`h-6 w-8 mt-1 rounded-b-xl opacity-80 bg-gradient-to-t transition-all duration-300 ${combo > 5 ? 'from-[#39FF14] to-transparent shadow-[0_10px_30px_#39FF14]' : 'from-yellow-500/50 to-transparent'}`} />
          </div>
        )}

        {/* Scanlines Overlay for retro hacker feel */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-10 opacity-30" />

        {/* HUD Overlay */}
        {status === 'playing' && (
          <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start pointer-events-none z-20">
            <div>
              <p className="text-[#39FF14] text-xs font-bold uppercase tracking-widest mb-1 shadow-[#39FF14]">Score Matrix</p>
              <p className="text-4xl text-white font-black tabular-nums drop-shadow-lg">{score.toLocaleString()}</p>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className={`w-4 h-4 ${hp < 30 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
                <div className="w-32 h-2.5 bg-black rounded-full overflow-hidden border border-white/10 relative">
                  <div 
                    className={`absolute left-0 top-0 h-full transition-all duration-300 ${hp < 30 ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-[#39FF14] shadow-[0_0_10px_#39FF14]'}`}
                    style={{ width: `${hp}%` }}
                  />
                </div>
              </div>
              
              {combo > 5 && (
                <div className="bg-[#39FF14]/10 border border-[#39FF14]/30 px-3 py-1 rounded-full flex items-center gap-2 animate-pulse shadow-[0_0_20px_rgba(57,255,20,0.2)]">
                  <Zap className="w-3.5 h-3.5 text-[#39FF14] fill-current" />
                  <span className="text-[#39FF14] font-black text-xs tracking-wider">{combo}x COMBO</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Start / Game Over Screens */}
        {status !== 'playing' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#030403]/80 backdrop-blur-xl p-6">
            {status === 'idle' ? (
              <div className="text-center space-y-6 max-w-lg">
                <div className="w-20 h-20 bg-gradient-to-b from-[#39FF14]/20 to-transparent border border-[#39FF14]/40 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(57,255,20,0.3)]">
                  <Crosshair className="w-10 h-10 text-[#39FF14]" />
                </div>
                <h2 className="text-5xl font-black text-white tracking-tight uppercase">Letter Rain<span className="text-[#39FF14]">.</span></h2>
                <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
                  Audio-visual typing mainframe. Destruct falling neural-nodes by typing their cryptographic characters. Do not let your shields deplete. Enable sound for max intensity.
                </p>
                <div className="pt-4">
                  <Button 
                    onClick={startGame} 
                    variant="primary" 
                    size="lg" 
                    className="w-full h-16 text-xl font-black tracking-widest uppercase group overflow-hidden shadow-[0_0_40px_rgba(57,255,20,0.2)] hover:shadow-[0_0_60px_rgba(57,255,20,0.4)]"
                  >
                    <Play className="w-6 h-6 mr-3 fill-current transition-transform group-hover:scale-125" />
                    Initiate Sequence
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-8 max-w-md animate-in zoom-in duration-300">
                <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-2 drop-shadow-[0_0_50px_rgba(234,179,8,0.6)]" />
                <h2 className="text-5xl font-black text-white uppercase tracking-widest">System Failure</h2>
                
                <div className="bg-black/60 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl">
                  <p className="text-gray-400 uppercase tracking-[0.3em] text-xs font-bold mb-3">Final Score</p>
                  <p className="text-7xl text-[#39FF14] font-black drop-shadow-[0_0_30px_rgba(57,255,20,0.4)]">{score.toLocaleString()}</p>
                  <p className="text-gray-500 text-sm mt-4 font-bold">MAX COMBO: {engine.combo}</p>
                </div>

                <Button 
                  onClick={startGame} 
                  variant="secondary" 
                  size="lg" 
                  className="w-full h-14 border-white/10 hover:border-[#39FF14]/50 hover:bg-[#39FF14]/10 hover:text-[#39FF14] uppercase tracking-widest font-bold"
                >
                  Restart Simulation
                </Button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}