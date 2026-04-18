"use client";

import { useState, useEffect, useCallback } from 'react';

const STREAK_KEY = 'typeforge_streak';
const PB_KEY = 'typeforge_pb';
const XP_KEY = 'typeforge_xp';

interface StreakData {
  currentStreak: number;
  lastDate: string; // YYYY-MM-DD
  longestStreak: number;
}

interface PersonalBests {
  wpm: number;
  accuracy: number;
}

const XP_PER_SESSION = 10;
const XP_PER_WPM_ABOVE_50 = 2;
const LEVELS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000];

export function getLevelFromXp(xp: number) {
  let level = 1;
  for (let i = 1; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i]) level = i + 1;
    else break;
  }
  const currentLevelXp = LEVELS[level - 1] || 0;
  const nextLevelXp = LEVELS[level] || LEVELS[LEVELS.length - 1];
  const progress = nextLevelXp > currentLevelXp
    ? Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
    : 100;
  return { level, progress, xp, nextLevelXp, currentLevelXp };
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, lastDate: '', longestStreak: 0 });
  const [pb, setPb] = useState<PersonalBests>({ wpm: 0, accuracy: 0 });
  const [xp, setXp] = useState(0);
  const [newPb, setNewPb] = useState<{ wpm: boolean; accuracy: boolean }>({ wpm: false, accuracy: false });

  useEffect(() => {
    try {
      const rawStreak = localStorage.getItem(STREAK_KEY);
      if (rawStreak) setStreak(JSON.parse(rawStreak));
      const rawPb = localStorage.getItem(PB_KEY);
      if (rawPb) setPb(JSON.parse(rawPb));
      const rawXp = localStorage.getItem(XP_KEY);
      if (rawXp) setXp(parseInt(rawXp, 10));
    } catch {}
  }, []);

  const recordSession = useCallback((wpm: number, accuracy: number) => {
    const today = new Date().toISOString().slice(0, 10);

    // ── Update streak ──
    setStreak(prev => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yest = yesterday.toISOString().slice(0, 10);

      let newStreak = 1;
      if (prev.lastDate === today) {
        newStreak = prev.currentStreak; // already counted today
      } else if (prev.lastDate === yest) {
        newStreak = prev.currentStreak + 1;
      }
      const updated: StreakData = {
        currentStreak: newStreak,
        lastDate: today,
        longestStreak: Math.max(prev.longestStreak, newStreak),
      };
      localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
      return updated;
    });

    // ── Update personal bests ──
    setPb(prev => {
      const newWpmPb = wpm > prev.wpm;
      const newAccPb = accuracy > prev.accuracy;
      setNewPb({ wpm: newWpmPb, accuracy: newAccPb });
      const updated: PersonalBests = {
        wpm: Math.max(prev.wpm, wpm),
        accuracy: Math.max(prev.accuracy, accuracy),
      };
      localStorage.setItem(PB_KEY, JSON.stringify(updated));
      return updated;
    });

    // ── Add XP ──
    setXp(prev => {
      const earned = XP_PER_SESSION + Math.max(0, wpm - 50) * XP_PER_WPM_ABOVE_50;
      const updated = prev + earned;
      localStorage.setItem(XP_KEY, String(updated));
      return updated;
    });
  }, []);

  const clearNewPb = useCallback(() => setNewPb({ wpm: false, accuracy: false }), []);

  return { streak, pb, xp, newPb, recordSession, clearNewPb, levelInfo: getLevelFromXp(xp) };
}
