import { getServerAuthSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SettingsClient from './SettingsClient'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Settings – TypeForge',
  description: 'Manage your account and preferences.',
}

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/settings')
  }
  const userId = session.user.id
  const [user, existingSettings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        avatarUrl: true,
        email: true,
        handle: true,
        id: true,
        image: true,
        name: true,
        nickname: true,
        profileNudgeDismissed: true,
        username: true,
      },
    }),
    prisma.userSettings.findUnique({ where: { userId } }),
  ])

  if (!user) {
    redirect('/login')
  }

  let settings = existingSettings
  if (!settings) {
    settings = await prisma.userSettings.create({
      data: {
        userId,
      },
    })
  }

  // Render client component
  return (
    <>
      
      <main className="w-full flex-1 px-4 pb-16 pt-24 sm:px-6">
        <SettingsClient settings={settings} user={user} />
      </main>
      <Footer />
    </>
  )
}
