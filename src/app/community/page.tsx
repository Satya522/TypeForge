"use client";

import { motion } from 'framer-motion';
import { MessageCircle, Users, Zap, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function CommunityPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      hue: Math.random() * 30 + 110,
      pulse: Math.random() * Math.PI * 2,
    }));
    function animate() {
      ctx!.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.015;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${p.hue}, 100%, 65%, ${a})`;
        ctx!.fill();
      });
      animId = requestAnimationFrame(animate);
    }
    animate();
    const handleResize = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#000000' }}>

      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-50" />

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[160px] -top-40 -left-40"
          style={{ background: 'rgba(57,255,20,0.06)' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[140px] -bottom-40 -right-40"
          style={{ background: 'rgba(139,92,246,0.05)' }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(57,255,20,0.04) 0%, transparent 60%)' }} />
      </div>

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(57,255,20,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Back button */}
      <Link href="/"
        className="absolute top-24 left-8 flex items-center gap-2 text-gray-500 hover:text-accent-300 transition-colors text-sm group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 24, delay: 0.1 }}
        className="relative z-10 text-center px-8 max-w-xl mx-auto"
      >
        {/* Icon cluster */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.25 }}
          className="relative w-28 h-28 mx-auto mb-8"
        >
          {/* Glow behind icon */}
          <div className="absolute inset-0 rounded-full blur-2xl"
            style={{ background: 'rgba(57,255,20,0.2)' }} />

          {/* Lock overlay badge */}
          <motion.div
            animate={{ rotate: [0, -6, 6, -4, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="absolute -top-2 -right-2 z-10 w-9 h-9 rounded-full flex items-center justify-center border border-white/10"
            style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(8px)' }}>
            <Lock className="w-4 h-4 text-yellow-400" />
          </motion.div>

          {/* Main icon box */}
          <div className="relative w-28 h-28 rounded-[2rem] flex items-center justify-center border border-accent-300/25 shadow-[0_0_60px_rgba(57,255,20,0.18),inset_0_0_30px_rgba(57,255,20,0.06)]"
            style={{ background: 'rgba(5,7,5,0.95)' }}>
            <MessageCircle className="w-14 h-14 text-accent-300 drop-shadow-[0_0_20px_rgba(57,255,20,0.7)]" />
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-300/25 mb-6 text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{ background: 'rgba(57,255,20,0.06)', color: '#39ff14' }}>
          <Zap className="w-3 h-3" />
          Coming Soon
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl font-black text-white mb-4 leading-tight tracking-tight"
        >
          Community<br />
          <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', background: 'linear-gradient(135deg, #39ff14 0%, #bcff9d 50%, #fff 100%)', backgroundClip: 'text' }}>
            Hub
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 text-[15px] leading-relaxed mb-10 max-w-sm mx-auto"
        >
          Real-time chat, typing races, leaderboards, and a community of speed-demons — currently being polished to perfection.
        </motion.p>

        {/* Feature previews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-3 mb-10"
        >
          {[
            { icon: MessageCircle, label: 'Live Chat', desc: 'Real-time messaging' },
            { icon: Users, label: 'Members', desc: 'Online community' },
            { icon: Zap, label: 'Races', desc: 'Type to compete' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label}
              className="p-4 rounded-2xl border border-white/[0.06] text-center"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center"
                style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.15)' }}>
                <Icon className="w-4 h-4" style={{ color: '#39ff14' }} />
              </div>
              <p className="text-[12px] font-bold text-white">{label}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{desc}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA back */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link href="/practice/classic"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold text-black transition-all duration-300 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #39ff14, #00cc44)', boxShadow: '0 0 30px rgba(57,255,20,0.3)' }}>
            <Zap className="w-4 h-4" />
            Keep Typing in the Meantime
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}