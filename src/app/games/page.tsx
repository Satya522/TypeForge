import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LetterGame from '@/components/LetterGame';

export const metadata = {
  title: 'Games – TypeForge',
  description: 'Typing mini‑games to sharpen your skills.',
};

export default function GamesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">Typing Games</h1>
        <p className="text-gray-400 mb-8">Play our mini‑games to improve your typing reflexes and have fun.</p>
        <LetterGame />
      </main>
      <Footer />
    </>
  );
}
