import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp, sanitizePlainText } from '@/lib/request-security';

const bodySchema = z.object({
  mode: z.string().min(1).max(40),
  wpm: z.number().min(0).max(400),
  rawWpm: z.number().min(0).max(500),
  accuracy: z.number().min(0).max(100),
  errors: z.number().int().min(0).max(10000),
  duration: z.number().int().min(1_000).max(60 * 60 * 1000),
  telemetry: z.unknown().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`practice-complete:${session.user.id}:${ip}`, 120, 10 * 60 * 1000);
    if (!rateLimit.ok) {
      return NextResponse.json({ error: 'Too many completion requests' }, { status: 429 });
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid practice stats payload' }, { status: 400 });
    }

    const { mode, wpm, rawWpm, accuracy, errors, duration, telemetry } = parsed.data;
    const userId = session.user.id;
    await prisma.practiceSession.create({
      data: {
        userId,
        type: 'PRACTICE',
        contentId: null,
        customContent: sanitizePlainText(mode, 40),
        wpm,
        rawWpm,
        accuracy,
        consistency: accuracy,
        totalErrors: errors,
        correctedErrors: 0,
        uncorrectedErrors: errors,
        sessionDuration: duration / 1000,
        correctChars: Math.round((accuracy / 100) * (rawWpm * (duration / 60000) * 5)),
        incorrectChars: errors,
        typingTelemetry: telemetry ?? undefined,
      },
    });
    // update daily stats
    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    await prisma.dailyStat.upsert({
      where: { userId_date: { userId, date } },
      update: {
        practiceSessions: { increment: 1 },
        totalTimePracticed: { increment: duration / 1000 },
        averageWpm: { increment: wpm },
        averageAccuracy: { increment: accuracy },
      },
      create: {
        userId,
        date,
        lessonsCompleted: 0,
        practiceSessions: 1,
        totalTimePracticed: duration / 1000,
        averageWpm: wpm,
        averageAccuracy: accuracy,
      },
    });
    return NextResponse.json({ message: 'Saved' });
  } catch (error) {
    console.error('[Practice] Save failed:', error);
    return NextResponse.json({ error: 'Failed to save practice stats' }, { status: 500 });
  }
}
