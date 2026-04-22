'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Command, Zap, BarChart3, Users, Trophy, Radio, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickCommand {
  command: string
  description: string
  icon: React.ReactNode
  action?: () => void
}

interface QuickCommandsProps {
  isOpen: boolean
  onClose: () => void
  onSelectCommand?: (command: string) => void
}

const QUICK_COMMANDS: QuickCommand[] = [
  {
    command: '/race',
    description: 'Create or join a live typing race',
    icon: <Zap size={16} className="text-accent-300" />,
  },
  {
    command: '/challenge',
    description: 'Challenge another member to a head-to-head',
    icon: <Trophy size={16} className="text-amber-400" />,
  },
  {
    command: '/stats',
    description: 'Share your stats or view leaderboard',
    icon: <BarChart3 size={16} className="text-emerald-400" />,
  },
  {
    command: '/squad',
    description: 'Squad management and squad chat',
    icon: <Users size={16} className="text-purple-400" />,
  },
  {
    command: '/raid',
    description: 'Summon a co-op boss for your squad',
    icon: <Radio size={16} className="text-red-400" />,
  },
  {
    command: '/help',
    description: 'See all available commands',
    icon: <Command size={16} className="text-slate-400" />,
  },
]

export function QuickCommandsPanel({ isOpen, onClose, onSelectCommand }: QuickCommandsProps) {
  const [selectedIdx, setSelectedIdx] = useState(0)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-start justify-center pt-24 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-black border border-white/10 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Command size={16} className="text-accent-300" />
                Quick Commands
              </h3>
              <motion.button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Commands list */}
            <div className="space-y-0.5 p-2">
              {QUICK_COMMANDS.map((cmd, idx) => (
                <motion.button
                  key={cmd.command}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  onClick={() => {
                    onSelectCommand?.(cmd.command)
                    onClose()
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-start gap-3',
                    selectedIdx === idx
                      ? 'bg-accent-300/20 border border-accent-300/30'
                      : 'hover:bg-white/5 border border-transparent'
                  )}
                  whileHover={{ x: 4 }}
                >
                  <div className="pt-0.5">{cmd.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-semibold text-accent-300">{cmd.command}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{cmd.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/5 bg-white/5">
              <p className="text-xs text-slate-500">Type / in chat to trigger commands</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Activity indicator component
interface ActivityIndicatorProps {
  type: 'race' | 'challenge' | 'achievement' | 'squad'
  message: string
  userColor: string
  userName: string
  pulse?: boolean
}

export function ActivityIndicator({
  type,
  message,
  userColor,
  userName,
  pulse = true,
}: ActivityIndicatorProps) {
  const getIcon = () => {
    switch (type) {
      case 'race':
        return <Zap size={14} className="text-accent-300" />
      case 'challenge':
        return <Trophy size={14} className="text-amber-400" />
      case 'achievement':
        return <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-lg"
        >
          ✨
        </motion.div>
      case 'squad':
        return <Users size={14} className="text-purple-400" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs"
    >
      {pulse && (
        <motion.div
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="h-2 w-2 rounded-full bg-accent-300"
        />
      )}
      {getIcon()}
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-white">{userName}</span>
        <span className="text-slate-400 mx-1">•</span>
        <span className="text-slate-400">{message}</span>
      </div>
    </motion.div>
  )
}
