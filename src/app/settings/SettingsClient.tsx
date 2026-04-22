'use client'

import type { UserSettings } from '@prisma/client'
import { Check, Loader2, Lock, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { z } from 'zod'
import { ProfilePhotoDialog } from '@/components/profile/ProfilePhotoDialog'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChoiceGroup, type ChoiceOption } from '@/components/ui/choice-group'
import {
  DiscreteSlider,
  type DiscreteSliderOption,
} from '@/components/ui/discrete-slider'
import { FontSelector, type FontOption } from '@/components/ui/font-selector'
import { NumberStepper } from '@/components/ui/number-stepper'
import { SettingsField } from '@/components/ui/settings-field'
import { SettingsSection } from '@/components/ui/settings-section'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { useTheme } from '@/components/ThemeProvider'
import {
  PROFILE_HANDLE_MAX_LENGTH,
  PROFILE_NICKNAME_MAX_LENGTH,
  getDisplayName,
  getResolvedAvatarUrl,
  isValidHandle,
  normalizeHandle,
  normalizeNickname,
} from '@/lib/profile'
import { validateProfileImageFile } from '@/lib/profile-image'
import { cn } from '@/lib/utils'

const settingsSchema = z.object({
  accentColor: z.string().min(1),
  dailyGoal: z.number().int().min(1).max(50),
  fontFamily: z.string().min(1),
  fontSize: z.number().int().min(12).max(28),
  language: z.enum(['en', 'hi', 'es']),
  leaderboardVisible: z.boolean(),
  notificationsEnabled: z.boolean(),
  preferredDuration: z.enum([
    'S15',
    'S30',
    'S60',
    'S120',
    'S180',
    'S240',
    'S300',
  ]),
  reducedMotion: z.boolean(),
  soundEnabled: z.boolean(),
  theme: z.enum(['dark', 'light']),
})

type SettingsValues = z.infer<typeof settingsSchema>

type ProfileSettingsUser = {
  avatarUrl?: string | null
  email?: string | null
  handle?: string | null
  id: string
  image?: string | null
  name?: string | null
  nickname?: string | null
  profileNudgeDismissed?: boolean
  username?: string | null
}

type SettingsClientProps = {
  settings: UserSettings
  user: ProfileSettingsUser
}

type HandleState = 'available' | 'checking' | 'idle' | 'invalid' | 'taken'

type ProfileApiResponse = {
  user: ProfileSettingsUser
}

const accentOptions: ChoiceOption<string>[] = [
  { label: 'Green', swatchClassName: 'bg-[#7dff4d]', value: 'green' },
  { label: 'Blue', swatchClassName: 'bg-[#60a5fa]', value: 'blue' },
  { label: 'Violet', swatchClassName: 'bg-[#8b5cf6]', value: 'purple' },
  { label: 'Amber', swatchClassName: 'bg-[#f59e0b]', value: 'orange' },
]

const themeOptions: ChoiceOption<SettingsValues['theme']>[] = [
  { description: 'Low light', label: 'Dark', value: 'dark' },
  { description: 'Bright shell', label: 'Light', value: 'light' },
]

const fontOptions: FontOption[] = [
  {
    description: 'Clean product UI',
    label: 'Inter',
    sample: 'Aa',
    value: 'Inter',
  },
  {
    description: 'Neutral rhythm',
    label: 'Roboto',
    sample: 'Aa',
    value: 'Roboto',
  },
  {
    description: 'Typing focus',
    label: 'Monospace',
    sample: '{}',
    value: 'monospace',
  },
  {
    description: 'Code practice',
    label: 'Source Code Pro',
    sample: '</>',
    value: 'Source Code Pro',
  },
]

const languageOptions: ChoiceOption<SettingsValues['language']>[] = [
  { label: 'English', value: 'en' },
  { label: 'हिन्दी', value: 'hi' },
  { label: 'Español', value: 'es' },
]

const durationOptions: DiscreteSliderOption<
  SettingsValues['preferredDuration']
>[] = [
  { label: '15s', value: 'S15' },
  { label: '30s', value: 'S30' },
  { label: '1m', value: 'S60' },
  { label: '2m', value: 'S120' },
  { label: '3m', value: 'S180' },
  { label: '4m', value: 'S240' },
  { label: '5m', value: 'S300' },
]

const inputClassName =
  'h-11 w-full rounded-full border-0 bg-white/[0.045] px-4 text-[14px] text-zinc-100 outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)] transition-[background-color,box-shadow] duration-150 ease-out placeholder:text-zinc-600 focus:bg-white/[0.065] focus:shadow-[inset_0_0_0_1px_rgba(125,255,77,0.24),0_0_0_3px_rgba(125,255,77,0.055)]'

function getSettingsDefaults(settings: UserSettings): SettingsValues {
  return {
    accentColor: settings.accentColor ?? 'green',
    dailyGoal: settings.dailyGoal ?? 5,
    fontFamily: settings.fontFamily ?? 'Inter',
    fontSize: settings.fontSize ?? 16,
    language:
      settings.language === 'hi' || settings.language === 'es'
        ? settings.language
        : 'en',
    leaderboardVisible: settings.leaderboardVisible,
    notificationsEnabled: settings.notificationsEnabled ?? true,
    preferredDuration: settings.preferredDuration ?? 'S60',
    reducedMotion: settings.reducedMotion,
    soundEnabled: settings.soundEnabled,
    theme: settings.theme === 'light' ? 'light' : 'dark',
  }
}

function getHandleStateLabel(state: HandleState) {
  switch (state) {
    case 'available':
      return 'Handle available'
    case 'checking':
      return 'Checking handle'
    case 'taken':
      return 'Handle already taken'
    case 'invalid':
      return 'Use only letters, numbers, and underscores'
    default:
      return 'Permanent after save'
  }
}

export default function SettingsClient({
  settings,
  user,
}: SettingsClientProps) {
  const router = useRouter()
  const { update } = useSession()
  const { updateSettings } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const initialSettings = useMemo(
    () => getSettingsDefaults(settings),
    [settings]
  )
  const [settingsValues, setSettingsValues] =
    useState<SettingsValues>(initialSettings)
  const [profileUser, setProfileUser] = useState(user)
  const [nickname, setNickname] = useState(user.nickname ?? '')
  const [handleValue, setHandleValue] = useState(user.handle ?? '')
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [appliedSettingKey, setAppliedSettingKey] = useState<string | null>(
    null
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [handleState, setHandleState] = useState<HandleState>('idle')
  const [debouncedHandle] = useDebounce(handleValue, 500)
  const handleLocked = Boolean(profileUser.handle)
  const normalizedNickname = normalizeNickname(nickname)
  const normalizedHandle = normalizeHandle(handleValue)
  const avatarSrc = getResolvedAvatarUrl(profileUser)
  const displayName = nickname || getDisplayName(profileUser, 'Typist')
  const profileDirty =
    normalizedNickname !== normalizeNickname(profileUser.nickname) ||
    (!handleLocked && normalizedHandle !== normalizeHandle(profileUser.handle))
  const profileCompleteCount =
    Number(Boolean(avatarSrc)) +
    Number(Boolean(normalizedNickname)) +
    Number(Boolean(normalizedHandle || profileUser.handle))
  const profileCompletion = Math.round((profileCompleteCount / 3) * 100)

  useEffect(() => {
    setSettingsValues(initialSettings)
  }, [initialSettings])

  useEffect(() => {
    setProfileUser(user)
    setNickname(user.nickname ?? '')
    setHandleValue(user.handle ?? '')
  }, [user])

  useEffect(() => {
    if (handleLocked) {
      setHandleState('idle')
      return
    }

    const handleToCheck = normalizeHandle(debouncedHandle) ?? ''
    if (!handleToCheck) {
      setHandleState('idle')
      return
    }

    if (!isValidHandle(handleToCheck)) {
      setHandleState('invalid')
      return
    }

    let cancelled = false

    async function checkAvailability() {
      setHandleState('checking')

      try {
        const response = await fetch(
          `/api/profile/handle?value=${encodeURIComponent(handleToCheck)}`,
          { cache: 'no-store' }
        )

        if (!response.ok || cancelled) {
          return
        }

        const data = (await response.json()) as { available?: boolean }
        setHandleState(data.available ? 'available' : 'taken')
      } catch {
        if (!cancelled) {
          setHandleState('idle')
        }
      }
    }

    void checkAvailability()

    return () => {
      cancelled = true
    }
  }, [debouncedHandle, handleLocked])

  async function applySetting<TKey extends keyof SettingsValues>(
    key: TKey,
    value: SettingsValues[TKey]
  ) {
    setSettingsError(null)
    setAppliedSettingKey(key)

    const nextSettings = {
      ...settingsValues,
      [key]: value,
    }

    setSettingsValues(nextSettings)
    updateSettings({
      accentColor: nextSettings.accentColor,
      fontFamily: nextSettings.fontFamily,
      fontSize: nextSettings.fontSize,
      notificationsEnabled: nextSettings.notificationsEnabled,
      theme: nextSettings.theme,
    })

    try {
      const response = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextSettings),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        setSettingsValues(settingsValues)
        updateSettings({
          accentColor: settingsValues.accentColor,
          fontFamily: settingsValues.fontFamily,
          fontSize: settingsValues.fontSize,
          notificationsEnabled: settingsValues.notificationsEnabled,
          theme: settingsValues.theme,
        })
        setSettingsError(data.error || 'Failed to update setting.')
        setAppliedSettingKey(null)
        return
      }

      setTimeout(() => setAppliedSettingKey(null), 1500)
    } catch {
      setSettingsValues(settingsValues)
      updateSettings({
        accentColor: settingsValues.accentColor,
        fontFamily: settingsValues.fontFamily,
        fontSize: settingsValues.fontSize,
        notificationsEnabled: settingsValues.notificationsEnabled,
        theme: settingsValues.theme,
      })
      setSettingsError('Network error. Try again.')
      setAppliedSettingKey(null)
    }
  }

  function updateProfileDraft(nextValue: {
    handle?: string
    nickname?: string
  }) {
    if (nextValue.nickname !== undefined) {
      setNickname(nextValue.nickname)
    }
    if (nextValue.handle !== undefined) {
      setHandleValue(normalizeHandle(nextValue.handle) ?? '')
    }
    setProfileError(null)
  }

  async function syncAuthContext(nextUser: ProfileSettingsUser) {
    await update({
      avatarUrl: nextUser.avatarUrl ?? null,
      handle: nextUser.handle ?? null,
      image: nextUser.avatarUrl ?? nextUser.image ?? null,
      name: nextUser.name ?? null,
      nickname: nextUser.nickname ?? null,
      profileNudgeDismissed: nextUser.profileNudgeDismissed ?? false,
      username: nextUser.username ?? null,
    })
    router.refresh()
  }

  async function applyProfileResponse(data: ProfileApiResponse) {
    setProfileUser((previous) => ({ ...previous, ...data.user }))
    setNickname(data.user.nickname ?? '')
    setHandleValue(data.user.handle ?? '')
    setProfileError(null)
    setAvatarError(null)
    await syncAuthContext(data.user)
  }

  async function handleFileSelection(file: File | null) {
    if (!file) return

    const error = await validateProfileImageFile(file)
    if (error) {
      setAvatarError(error)
      setSelectedFile(null)
      return
    }

    setAvatarError(null)
    setSelectedFile(file)
  }

  async function handlePhotoSave(blob: Blob) {
    setIsUploadingPhoto(true)
    setAvatarError(null)

    try {
      const formData = new FormData()
      formData.append(
        'avatar',
        new File([blob], 'avatar.png', { type: 'image/png' })
      )

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        body: formData,
      })

      const data = (await response.json()) as ProfileApiResponse & {
        error?: string
      }
      if (!response.ok) {
        setAvatarError(data.error || 'Unable to update your photo.')
        return
      }

      setSelectedFile(null)
      await applyProfileResponse(data)
    } catch {
      setAvatarError('Unable to update your photo.')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  async function handleSaveChanges() {
    const handleChanged =
      !handleLocked && normalizedHandle !== normalizeHandle(profileUser.handle)

    setProfileError(null)

    if (handleChanged && normalizedHandle && !isValidHandle(normalizedHandle)) {
      setProfileError(
        'Use only letters, numbers, and underscores for your handle.'
      )
      return
    }

    if (handleChanged && normalizedHandle && handleState !== 'available') {
      setProfileError(
        handleState === 'taken'
          ? 'That handle is already taken.'
          : 'Choose an available handle before saving.'
      )
      return
    }

    if (!profileDirty) {
      return
    }

    setIsSavingProfile(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: handleLocked ? undefined : normalizedHandle,
          nickname: normalizedNickname,
        }),
      })

      const data = (await response.json()) as ProfileApiResponse & {
        error?: string
      }
      if (!response.ok) {
        setProfileError(data.error || 'Unable to save your profile right now.')
        return
      }

      await applyProfileResponse(data)
    } catch {
      setProfileError('Network error. Try saving again.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleIndicator = handleLocked ? (
    <Lock className="h-3.5 w-3.5 text-zinc-500" />
  ) : handleState === 'checking' ? (
    <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500" />
  ) : handleState === 'available' ? (
    <Check className="h-3.5 w-3.5 text-emerald-400" />
  ) : handleState === 'taken' || handleState === 'invalid' ? (
    <X className="h-3.5 w-3.5 text-red-400" />
  ) : null

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void handleSaveChanges()
        }}
        className="mx-auto w-full max-w-5xl"
      >
        <section className="overflow-hidden rounded-[2rem] bg-[#090d0a]/90 shadow-[0_30px_100px_rgba(0,0,0,0.34)] ring-1 ring-white/[0.055] backdrop-blur-xl">
          <header className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-7">
            <span>
              <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-600">
                TypeForge
              </span>
              <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-white sm:text-[34px]">
                Settings
              </h1>
            </span>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/[0.045] px-3 py-1.5 text-[11px] text-zinc-400 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7dff4d]" />
              Changes sync instantly
            </span>
          </header>

          <section
            aria-labelledby="identity-title"
            className="grid gap-7 border-t border-white/[0.045] px-5 py-7 sm:px-7 lg:grid-cols-[13rem_minmax(0,1fr)]"
          >
            <figure className="m-0">
              <span
                className="grid h-[104px] w-[104px] place-items-center rounded-full p-[2px]"
                style={{
                  background: `conic-gradient(var(--accent-color, #7dff4d) ${profileCompletion * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
                }}
              >
                <span className="grid h-full w-full place-items-center rounded-full bg-[#090d0a]">
                  <Avatar
                    src={avatarSrc}
                    name={displayName}
                    size={88}
                    className="ring-1 ring-white/[0.08]"
                    fallbackClassName="text-[24px] tracking-[-0.04em]"
                  />
                </span>
              </span>
              <figcaption className="mt-4 space-y-2">
                <button
                  type="button"
                  className="text-[13px] font-medium text-[#9cff7a] transition-colors duration-150 ease-out hover:text-white disabled:pointer-events-none disabled:opacity-45"
                  onClick={() => inputRef.current?.click()}
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? 'Saving photo...' : 'Change photo'}
                </button>
                <p className="text-[12px] leading-5 text-zinc-500">
                  Profile {profileCompletion}% complete
                </p>
                <span className="block h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className="block h-full rounded-full bg-[var(--accent-color)]/80"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </span>
                {avatarError ? (
                  <p className="text-[12px] leading-5 text-red-400">
                    {avatarError}
                  </p>
                ) : null}
              </figcaption>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  void handleFileSelection(file)
                  event.currentTarget.value = ''
                }}
              />
            </figure>

            <fieldset className="min-w-0">
              <legend
                id="identity-title"
                className="text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-600"
              >
                Identity
              </legend>
              <ul className="mt-4 divide-y divide-white/[0.045]">
                <SettingsField
                  htmlFor="profile-display-name"
                  title="Display name"
                  description="This is what others see across community surfaces."
                >
                  <input
                    id="profile-display-name"
                    type="text"
                    maxLength={PROFILE_NICKNAME_MAX_LENGTH}
                    value={nickname}
                    onChange={(event) =>
                      updateProfileDraft({ nickname: event.target.value })
                    }
                    placeholder="How you want to be known"
                    className={cn(inputClassName, 'sm:w-[22rem]')}
                  />
                </SettingsField>

                <SettingsField
                  htmlFor="profile-handle"
                  title="Handle"
                  description={
                    handleLocked
                      ? 'Locked permanently for public identity.'
                      : getHandleStateLabel(handleState)
                  }
                >
                  <span className="relative w-full sm:w-[22rem]">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-zinc-600">
                      @
                    </span>
                    <input
                      id="profile-handle"
                      type="text"
                      maxLength={PROFILE_HANDLE_MAX_LENGTH}
                      value={handleValue}
                      onChange={(event) =>
                        updateProfileDraft({ handle: event.target.value })
                      }
                      readOnly={handleLocked}
                      placeholder="username"
                      className={cn(
                        inputClassName,
                        'pl-8 pr-11 sm:w-[22rem]',
                        handleLocked &&
                          'cursor-not-allowed bg-white/[0.03] text-zinc-400 focus:bg-white/[0.03]'
                      )}
                    />
                    {handleIndicator ? (
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                        {handleIndicator}
                      </span>
                    ) : null}
                  </span>
                </SettingsField>
              </ul>
              {profileError ? (
                <p className="mt-3 text-[12px] text-red-400">{profileError}</p>
              ) : null}
            </fieldset>
          </section>

          <SettingsSection label="Primary preferences">
            <SettingsField
              title="Accent color"
              description="A restrained highlight for controls and feedback."
            >
              <ChoiceGroup
                ariaLabel="Accent color"
                options={accentOptions}
                value={settingsValues.accentColor}
                variant="palette"
                onChange={(value) => void applySetting('accentColor', value)}
              />
            </SettingsField>

            <SettingsField
              title="Theme"
              description="Choose the surface mood for long typing sessions."
            >
              <ChoiceGroup
                ariaLabel="Theme"
                options={themeOptions}
                value={settingsValues.theme}
                onChange={(value) => void applySetting('theme', value)}
              />
            </SettingsField>

            <SettingsField
              title="Font family"
              description="Preview the personality before it touches the app."
            >
              <FontSelector
                ariaLabel="Font family"
                options={fontOptions}
                value={settingsValues.fontFamily}
                onChange={(value) => void applySetting('fontFamily', value)}
              />
            </SettingsField>

            <SettingsField
              title="Font size"
              description="Keep reading comfort precise."
            >
              <NumberStepper
                ariaLabel="Font size"
                min={12}
                max={28}
                suffix="px"
                value={settingsValues.fontSize}
                onChange={(value) => void applySetting('fontSize', value)}
              />
            </SettingsField>

            <SettingsField
              title="Language"
              description="Set the interface language."
            >
              <ChoiceGroup
                ariaLabel="Language"
                options={languageOptions}
                value={settingsValues.language}
                onChange={(value) => void applySetting('language', value)}
              />
            </SettingsField>
          </SettingsSection>

          <SettingsSection label="Behavior">
            <SettingsField
              title="Sound effects"
              description="Enable crisp key feedback during sessions."
            >
              <ToggleSwitch
                label="Sound effects"
                checked={settingsValues.soundEnabled}
                onCheckedChange={(value) =>
                  void applySetting('soundEnabled', value)
                }
              />
            </SettingsField>

            <SettingsField
              title="Notifications"
              description="Receive reminders and streak nudges."
            >
              <ToggleSwitch
                label="Notifications"
                checked={settingsValues.notificationsEnabled}
                onCheckedChange={(value) =>
                  void applySetting('notificationsEnabled', value)
                }
              />
            </SettingsField>

            <SettingsField
              title="Leaderboard visibility"
              description="Show your stats on public leaderboards."
            >
              <ToggleSwitch
                label="Leaderboard visibility"
                checked={settingsValues.leaderboardVisible}
                onCheckedChange={(value) =>
                  void applySetting('leaderboardVisible', value)
                }
              />
            </SettingsField>

            <SettingsField
              title="Reduced motion"
              description="Calm down transitions and animated flourishes."
            >
              <ToggleSwitch
                label="Reduced motion"
                checked={settingsValues.reducedMotion}
                onCheckedChange={(value) =>
                  void applySetting('reducedMotion', value)
                }
              />
            </SettingsField>

            <SettingsField
              title="Daily goal"
              description="Set the default number of sessions you want to complete."
            >
              <NumberStepper
                ariaLabel="Daily goal"
                min={1}
                max={50}
                value={settingsValues.dailyGoal}
                onChange={(value) => void applySetting('dailyGoal', value)}
              />
            </SettingsField>

            <SettingsField
              title="Session duration"
              description="Drag like an audio control, from quick drills to five minutes."
            >
              <DiscreteSlider
                ariaLabel="Session duration"
                options={durationOptions}
                value={settingsValues.preferredDuration}
                onChange={(value) =>
                  void applySetting('preferredDuration', value)
                }
              />
            </SettingsField>
          </SettingsSection>

          {settingsError ? (
            <p className="px-5 py-3 text-[12px] text-red-400 sm:px-7">
              {settingsError}
            </p>
          ) : appliedSettingKey ? (
            <p className="px-5 py-3 text-[12px] text-[#9cff7a]/80 sm:px-7">
              {appliedSettingKey === 'accentColor' && 'Accent color updated'}
              {appliedSettingKey === 'theme' && 'Theme updated'}
              {appliedSettingKey === 'fontFamily' && 'Font updated'}
              {appliedSettingKey === 'fontSize' && 'Font size updated'}
              {appliedSettingKey === 'language' && 'Language updated'}
              {appliedSettingKey === 'soundEnabled' &&
                'Sound preference updated'}
              {appliedSettingKey === 'notificationsEnabled' &&
                'Notifications updated'}
              {appliedSettingKey === 'leaderboardVisible' &&
                'Visibility updated'}
              {appliedSettingKey === 'reducedMotion' &&
                'Motion preference updated'}
              {appliedSettingKey === 'dailyGoal' && 'Daily goal updated'}
              {appliedSettingKey === 'preferredDuration' &&
                'Session duration updated'}
            </p>
          ) : null}

          <footer className="sticky bottom-0 flex flex-col gap-3 border-t border-white/[0.055] bg-[#090d0a]/88 px-5 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p
              className={cn(
                'text-[12px]',
                profileError ? 'text-red-400' : 'text-zinc-500'
              )}
            >
              {profileError ||
                (profileDirty
                  ? 'Profile changes pending'
                  : 'All settings auto-saved')}
            </p>
            <Button
              type="submit"
              disabled={isSavingProfile || !profileDirty}
              className="h-10 rounded-full bg-white px-5 text-[13px] font-medium text-black shadow-none transition-colors duration-150 ease-out hover:bg-[var(--accent-color,#7dff4d)] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:text-black disabled:opacity-100 disabled:hover:bg-zinc-300"
            >
              {isSavingProfile ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save profile
            </Button>
          </footer>
        </section>
      </form>

      <ProfilePhotoDialog
        file={selectedFile}
        isOpen={Boolean(selectedFile)}
        onClose={() => {
          if (!isUploadingPhoto) {
            setSelectedFile(null)
          }
        }}
        onSave={handlePhotoSave}
      />
    </>
  )
}
