'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

type RangeSliderProps = {
  id?: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  displayValue?: string
  disabled?: boolean
  className?: string
  onChange: (value: number) => void
}

export function RangeSlider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  displayValue,
  disabled,
  className,
  onChange,
}: RangeSliderProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={inputId}
          className="text-[11px] font-medium text-zinc-500"
        >
          {label}
        </label>
        {displayValue ? (
          <span className="text-[11px] tabular-nums text-zinc-600">
            {displayValue}
          </span>
        ) : null}
      </div>
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-[#39ff14] outline-none transition-opacity duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#39ff14]/35 disabled:cursor-not-allowed disabled:opacity-45"
      />
    </div>
  )
}
