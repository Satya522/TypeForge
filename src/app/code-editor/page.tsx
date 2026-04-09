import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CodeEditorClient from '@/components/CodeEditorClient';

export const metadata = {
  title: 'Code Editor – TypeForge',
  description: 'Practise typing code with real‑time syntax highlighting and dynamic practise sessions.',
};

/**
 * Code editor page
 *
 * Presents a minimal syntax‑highlighting code editor built with Prism.js.
 * Users can write or paste code in several languages, preview the
 * highlighted output, and then launch a typing practise session based
 * on their input. This feature helps developers improve typing skills
 * while reinforcing familiar programming syntax.
 */
export default function CodeEditorPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-100">Advanced Code Editor</h1>
        <p className="text-gray-300">
          Type or paste your favourite code snippets and practise typing with real‑time
          syntax highlighting. Select your language and start a session when you&apos;re
          ready.
        </p>
        <CodeEditorClient />
      </main>
      <Footer />
    </>
  );
}
