"use client";

import { useEffect } from 'react';

/**
 * NotificationManager requests permission for browser notifications on initial
 * mount and schedules a simple practice reminder. This component is kept
 * deliberately minimal—real implementations might integrate with
 * service workers to send push notifications based on user settings.
 */
export default function NotificationManager() {
  useEffect(() => {
    // Request permission on mount
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          // Schedule a reminder 30 seconds after grant as a demonstration
          const timer = setTimeout(() => {
            new Notification('Time to practice typing!', {
              body: 'Open TypeForge and complete a quick session to keep your streak alive.',
            });
          }, 30000);
          return () => clearTimeout(timer);
        }
      });
    }
  }, []);
  return null;
}
