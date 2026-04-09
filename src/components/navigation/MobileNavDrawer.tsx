"use client";

import { Session } from 'next-auth';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogIn, LogOut, PanelTopOpen, X } from 'lucide-react';
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

export default function MobileNavDrawer({
  onClose,
  onSignIn,
  onSignOut,
  open,
  pathname,
  session,
}: MobileNavDrawerProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('learn');

  const toggleSection = (sectionId: string) => {
    setExpandedSection((current) => (current === sectionId ? null : sectionId));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close mobile navigation"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-white/10 bg-[#090c08]/96 p-4 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/8 bg-white/[0.03]">
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-4">
                <BrandLogo size="sm" />
                <button
                  type="button"
                  aria-label="Close navigation"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-gray-200"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.02] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-100">Primary areas</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {primaryNavLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className={cn(
                          'rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200',
                          isNavPathActive(pathname, link.href)
                            ? 'bg-accent-300 text-surface-100'
                            : 'bg-white/[0.03] text-gray-200 hover:bg-white/[0.05] hover:text-white'
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  href={browseAllSectionsLink.href}
                  onClick={onClose}
                  className="mt-4 flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-gray-200 transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
                      <PanelTopOpen className="h-4 w-4 text-accent-100" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">Browse</span>
                      <span className="block text-xs text-gray-400">Open the full TypeForge map</span>
                    </span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-100">Open</span>
                </Link>

                <div className="mt-4 space-y-3">
                  <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-100">
                    Browse sections
                  </p>
                  {browseColumns.map((column) => {
                    const openSection = expandedSection === column.id;

                    return (
                      <div key={column.id} className="rounded-[1.4rem] border border-white/8 bg-white/[0.02]">
                        <button
                          type="button"
                          aria-controls={`mobile-browse-section-${column.id}`}
                          aria-expanded={openSection}
                          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                          onClick={() => toggleSection(column.id)}
                        >
                          <div>
                            <p className="text-sm font-semibold text-white">{column.title}</p>
                            <p className="text-xs text-gray-400">{column.links.length} links</p>
                          </div>
                          <ChevronDown
                            className={cn('h-4 w-4 text-gray-400 transition-transform duration-200', openSection && 'rotate-180')}
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
                              <div className="space-y-1 border-t border-white/8 px-3 pb-3 pt-2">
                                {column.links.map((link) => (
                                  <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={onClose}
                                    className={cn(
                                      'block rounded-2xl px-3 py-3 transition-colors',
                                      isNavPathActive(pathname, link.href)
                                        ? 'bg-accent-300/10 text-accent-100 ring-1 ring-accent-300/20'
                                        : 'text-gray-300 hover:bg-white/[0.04] hover:text-white'
                                    )}
                                  >
                                    <p className="text-sm font-medium">{link.label}</p>
                                    {link.description && <p className="mt-1 text-xs text-gray-400">{link.description}</p>}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-white/8 px-4 py-4">
                {session ? (
                  <>
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      {userNavLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={onClose}
                          className={cn(
                            'rounded-2xl px-3 py-3 text-center text-sm font-medium transition-colors',
                            isNavPathActive(pathname, link.href)
                              ? 'bg-white/[0.05] text-white'
                              : 'bg-white/[0.03] text-gray-300 hover:bg-white/[0.05] hover:text-white'
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    <Button variant="ghost" size="md" onClick={onSignOut} className="w-full gap-2 rounded-2xl">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="ghost" size="md" onClick={onSignIn} className="gap-2 rounded-2xl">
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </Button>
                    <Link href="/register" onClick={onClose}>
                      <Button variant="primary" size="md" className="w-full rounded-2xl">
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
