import { Resend } from 'resend';
import { render } from '@react-email/render';

/* ══════════════════════════════════════════════════════════════════════════
 *  Resend Client — Professional Email Delivery
 *  Used for: Welcome emails, password resets, notifications
 * ══════════════════════════════════════════════════════════════════════════ */

const isResendConfigured = Boolean(process.env.RESEND_API_KEY);

export const resend = isResendConfigured
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Default sender — Change domain when you verify one on Resend
export const EMAIL_FROM = process.env.EMAIL_FROM_ADDRESS || 'TypeForge <onboarding@resend.dev>';

/**
 * Send an email via Resend. Silently fails if Resend is not configured.
 * Returns { success: true, id } on success, { success: false, error } on failure.
 */
export async function sendEmail({
  to,
  subject,
  html,
  react,
}: {
  to: string | string[];
  subject: string;
  html?: string;
  react?: React.ReactElement;
}) {
  if (!resend) {
    console.warn('[Resend] Not configured — skipping email send.');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    // Render React component to full email HTML via @react-email/render
    const emailHtml = react ? await render(react) : (html || '');

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error('[Resend] Send failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[Resend] Unexpected error:', err);
    return { success: false, error: 'Unexpected email error' };
  }
}

