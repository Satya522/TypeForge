'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FontOption = {
  label: string
  description: string
  sample: string
  value: string
}

type FontSelectorProps = {
  ariaLabel: string
  options: FontOption[]
  value: string
  onChange: (value: string) => void
}

export function FontSelector({
  ariaLabel,
  options,
  value,
  onChange,
}: FontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuId = useId()
  const containerRef = useRef<HTMLSpanElement>(null)
  const selectedOption =
    options.find((opt) => opt.value === value) || options[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(optionValue: string) {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <span
      ref={containerRef}
      className="relative inline-block w-full sm:w-[14rem]"
    >
      <button
        type="button"
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={ariaLabel}
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          'group flex h-11 w-full items-center justify-between rounded-full bg-white/[0.045] px-4 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-[background-color,box-shadow] duration-150 ease-out hover:bg-white/[0.065] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7dff4d]/25',
          isOpen &&
            'bg-white/[0.07] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09)]'
        )}
      >
        <span className="flex min-w-0 flex-col gap-0.5">
          <span
            className="text-[14px] font-medium text-zinc-200"
            style={{ fontFamily: selectedOption.value }}
          >
            {selectedOption.label}
          </span>
          <span className="truncate text-[11px] text-zinc-500">
            {selectedOption.description}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'ml-3 h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform duration-150',
            isOpen && 'rotate-180 text-zinc-300'
          )}
        />
      </button>

      {isOpen && (
        <span
          id={menuId}
          role="radiogroup"
          aria-label={ariaLabel}
          className={cn(
            'absolute right-0 top-full z-50 mt-2 flex w-[min(18rem,calc(100vw-2rem))] flex-col rounded-[1.65rem] bg-[#10140f]/95 p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.065] backdrop-blur-xl',
            'animate-in fade-in slide-in-from-top-1 duration-150'
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'group flex w-full items-center justify-between rounded-full px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7dff4d]/20',
                  isSelected && 'bg-white/[0.06]'
                )}
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span
                    className={cn(
                      'truncate text-[13px] font-medium transition-colors',
                      isSelected
                        ? 'text-white'
                        : 'text-zinc-300 group-hover:text-zinc-200'
                    )}
                    style={{ fontFamily: option.value }}
                  >
                    {option.label}
                  </span>
                  <span className="truncate text-[11px] text-zinc-500">
                    {option.description}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      'text-[13px] text-zinc-500 transition-colors',
                      isSelected && 'text-zinc-300'
                    )}
                    style={{ fontFamily: option.value }}
                  >
                    {option.sample}
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-[var(--accent-color,#7dff4d)]" />
                  )}
                </span>
              </button>
            )
          })}
        </span>
      )}
    </span>
  )
}
