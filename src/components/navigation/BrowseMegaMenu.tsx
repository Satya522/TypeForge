'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Ref } from 'react'
import BrowseColumn from './BrowseColumn'
import { browseAllSectionsLink, browseColumns } from './nav-data'

type BrowseMegaMenuProps = {
  firstItemRef: Ref<HTMLAnchorElement>
  onClose: () => void
  onHoverEnd: () => void
  onHoverStart: () => void
  open: boolean
  pathname: string
}

const containerVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.04,
      delayChildren: 0.03,
    },
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.98,
    transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] },
  },
}

const columnVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
}

const headerVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
}

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
          className="absolute inset-x-0 top-full z-[60] pt-2"
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
          role="dialog"
          aria-modal="false"
          aria-label="Browse TypeForge sections"
        >
          <div className="relative overflow-hidden rounded-[1.25rem] border border-white/[0.06] bg-[#0d0d0f]/95 p-5 shadow-[0_24px_48px_rgba(0,0,0,0.6),0_8px_16px_rgba(0,0,0,0.4)] backdrop-blur-3xl">
            {/* Subtle top-edge glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Header */}
            <motion.div
              variants={headerVariants}
              className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4"
            >
              <div>
                <p className="text-sm font-semibold text-white">
                  Explore TypeForge
                </p>
                <p className="text-xs text-[#9aa0a6] mt-0.5">
                  Fast access to every mode and tool
                </p>
              </div>
              <Link
                href={browseAllSectionsLink.href}
                onClick={onClose}
                className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/40"
              >
                <motion.div
                  whileHover={{ y: -1, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                  <span className="inline-flex items-center rounded-full bg-[#1a73e8] px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(26,115,232,0.3)] transition-all duration-200 hover:bg-[#1557b0] hover:shadow-[0_4px_12px_rgba(26,115,232,0.4)]">
                    {browseAllSectionsLink.label}
                  </span>
                </motion.div>
              </Link>
            </motion.div>

            {/* Columns grid */}
            <div className="relative mt-4 grid gap-3 grid-cols-4 w-full">
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

            {/* Footer strip */}
            <motion.div
              variants={headerVariants}
              className="relative mt-4 flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span className="rounded-md bg-[#1a73e8] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  New
                </span>
                <span className="text-xs text-[#9aa0a6] font-medium">
                  New typing analytics dashboard is live
                </span>
              </div>
              <Link
                href="/analytics"
                onClick={onClose}
                className="text-xs font-semibold text-[#8ab4f8] hover:text-[#aecbfa] transition-colors"
              >
                Explore features →
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
