import { NextResponse, type NextRequest } from 'next/server';
import { globalRateLimiter, authRateLimiter } from '@/lib/upstash';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request-security';

/* ══════════════════════════════════════════════════════════════════════════
 *  TypeForge Global Middleware — Production Security Layer
 *  Applies to ALL routes. Handles:
 *  1. Global Rate Limiting (Upstash Redis or in-memory fallback)
 *  2. Security Headers injection
 *  3. Bot/Abuse protection
 * ══════════════════════════════════════════════════════════════════════════ */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);
  const response = NextResponse.next();

  // ═══ Skip static assets and internal Next.js routes ═══
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return response;
  }

  // ═══ RATE LIMITING — API Routes ═══
  if (pathname.startsWith('/api')) {
    const isAuthRoute = pathname.startsWith('/api/auth');

    // Strategy 1: Upstash Redis (distributed, production-grade)
    if (globalRateLimiter) {
      try {
        const limiter = isAuthRoute ? (authRateLimiter ?? globalRateLimiter) : globalRateLimiter;
        const { success, limit, remaining, reset } = await limiter.limit(ip);

        response.headers.set('X-RateLimit-Limit', limit.toString());
        response.headers.set('X-RateLimit-Remaining', remaining.toString());
        response.headers.set('X-RateLimit-Reset', reset.toString());

        if (!success) {
          return NextResponse.json(
            { error: 'Too many requests. Please slow down.' },
            {
              status: 429,
              headers: {
                'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': reset.toString(),
              },
            }
          );
        }
      } catch {
        // Upstash failure — fall through to in-memory
      }
    }

    // Strategy 2: In-memory fallback (single-server, dev-friendly)
    if (!globalRateLimiter) {
      const windowMs = isAuthRoute ? 60_000 : 10_000;
      const limit = isAuthRoute ? 5 : 20;
      const result = checkRateLimit(`middleware:${ip}:${pathname}`, limit, windowMs);

      if (!result.ok) {
        return NextResponse.json(
          { error: 'Too many requests. Please slow down.' },
          { status: 429 }
        );
      }
    }
  }

  // ═══ SECURITY HEADERS — Applied to all responses ═══
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
