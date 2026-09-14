import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { sendEmail } from '@/lib/resend';
import { WelcomeEmail, PasswordResetEmail, AchievementEmail } from '@/lib/email-templates';
import { z } from 'zod';
import React from 'react';

/* ══════════════════════════════════════════════════════════════════════════
 *  Email Send API — Internal route for sending emails via Resend
 *  Protected: Requires admin role (or internal server calls)
 * ══════════════════════════════════════════════════════════════════════════ */

const sendSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  template: z.enum(['welcome', 'password-reset', 'achievement']),
  data: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Check auth — only admins or internal calls can use this route
    const session = await getServerAuthSession();
    const isInternalCall = req.headers.get('x-internal-key') === process.env.NEXTAUTH_SECRET;
    
    if (!isInternalCall && (!session?.user?.id || session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email payload' }, { status: 400 });
    }

    const { to, template, data } = parsed.data;
    const templateData = data || {};

    let subject: string;
    let reactElement: React.ReactElement;

    switch (template) {
      case 'welcome':
        subject = 'Welcome to TypeForge! 🎉';
        reactElement = React.createElement(WelcomeEmail, {
          name: (templateData.name as string) || 'Typist',
          loginUrl: templateData.loginUrl as string | undefined,
        });
        break;

      case 'password-reset':
        subject = 'Reset Your TypeForge Password';
        reactElement = React.createElement(PasswordResetEmail, {
          name: (templateData.name as string) || 'Typist',
          resetUrl: templateData.resetUrl as string | undefined,
          otp: templateData.otp as string | undefined,
        });
        break;

      case 'achievement':
        subject = `🏆 Achievement Unlocked: ${(templateData.achievement as string) || 'New Badge'}!`;
        reactElement = React.createElement(AchievementEmail, {
          name: (templateData.name as string) || 'Typist',
          achievement: (templateData.achievement as string) || 'Unknown',
          xpReward: (templateData.xpReward as number) || 0,
        });
        break;

      default:
        return NextResponse.json({ error: 'Unknown template' }, { status: 400 });
    }

    const result = await sendEmail({
      to,
      subject,
      react: reactElement,
    });

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id });
    }

    return NextResponse.json({ error: result.error }, { status: 500 });
  } catch (error) {
    console.error('[Email] Send failed:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
