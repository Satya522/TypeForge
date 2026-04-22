"use client";
import { useEffect, useRef, useState } from 'react';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import TypingArea from '@/components/TypingArea';
import SessionMetrics from '@/components/SessionMetrics';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { mergeTypingTelemetryPayloads, type TypingTelemetryPayload } from '@/lib/typingTelemetry';

interface MicroLessonClientProps {
  blocks: { id: string; content: string }[];
  lessonId: string;
  xpReward: number;
}

/**
 * MicroLessonClient segments a lesson into individual content blocks and
 * presents them sequentially. Users type through each block; their
 * performance is tracked for each segment. Upon finishing the last block
 * the aggregated result is saved via the lesson completion API.
 */
export default function MicroLessonClient({ blocks, lessonId, xpReward }: MicroLessonClientProps) {
  const [blockIndex, setBlockIndex] = useState(0);
  const current = blocks[blockIndex];
  const {
    started,
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
    correctChars,
    typedChars,
    getTelemetrySnapshot,
  } = useTypingEngine(current.content);

  // Aggregated metrics across blocks
  const [agg, setAgg] = useState({
    correct: 0,
    typed: 0,
    errors: 0,
    time: 0,
  });
  const telemetryBlocksRef = useRef<TypingTelemetryPayload[]>([]);
  const handledFinishRef = useRef<string | null>(null);

  // Start listening for key presses
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      handleKey(e.key);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [handleKey]);

  // When a block is finished, accumulate metrics and move to next or save overall result
  useEffect(() => {
    const finishToken = `${lessonId}:${blockIndex}:${finished ? 'done' : 'idle'}`;
    if (!finished || handledFinishRef.current === finishToken) {
      return;
    }
    handledFinishRef.current = finishToken;

    if (finished) {
      const currentTelemetry = getTelemetrySnapshot();
      if (currentTelemetry) {
        telemetryBlocksRef.current.push(currentTelemetry);
      }
      // accumulate metrics for this block
      setAgg((prev) => ({
        correct: prev.correct + correctChars,
        typed: prev.typed + typedChars,
        errors: prev.errors + errors,
        time: prev.time + elapsedMs,
      }));
      // If not last block, move to next after slight delay
      if (blockIndex < blocks.length - 1) {
        const timer = setTimeout(() => {
          setBlockIndex((idx) => idx + 1);
          // restart engine for next block
          restart();
        }, 500);
        return () => clearTimeout(timer);
      } else {
        // Last block: compute aggregate metrics and save result
        const totalCorrect = agg.correct + correctChars;
        const totalTyped = agg.typed + typedChars;
        const totalErrors = agg.errors + errors;
        const totalTime = agg.time + elapsedMs;
        const totalWpm = Math.round((totalCorrect / 5) / (totalTime / 60000));
        const totalRaw = Math.round((totalTyped / 5) / (totalTime / 60000));
        const totalAcc = totalTyped === 0 ? 100 : Math.round((totalCorrect / totalTyped) * 100);
        // Call API to save result
        const saveResult = async () => {
          try {
            const res = await fetch('/api/lesson/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lessonId,
                wpm: totalWpm,
                rawWpm: totalRaw,
                accuracy: totalAcc,
                errors: totalErrors,
                duration: totalTime,
                telemetry: mergeTypingTelemetryPayloads(telemetryBlocksRef.current),
              }),
            });
            const data = await res.json();
            if (!res.ok) {
              toast.error(data.error || 'Failed to save result');
            } else {
              toast.success('Lesson completed! +' + xpReward + ' XP');
            }
          } catch (err) {
            console.error(err);
            toast.error('Network error');
          }
        };
        saveResult();
      }
    }
  }, [finished, getTelemetrySnapshot, correctChars, typedChars, errors, elapsedMs, blockIndex, blocks.length, agg.correct, agg.errors, agg.time, agg.typed, lessonId, xpReward, restart]);

  // When blockIndex changes, restart engine and scroll to top
  useEffect(() => {
    // ensure engine resets typed content for new block
    restart();
    handledFinishRef.current = null;
    // Scroll to top of window for new block to keep caret visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [blockIndex]);

  useEffect(() => {
    telemetryBlocksRef.current = [];
    handledFinishRef.current = null;
  }, [lessonId]);

  // Compute aggregated progress across blocks for progress bar
  const overallProgress = (blockIndex / blocks.length) * 100 + progress / blocks.length;

  return (
    <div className="space-y-6">
      <div className="mb-2 text-sm text-gray-400 flex justify-between items-center">
        <span>Section {blockIndex + 1} of {blocks.length}</span>
        <span>{overallProgress.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full bg-surface-300 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-200 transition-all"
          style={{ width: `${overallProgress}%` }}
        />
      </div>
      <div className="p-4 rounded-lg border border-surface-300 bg-surface-200 min-h-[8rem]">
        <TypingArea text={current.content} typed={typed} currentIndex={currentIndex} finished={finished} />
      </div>
      <SessionMetrics
        wpm={wpm}
        rawWpm={rawWpm}
        accuracy={accuracy}
        progress={progress}
        elapsedMs={elapsedMs}
      />
      <div className="flex gap-4">
        <Button variant="secondary" onClick={() => {
          restart();
        }}>Restart Section</Button>
      </div>
    </div>
  );
}
