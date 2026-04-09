"use client";
import { useEffect } from 'react';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import TypingArea from '@/components/TypingArea';
import SessionMetrics from '@/components/SessionMetrics';
import { Button } from '@/components/ui/button';

interface CustomPracticeClientProps {
  /**
   * Custom text provided by the user for practice. Could be words,
   * sentences, code snippets or any arbitrary string.
   */
  text: string;
}

/**
 * A lightweight typing practice client for custom user‑provided text.
 * Reuses the typing engine to track WPM, accuracy, progress etc. but
 * does not save results to the database. Intended for ad hoc practice.
 */
export default function CustomPracticeClient({ text }: CustomPracticeClientProps) {
  const {
    finished,
    typed,
    currentIndex,
    errors,
    wpm,
    rawWpm,
    accuracy,
    progress,
    handleKey,
    restart,
    elapsedMs,
  } = useTypingEngine(text);

  // Listen for key presses on mount
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      handleKey(e.key);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [handleKey]);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-surface-300 bg-surface-200 min-h-[8rem]">
        <TypingArea text={text} typed={typed} currentIndex={currentIndex} finished={finished} />
      </div>
      <SessionMetrics
        wpm={wpm}
        rawWpm={rawWpm}
        accuracy={accuracy}
        progress={progress}
        elapsedMs={elapsedMs}
      />
      <div className="flex gap-4">
        <Button variant="secondary" onClick={restart}>Restart</Button>
      </div>
    </div>
  );
}