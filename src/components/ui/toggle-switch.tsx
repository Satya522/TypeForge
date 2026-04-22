'use client'

import { cn } from '@/lib/utils'

type ToggleSwitchProps = {
  checked: boolean
  disabled?: boolean
  id?: string
  label: string
  onCheckedChange: (checked: boolean) => void
}

export function ToggleSwitch({
  checked,
  disabled,
  id,
  label,
  onCheckedChange,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-[background-color,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7dff4d]/30 disabled:pointer-events-none disabled:opacity-45',
        checked
          ? 'bg-[#7dff4d] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]'
          : 'bg-white/[0.08] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'h-5 w-5 rounded-full bg-white shadow-[0_3px_10px_rgba(0,0,0,0.28)] transition-transform duration-200 ease-out',
          checked ? 'translate-x-[21px]' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}
