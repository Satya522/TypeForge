import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request-security';

/**
 * API route to export a user's practice session statistics as CSV.
 * Returns a CSV file with one row per session including date,
 * WPM, raw WPM, accuracy, consistency and duration. Only
 * authenticated users can access their own data.
 */
export async function GET(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`analytics-export:${session.user.id}:${ip}`, 10, 10 * 60 * 1000);
  if (!rateLimit.ok) {
    return new Response(JSON.stringify({ error: 'Too many export requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
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
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="analytics.csv"',
    },
  });
}
