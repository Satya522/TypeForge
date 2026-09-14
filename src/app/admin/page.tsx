import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Footer from '@/components/Footer';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';

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
    prisma.lessonPath.findMany({
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      }
    }),
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } }),
  ]);
  
  return (
    <>
      <main className="pt-24 pb-12 px-6 mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-8">Admin Dashboard</h1>
        
        <section className="mb-16">
          {/* AdminClient handles all the CRUD logic and modals for paths/lessons */}
          <AdminClient initialPaths={lessonPaths} />
        </section>
        
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Users</h2>
          <div className="bg-surface-200 border border-surface-300 rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm text-gray-400 border-b border-surface-300 bg-surface-300/30">
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-surface-300 text-gray-300 hover:bg-surface-300/20 transition-colors">
                    <td className="py-3 px-4">{u.name || '—'}</td>
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-accent-500/20 text-accent-300' : 'bg-surface-400 text-gray-300'}`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
