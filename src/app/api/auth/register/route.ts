import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { createUsernameSeed } from '@/lib/profile';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp, normalizeEmail, normalizeName } from '@/lib/request-security';

const bodySchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

async function createAvailableUsername(baseValue: string) {
  let candidate = createUsernameSeed(baseValue)
  let suffix = 1

  while (await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } })) {
    candidate = `${createUsernameSeed(baseValue).slice(0, 27)}_${suffix}`
    suffix += 1
  }

  return candidate
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
    if (!rateLimit.ok) {
      return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid registration details.' }, { status: 400 });
    }

    const name = normalizeName(parsed.data.name);
    const email = normalizeEmail(parsed.data.email);
    const password = parsed.data.password;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);
    const username = await createAvailableUsername(name);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        username,
      },
    });
    return NextResponse.json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    console.error('[Auth:Register] Failed:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
