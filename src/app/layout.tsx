import '@/app/globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Providers from './providers';
import Script from 'next/script';

// Load Inter variable font with latin subset
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
// Load JetBrains Mono for the premium typing area
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

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

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${inter.className}`} suppressHydrationWarning>
      <head>
        {/* PWA primary meta tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
        {process.env.NODE_ENV !== 'production' && (
          <Script
            id="sw-cleanup-script"
            strategy="afterInteractive"
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
      <body className="min-h-screen flex flex-col bg-surface-100" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
