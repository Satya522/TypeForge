'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BRAND_ASSETS } from '@/lib/brand'

type NavBrandProps = {
  pathname: string
  compact?: boolean
}

export default function NavBrand({ pathname: _pathname, compact = false }: NavBrandProps) {
  return (
    <div className="flex h-[36px] shrink-0 items-center">
      <Link
        href="/"
        className={cn(
          'group flex min-w-0 shrink-0 items-center gap-2.5',
          'pr-2 transition-opacity duration-300 hover:opacity-90 xl:pr-3 hover:![transform:none]'
        )}
      >
        <span
          className={cn(
            'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#050b16] shadow-[0_10px_28px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,0.08)]',
            compact ? 'h-8 w-8' : 'h-9 w-9'
          )}
        >
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(111,167,255,0.26),transparent_42%),linear-gradient(135deg,rgba(45,212,191,0.13),transparent_58%)]" />
          <span className="absolute -inset-5 rotate-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] opacity-0 transition duration-700 group-hover:translate-x-7 group-hover:opacity-100" />
          <Image
            src={BRAND_ASSETS.logoMark}
            alt="TypeForge logo"
            width={24}
            height={24}
            priority
            loading="eager"
            fetchPriority="high"
            className="relative h-auto w-auto object-contain drop-shadow-[0_0_12px_rgba(111,167,255,0.34)]"
          />
        </span>
        <h2
          style={{ fontFamily: "'Google Sans', system-ui, sans-serif" }}
          className={cn(
            'brand-gradient-text text-[17px] font-black tracking-normal drop-shadow-[0_0_12px_rgba(111,167,255,0.18)] sm:text-lg',
            compact ? 'lg:text-[18px]' : 'lg:text-[20px]'
          )}
        >
          TypeForge
        </h2>
      </Link>
    </div>
  )
}
