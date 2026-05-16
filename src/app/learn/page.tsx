import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import LearnPathCards from './LearnPathCards';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata = {
  title: 'TypeForge – Learning Paths',
  description: 'Browse lesson paths and start your typing journey.',
};

export const dynamic = 'force-dynamic';

export default async function LearnPage() {
  const lessonPaths = await prisma.lessonPath.findMany({
    orderBy: { order: 'asc' },
    include: { lessons: { select: { id: true } } },
  });

  const serializedPaths = lessonPaths.map((path) => ({
    id: path.id,
    slug: path.slug,
    title: path.title,
    description: path.description,
    lessonCount: path.lessons.length,
  }));

  return (
    <>
      <main className={`relative min-h-screen bg-[#000000] selection:bg-zinc-800 ${outfit.className}`}>
        {/* Sleek, Dark Noise & Gradient Background */}
        <div className="pointer-events-none absolute inset-0 z-0">
           {/* Spotlight at the top center */}
           <div className="absolute left-1/2 top-[-20%] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-zinc-800/15 blur-[120px]" />
           {/* Grid */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16 flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-300 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Learning Paths
            </span>
            <h1 className="mt-8 text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
              Master the keyboard. <br/>
              <span className="text-zinc-500">Move cleaner.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-zinc-400">
              Three paths. One goal — precision-first typing that sticks. Pick your level and let structured practice do the rest.
            </p>
          </div>

          {/* Path Sections */}
          {serializedPaths.length === 0 ? (
            <p className="text-center text-zinc-600 mt-20">No paths available yet.</p>
          ) : (
            <LearnPathCards paths={serializedPaths} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
