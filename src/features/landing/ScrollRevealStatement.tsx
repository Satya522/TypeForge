"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  useMotionTemplate,
  type MotionValue,
} from 'framer-motion';
import { useEffect, useRef, type RefObject } from 'react';

const statement =
  '“Typing starts to feel different when every mistake becomes feedback, every lesson becomes rhythm, and speed finally catches up with your focus.”';

const words = statement.split(' ');

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function useElementRevealProgress(sectionRef: RefObject<HTMLElement>) {
  const progress = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      progress.set(1);
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const startLine = viewportHeight * 0.82;
      const endLine = viewportHeight * 0.32;
      const revealDistance = startLine - (endLine - rect.height);

      progress.set(clamp((startLine - rect.top) / revealDistance));
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [progress, sectionRef, shouldReduceMotion]);

  return progress;
}

function RevealWord({
  children,
  index,
  progress,
  total,
}: {
  children: string;
  index: number;
  progress: MotionValue<number>;
  total: number;
}) {
  // Strict word-by-word reveal
  const step = 1 / total;
  const start = index * step;
  // A tiny bit of overlap (1.2x step) so it feels smooth but strictly sequential
  const end = Math.min(start + (step * 1.2), 1);

  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  const y = useTransform(progress, [start, end], [12, 0]);
  const color = useTransform(progress, [start, end], ['#ffffff', '#4f8dfd']);

  return (
    <motion.span
      className="inline-block pr-[0.18em]"
      style={{ opacity, y, color }}
    >
      {children}
    </motion.span>
  );
}

export default function ScrollRevealStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealProgress = useElementRevealProgress(sectionRef);

  return (
    <section
      id="typeforge-method"
      ref={sectionRef}
      className="relative isolate scroll-mt-32 bg-black py-24 sm:py-32"
      aria-label="TypeForge scroll reveal statement"
    >
      <div className="section-shell">
        <div className="relative w-full overflow-hidden px-5 py-14 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.4) 1px, transparent 0)',
              backgroundSize: '24px 24px',
              maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 80%)',
            }}
          />
          
          <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-accent-300/[0.04] blur-3xl" />

          <div className="relative mx-auto max-w-6xl text-center">
            <div className="mb-8 inline-flex rounded-full border border-accent-300/20 bg-accent-300/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent-300 shadow-sm">
              TypeForge Method
            </div>
            <h2 className="text-balance font-display-premium text-[clamp(1.75rem,4vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.04em]">
              {words.map((word, index) => (
                <RevealWord
                  key={`${word}-${index}`}
                  index={index}
                  progress={revealProgress}
                  total={words.length}
                >
                  {word}
                </RevealWord>
              ))}
            </h2>

          </div>
        </div>
      </div>
    </section>
  );
}
