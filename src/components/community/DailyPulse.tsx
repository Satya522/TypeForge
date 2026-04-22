'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Zap } from 'lucide-react'

interface DailyPulseProps {
  mostActiveUser: string
  mostActiveWpm: number
  fastestWpm: string
  fastestWpmValue: number
  mostImprovedUser: string
  activeChallengeCount: number
}

export function DailyPulse({
  mostActiveUser,
  mostActiveWpm,
  fastestWpm,
  fastestWpmValue,
  mostImprovedUser,
  activeChallengeCount,
}: DailyPulseProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0.12 } : undefined}
      className="border-0 rounded-none bg-white/[0.035] px-5 py-4"
    >
      <div className="mb-5 flex items-center gap-2">
        <motion.div
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.1, 1] }}
          transition={prefersReducedMotion ? undefined : { repeat: Infinity, duration: 2 }}
        >
          <Zap size={16} className="text-[#22c55e]" />
        </motion.div>
        <h3 className="text-[13px] font-medium uppercase tracking-[0.2em] text-slate-300">Daily Pulse</h3>
        <span className="ml-auto text-[12px] text-slate-500">{new Date().toLocaleDateString()}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-10 gap-y-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Most Active</p>
          <p className="mt-1 text-[15px] font-semibold text-white">{mostActiveUser}</p>
          <p className="mt-1 text-[12px] text-slate-500">{mostActiveWpm} messages today</p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Fastest WPM</p>
          <p className="mt-1 truncate text-[15px] font-semibold text-[#22c55e]">{fastestWpm}</p>
          <p className="mt-1 text-[12px] text-slate-500">{fastestWpmValue} WPM posted</p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Most Improved</p>
          <p className="mt-1 text-[15px] font-semibold text-white">{mostImprovedUser}</p>
          <p className="mt-1 text-[12px] text-slate-500">Strongest gain this week</p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Active Challenges</p>
          <p className="mt-1 text-[15px] font-semibold text-white">{activeChallengeCount}</p>
          <p className="mt-1 text-[12px] text-slate-500">Open race threads right now</p>
        </div>
      </div>
    </motion.div>
  )
}
