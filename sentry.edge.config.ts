import * as Sentry from '@sentry/nextjs';

/* ══════════════════════════════════════════════════════════════════════════
 *  Sentry Edge Config — Edge Runtime Error Tracking
 *  Captures: Middleware errors, edge function failures
 * ══════════════════════════════════════════════════════════════════════════ */

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),

  environment: process.env.NODE_ENV || 'development',
});
