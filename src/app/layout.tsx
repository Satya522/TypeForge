import '@/app/globals.css';
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Providers from './providers';
import AppChrome from '@/components/AppChrome';
import { getServerAuthSession } from '@/lib/auth';

// Load Inter variable font with latin subset
const inter = Inter({ subsets: ['latin'] });
const kineticDisplay = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-kinetic-display',
  display: 'swap',
});
const codeMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-code',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TypeForge',
  description: 'TypeForge is a premium typing practice platform for guided learning, focused drills, and clear progress tracking.',
  icons: {
    icon: [
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
      { url: '/media/brand/typeforge-logo-mark.svg', type: 'image/svg+xml' },
    ],
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getServerAuthSession();

  return (
    <html lang="en" className={`${inter.className} ${kineticDisplay.variable} ${codeMono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* PWA primary meta tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
        {process.env.NODE_ENV !== 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function (registrations) {
                    registrations.forEach(function (registration) {
                      registration.unregister().catch(function () {});
                    });
                  });
                }
                if ('caches' in window) {
                  caches.keys().then(function (keys) {
                    keys
                      .filter(function (key) { return key.indexOf('typeforge-') === 0; })
                      .forEach(function (key) {
                        caches.delete(key).catch(function () {});
                      });
                  });
                }
              `,
            }}
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col bg-surface-100 dark" suppressHydrationWarning>
        <Providers session={session}>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
