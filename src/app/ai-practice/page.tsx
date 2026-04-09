import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AIPracticeClient from '@/components/AIPracticeClient';

export const metadata = {
  title: 'AI Practice – TypeForge',
  description: 'Generate custom practice passages tailored to your interests using AI.',
};

/**
 * AI practice page
 *
 * Allows users to select an interest category and generate a random passage
 * to practise typing. The server uses a simple lookup to return sample
 * passages. This page renders the AIPracticeClient which manages the
 * generation and practice logic on the client.
 */
export default function AIPracticePage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-100">AI Generated Practice</h1>
        <p className="text-gray-300">
          Choose an interest and let our AI generate fresh content for you to type.
          Practise with passages from science fiction, finance, cooking, and more.
        </p>
        <AIPracticeClient />
      </main>
      <Footer />
    </>
  );
}
