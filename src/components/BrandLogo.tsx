import Image from 'next/image';
import Link from 'next/link';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], weight: ['800', '900'] });
import { cn } from '@/lib/utils';
import { BRAND_ASSETS } from '@/lib/brand';

type BrandLogoProps = {
  className?: string;
  href?: string;
  markClassName?: string;
  priority?: boolean;
  showTagline?: boolean;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  taglineClassName?: string;
  taglineText?: string;
  wordmarkClassName?: string;
};

const sizeMap = {
  sm: {
    image: 24,
    mark: 'h-8 w-8 rounded-full',
    title: 'text-sm',
    wrapper: 'gap-2.5',
  },
  md: {
    image: 28,
    mark: 'h-10 w-10 rounded-full',
    title: 'text-base',
    wrapper: 'gap-3',
  },
  lg: {
    image: 36,
    mark: 'h-12 w-12 rounded-full',
    title: 'text-lg',
    wrapper: 'gap-3.5',
  },
} as const;

export default function BrandLogo({
  className,
  href = '/',
  markClassName,
  priority = false,
  showTagline = true,
  showWordmark = true,
  size = 'md',
  taglineClassName = 'hidden sm:block',
  taglineText = 'Typing practice platform',
  wordmarkClassName,
}: BrandLogoProps) {
  const current = sizeMap[size];

  const content = (
    <>
      <span
        className={cn(
          'relative flex shrink-0 items-center justify-center overflow-hidden border border-amber-200/15 bg-black/70 shadow-[0_0_28px_rgba(255,145,22,0.18)]',
          current.mark,
          markClassName
        )}
      >
        <Image
          src={BRAND_ASSETS.logoMark}
          alt="TypeForge logo"
          width={current.image}
          height={current.image}
          priority={priority}
          className="h-auto w-auto object-contain"
        />
      </span>

      {showWordmark && (
        <div className="min-w-0">
          <p className={cn('truncate font-black tracking-tight text-white/95', outfit.className, current.title, wordmarkClassName)}>TypeForge</p>
          {showTagline && (
            <p className={cn('truncate text-xs text-gray-400', taglineClassName)}>{taglineText}</p>
          )}
        </div>
      )}
    </>
  );

  return (
    <Link href={href} className={cn('flex min-w-0 shrink-0 items-center', current.wrapper, className)}>
      {content}
    </Link>
  );
}
