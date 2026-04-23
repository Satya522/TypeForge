'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Avatar, type AvatarStatus } from '@/components/ui/avatar'
import { PremiumSkeleton } from '@/components/ui/premium-skeleton'
import { cn } from '@/lib/utils'
import type { PublicProfileSummary } from '@/lib/profile-server'

type ProfileHoverCardProps = {
  children: React.ReactNode
  className?: string
  fallbackAvatarUrl?: string | null
  fallbackName?: string | null
  onChallenge?: () => void
  status?: AvatarStatus
  userId?: string | null
}

type CardPosition = {
  left: number
  placement: 'above' | 'below'
  top: number
}

const profileCache = new Map<string, PublicProfileSummary>()

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function buildFallbackProfile(
  userId?: string | null,
  fallbackName?: string | null,
  fallbackAvatarUrl?: string | null
): PublicProfileSummary {
  return {
    id: userId || 'profile-preview',
    avatarUrl: fallbackAvatarUrl || null,
    displayName: fallbackName?.trim() || 'Typist',
    handle: null,
    handleLabel: null,
    profileHref: '/profile',
    rank: 'Bronze',
    streak: 0,
    wpm: 0,
    accuracy: 0,
  }
}

export function ProfileHoverCard({
  children,
  className,
  fallbackAvatarUrl,
  fallbackName,
  onChallenge,
  status = 'offline',
  userId,
}: ProfileHoverCardProps) {
  const triggerRef = useRef<HTMLSpanElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState<CardPosition>({
    left: 12,
    placement: 'below',
    top: 12,
  })
  const [profile, setProfile] = useState<PublicProfileSummary | null>(() =>
    userId ? (profileCache.get(userId) ?? null) : null
  )

  const fallbackProfile = useMemo(
    () => buildFallbackProfile(userId, fallbackName, fallbackAvatarUrl),
    [fallbackAvatarUrl, fallbackName, userId]
  )
  const summary = profile ?? fallbackProfile

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      return
    }

    setProfile(profileCache.get(userId) ?? null)
  }, [userId])

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  function scheduleClose() {
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 200)
  }

  function updatePosition() {
    const trigger = triggerRef.current
    if (!trigger) return

    const triggerRect = trigger.getBoundingClientRect()
    const cardWidth = cardRef.current?.offsetWidth ?? 320
    const cardHeight = cardRef.current?.offsetHeight ?? 196
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - triggerRect.bottom
    const spaceAbove = triggerRect.top
    const placement =
      spaceBelow < cardHeight + 12 && spaceAbove > spaceBelow
        ? 'above'
        : 'below'

    const top =
      placement === 'above'
        ? Math.max(12, triggerRect.top - cardHeight - 8)
        : Math.min(viewportHeight - cardHeight - 12, triggerRect.bottom + 8)
    const left = clamp(
      triggerRect.left + triggerRect.width / 2 - cardWidth / 2,
      12,
      Math.max(12, viewportWidth - cardWidth - 12)
    )

    setPosition({ top, left, placement })
  }

  useEffect(() => {
    if (!open) return

    updatePosition()

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        triggerRef.current?.contains(target) ||
        cardRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }

    const handleViewportChange = () => updatePosition()

    document.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
    }
  }, [open, profile, loading])

  useEffect(() => {
    if (!open || !userId || profileCache.has(userId)) {
      return
    }

    const profileId = userId
    let cancelled = false

    async function fetchProfile() {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/profile/public?id=${encodeURIComponent(profileId)}`,
          {
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          return
        }

        const data = (await response.json()) as {
          profile?: PublicProfileSummary | null
        }
        if (!data.profile || cancelled) {
          return
        }

        profileCache.set(profileId, data.profile)
        setProfile(data.profile)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchProfile()

    return () => {
      cancelled = true
    }
  }, [open, userId])

  useEffect(() => {
    return () => clearCloseTimer()
  }, [])

  const card = mounted
    ? createPortal(
        <AnimatePresence>
          {open ? (
            <motion.div
              ref={cardRef}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-[140] w-80 rounded-2xl border border-white/10 bg-[#111317] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
              style={{ left: position.left, top: position.top }}
              onMouseEnter={clearCloseTimer}
              onMouseLeave={scheduleClose}
              role="dialog"
              aria-label={`${summary.displayName} profile preview`}
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar
                    src={summary.avatarUrl}
                    name={summary.displayName}
                    size={48}
                    status={status}
                    ringOffsetClassName="ring-offset-[#111317]"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-white">
                      {summary.displayName}
                    </p>
                    <p className="mt-1 truncate text-[13px] text-zinc-500">
                      {summary.handleLabel ||
                        (loading ? 'Loading handle...' : 'No handle yet')}
                    </p>
                    <p className="mt-2 truncate text-[12px] text-zinc-400">
                      <span className="text-zinc-300">{summary.rank}</span>
                      <span aria-hidden="true" className="mx-1.5 text-zinc-600">
                        ·
                      </span>
                      <span>{summary.wpm} WPM</span>
                      <span aria-hidden="true" className="mx-1.5 text-zinc-600">
                        ·
                      </span>
                      <span>{summary.accuracy.toFixed(0)}%</span>
                    </p>
                    <p className="mt-2 text-[12px] text-zinc-400">
                      {summary.streak}-day streak
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Syncing profile
                    </div>
                    <div className="mt-3 space-y-2">
                      <PremiumSkeleton className="h-3 w-full rounded-full" />
                      <PremiumSkeleton className="h-3 w-4/5 rounded-full" />
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center gap-3">
                  {onChallenge ? (
                    <button
                      type="button"
                      onClick={() => {
                        onChallenge()
                        setOpen(false)
                      }}
                      className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-[#22c55e] px-4 text-sm font-medium text-[#04120a] transition-colors duration-150 ease-out hover:bg-[#34d399]"
                    >
                      Challenge to race
                    </button>
                  ) : (
                    <Link
                      href="/community"
                      className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-[#22c55e] px-4 text-sm font-medium text-[#04120a] transition-colors duration-150 ease-out hover:bg-[#34d399]"
                      onClick={() => setOpen(false)}
                    >
                      Challenge to race
                    </Link>
                  )}

                  <Link
                    href={summary.profileHref}
                    className="text-sm text-zinc-400 transition-colors duration-150 ease-out hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    View profile
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body
      )
    : null

  return (
    <>
      <span
        ref={triggerRef}
        className={cn('inline-flex min-w-0', className)}
        onMouseEnter={() => {
          clearCloseTimer()
          setOpen(true)
        }}
        onMouseLeave={scheduleClose}
        onClick={() => {
          clearCloseTimer()
          setOpen((previous) => !previous)
        }}
      >
        {children}
      </span>
      {card}
    </>
  )
}
