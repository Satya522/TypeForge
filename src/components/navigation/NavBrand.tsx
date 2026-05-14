'use client'

import { useEffect, useRef } from 'react'
import { animate, stagger, splitText } from 'animejs'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BRAND_ASSETS } from '@/lib/brand'

type NavBrandProps = {
  pathname: string
}

export default function NavBrand({ pathname: _pathname }: NavBrandProps) {
  const textRef = useRef<HTMLHeadingElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (!textRef.current) return;

    // Reset inner content in case of re-renders
    textRef.current.innerHTML = 'TypeForge';

    // Split text into characters using Anime.js
    const { chars } = splitText(textRef.current, { words: false, chars: true });

    if (chars && chars.length > 0) {
      chars.forEach((char: HTMLElement) => {
        char.style.display = 'inline-block';
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
      loopDelay: 2000,
      loop: true,
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
      }
    };
  }, []);

  return (
    <div className="shrink-0 flex items-center h-[36px]">
      <Link
        href="/"
        className={cn(
          'flex min-w-0 shrink-0 items-center gap-2.5',
          'pr-2 transition-opacity duration-300 hover:opacity-80 xl:pr-3 hover:![transform:none]'
        )}
      >
        <span
          className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
        >
          <img
            src={BRAND_ASSETS.logoMark}
            alt="TypeForge logo"
            width={24}
            height={24}
            className="h-auto w-auto object-contain"
          />
        </span>
        <h2
          ref={textRef}
          style={{ fontFamily: "'Google Sans', system-ui, sans-serif" }}
          className="text-[17px] font-bold tracking-tight sm:text-lg lg:text-[20px] bg-gradient-to-r from-white to-[#a5d6ff] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(165,214,255,0.4)]"
        >
          TypeForge
        </h2>
      </Link>
    </div>
  )
}
