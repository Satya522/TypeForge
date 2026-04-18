"use client";

import Link from 'next/link';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useState, useCallback, useEffect, Ref } from 'react';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import BrowseColumn from './BrowseColumn';
import { browseAllSectionsLink, browseColumns } from './nav-data';
import { Boxes, Command, Sparkles } from 'lucide-react';

type BrowseMegaMenuProps = {
  firstItemRef: Ref<HTMLAnchorElement>;
  onClose: () => void;
  onHoverEnd: () => void;
  onHoverStart: () => void;
  open: boolean;
  pathname: string;
};

/* ── Animation variants ── */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:   { opacity: 0, transition: { duration: 0.15 } },
};

const panelVariants = {
  hidden:   { opacity: 0, y: -14, scale: 0.97, filter: 'blur(8px)' },
  visible:  {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.38, ease: [0.23, 1, 0.32, 1], staggerChildren: 0.06, delayChildren: 0.05 },
  },
  exit: { opacity: 0, y: -8, scale: 0.98, filter: 'blur(4px)', transition: { duration: 0.2, ease: 'easeIn' } },
};

const headerVariants = {
  hidden:   { opacity: 0, y: -10 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.23, 1, 0.32, 1] } },
};

const columnContainerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

const columnRevealVariants = {
  hidden:   { opacity: 0, y: 20, scale: 0.95 },
  visible:  { opacity: 1, y: 0, scale: 1, transition: { duration: 0.42, ease: [0.23, 1, 0.32, 1] } },
};

const footerVariants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.35, ease: 'easeOut' } },
};

/* ── Spotlight cursor ── */
function SpotlightCursor({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const springX = useSpring(x, { stiffness: 130, damping: 22 });
  const springY = useSpring(y, { stiffness: 130, damping: 22 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      x.set(e.clientX - rect.left);
      y.set(e.clientY - rect.top);
    };
    const onLeave = () => { x.set(-400); y.set(-400); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [x, y, containerRef]);

  return (
    <motion.div
      className="pointer-events-none absolute z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        left: springX, top: springY,
        background: 'radial-gradient(circle, rgba(57,255,20,0.055) 0%, transparent 65%)',
      }}
    />
  );
}

/* ── Animated grid background ── */
function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[calc(1.25rem-1px)]">
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(57,255,20,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57,255,20,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Corner glow orbs */}
      <div className="absolute -top-20 -right-10 h-64 w-64 rounded-full bg-accent-300/[0.06] blur-[70px]" />
      <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-sky-400/[0.04] blur-[60px]" />
      <div className="absolute top-1/2 left-1/2 h-80 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.03] blur-[80px]" />
    </div>
  );
}

/* ── Shimmer line at very top ── */
function ShimmerLine() {
  return (
    <motion.div
      className="absolute inset-x-0 top-0 z-30 h-[1px]"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(57,255,20,0.8) 40%, rgba(57,255,20,0.4) 60%, transparent)',
      }}
      animate={{ scaleX: [0, 1], opacity: [0, 1, 0.7] }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    />
  );
}

/* ── Quick-action footer ── */
const quickLinks = [
  { icon: Command, label: 'Command palette', hint: '⌘K', href: '#' },
  { icon: Sparkles, label: 'What\'s new',    hint: 'v2.4', href: '/changelog' },
  { icon: Boxes,    label: 'All sections',   hint: '→',    href: '/map' },
];

export default function BrowseMegaMenu({
  firstItemRef, onClose, onHoverEnd, onHoverStart, open, pathname,
}: BrowseMegaMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  /* GSAP 3D tilt on panel */
  const handlePanelMove = useCallback((e: React.MouseEvent) => {
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    gsap.to(el, { rotateX: -y * 2.5, rotateY: x * 2.5, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
  }, []);

  const handlePanelLeave = useCallback(() => {
    gsap.to(panelRef.current, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="browse-mega-menu"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-x-0 top-full z-[60] pt-3"
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
          style={{ perspective: '1200px' }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              ref={panelRef}
              onMouseMove={handlePanelMove}
              onMouseLeave={handlePanelLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* ── Outer glow border ── */}
              <div className="relative rounded-[1.3rem] p-[1px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.95),0_0_0_1px_rgba(57,255,20,0.08),inset_0_1px_0_rgba(255,255,255,0.05)]"
                style={{ background: 'linear-gradient(135deg, rgba(57,255,20,0.15), rgba(255,255,255,0.04) 40%, rgba(57,255,20,0.06))' }}
              >
                {/* ── Inner panel ── */}
                <div className="relative overflow-hidden rounded-[calc(1.3rem-1px)] bg-[#060a06] nav-noise">
                  <ShimmerLine />
                  <GridBackground />
                  <SpotlightCursor containerRef={panelRef} />

                  <div className="relative z-10 px-5 pt-4 pb-4">
                    {/* ── Header row ── */}
                    <motion.div
                      variants={headerVariants}
                      className="mb-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        {/* Logo badge */}
                        <motion.div
                          className="flex items-center gap-2 rounded-xl border border-accent-300/20 bg-accent-300/[0.06] px-3 py-1.5"
                          whileHover={{ scale: 1.04, borderColor: 'rgba(57,255,20,0.4)' }}
                        >
                          <motion.span
                            className="h-1.5 w-1.5 rounded-full bg-accent-300"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <span className="text-[11px] font-black uppercase tracking-[0.22em] text-accent-300/90">
                            TypeForge
                          </span>
                        </motion.div>

                        <div>
                          <h3 className="text-base font-bold text-white">Explore every feature</h3>
                          <p className="text-[10px] text-gray-400 tracking-wide">
                            {browseColumns.reduce((a, c) => a + c.links.length, 0)} tools across {browseColumns.length} categories
                          </p>
                        </div>
                      </div>

                      {/* Browse all CTA */}
                      <Link href={browseAllSectionsLink.href} onClick={onClose} className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent-300/50">
                        <motion.div
                          whileHover={{ scale: 1.06, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button variant="primary" size="sm" className="rounded-full px-5 py-2 text-xs font-bold cta-glow-pulse">
                            {browseAllSectionsLink.label} →
                          </Button>
                        </motion.div>
                      </Link>
                    </motion.div>

                    {/* ── Divider ── */}
                    <div className="mb-4 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

                    {/* ── 4-column grid ── */}
                    <motion.div
                      variants={columnContainerVariants}
                      className="grid grid-cols-4 gap-3"
                    >
                      {browseColumns.map((column, index) => (
                        <motion.div key={column.id} variants={columnRevealVariants}>
                          <BrowseColumn
                            column={column}
                            firstLinkRef={index === 0 ? firstItemRef : undefined}
                            onNavigate={onClose}
                            pathname={pathname}
                            index={index}
                          />
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* ── Footer quick-links ── */}
                    <motion.div
                      variants={footerVariants}
                      className="mt-4 flex items-center gap-1 border-t border-white/[0.08] pt-3"
                    >
                      <span className="mr-2 text-[9px] font-bold uppercase tracking-[0.25em] text-gray-500">Quick</span>
                      {quickLinks.map(({ icon: Icon, label, hint, href }) => (
                        <Link
                          key={label}
                          href={href}
                          onClick={onClose}
                          className="group flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10.5px] font-medium text-gray-400 transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.07] hover:text-white"
                        >
                          <Icon className="h-3 w-3 text-gray-400 transition-colors group-hover:text-accent-300" />
                          {label}
                          <span className="rounded-md bg-white/[0.06] px-1 py-0.5 text-[9px] font-mono text-gray-500">{hint}</span>
                        </Link>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
