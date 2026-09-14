/* ══════════════════════════════════════════════════════════════════════════
 *  Next.js Instrumentation Hook — Auto-loads Sentry on startup
 * ══════════════════════════════════════════════════════════════════════════ */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = async (...args: unknown[]) => {
  try {
    const Sentry = await import('@sentry/nextjs');
    if (typeof Sentry.captureRequestError === 'function') {
      // @ts-expect-error — Sentry types may not match Next.js instrumentation hook signature
      Sentry.captureRequestError(...args);
    }
  } catch {
    // Sentry not available
  }
};
