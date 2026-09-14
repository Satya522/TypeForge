import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://typeforge.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Static public pages
  const staticRoutes = [
    '',
    '/login',
    '/register',
    '/learn',
    '/practice',
    '/leaderboard',
    '/games',
    '/community',
    '/achievements',
    '/privacy',
    '/terms',
    '/cookies',
  ];

  return staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/learn' ? 0.9 : 0.7,
  }));
}
