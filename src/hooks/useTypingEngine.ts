import { useState, useEffect, useCallback } from 'react';

// Utility functions to compute metrics
function computeWpm(correctChars: number, timeMs: number) {
  if (timeMs === 0) return 0;
  const words = correctChars / 5;
  const minutes = timeMs / 60000;
  return Math.round(words / minutes);
}

function computeRawWpm(typedChars: number, timeMs: number) {
  if (timeMs === 0) return 0;
  const words = typedChars / 5;
  const minutes = timeMs / 60000;
  return Math.round(words / minutes);
}

function computeAccuracy(correctChars: number, typedChars: number) {
  if (typedChars === 0) return 100;
  return Math.round((correctChars / typedChars) * 100);
}

// A simple typing engine hook that tracks user input against a given text.
// It returns state and handlers for starting, restarting, and handling key presses.
export function useTypingEngine(targetText: string, timeLimitMs?: number) {
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [typed, setTyped] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(timeLimitMs ? Math.ceil(timeLimitMs / 1000) : null);

  // Derived metrics
  const correctChars = typed
    .split('')
    .filter((char, idx) => char === targetText[idx])
    .length;
  const typedChars = typed.length;
  const elapsed = startTime ? Date.now() - startTime : 0;
  
  // Update time based metrics, if there is a time limit and we finished, use the minimum of elapsed and time limit
  const effectiveElapsed = timeLimitMs && finished ? Math.min(elapsed, timeLimitMs) : elapsed;
  const wpm = computeWpm(correctChars, effectiveElapsed);
  const rawWpm = computeRawWpm(typedChars, effectiveElapsed);
  const accuracy = computeAccuracy(correctChars, typedChars);
  // progress based on time if time limit exists, else character based
  const progress = timeLimitMs 
    ? Math.min(100, Math.round((elapsed / timeLimitMs) * 100))
    : Math.min(Math.round((currentIndex / targetText.length) * 100), 100);

  useEffect(() => {
    if (!started || finished || !timeLimitMs || !startTime) return;
    const interval = setInterval(() => {
      const remainingMs = timeLimitMs - (Date.now() - startTime);
      if (remainingMs <= 0) {
        setFinished(true);
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(Math.ceil(remainingMs / 1000));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [started, finished, startTime, timeLimitMs]);

  // Reset time left when timeLimitMs changes or target text changes (implicit reset)
  useEffect(() => {
    setTimeLeft(timeLimitMs ? Math.ceil(timeLimitMs / 1000) : null);
  }, [timeLimitMs, targetText]);

  const handleKey = useCallback(
    (key: string) => {
      if (finished) return;
      if (!started) {
        setStarted(true);
        setStartTime(Date.now());
      }
      if (key === 'Backspace') {
        setTyped((prev) => prev.slice(0, -1));
        setCurrentIndex((idx) => Math.max(0, idx - 1));
        return;
      }
      // only count visible characters and spaces
      if (key.length !== 1) return;
      setTyped((prev) => prev + key);
      setCurrentIndex((idx) => idx + 1);
      if (targetText[currentIndex] !== key) {
        setErrors((err) => err + 1);
      }
      // completion check
      if (currentIndex + 1 >= targetText.length) {
        setFinished(true);
      }
    },
    [finished, started, currentIndex, targetText]
  );

  const restart = useCallback(() => {
    setStarted(false);
    setStartTime(null);
    setTyped('');
    setCurrentIndex(0);
    setErrors(0);
    setFinished(false);
    setTimeLeft(timeLimitMs ? Math.ceil(timeLimitMs / 1000) : null);
  }, [timeLimitMs]);

  return {
    started,
    finished,
    typed,
    currentIndex,
    errors,
    correctChars,
    typedChars,
    wpm,
    rawWpm,
    accuracy,
    progress,
    timeLeft,
    handleKey,
    restart,
    elapsedMs: effectiveElapsed,
  };
}