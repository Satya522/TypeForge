'use client'

import { Check, Loader2, Lock, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { ProfilePhotoDialog } from '@/components/profile/ProfilePhotoDialog'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  PROFILE_HANDLE_MAX_LENGTH,
  PROFILE_NICKNAME_MAX_LENGTH,
  getResolvedAvatarUrl,
  isValidHandle,
  normalizeHandle,
  normalizeNickname,
} from '@/lib/profile'
import { validateProfileImageFile } from '@/lib/profile-image'
import { cn } from '@/lib/utils'

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

type ProfileSettingsFormProps = {
  user: ProfileSettingsUser
}

type HandleState = 'available' | 'checking' | 'idle' | 'invalid' | 'taken'

type ProfileApiResponse = {
  user: ProfileSettingsUser
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
      return null
  }
}

export function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const router = useRouter()
  const { update } = useSession()
  const inputRef = useRef<HTMLInputElement>(null)
  const [profileUser, setProfileUser] = useState(user)
  const [nickname, setNickname] = useState(user.nickname ?? '')
  const [handleValue, setHandleValue] = useState(user.handle ?? '')
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [handleState, setHandleState] = useState<HandleState>('idle')
  const [debouncedHandle] = useDebounce(handleValue, 500)
  const handleLocked = Boolean(profileUser.handle)
  const avatarSrc = getResolvedAvatarUrl(profileUser)
  const avatarName = nickname || profileUser.nickname || profileUser.name || profileUser.username || profileUser.email || 'Typist'

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

    const normalizedHandle = normalizeHandle(debouncedHandle)
    if (!normalizedHandle) {
      setHandleState('idle')
      return
    }

    if (!isValidHandle(normalizedHandle)) {
      setHandleState('invalid')
      return
    }

    const handleToCheck = normalizedHandle
    let cancelled = false

    async function checkAvailability() {
      setHandleState('checking')

      try {
        const response = await fetch(`/api/profile/handle?value=${encodeURIComponent(handleToCheck)}`, {
          cache: 'no-store',
        })

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
    setProfileUser((previous) => ({
      ...previous,
      ...data.user,
    }))
    setNickname(data.user.nickname ?? '')
    setHandleValue(data.user.handle ?? '')
    setFormError(null)
    setAvatarError(null)
    setFormSuccess('Profile updated.')
    await syncAuthContext(data.user)
  }

  async function handleSaveProfile() {
    const normalizedNickname = normalizeNickname(nickname)
    const normalizedHandle = normalizeHandle(handleValue)

    if (!handleLocked && normalizedHandle && !isValidHandle(normalizedHandle)) {
      setFormError('Use only letters, numbers, and underscores for your handle.')
      setFormSuccess(null)
      return
    }

    if (!handleLocked && normalizedHandle && handleState === 'taken') {
      setFormError('That handle is already taken.')
      setFormSuccess(null)
      return
    }

    setIsSaving(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: normalizedNickname,
          handle: handleLocked ? undefined : normalizedHandle,
        }),
      })

      const data = (await response.json()) as ProfileApiResponse & { error?: string }
      if (!response.ok) {
        setFormError(data.error || 'Unable to save your profile right now.')
        return
      }

      await applyProfileResponse(data)
    } catch {
      setFormError('Unable to save your profile right now.')
    } finally {
      setIsSaving(false)
    }
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
    setFormSuccess(null)

    try {
      const formData = new FormData()
      formData.append('avatar', new File([blob], 'avatar.png', { type: 'image/png' }))

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        body: formData,
      })

      const data = (await response.json()) as ProfileApiResponse & { error?: string }
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

  const handleIndicator = handleLocked ? (
    <Lock className="h-4 w-4 text-zinc-500" />
  ) : handleState === 'checking' ? (
    <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
  ) : handleState === 'available' ? (
    <Check className="h-4 w-4 text-emerald-400" />
  ) : handleState === 'taken' || handleState === 'invalid' ? (
    <X className="h-4 w-4 text-red-400" />
  ) : null

  const handleHelper = handleLocked
    ? 'Your permanent @handle. Choose carefully — cannot be changed.'
    : getHandleStateLabel(handleState) || 'Your permanent @handle. Choose carefully — cannot be changed.'

  return (
    <>
      <section className="mb-8 w-full min-w-0 overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#080d09]/85 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28)] ring-1 ring-black/30 backdrop-blur-xl sm:p-6">
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-start">
          <div className="flex shrink-0 flex-col items-center rounded-[24px] bg-white/[0.025] px-5 py-5 ring-1 ring-white/[0.04] sm:w-32">
            <Avatar
              src={avatarSrc}
              name={avatarName}
              size={88}
              className="ring-1 ring-white/[0.08]"
              fallbackClassName="text-[24px] tracking-[-0.04em]"
            />
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
            <button
              type="button"
              className="mt-4 text-[13px] font-medium text-[#7cff5c] transition-colors duration-150 ease-out hover:text-[#b9ff9d] hover:underline"
              onClick={() => inputRef.current?.click()}
              disabled={isUploadingPhoto}
            >
              {isUploadingPhoto ? 'Saving photo...' : 'Change photo'}
            </button>
            {avatarError ? <p className="mt-2 max-w-[10rem] text-center text-[12px] leading-5 text-red-400">{avatarError}</p> : null}
          </div>

          <div className="min-w-0 w-full space-y-5">
            <div>
              <label htmlFor="profile-display-name" className="mb-2 block text-[13px] font-medium text-zinc-200">
                Display Name
              </label>
              <input
                id="profile-display-name"
                type="text"
                maxLength={PROFILE_NICKNAME_MAX_LENGTH}
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="How you want to be known"
                className="h-[52px] w-full rounded-2xl border border-white/[0.07] bg-black/35 px-4 text-[15px] text-zinc-100 placeholder:text-zinc-600 outline-none transition-[border-color,background-color,box-shadow] duration-150 ease-out focus:border-[#7cff5c]/35 focus:bg-black/45 focus:shadow-[0_0_0_3px_rgba(124,255,92,0.08)]"
              />
              <p className="mt-2 text-[12px] text-zinc-500">This is what others see. Can be changed anytime.</p>
            </div>

            <div>
              <label htmlFor="profile-handle" className="mb-2 block text-[13px] font-medium text-zinc-200">
                Handle
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-zinc-600">@</span>
                <input
                  id="profile-handle"
                  type="text"
                  maxLength={PROFILE_HANDLE_MAX_LENGTH}
                  value={handleValue}
                  onChange={(event) => {
                    setHandleValue(normalizeHandle(event.target.value) ?? '')
                    setFormError(null)
                    setFormSuccess(null)
                  }}
                  readOnly={handleLocked}
                  placeholder="username"
                  className={cn(
                    'h-[52px] w-full rounded-2xl border border-white/[0.07] bg-black/35 px-4 pl-8 pr-11 text-[15px] text-zinc-100 placeholder:text-zinc-600 outline-none transition-[border-color,background-color,box-shadow] duration-150 ease-out focus:border-[#7cff5c]/35 focus:bg-black/45 focus:shadow-[0_0_0_3px_rgba(124,255,92,0.08)]',
                    handleLocked && 'cursor-not-allowed text-zinc-400'
                  )}
                />
                {handleIndicator ? (
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">{handleIndicator}</span>
                ) : null}
              </div>
              <p
                className={cn(
                  'mt-2 text-xs',
                  handleState === 'taken' || handleState === 'invalid' ? 'text-red-400' : 'text-zinc-500'
                )}
              >
                {handleHelper}
              </p>
            </div>

            {formError ? <p className="text-sm text-red-400">{formError}</p> : null}
            {formSuccess ? <p className="text-sm text-emerald-400">{formSuccess}</p> : null}

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving || (!handleLocked && handleState === 'checking')}
                className="h-11 rounded-2xl px-5 text-[14px] shadow-[0_14px_38px_rgba(57,255,20,0.16)]"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save profile
              </Button>
            </div>
          </div>
        </div>
      </section>

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
