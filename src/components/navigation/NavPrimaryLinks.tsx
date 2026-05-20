"use client";

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { KeyboardEvent, Ref, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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

const pillSpring = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 38,
  mass: 0.65,
};

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
  const [pendingActiveKey, setPendingActiveKey] = useState<string | null>(null);
  const pendingClearTimerRef = useRef<number | null>(null);

  const browseActive = isBrowsePathActive(pathname);
  const activeKey = browseActive
    ? BROWSE_KEY
    : primaryNavLinks.find((link) => isNavPathActive(pathname, link.href))?.href ?? null;
  const routeActiveKey = pendingActiveKey || activeKey;
  const pillKey = routeActiveKey;

  useEffect(() => {
    if (pendingActiveKey && pendingActiveKey === activeKey) {
      setPendingActiveKey(null);
    }
  }, [activeKey, pendingActiveKey]);

  useEffect(() => {
    return () => {
      if (pendingClearTimerRef.current) {
        window.clearTimeout(pendingClearTimerRef.current);
      }
    };
  }, []);

  const lockPendingTarget = (key: string) => {
    if (pendingClearTimerRef.current) {
      window.clearTimeout(pendingClearTimerRef.current);
    }

    setPendingActiveKey(key);
    pendingClearTimerRef.current = window.setTimeout(() => {
      setPendingActiveKey(null);
      pendingClearTimerRef.current = null;
    }, 1500);
  };

  const allItems = [
    ...primaryNavLinks.map((link) => ({ key: link.href, label: link.label, type: 'link' as const, href: link.href })),
    { key: BROWSE_KEY, label: 'Browse', type: 'browse' as const, href: '' },
  ];

  return (
    <div className="relative flex items-center gap-0.5">
      {allItems.map((item) => {
        const isActive = routeActiveKey === item.key;
        const isPillTarget = pillKey === item.key;

        if (item.type === 'browse') {
          return (
            <button
              key={item.key}
              ref={browseTriggerRef}
              type="button"
              aria-controls="browse-mega-menu"
              aria-expanded={isBrowseOpen}
              aria-haspopup="dialog"
              aria-label="Browse all TypeForge sections"
              className="relative inline-flex h-[36px] shrink-0 items-center justify-center gap-1.5 rounded-full px-[18px] text-[13.5px] font-[520] leading-none tracking-[-0.01em] outline-none transition-colors duration-0 focus-visible:ring-2 focus-visible:ring-white/20 hover:text-white hover:![transform:none]"
              onClick={() => {
                lockPendingTarget(BROWSE_KEY);
                onBrowseTriggerClick();
              }}
              onKeyDown={onBrowseTriggerKeyDown}
              onMouseEnter={() => {
                onBrowseTriggerEnter();
              }}
              onMouseLeave={() => {
                onBrowseTriggerLeave();
              }}
            >
              {isPillTarget && (
                <motion.span
                  layoutId="nav-hover-pill"
                  className="absolute inset-0 rounded-full bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/[0.02]"
                  transition={pillSpring}
                />
              )}
              <span
                className={cn(
                  'relative z-10 transition-colors duration-0',
                  isActive ? 'text-white font-semibold' : 'text-[#9aa0a6] hover:text-white'
                )}
              >
                {item.label}
              </span>
              <ChevronDown
                className={cn(
                  'relative z-10 h-4 w-4 transition-colors duration-0',
                  isBrowseOpen && 'rotate-180',
                  isActive ? 'text-white' : 'text-[#9aa0a6] group-hover:text-white'
                )}
              />
            </button>
          );
        }

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isNavPathActive(pathname, item.href) ? 'page' : undefined}
            onClick={() => lockPendingTarget(item.key)}
            className="group relative inline-flex h-[36px] shrink-0 items-center justify-center rounded-full px-[18px] text-[13.5px] font-[520] leading-none tracking-[-0.01em] outline-none transition-colors duration-0 focus-visible:ring-2 focus-visible:ring-white/20 hover:text-white hover:![transform:none]"
          >
            {isPillTarget && (
              <motion.span
                layoutId="nav-hover-pill"
                className="absolute inset-0 rounded-full bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/[0.02]"
                transition={pillSpring}
              />
            )}
            <span
              className={cn(
                'relative z-10 transition-colors duration-0',
                isActive ? 'text-white font-semibold' : 'text-[#9aa0a6] hover:text-white group-hover:text-white'
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
