'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedHeroSubtitleProps {
  className?: string;
  text?: string;
}

const softEase = [0.22, 1, 0.36, 1] as const;

export default function AnimatedHeroSubtitle({
  className,
  text = 'Build speed, accuracy, and rhythm with guided typing paths, real-time feedback, and AI practice that adapts as you improve.',
}: AnimatedHeroSubtitleProps) {
  const prefersReducedMotion = useReducedMotion();

  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.018,
        delayChildren: 0.65,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.45, ease: softEase },
    },
  };

  const getWordStyle = (word: string) => {
    const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    
    if (cleanWord === 'speed') return 'text-[#58a6ff] font-semibold drop-shadow-[0_0_12px_rgba(88,166,255,0.4)]';
    if (cleanWord === 'accuracy') return 'text-[#56d364] font-semibold drop-shadow-[0_0_12px_rgba(86,211,100,0.4)]';
    if (cleanWord === 'rhythm') return 'text-[#ffa657] font-semibold drop-shadow-[0_0_12px_rgba(255,166,87,0.4)]';
    if (cleanWord === 'ai' || cleanWord === 'practice') return 'text-[#bc8cff] font-semibold drop-shadow-[0_0_12px_rgba(188,140,255,0.4)]';
    
    return 'text-[#9aa0a6] font-medium';
  };

  if (prefersReducedMotion) {
    return (
      <p
        style={{ fontFamily: "'Google Sans', system-ui, sans-serif" }}
        className={cn(
          'mx-auto mt-6 max-w-[760px] text-base leading-relaxed tracking-tight sm:text-lg lg:text-[20px] lg:leading-[1.6]',
          className
        )}
      >
        {words.map((word, i) => (
          <span key={i} className={cn(getWordStyle(word), 'mr-[0.25em] inline-block')}>
            {word}
          </span>
        ))}
      </p>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={text}
      style={{ fontFamily: "'Google Sans', system-ui, sans-serif" }}
      className={cn(
        'mx-auto mt-6 max-w-[760px] text-base leading-relaxed tracking-tight sm:text-lg lg:text-[20px] lg:leading-[1.6]',
        className
      )}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          className={cn(
            'mr-[0.25em] inline-block',
            getWordStyle(word)
          )}
          aria-hidden="true"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
