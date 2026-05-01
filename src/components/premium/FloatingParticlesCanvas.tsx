'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  baseOpacity: number;
  pulse: number;
  pulseSpeed: number;
}

/**
 * FloatingParticlesCanvas — An interactive canvas-based particle field.
 * Particles gently float and brighten near the mouse cursor.
 * Inspired by Stripe's and Vercel's landing pages.
 */
export default function FloatingParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const dimensionsRef = useRef({ w: 0, h: 0 });

  const initParticles = useCallback((w: number, h: number) => {
    const count = Math.min(Math.floor((w * h) / 18000), 80);
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
        opacity: 0,
        baseOpacity: Math.random() * 0.3 + 0.1,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      dimensionsRef.current = { w, h };
      particlesRef.current = initParticles(w, h);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    document.addEventListener('mousemove', handleMouse, { passive: true });

    const draw = () => {
      const { w, h } = dimensionsRef.current;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particlesRef.current) {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Pulse
        p.pulse += p.pulseSpeed;
        const pulseFactor = 0.5 + 0.5 * Math.sin(p.pulse);

        // Mouse proximity glow
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;
        const proximity = dist < maxDist ? 1 - dist / maxDist : 0;

        p.opacity = p.baseOpacity * (0.6 + 0.4 * pulseFactor) + proximity * 0.5;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + proximity * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 141, 253, ${p.opacity})`;
        ctx.fill();

        // Draw glow on hover proximity
        if (proximity > 0.3) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(79, 141, 253, ${proximity * 0.08})`;
          ctx.fill();
        }
      }

      // Draw connections between close particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.08;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(79, 141, 253, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(rafRef.current);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[-50]"
      aria-hidden="true"
      style={{ opacity: 0.7 }}
    />
  );
}
