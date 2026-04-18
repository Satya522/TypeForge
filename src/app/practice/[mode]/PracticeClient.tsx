"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import TypingArea from '@/components/TypingArea';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { useTypingSounds, SoundTheme } from '@/hooks/useTypingSounds';
import { useStreak } from '@/hooks/useStreak';
import VirtualKeyboard from '@/components/VirtualKeyboard';
import SessionResults from '@/components/SessionResults';
import { RotateCcw, ChevronDown, ArrowLeft, Maximize2, Minimize2, Settings2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type PracticeClientProps = {
  text: string;
  mode: string;
  title: string;
  description: string;
  timeLimitSeconds?: number;
};

const SOUND_THEMES: { value: SoundTheme; label: string }[] = [
  { value: 'mechanical', label: '⌨️ Mechanical' },
  { value: 'typewriter', label: '🖊️ Typewriter' },
  { value: 'soft', label: '🔈 Soft' },
  { value: 'silent', label: '🔇 Silent' },
];

const XP_PER_SESSION = 10;
const XP_PER_WPM_ABOVE_50 = 2;

export default function PracticeClient({ text, mode, title, description, timeLimitSeconds }: PracticeClientProps) {
  const router = useRouter();

  // ── Settings state ──
  const [soundTheme, setSoundTheme] = useState<SoundTheme>('mechanical');
  const [fontSize, setFontSize] = useState(18);
  const [focusMode, setFocusMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ── Caps lock detection ──
  const [capsLock, setCapsLock] = useState(false);

  // ── Sounds ──
  const { playCorrect, playWrong } = useTypingSounds(soundTheme);

  // ── Streak / XP / PB ──
  const { streak, pb, xp, newPb, recordSession, clearNewPb, levelInfo } = useStreak();

  // ── Live elapsed timer ──
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── WPM history for results chart ──
  const wpmHistoryRef = useRef<number[]>([]);
  const wpmSampleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    finished, typed, currentIndex, errors,
    wpm, rawWpm, accuracy, progress, timeLeft, handleKey, restart, elapsedMs,
  } = useTypingEngine(text, timeLimitSeconds ? timeLimitSeconds * 1000 : undefined);

  // ── Start elapsed timer on first keystroke ──
  useEffect(() => {
    if (typed.length === 1 && !timerRef.current) {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
      // Sample WPM every 3 seconds for sparkline
      wpmSampleRef.current = setInterval(() => {
        wpmHistoryRef.current.push(wpm);
      }, 3000);
    }
    if (finished) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (wpmSampleRef.current) { clearInterval(wpmSampleRef.current); wpmSampleRef.current = null; }
    }
  }, [typed.length, finished, wpm]);

  // ── Reset on restart ──
  const handleRestart = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (wpmSampleRef.current) { clearInterval(wpmSampleRef.current); wpmSampleRef.current = null; }
    setElapsed(0);
    wpmHistoryRef.current = [];
    clearNewPb();
    restart();
  }, [restart, clearNewPb]);

  // Cleanup
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (wpmSampleRef.current) clearInterval(wpmSampleRef.current);
  }, []);

  // ── Save result + record session on finish ──
  const [xpEarned, setXpEarned] = useState(0);
  useEffect(() => {
    if (!finished) return;
    const earned = XP_PER_SESSION + Math.max(0, wpm - 50) * XP_PER_WPM_ABOVE_50;
    setXpEarned(earned);
    recordSession(wpm, accuracy);

    const saveResult = async () => {
      try {
        const res = await fetch('/api/practice/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode, wpm, rawWpm, accuracy, errors, duration: elapsedMs }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error || 'Failed to save session'); return; }
      } catch (err) { console.error(err); }
    };
    saveResult();
  }, [finished]);

  // ── Keyboard listener ──
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      setCapsLock(event.getModifierState('CapsLock'));
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.length === 1 || event.key === 'Backspace' || event.key === ' ') event.preventDefault();
      handleKey(event.key);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [handleKey]);

  // ── Play sound on keystroke ──
  const prevTypedLen = useRef(0);
  const lastTypedChar = typed.length > 0 ? typed[typed.length - 1] : null;
  const lastExpectedChar = typed.length > 0 ? text[typed.length - 1] : null;
  const lastStatus = !lastTypedChar ? 'idle' : lastTypedChar === lastExpectedChar ? 'correct' : 'wrong';

  useEffect(() => {
    if (finished) return;
    if (typed.length > prevTypedLen.current) {
      if (lastStatus === 'correct') playCorrect();
      else if (lastStatus === 'wrong') playWrong();
    }
    prevTypedLen.current = typed.length;
  }, [typed.length, lastStatus, finished, playCorrect, playWrong]);

  // Reset typed length tracker on restart
  useEffect(() => {
    if (typed.length === 0) prevTypedLen.current = 0;
  }, [typed.length]);

  const targetChar = !finished && currentIndex < text.length ? text[currentIndex] : '';

  // ── Elapsed format ──
  const elapsedStr = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

  return (
    <div className={cn(
      "flex flex-col w-full transition-all duration-300",
      focusMode ? "h-screen fixed inset-0 z-50 bg-[#090C0B] p-6" : "h-[calc(100vh-60px)]"
    )}>

      {/* ── TOP HEADER / HUD ── */}
      <AnimatePresence>
        {!focusMode && (
          <motion.div
            initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full flex sm:flex-row flex-col gap-2 justify-between items-center mb-2 text-gray-400 shrink-0"
          >
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Back */}
              <Link href="/practice"
                className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] transition-colors group"
                title="Leave Practice"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
              </Link>

              {/* Mode Selector */}
              <div className="w-full sm:w-auto relative group">
                <select
                  value={mode}
                  onChange={(e) => { if (e.target.value) { e.target.blur(); router.push(`/practice/${e.target.value}`); } }}
                  className="appearance-none h-8 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-colors rounded-full px-4 pr-8 text-[12px] font-semibold text-gray-200 outline-none cursor-pointer backdrop-blur-md"
                >
                  <option value="" disabled className="bg-[#090C0B] text-gray-500">── Core Drills ──</option>
                  <option value="words"       className="bg-[#090C0B] text-gray-300">Random Words</option>
                  <option value="sentences"   className="bg-[#090C0B] text-gray-300">Sentences</option>
                  <option value="paragraphs"  className="bg-[#090C0B] text-gray-300">Paragraphs</option>
                  <option value="home-row"    className="bg-[#090C0B] text-gray-300">Home Row Focus</option>
                  <option value="top-row"     className="bg-[#090C0B] text-gray-300">Top Row Focus</option>
                  <option value="bottom-row"  className="bg-[#090C0B] text-gray-300">Bottom Row Focus</option>
                  <option value="left-hand"   className="bg-[#090C0B] text-gray-300">Left Hand Only</option>
                  <option value="right-hand"  className="bg-[#090C0B] text-gray-300">Right Hand Only</option>
                  <option value="numpad"      className="bg-[#090C0B] text-gray-300">Numpad</option>
                  <option value="" disabled className="bg-[#090C0B] text-gray-500">── Developer Packs ──</option>
                  <option value="code"        className="bg-[#090C0B] text-gray-300">Mixed Code</option>
                  <option value="javascript"  className="bg-[#090C0B] text-gray-300">JavaScript</option>
                  <option value="typescript"  className="bg-[#090C0B] text-gray-300">TypeScript</option>
                  <option value="react"       className="bg-[#090C0B] text-gray-300">React JSX</option>
                  <option value="python"      className="bg-[#090C0B] text-gray-300">Python</option>
                  <option value="html-css"    className="bg-[#090C0B] text-gray-300">HTML &amp; CSS</option>
                  <option value="sql"         className="bg-[#090C0B] text-gray-300">SQL Queries</option>
                  <option value="cpp"         className="bg-[#090C0B] text-gray-300">C++</option>
                  <option value="java"        className="bg-[#090C0B] text-gray-300">Java</option>
                  <option value="rust"        className="bg-[#090C0B] text-gray-300">Rust</option>
                  <option value="go"          className="bg-[#090C0B] text-gray-300">Go</option>
                  <option value="bash"        className="bg-[#090C0B] text-gray-300">Bash Script</option>
                  <option value="" disabled className="bg-[#090C0B] text-gray-500">── Timed Sprints ──</option>
                  <option value="time-15"     className="bg-[#090C0B] text-gray-300">15s Sprint</option>
                  <option value="time-30"     className="bg-[#090C0B] text-gray-300">30s Sprint</option>
                  <option value="time-60"     className="bg-[#090C0B] text-gray-300">60s Test</option>
                  <option value="time-300"    className="bg-[#090C0B] text-gray-300">5m Marathon</option>
                  <option value="" disabled className="bg-[#090C0B] text-gray-500">── Specialized ──</option>
                  <option value="story"       className="bg-[#090C0B] text-gray-300">English Story</option>
                  <option value="scientific"  className="bg-[#090C0B] text-gray-300">Scientific Terms</option>
                  <option value="medical"     className="bg-[#090C0B] text-gray-300">Medical Terms</option>
                  <option value="legal"       className="bg-[#090C0B] text-gray-300">Legal Terms</option>
                  <option value="dictionary"  className="bg-[#090C0B] text-gray-300">Dictionary Builder</option>
                  <option value="punctuation" className="bg-[#090C0B] text-gray-300">Punctuation</option>
                  <option value="numbers"     className="bg-[#090C0B] text-gray-300">Numbers Mix</option>
                  <option value="quotes"      className="bg-[#090C0B] text-gray-300">Famous Quotes</option>
                  <option value="zen"         className="bg-[#090C0B] text-gray-300">Zen Mode</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-white">
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>

              {/* Streak badge */}
              {streak.currentStreak > 0 && (
                <div className="flex items-center gap-1 px-2.5 h-8 rounded-full text-[11px] font-bold shrink-0"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
                  🔥 {streak.currentStreak}
                </div>
              )}

              {/* Level badge */}
              <div className="flex items-center gap-1 px-2.5 h-8 rounded-full text-[11px] font-bold shrink-0"
                style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#a855f7' }}>
                Lv.{levelInfo.level}
              </div>
            </div>

            {/* HUD Capsule */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center gap-3 px-3 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-md">
                {/* Elapsed or countdown timer */}
                {!timeLimitSeconds && (
                  <>
                    <div className="flex items-center gap-1 leading-none">
                      <span className="text-[9px] tracking-widest text-gray-500 font-bold uppercase">TIME</span>
                      <span className="text-gray-200 font-bold text-[13px] tabular-nums">{elapsedStr}</span>
                    </div>
                    <div className="w-px h-3 bg-white/[0.08]" />
                  </>
                )}
                {timeLeft !== null && (
                  <>
                    <div className="flex items-center gap-1 leading-none">
                      <span className="text-[9px] tracking-widest text-gray-500 font-bold uppercase">TIME</span>
                      <span className={cn("font-bold text-[13px] tabular-nums", timeLeft <= 5 ? "text-red-400" : "text-gray-200")}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="w-px h-3 bg-white/[0.08]" />
                  </>
                )}
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-[9px] tracking-widest text-gray-500 font-bold uppercase">WPM</span>
                  <span className="text-accent-300 font-bold text-[13px]">{wpm}</span>
                </div>
                <div className="w-px h-3 bg-white/[0.08]" />
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-[9px] tracking-widest text-gray-500 font-bold uppercase">ACC</span>
                  <span className="text-gray-200 font-bold text-[13px]">{accuracy}%</span>
                </div>
                <div className="w-px h-3 bg-white/[0.08]" />
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-[9px] tracking-widest text-gray-500 font-bold uppercase">ERR</span>
                  <span className={cn("font-bold text-[13px]", errors > 0 ? "text-red-400" : "text-gray-400")}>{errors}</span>
                </div>
                {!timeLimitSeconds && (
                  <>
                    <div className="w-px h-3 bg-white/[0.08]" />
                    <div className="flex items-center gap-1 leading-none">
                      <span className="text-[9px] tracking-widest text-gray-500 font-bold uppercase">PROG</span>
                      <span className="text-white font-bold text-[13px]">{Math.floor(progress)}%</span>
                    </div>
                  </>
                )}
              </div>

              {/* Restart */}
              <button onClick={handleRestart}
                className="group flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-[#090C0B] border border-white/[0.1] hover:bg-white/[0.08] hover:border-accent-300/50 hover:shadow-[0_0_20px_rgba(57,255,20,0.2)] transition-all active:scale-95 outline-none"
                title="Restart"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-400 group-hover:text-accent-300 transition-colors" />
              </button>

              {/* Focus mode toggle */}
              <button onClick={() => setFocusMode(f => !f)}
                className="group flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-[#090C0B] border border-white/[0.1] hover:bg-white/[0.08] transition-all active:scale-95 outline-none"
                title="Focus Mode"
              >
                <Maximize2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-accent-300 transition-colors" />
              </button>

              {/* Settings toggle */}
              <button onClick={() => setShowSettings(s => !s)}
                className="group flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-[#090C0B] border border-white/[0.1] hover:bg-white/[0.08] transition-all active:scale-95 outline-none"
                title="Sound & Font Settings"
              >
                <Settings2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-accent-300 transition-colors" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Focus mode exit ── */}
      {focusMode && (
        <div className="absolute top-4 right-4 z-50">
          <button onClick={() => setFocusMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/[0.05] border border-white/[0.1] text-gray-400 hover:text-white transition-colors"
          >
            <Minimize2 className="w-3 h-3" /> Exit Focus
          </button>
        </div>
      )}

      {/* ── Settings Panel ── */}
      <AnimatePresence>
        {showSettings && !focusMode && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="w-full mb-2 rounded-xl p-3 flex flex-wrap gap-4 items-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Sound Theme */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Sound</span>
              <div className="flex gap-1">
                {SOUND_THEMES.map(t => (
                  <button key={t.value} onClick={() => setSoundTheme(t.value)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold transition-all",
                      soundTheme === t.value
                        ? "bg-accent-300/20 border border-accent-300/40 text-accent-300"
                        : "bg-white/[0.03] border border-white/[0.07] text-gray-500 hover:text-gray-300"
                    )}
                  >{t.label}</button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Font</span>
              <div className="flex gap-1">
                {[14, 16, 18, 22, 26].map(s => (
                  <button key={s} onClick={() => setFontSize(s)}
                    className={cn(
                      "w-7 h-6 rounded-md text-[11px] font-bold transition-all",
                      fontSize === s
                        ? "bg-accent-300/20 border border-accent-300/40 text-accent-300"
                        : "bg-white/[0.03] border border-white/[0.07] text-gray-500 hover:text-gray-300"
                    )}
                  >{s}</button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Caps Lock Warning ── */}
      <AnimatePresence>
        {capsLock && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="w-full mb-2 flex items-center justify-center gap-2 py-1.5 rounded-xl text-[12px] font-bold tracking-wide shrink-0"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Caps Lock is ON
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN AREA ── */}
      <div className="w-full flex-1 min-h-0 flex flex-col items-center gap-3">

        {/* Typing panel OR Results */}
        <div
          className="w-full flex-1 min-h-0 flex flex-col justify-center relative rounded-2xl overflow-hidden"
          style={{
            padding: focusMode ? '32px 48px' : '16px 40px',
            background: 'linear-gradient(160deg, rgba(14,18,16,0.97) 0%, rgba(9,12,11,0.99) 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 0 0 1px rgba(57,255,20,0.04), 0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(57,255,20,0.35) 40%, rgba(57,255,20,0.35) 60%, transparent)' }}
          />

          {finished ? (
            <SessionResults
              wpm={wpm} rawWpm={rawWpm} accuracy={accuracy} errors={errors}
              elapsedMs={elapsedMs} mode={title}
              wpmHistory={wpmHistoryRef.current}
              pb={pb} newPb={newPb}
              streak={streak.currentStreak}
              xp={xp} xpEarned={xpEarned}
              onRestart={handleRestart}
            />
          ) : (
            <TypingArea
              text={text}
              typed={typed}
              currentIndex={currentIndex}
              finished={finished}
              fontSize={fontSize}
            />
          )}
        </div>

        {/* ── VIRTUAL KEYBOARD ── */}
        {!finished && !focusMode && (
          <div className="w-full shrink-0">
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
