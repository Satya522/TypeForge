"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, TrendingUp, Target, Zap, Award, Flame, Star, Hexagon, Crosshair, ArrowRight } from 'lucide-react';
import { getLevelFromXp } from '@/hooks/useStreak';

interface SessionResultsProps {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  elapsedMs: number;
  mode: string;
  wpmHistory: number[];
  pb: { wpm: number; accuracy: number };
  newPb: { wpm: boolean; accuracy: boolean };
  streak: number;
  xp: number;
  xpEarned: number;
  onRestart: () => void;
}

// Custom hook to animate numbers counting up
const useCountUp = (end: number, duration: number = 1000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
};

/* ── Confetti particle ── */
function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = ['#39FF14', '#00e87b', '#06b6d4', '#a855f7', '#f59e0b', '#fff'];
    const particles = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height * 0.3,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      alpha: 1,
    }));

    let frame = 0;
    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.rotSpeed;
        p.vy += 0.1; // gravity
        if (frame > 100) p.alpha -= 0.01;
        if (p.alpha <= 0) return;
        ctx!.save();
        ctx!.globalAlpha = p.alpha;
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rot * Math.PI) / 180);
        ctx!.shadowColor = p.color;
        ctx!.shadowBlur = 10;
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
        ctx!.restore();
      });
      frame++;
      if (frame < 200) rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-50 rounded-2xl"
    />
  );
}

function WpmSparkline({ data }: { data: number[] }) {
  if (!data.length) return null;
  const W = 400; const H = 100;
  const min = Math.max(0, Math.min(...data) - 10);
  const max = Math.max(...data, 10);
  const range = max - min;
  
  const points = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * W;
    const y = H - ((v - min) / (range || 1)) * H * 0.8;
    return `${x},${y}`;
  });

  const pathStr = points.join(' L');
  const areaPath = `M0,${H} L${pathStr} L${W},${H} Z`;

  return (
    <div className="w-full h-full relative flex items-center bg-[#030504] rounded-xl overflow-hidden border border-[#39FF14]/10 shadow-[inset_0_0_30px_rgba(57,255,20,0.05)]">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)', backgroundSize: '20px 20px', transform: 'scale(1.5)' }} />

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(57,255,20,0.8)]" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#39FF14" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#39FF14" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
             <stop offset="0%" stopColor="#00e87b" />
             <stop offset="50%" stopColor="#39FF14" />
             <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        
        <path d={areaPath} fill="url(#areaFade)" />
        <path d={`M${pathStr}`} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M${pathStr}`} fill="none" stroke="#39FF14" strokeWidth="8" className="opacity-40 blur-md" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, sub, color, icon: Icon, isPb, delay }: {
  label: string; value: number; sub?: string; color: string;
  icon: any; isPb?: boolean; delay: number;
}) {
  const animatedValue = useCountUp(value, 1500);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      className="relative flex flex-col p-5 rounded-2xl overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
      style={{
        background: `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.4) 100%)`,
        border: `1px solid ${color}33`,
        boxShadow: `0 8px 32px ${color}15, inset 0 0 0 1px ${color}10`,
      }}
    >
      {/* Glow Hover Background */}
      <div 
        className="absolute -inset-20 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      />
      
      {isPb && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(255,215,0,0.5)] animate-pulse"
          style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.5)' }}>
          <Star className="w-3 h-3" /> PB
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-2 relative z-10">
        <div className="p-1.5 rounded-lg" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-[11px] text-gray-400 uppercase tracking-[0.2em] font-bold">{label}</span>
      </div>
      
      <div className="flex items-baseline gap-1 relative z-10">
        <span className="text-4xl md:text-5xl font-black tracking-tighter" style={{ color, textShadow: `0 0 30px ${color}60` }}>
          {animatedValue}
        </span>
        {label === "Accuracy" && <span className="text-2xl font-bold" style={{ color }}>%</span>}
        {label === "Streak" && <span className="text-2xl font-bold" style={{ color }}>🔥</span>}
      </div>
      
      {sub && <span className="text-xs text-gray-500 mt-2 font-medium tracking-wide relative z-10">{sub}</span>}
    </motion.div>
  );
}

export default function SessionResults({
  wpm, rawWpm, accuracy, errors, elapsedMs, mode, wpmHistory,
  pb, newPb, streak, xp, xpEarned, onRestart,
}: SessionResultsProps) {
  const [confetti, setConfetti] = useState(false);
  const levelInfo = getLevelFromXp(xp);
  
  const displayWpm = Math.round(wpm);
  const animatedXpEarned = useCountUp(xpEarned, 2000);

  useEffect(() => {
    if (newPb.wpm || newPb.accuracy || wpm >= 80) {
      setTimeout(() => setConfetti(true), 400);
    }
  }, [newPb.wpm, newPb.accuracy, wpm]);

  const mins = Math.floor(elapsedMs / 60000);
  const secs = Math.floor((elapsedMs % 60000) / 1000);
  const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-5xl mx-auto h-full flex flex-col justify-start items-center gap-8 p-6 overflow-y-auto custom-scrollbar"
    >
      <ConfettiCanvas active={confetti} />

      {/* Main Container Glass */}
      <div className="w-full flex-1 bg-[#0A0D0B]/80 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8),_inset_0_1px_0_rgba(255,255,255,0.1)] p-8 md:p-12 relative overflow-hidden flex flex-col justify-center">
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Title Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="text-center relative z-10 mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">
            <Hexagon className="w-3.5 h-3.5 text-[#39FF14]" /> {mode} • {durationStr}
          </div>
          <h2 className="text-6xl md:text-7xl font-black tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #FFF 0%, #39FF14 50%, #00e87b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(57,255,20,0.3))'
            }}>
            {wpm >= 100 ? 'GODLIKE' : wpm >= 80 ? 'INCREDIBLE' : wpm >= 50 ? 'GREAT JOB' : 'SESSION COMPLETE'}
          </h2>
        </motion.div>

        {/* Core Stats Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-10 mb-8">
          <StatCard label="WPM" value={displayWpm} sub={`Raw WPM: ${rawWpm}`} color="#39FF14" icon={Zap} isPb={newPb.wpm} delay={0.2} />
          <StatCard label="Accuracy" value={accuracy} sub={`Errors: ${errors}`} color="#06b6d4" icon={Crosshair} isPb={newPb.accuracy} delay={0.3} />
          <StatCard label="Streak" value={streak} sub="Consecutive Days" color="#f59e0b" icon={Flame} delay={0.4} />
          <StatCard label="XP Earned" value={xpEarned} sub={`Total XP: ${xp}`} color="#a855f7" icon={Award} delay={0.5} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 mb-10 w-full flex-1 min-h-[200px]">
          {/* WPM Sparkline (Takes 2 columns) */}
          {wpmHistory.length > 2 ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
              className="lg:col-span-2 w-full h-full rounded-2xl p-6 flex flex-col border border-white/5 bg-black/40 backdrop-blur-md shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#39FF14]" />
                  <span className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">Velocity Over Time</span>
                </div>
              </div>
              <div className="flex-1 w-full relative">
                <WpmSparkline data={wpmHistory} />
              </div>
            </motion.div>
          ) : <div className="lg:col-span-2"></div>}

          {/* Level / XP Progress Box */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
            className="w-full h-full rounded-2xl p-6 flex flex-col justify-center border border-purple-500/20 bg-purple-950/10 backdrop-blur-md shadow-[inset_0_0_40px_rgba(168,85,247,0.05)] relative overflow-hidden group"
          >
            {/* Glowing orb behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-500/20 blur-[50px] rounded-full pointer-events-none group-hover:bg-purple-500/30 transition-colors duration-500" />
            
            <div className="relative z-10 text-center mb-6">
              <Award className="w-12 h-12 text-purple-400 mx-auto mb-3 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]" />
              <div className="text-4xl font-black text-white">{levelInfo.level}</div>
              <div className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mt-1">Current Tier</div>
            </div>

            <div className="relative z-10 w-full mb-3">
              <div className="flex justify-between text-xs text-gray-400 font-medium mb-2">
                <span>{levelInfo.xp} XP</span>
                <span>{levelInfo.nextLevelXp} XP</span>
              </div>
              <div className="w-full h-3 rounded-full bg-black/60 border border-white/5 overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progress}%` }}
                  transition={{ duration: 1.5, delay: 0.8, type: 'spring' }}
                  className="h-full rounded-full relative"
                  style={{ background: 'linear-gradient(90deg, #9333ea, #d8b4fe)' }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(-45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
                </motion.div>
              </div>
            </div>
            
            <div className="text-center relative z-10">
              <div className="inline-flex border border-purple-500/30 bg-purple-900/30 px-3 py-1 rounded-full text-purple-300 text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                +{animatedXpEarned} XP Earned
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10"
        >
           {/* Personal Best message */}
          <div className="flex-1">
            <AnimatePresence>
              {(newPb.wpm || newPb.accuracy) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_30px_rgba(255,215,0,0.15)]"
                  style={{ background: 'linear-gradient(90deg, rgba(255,215,0,0.1) 0%, transparent 100%)', borderLeft: '3px solid #FFD700', color: '#FFF' }}
                >
                  <Star className="w-5 h-5 text-[#FFD700] fill-[#FFD700]" />
                  Mighty effort! You smashed a personal best.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onRestart}
            className="group relative flex items-center gap-3 px-8 py-4 rounded-xl font-bold transition-all active:scale-95 overflow-hidden"
            style={{ background: '#39FF14' }}
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            <span className="text-black uppercase tracking-widest text-sm relative z-10">Next Session</span>
            <ArrowRight className="w-5 h-5 text-black relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

      </div>
    </motion.div>
  );
}
