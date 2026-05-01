'use client';

import { motion } from 'framer-motion';

/**
 * MeshGradientHero — A beautiful morphing mesh gradient backdrop.
 * Creates fluid, organic color blobs that slowly animate.
 * Perfect as a hero section background enhancer.
 * Inspired by Apple Music, Arc Browser, and Figma.
 */
export default function MeshGradientHero() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
      aria-hidden="true"
    >
      {/* Primary blue blob */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '55vw',
          height: '55vw',
          maxWidth: '800px',
          maxHeight: '800px',
          top: '-10%',
          left: '-5%',
          background: 'radial-gradient(circle, rgba(79, 141, 253, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Secondary indigo blob */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '45vw',
          height: '45vw',
          maxWidth: '650px',
          maxHeight: '650px',
          top: '15%',
          right: '-10%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 50, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      {/* Accent cyan blob - subtle */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '35vw',
          height: '35vw',
          maxWidth: '500px',
          maxHeight: '500px',
          bottom: '5%',
          left: '20%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%)',
          filter: 'blur(90px)',
        }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />

      {/* Warm accent purple - very subtle */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '30vw',
          height: '30vw',
          maxWidth: '400px',
          maxHeight: '400px',
          top: '40%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.04) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
        animate={{
          scale: [1, 1.2, 0.9, 1],
          opacity: [0.5, 1, 0.6, 0.5],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
    </div>
  );
}
