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
        <Link href="/login">
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
              className="h-12 rounded-full px-7 text-base font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
            >
              <SignIn weight="bold" className="mr-2 h-4 w-4" />
              Log in
            </Button>
          </motion.div>
        </Link>

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
              className="h-12 rounded-full border border-[#6ea4ff]/20 bg-[#1a73e8] px-7 text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_24px_rgba(26,115,232,0.28)] hover:bg-[#2b7ff0]"
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
            'hover:border-[#4f8dfd]/24 hover:bg-[#4f8dfd]/[0.08]',
            'focus-visible:ring-2 focus-visible:ring-accent-300/50',
            isOpen &&
              'border-[#4f8dfd]/28 bg-[#4f8dfd]/[0.09] shadow-[0_18px_36px_rgba(0,0,0,0.22)]'
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
              initial={{
                opacity: 0,
                rotateX: prefersReducedMotion ? 0 : -7,
                scale: 0.96,
                y: 14,
              }}
              animate={{ opacity: 1, rotateX: 0, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                rotateX: prefersReducedMotion ? 0 : -4,
                scale: 0.97,
                y: 8,
              }}
              transition={{
                duration: motionDurations.fast,
                ease: motionEasing.premium,
              }}
              className="absolute right-0 top-[calc(100%+0.75rem)] z-[100] w-[302px] origin-top-right overflow-hidden rounded-[1.35rem] border border-white/18 bg-[#050811] text-white shadow-[0_34px_95px_rgba(0,0,0,0.78),0_0_0_1px_rgba(139,182,255,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] [transform-style:preserve-3d]"
              role="menu"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(79,141,253,0.16),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(125,255,77,0.08),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.012)_42%,transparent)]" />
              <div className="pointer-events-none absolute inset-0 bg-[#050811]/82" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8bb6ff]/80 to-transparent" />

              {/* ── Profile header ── */}
              <div className="relative px-4 pb-4 pt-4">
                <motion.div
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 5 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.04,
                    duration: 0.24,
                    ease: motionEasing.premium,
                  }}
                  className="flex items-center gap-3 rounded-[1.15rem] border border-white/[0.09] bg-[#0b1220] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_14px_34px_rgba(0,0,0,0.28)]"
                >
                  <div className="relative shrink-0">
                    <motion.div
                      aria-hidden="true"
                      animate={
                        prefersReducedMotion
                          ? undefined
                          : {
                              opacity: [0.28, 0.58, 0.28],
                              rotate: [0, 18, 0],
                              scale: [0.96, 1.04, 0.96],
                            }
                      }
                      transition={{
                        duration: 3.4,
                        ease: 'easeInOut',
                        repeat: Infinity,
                      }}
                      className="absolute -inset-1 rounded-full bg-[conic-gradient(from_180deg,#4f8dfd,#7dff4d,#4f8dfd)] blur-[6px]"
                    />
                    <Avatar
                      src={avatarSrc}
                      name={displayName}
                      size={46}
                      className="relative ring-2 ring-white/16"
                      fallbackClassName="text-sm font-bold tracking-wider text-accent-100"
                    />
                    <motion.span
                      aria-hidden="true"
                      animate={
                        prefersReducedMotion
                          ? undefined
                          : {
                              boxShadow: [
                                '0 0 10px rgba(125,255,77,0.5)',
                                '0 0 22px rgba(125,255,77,0.85)',
                                '0 0 10px rgba(125,255,77,0.5)',
                              ],
                            }
                      }
                      transition={{
                        duration: 1.8,
                        ease: 'easeInOut',
                        repeat: Infinity,
                      }}
                      className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#090d18] bg-[#7dff4d]"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-[13px] font-bold leading-tight text-white">
                        {displayName}
                      </p>
                      <motion.span
                        animate={
                          prefersReducedMotion
                            ? undefined
                            : { opacity: [0.86, 1, 0.86] }
                        }
                        transition={{
                          duration: 2.2,
                          ease: 'easeInOut',
                          repeat: Infinity,
                        }}
                        className="shrink-0 rounded-full border border-[#7dff4d]/22 bg-[#7dff4d]/10 px-1.5 py-px text-[8px] font-black uppercase tracking-[0.12em] text-[#b7ff9f] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                      >
                        Live
                      </motion.span>
                    </div>
                    {session.user?.email && (
                      <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
                        {session.user.email}
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* ── Divider ── */}
              <div className="relative mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />

              {/* ── Nav items ── */}
              <div className="relative space-y-1.5 p-2">
                {userNavLinks.map((link, idx) => {
                  const Icon = iconMap[link.label] ?? UserCircle
                  const active = isNavPathActive(pathname, link.href)
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={
                        prefersReducedMotion ? undefined : { scale: 1.012, x: 1 }
                      }
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                      transition={{ delay: 0.04 * idx, duration: 0.2 }}
                    >
                      <Link
                        href={link.href}
                        role="menuitem"
                        className={cn(
                          'group relative flex items-center gap-3 overflow-hidden rounded-full border px-3.5 py-3 text-sm outline-none transition-all duration-200',
                          active
                            ? 'border-[#4f8dfd]/26 bg-[#102044] text-[#edf4ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(79,141,253,0.12)]'
                            : 'border-transparent bg-transparent text-slate-300 hover:border-white/[0.07] hover:bg-[#0d1320] hover:text-white'
                        )}
                      >
                        {active && (
                          <motion.span
                            aria-hidden="true"
                            initial={{ x: '-120%' }}
                            animate={
                              prefersReducedMotion
                                ? { x: '-120%' }
                                : { x: ['-120%', '155%'] }
                            }
                            transition={{
                              duration: 2.6,
                              ease: 'easeInOut',
                              repeat: Infinity,
                              repeatDelay: 1.1,
                            }}
                            className="pointer-events-none absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/12 to-transparent"
                          />
                        )}
                        <Icon
                          weight={active ? 'fill' : 'regular'}
                          className={cn(
                            'h-[18px] w-[18px] shrink-0 transition-colors',
                            active
                              ? 'text-[#4f8dfd]'
                              : 'text-slate-500 group-hover:text-slate-300'
                          )}
                        />
                        <span className="flex-1 font-semibold">{link.label}</span>
                        <CaretRight
                          weight="bold"
                          className={cn(
                            'h-3.5 w-3.5 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100',
                            active
                              ? 'text-[#8bb6ff] opacity-100'
                              : 'text-slate-600 opacity-0'
                          )}
                        />
                      </Link>
                    </motion.div>
                  )
                })}
              </div>

              {/* ── Divider ── */}
              <div className="relative mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />

              {/* ── Logout ── */}
              <div className="relative p-2">
                <motion.button
                  type="button"
                  onClick={onSignOut}
                  role="menuitem"
                  whileHover={
                    prefersReducedMotion ? undefined : { scale: 1.012, x: 1 }
                  }
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                  transition={{
                    duration: motionDurations.fast,
                    ease: motionEasing.micro,
                  }}
                  className="group flex w-full items-center gap-3 rounded-full border border-transparent px-3.5 py-3 text-sm text-slate-400 outline-none transition-all duration-200 hover:border-red-300/10 hover:bg-[#1a0d14] hover:text-red-300"
                >
                  <SignOut
                    weight="regular"
                    className="h-[18px] w-[18px] shrink-0 text-slate-600 transition-colors group-hover:text-red-300"
                  />
                  <span className="flex-1 text-left font-semibold">Sign out</span>
                  <span className="rounded-full border border-red-400/10 bg-red-400/[0.06] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-red-200/70 opacity-0 transition-opacity group-hover:opacity-100">
                    Exit
                  </span>
                </motion.button>
              </div>

              {/* Bottom padding */}
              <div className="relative h-2" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
