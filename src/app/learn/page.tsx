import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import LearnPathCards from './LearnPathCards';

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
      <main className="relative min-h-screen overflow-hidden bg-[#02050b]">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#02050b_0%,#040810_50%,#02050b_100%)]" />
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(79,141,253,0.08),transparent_70%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4f8dfd]/30 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#6fa7ff]/30 bg-[#07142c]/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#9fcbff] shadow-[0_0_32px_rgba(79,141,253,0.15)] backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6fa7ff] animate-pulse" />
              Choose Your Path
            </span>
            <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[0.95]">
              Pick your{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[#6fa7ff] via-[#b36bff] to-[#fbbf24] bg-clip-text text-transparent">
                  route.
                </span>
              </span>
              <br />
              <span className="text-white/30">Move cleaner.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[#7a8ba8]">
              Three paths. One goal — precision-first typing that sticks. Pick your level and let structured practice do the rest.
            </p>
          </div>

          {/* Path Sections */}
          {serializedPaths.length === 0 ? (
            <p className="text-white/40">No paths yet.</p>
          ) : (
            <LearnPathCards paths={serializedPaths} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
