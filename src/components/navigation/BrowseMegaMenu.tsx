"use client";

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Ref } from 'react';
import { Button } from '@/components/ui/button';
import BrowseColumn from './BrowseColumn';
import { browseAllSectionsLink, browseColumns } from './nav-data';

type BrowseMegaMenuProps = {
  firstItemRef: Ref<HTMLAnchorElement>;
  onClose: () => void;
  onHoverEnd: () => void;
  onHoverStart: () => void;
  open: boolean;
  pathname: string;
};

/* Staggered reveal variants */
const containerVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.23, 1, 0.32, 1],
      staggerChildren: 0.07,
      delayChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: 12,
    transition: { duration: 0.16, ease: 'easeIn' },
  },
};

const columnVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: [0.23, 1, 0.32, 1] },
  },
};

const headerVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export default function BrowseMegaMenu({
  firstItemRef,
  onClose,
  onHoverEnd,
  onHoverStart,
  open,
  pathname,
}: BrowseMegaMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="browse-mega-menu"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-x-0 top-full z-[60] pt-4"
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
          role="dialog"
          aria-modal="false"
          aria-label="Browse TypeForge sections"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/60 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            {/* Decorative gradient orbs */}
            <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-accent-300/8 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-accent-300/5 blur-3xl" aria-hidden="true" />

            {/* Top shine line */}
            <div className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden="true" />

            {/* Header */}
            <motion.div
              variants={headerVariants}
              className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-4"
            >
              <div>
                <p className="text-sm font-semibold text-white">Explore TypeForge</p>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                  Fast access to every mode and tool
                </p>
              </div>
              <Link 
                href={browseAllSectionsLink.href} 
                onClick={onClose}
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent-300/50"
              >
                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="primary" size="sm" className="rounded-full px-4 cta-glow-pulse">
                    {browseAllSectionsLink.label}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Columns grid - Forcing 4 columns uniformly */}
            <div className="relative mt-5 grid gap-4 grid-cols-4 w-full">
              {browseColumns.map((column, index) => (
                <motion.div key={column.id} variants={columnVariants}>
                  <BrowseColumn
                    column={column}
                    firstLinkRef={index === 0 ? firstItemRef : undefined}
                    onNavigate={onClose}
                    pathname={pathname}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
