'use client';

import { useEffect, useRef } from 'react';

/**
 * CursorGlow — A premium mouse-following ambient light effect.
 * Inspired by Linear.app and Vercel's design language.
 * Renders a subtle radial glow that follows the cursor globally.
 */
export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const visibleRef = useRef(false);

  useEffect(() => {
    // Skip on touch devices
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(pointer: fine)');
    if (!mq.matches) return;

    const el = glowRef.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      if (!visibleRef.current) {
        visibleRef.current = true;
        el.classList.remove('cursor-glow--hidden');
      }
    };

    const handleMouseLeave = () => {
      visibleRef.current = false;
      el.classList.add('cursor-glow--hidden');
    };

    // Smooth interpolation loop (lerp)
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      posRef.current.x = lerp(posRef.current.x, mouseRef.current.x, 0.08);
      posRef.current.y = lerp(posRef.current.y, mouseRef.current.y, 0.08);
      el.style.left = `${posRef.current.x}px`;
      el.style.top = `${posRef.current.y}px`;
      rafRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="cursor-glow cursor-glow--hidden"
      aria-hidden="true"
    />
  );
}
