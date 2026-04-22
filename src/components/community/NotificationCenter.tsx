'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Bell, Zap, Flame, AtSign, X, CalendarClock, Swords } from 'lucide-react'
import { cn } from '@/lib/utils'

type NotificationType = 'race_invite' | 'mention' | 'streak' | 'event' | 'wpm_beat'

interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  timestamp: Date
  unread: boolean
  action?: () => void
}

interface NotificationCenterProps {
  unreadCount: number
  notifications: Notification[]
  onMarkAsRead?: (id: string) => void
  onDismiss?: (id: string) => void
}

const NOTIFICATION_ICONS = {
  race_invite: <Zap size={16} className="text-accent-300" />,
  mention: <AtSign size={16} className="text-sky-300" />,
  streak: <Flame size={16} className="text-orange-400" />,
  event: <CalendarClock size={16} className="text-amber-300" />,
  wpm_beat: <Swords size={16} className="text-fuchsia-300" />,
} as const

export function NotificationCenter({
  unreadCount,
  notifications,
  onMarkAsRead,
  onDismiss,
}: NotificationCenterProps) {
  const prefersReducedMotion = useReducedMotion()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-xl bg-white/[0.04] p-2 text-slate-300 transition-colors duration-150 ease-out hover:bg-white/[0.07] hover:text-white"
        whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.div
            animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1] }}
            transition={prefersReducedMotion ? undefined : { repeat: Infinity, duration: 2 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ x: 420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0.14 } : undefined}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/8 bg-[#111317]/96 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
              role="dialog"
              aria-label="Notifications drawer"
            >
              <div className="flex items-center justify-between border-b border-white/8 bg-[#0b0d10]/80 px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  <p className="mt-1 text-xs text-slate-500">Race invites, mentions, streaks and beat-your-score nudges.</p>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.08 }}
                >
                  <X size={16} />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-3">
                {notifications.length === 0 ? (
                  <div className="flex h-full min-h-[14rem] items-center justify-center px-6 text-center text-sm text-slate-400">
                    All caught up. New invites, mentions and streak alerts will land here.
                  </div>
                ) : (
                  notifications.map((notif, idx) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        'mb-2 cursor-pointer rounded-[18px] px-4 py-3 transition-colors duration-150 ease-out hover:bg-white/[0.04]',
                        notif.unread ? 'bg-white/[0.05]' : 'bg-white/[0.025]'
                      )}
                      onClick={() => {
                        onMarkAsRead?.(notif.id)
                        notif.action?.()
                      }}
                    >
                      <div className="mb-2 flex items-start gap-3">
                        <div className="pt-0.5 flex-shrink-0">{NOTIFICATION_ICONS[notif.type]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">{notif.title}</p>
                            {notif.unread ? (
                              <span className="rounded-full bg-accent-300/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-100">
                                New
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{notif.description}</p>
                        </div>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDismiss?.(notif.id)
                          }}
                          className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                          whileHover={prefersReducedMotion ? undefined : { scale: 1.08 }}
                        >
                          <X size={14} />
                        </motion.button>
                      </div>
                      <p className="text-xs text-slate-500">
                        {notif.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="border-t border-white/10 px-5 py-3 text-xs text-slate-500">
                Unread: <span className="text-slate-300">{unreadCount}</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
