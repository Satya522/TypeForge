import { cn } from '@/lib/utils'

type PremiumSkeletonProps = {
  className?: string
}

export function PremiumSkeleton({ className }: PremiumSkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'premium-skeleton block rounded-[1.15rem] bg-white/[0.06]',
        className
      )}
    />
  )
}
