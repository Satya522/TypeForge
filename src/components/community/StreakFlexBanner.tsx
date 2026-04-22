'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface StreakFlexBannerProps {
  userName: string
  streakCount: number
  isCurrentUser?: boolean
  onReact?: (emoji: string) => void
}

export function StreakFlexBanner({ userName, streakCount, isCurrentUser = false, onReact }: StreakFlexBannerProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={prefersReducedMotion ? { duration: 0.12 } : undefined}
      className="relative overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-600/10 to-orange-500/5 p-4"
    >
      <motion.div
        animate={prefersReducedMotion ? undefined : { opacity: [0.2, 0.4, 0.2] }}
        transition={prefersReducedMotion ? undefined : { repeat: Infinity, duration: 2 }}
        className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 blur-xl"
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={prefersReducedMotion ? undefined : { scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
              transition={prefersReducedMotion ? undefined : { repeat: Infinity, duration: 1.5 }}
            >
              <Flame size={24} className="text-orange-400" />
            </motion.div>
            <div>
              <p className="font-semibold text-white">
                {isCurrentUser ? 'You hit a' : `${userName} hit a`} {streakCount}-day streak! 🔥
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Keep typing to keep it alive</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">CURRENT STREAK</p>
            <p className="text-2xl font-bold text-orange-400">{streakCount} days</p>
          </div>

          {onReact && (
            <motion.button
              onClick={() => onReact('🔥')}
              className="rounded-full border border-orange-500/30 px-3 py-2 text-sm font-semibold text-orange-400 transition-colors hover:bg-white/10"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            >
              React 🔥
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
