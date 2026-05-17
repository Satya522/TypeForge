import { memo } from 'react';
import { cn } from '@/lib/utils';

interface TypingAreaProps {
  text: string;
  typed: string;
  currentIndex: number;
  finished: boolean;
  fontClass?: string;
}

// Memoized component to render the typing text with high-fidelity premium aesthetics.
const TypingArea = memo(({ text, typed, currentIndex, finished, fontClass = 'font-code' }: TypingAreaProps) => {
  return (
    <div 
      className="relative text-2xl sm:text-3xl lg:text-[34px] leading-[1.7] tracking-wide select-none whitespace-pre-wrap break-words break-all sm:break-normal"
      style={{ fontFamily: `var(--font-${fontClass}), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` }}
    >
      {text.split('').map((char, idx) => {
        let className = '';
        const isTyped = idx < typed.length;
        const isCorrect = isTyped && typed[idx] === char;
        const isWrong = isTyped && typed[idx] !== char;
        const isUpcoming = !isTyped;
        
        if (isCorrect) {
          // Premium bright silver for correct strokes
          className = 'text-slate-200 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]';
        } else if (isWrong) {
          // Intense neon rose for errors
          className = 'text-rose-400 bg-rose-500/20 border-b-2 border-rose-500 rounded-[2px] px-[1px] -mx-[1px]';
        } else if (isUpcoming) {
          // Sleek dim slate for upcoming characters
          className = 'text-slate-600';
        }

        // Active character gets a slight glow if we want, but let's keep it dim until typed.
        const isCaret = idx === currentIndex && !finished;
        
        return (
          <span key={idx} className={cn("relative transition-colors duration-100", className)}>
            {isCaret && (
              <span className="absolute -left-[2px] top-[10%] h-[80%] w-[3px] rounded-full bg-[#39FF14] shadow-[0_0_12px_#39FF14] z-10 animate-[pulse_1s_ease-in-out_infinite]" />
            )}
            {char}
          </span>
        );
      })}
    </div>
  );
});

TypingArea.displayName = 'TypingArea';

export default TypingArea;
