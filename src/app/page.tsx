
import Footer from '@/components/Footer';
import Hero from '@/features/landing/Hero';
import QuickValueStrip from '@/features/landing/QuickValueStrip';
import LearningPathsPreview from '@/features/landing/LearningPathsPreview';
import PracticeModesPreview from '@/features/landing/PracticeModesPreview';
import AnalyticsShowcase from '@/features/landing/AnalyticsShowcase';
import HomeCTA from '@/features/landing/HomeCTA';

export const metadata = {
  title: 'TypeForge – Master Typing with Precision',
  description: 'Learn to type faster and smarter with guided lessons, practice modes, real‑time feedback, rich analytics and achievements.',
  openGraph: {
    title: 'TypeForge – Master Typing with Precision',
    description:
      'Accelerate your typing journey with guided lessons, smarter practice, detailed analytics and a premium experience.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TypeForge – Master Typing with Precision',
    description:
      'Accelerate your typing journey with guided lessons, smarter practice, detailed analytics and a premium experience.',
  },
};

export default function Home() {
  return (
    <>
      
      <main className="flex flex-col overflow-hidden">
        <Hero />
        <QuickValueStrip />
        <LearningPathsPreview />
        <PracticeModesPreview />
        <AnalyticsShowcase />
        <HomeCTA />
      </main>
      <Footer />
    </>
  );
}
