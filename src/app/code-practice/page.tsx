import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CodePracticeClient from './CodePracticeClient';

export const metadata = {
  title: 'Code Practice - VS Code Simulator – TypeForge',
  description: 'Practice programming syntax in a high-fidelity Code Editor environment.',
};

export default function CodePracticePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <main className="flex-1 w-full pt-28 pb-8 px-4 sm:px-8 mx-auto max-w-[1600px]">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="text-accent-300">&lt;/&gt;</span> Code Practice
          </h1>
          <p className="text-gray-400 mt-2">
            Master development muscle memory. Type strictly with accurate capitalization, brackets, and indents.
          </p>
        </div>
        <CodePracticeClient />
      </main>
      <Footer />
    </div>
  );
}
