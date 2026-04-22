'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Hash, Zap, BookOpen, Gamepad2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ChannelType = 'text' | 'race' | 'event' | 'drills'
type ChannelGroup = 'GENERAL' | 'COMPETE' | 'LEARN' | 'CHILL'

interface Channel {
  id: string
  name: string
  icon: string
  description: string
  group: ChannelGroup
  type: ChannelType
  memberCount: number
  unreadCount?: number
  isActive?: boolean
  hasRaceActive?: boolean
  typingUsers?: number
}

interface ChannelListProps {
  channels: Channel[]
  activeChannelId: string
  onSelectChannel: (id: string) => void
}

const CHANNEL_TYPE_ICONS = {
  text: Hash,
  race: Zap,
  event: Gamepad2,
  drills: BookOpen,
}

const GROUP_ORDER: ChannelGroup[] = ['GENERAL', 'COMPETE', 'LEARN', 'CHILL']

export function ChannelList({ channels, activeChannelId, onSelectChannel }: ChannelListProps) {
  const prefersReducedMotion = useReducedMotion()
  const groupedChannels = GROUP_ORDER.reduce(
    (acc, group) => {
      acc[group] = channels.filter((c) => c.group === group)
      return acc
    },
    {} as Record<ChannelGroup, Channel[]>
  )

  return (
    <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3 [scrollbar-color:rgba(255,255,255,0.10)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/[0.08] [&::-webkit-scrollbar-track]:bg-transparent">
      {GROUP_ORDER.map((group) => {
        if (!groupedChannels[group].length) return null

        return (
          <div key={group}>
            <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-600">{group}</p>
            <div className="space-y-0.5">
              {groupedChannels[group].map((channel) => {
                const TypeIcon = CHANNEL_TYPE_ICONS[channel.type]
                const isActive = channel.id === activeChannelId

                return (
                  <motion.button
                    key={channel.id}
                    onClick={() => onSelectChannel(channel.id)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-[14px] px-3 py-2 text-left transition-colors duration-150 ease-out',
                      isActive
                        ? 'bg-white/[0.06] text-white'
                        : 'text-slate-400 hover:bg-white/[0.035] hover:text-white'
                    )}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <TypeIcon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[14px] font-medium">{channel.name}</p>
                        {channel.hasRaceActive ? (
                          <motion.span
                            animate={prefersReducedMotion ? undefined : { opacity: [1, 0.6, 1] }}
                            transition={prefersReducedMotion ? undefined : { repeat: Infinity, duration: 1.4 }}
                            className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-300"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                            LIVE
                          </motion.span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-[12px] leading-4 text-slate-500">{channel.description}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {channel.typingUsers && channel.typingUsers > 0 ? (
                        <div className="flex gap-0.5" aria-label={`${channel.typingUsers} members typing`}>
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              animate={prefersReducedMotion ? undefined : { opacity: [0.4, 1, 0.4] }}
                              transition={
                                prefersReducedMotion
                                  ? undefined
                                  : {
                                      repeat: Infinity,
                                      duration: 0.9,
                                      delay: i * 0.12,
                                    }
                              }
                              className="h-1 w-1 rounded-full bg-emerald-400/90"
                            />
                          ))}
                        </div>
                      ) : null}

                      {channel.unreadCount && channel.unreadCount > 0 ? (
                        <motion.span
                          animate={prefersReducedMotion ? undefined : { scale: [1, 1.05, 1] }}
                          transition={prefersReducedMotion ? undefined : { repeat: Infinity, duration: 1.8 }}
                          className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#22c55e] px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white"
                        >
                          {channel.unreadCount > 9 ? '9+' : channel.unreadCount}
                        </motion.span>
                      ) : null}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )
      })}
    </nav>
  )
}
