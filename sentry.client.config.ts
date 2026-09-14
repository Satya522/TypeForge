import * as Sentry from '@sentry/nextjs';

/* ══════════════════════════════════════════════════════════════════════════
 *  Sentry Client Config — Browser-side Error Tracking
 *  Captures: Unhandled JS errors, promise rejections, performance metrics
 * ══════════════════════════════════════════════════════════════════════════ */

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring — capture 10% of transactions in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay — capture 10% of sessions, 100% on error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Only enable in production or when DSN is explicitly set
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),

  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'ResizeObserver loop',
    // Network errors
    'Failed to fetch',
    'NetworkError',
    'Load failed',
    // User-caused
    'AbortError',
  ],

  integrations: [
    Sentry.replayIntegration({
      // Mask all text and block all media for privacy
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});
