import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Tournaments – TypeForge',
  description: 'Compete in scheduled typing tournaments against other users.',
};

/**
 * Typing tournaments page
 *
 * Displays a list of scheduled tournaments and allows users to join
 * upcoming events. Real‑time competitions will require websocket support
 * and server infrastructure; this page currently showcases static
 * tournament entries.
 */
export default function TournamentsPage() {
  // Sample tournament schedule
  const tournaments = [
    {
      id: 1,
      name: 'Weekly Sprint',
      date: '2026-04-01',
      description: '30‑second speed race with up to 20 participants.',
    },
    {
      id: 2,
      name: 'Accuracy Showdown',
      date: '2026-04-08',
      description: '60‑second accuracy challenge. Consistency matters!',
    },
    {
      id: 3,
      name: 'All‑Star Marathon',
      date: '2026-04-15',
      description: '120‑second endurance race. Long form passages.',
    },
  ];
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-4">Live Tournaments</h1>
        <p className="text-gray-300 mb-6">
          Join a scheduled tournament to compete against other typists in real time.
          Leaderboards and chat will be available during live events. The
          infrastructure powering tournaments is still under development; this
          page shows upcoming events as a preview.
        </p>
        <div className="divide-y divide-surface-300 border border-surface-300 rounded-lg bg-surface-200">
          {tournaments.map((t) => (
            <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-100">{t.name}</h3>
                <p className="text-sm text-gray-400">{t.description}</p>
                <p className="text-xs text-gray-500 mt-1">{t.date}</p>
              </div>
              <div className="mt-3 sm:mt-0">
                <Link
                  href="/race"
                  className="inline-flex items-center text-accent-200 hover:underline text-sm"
                >
                  Join
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
