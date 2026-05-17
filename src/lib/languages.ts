export const SUPPORTED_LANGUAGE_CODES = ['en', 'hi', 'es', 'fr', 'de'] as const

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGE_CODES)[number]

export type SupportedLanguage = {
  code: SupportedLanguageCode
  label: string
  nativeLabel: string
  shortLabel: string
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', shortLabel: 'EN' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', shortLabel: 'HI' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', shortLabel: 'ES' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', shortLabel: 'FR' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', shortLabel: 'DE' },
]

export function isSupportedLanguageCode(
  value: unknown
): value is SupportedLanguageCode {
  return (
    typeof value === 'string' &&
    SUPPORTED_LANGUAGE_CODES.includes(value as SupportedLanguageCode)
  )
}

export function normalizeLanguageCode(
  value: unknown
): SupportedLanguageCode {
  return isSupportedLanguageCode(value) ? value : 'en'
}
