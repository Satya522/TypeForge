import { getServerAuthSession } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { UserProfileSummary } from '@/components/profile';
import { getProfilePageData } from '@/lib/profile-server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Profile – TypeForge',
  description: 'View your profile, stats and achievements.',
};

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/profile');
  }
  const profile = await getProfilePageData(session.user.id);
  if (!profile) redirect('/login');

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
  );
}
