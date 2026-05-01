'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { motionDistances, motionDurations, motionEasing } from './tokens'

type RouteTransitionShellProps = {
  children: React.ReactNode
}

export function RouteTransitionShell({ children }: RouteTransitionShellProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence initial={false} mode="sync">
      <motion.div
        key={pathname}
        initial={
          prefersReducedMotion
            ? { opacity: 0 }
            : { opacity: 0, y: motionDistances.sm }
        }
        animate={{ opacity: 1, y: 0 }}
        exit={
          prefersReducedMotion
            ? { opacity: 0 }
            : { opacity: 0, y: -motionDistances.sm }
        }
        transition={{
          duration: prefersReducedMotion
            ? motionDurations.fast
            : motionDurations.medium,
          ease: motionEasing.premium,
        }}
        className="flex min-h-screen flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
