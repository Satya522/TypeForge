'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import {
  Menu,
  ArrowRight,
} from 'lucide-react'
import {
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { cn } from '@/lib/utils'
import BrowseMegaMenu from '@/components/navigation/BrowseMegaMenu'
import MobileNavDrawer from '@/components/navigation/MobileNavDrawer'
import NavBrand from '@/components/navigation/NavBrand'
import NavPrimaryLinks from '@/components/navigation/NavPrimaryLinks'
import NavUserActions from '@/components/navigation/NavUserActions'

const smoothSpring = {
  type: 'spring' as const,
  stiffness: 360,
  damping: 34,
  mass: 0.8,
}

const softEase = [0.22, 1, 0.36, 1] as const

const fullHeaderVariants: Variants = {
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: smoothSpring,
  },
  hidden: {
    opacity: 0,
    y: -12,
    scale: 0.985,
    filter: 'blur(3px)',
    transition: { duration: 0.26, ease: softEase },
  },
}

const compactVariants: Variants = {
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { ...smoothSpring, delay: 0.04 },
  },
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    filter: 'blur(3px)',
    transition: { duration: 0.2, ease: softEase },
  },
}

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname() ?? '/'
  const prefersReducedMotion = useReducedMotion()

  const [navHidden, setNavHidden] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const lastScrollYRef = useRef(0)
  const tickingRef = useRef(false)



  const [isBrowseMenuOpen, setIsBrowseMenuOpen] = useState(false)
  const browseCloseTimerRef = useRef<number | null>(null)
  const browseTriggerRef = useRef<HTMLButtonElement>(null)
  const firstBrowseItemRef = useRef<HTMLAnchorElement>(null)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navRef = useRef<HTMLDivElement>(null)

  const handleSignOut = useCallback(() => {
    void signOut({ callbackUrl: '/login' })
  }, [])

  /* ── Scroll direction detection with 6px deadzone ── */
  useEffect(() => {
    const HIDE_THRESHOLD = 80
    const SHOW_THRESHOLD = 40
    const DELTA_THRESHOLD = 6

    const updateScroll = () => {
      const currentY = window.scrollY
      const prevY = lastScrollYRef.current
      const delta = currentY - prevY

      setIsScrolled(currentY > 10)

      if (currentY < SHOW_THRESHOLD) {
        setNavHidden(false)
      } else if (delta > DELTA_THRESHOLD && currentY > HIDE_THRESHOLD) {
        setNavHidden(true)
        setIsBrowseMenuOpen(false)
      } else if (delta < -DELTA_THRESHOLD) {
        setNavHidden(false)
      }

      lastScrollYRef.current = currentY
      tickingRef.current = false
    }

    const onScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true
        requestAnimationFrame(updateScroll)
      }
    }

    lastScrollYRef.current = window.scrollY
    updateScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Browse menu helpers ── */
  const clearBrowseCloseTimer = () => {
    if (browseCloseTimerRef.current) {
      window.clearTimeout(browseCloseTimerRef.current)
      browseCloseTimerRef.current = null
    }
  }

  const openBrowseMenu = () => {
    clearBrowseCloseTimer()
    setIsBrowseMenuOpen(true)
  }

  const closeBrowseMenu = (options?: { returnFocus?: boolean }) => {
    clearBrowseCloseTimer()
    setIsBrowseMenuOpen(false)
    if (options?.returnFocus) {
      window.requestAnimationFrame(() => browseTriggerRef.current?.focus())
    }
  }

  const scheduleBrowseMenuClose = () => {
    clearBrowseCloseTimer()
    browseCloseTimerRef.current = window.setTimeout(() => {
      setIsBrowseMenuOpen(false)
    }, 150)
  }

  const handleBrowseTriggerKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>
  ) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openBrowseMenu()
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      closeBrowseMenu({ returnFocus: true })
    }
  }

  useEffect(() => {
    closeBrowseMenu()
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow =
      isMobileMenuOpen || isBrowseMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen, isBrowseMenuOpen])

  useEffect(() => {
    if (!isBrowseMenuOpen && !isMobileMenuOpen) return
    const handlePointerDown = (event: MouseEvent) => {
      if (isBrowseMenuOpen && !navRef.current?.contains(event.target as Node)) {
        closeBrowseMenu()
      }

    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeBrowseMenu({ returnFocus: isBrowseMenuOpen })
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isBrowseMenuOpen, isMobileMenuOpen])

  useEffect(
    () => () => {
      clearBrowseCloseTimer()
    },
    []
  )

  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/register/')

  if (isAuthRoute) {
    return null
  }

  const fullNavIsHidden = navHidden && !isBrowseMenuOpen

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
       *  FULL DESKTOP HEADER — Brand outside + Nav Pill
       *  Hides on scroll down with blur + spring
       * ═══════════════════════════════════════════════════════════ */}
      <motion.header
        ref={navRef}
        variants={prefersReducedMotion ? undefined : fullHeaderVariants}
        initial="visible"
        animate={fullNavIsHidden ? 'hidden' : 'visible'}
        style={{ pointerEvents: fullNavIsHidden ? 'none' : 'auto' }}
        className="fixed top-0 left-0 right-0 z-50 hidden pt-3.5 lg:block"
      >
        <div className="mx-auto flex w-[min(calc(100%-32px),1240px)] items-center justify-center">
          {/* ── Brand: OUTSIDE the pill, anchored left ── */}
          <div className="absolute left-[max(16px,calc((100%-1240px)/2))] z-10">
            <NavBrand pathname={pathname} />
          </div>

          {/* ── Main Nav Pill ── */}
          <nav
            className={cn(
              'nav-noise relative ml-[180px] flex items-center rounded-full border backdrop-blur-2xl transition-all duration-500 ease-out',
              isScrolled
                ? 'border-white/[0.1] bg-gradient-to-b from-[#111827]/95 to-[#0a1120]/95 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'border-white/[0.08] bg-gradient-to-b from-[#0f172a]/90 to-[#080f1e]/90 shadow-[0_12px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.06)]'
            )}
          >
            <div className="flex items-center p-1.5 gap-0.5">
              {/* Nav links */}
              <NavPrimaryLinks
                browseTriggerRef={browseTriggerRef}
                isBrowseOpen={isBrowseMenuOpen}
                onBrowseTriggerClick={() => setIsBrowseMenuOpen((o) => !o)}
                onBrowseTriggerEnter={openBrowseMenu}
                onBrowseTriggerKeyDown={handleBrowseTriggerKeyDown}
                onBrowseTriggerLeave={scheduleBrowseMenuClose}
                pathname={pathname}
              />

              {/* Spacer / Auth actions */}
              <NavUserActions
                onSignIn={() => signIn()}
                onSignOut={handleSignOut}
                pathname={pathname}
                session={session ?? null}
              />
            </div>

            {/* Browse mega menu anchored to pill */}
            <BrowseMegaMenu
              firstItemRef={firstBrowseItemRef}
              onClose={closeBrowseMenu}
              onHoverEnd={scheduleBrowseMenuClose}
              onHoverStart={openBrowseMenu}
              open={isBrowseMenuOpen}
              pathname={pathname}
            />
          </nav>
        </div>
      </motion.header>

      {/* Browse backdrop */}
      <AnimatePresence>
        {isBrowseMenuOpen && (
          <motion.button
            type="button"
            aria-label="Close browse menu"
            className="fixed inset-0 z-40 hidden bg-black/20 backdrop-blur-sm lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: softEase }}
            onClick={() => closeBrowseMenu()}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={prefersReducedMotion ? undefined : compactVariants}
        initial="hidden"
        animate={fullNavIsHidden ? 'visible' : 'hidden'}
        style={{ pointerEvents: fullNavIsHidden ? 'auto' : 'none' }}
        className="nav-noise fixed left-5 top-4 z-50 hidden items-center rounded-full border border-white/[0.1] bg-gradient-to-b from-[#111827]/95 to-[#0a1120]/95 px-3 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl lg:flex"
      >
        <NavBrand pathname={pathname} compact />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
       *  COMPACT CONTROLS — Black CTA pill + Hamburger circle
       *  Hamburger click restores the full navbar
       * ═══════════════════════════════════════════════════════════ */}
      <motion.div
        variants={prefersReducedMotion ? undefined : compactVariants}
        initial="hidden"
        animate={fullNavIsHidden ? 'visible' : 'hidden'}
        style={{ pointerEvents: fullNavIsHidden ? 'auto' : 'none' }}
        className="fixed top-4 right-5 z-50 hidden items-center gap-2.5 lg:flex"
      >
        <Link href="/register">
          <motion.span
            whileHover={prefersReducedMotion ? undefined : { scale: 1.035, y: -1 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.975 }}
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#1a73e8] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(26,115,232,0.3),0_16px_44px_rgba(26,115,232,0.22)] transition-all duration-200 hover:bg-[#236ff2] hover:shadow-[0_4px_14px_rgba(26,115,232,0.42),0_18px_48px_rgba(26,115,232,0.28)]"
          >
            Start typing
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </motion.span>
        </Link>

        <motion.button
          type="button"
          onClick={() => setNavHidden(false)}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
          aria-label="Show navigation"
          className="relative flex h-[46px] w-[46px] items-center justify-center rounded-full border border-white/[0.1] bg-gradient-to-b from-[#111827]/95 to-[#0a1120]/95 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl transition-all duration-200 hover:bg-[#0f1d32] hover:shadow-[0_14px_44px_rgba(0,0,0,0.55)]"
        >
          <Menu className="h-[18px] w-[18px] text-[#6fa7ff]" />
        </motion.button>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
       *  MOBILE: Brand + hamburger → drawer
       * ═══════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 pt-3 lg:hidden">
        <NavBrand pathname={pathname} />
        <motion.button
          type="button"
          whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[#07101f]/88 text-[#9fcbff] shadow-[0_12px_30px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all hover:bg-[#0c1830] hover:text-white"
          aria-expanded={isMobileMenuOpen}
          aria-label="Open navigation menu"
        >
          <Menu className="h-[18px] w-[18px]" />
        </motion.button>
      </header>

      <MobileNavDrawer
        onClose={() => setIsMobileMenuOpen(false)}
        onSignIn={() => signIn()}
        onSignOut={handleSignOut}
        open={isMobileMenuOpen}
        pathname={pathname}
        session={session ?? null}
      />
    </>
  )
}
