'use client'

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion'
import { useState } from 'react'

export function ScrollProgressChrome() {
  const prefersReducedMotion = useReducedMotion()
  const { scrollY, scrollYProgress } = useScroll()
  const [isActive, setIsActive] = useState(false)

  const progress = useSpring(scrollYProgress, {
    stiffness: prefersReducedMotion ? 180 : 130,
    damping: prefersReducedMotion ? 36 : 28,
    mass: 0.24,
  })

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsActive(latest > 18)
  })

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[58] h-px bg-white/10"
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-14 bg-gradient-to-b from-accent-300/[0.12] via-accent-300/[0.04] to-transparent"
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        aria-hidden="true"
        data-scroll-progress-bar="true"
        className="pointer-events-none fixed left-0 top-0 z-[61] h-[3px] w-full origin-left bg-[linear-gradient(90deg,rgba(79,141,253,0.95)_0%,rgba(130,109,255,0.85)_54%,rgba(255,255,255,0.92)_100%)] shadow-[0_0_24px_rgba(79,141,253,0.4)]"
        style={{ scaleX: progress }}
      />
    </>
  )
}
