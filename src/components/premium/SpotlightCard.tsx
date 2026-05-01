'use client';

import { useCallback, useRef, type ReactNode, type MouseEvent } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * SpotlightCard — A card wrapper that creates a dynamic mouse-tracking
 * highlight/spotlight effect. Used on feature cards, panels, etc.
 * Inspired by Stripe, Vercel, and Linear card interactions.
 */
export default function SpotlightCard({ children, className = '' }: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--spotlight-x', `${x}px`);
    card.style.setProperty('--spotlight-y', `${y}px`);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`spotlight-card ${className}`}
    >
      {children}
    </div>
  );
}
