'use client'

import Link from 'next/link'
import { Session } from 'next-auth'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { getDisplayName, getResolvedAvatarUrl } from '@/lib/profile'
import { cn } from '@/lib/utils'
import { isNavPathActive, userNavLinks } from './nav-data'

import {
  CaretDown,
  SignOut,
  SquaresFour,
  UserCircle,
  CaretRight,
  ArrowRight,
} from '@phosphor-icons/react'

type NavUserActionsProps = {
  onSignIn: () => void
  onSignOut: () => void
  pathname: string
  session: Session | null
}

const iconMap: Record<string, React.ElementType> = {
  Dashboard: SquaresFour,
  Profile: UserCircle,
}

export default function NavUserActions({
  onSignIn,
  onSignOut,
  pathname,
  session,
}: NavUserActionsProps) {
  const prefersReducedMotion = useReducedMotion()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const displayName = useMemo(
    () =>
      getDisplayName(
        {
          email: session?.user?.email,
          name: session?.user?.name,
          nickname: session?.user?.nickname,
          username: session?.user?.username,
        },
        'Profile'
      ),
    [session]
  )
  const [profileAvatarSrc, setProfileAvatarSrc] = useState<string | null>(null)
  const sessionAvatarSrc = getResolvedAvatarUrl({
    avatarUrl: session?.user?.avatarUrl,
    image: session?.user?.image,
  })
  const avatarSrc = profileAvatarSrc || sessionAvatarSrc

  useEffect(() => {
    if (!session?.user?.id) {
      setProfileAvatarSrc(null)
      return
    }

    const controller = new AbortController()

    fetch('/api/profile', {
      credentials: 'same-origin',
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const nextAvatar =
          typeof payload?.user?.avatarUrl === 'string'
            ? payload.user.avatarUrl
            : typeof payload?.user?.image === 'string'
              ? payload.user.image
              : null
        setProfileAvatarSrc(nextAvatar)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setProfileAvatarSrc(null)
        }
      })

    return () => controller.abort()
  }, [session?.user?.id])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  /* ── Unauthenticated ── */
  if (!session) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <motion.button
          type="button"
          onClick={onSignIn}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          className="inline-flex h-[36px] items-center justify-center rounded-full px-5 text-[15px] font-medium leading-none text-[#9aa0a6] transition-colors duration-0 hover:text-white hover:bg-white/5 hover:![transform:none]"
        >
          Log in
        </motion.button>

        <Link href="/register">
          <motion.div
            whileHover={
              prefersReducedMotion
                ? undefined
                : { scale: 1.035 }
            }
            whileTap={
              prefersReducedMotion ? undefined : { scale: 0.975 }
            }
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
          >
            <span className="group inline-flex h-[36px] items-center justify-center gap-1.5 rounded-full bg-[#1a73e8] px-6 text-[15px] font-semibold leading-none text-white shadow-[0_1px_3px_rgba(26,115,232,0.2),0_6px_16px_rgba(26,115,232,0.2)] transition-all duration-200 hover:bg-[#1557b0] hover:shadow-[0_2px_6px_rgba(26,115,232,0.3),0_10px_24px_rgba(26,115,232,0.25)] hover:![transform:none]">
              Start typing
              <ArrowRight
                weight="bold"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </motion.div>
        </Link>
      </div>
    )
  }

  /* ── Authenticated ── */
  return (
    <div ref={menuRef} className="relative ml-auto shrink-0">
      {/* ── Trigger button ── */}
      <motion.button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open profile menu"
        onClick={() => setIsOpen((o) => !o)}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        className={cn(
          'inline-flex h-[36px] items-center justify-center gap-1.5 rounded-full px-2.5 text-left outline-none transition-all duration-200 hover:![transform:none]',
          isOpen
            ? 'bg-black/30 shadow-inner'
            : 'bg-transparent hover:bg-white/5',
          'focus-visible:ring-2 focus-visible:ring-white/20'
        )}
      >
        <Avatar
          src={avatarSrc}
          name={displayName}
          size={32}
          className="ring-1 ring-white/10"
          fallbackClassName="text-[10px] font-bold tracking-wider text-white"
        />

        <span className="hidden min-w-0 xl:block">
          <span className="block truncate text-[13px] font-medium leading-5 text-white/90">
            {displayName}
          </span>
        </span>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center"
        >
          <CaretDown
            weight="bold"
            className={cn(
              'h-3 w-3 transition-colors',
              isOpen ? 'text-white' : 'text-white/50'
            )}
          />
        </motion.span>
      </motion.button>

      {/* ── Dropdown panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
              scale: 0.96,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: 6,
              scale: 0.97,
            }}
            transition={{
              duration: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute right-0 top-[calc(100%+0.5rem)] z-[100] w-[260px] origin-top-right overflow-hidden rounded-[1.25rem] border border-white/[0.06] bg-[#0d0d0f]/95 text-white shadow-[0_24px_48px_rgba(0,0,0,0.6),0_8px_16px_rgba(0,0,0,0.4)] backdrop-blur-3xl"
            role="menu"
          >
            {/* Subtle top edge highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            {/* ── Profile header ── */}
            <div className="border-b border-white/[0.06] px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar
                  src={avatarSrc}
                  name={displayName}
                  size={38}
                  className="ring-2 ring-white/10"
                  fallbackClassName="text-sm font-bold tracking-wider text-white"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold leading-tight text-white">
                    {displayName}
                  </p>
                  {session.user?.email && (
                    <p className="mt-0.5 truncate text-[11px] font-medium text-[#9aa0a6]">
                      {session.user.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Nav items ── */}
            <div className="space-y-0.5 p-1.5">
              {userNavLinks.map((link, idx) => {
                const Icon = iconMap[link.label] ?? UserCircle
                const active = isNavPathActive(pathname, link.href)
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * idx, duration: 0.18 }}
                  >
                    <Link
                      href={link.href}
                      role="menuitem"
                      className={cn(
                        'group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-150',
                        active
                          ? 'bg-[#1a73e8]/15 text-[#8ab4f8] font-medium'
                          : 'text-[#e8eaed]/70 hover:bg-white/[0.04] hover:text-white'
                      )}
                    >
                      <Icon
                        weight={active ? 'fill' : 'regular'}
                        className={cn(
                          'h-[16px] w-[16px] shrink-0 transition-colors',
                          active
                            ? 'text-[#8ab4f8]'
                            : 'text-[#9aa0a6] group-hover:text-white/70'
                        )}
                      />
                      <span className="flex-1 font-medium">{link.label}</span>
                      <CaretRight
                        weight="bold"
                        className={cn(
                          'h-3 w-3 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100',
                          active
                            ? 'text-[#8ab4f8]/60 opacity-100'
                            : 'text-[#9aa0a6]/40 opacity-0'
                        )}
                      />
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* ── Divider ── */}
            <div className="mx-3 h-px bg-white/[0.06]" />

            {/* ── Logout ── */}
            <div className="p-1.5">
              <motion.button
                type="button"
                onClick={onSignOut}
                role="menuitem"
                whileHover={
                  prefersReducedMotion ? undefined : { x: 1 }
                }
                whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[#9aa0a6] outline-none transition-all duration-150 hover:bg-red-500/10 hover:text-red-400"
              >
                <SignOut
                  weight="regular"
                  className="h-[16px] w-[16px] shrink-0 text-[#9aa0a6]/60 transition-colors group-hover:text-red-400"
                />
                <span className="flex-1 text-left font-medium">Sign out</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
