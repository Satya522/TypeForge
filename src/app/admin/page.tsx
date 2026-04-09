import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin Panel – TypeForge',
  description: 'Manage lessons, practice content and view user stats.',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/admin');
  }
  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }
  const [lessonPaths, users] = await Promise.all([
    prisma.lessonPath.findMany({ orderBy: { order: 'asc' } }),
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } }),
  ]);
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">Admin Panel</h1>
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Lesson Paths</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {lessonPaths.map((path) => (
              <div key={path.id} className="rounded-lg border border-surface-300 bg-surface-200 p-4">
                <h3 className="font-semibold text-gray-100">{path.title}</h3>
                <p className="text-sm text-gray-400">{path.description ?? 'No description'}</p>
                <p className="mt-2 text-xs text-gray-500">Order: {path.order}</p>
              </div>
            ))}
            {lessonPaths.length === 0 && <p className="text-gray-400">No lesson paths yet.</p>}
          </div>
        </section>
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Users</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-sm text-gray-400 border-b border-surface-300">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-surface-300 text-gray-300">
                  <td className="py-2">{u.name || '—'}</td>
                  <td className="py-2">{u.email}</td>
                  <td className="py-2">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <p className="text-sm text-gray-500">More management tools coming soon.</p>
      </main>
      <Footer />
    </>
  );
}
