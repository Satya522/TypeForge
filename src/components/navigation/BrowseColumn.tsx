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
    <div className="group/col rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.045] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-100">{column.title}</p>
      <div className="space-y-1.5">
        {column.links.map((link) => {
          const active = isNavPathActive(pathname, link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              ref={firstLinkRef && column.links[0]?.href === link.href ? firstLinkRef : undefined}
              onClick={onNavigate}
              className={cn(
                'group flex items-start justify-between gap-3 rounded-2xl px-3 py-3 transition-all duration-200 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-300/50',
                active
                  ? 'bg-accent-300/10 text-white ring-1 ring-accent-300/20'
                  : 'text-gray-300 hover:bg-accent-300/[0.05] hover:text-accent-300 focus:bg-accent-300/[0.05] focus:text-accent-300'
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{link.label}</p>
                {link.description && <p className="mt-1 truncate text-xs text-gray-400">{link.description}</p>}
              </div>
              <motion.span
                className="mt-0.5 shrink-0"
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <ArrowRight className="h-4 w-4 text-gray-500 transition-colors duration-200 group-hover:text-accent-100" />
              </motion.span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
