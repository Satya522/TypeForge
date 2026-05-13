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

  const pillKey = hoveredKey || routeActiveKey;

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
    <div
      className="relative flex items-center gap-0.5"
      onMouseLeave={() => setHoveredKey(null)}
    >
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
              className="relative inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-gray-400/40"
              onClick={() => {
                lockPendingTarget(BROWSE_KEY);
                onBrowseTriggerClick();
              }}
              onKeyDown={onBrowseTriggerKeyDown}
              onMouseEnter={() => {
                setHoveredKey(BROWSE_KEY);
                onBrowseTriggerEnter();
              }}
              onMouseLeave={() => {
                onBrowseTriggerLeave();
              }}
            >
              {isPillTarget && (
                <motion.span
                  layoutId="nav-hover-pill"
                  className="absolute inset-0 rounded-lg bg-gray-100"
                  transition={pillSpring}
                />
              )}
              <span
                className={cn(
                  'relative z-10 transition-colors duration-150',
                  isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                )}
              >
                {item.label}
              </span>
              <ChevronDown
                className={cn(
                  'relative z-10 h-3.5 w-3.5 transition-all duration-200',
                  isBrowseOpen && 'rotate-180',
                  isActive ? 'text-gray-900' : 'text-gray-400'
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
            onMouseEnter={() => setHoveredKey(item.key)}
            className="relative shrink-0 rounded-lg px-3 py-2 text-[13px] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-gray-400/40"
          >
            {isPillTarget && (
              <motion.span
                layoutId="nav-hover-pill"
                className="absolute inset-0 rounded-lg bg-gray-100"
                transition={pillSpring}
              />
            )}
            <span
              className={cn(
                'relative z-10 transition-colors duration-150',
                isActive ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-800'
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
