'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Play, Users, Trophy, Clock, Flame, ChevronDown, Copy, Check } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type RacePlayer = {
  id: string
  name: string
  color: string
  wpm: number
  accuracy: number
  progress: number
  finished: boolean
}

type RaceStatus = 'waiting' | 'countdown' | 'racing' | 'finished'

interface LiveRaceOverlayProps {
  isOpen: boolean
  players: RacePlayer[]
  status: RaceStatus
  raceId?: string
  onJoin?: () => void
  onStart?: () => void
  onClose?: () => void
  isCreator?: boolean
  currentUserId?: string
}

export function LiveRaceOverlay({
  isOpen,
  players,
  status,
  raceId,
  onJoin,
  onStart,
  onClose,
  isCreator,
  currentUserId,
}: LiveRaceOverlayProps) {
  const [copied, setCopied] = useState(false)
  const hasJoined = players.some((p) => p.id === currentUserId)

  const handleCopyCode = () => {
    if (raceId) {
      navigator.clipboard.writeText(raceId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const countdownFrom = status === 'countdown' ? 3 : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-b from-black to-black border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent-300/20 border border-accent-300/30 flex items-center justify-center">
                  <Zap className="text-accent-300" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Live Race Lobby</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    {status === 'waiting' && '🟡 Waiting for players'}
                    {status === 'countdown' && '🔴 Starting soon'}
                    {status === 'racing' && '🟢 Racing now'}
                    {status === 'finished' && '✅ Finished'}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                ✕
              </motion.button>
            </div>

            {/* Lobby code */}
            {raceId && (
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Race Code</p>
                  <p className="text-lg font-mono font-semibold text-accent-300">{raceId.slice(0, 8)}</p>
                </div>
                <motion.button
                  onClick={handleCopyCode}
                  className="px-3 py-2 rounded-lg bg-accent-300/20 border border-accent-300/30 text-accent-300 text-xs font-medium hover:bg-accent-300/30 flex items-center gap-2 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </motion.button>
              </div>
            )}

            {/* Players */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Players ({players.length}/12)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {players.map((player, idx) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar
                        name={player.name}
                        size={24}
                        fallbackClassName="text-xs font-bold"
                      />
                      <p className="text-sm font-semibold text-white flex-1 truncate">{player.name}</p>
                      {player.finished && <Trophy size={14} className="text-amber-400" />}
                    </div>

                    {status === 'racing' && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-accent-300 font-semibold">{Math.round(player.progress)}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-accent-300 to-accent-200"
                            initial={{ width: '0%' }}
                            animate={{ width: `${player.progress}%` }}
                            transition={{ type: 'spring', damping: 20 }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                          <span>{player.wpm} WPM</span>
                          <span>{player.accuracy}% acc</span>
                        </div>
                      </div>
                    )}

                    {status === 'finished' && (
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div>
                          <p className="text-slate-400">WPM</p>
                          <p className="font-semibold text-white">{player.wpm}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Acc</p>
                          <p className="font-semibold text-white">{player.accuracy}%</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {!hasJoined ? (
                <motion.button
                  onClick={onJoin}
                  className="flex-1 py-3 rounded-lg bg-accent-300 text-black font-semibold hover:bg-accent-200 transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Users size={16} />
                  Join Race
                </motion.button>
              ) : (
                <>
                  {isCreator && status === 'waiting' && (
                    <motion.button
                      onClick={onStart}
                      className="flex-1 py-3 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-500 transition-colors flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Play size={16} />
                      Start Race
                    </motion.button>
                  )}
                  <motion.button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
