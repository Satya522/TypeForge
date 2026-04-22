'use client'

import {
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useRef,
} from 'react'
import { cn } from '@/lib/utils'

export type DiscreteSliderOption<TValue extends string> = {
  label: string
  value: TValue
}

type DiscreteSliderProps<TValue extends string> = {
  ariaLabel: string
  disabled?: boolean
  options: DiscreteSliderOption<TValue>[]
  value: TValue
  onChange: (value: TValue) => void
}

export function DiscreteSlider<TValue extends string>({
  ariaLabel,
  disabled,
  options,
  value,
  onChange,
}: DiscreteSliderProps<TValue>) {
  const trackRef = useRef<HTMLSpanElement>(null)
  const currentIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )
  const selectedOption = options[currentIndex] ?? options[0]
  const maxIndex = Math.max(0, options.length - 1)
  const progress = maxIndex > 0 ? (currentIndex / maxIndex) * 100 : 0

  function updateFromIndex(index: number) {
    const nextIndex = Math.min(Math.max(index, 0), maxIndex)
    const nextOption = options[nextIndex]
    if (nextOption) {
      onChange(nextOption.value)
    }
  }

  function updateFromPointer(clientX: number) {
    const bounds = trackRef.current?.getBoundingClientRect()
    if (!bounds?.width) return

    const ratio = Math.min(
      Math.max((clientX - bounds.left) / bounds.width, 0),
      1
    )
    updateFromIndex(Math.round(ratio * maxIndex))
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLSpanElement>) {
    if (disabled) return

    event.currentTarget.setPointerCapture(event.pointerId)
    updateFromPointer(event.clientX)
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLSpanElement>) {
    if (disabled || !event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }

    updateFromPointer(event.clientX)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (disabled) return

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault()
      updateFromIndex(currentIndex + 1)
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      updateFromIndex(currentIndex - 1)
    }

    if (event.key === 'Home') {
      event.preventDefault()
      updateFromIndex(0)
    }

    if (event.key === 'End') {
      event.preventDefault()
      updateFromIndex(maxIndex)
    }
  }

  return (
    <span className="inline-flex w-full max-w-[22rem] scroll-mb-28 flex-col gap-3">
      <span className="flex items-center justify-between gap-4">
        <span className="text-[12px] text-zinc-500">Duration</span>
        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[12px] font-medium tabular-nums text-zinc-200 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]">
          {selectedOption?.label}
        </span>
      </span>
      <span
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={maxIndex}
        aria-valuenow={currentIndex}
        aria-valuetext={selectedOption?.label}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative flex h-7 w-full cursor-grab touch-none items-center rounded-full outline-none ring-offset-2 ring-offset-[#090d0a] focus-visible:ring-2 focus-visible:ring-[#7dff4d]/30 active:cursor-grabbing',
          disabled && 'cursor-not-allowed opacity-45'
        )}
      >
        <span
          aria-hidden="true"
          className="h-2 w-full rounded-full"
          style={{
            background: `linear-gradient(to right, var(--accent-color, #7dff4d) 0%, var(--accent-color, #7dff4d) ${progress}%, rgba(255,255,255,0.09) ${progress}%, rgba(255,255,255,0.09) 100%)`,
          }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.45)]"
          style={{ left: `${progress}%` }}
        />
      </span>
      <span
        aria-hidden="true"
        className="grid gap-1 text-center text-[10px] text-zinc-600"
        style={{
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        }}
      >
        {options.map((option, index) => (
          <span
            key={option.value}
            className={cn(index === currentIndex && 'text-zinc-300')}
          >
            {option.label}
          </span>
        ))}
      </span>
    </span>
  )
}
