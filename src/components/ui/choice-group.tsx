'use client'

import { cn } from '@/lib/utils'

export type ChoiceOption<TValue extends string> = {
  description?: string
  label: string
  sample?: string
  swatchClassName?: string
  value: TValue
}

type ChoiceGroupProps<TValue extends string> = {
  ariaLabel: string
  disabled?: boolean
  options: ChoiceOption<TValue>[]
  value: TValue
  variant?: 'chips' | 'palette' | 'stack'
  onChange: (value: TValue) => void
}

export function ChoiceGroup<TValue extends string>({
  ariaLabel,
  disabled,
  options,
  value,
  variant = 'chips',
  onChange,
}: ChoiceGroupProps<TValue>) {
  return (
    <span
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'flex min-w-0 gap-1.5',
        variant === 'stack'
          ? 'flex-col items-stretch'
          : 'flex-wrap items-center'
      )}
    >
      {options.map((option) => {
        const selected = option.value === value

        if (variant === 'palette') {
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={option.label}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                'grid h-8 w-8 place-items-center rounded-full transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-45',
                selected ? 'bg-white/[0.09]' : 'hover:bg-white/[0.05]'
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'h-4 w-4 rounded-full ring-1 ring-white/15',
                  option.swatchClassName
                )}
              />
            </button>
          )
        }

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'group relative overflow-hidden rounded-full px-4 py-2 text-[13px] font-medium leading-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-45',
              selected
                ? 'bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_2px_8px_rgba(0,0,0,0.3)]'
                : 'bg-white/[0.03] text-zinc-400 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-white/[0.08] hover:text-zinc-200 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_2px_12px_rgba(0,0,0,0.2)]',
              variant === 'stack' &&
                'flex items-center justify-between rounded-full px-4 py-3 text-left'
            )}
          >
            {/* Hover glow effect */}
            <span
              className={cn(
                'absolute inset-0 opacity-0 transition-opacity duration-300',
                !selected &&
                  'group-hover:opacity-100 bg-gradient-to-br from-white/[0.08] to-transparent'
              )}
            />
            <span className="relative flex min-w-0 flex-col gap-1">
              <span className="truncate">{option.label}</span>
              {option.description ? (
                <span
                  className={cn(
                    'truncate text-[11px] leading-none transition-colors duration-200',
                    selected
                      ? 'text-zinc-400'
                      : 'text-zinc-600 group-hover:text-zinc-500'
                  )}
                >
                  {option.description}
                </span>
              ) : null}
            </span>
            {option.sample ? (
              <span
                className={cn(
                  'relative ml-4 shrink-0 text-[13px] transition-colors duration-200',
                  selected
                    ? 'text-zinc-300'
                    : 'text-zinc-500 group-hover:text-zinc-400'
                )}
              >
                {option.sample}
              </span>
            ) : null}
          </button>
        )
      })}
    </span>
  )
}
