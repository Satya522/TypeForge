import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'TypeForge',
  description: 'Browse lesson paths and start your typing journey.',
};

export const dynamic = 'force-dynamic';

export default async function LearnPage() {
  const lessonPaths = await prisma.lessonPath.findMany({
    orderBy: { order: 'asc' },
    include: { lessons: { select: { id: true } } },
  });
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">Learning Paths</h1>
        {lessonPaths.length === 0 && (
          <p className="text-gray-400">No lesson paths available yet. Please check back later.</p>
        )}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {lessonPaths.map((path) => (
            <div
              key={path.id}
              className="rounded-xl border border-surface-300 bg-surface-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <h3 className="text-xl font-semibold text-gray-100 mb-2">{path.title}</h3>
              <p className="text-sm text-gray-400 flex-grow">{path.description ?? 'Improve your skills in this path.'}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-gray-500">{path.lessons.length} lessons</span>
                <Link href={`/learn/${path.slug}`} className="text-accent-200 flex items-center gap-1 text-sm hover:underline">
                  Start
                  <ArrowRight className="h-4 w-4" />
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
