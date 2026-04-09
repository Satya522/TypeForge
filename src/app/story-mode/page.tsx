import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StoryModeClient from '@/components/StoryModeClient';

export const metadata = {
  title: 'Story Mode – TypeForge',
  description: 'Embark on a branching adventure where your typing performance shapes the narrative.',
};

/**
 * Story mode page
 *
 * Provides an adaptive, game‑like experience where the route through the
 * story changes based on the user’s WPM at each segment. Users type
 * through different passages and are rewarded with different endings.
 */
export default function StoryModePage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-100">Adaptive Story Mode</h1>
        <p className="text-gray-300">
          Choose your own adventure by typing your way through each part of the story. Your
          speed and accuracy determine which path you take. See if you can reach
          the treasure!
        </p>
        <StoryModeClient />
      </main>
      <Footer />
    </>
  );
}
