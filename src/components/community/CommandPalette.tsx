'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Search, Zap, Users, Trophy, MessageSquare, Share2, X, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandPaletteItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
  category: 'navigation' | 'action' | 'race'
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  channels?: { id: string; name: string }[]
  members?: { id: string; name: string }[]
  onNavigateChannel?: (channelId: string) => void
  onStartRace?: () => void
  onViewLeaderboard?: () => void
  onPostAchievement?: () => void
  onInviteMember?: () => void
}

export function CommandPalette({
  isOpen,
  onClose,
  channels = [],
  members = [],
  onNavigateChannel,
  onStartRace,
  onViewLeaderboard,
  onPostAchievement,
  onInviteMember,
}: CommandPaletteProps) {
  const prefersReducedMotion = useReducedMotion()
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const baseCommands: CommandPaletteItem[] = [
    {
      id: 'race',
      title: 'Start a Race',
      description: 'Launch a new typing race',
      icon: <Zap size={16} className="text-accent-300" />,
      action: () => {
        onStartRace?.()
        onClose()
      },
      category: 'race',
    },
    {
      id: 'leaderboard',
      title: 'View Leaderboard',
      description: 'See top members and stats',
      icon: <Trophy size={16} className="text-amber-400" />,
      action: () => {
        onViewLeaderboard?.()
        onClose()
      },
      category: 'navigation',
    },
    {
      id: 'achievement',
      title: 'Post Achievement',
      description: 'Share your personal best',
      icon: <Share2 size={16} className="text-emerald-400" />,
      action: () => {
        onPostAchievement?.()
        onClose()
      },
      category: 'action',
    },
    {
      id: 'invite-member',
      title: 'Invite Member',
      description: 'Open a quick invite or challenge prompt',
      icon: <UserPlus size={16} className="text-sky-300" />,
      action: () => {
        onInviteMember?.()
        onClose()
      },
      category: 'action',
    },
  ]

  const channelCommands: CommandPaletteItem[] = channels.map((ch) => ({
    id: `channel-${ch.id}`,
    title: ch.name,
    description: 'Jump to channel',
    icon: <MessageSquare size={16} className="text-slate-400" />,
    action: () => {
      onNavigateChannel?.(ch.id)
      onClose()
    },
    category: 'navigation' as const,
  }))

  const memberCommands: CommandPaletteItem[] = members.map((m) => ({
    id: `member-${m.id}`,
    title: m.name,
    description: 'View profile',
    icon: <Users size={16} className="text-slate-400" />,
    action: () => {
      onClose()
    },
    category: 'navigation' as const,
  }))

  const allCommands = [...baseCommands, ...channelCommands, ...memberCommands]

  const filteredCommands = allCommands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0.12 } : undefined}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#090c09] shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-center gap-3 border-b border-white/10 bg-black/50 px-4 py-3">
              <Search size={18} className="text-slate-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setSelectedIndex(0)
                }}
                placeholder="Type to search or enter commands..."
                className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-sm"
              />
              <motion.button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <X size={16} />
              </motion.button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-400">No commands found</p>
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => (
                  <motion.button
                    key={cmd.id}
                    onClick={() => cmd.action()}
                    className={cn(
                      'flex w-full items-start gap-3 border-b border-white/5 px-4 py-3 transition-colors',
                      selectedIndex === idx
                        ? 'border-l-2 border-l-accent-300 bg-accent-300/15'
                        : 'hover:bg-white/5'
                    )}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    whileHover={prefersReducedMotion ? undefined : { x: 2 }}
                  >
                    <div className="pt-1 flex-shrink-0">{cmd.icon}</div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-white">{cmd.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{cmd.description}</p>
                    </div>
                  </motion.button>
                ))
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 bg-black/50 px-4 py-2 text-xs text-slate-500">
              <div className="flex gap-3">
                <span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-slate-400">↑↓</kbd> Navigate
                </span>
                <span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-slate-400">⏎</kbd> Select
                </span>
                <span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-slate-400">Esc</kbd> Close
                </span>
              </div>
              <span>
                <kbd className="rounded bg-white/10 px-2 py-1 text-slate-400">⌘K</kbd> or{' '}
                <kbd className="rounded bg-white/10 px-2 py-1 text-slate-400">Ctrl K</kbd>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
