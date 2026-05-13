'use client'

import BrandLogo from '@/components/BrandLogo'

type NavBrandProps = {
  pathname: string
}

export default function NavBrand({ pathname: _pathname }: NavBrandProps) {
  return (
    <div className="shrink-0">
      <BrandLogo
        size="sm"
        showTagline={false}
        markClassName="border-white/10 bg-black shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
        wordmarkClassName="text-white"
        className="min-w-0 shrink-0 pr-2 transition-opacity duration-300 hover:opacity-80 xl:pr-3"
      />
    </div>
  )
}
