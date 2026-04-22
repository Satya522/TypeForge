'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

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
  isLoaded: boolean;
};

const defaultSettings: ThemeSettings = {
  theme: 'dark',
  accentColor: 'green',
  fontFamily: 'Inter',
  fontSize: 16,
  notificationsEnabled: true,
};

const accentColors: Record<string, string> = {
  green: '#7dff4d',
  blue: '#60a5fa',
  purple: '#8b5cf6',
  orange: '#f59e0b',
};

const ThemeContext = createContext<ThemeContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  isLoaded: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

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
    setIsLoaded(true);
  }, []);

  // Apply theme class and CSS variables immediately when settings change
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;

    // Apply theme class - force remove/add
    root.classList.remove('light', 'dark');
    root.classList.add(settings.theme);

    // Update color-scheme for browser UI
    root.style.colorScheme = settings.theme;

    // Apply CSS variables
    root.style.setProperty('--user-font-family', settings.fontFamily);
    root.style.setProperty('--user-font-size', `${settings.fontSize}px`);
    root.style.setProperty('--accent-color', accentColors[settings.accentColor] || accentColors.green);

    // Persist to localStorage
    localStorage.setItem('theme-settings', JSON.stringify(settings));
  }, [settings, isLoaded]);

  const updateSettings = useCallback((changes: Partial<ThemeSettings>) => {
    setSettings((prev) => ({ ...prev, ...changes }));
  }, []);

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
