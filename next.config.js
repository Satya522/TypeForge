import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withSentryConfig } from '@sentry/nextjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  outputFileTracingRoot: __dirname,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // ═══ Core Security Headers ═══
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          
          // ═══ HSTS — Force HTTPS in production ═══
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          
          // ═══ Content Security Policy — XSS Prevention ═══
          { 
            key: 'Content-Security-Policy', 
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.sentry.io https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://images.pexels.com https://*.sentry.io",
              "connect-src 'self' https://*.sentry.io https://*.ingest.sentry.io ws://localhost:3001 wss://*.typeforge.com https://accounts.google.com https://github.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join('; ')
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Prevent Fast Refresh when Prisma writes to the local SQLite DB.
  // Without this, auth flows (register/login) trigger a hot-reload mid-async,
  // killing the signIn() promise and breaking the redirect to /dashboard.
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: /node_modules|\.db$|\.db-journal$/,
      };
    }
    return config;
  },
};

// Wrap with Sentry only if SENTRY_AUTH_TOKEN is available (CI/CD or production)
const sentryConfig = {
  // Sentry org and project from env
  org: process.env.SENTRY_ORG || 'typeforge',
  project: process.env.SENTRY_PROJECT || 'typeforge',
  
  // Only upload source maps in CI with auth token
  silent: !process.env.SENTRY_AUTH_TOKEN,
  

  
  // Upload source maps for better stack traces
  widenClientFileUpload: true,
  
  // Hide source maps from users
  hideSourceMaps: true,
  
  // Transpile SDK to be compatible with IE11
  transpileClientSDK: false,
  

};

export default withSentryConfig(nextConfig, sentryConfig);
