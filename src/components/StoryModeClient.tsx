"use client";
import { useState, useEffect } from 'react';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import TypingArea from '@/components/TypingArea';
import SessionMetrics from '@/components/SessionMetrics';
import { Button } from '@/components/ui/button';

interface Segment {
  id: string;
  text: string;
  threshold?: number;
  next?: { high?: string; low?: string };
  ending?: string;
}

/**
 * A simple branching story mode that responds to typing performance. Each segment
 * contains text that the user must type. After finishing a segment, the
 * current WPM is compared against a threshold to decide which branch to
 * follow. At the end of the story, a summary message is displayed.
 */
export default function StoryModeClient() {
  // Define the story segments. Branch based on WPM performance.
  const segments: Record<string, Segment> = {
    intro: {
      id: 'intro',
      text: 'You embark on a journey through a dense forest. Type this sentence to continue.',
      threshold: 40,
      next: { high: 'river', low: 'cave' },
    },
    river: {
      id: 'river',
      text: 'You arrive at a rushing river. Quickly type these words to build a bridge across.',
      threshold: 45,
      next: { high: 'treasure', low: 'swamp' },
    },
    cave: {
      id: 'cave',
      text: 'The path leads you into a dark cave. Slowly type this passage to avoid waking the bats.',
      threshold: 35,
      next: { high: 'treasure', low: 'swamp' },
    },
    treasure: {
      id: 'treasure',
      text: 'You discover a hidden treasure chest. Type this final line to unlock your reward.',
      ending: 'Congratulations! You completed the story and found the treasure.',
    },
    swamp: {
      id: 'swamp',
      text: 'You slip into a murky swamp. Type your way out carefully to reach the end.',
      ending: 'Well done! You survived the swamp and finished the adventure.',
    },
  };
  // Track current segment key
  const [currentKey, setCurrentKey] = useState<keyof typeof segments>('intro');
  const segment = segments[currentKey];
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
  } = useTypingEngine(segment.text);
  // Handle key presses
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      handleKey(e.key);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [handleKey]);
  // When the current segment changes, restart the engine
  useEffect(() => {
    restart();
    // scroll to top for readability
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentKey]);
  // When finished with a segment, determine next branch or ending
  useEffect(() => {
    if (finished) {
      const seg = segments[currentKey];
      if (seg.ending) {
        // The story ends here; display ending via state
        return;
      }
      // Determine branch
      if (seg.next) {
        const threshold = seg.threshold ?? 40;
        const nextKey = wpm >= threshold ? seg.next.high : seg.next.low;
        if (nextKey && segments[nextKey]) {
          setCurrentKey(nextKey as keyof typeof segments);
        }
      }
    }
  }, [finished]);
  // Determine if story has ending
  const ending = segment.ending;
  return (
    <div className="space-y-6">
      {!ending ? (
        <>
          <div className="p-4 rounded-lg border border-surface-300 bg-surface-200 min-h-[6rem]">
            <TypingArea text={segment.text} typed={typed} currentIndex={currentIndex} finished={finished} />
          </div>
          <SessionMetrics
            wpm={wpm}
            rawWpm={rawWpm}
            accuracy={accuracy}
            progress={progress}
            elapsedMs={elapsedMs}
          />
          {finished && (
            <p className="text-sm text-gray-400">Evaluating performance... proceeding to next part.</p>
          )}
        </>
      ) : (
        <div className="p-4 rounded-lg border border-surface-300 bg-surface-200">
          <p className="text-lg font-semibold text-accent-200 mb-3">Story Completed</p>
          <p className="text-gray-300">{ending}</p>
        </div>
      )}
    </div>
  );
}