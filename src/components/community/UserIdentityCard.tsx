'use client'

import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Flame, History, Signal, Trophy, X } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type UserRank = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Master'
type UserPresence = 'online' | 'focus' | 'racing' | 'away'
type PresenceOption = Exclude<UserPresence, 'racing'>

interface UserIdentityCardProps {
  name: string
  avatarUrl?: string | null
  handle?: string | null
  wpm: number
  accuracy: number
  status: UserPresence
  rank?: UserRank
  streak?: number
  totalSessions?: number
  bestWpm?: number
  favoriteChannel?: string
  showProfileNudge?: boolean
  onDismissProfileNudge?: () => void
}

const RANK_META = {
  Bronze: 'text-[#d4a374]',
  Silver: 'text-slate-300',
  Gold: 'text-[#f4d27a]',
  Diamond: 'text-sky-300',
  Master: 'text-fuchsia-300',
} as const

const RANK_DOT = {
  Bronze: 'bg-amber-400',
  Silver: 'bg-zinc-400',
  Gold: 'bg-amber-300',
  Diamond: 'bg-cyan-400',
  Master: 'bg-fuchsia-400',
} as const

const STATUS_TEXT = {
  online: 'Online',
  focus: 'Focus mode',
  racing: 'In race',
  away: 'Away',
} as const

const PRESENCE_OPTIONS: Array<{
  value: PresenceOption
  label: string
}> = [
  { value: 'online', label: 'Online' },
  { value: 'focus', label: 'Focus' },
  { value: 'away', label: 'Away' },
]

const OVERVIEW_ITEMS = [
  { key: 'streak', label: 'Streak', icon: Flame },
  { key: 'sessions', label: 'Sessions', icon: History },
  { key: 'bestWpm', label: 'Best WPM', icon: Signal },
  { key: 'favorite', label: 'Fav channel', icon: Trophy },
] as const

function getBasePresence(status: UserPresence): PresenceOption {
  if (status === 'focus') return 'focus'
  if (status === 'away') return 'away'
  return 'online'
}

function getSidebarIdentityControls(root: HTMLDivElement | null) {
  const headerRow = root?.parentElement
  const section = headerRow?.parentElement
  if (!headerRow || !section) {
    return {
      streakButton: null as HTMLButtonElement | null,
      presenceRow: null as HTMLDivElement | null,
    }
  }

  const directChildren = Array.from(section.children)
  const streakButton =
    directChildren.find((child) => child !== headerRow && child.tagName === 'BUTTON') as HTMLButtonElement | undefined
  const presenceRow =
    directChildren.find((child) => child !== headerRow && child.tagName === 'DIV') as HTMLDivElement | undefined

  return {
    streakButton: streakButton ?? null,
    presenceRow: presenceRow ?? null,
  }
}

function getSidebarPresence(root: HTMLDivElement | null) {
  const { presenceRow } = getSidebarIdentityControls(root)
  if (!presenceRow) return null

  const buttons = Array.from(presenceRow.querySelectorAll('button'))
  const selectedButton = buttons.find((button) => button.className.includes('bg-[#22c55e]'))
  const selectedLabel = selectedButton?.textContent?.trim().toLowerCase()

  if (selectedLabel === 'focus') return 'focus'
  if (selectedLabel === 'away') return 'away'
  if (selectedLabel === 'online') return 'online'
  return null
}

export function UserIdentityCard({
  name,
  avatarUrl,
  handle,
  wpm,
  accuracy,
  status,
  rank = 'Bronze',
  streak = 0,
  totalSessions = 0,
  bestWpm = 0,
  favoriteChannel,
  showProfileNudge = false,
  onDismissProfileNudge,
}: UserIdentityCardProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [selectedPresence, setSelectedPresence] = useState<PresenceOption>(getBasePresence(status))
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const { streakButton, presenceRow } = getSidebarIdentityControls(rootRef.current)
    const previousStreakDisplay = streakButton?.style.display ?? ''
    const previousPresenceDisplay = presenceRow?.style.display ?? ''

    if (streakButton) {
      streakButton.style.display = 'none'
    }
    if (presenceRow) {
      presenceRow.style.display = 'none'
    }

    const nextPresence = getSidebarPresence(rootRef.current) ?? getBasePresence(status)
    setSelectedPresence((previous) => (previous === nextPresence ? previous : nextPresence))

    return () => {
      if (streakButton) {
        streakButton.style.display = previousStreakDisplay
      }
      if (presenceRow) {
        presenceRow.style.display = previousPresenceDisplay
      }
    }
  }, [status])

  function handleShowOffClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    const { streakButton } = getSidebarIdentityControls(rootRef.current)
    streakButton?.click()
  }

  function handlePresenceSelect(nextPresence: PresenceOption) {
    setSelectedPresence(nextPresence)

    const { presenceRow } = getSidebarIdentityControls(rootRef.current)
    const targetButton = Array.from(presenceRow?.querySelectorAll('button') || []).find(
      (button) => button.textContent?.trim().toLowerCase() === nextPresence
    )

    targetButton?.click()
  }

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setShowProfile(true)}
        className="flex w-full min-w-0 items-start gap-3 bg-transparent p-0 text-left"
        aria-haspopup="dialog"
        aria-expanded={showProfile}
      >
        <Avatar
          src={avatarUrl}
          name={name}
          size={40}
          status={status}
          ringOffsetClassName="ring-offset-[#111317]"
          className="text-[16px]"
        />

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate text-[15px] font-semibold leading-[1.15] text-white">{name}</p>
          <div className="mt-1.5 flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-[12px] leading-4 text-zinc-400">
            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', RANK_DOT[rank])} />
            <span className="truncate">{rank}</span>
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            <span className="shrink-0">{wpm} WPM</span>
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            <span className="shrink-0">{accuracy.toFixed(0)}%</span>
          </div>
        </div>
      </button>

      <div className="mt-3 w-full rounded-lg bg-zinc-800/40 p-[3px]">
        <div className="flex items-center gap-1">
          {PRESENCE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handlePresenceSelect(option.value)}
              className={cn(
                'flex h-7 flex-1 items-center justify-center rounded-md bg-transparent text-[12px] transition-colors duration-150 ease-out',
                selectedPresence === option.value
                  ? 'bg-zinc-700 font-medium text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {showProfileNudge ? (
        <div className="mt-2 flex items-center justify-between gap-3 text-[11px] leading-4">
          <Link
            href="/settings"
            className="text-zinc-500 transition-colors duration-150 ease-out hover:text-zinc-300 hover:underline"
          >
            Complete your profile →
          </Link>
          <button
            type="button"
            onClick={onDismissProfileNudge}
            className="text-zinc-600 transition-colors duration-150 ease-out hover:text-zinc-400"
            aria-label="Dismiss profile completion reminder"
          >
            ×
          </button>
        </div>
      ) : null}

      <div className="mt-2 flex items-center gap-1.5 text-[12px] leading-4">
        <Flame size={12} className="shrink-0 text-orange-400" />
        <span className="text-zinc-400">{streak}-day streak</span>
        <span aria-hidden="true" className="text-zinc-600">
          ·
        </span>
        <button
          type="button"
          onClick={handleShowOffClick}
          className="text-[12px] text-green-500/70 transition-colors duration-150 ease-out hover:text-green-400"
        >
          show off
        </button>
      </div>

      <AnimatePresence>
        {showProfile && (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 cursor-default bg-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfile(false)}
              aria-label="Close profile popover"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={prefersReducedMotion ? { duration: 0.12 } : undefined}
              className="absolute left-0 top-full z-50 mt-3 w-72 rounded-[22px] bg-[#101216]/95 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.32)] ring-1 ring-white/[0.045] backdrop-blur-xl"
              role="dialog"
              aria-label={`${name} mini profile`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <Avatar
                    src={avatarUrl}
                    name={name}
                    size={52}
                    status={status}
                    ringOffsetClassName="ring-offset-[#101216]"
                    className="text-[16px]"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold leading-tight text-white">{name}</p>
                    {handle ? <p className="mt-1 truncate text-[12px] text-zinc-500">@{handle}</p> : null}
                    <p className="mt-1.5 text-[12px] text-zinc-500">{STATUS_TEXT[status]}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfile(false)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors duration-150 ease-out hover:bg-white/[0.04] hover:text-zinc-300"
                  aria-label="Close mini profile"
                >
                  <X size={13} />
                </button>
              </div>

              <div className="mt-5 space-y-1 rounded-2xl bg-white/[0.025] px-2.5 py-2">
                {OVERVIEW_ITEMS.map((item) => {
                  const Icon = item.icon
                  const value =
                    item.key === 'streak'
                      ? `${streak}`
                      : item.key === 'sessions'
                        ? `${totalSessions}`
                        : item.key === 'bestWpm'
                          ? `${bestWpm}`
                          : favoriteChannel || 'General'

                  return (
                    <div key={item.key} className="flex items-center justify-between gap-4 rounded-xl px-2 py-1.5">
                      <div className="flex min-w-0 items-center gap-2 text-[12px] text-zinc-500">
                        <Icon size={12} className="shrink-0 text-zinc-600" />
                        {item.label}
                      </div>
                      <span
                        className={cn(
                          'shrink-0 truncate text-right text-[12px] font-medium',
                          item.key === 'streak' && 'text-orange-300/90',
                          item.key === 'bestWpm' && 'text-emerald-300/90',
                          item.key !== 'streak' && item.key !== 'bestWpm' && 'text-zinc-200'
                        )}
                      >
                        {value}
                      </span>
                    </div>
                  )
                })}

                <div className="flex items-center justify-between gap-4 rounded-xl px-2 py-1.5">
                  <span className="text-[12px] text-zinc-500">Current rank</span>
                  <span className={cn('inline-flex items-center gap-1.5 text-[12px] font-medium', RANK_META[rank])}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', RANK_DOT[rank])} />
                    {rank}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
