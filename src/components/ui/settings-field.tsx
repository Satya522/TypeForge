import { ReactNode } from 'react'

export type SettingsFieldProps = {
  children: ReactNode
  description: string
  htmlFor?: string
  title: string
}

export function SettingsField({
  children,
  description,
  htmlFor,
  title,
}: SettingsFieldProps) {
  return (
    <li className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,auto)] sm:items-center">
      <span className="min-w-0">
        {htmlFor ? (
          <label
            htmlFor={htmlFor}
            className="block text-[13px] font-medium text-zinc-200"
          >
            {title}
          </label>
        ) : (
          <span className="block text-[13px] font-medium text-zinc-200">
            {title}
          </span>
        )}
        <span className="mt-1 block text-[12px] leading-5 text-zinc-500">
          {description}
        </span>
      </span>
      <span className="flex min-w-0 justify-start sm:justify-end">
        {children}
      </span>
    </li>
  )
}
