'use client';

import { motion } from 'framer-motion';

/**
 * GlowingOrb — A large, softly animated ambient light orb.
 * Use to add cinematic depth to hero/landing sections.
 * Animates position, scale and opacity organically.
 */
interface GlowingOrbProps {
  /** CSS color, e.g. 'rgba(79, 141, 253, 0.12)' */
  color?: string;
  /** Size in px */
  size?: number;
  /** CSS position: top */
  top?: string;
  /** CSS position: left */
  left?: string;
  /** Animation delay in seconds */
  delay?: number;
  /** Blur radius in px */
  blur?: number;
}

export default function GlowingOrb({
  color = 'rgba(79, 141, 253, 0.1)',
  size = 500,
  top = '20%',
  left = '50%',
  delay = 0,
  blur = 140,
}: GlowingOrbProps) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{
        width: size,
        height: size,
        top,
        left,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.6, 1, 0.6],
        x: [0, 30, -20, 0],
        y: [0, -25, 15, 0],
      }}
      transition={{
        duration: 12 + Math.random() * 6,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      aria-hidden="true"
    />
  );
}
