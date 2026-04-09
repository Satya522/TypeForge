"use client";

import { useEffect, useRef } from 'react';

/**
 * Canvas-based aurora / northern-lights effect that renders soft, flowing
 * green light beams behind the navbar. Uses requestAnimationFrame for 60fps
 * smooth animation. Respects prefers-reduced-motion.
 */

interface AuroraBeam {
  x: number;
  speed: number;
  width: number;
  hue: number;
  alpha: number;
  offset: number;
}

export default function NavAurora() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect reduced-motion preferences
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let animId: number;
    let time = 0;

    // Generate aurora beams
    const beams: AuroraBeam[] = Array.from({ length: 5 }, (_, i) => ({
      x: 0.12 + i * 0.19,
      speed: 0.18 + Math.random() * 0.12,
      width: 0.14 + Math.random() * 0.1,
      hue: 115 + Math.random() * 25,
      alpha: 0.025 + Math.random() * 0.02,
      offset: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.offsetWidth;
      const h = parent.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const draw = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      for (const beam of beams) {
        const cx = w * (beam.x + Math.sin(time * beam.speed + beam.offset) * 0.1);
        const rw = w * beam.width;
        const alpha = beam.alpha + Math.sin(time * 0.35 + beam.offset) * beam.alpha * 0.5;

        const grad = ctx.createRadialGradient(cx, h * 0.5, 0, cx, h * 0.5, rw);
        grad.addColorStop(0, `hsla(${beam.hue}, 100%, 54%, ${alpha})`);
        grad.addColorStop(0.5, `hsla(${beam.hue}, 100%, 54%, ${alpha * 0.3})`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      time += 0.016;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 rounded-[calc(1.75rem-1px)] mix-blend-screen"
      aria-hidden="true"
    />
  );
}
