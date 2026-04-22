'use client'

import React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Zap, X } from 'lucide-react'

interface RaceTickerProps {
  isOpen: boolean
  raceChannelName: string
  participantCount: number
  onJoin?: () => void
  onClose?: () => void
}

export function LiveRaceTicker({ isOpen, raceChannelName, participantCount, onJoin, onClose }: RaceTickerProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-b border-white/5 bg-white/[0.03]"
        >
          <div className="flex items-center justify-between gap-4 px-6 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <motion.div
                animate={prefersReducedMotion ? undefined : { scale: [1, 1.18, 1] }}
                transition={prefersReducedMotion ? undefined : { repeat: Infinity, duration: 1 }}
              >
                <Zap size={15} className="flex-shrink-0 text-[#22c55e]" />
              </motion.div>
              <p className="truncate text-[13px] text-slate-400">
                <span className="font-semibold">{participantCount} members</span>
                <span> racing in </span>
                <span className="font-medium text-white">{raceChannelName}</span>
                <span className="text-slate-400"> right now</span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <motion.button
                onClick={onJoin}
                className="rounded-lg bg-[#22c55e] px-3 py-1.5 text-[12px] font-medium text-[#04120a] transition-colors duration-150 ease-out hover:bg-[#34d399]"
                whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              >
                Join
              </motion.button>
              <motion.button
                onClick={onClose}
                className="rounded-md p-1 text-slate-500 transition-colors duration-150 ease-out hover:bg-white/[0.05] hover:text-white"
                whileHover={prefersReducedMotion ? undefined : { scale: 1.08 }}
              >
                <X size={16} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
