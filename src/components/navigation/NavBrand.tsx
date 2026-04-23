'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import BrandLogo from '@/components/BrandLogo'

type NavBrandProps = {
  pathname: string
}

export default function NavBrand({ pathname: _pathname }: NavBrandProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  /* GSAP: stagger-in the brand elements on mount */
  useEffect(() => {
    if (!wrapperRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrapperRef.current,
        { x: -14, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.62, ease: 'power3.out', delay: 0.16 }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <div ref={wrapperRef} style={{ opacity: 0 }}>
      <BrandLogo
        size="md"
        showTagline={false}
        markClassName="logo-glow-pulse"
        wordmarkClassName="brand-gradient-text"
        className="min-w-0 shrink-0 px-2 py-1 transition-all duration-300 hover:opacity-90"
        priority
      />
    </div>
  )
}
