import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SettingsClient from './SettingsClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Settings – TypeForge',
  description: 'Manage your account and preferences.',
};

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/settings');
  }
  const userId = session.user.id;
  let settings = await prisma.userSettings.findUnique({ where: { userId } });
  // if not exists, create default settings
  if (!settings) {
    settings = await prisma.userSettings.create({
      data: {
        userId,
      },
    });
  }
  // Render client component
  return (
    <>
      <Navbar />
      <div className="pt-24 pb-12 px-6 mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">Settings</h1>
        <SettingsClient settings={settings} />
      </div>
      <Footer />
    </>
  );
}
