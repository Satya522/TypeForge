"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Wind, CheckCircle2, CircleDashed } from 'lucide-react';
import { useMechanicalSound } from '@/hooks/useMechanicalSound';

const ZEN_QUOTES = [
  "Empty your mind, be formless, shapeless, like water.",
  "Nature does not hurry, yet everything is accomplished.",
  "Silence is a true friend who never betrays.",
  "Simplicity, patience, compassion. These three are your greatest treasures.",
  "When you realize nothing is lacking, the whole world belongs to you.",
  "The only Zen you find on the tops of mountains is the Zen you bring up there.",
  "Walk as if you are kissing the Earth with your feet.",
  "Before enlightenment; chop wood, carry water. After enlightenment; chop wood, carry water.",
  "Flow with whatever may happen, and let your mind be free.",
  "A journey of a thousand miles begins with a single step.",
  "Those who know do not speak. Those who speak do not know.",
  "Write your code like poetry. Let it flow, pure and unobstructed."
];

// Slow moving particles resembling leaves or dust
function ZenParticles() {
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, scale: number, duration: number, delay: number }[]>([]);

  useEffect(() => {
    // Generate static particles array safely
    const arr = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage string later
      y: Math.random() * 100,
      scale: Math.random() * 0.5 + 0.2, // sizes
      duration: Math.random() * 20 + 20, // 20s - 40s travel
      delay: Math.random() * 10,
    }));
    setParticles(arr);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen opacity-40">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ width: 10, height: 10, left: `${p.x}%`, top: `-5%` }}
          animate={{
            y: ['0vh', '110vh'],
            x: ['0%', '50%', '-50%', '0%'],
            rotate: [0, 180, 360],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, ease: 'linear', delay: p.delay },
            x: { duration: p.duration * 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror', delay: p.delay },
            rotate: { duration: p.duration * 0.3, repeat: Infinity, ease: 'linear' }
          }}
        >
          <div className="w-full h-full rounded-full bg-emerald-500 blur-[2px] opacity-70 shadow-[0_0_15px_#10b981]" style={{ transform: `scale(${p.scale})` }} />
        </motion.div>
      ))}
    </div>
  );
}

export default function ZenGardenGame() {
  const [targetPhrase, setTargetPhrase] = useState("");
  const [typedChars, setTypedChars] = useState<string[]>([]);
  
  const [phrasesCompleted, setPhrasesCompleted] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const playKeystroke = useMechanicalSound(true);

  // Initialize
  useEffect(() => {
    const quote = ZEN_QUOTES[Math.floor(Math.random() * ZEN_QUOTES.length)];
    setTargetPhrase(quote);
    setTypedChars([]);
  }, []);

  const loadNextPhrase = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      let quote = targetPhrase;
      while (quote === targetPhrase) {
        quote = ZEN_QUOTES[Math.floor(Math.random() * ZEN_QUOTES.length)];
      }
      setTargetPhrase(quote);
      setTypedChars([]);
      setIsTransitioning(false);
    }, 1500); // Zen pause between quotes
  }, [targetPhrase]);

  // Keydown Logic
  useEffect(() => {
    if (isTransitioning) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore control keys completely
      if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      
      const currentTargetChar = targetPhrase[typedChars.length];
      setTotalKeystrokes(prev => prev + 1);

      if (e.key === currentTargetChar) {
        setTypedChars(prev => [...prev, e.key]);
        setCorrectKeystrokes(prev => prev + 1);
        
        // Very soft, relaxed thock for Zen Mode (we use the 'space' variant from mechanic hook for a deeper, calmer sound, or 'normal')
        playKeystroke('normal');
        
        if (typedChars.length + 1 === targetPhrase.length) {
          playKeystroke('space'); // Deeper note on completion
          setPhrasesCompleted(prev => prev + 1);
          loadNextPhrase();
        }
      } else {
        // Soft error, no harsh beeps. Just a light click.
        // Even the error shouldn't be aggressive in Zen Mode.
        playKeystroke('error'); 
        
        // We do NOT add the character (forced absolute accuracy to progress)
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [targetPhrase, typedChars, isTransitioning, loadNextPhrase, playKeystroke]);

  const accuracy = totalKeystrokes > 0 ? ((correctKeystrokes / totalKeystrokes) * 100).toFixed(1) : "100.0";
  const isPerfect = accuracy === "100.0" && totalKeystrokes > 0;

  return (
    <div className="relative w-full h-full bg-[#020503] overflow-hidden flex flex-col items-center justify-center select-none font-sans">
      
      {/* Zen Breathing Background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,#000_100%)] z-10" />

      <ZenParticles />

      {/* Top HUD */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-20 text-emerald-900 font-bold tracking-widest uppercase text-sm">
        <div className="flex items-center gap-3 bg-emerald-950/20 px-5 py-2 rounded-full border border-emerald-900/40 backdrop-blur-md">
          <Wind className="w-5 h-5 text-emerald-500" />
          <span className="text-emerald-300">Harmony: {accuracy}%</span>
          {isPerfect && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
          )}
        </div>

        <div className="flex items-center gap-3 bg-emerald-950/20 px-5 py-2 rounded-full border border-emerald-900/40 backdrop-blur-md">
          <span className="text-emerald-300">Mantras: {phrasesCompleted}</span>
          <Leaf className="w-5 h-5 text-emerald-500" />
        </div>
      </div>

      {/* Container for the Quote */}
      <div className="w-full max-w-5xl px-8 z-20 relative">
        <AnimatePresence mode="wait">
          {!isTransitioning && (
            <motion.div
              key={targetPhrase}
              initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              exit={{ opacity: 0, filter: 'blur(20px)', y: -20, transition: { duration: 1.2, ease: "easeInOut" } }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-4xl md:text-5xl lg:text-6xl font-light leading-relaxed tracking-wide text-center"
            >
              {targetPhrase.split('').map((char, index) => {
                const isTyped = index < typedChars.length;
                const isCurrent = index === typedChars.length;
                
                return (
                  <span
                    key={index}
                    className={`
                      relative inline-block transition-all duration-700
                      ${isTyped ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'text-gray-600'}
                    `}
                  >
                    {char === ' ' ? '\u00A0' : char}
                    
                    {/* Very gentle underline cursor instead of a harsh block */}
                    {isCurrent && (
                      <motion.span
                        layoutId="zenCursor"
                        className="absolute left-0 right-0 -bottom-2 h-[2px] bg-emerald-400 opacity-60 shadow-[0_0_8px_#10b981]"
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                  </span>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {isTransitioning && (
          <div className="absolute inset-0 flex justify-center items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
              animate={{ opacity: 0.5, scale: 1, rotate: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
            >
              <CircleDashed className="w-16 h-16 text-emerald-500 animate-[spin_8s_linear_infinite]" />
            </motion.div>
          </div>
        )}
      </div>

      {/* Focus Warning (if user tabs out) - normally omitted for zen, but helps clarify */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 text-emerald-800/50 uppercase tracking-[0.3em] text-xs font-bold pointer-events-none">
        Breathe and Type
      </div>
    </div>
  );
}
