"use client";
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Simple typing game where a random character appears on screen and the user
 * has to press the correct key to earn points. The timer counts down
 * from 30 seconds. When the time expires the final score is displayed.
 */
export default function LetterGame() {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [letter, setLetter] = useState(randomChar());

  // Generate a new random character from the full alphabet
  function randomChar(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    return chars[Math.floor(Math.random() * chars.length)];
  }

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(30);
    setLetter(randomChar());
    setRunning(true);
  }, []);

  useEffect(() => {
    if (!running) return;
    // Countdown timer
    const timerId = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerId);
          setRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    // Key listener for correct keystrokes
    const handleKey = (e: KeyboardEvent) => {
      if (!running) return;
      const key = e.key.toLowerCase();
      if (key === letter) {
        setScore((s) => s + 1);
        setLetter(randomChar());
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      clearInterval(timerId);
      window.removeEventListener('keydown', handleKey);
    };
  }, [running, letter]);

  return (
    <div className="flex flex-col items-center gap-6">
      <h3 className="text-lg font-semibold text-gray-100">Letter Rain</h3>
      {!running && (
        <Button variant="primary" onClick={startGame}>Start Game</Button>
      )}
      {running && (
        <>
          <div className="text-9xl font-bold text-accent-200 h-32 flex items-center justify-center">
            {letter.toUpperCase()}
          </div>
          <p className="text-gray-300">Time left: {timeLeft}s</p>
          <p className="text-gray-300">Score: {score}</p>
        </>
      )}
      {!running && timeLeft < 30 && (
        <>
          <p className="text-gray-300">Final score: {score}</p>
          <Button variant="secondary" onClick={startGame}>Play Again</Button>
        </>
      )}
    </div>
  );
}