import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/community/messages?channelId=general&limit=100&before=<timestamp>
 * Returns persisted messages for a channel, newest first.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get('channelId') || 'general';
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);
  const before = searchParams.get('before');

  const where: Record<string, unknown> = { channelId };
  if (before) {
    where.createdAt = { lt: new Date(parseInt(before, 10)) };
  }

  const messages = await prisma.communityMessage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
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
    userName: m.userName,
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
    const body = await req.json();

    const message = await prisma.communityMessage.create({
      data: {
        channelId: body.channelId || 'general',
        type: body.type || 'user',
        subtype: body.subtype || null,
        content: body.content,
        userName: body.userName || 'Anonymous',
        userColor: body.userColor || '#39ff14',
        userGradient: body.userGradient || 'linear-gradient(135deg, #39ff14, #00cc00)',
        authorId: body.authorId || null,
        visitorId: body.visitorId || null,
        replyToId: body.replyToId || null,
        pinned: body.pinned || false,
      },
    });

    return NextResponse.json({ id: message.id }, { status: 201 });
  } catch (error) {
    console.error('[Community] Failed to persist message:', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
