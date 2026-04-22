export const PROFILE_NICKNAME_MAX_LENGTH = 32
export const PROFILE_HANDLE_MAX_LENGTH = 20
export const PROFILE_IMAGE_MAX_BYTES = 2 * 1024 * 1024
export const PROFILE_HANDLE_REGEX = /^[A-Za-z0-9_]{1,20}$/
export const PROFILE_ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

export type DisplayNameSource = {
  email?: string | null
  handle?: string | null
  name?: string | null
  nickname?: string | null
  username?: string | null
}

export function normalizeNickname(value?: string | null) {
  if (!value) return null

  const normalized = value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, PROFILE_NICKNAME_MAX_LENGTH)

  return normalized || null
}

export function normalizeHandle(value?: string | null) {
  if (!value) return null

  const normalized = value
    .trim()
    .replace(/^@+/, '')
    .replace(/[^\w]/g, '')
    .slice(0, PROFILE_HANDLE_MAX_LENGTH)
    .toLowerCase()

  return normalized || null
}

export function createUsernameSeed(value?: string | null, fallback = 'typist') {
  const normalized = (value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^\w]/g, '')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32)

  return normalized || fallback
}

export function isValidHandle(value?: string | null) {
  if (!value) return false
  return PROFILE_HANDLE_REGEX.test(value)
}

export function getDisplayName(source?: DisplayNameSource | null, fallback = 'Typist') {
  if (!source) return fallback

  const nickname = source.nickname?.trim()
  if (nickname) return nickname

  const username = source.username?.trim()
  if (username) return username

  const name = source.name?.trim()
  if (name) return name

  const email = source.email?.trim()
  if (email?.includes('@')) {
    return email.split('@')[0] || fallback
  }

  return fallback
}

export function getHandleLabel(handle?: string | null) {
  if (!handle) return null
  const normalized = normalizeHandle(handle)
  return normalized ? `@${normalized}` : null
}

export function getResolvedAvatarUrl(source?: { avatarUrl?: string | null; image?: string | null } | null) {
  return source?.avatarUrl || source?.image || null
}

export function getPublicProfileHref(handle?: string | null, userId?: string | null) {
  const identifier = normalizeHandle(handle) || userId
  return identifier ? `/profile/${encodeURIComponent(identifier)}` : '/profile'
}

export function isProfileComplete(source?: {
  avatarUrl?: string | null
  handle?: string | null
  image?: string | null
  nickname?: string | null
} | null) {
  const avatar = getResolvedAvatarUrl(source)
  return Boolean(avatar && normalizeNickname(source?.nickname) && normalizeHandle(source?.handle))
}
