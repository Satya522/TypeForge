"use client";

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { KeyboardEvent, Ref, useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { isBrowsePathActive, isNavPathActive, primaryNavLinks } from './nav-data';

type NavPrimaryLinksProps = {
  browseTriggerRef: Ref<HTMLButtonElement>;
  isBrowseOpen: boolean;
  onBrowseTriggerClick: () => void;
  onBrowseTriggerEnter: () => void;
  onBrowseTriggerKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onBrowseTriggerLeave: () => void;
  pathname: string;
};

const BROWSE_KEY = '__browse__';

export default function NavPrimaryLinks({
  browseTriggerRef,
  isBrowseOpen,
  onBrowseTriggerClick,
  onBrowseTriggerEnter,
  onBrowseTriggerKeyDown,
  onBrowseTriggerLeave,
  pathname,
}: NavPrimaryLinksProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const pillContainerRef = useRef<HTMLDivElement>(null);

  const browseActive = isBrowseOpen || isBrowsePathActive(pathname);
  const activeKey = browseActive
    ? BROWSE_KEY
    : primaryNavLinks.find((l) => isNavPathActive(pathname, l.href))?.href ?? null;

  const indicatorKey = hoveredKey || activeKey;

  /* ── GSAP 3D Tilt on the pill container ── */
  const handleTiltMove = useCallback((e: React.MouseEvent) => {
    const el = pillContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(el, {
      rotateY: x * 6,
      rotateX: -y * 8,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }, []);

  const handleTiltLeave = useCallback(() => {
    gsap.to(pillContainerRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.4)',
      overwrite: 'auto',
    });
  }, []);

  /* GSAP entrance */
  useEffect(() => {
    if (!pillContainerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pillContainerRef.current,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(1.5)', delay: 0.45 }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="nav-perspective hidden min-w-0 flex-1 items-center justify-center lg:flex">
      <div
        ref={pillContainerRef}
        onMouseMove={handleTiltMove}
        onMouseLeave={() => { handleTiltLeave(); setHoveredKey(null); }}
        style={{ opacity: 0, transformStyle: 'preserve-3d' }}
        className="relative mx-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-white/[0.06] bg-white/[0.025] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(0,0,0,0.2)] backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {primaryNavLinks.map((link) => {
          const active = isNavPathActive(pathname, link.href);
          const isTarget = indicatorKey === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={() => setHoveredKey(link.href)}
              className="relative shrink-0 rounded-full px-2.5 py-2 text-[13px] font-medium outline-none transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-accent-300/50 xl:px-3 xl:text-sm 2xl:px-3.5"
            >
              {/* ── Sliding pill indicator with glow halo ── */}
              {isTarget && (
                <motion.div
                  layoutId="nav-active-pill"
                  className={cn(
                    'absolute inset-0 rounded-full border',
                    active
                      ? 'border-accent-300/30 bg-accent-300/[0.14] shadow-[0_0_28px_rgba(57,255,20,0.16),inset_0_1px_0_rgba(57,255,20,0.1)]'
                      : 'border-accent-300/10 bg-accent-300/[0.04] shadow-[0_0_12px_rgba(57,255,20,0.03)]'
                  )}
                  transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.8 }}
                  style={{ borderRadius: 9999 }}
                />
              )}

              <span
                className={cn(
                  'relative z-10 transition-colors duration-200',
                  active
                    ? 'text-accent-100 font-semibold'
                    : hoveredKey === link.href
                      ? 'text-accent-300'
                      : 'text-gray-400'
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}

        {/* ── Browse button ── */}
        <button
          ref={browseTriggerRef}
          type="button"
          aria-controls="browse-mega-menu"
          aria-expanded={isBrowseOpen}
          aria-haspopup="dialog"
          aria-label="Browse all TypeForge sections"
          className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-[13px] font-medium outline-none transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-accent-300/50 xl:gap-2 xl:px-3 xl:text-sm 2xl:px-3.5"
          onClick={onBrowseTriggerClick}
          onKeyDown={onBrowseTriggerKeyDown}
          onMouseEnter={() => { setHoveredKey(BROWSE_KEY); onBrowseTriggerEnter(); }}
          onMouseLeave={() => { onBrowseTriggerLeave(); }}
        >
          {indicatorKey === BROWSE_KEY && (
            <motion.div
              layoutId="nav-active-pill"
              className={cn(
                'absolute inset-0 rounded-full border',
                browseActive
                  ? 'border-accent-300/30 bg-accent-300/[0.14] shadow-[0_0_28px_rgba(57,255,20,0.16),inset_0_1px_0_rgba(57,255,20,0.1)]'
                  : 'border-accent-300/10 bg-accent-300/[0.04] shadow-[0_0_12px_rgba(57,255,20,0.03)]'
              )}
              transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.8 }}
              style={{ borderRadius: 9999 }}
            />
          )}
          <span
            className={cn(
              'relative z-10 transition-colors duration-200',
              browseActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-accent-300'
            )}
          >
            Browse
          </span>
          <motion.span
            className="relative z-10"
            animate={{ rotate: isBrowseOpen ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <ChevronDown className={cn('h-4 w-4 transition-colors', browseActive ? 'text-accent-200' : 'text-gray-500')} />
          </motion.span>
        </button>
      </div>
    </div>
  );
}
