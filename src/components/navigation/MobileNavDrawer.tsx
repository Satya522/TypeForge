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
} from 'lucide-react';
import { useState } from 'react';
import BrandLogo from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
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
          <motion.button
            type="button"
            aria-label="Close mobile navigation"
            className="fixed inset-0 z-40 bg-[#020403]/75 backdrop-blur-md lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-50 w-full overflow-hidden border-l border-white/[0.08] bg-[#050807]/96 shadow-[0_0_90px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:max-w-[30rem] lg:hidden"
          >
            <div className="pointer-events-none absolute inset-0">
              <motion.div
                className="absolute -right-28 top-0 h-72 w-72 rounded-full bg-accent-300/20 blur-3xl"
                animate={{ opacity: [0.16, 0.32, 0.16], x: [0, -18, 0], y: [0, 16, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute -left-20 bottom-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl"
                animate={{ opacity: [0.1, 0.22, 0.1], x: [0, 16, 0], y: [0, -14, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute inset-0 opacity-[0.045]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }} />
            </div>

            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-4 sm:px-5">
                <BrandLogo
                  size="md"
                  markClassName="border-accent-300/30 bg-black shadow-[0_0_24px_rgba(79,141,253,0.18)]"
                  taglineClassName="block text-[11px] text-gray-400"
                  wordmarkClassName="text-accent-300"
                />
                <button
                  type="button"
                  aria-label="Close navigation"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-gray-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-white/20 hover:bg-white/[0.07]"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div
                data-lenis-prevent=""
                data-lenis-prevent-wheel=""
                data-native-scroll=""
                className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-4 py-4 sm:px-5"
                style={{ WebkitOverflowScrolling: 'touch', scrollbarGutter: 'stable' }}
              >
                <motion.section
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
                >
                  <p className="px-1 text-[10px] font-black uppercase tracking-[0.26em] text-gray-500">Primary</p>
                  <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {primaryNavLinks.map((link, index) => (
                      (() => {
                        const Icon = primaryIconMap[link.label] ?? Sparkles;
                        const active = isNavPathActive(pathname, link.href);

                        return (
                          <motion.div
                            key={link.href}
                            initial={{ opacity: 0, y: 16, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: 0.1 + index * 0.035 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <Link
                              href={link.href}
                              onClick={onClose}
                              className={cn(
                                'group relative flex min-h-[74px] flex-col items-center justify-center gap-2 px-1 py-1 text-center text-[12px] font-black transition-all duration-200',
                                active
                                  ? 'text-accent-300'
                                  : 'text-white hover:text-accent-300'
                              )}
                            >
                              <span
                                className={cn(
                                  'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-300 group-hover:-translate-y-0.5',
                                  active
                                    ? 'border-accent-300/70 bg-black/70 text-accent-300 shadow-[0_0_24px_rgba(79,141,253,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]'
                                    : 'border-white/[0.07] bg-black/45 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_18px_rgba(79,141,253,0.08)] group-hover:border-accent-300/32 group-hover:bg-black/70 group-hover:text-accent-300 group-hover:shadow-[0_0_24px_rgba(79,141,253,0.18)]'
                                )}
                              >
                                <Icon className="h-[18px] w-[18px]" />
                              </span>
                              <span className="max-w-full truncate leading-none">{link.label}</span>
                            </Link>
                          </motion.div>
                        );
                      })()
                    ))}
                  </div>
                </motion.section>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: 0.34 }}
                  className="mt-3 grid grid-cols-2 gap-2"
                >
                  <Link
                    href={browseAllSectionsLink.href}
                    onClick={onClose}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-full border bg-black/45 px-3 py-2.5 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_18px_rgba(79,141,253,0.05)] transition-colors',
                      fullMapActive
                        ? 'border-accent-300/45 bg-black/70 text-accent-300 ring-1 ring-accent-300/30'
                        : 'border-white/[0.07] text-white hover:border-accent-300/45 hover:bg-black/70 hover:text-accent-300'
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-black/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_18px_rgba(79,141,253,0.08)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-accent-300/45 group-hover:text-accent-300 group-hover:shadow-[0_0_24px_rgba(79,141,253,0.18)]',
                          fullMapActive ? 'border-accent-300/45 text-accent-300' : 'border-white/[0.07] text-white'
                        )}
                      >
                        <PanelTopOpen className="h-4 w-4" />
                      </span>
                      <span className={cn('min-w-0 truncate font-black transition-colors group-hover:text-accent-300', fullMapActive ? 'text-accent-300' : 'text-white')}>Full Map</span>
                    </span>
                  </Link>
                  <Link
                    href="/achievements?view=challenges"
                    onClick={onClose}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-full border bg-black/45 px-3 py-2.5 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_18px_rgba(79,141,253,0.05)] transition-colors',
                      challengesActive
                        ? 'border-accent-300/45 bg-black/70 text-accent-300 ring-1 ring-accent-300/30'
                        : 'border-white/[0.07] text-white hover:border-accent-300/45 hover:bg-black/70 hover:text-accent-300'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-black/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_18px_rgba(79,141,253,0.08)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-accent-300/45 group-hover:text-accent-300 group-hover:shadow-[0_0_24px_rgba(79,141,253,0.18)]',
                        challengesActive ? 'border-accent-300/45 text-accent-300' : 'border-white/[0.07] text-white'
                      )}
                    >
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <span className={cn('min-w-0 truncate font-black transition-colors group-hover:text-accent-300', challengesActive ? 'text-accent-300' : 'text-white')}>Challenges</span>
                  </Link>
                </motion.div>

                <motion.div
                  className="mt-4 space-y-2"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: 0.38 }}
                >
                  <p className="px-1 text-[10px] font-black uppercase tracking-[0.26em] text-gray-500">More</p>
                  {mobileBrowseColumns.map((column) => {
                    const openSection = expandedSection === column.id;
                    const ColumnIcon = browseIconMap[column.id] ?? Sparkles;

                    return (
                      <div
                        key={column.id}
                        className={cn(
                          'group overflow-hidden rounded-[1.65rem] border bg-black/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_18px_rgba(79,141,253,0.04)] transition-colors hover:border-accent-300/45 hover:bg-black/70',
                          openSection ? 'border-accent-300/45 bg-black/70' : 'border-white/[0.07]'
                        )}
                      >
                        <button
                          type="button"
                          aria-controls={`mobile-browse-section-${column.id}`}
                          aria-expanded={openSection}
                          className="flex w-full items-center justify-between gap-4 px-3 py-2.5 text-left"
                          onClick={() => toggleSection(column.id)}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={cn(
                                'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-black/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_18px_rgba(79,141,253,0.08)] transition-colors group-hover:border-accent-300/45 group-hover:text-accent-300',
                                openSection ? 'border-accent-300/45 text-accent-300' : 'border-white/[0.07] text-white'
                              )}
                            >
                              <ColumnIcon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className={cn('truncate text-sm font-bold transition-colors group-hover:text-accent-300', openSection ? 'text-accent-300' : 'text-white')}>{column.title}</p>
                            </div>
                          </div>
                          <ChevronDown
                            className={cn('h-4 w-4 shrink-0 text-gray-400 transition-all duration-200 group-hover:text-accent-300', openSection && 'rotate-180 text-accent-300')}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {openSection && (
                            <motion.div
                              id={`mobile-browse-section-${column.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18, ease: 'easeOut' }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-1 border-t border-white/[0.07] px-2.5 pb-3 pt-2">
                                {column.links.map((link) => (
                                  <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={onClose}
                                    className={cn(
                                      'block rounded-full px-3.5 py-2.5 transition-colors',
                                      isNavPathActive(pathname, link.href)
                                        ? 'bg-black/70 text-accent-300 ring-1 ring-accent-300/20'
                                        : 'text-white hover:bg-black/70 hover:text-accent-300 hover:ring-1 hover:ring-accent-300/18'
                                    )}
                                  >
                                    <p className="text-sm font-medium">{link.label}</p>
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

              <div className="border-t border-white/[0.07] bg-black/20 px-4 py-3 sm:px-5">
                {session ? (
                  <>
                    <div className="group mb-2 flex items-center gap-3 rounded-full border border-white/[0.07] bg-black/45 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_18px_rgba(79,141,253,0.04)] transition-colors hover:border-accent-300/35 hover:bg-black/60">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-black/55 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors group-hover:text-accent-300">
                        <User className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-white transition-colors group-hover:text-accent-300">
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
                            'inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-3 text-center text-xs font-bold transition-colors sm:text-sm',
                            isNavPathActive(pathname, link.href)
                              ? 'bg-black/70 text-accent-300 ring-1 ring-accent-300/40'
                              : 'bg-black/45 text-white hover:bg-black/70 hover:text-accent-300 hover:ring-1 hover:ring-accent-300/30'
                          )}
                        >
                          {link.href === '/dashboard' ? <LayoutDashboard className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          {link.label}
                        </Link>
                      ))}
                      <Button variant="ghost" size="md" onClick={onSignOut} className="h-auto gap-1.5 rounded-full border border-white/[0.07] bg-black/45 px-2.5 py-3 text-xs text-white hover:border-accent-300/40 hover:bg-black/70 hover:text-accent-300 sm:text-sm">
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="ghost" size="md" onClick={onSignIn} className="gap-2 rounded-full">
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </Button>
                    <Link href="/register" onClick={onClose}>
                      <Button variant="primary" size="md" className="w-full rounded-full">
                        Sign Up
                      </Button>
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
