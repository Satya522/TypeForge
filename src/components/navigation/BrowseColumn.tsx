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
    <div className="group/col rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 transition-all duration-200 hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm">
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400">{column.title}</p>
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
                'group flex items-start justify-between gap-2 rounded-lg px-2.5 py-2 transition-all duration-150 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300',
                active
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">{link.label}</p>
                {link.description && (
                  <p className={cn(
                    'mt-0.5 truncate text-[11px]',
                    active ? 'text-gray-300' : 'text-gray-400'
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
                  active ? 'text-gray-300' : 'text-gray-300 group-hover:text-gray-500'
                )} />
              </motion.span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
