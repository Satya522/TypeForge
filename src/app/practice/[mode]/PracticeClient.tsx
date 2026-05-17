"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import SessionResults from '@/components/SessionResults';
import TypingArea from '@/components/TypingArea';
import { useTypingEngine } from '@/hooks/useTypingEngine';

import VirtualKeyboard from '@/components/VirtualKeyboard';
import { RotateCcw, ChevronDown, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  SUPPORTED_LANGUAGES,
  normalizeLanguageCode,
  type SupportedLanguageCode,
} from '@/lib/languages';

type PracticeClientProps = {
  text: string;
  mode: string;
  title: string;
  description: string;
  timeLimitSeconds?: number;
  initialLanguage?: string | null;
};

export default function PracticeClient({ text, mode, title, description, timeLimitSeconds, initialLanguage }: PracticeClientProps) {
  const router = useRouter();
  const [selectedFont, setSelectedFont] = useState('code');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguageCode>(
    normalizeLanguageCode(initialLanguage)
  );

  const {
    finished,
    typed,
    currentIndex,
    errors,
    wpm,
    rawWpm,
    wpmHistory,
    accuracy,
    progress,
    timeLeft,
    handleKey,
    restart,
    elapsedMs,
    getTelemetrySnapshot,
  } = useTypingEngine(text, timeLimitSeconds ? timeLimitSeconds * 1000 : undefined);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem('preferredLang');
    if (storedLanguage) {
      setSelectedLanguage(normalizeLanguageCode(storedLanguage));
    }
  }, []);

  const handleLanguageChange = (value: string) => {
    const nextLanguage = normalizeLanguageCode(value);
    setSelectedLanguage(nextLanguage);
    window.localStorage.setItem('preferredLang', nextLanguage);
  };

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      // Ignore meta keys such as ctrl/cmd/alt/tab
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      
      // Prevent browser default behaviors for single characters (like scrolling on spacebar) 
      // or utility keys like Backspace so we don't accidentally navigate back
      if (event.key.length === 1 || event.key === 'Backspace' || event.key === ' ') {
        event.preventDefault();
      }
      
      handleKey(event.key);
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [handleKey]);

  useEffect(() => {
    if (!finished) return;

    const saveResult = async () => {
      try {
        const res = await fetch('/api/practice/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode,
            wpm,
            rawWpm,
            accuracy,
            errors,
            duration: elapsedMs,
            telemetry: getTelemetrySnapshot(),
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Failed to save session');
          return;
        }

        toast.success('Session saved');
      } catch (err) {
        console.error(err);
        toast.error('Network error');
      }
    };

    saveResult();
  }, [finished, mode, wpm, rawWpm, accuracy, errors, elapsedMs, getTelemetrySnapshot]);

  // Compute the character the user needs to type right now
  const targetChar = !finished && currentIndex < text.length ? text[currentIndex] : '';
  
  // Compute feedback state for the newly built VirtualKeyboard guidance
  const lastTypedChar = typed.length > 0 ? typed[typed.length - 1] : null;
  const lastExpectedChar = typed.length > 0 ? text[typed.length - 1] : null;
  const lastStatus = !lastTypedChar ? 'idle' : lastTypedChar === lastExpectedChar ? 'correct' : 'wrong';
  const xpEarned = Math.max(10, Math.round(wpm * (accuracy / 100)) + Math.max(0, 100 - errors * 2));

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      {/* ── TOP HEADER / HUD ── */}
      <div
        className="mb-2 flex w-full shrink-0 flex-col items-center justify-between gap-2 text-gray-400 sm:flex-row"
        data-nav-reveal-blocker
      >
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Back Button */}
          <Link 
            href="/practice"
            className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-colors focus:ring-2 focus:ring-accent-300 outline-none group"
            title="Leave Practice"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
          </Link>

          {/* Mode Selector Dropdown */}
          <div className="w-full sm:w-auto relative group">
          <select 
            value={mode} 
            onChange={(e) => {
              if(e.target.value) {
                e.target.blur();
                router.push(`/practice/${e.target.value}`);
              }
            }}
            className="h-8 appearance-none rounded-full border border-white/[0.06] bg-white/[0.03] px-4 pr-8 text-[12px] font-semibold text-gray-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none backdrop-blur-md transition-colors hover:border-white/[0.12] hover:bg-white/[0.08]"
          >
            <option value="" disabled className="bg-[#090C0B] text-gray-500">── Core Drills ──</option>
            <option value="words" className="bg-[#090C0B] text-gray-300">Random Words</option>
            <option value="sentences" className="bg-[#090C0B] text-gray-300">Sentences</option>
            <option value="paragraphs" className="bg-[#090C0B] text-gray-300">Paragraphs</option>
            <option value="home-row" className="bg-[#090C0B] text-gray-300">Home Row Focus</option>
            <option value="top-row" className="bg-[#090C0B] text-gray-300">Top Row Focus</option>
            <option value="bottom-row" className="bg-[#090C0B] text-gray-300">Bottom Row Focus</option>
            <option value="left-hand" className="bg-[#090C0B] text-gray-300">Left Hand Only</option>
            <option value="right-hand" className="bg-[#090C0B] text-gray-300">Right Hand Only</option>
            <option value="numpad" className="bg-[#090C0B] text-gray-300">Numpad</option>
            
            <option value="" disabled className="bg-[#090C0B] text-gray-500">── Developer Packs ──</option>
            <option value="code" className="bg-[#090C0B] text-gray-300">Mixed Code</option>
            <option value="javascript" className="bg-[#090C0B] text-gray-300">JavaScript</option>
            <option value="typescript" className="bg-[#090C0B] text-gray-300">TypeScript</option>
            <option value="react" className="bg-[#090C0B] text-gray-300">React JSX</option>
            <option value="python" className="bg-[#090C0B] text-gray-300">Python</option>
            <option value="html-css" className="bg-[#090C0B] text-gray-300">HTML & CSS</option>
            <option value="sql" className="bg-[#090C0B] text-gray-300">SQL Queries</option>
            <option value="cpp" className="bg-[#090C0B] text-gray-300">C++</option>
            <option value="java" className="bg-[#090C0B] text-gray-300">Java</option>
            <option value="rust" className="bg-[#090C0B] text-gray-300">Rust</option>
            <option value="go" className="bg-[#090C0B] text-gray-300">Go</option>
            <option value="bash" className="bg-[#090C0B] text-gray-300">Bash Script</option>
            
            <option value="" disabled className="bg-[#090C0B] text-gray-500">── Timed Sprints ──</option>
            <option value="time-15" className="bg-[#090C0B] text-gray-300">15s Sprint</option>
            <option value="time-30" className="bg-[#090C0B] text-gray-300">30s Sprint</option>
            <option value="time-60" className="bg-[#090C0B] text-gray-300">60s Test</option>
            <option value="time-300" className="bg-[#090C0B] text-gray-300">5m Marathon</option>

            <option value="" disabled className="bg-[#090C0B] text-gray-500">── Specialized ──</option>
            <option value="story" className="bg-[#090C0B] text-gray-300">English Story</option>
            <option value="scientific" className="bg-[#090C0B] text-gray-300">Scientific Terms</option>
            <option value="medical" className="bg-[#090C0B] text-gray-300">Medical Terms</option>
            <option value="legal" className="bg-[#090C0B] text-gray-300">Legal Terms</option>
            <option value="dictionary" className="bg-[#090C0B] text-gray-300">Dictionary Builder</option>
            <option value="punctuation" className="bg-[#090C0B] text-gray-300">Punctuation</option>
            <option value="numbers" className="bg-[#090C0B] text-gray-300">Numbers Mix</option>
            <option value="quotes" className="bg-[#090C0B] text-gray-300">Famous Quotes</option>
            <option value="zen" className="bg-[#090C0B] text-gray-300">Zen Mode</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-white transition-transform group-hover:opacity-100">
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>

        </div>

        {/* HUD Capsule (Metrics + Restart) */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-3 px-3 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-md">
            {timeLeft !== null && (
              <>
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-[9px] tracking-widest text-gray-500 font-bold uppercase">TIME</span>
                  <span className={cn("font-bold text-[13px]", timeLeft <= 5 ? "text-red-400" : "text-gray-200")}>
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
            {!timeLimitSeconds && (
              <>
                <div className="w-px h-3 bg-white/[0.08]" />
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-[9px] tracking-widest text-gray-500 font-bold uppercase">PROG</span>
                  <span className="text-white font-bold text-[13px]">{Math.floor(progress)}%</span>
                </div>
              </>
            )}
            
            <div className="w-px h-3 bg-white/[0.08]" />

            {/* Language Selector */}
            <div className="relative group flex items-center">
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                aria-label="Practice language"
                className="appearance-none bg-transparent py-1 pl-1 pr-6 text-[10px] font-bold uppercase tracking-widest text-gray-300 outline-none transition-colors hover:text-white focus:text-accent-300"
              >
                {SUPPORTED_LANGUAGES.map((language) => (
                  <option
                    key={language.code}
                    value={language.code}
                    className="bg-[#090C0B] text-gray-300"
                  >
                    {language.shortLabel} · {language.nativeLabel}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-1 opacity-50 text-white transition-opacity group-hover:opacity-100">
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            <div className="w-px h-3 bg-white/[0.08]" />

            {/* Font Selector */}
            <div className="relative group flex items-center">
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="appearance-none bg-transparent text-gray-300 text-[10px] font-bold tracking-widest uppercase pl-1 pr-4 outline-none hover:text-white focus:text-accent-300 transition-colors cursor-pointer"
              >
                <option value="code" className="bg-[#090C0B] text-gray-300">JetBrains</option>
                <option value="fira-code" className="bg-[#090C0B] text-gray-300">Fira</option>
                <option value="roboto-mono" className="bg-[#090C0B] text-gray-300">Roboto</option>
                <option value="space-mono" className="bg-[#090C0B] text-gray-300">Space</option>
                <option value="ibm-plex-mono" className="bg-[#090C0B] text-gray-300">IBM Plex</option>
              </select>
              <div className="absolute right-0 pointer-events-none opacity-50 text-white group-hover:opacity-100 transition-opacity">
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>

          <button 
            onClick={restart} 
            className="group flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-[#090C0B] border border-white/[0.1] hover:bg-white/[0.08] hover:border-accent-300/50 hover:shadow-[0_0_20px_rgba(57,255,20,0.2)] transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
            aria-label="Restart Practice"
            title="Restart (Tab + Enter)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-400 group-hover:text-accent-300 transition-colors" />
          </button>
        </div>
      </div>

      {finished ? (
        <div className="min-h-0 w-full flex-1 overflow-hidden">
          <SessionResults
            wpm={wpm}
            rawWpm={rawWpm}
            accuracy={accuracy}
            errors={errors}
            elapsedMs={elapsedMs}
            mode={title || mode}
            wpmHistory={wpmHistory}
            pb={{ wpm, accuracy }}
            newPb={{ wpm: false, accuracy: false }}
            streak={0}
            xp={xpEarned}
            xpEarned={xpEarned}
            onRestart={restart}
          />
        </div>
      ) : (
        /* ── TYPING AREA ── */
        <div className="w-full flex-1 min-h-0 flex flex-col items-center gap-3">
          <div className="w-full flex-1 min-h-0 flex flex-col justify-center relative bg-[#090C0B]/40 backdrop-blur-xl border border-white/[0.04] px-6 py-4 sm:px-10 sm:py-6 lg:px-14 lg:py-8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.02)]">
            <TypingArea
              text={text}
              typed={typed}
              currentIndex={currentIndex}
              finished={finished}
              fontClass={selectedFont}
            />
          </div>

          {/* ── VIRTUAL KEYBOARD ── */}
          <div className="w-full shrink-0">
            <VirtualKeyboard 
              targetChar={targetChar} 
              lastStatus={lastStatus} 
              lastTypedChar={lastTypedChar}
            />
          </div>
        </div>
      )}
    </div>
  );
}
