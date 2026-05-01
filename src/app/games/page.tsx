
import Footer from '@/components/Footer';
import GamesHubClient from './GamesHubClient';

export const metadata = {
  title: 'Games – TypeForge',
  description: 'Typing mini‑games to sharpen your skills.',
};

export default function GamesPage() {
  return (
    <>
      
      <main className="pt-28 pb-20 px-6 mx-auto max-w-[1400px]">
        <div className="mb-14">
          <h1 className="text-4xl font-black text-white mb-3">Typing Games</h1>
          <p className="text-gray-400 text-sm max-w-xl">
            Play our mini‑games to improve your typing reflexes, master precision hacking, and climb the global leaderboards while having fun.
          </p>
        </div>
        <GamesHubClient />
      </main>
      <Footer />
    </>
  );
}
