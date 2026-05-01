import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { UserProfileSummary } from '@/components/profile'
import { getProfilePageData } from '@/lib/profile-server'

interface PublicProfilePageProps {
  params: Promise<{ identifier: string }>
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { identifier } = await params
  const profile = await getProfilePageData(identifier)

  return {
    title: profile
      ? `${profile.displayName} – TypeForge Profile`
      : 'Profile – TypeForge',
    description: profile
      ? `View ${profile.displayName}'s typing profile on TypeForge.`
      : 'View typing profiles on TypeForge.',
  }
}

export const dynamic = 'force-dynamic'

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { identifier } = await params
  const profile = await getProfilePageData(identifier)

  if (!profile) {
    notFound()
  }

  const bestWpm = Math.max(
    profile.lessonProgress._max.wpm ?? 0,
    profile.practiceAgg._max.wpm ?? 0,
    profile.user.memberProfile?.currentWpm ?? 0
  )
  const bestAccuracy = Math.max(
    profile.lessonProgress._max.accuracy ?? 0,
    profile.practiceAgg._max.accuracy ?? 0,
    profile.user.memberProfile?.currentAccuracy ?? 0
  )

  return (
    <>
            <main className="mx-auto max-w-6xl px-4 pb-14 pt-24 sm:px-6">
        <UserProfileSummary
          achievementCount={profile.user._count.achievements}
          archetype={profile.user.memberProfile?.archetype}
          avatarUrl={profile.avatarUrl}
          averageAccuracy={profile.practiceAgg._avg.accuracy}
          averageWpm={profile.practiceAgg._avg.wpm}
          bestAccuracy={bestAccuracy}
          bestStreakDays={
            profile.streak?.longestStreak ??
            profile.user.memberProfile?.longestStreak ??
            0
          }
          bestWpm={bestWpm}
          bio={profile.user.bio}
          communityMessages={profile.user._count.communityMessages}
          createdAt={profile.user.createdAt}
          displayName={profile.displayName}
          favoriteChannel={profile.favoriteChannel}
          favoriteLanguage={profile.user.memberProfile?.favoriteLanguage}
          favoriteLayout={profile.user.memberProfile?.favoriteLayout}
          handleLabel={profile.handleLabel}
          lessonsCompleted={profile.lessonProgress._count}
          momentumMeter={profile.user.memberProfile?.momentumMeter}
          preferredGameMode={profile.user.memberProfile?.preferredGameMode}
          profileTitle={profile.user.memberProfile?.currentTitle}
          rankTier={profile.user.rankTier}
          signatureMode={profile.user.memberProfile?.signatureMode}
          streakDays={profile.streak?.currentStreak ?? 0}
          totalSessions={profile.user._count.practiceSessions}
        />
      </main>
      <Footer />
    </>
  )
}
