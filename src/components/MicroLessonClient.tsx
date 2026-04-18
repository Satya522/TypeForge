"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import TypingArea from '@/components/TypingArea';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { useTypingSounds, SoundTheme } from '@/hooks/useTypingSounds';
import VirtualKeyboard from '@/components/VirtualKeyboard';
import SessionResults from '@/components/SessionResults';
import { RotateCcw, Link as LinkIcon, Settings2, AlertTriangle, ArrowLeft, Target, BookOpen, Clock, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Sound Themes same as practice
const SOUND_THEMES: { value: SoundTheme; label: string }[] = [
  { value: 'mechanical', label: '⌨️ Mechanical' },
  { value: 'typewriter', label: '🖊️ Typewriter' },
  { value: 'soft', label: '🔈 Soft' },
  { value: 'silent', label: '🔇 Silent' },
];

interface MicroLessonClientProps {
  blocks: { id: string; content: string }[];
  lessonId: string;
  xpReward: number;
  title: string;
  instructions: string | null;
  targetKeys: string | null;
}

export default function MicroLessonClient({ blocks, lessonId, xpReward, title, instructions, targetKeys }: MicroLessonClientProps) {
  const router = useRouter();

  // Settings
  const [soundTheme, setSoundTheme] = useState<SoundTheme>('mechanical');
  const [fontSize, setFontSize] = useState(18);
  const [showSettings, setShowSettings] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  // Lesson flow
  const [blockIndex, setBlockIndex] = useState(0);
  const current = blocks[blockIndex];
  
  // Aggregate stats
  const [agg, setAgg] = useState({ correct: 0, typed: 0, errors: 0, time: 0 });
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [finalStats, setFinalStats] = useState({ wpm: 0, rawWpm: 0, accuracy: 0, errors: 0, time: 0 });

  const { playCorrect, playWrong } = useTypingSounds(soundTheme);

  // Engine for current block
  const {
    finished, typed, currentIndex, errors,
    wpm, accuracy, progress, handleKey, restart, elapsedMs, correctChars, typedChars, rawWpm
  } = useTypingEngine(current.content);

  // Elapsed timer formatting
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typed.length === 1 && !timerRef.current && !finished) {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    }
    if (finished || showFinalResults) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
  }, [typed.length, finished, showFinalResults]);

  // Handle block completion & lesson completion
  useEffect(() => {
    if (finished && !showFinalResults) {
      const isLastBlock = blockIndex === blocks.length - 1;
      
      const newAgg = {
        correct: agg.correct + correctChars,
        typed: agg.typed + Math.max(typedChars, correctChars),
        errors: agg.errors + errors,
        time: agg.time + elapsedMs, // MS
      };
      
      setAgg(newAgg);

      if (!isLastBlock) {
        // Move to next block silently and nicely
        const timer = setTimeout(() => {
          setBlockIndex((idx) => idx + 1);
          restart();
        }, 500);
        return () => clearTimeout(timer);
      } else {
        // Compute final results
        const totalMinutes = newAgg.time / 60000;
        const totalWpm = totalMinutes > 0 ? Math.round((newAgg.correct / 5) / totalMinutes) : 0;
        const totalRaw = totalMinutes > 0 ? Math.round((newAgg.typed / 5) / totalMinutes) : 0;
        const totalAcc = newAgg.typed === 0 ? 100 : Math.round((newAgg.correct / newAgg.typed) * 100);
        
        setFinalStats({ wpm: totalWpm, rawWpm: totalRaw, accuracy: totalAcc, errors: newAgg.errors, time: newAgg.time });
        setShowFinalResults(true);

        const saveResult = async () => {
          try {
            const res = await fetch('/api/lesson/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lessonId, wpm: totalWpm, rawWpm: totalRaw, accuracy: totalAcc, errors: newAgg.errors, duration: newAgg.time,
              }),
            });
            const data = await res.json();
            if (!res.ok) toast.error(data.error || 'Failed to save result');
            else toast.success(`Lesson completed! +${xpReward} XP 🔥`);
          } catch (err) {
            toast.error('Network error saving result');
          }
        };
        saveResult();
      }
    }
  }, [finished, blockIndex, blocks.length, showFinalResults]);

  // Restart Block action
  const handleRestartBlock = useCallback(() => {
    restart();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setElapsed(0);
  }, [restart]);

  // Restart Entire Lesson action
  const handleRestartLesson = useCallback(() => {
    setAgg({ correct: 0, typed: 0, errors: 0, time: 0 });
    setBlockIndex(0);
    setShowFinalResults(false);
    handleRestartBlock();
  }, [handleRestartBlock]);


  // Key listener
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      setCapsLock(event.getModifierState('CapsLock'));
      if (showFinalResults) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.length === 1 || event.key === 'Backspace' || event.key === ' ') event.preventDefault();
      handleKey(event.key);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [handleKey, showFinalResults]);

  // Sounds
  const prevTypedLen = useRef(0);
  const lastTypedChar = typed.length > 0 ? typed[typed.length - 1] : null;
  const lastExpectedChar = typed.length > 0 ? current.content[typed.length - 1] : null;
  const lastStatus = !lastTypedChar ? 'idle' : lastTypedChar === lastExpectedChar ? 'correct' : 'wrong';

  useEffect(() => {
    if (finished || showFinalResults) return;
    if (typed.length > prevTypedLen.current) {
      if (lastStatus === 'correct') playCorrect();
      else if (lastStatus === 'wrong') playWrong();
    }
    prevTypedLen.current = typed.length;
  }, [typed.length, lastStatus, finished, showFinalResults, playCorrect, playWrong]);

  useEffect(() => { if (typed.length === 0) prevTypedLen.current = 0; }, [typed.length]);

  const targetChar = !finished && currentIndex < current.content.length ? current.content[currentIndex] : '';
  const elapsedStr = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  
  // Aggregate visual progress logic
  const overallProgress = (blockIndex / blocks.length) * 100 + (progress / blocks.length);

  return (
    <div className="flex flex-col w-full h-[calc(100vh-120px)] transition-all duration-300">
      
      {/* ── TOP HUD ── */}
      <AnimatePresence>
        {!showFinalResults && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col md:flex-row gap-4 justify-between items-center mb-4 text-gray-400 shrink-0">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Back to Learn */}
              <Link href="/learn"
                className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] transition-colors group shadow-lg"
                title="Leave Lesson"
              >
                <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </Link>
              
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent-300" />
                  {title}
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block max-w-lg truncate">{instructions}</p>
              </div>
            </div>

            {/* Stats Capsule */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <div className="flex items-center gap-4 px-4 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-md">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-[9px] tracking-widest text-gray-500 font-bold uppercase">Time</span>
                  <span className="text-gray-200 font-bold text-[14px] tabular-nums">{elapsedStr}</span>
                </div>
                <div className="w-px h-4 bg-white/[0.08]" />
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-[9px] tracking-widest text-gray-500 font-bold uppercase">WPM</span>
                  <span className="text-accent-300 font-bold text-[14px]">{wpm}</span>
                </div>
                <div className="w-px h-4 bg-white/[0.08]" />
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-[9px] tracking-widest text-gray-500 font-bold uppercase">Acc</span>
                  <span className="text-gray-200 font-bold text-[14px]">{accuracy}%</span>
                </div>
                <div className="w-px h-4 bg-white/[0.08]" />
                <div className="flex items-center gap-1.5 leading-none text-gray-300">
                  <span className="text-[9px] tracking-widest text-gray-500 font-bold uppercase">Section</span>
                  <span className="font-bold text-[14px]">{blockIndex + 1}/{blocks.length}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <button onClick={handleRestartBlock} className="group flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-[#090C0B] border border-white/[0.1] hover:bg-white/[0.08] hover:border-accent-300/50 hover:shadow-[0_0_20px_rgba(57,255,20,0.2)] transition-all active:scale-95 outline-none" title="Restart Section">
                <RotateCcw className="w-4 h-4 text-gray-400 group-hover:text-accent-300 transition-colors" />
              </button>
              <button onClick={() => setShowSettings(s => !s)} className="group flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-[#090C0B] border border-white/[0.1] hover:bg-white/[0.08] transition-all active:scale-95 outline-none" title="Settings">
                <Settings2 className="w-4 h-4 text-gray-400 transition-colors group-hover:text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SETTINGS DROP ── */}
      <AnimatePresence>
        {showSettings && !showFinalResults && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.15 }} className="w-full mb-4 rounded-xl p-3 flex flex-wrap gap-4 items-center shrink-0 border border-white/[0.07] bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Sound</span>
              <div className="flex gap-1">
                {SOUND_THEMES.map(t => (
                  <button key={t.value} onClick={() => setSoundTheme(t.value)} className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold transition-all", soundTheme === t.value ? "bg-accent-300/20 border border-accent-300/40 text-accent-300" : "bg-white/[0.03] border border-white/[0.07] text-gray-500 hover:text-gray-300")}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Font</span>
              <div className="flex gap-1">
                {[14, 16, 18, 22, 26].map(s => (
                  <button key={s} onClick={() => setFontSize(s)} className={cn("w-7 h-6 rounded-md text-[11px] font-bold transition-all", fontSize === s ? "bg-accent-300/20 border border-accent-300/40 text-accent-300" : "bg-white/[0.03] border border-white/[0.07] text-gray-500 hover:text-gray-300")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CAPS LOCK WARN ── */}
      <AnimatePresence>
        {capsLock && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="w-full mb-3 flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-bold tracking-wide border border-amber-500/25 bg-amber-500/10 text-amber-500 shrink-0">
            <AlertTriangle className="w-4 h-4" /> Caps Lock is ON
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PROGRESS BAR ── */}
      {!showFinalResults && (
        <div className="w-full h-1 mt-1 mb-4 rounded-full bg-white/[0.05] overflow-hidden shrink-0">
          <div className="h-full bg-gradient-to-r from-emerald-400 via-accent-300 to-cyan-400 transition-all duration-300" style={{ width: `${overallProgress}%` }} />
        </div>
      )}
      
      {/* ── TARGET KEYS HINT ── */}
      {!showFinalResults && targetKeys && (
        <div className="absolute top-1/2 -left-6 -translate-y-1/2 -translate-x-full hidden lg:flex flex-col items-end gap-2 text-right">
          <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Target</span>
          <div className="inline-flex gap-1 bg-white/[0.03] p-1.5 rounded-lg border border-white/[0.05]">
             {targetKeys.split(',').map((char: string) => (
                <kbd key={char} className="w-7 h-7 flex items-center justify-center bg-white/[0.08] rounded border-b border-white/[0.1] text-xs font-mono text-white tracking-tighter">
                  {char.trim()}
                </kbd>
             ))}
          </div>
        </div>
      )}

      {/* ── MAIN AREA ── */}
      <div className="w-full flex-1 min-h-0 flex flex-col items-center gap-6">
        
        {/* Typing Area container */}
        <div className="w-full flex-1 min-h-0 flex flex-col justify-center relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-white/[0.02] to-transparent border border-white/[0.05]"
          style={{ padding: '16px 40px', background: 'linear-gradient(160deg, rgba(14,18,16,0.97) 0%, rgba(9,12,11,0.99) 100%)', boxShadow: '0 0 0 1px rgba(57,255,20,0.04), 0 24px 80px rgba(0,0,0,0.7)' }}>
          
          <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-accent-300/30 to-transparent" />
          
          {showFinalResults ? (
            <SessionResults
              wpm={finalStats.wpm} rawWpm={finalStats.rawWpm} accuracy={finalStats.accuracy} errors={finalStats.errors} elapsedMs={finalStats.time}
              mode={`Lesson: ${title}`}
              wpmHistory={[]}
              pb={{ wpm: 0, accuracy: 0 }} newPb={{ wpm: false, accuracy: false }} streak={0}
              xp={xpReward} xpEarned={xpReward}
              onRestart={handleRestartLesson}
            />
          ) : (
            <TypingArea
              text={current.content}
              typed={typed}
              currentIndex={currentIndex}
              finished={finished}
              fontSize={fontSize}
            />
          )}
        </div>

        {/* Virtual Keyboard */}
        {!showFinalResults && (
          <div className="w-full pb-4">
            <VirtualKeyboard
              targetChar={targetChar}
              lastStatus={lastStatus}
              lastTypedChar={lastTypedChar}
            />
          </div>
        )}
      </div>
      
    </div>
  );
}