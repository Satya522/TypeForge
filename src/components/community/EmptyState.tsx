'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface EmptyStateProps {
  channelId: string
  onSendMessage?: () => void
  onStartRace?: () => void
}

const EMPTY_STATES: Record<string, { heading: string; description: string }> = {
  general: {
    heading: 'Squad is quiet. Break the silence — type something or /race to warm up.',
    description: 'Be the first to start a conversation',
  },
  'speed-runs': {
    heading: 'No records posted yet. Run a sprint and flex your WPM here.',
    description: 'Share your fastest times and challenge the community',
  },
  'tips-tricks': {
    heading: 'No tips yet. Share your best techniques with the squad.',
    description: 'Help others improve their typing game',
  },
  'show-off': {
    heading: 'Waiting for achievements... Post a new personal best to flex here.',
    description: 'Show everyone what you\'ve got',
  },
  challenges: {
    heading: 'No active challenges. Type /race to start one.',
    description: 'Challenge someone or accept a race invite',
  },
  'off-topic': {
    heading: 'The chat awaits your memes and wisdom.',
    description: 'Keep it fun, keep it wild',
  },
}

export function EmptyState({ channelId }: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion()
  const state = EMPTY_STATES[channelId] || EMPTY_STATES.general

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex items-center justify-center"
    >
      <div className="text-center max-w-md px-6">
        <h3 className="mb-2 text-[15px] font-normal text-zinc-400">
          {state.heading}
          <motion.span
            aria-hidden="true"
            className="ml-1 inline-block h-[0.95em] w-[1.5px] rounded-full bg-[rgba(34,197,94,0.6)] align-[-0.08em]"
            animate={prefersReducedMotion ? undefined : { opacity: [1, 0, 1] }}
            transition={prefersReducedMotion ? undefined : { repeat: Infinity, duration: 1 }}
          />
        </h3>
        <p className="text-[13px] text-zinc-500">{state.description}</p>
      </div>
    </motion.div>
  )
}
