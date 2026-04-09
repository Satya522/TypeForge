interface SessionMetricsProps {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  progress: number;
  elapsedMs: number;
}

export default function SessionMetrics({ wpm, rawWpm, accuracy, progress, elapsedMs }: SessionMetricsProps) {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
      <div className="rounded-md bg-surface-200 p-4 border border-surface-300">
        <p className="text-xs uppercase text-gray-400">WPM</p>
        <p className="text-2xl font-bold text-accent-200">{wpm}</p>
      </div>
      <div className="rounded-md bg-surface-200 p-4 border border-surface-300">
        <p className="text-xs uppercase text-gray-400">Raw WPM</p>
        <p className="text-2xl font-bold text-accent-200">{rawWpm}</p>
      </div>
      <div className="rounded-md bg-surface-200 p-4 border border-surface-300">
        <p className="text-xs uppercase text-gray-400">Accuracy</p>
        <p className="text-2xl font-bold text-accent-200">{accuracy}%</p>
      </div>
      <div className="rounded-md bg-surface-200 p-4 border border-surface-300">
        <p className="text-xs uppercase text-gray-400">Progress</p>
        <p className="text-2xl font-bold text-accent-200">{progress}%</p>
      </div>
      <div className="rounded-md bg-surface-200 p-4 border border-surface-300 col-span-2 sm:col-span-1">
        <p className="text-xs uppercase text-gray-400">Elapsed</p>
        <p className="text-2xl font-bold text-accent-200">{formatTime(elapsedMs)}</p>
      </div>
    </div>
  );
}