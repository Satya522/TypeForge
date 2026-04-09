"use client";
import { useEffect } from 'react';

/**
 * ServiceWorkerRegister registers the service worker on the client side. It
 * should be rendered inside a layout or root component to ensure the
 * registration occurs once the application has mounted.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().catch(() => undefined);
        });
      });

      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys
            .filter((key) => key.startsWith('typeforge-'))
            .forEach((key) => {
              caches.delete(key).catch(() => undefined);
            });
        });
      }

      return;
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .catch((err) => console.error('Service worker registration failed', err));
    }
  }, []);
  return null;
}
