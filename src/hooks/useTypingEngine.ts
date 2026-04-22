import { useState, useEffect, useCallback, useRef } from 'react';
import {
  buildTypingTelemetryPayload,
  normalizeTelemetryKey,
  type TypingTelemetryEvent,
} from '@/lib/typingTelemetry';

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

export function useTypingEngine(targetText: string, timeLimitMs?: number) {
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [typed, setTyped] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(timeLimitMs ? Math.ceil(timeLimitMs / 1000) : null);

  const typedRef = useRef('');
  const currentIndexRef = useRef(0);
  const errorsRef = useRef(0);
  const correctCharsRef = useRef(0);
  const typedCharsRef = useRef(0);
  const startedRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const lastKeyAtRef = useRef<number | null>(null);
  const correctStreakRef = useRef(0);
  const backspaceCountRef = useRef(0);
  const eventsRef = useRef<TypingTelemetryEvent[]>([]);

  const elapsed = startTime ? Date.now() - startTime : 0;
  const effectiveElapsed = timeLimitMs && finished ? Math.min(elapsed, timeLimitMs) : elapsed;
  const wpm = computeWpm(correctCharsRef.current, effectiveElapsed);
  const rawWpm = computeRawWpm(typedCharsRef.current, effectiveElapsed);
  const accuracy = computeAccuracy(correctCharsRef.current, typedCharsRef.current);
  const progress = timeLimitMs
    ? Math.min(100, Math.round((elapsed / timeLimitMs) * 100))
    : Math.min(Math.round((currentIndex / targetText.length) * 100), 100);

  useEffect(() => {
    startedRef.current = started;
  }, [started]);

  useEffect(() => {
    startTimeRef.current = startTime;
  }, [startTime]);

  useEffect(() => {
    finishedRef.current = finished;
  }, [finished]);

  useEffect(() => {
    if (!started || finished || !timeLimitMs || !startTime) return;
    const interval = setInterval(() => {
      const remainingMs = timeLimitMs - (Date.now() - startTime);
      if (remainingMs <= 0) {
        finishedRef.current = true;
        setFinished(true);
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(Math.ceil(remainingMs / 1000));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [started, finished, startTime, timeLimitMs]);

  useEffect(() => {
    setTimeLeft(timeLimitMs ? Math.ceil(timeLimitMs / 1000) : null);
  }, [timeLimitMs, targetText]);

  const getTelemetrySnapshot = useCallback(() => {
    const lastEventElapsed = eventsRef.current[eventsRef.current.length - 1]?.elapsedMs ?? 0;
    const durationMs =
      finishedRef.current && timeLimitMs && startTimeRef.current
        ? Math.min(Math.max(lastEventElapsed, Date.now() - startTimeRef.current), timeLimitMs)
        : finishedRef.current
          ? lastEventElapsed
        : startTimeRef.current
          ? Date.now() - startTimeRef.current
          : effectiveElapsed;

    return buildTypingTelemetryPayload({
      durationMs: Math.max(0, durationMs),
      events: eventsRef.current,
    });
  }, [effectiveElapsed, timeLimitMs]);

  const handleKey = useCallback(
    (key: string) => {
      if (finishedRef.current) return;

      const now = Date.now();
      if (!startedRef.current) {
        startedRef.current = true;
        startTimeRef.current = now;
        setStarted(true);
        setStartTime(now);
      }

      const baseStartTime = startTimeRef.current ?? now;
      const elapsedMs = now - baseStartTime;
      const pauseMs = lastKeyAtRef.current ? now - lastKeyAtRef.current : 0;

      if (key === 'Backspace') {
        if (typedRef.current.length === 0) {
          return;
        }

        const removedIndex = Math.max(0, currentIndexRef.current - 1);
        const removedTypedChar = typedRef.current[typedRef.current.length - 1];
        const expectedChar = targetText[removedIndex] ?? null;
        const wasCorrect = removedTypedChar === expectedChar;

        if (wasCorrect) {
          correctCharsRef.current = Math.max(0, correctCharsRef.current - 1);
        }

        typedRef.current = typedRef.current.slice(0, -1);
        typedCharsRef.current = Math.max(0, typedCharsRef.current - 1);
        currentIndexRef.current = removedIndex;
        backspaceCountRef.current += 1;
        correctStreakRef.current = 0;

        setTyped(typedRef.current);
        setCurrentIndex(currentIndexRef.current);

        lastKeyAtRef.current = now;
        const telemetryElapsed = timeLimitMs ? Math.min(elapsedMs, timeLimitMs) : elapsedMs;
        eventsRef.current.push({
          accuracy: computeAccuracy(correctCharsRef.current, typedCharsRef.current),
          action: 'backspace',
          backspaceCount: backspaceCountRef.current,
          correct: false,
          correctChars: correctCharsRef.current,
          correctStreak: correctStreakRef.current,
          elapsedMs: telemetryElapsed,
          expectedKey: normalizeTelemetryKey(expectedChar),
          index: currentIndexRef.current,
          key: 'backspace',
          pauseMs,
          rawWpm: computeRawWpm(typedCharsRef.current, telemetryElapsed),
          totalErrors: errorsRef.current,
          typedChars: typedCharsRef.current,
          wpm: computeWpm(correctCharsRef.current, telemetryElapsed),
        });
        return;
      }

      if (key.length !== 1) return;

      const expectedChar = targetText[currentIndexRef.current] ?? null;
      const correct = expectedChar === key;

      typedRef.current = `${typedRef.current}${key}`;
      typedCharsRef.current += 1;
      currentIndexRef.current += 1;

      if (correct) {
        correctCharsRef.current += 1;
        correctStreakRef.current += 1;
      } else {
        errorsRef.current += 1;
        correctStreakRef.current = 0;
      }

      setTyped(typedRef.current);
      setCurrentIndex(currentIndexRef.current);
      setErrors(errorsRef.current);

      const telemetryElapsed = timeLimitMs ? Math.min(elapsedMs, timeLimitMs) : elapsedMs;
      eventsRef.current.push({
        accuracy: computeAccuracy(correctCharsRef.current, typedCharsRef.current),
        action: 'input',
        backspaceCount: backspaceCountRef.current,
        correct,
        correctChars: correctCharsRef.current,
        correctStreak: correctStreakRef.current,
        elapsedMs: telemetryElapsed,
        expectedKey: normalizeTelemetryKey(expectedChar),
        index: currentIndexRef.current,
        key: normalizeTelemetryKey(key) ?? key.toLowerCase(),
        pauseMs,
        rawWpm: computeRawWpm(typedCharsRef.current, telemetryElapsed),
        totalErrors: errorsRef.current,
        typedChars: typedCharsRef.current,
        wpm: computeWpm(correctCharsRef.current, telemetryElapsed),
      });

      lastKeyAtRef.current = now;

      if (currentIndexRef.current >= targetText.length) {
        finishedRef.current = true;
        setFinished(true);
      }
    },
    [targetText, timeLimitMs]
  );

  const restart = useCallback(() => {
    typedRef.current = '';
    currentIndexRef.current = 0;
    errorsRef.current = 0;
    correctCharsRef.current = 0;
    typedCharsRef.current = 0;
    startedRef.current = false;
    startTimeRef.current = null;
    finishedRef.current = false;
    lastKeyAtRef.current = null;
    correctStreakRef.current = 0;
    backspaceCountRef.current = 0;
    eventsRef.current = [];

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
    correctChars: correctCharsRef.current,
    typedChars: typedCharsRef.current,
    wpm,
    rawWpm,
    accuracy,
    progress,
    timeLeft,
    handleKey,
    restart,
    elapsedMs: effectiveElapsed,
    getTelemetrySnapshot,
  };
}
