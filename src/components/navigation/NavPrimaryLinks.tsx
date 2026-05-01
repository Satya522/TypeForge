"use client";

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { KeyboardEvent, Ref, useEffect, useRef, useState } from 'react';
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
  const [pendingActiveKey, setPendingActiveKey] = useState<string | null>(null);
  const pendingClearTimerRef = useRef<number | null>(null);

  const browseActive = isBrowsePathActive(pathname);
  const activeKey = browseActive
    ? BROWSE_KEY
    : primaryNavLinks.find((link) => isNavPathActive(pathname, link.href))?.href ?? null;
  const indicatorKey = pendingActiveKey || activeKey;

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

  return (
    <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
      <div className="relative mx-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/[0.08] bg-[#3c4043]/95 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {primaryNavLinks.map((link) => {
          const active = indicatorKey === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isNavPathActive(pathname, link.href) ? 'page' : undefined}
              onClick={() => lockPendingTarget(link.href)}
              className="relative shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {active && (
                <span className="absolute inset-0 rounded-full bg-black shadow-sm" />
              )}
              <span
                className={cn(
                  'relative z-10 transition-colors duration-150',
                  active ? 'text-white' : 'text-[#b8bdc1] hover:text-white'
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}

        <button
          ref={browseTriggerRef}
          type="button"
          aria-controls="browse-mega-menu"
          aria-expanded={isBrowseOpen}
          aria-haspopup="dialog"
          aria-label="Browse all TypeForge sections"
          className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-semibold outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-white/50"
          onClick={() => {
            lockPendingTarget(BROWSE_KEY);
            onBrowseTriggerClick();
          }}
          onKeyDown={onBrowseTriggerKeyDown}
          onMouseEnter={onBrowseTriggerEnter}
          onMouseLeave={onBrowseTriggerLeave}
        >
          {indicatorKey === BROWSE_KEY && (
            <span className="absolute inset-0 rounded-full bg-black shadow-sm" />
          )}
          <span
            className={cn(
              'relative z-10 transition-colors duration-150',
              indicatorKey === BROWSE_KEY ? 'text-white' : 'text-[#b8bdc1]'
            )}
          >
            Browse
          </span>
          <ChevronDown
            className={cn(
              'relative z-10 h-4 w-4 transition-transform duration-150',
              isBrowseOpen && 'rotate-180',
              indicatorKey === BROWSE_KEY ? 'text-white' : 'text-[#b8bdc1]'
            )}
          />
        </button>
      </div>
    </div>
  );
}
