"use client";

import { memo, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface TypingAreaProps {
  text: string;
  typed: string;
  currentIndex: number;
  finished: boolean;
  fontSize?: number; // px, default 18
}

// Find word boundaries
function getWords(text: string) {
  const words: { start: number; end: number }[] = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === ' ' || text[i] === '\n') { i++; continue; }
    const start = i;
    while (i < text.length && text[i] !== ' ' && text[i] !== '\n') i++;
    words.push({ start, end: i - 1 });
  }
  return words;
}

const TypingArea = memo(({ text, typed, currentIndex, finished, fontSize = 18 }: TypingAreaProps) => {
  const caretRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find which word the caret is on
  const words = useMemo(() => getWords(text), [text]);
  const currentWordRange = useMemo(() => {
    return words.find(w => currentIndex >= w.start && currentIndex <= w.end + 1) || null;
  }, [words, currentIndex]);

  // Smooth scroll caret into view
  useEffect(() => {
    const caret = caretRef.current;
    const container = containerRef.current;
    if (!caret || !container) return;
    const caretTop = caret.offsetTop;
    const containerHeight = container.clientHeight;
    const lineHeight = fontSize * 2;
    // If caret goes past 40% of visible area, scroll container
    if (caretTop > containerHeight * 0.4) {
      container.scrollTo({ top: caretTop - containerHeight * 0.35, behavior: 'smooth' });
    }
  }, [currentIndex, fontSize]);

  return (
    <div
      className="relative w-full"
      style={{ fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace" }}
    >
      {/* Side gradient fade */}
      <div className="pointer-events-none absolute inset-0 z-10"
        style={{ background: 'linear-gradient(to right, rgba(14,18,16,0.8) 0%, transparent 5%, transparent 95%, rgba(14,18,16,0.8) 100%)' }}
      />
      {/* Top fade for scrolled content */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(14,18,16,0.9) 0%, transparent 100%)' }}
      />

      {/* Scrollable text block */}
      <div
        ref={containerRef}
        className="relative select-none overflow-hidden"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: '2',
          letterSpacing: '0.03em',
          maxHeight: `${fontSize * 2 * 5}px`, // show 5 lines
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {text.split('').map((char, idx) => {
          const isTyped = idx < typed.length;
          const isCorrect = isTyped && typed[idx] === char;
          const isWrong = isTyped && typed[idx] !== char;
          const isCaret = idx === currentIndex && !finished;
          const isInCurrentWord = currentWordRange
            ? idx >= currentWordRange.start && idx <= currentWordRange.end
            : false;

          // Determine colors
          let color: string;
          let textShadow = 'none';
          let bg = 'transparent';

          if (isCorrect) {
            color = 'rgba(110,255,80,0.95)';
            textShadow = '0 0 10px rgba(57,255,20,0.3)';
          } else if (isWrong) {
            color = '#ff4d6d';
            textShadow = '0 0 8px rgba(255,77,109,0.4)';
            bg = 'rgba(255,77,109,0.1)';
          } else if (isCaret) {
            color = 'rgba(255,255,255,0.9)';
          } else if (isInCurrentWord && !isTyped) {
            // Upcoming chars in current word — highlighted
            color = 'rgba(255,255,255,0.75)';
          } else {
            color = 'rgba(255,255,255,0.45)';
          }

          return (
            <span
              key={idx}
              className="relative inline"
              style={{ position: 'relative' }}
            >
              {/* Blinking neon caret */}
              {isCaret && (
                <motion.span
                  ref={caretRef as any}
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: '-1px',
                    top: '5px',
                    bottom: '5px',
                    width: '2px',
                    borderRadius: '2px',
                    background: 'linear-gradient(180deg, #39FF14 0%, #00cc00 100%)',
                    boxShadow: '0 0 6px #39FF14, 0 0 18px rgba(57,255,20,0.5)',
                  }}
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {/* Word underline for current word */}
              {isInCurrentWord && !isTyped && !isCaret && !isCorrect && !isWrong && (
                <span
                  className="absolute bottom-[4px] left-0 right-0 h-[1.5px] rounded-full pointer-events-none"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                />
              )}

              <span
                style={{
                  color,
                  textShadow,
                  background: bg,
                  borderRadius: bg !== 'transparent' ? '2px' : '0',
                  display: 'inline',
                  transition: 'color 0.08s ease',
                }}
              >
                {char === ' ' ? '\u00A0' : char === '\n' ? '↵\n' : char}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
});

TypingArea.displayName = 'TypingArea';
export default TypingArea;