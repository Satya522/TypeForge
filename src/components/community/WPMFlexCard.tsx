'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Zap, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

type Rank = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Master'

interface WPMFlexCardProps {
  wpm: number
  accuracy: number
  date: Date
  rank?: Rank
  userName: string
  onChallenge?: () => void
  onGhostRace?: () => void
}

const RANK_GRADIENT = {
  Bronze: 'from-orange-600 to-orange-700',
  Silver: 'from-slate-400 to-slate-500',
  Gold: 'from-yellow-400 to-yellow-500',
  Diamond: 'from-cyan-300 to-blue-400',
  Master: 'from-purple-500 to-pink-500',
}

export function WPMFlexCard({
  wpm,
  accuracy,
  date,
  rank = 'Bronze',
  userName,
  onChallenge,
  onGhostRace,
}: WPMFlexCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0.12 } : undefined}
      className="relative overflow-hidden rounded-3xl border border-accent-300/20 bg-gradient-to-br from-black to-[#0a1206] p-4"
    >
      <motion.div
        animate={prefersReducedMotion ? undefined : { opacity: [0.3, 0.65, 0.3] }}
        transition={prefersReducedMotion ? undefined : { repeat: Infinity, duration: 2 }}
        className="pointer-events-none absolute inset-0 rounded-3xl border border-accent-300/20"
      />

      <div className="relative z-10 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Performance Card</p>
            <p className="text-sm text-slate-400">
              Session date {date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          {rank && (
            <div className={cn('px-2 py-1 rounded text-xs font-bold text-white', `bg-gradient-to-r ${RANK_GRADIENT[rank]}`)}>
              {rank}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-white/10">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase">WPM</p>
            <p className="text-3xl font-bold text-accent-300 flex items-center gap-1">
              {wpm}
              <Zap size={24} className="text-accent-300" />
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase">Accuracy</p>
            <p className="text-3xl font-bold text-emerald-300">{accuracy.toFixed(1)}%</p>
          </div>
        </div>

        <p className="text-sm text-slate-300">
          <span className="font-semibold text-white">{userName}</span>
          <span className="text-slate-400"> posted this record</span>
        </p>

        <div className="flex gap-2 pt-2">
          {onChallenge && (
            <motion.button
              onClick={onChallenge}
              className="flex-1 rounded-full border border-accent-300/30 bg-accent-300/15 py-2 text-xs font-semibold text-accent-100 transition-colors hover:bg-accent-300/25"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            >
              Beat This
            </motion.button>
          )}
          {onGhostRace && (
            <motion.button
              onClick={onGhostRace}
              className="flex flex-1 items-center justify-center gap-1 rounded-full border border-white/20 bg-white/10 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            >
              <Zap size={12} />
              Race Ghost
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
