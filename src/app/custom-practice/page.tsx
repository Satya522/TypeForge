import { getServerAuthSession } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomPracticeForm from './CustomPracticeForm';
import { redirect } from 'next/navigation';

/**
 * Custom Practice page
 *
 * Allows users to paste or enter their own text for ad hoc typing practice.
 * Once the user clicks "Start Practice", the typing engine runs through
 * the provided text and displays live metrics. Results are not saved to the
 * database.
 */
export const metadata = {
  title: 'Custom Practice – TypeForge',
  description: 'Practice typing with your own custom text.',
};

export const dynamic = 'force-dynamic';

export default async function CustomPracticePage() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect('/login?callbackUrl=/custom-practice');
  }
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-4">Custom Practice</h1>
        <CustomPracticeForm />
      </main>
      <Footer />
    </>
  );
}
