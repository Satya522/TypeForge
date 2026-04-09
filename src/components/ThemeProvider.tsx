"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * ThemeProvider exposes a simple context for storing and updating basic UI
 * preferences such as theme, accent color, font family and font size. The
 * provider writes these values to CSS custom properties on the `document`
 * element so that Tailwind and other styles can reference them via the
 * `var(--*)` syntax. Components can call `useTheme()` to read the current
 * settings or update them. This implementation stores values in
 * localStorage to persist between sessions on the client. Server-rendered
 * pages will fall back to default values until the client hydrates.
 */

export type ThemeSettings = {
  theme: 'dark' | 'light';
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  notificationsEnabled: boolean;
};

type ThemeContextType = {
  settings: ThemeSettings;
  updateSettings: (changes: Partial<ThemeSettings>) => void;
};

const defaultSettings: ThemeSettings = {
  theme: 'dark',
  accentColor: 'blue',
  fontFamily: 'Inter',
  fontSize: 16,
  notificationsEnabled: true,
};

const ThemeContext = createContext<ThemeContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<ThemeSettings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Persist settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('theme-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply CSS variables for font and base size whenever settings change
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--user-font-family', settings.fontFamily);
    root.style.setProperty('--user-font-size', `${settings.fontSize}px`);
    // Additional variables could be set here for accent colors if using
    // CSS custom properties for color tokens in Tailwind config.
    // For example: root.style.setProperty('--accent-color', settings.accentColor);
  }, [settings.fontFamily, settings.fontSize]);

  const updateSettings = (changes: Partial<ThemeSettings>) => {
    setSettings((prev) => ({ ...prev, ...changes }));
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}