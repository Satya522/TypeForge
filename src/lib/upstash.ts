import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/* ══════════════════════════════════════════════════════════════════════════
 *  Upstash Redis Client — Serverless Redis for Edge & Node
 *  Used for: Global Rate Limiting, DB Query Caching
 * ══════════════════════════════════════════════════════════════════════════ */

// Check if Upstash is configured
const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Create Redis client (only if configured)
export const redis = isUpstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/* ══════════════════════════════════════════════════════════════════════════
 *  Rate Limiter — Distributed, production-grade
 *  10 requests per 10 seconds per IP (sliding window)
 * ══════════════════════════════════════════════════════════════════════════ */
export const globalRateLimiter = isUpstashConfigured
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(20, '10 s'),
      analytics: false,
      prefix: 'typeforge:ratelimit:global',
    })
  : null;

// Stricter rate limiter for auth routes (5 req per minute)
export const authRateLimiter = isUpstashConfigured
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      analytics: false,
      prefix: 'typeforge:ratelimit:auth',
    })
  : null;

// API-specific rate limiter (30 req per minute)
export const apiRateLimiter = isUpstashConfigured
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(30, '60 s'),
      analytics: false,
      prefix: 'typeforge:ratelimit:api',
    })
  : null;

/* ══════════════════════════════════════════════════════════════════════════
 *  Cache Helper — For caching heavy DB queries
 *  Usage:
 *    const data = await cache.get('leaderboard');
 *    if (!data) {
 *      const fresh = await prisma.user.findMany(...);
 *      await cache.set('leaderboard', fresh, 300); // 5 min TTL
 *    }
 * ══════════════════════════════════════════════════════════════════════════ */
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
      const data = await redis.get<T>(`typeforge:cache:${key}`);
      return data;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    if (!redis) return;
    try {
      await redis.set(`typeforge:cache:${key}`, value, { ex: ttlSeconds });
    } catch {
      // Silently fail — cache miss is not critical
    }
  },

  async del(key: string): Promise<void> {
    if (!redis) return;
    try {
      await redis.del(`typeforge:cache:${key}`);
    } catch {
      // Silently fail
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    if (!redis) return;
    try {
      const keys = await redis.keys(`typeforge:cache:${pattern}`);
      if (keys.length > 0) {
        await Promise.all(keys.map((k) => redis!.del(k)));
      }
    } catch {
      // Silently fail
    }
  },
};
