import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

// define styles using cva for variants
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full border border-transparent font-medium transition-[background-color,border-color,box-shadow,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-100 focus-visible:ring-accent-300 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--accent-color,#4f8dfd)] text-white shadow-[0_14px_34px_rgba(37,99,235,0.28)] hover:brightness-[1.04] hover:shadow-[0_20px_40px_rgba(37,99,235,0.34)]',
        secondary:
          'border-white/10 bg-white/[0.035] text-gray-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-white/14 hover:bg-white/[0.06]',
        ghost:
          'bg-transparent text-gray-300 hover:bg-white/[0.05] hover:text-white',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-motion-surface="button"
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
