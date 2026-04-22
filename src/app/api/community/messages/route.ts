import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerAuthSession } from '@/lib/auth';
import { getDisplayName, getResolvedAvatarUrl } from '@/lib/profile';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  COMMUNITY_CHANNEL_IDS,
  getClientIp,
  sanitizePlainText,
} from '@/lib/request-security';

const querySchema = z.object({
  before: z.coerce.number().int().positive().optional(),
  channelId: z.string().default('general'),
  limit: z.coerce.number().int().min(1).max(100).default(100),
});

const bodySchema = z.object({
  channelId: z.string(),
  content: z.string().min(1).max(2000),
  pinned: z.boolean().optional(),
  replyToId: z.string().optional().nullable(),
  subtype: z.string().max(50).optional().nullable(),
  type: z.enum(['user', 'system']).default('user'),
  userColor: z.string().max(64).optional(),
  userGradient: z.string().max(160).optional(),
  userName: z.string().min(1).max(50).optional(),
});

/**
 * GET /api/community/messages?channelId=general&limit=100&before=<timestamp>
 * Returns persisted messages for a channel, newest first.
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`community:get:${ip}`, 120, 60 * 1000);
  if (!rateLimit.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({
    before: searchParams.get('before') ?? undefined,
    channelId: searchParams.get('channelId') ?? 'general',
    limit: searchParams.get('limit') ?? 100,
  });

  if (!parsed.success || !COMMUNITY_CHANNEL_IDS.has(parsed.data.channelId)) {
    return NextResponse.json({ error: 'Invalid channel request' }, { status: 400 });
  }

  const where: Record<string, unknown> = { channelId: parsed.data.channelId };
  if (parsed.data.before) {
    where.createdAt = { lt: new Date(parsed.data.before) };
  }

  const messages = await prisma.communityMessage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: parsed.data.limit,
    include: {
      author: {
        select: {
          avatarUrl: true,
          image: true,
          name: true,
          nickname: true,
          username: true,
        },
      },
      reactions: true,
      replyToMessage: {
        select: { id: true, userName: true, content: true },
      },
    },
  });

  // Return in chronological order (oldest first)
  const chronological = messages.reverse().map((m) => ({
    id: m.id,
    channelId: m.channelId,
    type: m.type,
    subtype: m.subtype,
    userId: m.visitorId || m.authorId || undefined,
    userName: m.author ? getDisplayName(m.author, m.userName) : m.userName,
    avatarUrl: m.author ? getResolvedAvatarUrl(m.author) : null,
    userColor: m.userColor,
    userGradient: m.userGradient,
    content: m.content,
    timestamp: m.createdAt.getTime(),
    edited: m.edited,
    editedAt: m.editedAt?.getTime(),
    pinned: m.pinned,
    replyTo: m.replyToMessage
      ? { id: m.replyToMessage.id, userName: m.replyToMessage.userName, content: m.replyToMessage.content }
      : null,
    reactions: m.reactions.reduce((acc, r) => {
      if (!acc[r.emoji]) acc[r.emoji] = [];
      acc[r.emoji].push(r.userName);
      return acc;
    }, {} as Record<string, string[]>),
  }));

  return NextResponse.json({ messages: chronological });
}

/**
 * POST /api/community/messages
 * Persist a message to the database.
 * Body: { channelId, type, subtype?, content, userName, userColor, userGradient, authorId?, visitorId?, replyToId?, pinned? }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`community:post:${session.user.id}:${ip}`, 30, 60 * 1000);
    if (!rateLimit.ok) {
      return NextResponse.json({ error: 'Too many messages. Please slow down.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success || !COMMUNITY_CHANNEL_IDS.has(parsed.data.channelId)) {
      return NextResponse.json({ error: 'Invalid message payload' }, { status: 400 });
    }

    const author = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        avatarUrl: true,
        id: true,
        image: true,
        isBanned: true,
        name: true,
        nickname: true,
        username: true,
      },
    });

    if (!author || author.isBanned) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const message = await prisma.communityMessage.create({
      data: {
        channelId: parsed.data.channelId,
        type: parsed.data.type,
        subtype: parsed.data.subtype || null,
        content: sanitizePlainText(parsed.data.content, 2000),
        userName: sanitizePlainText(
          parsed.data.userName || getDisplayName(author, author.name || 'Anonymous'),
          50
        ),
        userColor: parsed.data.userColor || '#39ff14',
        userGradient: parsed.data.userGradient || 'linear-gradient(135deg, #39ff14, #00cc00)',
        authorId: author.id,
        visitorId: null,
        replyToId: parsed.data.replyToId || null,
        pinned: parsed.data.pinned || false,
      },
    });

    return NextResponse.json({ id: message.id }, { status: 201 });
  } catch (error) {
    console.error('[Community] Failed to persist message:', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
