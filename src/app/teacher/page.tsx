import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Teacher Portal – TypeForge',
  description: 'Overview of learner progress and group management.',
};

export const dynamic = 'force-dynamic';

/**
 * Teacher portal page
 *
 * Only accessible to admins. Displays aggregated statistics for all users
 * including number of lessons completed and average WPM. This is a
 * foundation for classroom management functionality.
 */
export default async function TeacherPage() {
  const session = await getServerAuthSession();
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  // Fetch all users with their lesson progress and practice sessions
  const users = await prisma.user.findMany({
    include: {
      lessonProgress: { select: { completed: true } },
      practiceSessions: { select: { wpm: true, accuracy: true } },
    },
  });
  // Compute summary stats per user
  const rows = users.map((u) => {
    const completedLessons = u.lessonProgress.filter((p) => p.completed).length;
    const avgWpm =
      u.practiceSessions.length > 0
        ?
          Math.round(
            (u.practiceSessions.reduce((sum, s) => sum + (s.wpm || 0), 0) /
              u.practiceSessions.length) * 10
          ) / 10
        :
          0;
    const avgAcc =
      u.practiceSessions.length > 0
        ?
          Math.round(
            (u.practiceSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) /
              u.practiceSessions.length) * 10
          ) / 10
        :
          0;
    return {
      id: u.id,
      name: u.name || u.email || 'Anonymous',
      completedLessons,
      avgWpm,
      avgAcc,
    };
  });
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">Teacher Portal</h1>
        <p className="text-gray-400 mb-4">
          View your students\' progress at a glance. This prototype shows aggregated data for all users.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-300">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Lessons Completed</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg WPM</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-300">
              {rows.map((row) => (
                <tr key={row.id} className="bg-surface-200">
                  <td className="px-3 py-2 whitespace-nowrap text-gray-300">{row.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-300">{row.completedLessons}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-300">{row.avgWpm}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-300">{row.avgAcc}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  );
}
