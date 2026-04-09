import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * API route to export a user's practice session statistics as CSV.
 * Returns a CSV file with one row per session including date,
 * WPM, raw WPM, accuracy, consistency and duration. Only
 * authenticated users can access their own data.
 */
export async function GET() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
  const userId = session.user.id;
  const sessions = await prisma.practiceSession.findMany({
    where: { userId },
    orderBy: { sessionDate: 'asc' },
  });
  let csv = 'date,wpm,rawWpm,accuracy,consistency,duration\n';
  sessions.forEach((s) => {
    csv += `${s.sessionDate.toISOString()},${s.wpm},${s.rawWpm},${s.accuracy},${s.consistency},${s.sessionDuration}\n`;
  });
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="analytics.csv"',
    },
  });
}