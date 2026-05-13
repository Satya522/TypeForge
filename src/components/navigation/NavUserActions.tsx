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
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          className="rounded-lg px-3 py-2 text-[13px] font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900 hover:bg-gray-50"
        >
          Log in
        </motion.button>

        <Link href="/register">
          <motion.div
            whileHover={
              prefersReducedMotion
                ? undefined
                : { scale: 1.035, y: -1 }
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
            <span className="group inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2 text-[13px] font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_6px_16px_rgba(0,0,0,0.12)] transition-all duration-200 hover:bg-gray-800 hover:shadow-[0_2px_6px_rgba(0,0,0,0.16),0_10px_24px_rgba(0,0,0,0.16)]">
              Start typing
              <ArrowRight
                weight="bold"
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
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
        whileHover={prefersReducedMotion ? undefined : { y: -1 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left outline-none transition-all duration-200',
          isOpen
            ? 'border-gray-200 bg-gray-50 shadow-sm'
            : 'border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50',
          'focus-visible:ring-2 focus-visible:ring-gray-300'
        )}
      >
        <Avatar
          src={avatarSrc}
          name={displayName}
          size={28}
          className="ring-1 ring-gray-200"
          fallbackClassName="text-[10px] font-bold tracking-wider text-gray-600"
        />

        <span className="hidden min-w-0 xl:block">
          <span className="block truncate text-[13px] font-medium leading-5 text-gray-800">
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
              isOpen ? 'text-gray-800' : 'text-gray-400'
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
            className="absolute right-0 top-[calc(100%+0.5rem)] z-[100] w-[260px] origin-top-right overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-[0_16px_48px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)]"
            role="menu"
          >
            {/* ── Profile header ── */}
            <div className="border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar
                  src={avatarSrc}
                  name={displayName}
                  size={38}
                  className="ring-2 ring-gray-100"
                  fallbackClassName="text-sm font-bold tracking-wider text-gray-600"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold leading-tight text-gray-900">
                    {displayName}
                  </p>
                  {session.user?.email && (
                    <p className="mt-0.5 truncate text-[11px] font-medium text-gray-400">
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
                        'group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-150',
                        active
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <Icon
                        weight={active ? 'fill' : 'regular'}
                        className={cn(
                          'h-[16px] w-[16px] shrink-0 transition-colors',
                          active
                            ? 'text-gray-900'
                            : 'text-gray-400 group-hover:text-gray-600'
                        )}
                      />
                      <span className="flex-1 font-medium">{link.label}</span>
                      <CaretRight
                        weight="bold"
                        className={cn(
                          'h-3 w-3 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100',
                          active
                            ? 'text-gray-500 opacity-100'
                            : 'text-gray-300 opacity-0'
                        )}
                      />
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* ── Divider ── */}
            <div className="mx-3 h-px bg-gray-100" />

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
                className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-gray-500 outline-none transition-all duration-150 hover:bg-red-50 hover:text-red-600"
              >
                <SignOut
                  weight="regular"
                  className="h-[16px] w-[16px] shrink-0 text-gray-400 transition-colors group-hover:text-red-500"
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
