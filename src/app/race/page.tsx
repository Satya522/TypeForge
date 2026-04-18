"use client";
import { useState, useEffect } from 'react';
// This page demonstrates the concept of a real-time race. For a fully
// functioning race you would integrate a shared typing engine and
// WebSocket server to synchronize progress between participants. Here
// we simulate competitors advancing along a progress bar.
import { Button } from '@/components/ui/button';

export default function RacePage() {
  const [joined, setJoined] = useState(false);
  const [progress, setProgress] = useState<{ name: string; wpm: number; progress: number }[]>([]);
  const [started, setStarted] = useState(false);

  // Simulate other players' progress for demonstration purposes. In a real
  // application you would connect to a WebSocket server to receive live
  // updates about participants in a race. This useEffect randomly
  // increments progress values to mimic competition.
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setProgress((prev) =>
        prev.map((p) => ({
          ...p,
          progress: Math.min(p.progress + Math.random() * 5, 100),
          wpm: p.wpm + Math.random() * 1 - 0.5,
        })),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [started]);

  const handleJoin = () => {
    setJoined(true);
    // Initialize dummy competitors
    setProgress([
      { name: 'You', wpm: 0, progress: 0 },
      { name: 'Rival1', wpm: 0, progress: 0 },
      { name: 'Rival2', wpm: 0, progress: 0 },
    ]);
  };

  const handleStart = () => {
    setStarted(true);
  };

  return (
    <div className="mx-auto max-w-4xl py-16 px-6">
      <h1 className="text-3xl font-bold mb-4">Real-time Race</h1>
      {!joined ? (
        <div className="space-y-4">
          <p className="text-gray-300">Join a race and compete against others in real time. This demo uses simulated opponents.</p>
          <Button onClick={handleJoin}>Join Race</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {!started ? (
            <div className="space-y-4">
              <p className="text-gray-300">You have joined the lobby. Click start when ready!</p>
              <Button onClick={handleStart}>Start Race</Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-4">
                {progress.map((p) => (
                  <div key={p.name} className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{p.name}</span>
                      <span>{p.wpm.toFixed(1)} WPM</span>
                    </div>
                    <div className="h-2 bg-surface-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-200 transition-all"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="border border-surface-300 rounded-md p-4">
                <p className="text-gray-300">
                  In a real race you would type a shared text and compete for the highest
                  WPM. This demo does not include the typing engine but shows how
                  competitor progress could be displayed.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}