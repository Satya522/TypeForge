import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OnboardingClient from './OnboardingClient';

/**
 * Guided onboarding page
 *
 * Presents a simple step‑by‑step tutorial for new users to learn how
 * to navigate TypeForge. Each step explains a core feature of the platform.
 */
export const metadata = {
  title: 'Onboarding – TypeForge',
  description: 'Start your journey with a guided tour of TypeForge features.',
};

const steps = [
  {
    title: 'Welcome to TypeForge',
    description:
      'This guided tour will introduce you to the main features of our typing platform so you can get started quickly.',
  },
  {
    title: 'Structured Lessons',
    description:
      'Begin your journey with Home Row drills and progress through top row, bottom row, numbers and punctuation at your own pace.',
  },
  {
    title: 'Practice Modes',
    description:
      'Use quick practice modes for words, sentences, paragraphs, quotes or code snippets to hone specific skills and track improvement.',
  },
  {
    title: 'Analytics & Progress',
    description:
      'Visualize your progress with detailed charts, identify weak keys and monitor your streaks, accuracy and speed over time.',
  },
  {
    title: 'Customization',
    description:
      'Tailor your experience with accent colors, fonts, preferred durations and language settings to suit your preferences.',
  },
];

export default function OnboardingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-2xl">
        <OnboardingClient steps={steps} />
      </main>
      <Footer />
    </>
  );
}
