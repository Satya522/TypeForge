"use client";

import { Session } from 'next-auth';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  Gamepad2,
  Keyboard,
  LayoutDashboard,
  LogIn,
  LogOut,
  Map,
  PanelTopOpen,
  Sparkles,
  Trophy,
  User,
  Users,
  Wrench,
  X,
  type LucideIcon,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import BrandLogo from '@/components/BrandLogo';
import { cn } from '@/lib/utils';
import { browseAllSectionsLink, browseColumns, isNavPathActive, primaryNavLinks, userNavLinks } from './nav-data';

type MobileNavDrawerProps = {
  onClose: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  open: boolean;
  pathname: string;
  session: Session | null;
};

const primaryIconMap: Record<string, LucideIcon> = {
  Analytics: BarChart3,
  Community: Users,
  Games: Gamepad2,
  Learn: BookOpen,
  Practice: Keyboard,
  Roadmap: Map,
};

const browseIconMap: Record<string, LucideIcon> = {
  compete: Trophy,
  studio: Sparkles,
  train: Keyboard,
  tools: Wrench,
};

const mobileCompeteColumn = browseColumns.find((column) => column.id === 'compete');

const mobileBrowseColumns = [
  {
    id: 'train',
    title: 'Train',
    links: [
      { href: '/custom-practice', label: 'Custom Practice' },
      { href: '/code-practice', label: 'Code Practice' },
      { href: '/ai-practice', label: 'AI Practice' },
      { href: '/dictation', label: 'Dictation' },
      { href: '/race', label: 'Race' },
    ],
  },
  ...(mobileCompeteColumn ? [mobileCompeteColumn] : []),
  {
    id: 'studio',
    title: 'Studio',
    links: [
      { href: '/code-editor', label: 'Editor' },
      { href: '/extension', label: 'Extension' },
      { href: '/languages', label: 'Languages' },
      { href: '/posture', label: 'Posture' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    links: [
      { href: '/settings', label: 'Settings' },
      { href: '/ar', label: 'AR Lab' },
      { href: '/vr-lab', label: 'VR Lab' },
    ],
  },
];

export default function MobileNavDrawer({
  onClose,
  onSignIn,
  onSignOut,
  open,
  pathname,
  session,
}: MobileNavDrawerProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection((current) => (current === sectionId ? null : sectionId));
  };

  const fullMapActive = isNavPathActive(pathname, browseAllSectionsLink.href);
  const challengesActive = isNavPathActive(pathname, '/achievements?view=challenges');

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close mobile navigation"
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 w-full overflow-hidden border-l border-gray-200 bg-white shadow-[0_0_60px_rgba(0,0,0,0.08)] sm:max-w-[26rem] lg:hidden"
          >
            <div className="relative flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 sm:px-5">
                <BrandLogo
                  size="sm"
                  showTagline={false}
                  markClassName="border-gray-200 bg-white shadow-sm"
                  wordmarkClassName="text-gray-900"
                />
                <button
                  type="button"
                  aria-label="Close navigation"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                  onClick={onClose}
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Scrollable content */}
              <div
                data-lenis-prevent=""
                data-lenis-prevent-wheel=""
                data-native-scroll=""
                className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-4 py-4 sm:px-5"
                style={{ WebkitOverflowScrolling: 'touch', scrollbarGutter: 'stable' }}
              >
                {/* Primary links */}
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
                >
                  <p className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Primary</p>
                  <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {primaryNavLinks.map((link, index) => {
                      const Icon = primaryIconMap[link.label] ?? Sparkles;
                      const active = isNavPathActive(pathname, link.href);

                      return (
                        <motion.div
                          key={link.href}
                          initial={{ opacity: 0, y: 12, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1], delay: 0.08 + index * 0.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Link
                            href={link.href}
                            onClick={onClose}
                            className={cn(
                              'group relative flex min-h-[68px] flex-col items-center justify-center gap-2 rounded-xl border px-1 py-1 text-center text-[11px] font-semibold transition-all duration-200',
                              active
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                            )}
                          >
                            <span
                              className={cn(
                                'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
                                active
                                  ? 'bg-white/15 text-white'
                                  : 'bg-white text-gray-500 shadow-sm group-hover:text-gray-700'
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="max-w-full truncate leading-none">{link.label}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>

                {/* Quick action row */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
                  className="mt-3 grid grid-cols-2 gap-2"
                >
                  <Link
                    href={browseAllSectionsLink.href}
                    onClick={onClose}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200',
                      fullMapActive
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
                        fullMapActive
                          ? 'bg-white/15 text-white'
                          : 'bg-white text-gray-400 shadow-sm group-hover:text-gray-600'
                      )}
                    >
                      <PanelTopOpen className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-semibold">Full Map</span>
                  </Link>
                  <Link
                    href="/achievements?view=challenges"
                    onClick={onClose}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200',
                      challengesActive
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
                        challengesActive
                          ? 'bg-white/15 text-white'
                          : 'bg-white text-gray-400 shadow-sm group-hover:text-gray-600'
                      )}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-semibold">Challenges</span>
                  </Link>
                </motion.div>

                {/* Expandable browse sections */}
                <motion.div
                  className="mt-4 space-y-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
                >
                  <p className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">More</p>
                  {mobileBrowseColumns.map((column) => {
                    const openSection = expandedSection === column.id;
                    const ColumnIcon = browseIconMap[column.id] ?? Sparkles;

                    return (
                      <div
                        key={column.id}
                        className={cn(
                          'group overflow-hidden rounded-xl border transition-all duration-200',
                          openSection
                            ? 'border-gray-200 bg-gray-50'
                            : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-gray-50'
                        )}
                      >
                        <button
                          type="button"
                          aria-controls={`mobile-browse-section-${column.id}`}
                          aria-expanded={openSection}
                          className="flex w-full items-center justify-between gap-4 px-3 py-2.5 text-left"
                          onClick={() => toggleSection(column.id)}
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              className={cn(
                                'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-200',
                                openSection
                                  ? 'border-gray-300 bg-white text-gray-700 shadow-sm'
                                  : 'border-gray-200 bg-white text-gray-400 group-hover:text-gray-600'
                              )}
                            >
                              <ColumnIcon className="h-3.5 w-3.5" />
                            </span>
                            <p className={cn(
                              'truncate text-sm font-semibold transition-colors',
                              openSection ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                            )}>
                              {column.title}
                            </p>
                          </div>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 shrink-0 text-gray-400 transition-all duration-200',
                              openSection && 'rotate-180 text-gray-600'
                            )}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {openSection && (
                            <motion.div
                              id={`mobile-browse-section-${column.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-0.5 border-t border-gray-100 px-2.5 pb-3 pt-2">
                                {column.links.map((link) => (
                                  <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={onClose}
                                    className={cn(
                                      'block rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                                      isNavPathActive(pathname, link.href)
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                                    )}
                                  >
                                    {link.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
              </div>

              {/* Footer auth area */}
              <div className="border-t border-gray-100 bg-gray-50/80 px-4 py-3 sm:px-5">
                {session ? (
                  <>
                    <div className="group mb-2 flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5 shadow-sm">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
                        <User className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-gray-900">
                          {session.user?.name || session.user?.email || 'TypeForge user'}
                        </span>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {userNavLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={onClose}
                          className={cn(
                            'inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2.5 text-center text-xs font-semibold transition-all duration-200 sm:text-sm',
                            isNavPathActive(pathname, link.href)
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                          )}
                        >
                          {link.href === '/dashboard' ? <LayoutDashboard className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          {link.label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={onSignOut}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-100 bg-white px-2.5 py-2.5 text-xs font-semibold text-gray-500 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:text-sm"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={onSignIn}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
                    >
                      <LogIn className="h-4 w-4" />
                      Log in
                    </button>
                    <Link href="/register" onClick={onClose}>
                      <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800">
                        Start typing
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
