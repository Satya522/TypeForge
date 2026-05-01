
import Footer from '@/components/Footer';
import CodePracticeClient from './CodePracticeClient';

export const metadata = {
  title: 'Code Practice – TypeForge',
  description: 'Practice typing with code snippets from your favorite gists.',
};

export default function CodePracticePage() {
  return (
    <>
      
      <main className="pt-24 pb-12 px-6 mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-4">Code Practice</h1>
        <p className="text-gray-400 mb-6">
          Fetch a code snippet from a public GitHub Gist and practice typing it with syntax
          highlighting.
        </p>
        <CodePracticeClient />
      </main>
      <Footer />
    </>
  );
}
