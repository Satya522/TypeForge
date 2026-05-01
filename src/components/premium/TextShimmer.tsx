'use client';

import { type ReactNode } from 'react';

/**
 * TextShimmer — Applies an animated shimmer gradient to text.
 * Use on premium headings or highlighted text for visual emphasis.
 */
interface TextShimmerProps {
  children: ReactNode;
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p';
}

export default function TextShimmer({
  children,
  className = '',
  as: Tag = 'span',
}: TextShimmerProps) {
  return (
    <Tag className={`text-shimmer ${className}`}>
      {children}
    </Tag>
  );
}
