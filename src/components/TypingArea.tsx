import { memo } from 'react';

interface TypingAreaProps {
  text: string;
  typed: string;
  currentIndex: number;
  finished: boolean;
}

// Memoized component to render the typing text with highlights for correct, incorrect and upcoming characters.
const TypingArea = memo(({ text, typed, currentIndex, finished }: TypingAreaProps) => {
  return (
    <div className="relative text-base sm:text-lg font-mono leading-relaxed">
      {text.split('').map((char, idx) => {
        let className = '';
        if (idx < typed.length) {
          className = typed[idx] === char ? 'text-accent-200' : 'text-red-400';
        } else {
          className = 'text-gray-500';
        }
        const isCaret = idx === currentIndex && !finished;
        return (
          <span key={idx} className={`relative ${className}`}>
            {isCaret && (
              <span className="absolute -left-0.5 top-0 h-full w-0.5 animate-pulse bg-accent-200 z-10" />
            )}
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </div>
  );
});

TypingArea.displayName = 'TypingArea';

export default TypingArea;