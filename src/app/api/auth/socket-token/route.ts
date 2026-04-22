import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { getDisplayName } from '@/lib/profile';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request-security';

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`socket-token:${ip}`, 30, 5 * 60 * 1000);
    if (!rateLimit.ok) {
      return NextResponse.json({ error: 'Too many token requests' }, { status: 429 });
    }

    const session = await getServerAuthSession();
    
    // Check if the user is logged in
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, isBanned: true, name: true, nickname: true, username: true },
    });

    if (!user || user.isBanned) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("NEXTAUTH_SECRET is not defined");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Sign an ephemeral token valid for 2 minutes to prove identity to the web socket server
    const displayName = getDisplayName(
      {
        name: user.name,
        nickname: user.nickname,
        username: user.username,
      },
      session.user.name || 'TypeForge User'
    )

    const token = jwt.sign(
      { 
        sub: user.id,
        name: displayName,
      },
      secret,
      {
        audience: 'typeforge-community-socket',
        expiresIn: '2m',
        issuer: 'typeforge-app',
      }
    );

    return NextResponse.json({
      token,
      id: user.id,
      name: displayName,
    });
  } catch (error) {
    console.error("Failed to generate socket token:", error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
