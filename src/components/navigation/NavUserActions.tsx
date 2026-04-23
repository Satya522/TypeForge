'use client'

import Link from 'next/link'
import { Session } from 'next-auth'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { motionDurations, motionEasing } from '@/components/motion'
import { getDisplayName, getResolvedAvatarUrl } from '@/lib/profile'
import { cn } from '@/lib/utils'
import { isNavPathActive, userNavLinks } from './nav-data'

// Phosphor Icons — premium, duo-tone feel
import {
  CaretDown,
  SignIn,
  SignOut,
  SquaresFour,
  UserCircle,
  CaretRight,
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
  const actionsRef = useRef<HTMLDivElement>(null)

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
  const avatarSrc = getResolvedAvatarUrl({
    avatarUrl: session?.user?.avatarUrl,
    image: session?.user?.image,
  })

  /* GSAP entrance */
  useEffect(() => {
    if (!actionsRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        actionsRef.current,
        { x: 14, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: prefersReducedMotion ? 0.18 : 0.56,
          ease: 'power3.out',
          delay: 0.22,
        }
      )
    })
    return () => ctx.revert()
  }, [prefersReducedMotion])

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
      <div
        ref={actionsRef}
        className="hidden shrink-0 items-center gap-2 lg:flex"
        style={{ opacity: 0 }}
      >
        <motion.div
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          transition={{
            duration: motionDurations.fast,
            ease: motionEasing.micro,
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignIn}
            className="gap-2 rounded-full px-4 text-gray-300 hover:text-accent-300 hover:bg-accent-300/[0.05]"
          >
            <SignIn weight="bold" className="h-4 w-4" />
            <span>Login</span>
          </Button>
        </motion.div>

        <Link href="/register">
          <motion.div
            whileHover={prefersReducedMotion ? undefined : { y: -1 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            transition={{
              duration: motionDurations.fast,
              ease: motionEasing.micro,
            }}
          >
            <Button
              variant="primary"
              size="sm"
              className="rounded-full px-5 cta-glow-pulse"
            >
              Sign Up
            </Button>
          </motion.div>
        </Link>
      </div>
    )
  }

  /* ── Authenticated ── */
  return (
    <div ref={actionsRef} style={{ opacity: 0 }}>
      <div ref={menuRef} className="relative ml-auto hidden shrink-0 lg:block">
        {/* ── Trigger button ── */}
        <motion.button
          ref={triggerRef}
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label="Open profile menu"
          onClick={() => setIsOpen((o) => !o)}
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
          transition={{
            duration: motionDurations.fast,
            ease: motionEasing.micro,
          }}
          className={cn(
            'inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-left outline-none transition-all duration-200',
            'hover:border-white/16 hover:bg-white/[0.05]',
            'focus-visible:ring-2 focus-visible:ring-accent-300/50',
            isOpen &&
              'border-white/16 bg-white/[0.055] shadow-[0_18px_36px_rgba(0,0,0,0.22)]'
          )}
        >
          {/* Avatar */}
          <Avatar
            src={avatarSrc}
            name={displayName}
            size={32}
            className="ring-1 ring-white/10"
            fallbackClassName="text-[11px] font-bold tracking-wider text-accent-100"
          />

          {/* Name (only on xl) */}
          <span className="hidden min-w-0 xl:block">
            <span className="block truncate text-[13px] font-semibold leading-5 text-white">
              {displayName}
            </span>
          </span>

          {/* Caret */}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{
              duration: motionDurations.fast,
              ease: motionEasing.micro,
            }}
            className="flex items-center"
          >
            <CaretDown
              weight="bold"
              className={cn(
                'h-3.5 w-3.5 transition-colors',
                isOpen ? 'text-white' : 'text-gray-500'
              )}
            />
          </motion.span>
        </motion.button>

        {/* ── Dropdown panel ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{
                duration: motionDurations.fast,
                ease: motionEasing.premium,
              }}
              className="absolute right-0 top-[calc(100%+0.65rem)] z-[100] w-[260px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#060805] shadow-[0_28px_80px_rgba(0,0,0,0.55)]"
              role="menu"
            >
              {/* Top accent line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-300/50 to-transparent" />

              {/* ── Profile header ── */}
              <div className="flex items-center gap-3 px-4 py-4">
                <Avatar
                  src={avatarSrc}
                  name={displayName}
                  size={42}
                  className="ring-2 ring-accent-300/20"
                  fallbackClassName="text-sm font-bold tracking-wider text-accent-100"
                />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-white leading-tight">
                    {displayName}
                  </p>
                  {session.user?.email && (
                    <p className="truncate text-[11px] text-gray-500 mt-0.5">
                      {session.user.email}
                    </p>
                  )}
                  {/* Online indicator */}
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-zinc-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
                    Online
                  </span>
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="mx-4 h-px bg-white/[0.06]" />

              {/* ── Nav items ── */}
              <div className="p-2">
                {userNavLinks.map((link, idx) => {
                  const Icon = iconMap[link.label] ?? UserCircle
                  const active = isNavPathActive(pathname, link.href)
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * idx, duration: 0.2 }}
                    >
                      <Link
                        href={link.href}
                        role="menuitem"
                        className={cn(
                          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 outline-none',
                          active
                            ? 'bg-accent-300/10 text-accent-100'
                            : 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
                        )}
                      >
                        <Icon
                          weight={active ? 'fill' : 'regular'}
                          className={cn(
                            'h-[18px] w-[18px] shrink-0 transition-colors',
                            active
                              ? 'text-accent-300'
                              : 'text-gray-500 group-hover:text-gray-300'
                          )}
                        />
                        <span className="flex-1 font-medium">{link.label}</span>
                        <CaretRight
                          weight="bold"
                          className="h-3.5 w-3.5 text-gray-600 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      </Link>
                    </motion.div>
                  )
                })}
              </div>

              {/* ── Divider ── */}
              <div className="mx-4 h-px bg-white/[0.06]" />

              {/* ── Logout ── */}
              <div className="p-2">
                <motion.button
                  type="button"
                  onClick={onSignOut}
                  role="menuitem"
                  whileHover={prefersReducedMotion ? undefined : { x: 1 }}
                  transition={{
                    duration: motionDurations.fast,
                    ease: motionEasing.micro,
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 outline-none transition-all duration-150 hover:bg-red-500/[0.08] hover:text-red-400"
                >
                  <SignOut
                    weight="regular"
                    className="h-[18px] w-[18px] shrink-0 text-gray-600 transition-colors group-hover:text-red-400"
                  />
                  <span className="flex-1 font-medium">Sign out</span>
                </motion.button>
              </div>

              {/* Bottom padding */}
              <div className="h-1" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
