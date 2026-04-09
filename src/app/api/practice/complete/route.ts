import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const bodySchema = z.object({
  mode: z.string(),
  wpm: z.number(),
  rawWpm: z.number(),
  accuracy: z.number(),
  errors: z.number(),
  duration: z.number(),
});

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const json = await req.json();
    const { mode, wpm, rawWpm, accuracy, errors, duration } = bodySchema.parse(json);
    const userId = session.user.id;
    await prisma.practiceSession.create({
      data: {
        userId,
        type: 'PRACTICE',
        contentId: null,
        customContent: null,
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
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}