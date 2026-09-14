'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

/* ══════════════════════════════════════════════════════════════════════════
 *  Global Error Boundary — Catches unhandled errors app-wide
 *  Reports to Sentry automatically, shows recovery UI to user
 * ══════════════════════════════════════════════════════════════════════════ */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ 
        backgroundColor: '#030305', 
        color: '#fff', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        margin: 0,
        padding: '2rem',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ 
            fontSize: '64px', 
            marginBottom: '24px',
            filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))',
          }}>
            ⚠️
          </div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 900, 
            letterSpacing: '0.1em',
            marginBottom: '12px',
            color: '#f87171',
          }}>
            SYSTEM ERROR
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#71717a', 
            marginBottom: '32px',
            lineHeight: 1.6,
          }}>
            Something went wrong. Our team has been automatically notified 
            and is working to fix this issue.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 32px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
          {error.digest && (
            <p style={{ 
              marginTop: '24px', 
              fontSize: '10px', 
              color: '#3f3f46',
              fontFamily: 'monospace',
            }}>
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
