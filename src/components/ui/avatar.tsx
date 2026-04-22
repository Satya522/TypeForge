'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

export type AvatarStatus =
  | 'online'
  | 'focus'
  | 'away'
  | 'offline'
  | 'racing'
  | 'idle'
  | 'dnd'
  | 'invisible'
  | null
  | undefined

type AvatarProps = {
  src?: string | null
  name?: string | null
  size?: number
  status?: AvatarStatus
  alt?: string
  className?: string
  imageClassName?: string
  fallbackClassName?: string
  ringOffsetClassName?: string
}

const STATUS_RING: Record<Exclude<AvatarStatus, null | undefined>, string> = {
  online: 'ring-green-400',
  focus: 'ring-blue-400',
  away: 'ring-zinc-500',
  offline: 'ring-zinc-600',
  racing: 'ring-amber-400',
  idle: 'ring-zinc-500',
  dnd: 'ring-blue-400',
  invisible: 'ring-zinc-500',
}

const AVATAR_TONES = [
  'bg-violet-700',
  'bg-indigo-600',
  'bg-sky-700',
  'bg-emerald-700',
  'bg-amber-700',
  'bg-rose-700',
  'bg-cyan-700',
  'bg-fuchsia-700',
] as const

function getInitials(name?: string | null) {
  const source = name?.trim() || 'U'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function getAvatarTone(initial: string) {
  const code = initial.charCodeAt(0)
  const index = Number.isNaN(code) ? 0 : Math.max(0, code - 65) % AVATAR_TONES.length
  return AVATAR_TONES[index]
}

function isRenderableAvatarSrc(src?: string | null) {
  if (!src) return false
  const value = src.trim()
  if (!value) return false

  return /^(https?:\/\/|\/|data:image\/|blob:)/i.test(value)
}

export function Avatar({
  src,
  name,
  size = 40,
  status,
  alt,
  className,
  imageClassName,
  fallbackClassName,
  ringOffsetClassName,
}: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [src])

  const initials = useMemo(() => getInitials(name), [name])
  const initial = initials[0] || 'U'
  const toneClass = useMemo(() => getAvatarTone(initial), [initial])
  const canRenderImage = isRenderableAvatarSrc(src) && !imageFailed
  const normalizedStatus =
    status === 'dnd'
      ? 'focus'
      : status === 'idle' || status === 'invisible'
        ? 'away'
        : status
  const fontSize = Math.min(Math.max(11, Math.round(size * 0.38)), 36)

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full text-white',
        normalizedStatus && 'ring-2 ring-offset-2',
        normalizedStatus && STATUS_RING[normalizedStatus],
        normalizedStatus && (ringOffsetClassName || 'ring-offset-transparent'),
        !canRenderImage && toneClass,
        className
      )}
      style={{ width: size, height: size, fontSize }}
      aria-label={alt || name || 'Avatar'}
    >
      {canRenderImage ? (
        <img
          src={src as string}
          alt={alt || name || 'Avatar'}
          className={cn('h-full w-full object-cover', imageClassName)}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn('inline-flex h-full w-full items-center justify-center font-semibold uppercase', fallbackClassName)}
        >
          {initials}
        </span>
      )}
    </div>
  )
}
