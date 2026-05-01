'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * SmoothScroll — Ultra-smooth inertia scrolling via Lenis.
 * Creates an Apple-like buttery scroll experience.
 * Already a dependency in package.json.
 */
export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect user preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null; // No DOM output — behavior-only
}
