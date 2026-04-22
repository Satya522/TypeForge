'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type NumberStepperProps = {
  ariaLabel: string
  disabled?: boolean
  max: number
  min: number
  suffix?: string
  value: number
  onChange: (value: number) => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function NumberStepper({
  ariaLabel,
  disabled,
  max,
  min,
  suffix,
  value,
  onChange,
}: NumberStepperProps) {
  const normalizedValue = clamp(value, min, max)

  function updateValue(nextValue: number) {
    onChange(clamp(nextValue, min, max))
  }

  return (
    <span
      className={cn(
        'inline-flex h-9 shrink-0 items-center rounded-full bg-white/[0.055] p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]',
        disabled && 'opacity-45'
      )}
    >
      <button
        type="button"
        aria-label={`Decrease ${ariaLabel}`}
        disabled={disabled || normalizedValue <= min}
        onClick={() => updateValue(normalizedValue - 1)}
        className="grid h-7 w-7 place-items-center rounded-full text-zinc-500 transition-colors duration-150 ease-out hover:bg-white/[0.07] hover:text-zinc-200 disabled:pointer-events-none disabled:opacity-35"
      >
        <Minus size={12} />
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={normalizedValue}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => updateValue(Number(event.target.value))}
        className="h-7 w-14 border-0 bg-transparent text-center text-[13px] tabular-nums text-zinc-100 outline-none [appearance:textfield] disabled:cursor-not-allowed [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      {suffix ? (
        <span className="-ml-2 mr-1 text-[11px] text-zinc-600">{suffix}</span>
      ) : null}
      <button
        type="button"
        aria-label={`Increase ${ariaLabel}`}
        disabled={disabled || normalizedValue >= max}
        onClick={() => updateValue(normalizedValue + 1)}
        className="grid h-7 w-7 place-items-center rounded-full text-zinc-500 transition-colors duration-150 ease-out hover:bg-white/[0.07] hover:text-zinc-200 disabled:pointer-events-none disabled:opacity-35"
      >
        <Plus size={12} />
      </button>
    </span>
  )
}
