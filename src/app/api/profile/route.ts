import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { removeStoredAvatar, saveAvatarFile } from '@/lib/avatar-storage'
import { getServerAuthSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import {
  PROFILE_ALLOWED_IMAGE_TYPES,
  PROFILE_IMAGE_MAX_BYTES,
  getDisplayName,
  getResolvedAvatarUrl,
  isValidHandle,
  normalizeHandle,
  normalizeNickname,
} from '@/lib/profile'
import { checkRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/request-security'

const jsonSchema = z.object({
  handle: z.string().max(20).optional().nullable(),
  nickname: z.string().max(32).optional().nullable(),
  profileNudgeDismissed: z.boolean().optional(),
})

function serializeProfileUser(user: {
  avatarUrl?: string | null
  handle?: string | null
  id?: string
  image?: string | null
  name?: string | null
  nickname?: string | null
  profileNudgeDismissed?: boolean
  username?: string | null
}) {
  return {
    id: user.id,
    name: getDisplayName(user, 'Typist'),
    username: user.username ?? null,
    nickname: user.nickname ?? null,
    handle: user.handle ?? null,
    avatarUrl: getResolvedAvatarUrl(user),
    image: getResolvedAvatarUrl(user),
    profileNudgeDismissed: Boolean(user.profileNudgeDismissed),
  }
}

export async function GET() {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      avatarUrl: true,
      handle: true,
      id: true,
      image: true,
      name: true,
      nickname: true,
      profileNudgeDismissed: true,
      username: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ user: serializeProfileUser(user) })
}

export async function PATCH(request: NextRequest) {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ip = getClientIp(request)
  const rateLimit = checkRateLimit(`profile:${session.user.id}:${ip}`, 20, 5 * 60 * 1000)
  if (!rateLimit.ok) {
    return NextResponse.json({ error: 'Too many profile updates. Please wait a bit.' }, { status: 429 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      avatarUrl: true,
      handle: true,
      id: true,
      image: true,
      name: true,
      nickname: true,
      profileNudgeDismissed: true,
      username: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const contentType = request.headers.get('content-type') ?? ''

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const avatar = formData.get('avatar')

      if (!(avatar instanceof File)) {
        return NextResponse.json({ error: 'No avatar file was provided.' }, { status: 400 })
      }

      if (!PROFILE_ALLOWED_IMAGE_TYPES.has(avatar.type)) {
        return NextResponse.json({ error: 'Choose a JPG, PNG, WEBP, or static GIF under 2MB.' }, { status: 400 })
      }

      if (avatar.size > PROFILE_IMAGE_MAX_BYTES) {
        return NextResponse.json({ error: 'Choose an image smaller than 2MB.' }, { status: 400 })
      }

      const previousAvatarUrl = getResolvedAvatarUrl(user)
      const storedAvatarUrl = await saveAvatarFile(user.id, avatar)
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          avatarUrl: storedAvatarUrl,
          image: storedAvatarUrl,
        },
        select: {
          avatarUrl: true,
          handle: true,
          id: true,
          image: true,
          name: true,
          nickname: true,
          profileNudgeDismissed: true,
          username: true,
        },
      })

      if (previousAvatarUrl && previousAvatarUrl !== storedAvatarUrl) {
        await removeStoredAvatar(previousAvatarUrl)
      }

      return NextResponse.json({ user: serializeProfileUser(updatedUser) })
    }

    const parsed = jsonSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid profile payload.' }, { status: 400 })
    }

    const nextNickname = normalizeNickname(parsed.data.nickname)
    const requestedHandle = normalizeHandle(parsed.data.handle)
    const updateData: Record<string, unknown> = {}

    if (parsed.data.nickname !== undefined) {
      updateData.nickname = nextNickname
    }

    if (parsed.data.profileNudgeDismissed !== undefined) {
      updateData.profileNudgeDismissed = parsed.data.profileNudgeDismissed
    }

    if (parsed.data.handle !== undefined) {
      if (user.handle && requestedHandle !== user.handle) {
        return NextResponse.json({ error: 'Handle is already locked for this account.' }, { status: 400 })
      }

      if (requestedHandle && !isValidHandle(requestedHandle)) {
        return NextResponse.json(
          { error: 'Use only letters, numbers, and underscores for your handle.' },
          { status: 400 }
        )
      }

      if (!user.handle && requestedHandle) {
        const existing = await prisma.user.findFirst({
          where: {
            handle: requestedHandle,
            id: {
              not: user.id,
            },
          },
          select: { id: true },
        })

        if (existing) {
          return NextResponse.json({ error: 'That handle is already taken.' }, { status: 409 })
        }
      }

      if (!user.handle) {
        updateData.handle = requestedHandle
      }
    }

    const previousDisplayName = getDisplayName(user, 'Typist')
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        avatarUrl: true,
        handle: true,
        id: true,
        image: true,
        name: true,
        nickname: true,
        profileNudgeDismissed: true,
        username: true,
      },
    })

    const nextDisplayName = getDisplayName(updatedUser, 'Typist')
    if (previousDisplayName !== nextDisplayName) {
      await prisma.communityMessage.updateMany({
        where: { authorId: user.id },
        data: { userName: nextDisplayName },
      })
    }

    return NextResponse.json({ user: serializeProfileUser(updatedUser) })
  } catch (error) {
    console.error('[Profile] Update failed:', error)
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 })
  }
}
