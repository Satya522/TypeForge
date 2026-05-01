"use client";

import React from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// ─── Easing ─────────────────────────────────────────────────────
const sectionEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ─── Section-level variants (wrapper) ───────────────────────────
const sectionVariants: Variants = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.45,
      ease: sectionEase,
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: {
      duration: 0.25,
      ease: sectionEase,
    },
  },
};

// ─── Card-level variants (each child inside the section) ────────
export const cardVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: sectionEase },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: sectionEase },
  },
};

// ─── SectionTransition wrapper ──────────────────────────────────
interface SectionTransitionProps {
  /** Unique key identifying the current section / tab */
  sectionKey: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrap each tab's content with `<SectionTransition sectionKey={activeTab}>`.
 * Uses `AnimatePresence mode="wait"` internally so only one section
 * is visible at a time, with a smooth fade + blur + slide transition.
 *
 * Cards inside should use `<motion.div variants={cardVariants}>` so
 * they stagger automatically via the parent's `staggerChildren`.
 */
export function SectionTransition({
  sectionKey,
  children,
  className,
}: SectionTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={sectionKey}
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default SectionTransition;
