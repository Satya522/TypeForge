import * as Sentry from '@sentry/nextjs';

/* ══════════════════════════════════════════════════════════════════════════
 *  Sentry Server Config — Node.js Server-side Error Tracking
 *  Captures: API route errors, server component errors, DB failures
 * ══════════════════════════════════════════════════════════════════════════ */

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Only enable when DSN is set
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),

  // Environment tag
  environment: process.env.NODE_ENV || 'development',
});
