import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Accept extended settings fields for theme personalization, fonts, notifications and language.
const bodySchema = z.object({
  soundEnabled: z.boolean(),
  leaderboardVisible: z.boolean(),
  dailyGoal: z.number(),
  preferredDuration: z.enum(['S15', 'S30', 'S60', 'S120']),
  reducedMotion: z.boolean(),
  accentColor: z.string(),
  fontFamily: z.string(),
  fontSize: z.number(),
  notificationsEnabled: z.boolean(),
  theme: z.enum(['dark', 'light']),
  language: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const json = await req.json();
    const data = bodySchema.parse(json);
    const userId = session.user.id;
    await prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
    return NextResponse.json({ message: 'Settings updated' });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}