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
    title: profile ? `${profile.displayName} – TypeForge Profile` : 'Profile – TypeForge',
    description: profile ? `View ${profile.displayName}'s typing profile on TypeForge.` : 'View typing profiles on TypeForge.',
  }
}

export const dynamic = 'force-dynamic'

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { identifier } = await params
  const profile = await getProfilePageData(identifier)

  if (!profile) {
    notFound()
  }

  const bestWpm = Math.max(profile.lessonProgress._max.wpm ?? 0, profile.practiceAgg._max.wpm ?? 0)
  const bestAccuracy = Math.max(profile.lessonProgress._max.accuracy ?? 0, profile.practiceAgg._max.accuracy ?? 0)

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">Profile</h1>
        <UserProfileSummary
          avatarUrl={profile.avatarUrl}
          bestAccuracy={bestAccuracy}
          bestWpm={bestWpm}
          bio={profile.user.bio}
          createdAt={profile.user.createdAt}
          displayName={profile.displayName}
          handleLabel={profile.handleLabel}
          lessonsCompleted={profile.lessonProgress._count}
          streakDays={profile.streak?.currentStreak ?? 0}
        />
      </main>
      <Footer />
    </>
  )
}
