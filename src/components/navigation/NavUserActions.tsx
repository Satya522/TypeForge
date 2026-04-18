"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Session } from 'next-auth';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { isNavPathActive, userNavLinks } from './nav-data';

// Phosphor Icons — premium, duo-tone feel
import {
  CaretDown,
  SignIn,
  SignOut,
  SquaresFour,
  UserCircle,
  CaretRight,
  Trophy,
  ChartLine,
} from '@phosphor-icons/react';

type NavUserActionsProps = {
  onSignIn: () => void;
  onSignOut: () => void;
  pathname: string;
  session: Session | null;
};

const iconMap: Record<string, React.ElementType> = {
  Dashboard: SquaresFour,
  Profile: UserCircle,
  Achievements: Trophy,
  Analytics: ChartLine,
};

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || 'P';
  const parts = source.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

export default function NavUserActions({ onSignIn, onSignOut, pathname, session }: NavUserActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const displayName = useMemo(
    () => session?.user?.name?.trim() || session?.user?.email?.split('@')[0] || 'Profile',
    [session]
  );
  const initials = useMemo(() => getInitials(session?.user?.name, session?.user?.email), [session]);

  /* GSAP entrance */
  useEffect(() => {
    if (!actionsRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        actionsRef.current,
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.5 }
      );
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setIsOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  /* ── Unauthenticated ── */
  if (!session) {
    return (
      <div ref={actionsRef} className="hidden shrink-0 items-center gap-2 lg:flex" style={{ opacity: 0 }}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
          <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
            <Button variant="primary" size="sm" className="rounded-full px-5 cta-glow-pulse btn-shimmer-sweep">
              Sign Up
            </Button>
          </motion.div>
        </Link>
      </div>
    );
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
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            'inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-left outline-none transition-all duration-200',
            'hover:border-accent-300/25 hover:bg-accent-300/[0.04]',
            'focus-visible:ring-2 focus-visible:ring-accent-300/50',
            isOpen && 'border-accent-300/30 bg-accent-300/[0.05] shadow-[0_0_24px_rgba(57,255,20,0.08)]'
          )}
        >
          {/* Avatar */}
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? 'Profile photo'}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full ring-1 ring-white/10 object-cover"
            />
          ) : (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-300/30 to-accent-300/10 text-[11px] font-bold uppercase tracking-wider text-accent-100 ring-1 ring-accent-300/20">
              {initials}
            </span>
          )}

          {/* Name (only on xl) */}
          <span className="hidden min-w-0 xl:block">
            <span className="block truncate text-[13px] font-semibold leading-5 text-white">{displayName}</span>
          </span>

          {/* Caret */}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="flex items-center"
          >
            <CaretDown weight="bold" className={cn('h-3.5 w-3.5 transition-colors', isOpen ? 'text-accent-300' : 'text-gray-500')} />
          </motion.span>
        </motion.button>

        {/* ── Dropdown panel ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              className="absolute right-0 top-[calc(100%+0.65rem)] z-[100] w-[260px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#060805] shadow-[0_28px_80px_rgba(0,0,0,0.55)]"
              role="menu"
            >
              {/* Top accent line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-300/50 to-transparent" />

              {/* ── Profile header ── */}
              <div className="flex items-center gap-3 px-4 py-4">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? 'Profile photo'}
                    width={42}
                    height={42}
                    className="h-[42px] w-[42px] rounded-full ring-2 ring-accent-300/20 object-cover"
                  />
                ) : (
                  <span className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-300/25 to-accent-300/5 text-sm font-bold uppercase tracking-wider text-accent-100 ring-2 ring-accent-300/20">
                    {initials}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-white leading-tight">{displayName}</p>
                  {session.user?.email && (
                    <p className="truncate text-[11px] text-gray-500 mt-0.5">{session.user.email}</p>
                  )}
                  {/* Online indicator */}
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-accent-300/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-300 animate-pulse" />
                    Online
                  </span>
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="mx-4 h-px bg-white/[0.06]" />

              {/* ── Nav items ── */}
              <div className="p-2">
                {userNavLinks.map((link, idx) => {
                  const Icon = iconMap[link.label] ?? UserCircle;
                  const active = isNavPathActive(pathname, link.href);
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
                          className={cn('h-[18px] w-[18px] shrink-0 transition-colors', active ? 'text-accent-300' : 'text-gray-500 group-hover:text-gray-300')}
                        />
                        <span className="flex-1 font-medium">{link.label}</span>
                        <CaretRight
                          weight="bold"
                          className="h-3.5 w-3.5 text-gray-600 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      </Link>
                    </motion.div>
                  );
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
                  whileHover={{ x: 2 }}
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
  );
}
