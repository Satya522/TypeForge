import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { getServerAuthSession } from '@/lib/auth'
import { CommunityClientPremium, type CommunityBootstrap } from './CommunityClientPremium'

export const metadata: Metadata = {
  title: 'TypeForge Community',
  description:
    'Premium real-time community hub for TypeForge with live channels, squad chat, typing races and co-op boss raids.',
}

async function getCommunityBootstrap(): Promise<CommunityBootstrap | null> {
  const session = await getServerAuthSession()
  const userId = session?.user?.id
  if (!userId) return null

  const [user, practiceAggregate, authoredMessages] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        rankTier: true,
        streakTracking: {
          select: {
            currentStreak: true,
          },
        },
        _count: {
          select: {
            practiceSessions: true,
          },
        },
      },
    }),
    prisma.practiceSession.aggregate({
      where: { userId },
      _max: {
        wpm: true,
      },
    }),
    prisma.communityMessage.findMany({
      where: { authorId: userId },
      select: { channelId: true },
    }),
  ])

  const favoriteChannel =
    Object.entries(
      authoredMessages.reduce<Record<string, number>>((accumulator, message) => {
        accumulator[message.channelId] = (accumulator[message.channelId] || 0) + 1
        return accumulator
      }, {})
    ).sort((left, right) => right[1] - left[1])[0]?.[0] || null

  return {
    streak: user?.streakTracking?.currentStreak ?? 0,
    totalSessions: user?._count.practiceSessions ?? 0,
    bestWpm: Math.round(practiceAggregate._max.wpm ?? 0),
    favoriteChannel,
    rank: user?.rankTier ?? null,
  }
}

export default async function CommunityPage() {
  const initialStats = await getCommunityBootstrap()

  return <CommunityClientPremium initialStats={initialStats} />
}
