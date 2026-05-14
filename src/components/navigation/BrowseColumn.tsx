"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Ref } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BrowseColumnData, isNavPathActive } from './nav-data';

type BrowseColumnProps = {
  column: BrowseColumnData;
  firstLinkRef?: Ref<HTMLAnchorElement>;
  onNavigate?: () => void;
  pathname: string;
};

export default function BrowseColumn({ column, firstLinkRef, onNavigate, pathname }: BrowseColumnProps) {
  return (
    <div className="group/col rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5 transition-all duration-200 hover:border-white/[0.10] hover:bg-white/[0.05]">
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9aa0a6]">{column.title}</p>
      <div className="space-y-0.5">
        {column.links.map((link) => {
          const active = isNavPathActive(pathname, link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              ref={firstLinkRef && column.links[0]?.href === link.href ? firstLinkRef : undefined}
              onClick={onNavigate}
              className={cn(
                'group flex items-start justify-between gap-2 rounded-lg px-2.5 py-2 transition-all duration-150 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/40',
                active
                  ? 'bg-[#1a73e8] text-white'
                  : 'text-[#e8eaed]/80 hover:bg-white/[0.06] hover:text-white'
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">{link.label}</p>
                {link.description && (
                  <p className={cn(
                    'mt-0.5 truncate text-[11px]',
                    active ? 'text-white/70' : 'text-[#9aa0a6]'
                  )}>{link.description}</p>
                )}
              </div>
              <motion.span
                className="mt-0.5 shrink-0"
                whileHover={{ x: 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <ArrowRight className={cn(
                  'h-3.5 w-3.5 transition-colors duration-150',
                  active ? 'text-white/70' : 'text-[#9aa0a6]/50 group-hover:text-[#9aa0a6]'
                )} />
              </motion.span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
