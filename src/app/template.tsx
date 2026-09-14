'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { motionDistances, motionDurations, motionEasing } from '@/components/motion/tokens';

/**
 * Next.js App Router `template.tsx` — re-mounts on every route change.
 * Provides a lightweight fade-in entrance animation for page transitions.
 * Unlike the old RouteTransitionShell (which used AnimatePresence + exit
 * animations inside a layout), this approach is fully compatible with the
 * App Router because template.tsx is designed to re-mount on navigation.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        prefersReducedMotion ? { opacity: 0.6 } : { opacity: 0, y: motionDistances.sm }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? motionDurations.fast : motionDurations.medium,
        ease: motionEasing.premium,
      }}
      className="flex min-h-screen flex-col"
    >
      {children}
    </motion.div>
  );
}
