"use client";

import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { KeyboardEvent as ReactKeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import BrowseMegaMenu from '@/components/navigation/BrowseMegaMenu';
import MobileNavDrawer from '@/components/navigation/MobileNavDrawer';
import NavAurora from '@/components/navigation/NavAurora';
import NavBrand from '@/components/navigation/NavBrand';
import NavPrimaryLinks from '@/components/navigation/NavPrimaryLinks';
import NavUserActions from '@/components/navigation/NavUserActions';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname() ?? '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBrowseMenuOpen, setIsBrowseMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  const [isNavHovered, setIsNavHovered] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);
  const navShellRef = useRef<HTMLDivElement>(null);
  const browseTriggerRef = useRef<HTMLButtonElement>(null);
  const firstBrowseItemRef = useRef<HTMLAnchorElement>(null);
  const browseCloseTimerRef = useRef<number | null>(null);

  /* ── GSAP Entrance ── */
  useEffect(() => {
    if (!navShellRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        navShellRef.current,
        { y: -90, opacity: 0, scale: 0.92 },
        { y: 0, opacity: 1, scale: 1, duration: 1.4, ease: 'elastic.out(1, 0.55)', delay: 0.15 }
      );
    });
    return () => ctx.revert();
  }, []);

  /* ── Mouse Spotlight ── */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  /* ── Browse Menu Logic ── */
  const clearBrowseCloseTimer = () => {
    if (browseCloseTimerRef.current) {
      window.clearTimeout(browseCloseTimerRef.current);
      browseCloseTimerRef.current = null;
    }
  };

  const openBrowseMenu = () => {
    clearBrowseCloseTimer();
    setIsBrowseMenuOpen(true);
  };

  const closeBrowseMenu = (options?: { returnFocus?: boolean }) => {
    clearBrowseCloseTimer();
    setIsBrowseMenuOpen(false);
    if (options?.returnFocus) {
      window.requestAnimationFrame(() => browseTriggerRef.current?.focus());
    }
  };

  const scheduleBrowseMenuClose = () => {
    clearBrowseCloseTimer();
    browseCloseTimerRef.current = window.setTimeout(() => {
      setIsBrowseMenuOpen(false);
    }, 120);
  };

  /* ── Effects ── */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    closeBrowseMenu();
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen || isBrowseMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen, isBrowseMenuOpen]);

  useEffect(() => {
    if (!isBrowseMenuOpen && !isMobileMenuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (isBrowseMenuOpen && !navRef.current?.contains(event.target as Node)) closeBrowseMenu();
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeBrowseMenu({ returnFocus: isBrowseMenuOpen });
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isBrowseMenuOpen, isMobileMenuOpen]);

  useEffect(() => () => clearBrowseCloseTimer(), []);

  const handleBrowseTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openBrowseMenu();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      closeBrowseMenu({ returnFocus: true });
    }
  };

  const isPracticeSession = pathname.startsWith('/practice/') && pathname.split('/').length > 2;

  return (
    <>
      <header 
        className={cn(
          "fixed inset-x-0 top-0 z-50 w-full group/nav",
          isPracticeSession ? "h-3" : "h-auto" // A small hit-box when hidden
        )}
      >
        <div 
          className={cn(
            "transition-transform duration-500 origin-top h-full",
            // Hide the nav almost completely (leave 3px so it can be hovered easily at the very top edge)
            isPracticeSession && !isBrowseMenuOpen
              ? "-translate-y-[calc(100%-3px)] group-hover/nav:translate-y-0" 
              : "translate-y-0"
          )}
        >
          <nav className="w-full relative">
            <div ref={navShellRef} style={{ opacity: 0 }}>
              {/* ── Main Navbar Body ── */}
              <div
                ref={navRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsNavHovered(true)}
                onMouseLeave={() => { setIsNavHovered(false); setMousePos({ x: -200, y: -200 }); }}
                className={cn(
                  'relative nav-noise border-b transition-all duration-500',
                  isScrolled 
                    ? 'bg-[#060908]/80 backdrop-blur-2xl border-white/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(57,255,20,0.03)]' 
                    : 'bg-[#060908] border-transparent'
                )}
              >
                <div className="pointer-events-none absolute inset-0 z-0 opacity-50 overflow-hidden rounded-b-[2rem]">
              {/* Living aurora light beams */}
              <NavAurora />
              {/* Mouse-following spotlight */}
              <div
                className="absolute inset-0 transition-opacity duration-300"
                aria-hidden="true"
                style={{
                  opacity: isNavHovered ? 1 : 0,
                  background: `radial-gradient(520px circle at ${mousePos.x}px ${mousePos.y}px, rgba(57,255,20,0.07), transparent 40%)`,
                }}
              />
            </div>

            {/* Top accent line */}
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-300/20 to-transparent transition-opacity duration-500",
                isScrolled ? "opacity-100" : "opacity-0"
              )}
              aria-hidden="true"
            />

            {/* Bottom subtle line */}
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent transition-opacity duration-500",
                isScrolled ? "opacity-100" : "opacity-0"
              )}
              aria-hidden="true"
            />

            {/* ── Content Row ── */}
            <div className="mx-auto max-w-7xl relative z-10 flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
              <NavBrand pathname={pathname} />

              <NavPrimaryLinks
                browseTriggerRef={browseTriggerRef}
                isBrowseOpen={isBrowseMenuOpen}
                onBrowseTriggerClick={() => setIsBrowseMenuOpen((o) => !o)}
                onBrowseTriggerEnter={openBrowseMenu}
                onBrowseTriggerKeyDown={handleBrowseTriggerKeyDown}
                onBrowseTriggerLeave={scheduleBrowseMenuClose}
                pathname={pathname}
              />

              <NavUserActions
                onSignIn={() => signIn()}
                onSignOut={() => signOut()}
                pathname={pathname}
                session={session ?? null}
              />

              {/* ── Mobile Hamburger ── */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsMobileMenuOpen(true)}
                className="ml-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-gray-200 transition-colors hover:bg-white/[0.06] lg:hidden"
                aria-expanded={isMobileMenuOpen}
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </motion.button>
            </div>

            <BrowseMegaMenu
              firstItemRef={firstBrowseItemRef}
              onClose={closeBrowseMenu}
              onHoverEnd={scheduleBrowseMenuClose}
              onHoverStart={openBrowseMenu}
              open={isBrowseMenuOpen}
              pathname={pathname}
            />
          </div>
        </div>
      </nav>
        </div>
      </header>

      {/* Browse overlay */}
      <AnimatePresence>
        {isBrowseMenuOpen && (
          <motion.button
            type="button"
            aria-label="Close browse menu"
            className="fixed inset-0 z-40 hidden bg-[#060908]/70 backdrop-blur-md lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeBrowseMenu()}
          />
        )}
      </AnimatePresence>

      <MobileNavDrawer
        onClose={() => setIsMobileMenuOpen(false)}
        onSignIn={() => signIn()}
        onSignOut={() => signOut()}
        open={isMobileMenuOpen}
        pathname={pathname}
        session={session ?? null}
      />
    </>
  );
}
