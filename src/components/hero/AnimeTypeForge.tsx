'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger, splitText } from 'animejs';
import { cn } from '@/lib/utils';

interface AnimeTypeForgeProps {
  className?: string;
  text?: string;
}

export default function AnimeTypeForge({
  className,
  text = 'TYPEFORGE',
}: AnimeTypeForgeProps) {
  const textRef = useRef<HTMLHeadingElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (!textRef.current) return;

    // Reset inner content in case of re-renders
    textRef.current.innerHTML = text;

    // Split text into characters using Anime.js
    const { chars } = splitText(textRef.current, { words: false, chars: true });

    // Ensure characters have inline-block so transforms work
    if (chars && chars.length > 0) {
      chars.forEach((char: HTMLElement) => {
        char.style.display = 'inline-block';
        // Add a slight gradient color manually or let CSS handle it
      });
    }

    animationRef.current = animate(chars, {
      y: [
        { to: '-1.5rem', ease: 'outExpo', duration: 600 },
        { to: 0, ease: 'outBounce', duration: 800, delay: 100 },
      ],
      rotate: {
        from: '-1turn',
        delay: 0,
      },
      delay: stagger(50),
      ease: 'inOutCirc',
      loopDelay: 1500,
      loop: true,
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
      }
    };
  }, [text]);

  return (
    <div className={cn("flex justify-center items-center py-10", className)}>
      <h2
        ref={textRef}
        style={{ fontFamily: "'Google Sans', system-ui, sans-serif" }}
        className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.06em] bg-gradient-to-b from-[#79c0ff] to-[#388bfd] bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(88,166,255,0.5)]"
      >
        {text}
      </h2>
    </div>
  );
}
