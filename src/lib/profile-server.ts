import prisma from '@/lib/prisma'
import {
  getDisplayName,
  getHandleLabel,
  getPublicProfileHref,
  getResolvedAvatarUrl,
  normalizeHandle,
} from '@/lib/profile'

export type PublicProfileSummary = {
  avatarUrl: string | null
  displayName: string
  handle: string | null
  handleLabel: string | null
  id: string
  profileHref: string
  rank: string
  streak: number
  accuracy: number
  wpm: number
}

export async function getPublicProfileSummary(
  userId: string
): Promise<PublicProfileSummary | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      nickname: true,
      handle: true,
      image: true,
      avatarUrl: true,
      rankTier: true,
      streakTracking: {
        select: {
          currentStreak: true,
        },
      },
      practiceSessions: {
        orderBy: {
          sessionDate: 'desc',
        },
        take: 1,
        select: {
          accuracy: true,
          wpm: true,
        },
      },
    },
  })

  if (!user) return null

  const latestSession = user.practiceSessions[0]
  const displayName = getDisplayName(user, 'Typist')
  const handleLabel = getHandleLabel(user.handle)

  return {
    id: user.id,
    displayName,
    handle: user.handle,
    handleLabel,
    avatarUrl: getResolvedAvatarUrl(user),
    rank: user.rankTier || 'Bronze',
    wpm: Math.round(latestSession?.wpm ?? 0),
    accuracy: Number((latestSession?.accuracy ?? 0).toFixed(1)),
    streak: user.streakTracking?.currentStreak ?? 0,
    profileHref: getPublicProfileHref(user.handle, user.id),
  }
}

export async function getProfilePageData(identifier: string) {
  const normalizedHandle = normalizeHandle(identifier)
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: identifier }, { handle: normalizedHandle || identifier }],
    },
    select: {
      id: true,
      name: true,
      username: true,
      nickname: true,
      handle: true,
      image: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      rankTier: true,
      memberProfile: {
        select: {
          archetype: true,
          currentAccuracy: true,
          currentTitle: true,
          currentWpm: true,
          favoriteLanguage: true,
          favoriteLayout: true,
          longestStreak: true,
          momentumMeter: true,
          preferredGameMode: true,
          signatureMode: true,
        },
      },
      _count: {
        select: {
          achievements: true,
          communityMessages: true,
          practiceSessions: true,
        },
      },
    },
  })

  if (!user) return null

  const [lessonProgress, practiceAgg, streak, authoredMessages] =
    await Promise.all([
      prisma.userLessonProgress.aggregate({
        _count: true,
        _max: { wpm: true, accuracy: true },
        where: { userId: user.id, completed: true },
      }),
      prisma.practiceSession.aggregate({
        _max: { wpm: true, accuracy: true },
        _avg: { wpm: true, accuracy: true },
        where: { userId: user.id },
      }),
      prisma.streakTracking.findUnique({ where: { userId: user.id } }),
      prisma.communityMessage.findMany({
        where: { authorId: user.id },
        select: { channelId: true },
      }),
    ])

  const favoriteChannel =
    Object.entries(
      authoredMessages.reduce<Record<string, number>>(
        (accumulator, message) => {
          accumulator[message.channelId] =
            (accumulator[message.channelId] || 0) + 1
          return accumulator
        },
        {}
      )
    ).sort((left, right) => right[1] - left[1])[0]?.[0] || null

  return {
    user,
    lessonProgress,
    practiceAgg,
    streak,
    favoriteChannel,
    displayName: getDisplayName(user, 'Typist'),
    avatarUrl: getResolvedAvatarUrl(user),
    handleLabel: getHandleLabel(user.handle),
  }
}
