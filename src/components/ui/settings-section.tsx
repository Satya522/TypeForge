import { ReactNode } from 'react'

export type SettingsSectionProps = {
  children: ReactNode
  id?: string
  label: string
}

export function SettingsSection({
  children,
  id,
  label,
}: SettingsSectionProps) {
  return (
    <fieldset className="border-t border-white/[0.045] px-5 py-6 sm:px-7">
      <legend
        id={id}
        className="text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-600"
      >
        {label}
      </legend>
      <ul className="mt-4 divide-y divide-white/[0.045]">
        {children}
      </ul>
    </fieldset>
  )
}
