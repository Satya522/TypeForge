
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Browser Extension – TypeForge',
  description: 'Bring typing practice to any webpage with our Chrome/Firefox extension.',
};

/**
 * Extension information page
 *
 * Explains the planned browser extension which allows users to turn any
 * selected text on the web into a typing exercise. Provides high‑level
 * installation instructions and links to the extension repository.
 */
export default function ExtensionPage() {
  return (
    <>
      
      <main className="pt-24 pb-12 px-6 mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-4">Browser Extension</h1>
        <p className="text-gray-300 mb-6">
          Our upcoming Chrome/Firefox extension lets you convert any selected
          text on a webpage into a typing drill. Whether you&apos;re reading
          documentation, news articles or blogs, you can highlight text and
          immediately start practicing right in your browser.
        </p>
        <p className="text-gray-300 mb-6">
          The extension is currently under development. Once released, you
          will be able to install it from the official extension stores and
          connect it with your TypeForge account to sync progress and stats.
        </p>
        <p className="text-gray-300 mb-6">
          For developers and early adopters, the source code is available on
          our GitHub repository. We welcome contributions and feedback!
        </p>
        <Link href="https://github.com" target="_blank" className="text-accent-200 hover:underline">View Extension Repo</Link>
      </main>
      <Footer />
    </>
  );
}
