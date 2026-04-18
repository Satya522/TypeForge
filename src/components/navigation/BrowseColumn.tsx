"use client";

import Link from 'next/link';
import { useRef, useState, useCallback, Ref } from 'react';
import {
  ArrowRight, BookOpen, Bot, Boxes, Code, Crown, Edit, Eye,
  Flame, Gamepad2, Globe, Keyboard, Map, Medal, Mic,
  Rocket, Settings, Swords, Target, Trophy, Baby,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { BrowseColumnData, isNavPathActive } from './nav-data';

/* ── Icon map ── */
const IconMap: Record<string, React.ElementType> = {
  'Learning Paths': Map,   'Home Row': Keyboard,   'Beginner Lessons': Baby,
  'Advanced Lessons': Flame, 'Story Mode': BookOpen, 'Custom Practice': Edit,
  'Code Practice': Code,   'AI Practice': Bot,     'Dictation': Mic,
  'Race': Swords,          'Leaderboard': Trophy,  'Tournaments': Gamepad2,
  'Achievements': Medal,   'Challenges': Target,   'Premium': Crown,
  'Editor': Code,          'Extension': Boxes,     'Languages': Globe,
  'Settings': Settings,    'AR Lab': Eye,          'VR Lab': Boxes,
};
const getIcon = (label: string) => IconMap[label] || Rocket;

/* ── Per-column accent palette ── */
export const columnAccents: Record<string, { from: string; to: string; hex: string; glow: string }> = {
  learn:   { from: '#39ff14', to: '#86efac', hex: '#39ff14', glow: 'rgba(57,255,20,0.4)' },
  practice:{ from: '#38bdf8', to: '#818cf8', hex: '#38bdf8', glow: 'rgba(56,189,248,0.4)' },
  compete: { from: '#f59e0b', to: '#fb923c', hex: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
  tools:   { from: '#a855f7', to: '#ec4899', hex: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
};

/* ── Magnetic link ── */
function MagLink({
  href, onClick, active, label, description, isFirst, firstLinkRef, accentHex, accentGlow,
}: {
  href: string; onClick?: () => void; active: boolean; label: string;
  description?: string; isFirst: boolean; firstLinkRef?: Ref<HTMLAnchorElement>;
  accentHex: string; accentGlow: string;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const Icon = getIcon(label);
  const [hovered, setHovered] = useState(false);

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = linkRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.1;
    const y = (e.clientY - r.top  - r.height / 2) * 0.1;
    gsap.to(el, { x, y, duration: 0.22, ease: 'power2.out', overwrite: 'auto' });
  }, []);

  const handleLeave = useCallback(() => {
    gsap.to(linkRef.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
    setHovered(false);
  }, []);

  return (
    <Link
      href={href}
      ref={(el) => {
        (linkRef as React.MutableRefObject<HTMLAnchorElement | null>).current = el;
        if (isFirst && firstLinkRef)
          (firstLinkRef as React.MutableRefObject<HTMLAnchorElement | null>).current = el;
      }}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseEnter={() => setHovered(true)}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20',
        active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.05]'
      )}
    >
      {/* Active indicator */}
      <AnimatePresence>
        {active && (
          <motion.div
            layoutId="nav-active-bar"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            className="absolute left-0 top-[8px] bottom-[8px] w-[3px] rounded-r-full origin-center"
            style={{ background: accentHex, boxShadow: `0 0 12px ${accentGlow}` }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <motion.div
        animate={{ scale: hovered ? 1.12 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        className={cn(
          'flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-xl border transition-all duration-200',
          active
            ? 'border-white/15 bg-white/[0.08]'
            : hovered
            ? 'border-white/[0.12] bg-white/[0.07]'
            : 'border-white/[0.05] bg-white/[0.02]'
        )}
        style={{
          boxShadow: hovered || active ? `0 0 20px ${accentGlow}` : 'none',
        }}
      >
        <Icon
          strokeWidth={1.7}
          className="h-[15px] w-[15px] transition-colors duration-200"
          style={{ color: hovered || active ? accentHex : `${accentHex}66` }}
        />
      </motion.div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={cn(
          'truncate text-[12.5px] font-bold leading-tight transition-colors duration-200',
          'text-white'
        )}>
          {label}
        </p>
        {description && (
          <p
            className="mt-[2px] truncate text-[10.5px] leading-snug transition-colors duration-200"
            style={{ color: hovered ? `${accentHex}cc` : `${accentHex}80` }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Arrow */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -5 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="shrink-0"
      >
        <ArrowRight className="h-3.5 w-3.5" style={{ color: accentHex }} />
      </motion.div>
    </Link>
  );
}

/* ── Item stagger variants ── */
const itemVariants = {
  hidden:  { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.3, delay: i * 0.045, ease: [0.23, 1, 0.32, 1] },
  }),
};

/* ── BrowseColumn ── */
type BrowseColumnProps = {
  column: BrowseColumnData;
  firstLinkRef?: Ref<HTMLAnchorElement>;
  onNavigate?: () => void;
  pathname: string;
  index: number;
};

export default function BrowseColumn({ column, firstLinkRef, onNavigate, pathname, index }: BrowseColumnProps) {
  const accent = columnAccents[column.id] || columnAccents.tools;
  const colRef = useRef<HTMLDivElement>(null);

  const handleEnter = useCallback(() => {
    gsap.to(colRef.current, { y: -4, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
  }, []);
  const handleLeave = useCallback(() => {
    gsap.to(colRef.current, { y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
  }, []);

  return (
    <div
      ref={colRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="relative flex flex-col rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3 transition-colors duration-300 hover:border-white/[0.09] hover:bg-white/[0.035]"
    >
      {/* Colour-matched top glow line */}
      <div
        className="absolute inset-x-6 top-0 h-px opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${accent.hex}, transparent)` }}
      />

      {/* Column header */}
      <div className="mb-3 flex items-center gap-2 px-1">
        <motion.div
          className="h-[7px] w-[7px] rounded-full"
          style={{ background: accent.hex, boxShadow: `0 0 8px ${accent.glow}` }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 }}
        />
        <h4
          className="text-[10px] font-black uppercase tracking-[0.28em]"
          style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          {column.title}
        </h4>
      </div>

      {/* Links */}
      <div className="flex flex-col gap-0.5">
        {column.links.map((link, i) => {
          const active = isNavPathActive(pathname, link.href);
          return (
            <motion.div
              key={link.href}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <MagLink
                href={link.href}
                onClick={onNavigate}
                active={active}
                label={link.label}
                description={link.description}
                isFirst={i === 0}
                firstLinkRef={i === 0 ? firstLinkRef : undefined}
                accentHex={accent.hex}
                accentGlow={accent.glow}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
