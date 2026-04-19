"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORD_BANK = [
  "apple","tiger","ocean","piano","storm","flame","stone","river",
  "cloud","eagle","brush","lemon","crane","table","light","night",
  "plant","smart","bread","dance","horse","clock","black","white",
  "green","round","sweet","frost","crisp","sharp","blend","glow",
  "swift","chess","drift","price","flash","blaze","grind","pilot",
];

function scramble(word: string): string {
  const arr = word.split("");
  let result = word;
  while (result === word && arr.length > 2) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    result = arr.join("");
  }
  return result;
}

type WordItem = { word: string; scrambled: string; id: number };
let wid = 0;

export default function WordScrambleGame() {
  const [status, setStatus] = useState<"idle"|"playing"|"finished">("idle");
  const [items, setItems] = useState<WordItem[]>([]);
  const [current, setCurrent] = useState<WordItem|null>(null);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct"|"wrong"|null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [hints, setHints] = useState(3);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const nextWord = useCallback((pool: WordItem[]) => {
    if (pool.length === 0) { setStatus("finished"); return pool; }
    const idx = Math.floor(Math.random() * pool.length);
    setCurrent(pool[idx]);
    setHintUsed(false);
    setInput("");
    return pool.filter((_, i) => i !== idx);
  }, []);

  const startGame = () => {
    const pool: WordItem[] = WORD_BANK.map(w => ({
      word: w, scrambled: scramble(w), id: ++wid
    }));
    setScore(0); setTimeLeft(60); setStreak(0); setHints(3); setFeedback(null);
    setStatus("playing");
    const remaining = nextWord(pool);
    setItems(remaining);
    inputRef.current?.focus();
  };

  // Timer
  useEffect(() => {
    if (status !== "playing") { clearInterval(timerRef.current!); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); setStatus("finished"); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [status]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    setInput(val);
    if (!current) return;
    if (val === current.word) {
      const bonus = hintUsed ? 1 : (streak >= 3 ? 3 : streak >= 1 ? 2 : 1);
      setScore(s => s + bonus);
      setStreak(s => s + 1);
      setFeedback("correct");
      setTimeout(() => setFeedback(null), 400);
      setItems(prev => {
        const pool = prev;
        const remaining = nextWord(pool);
        setItems(remaining);
        return remaining;
      });
    }
  };

  const handleSkip = () => {
    if (!current) return;
    setStreak(0);
    setFeedback("wrong");
    setTimeout(() => setFeedback(null), 400);
    setItems(prev => {
      const remaining = nextWord(prev);
      setItems(remaining);
      return remaining;
    });
  };

  const handleHint = () => {
    if (hints <= 0 || !current || hintUsed) return;
    setHints(h => h - 1);
    setHintUsed(true);
    // Show first letter
    setInput(current.word[0]);
  };

  const timerPct = (timeLeft / 60) * 100;
  const timerColor = timerPct > 50 ? "#39ff14" : timerPct > 25 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-white/10 bg-[#070a07]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-black/40 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <span className="text-lg">🔀</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">Word Scramble</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>Score: <span className="text-amber-400 font-bold">{score}</span></span>
          {streak >= 2 && <span className="text-orange-400 font-bold">🔥 ×{streak}</span>}
          <span>Hints: <span className="text-blue-400">{hints}</span></span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1 bg-gray-800">
        <div className="h-full transition-all duration-1000" style={{ width:`${timerPct}%`, background:timerColor, boxShadow:`0 0 6px ${timerColor}` }} />
      </div>

      {/* Game area */}
      {status === "playing" && current && (
        <div className="flex flex-col items-center justify-center h-full px-6 gap-6 -mt-8">
          {/* Timer */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: timerColor }}>{timeLeft}s</span>
            <span className="text-gray-600 text-xs">| {items.length} words left</span>
          </div>

          {/* Scrambled word */}
          <AnimatePresence mode="wait">
            <motion.div key={current.id}
              initial={{ opacity:0, y:20, scale:0.9 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:-20, scale:1.1 }}
              className={`text-5xl font-black tracking-[0.18em] font-mono transition-colors duration-200 ${
                feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-white"
              }`}
              style={{ textShadow: feedback === "correct" ? "0 0 30px rgba(57,255,20,0.7)" : "none" }}
            >
              {current.scrambled.toUpperCase()}
            </motion.div>
          </AnimatePresence>

          {/* Letter count hint */}
          <div className="flex gap-1.5">
            {Array.from({ length: current.word.length }).map((_, i) => (
              <div key={i} className={`h-0.5 w-5 rounded-full transition-all ${i < input.length ? "bg-amber-400" : "bg-gray-700"}`} />
            ))}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            value={input}
            onChange={handleInput}
            autoComplete="off" autoCorrect="off" spellCheck={false}
            className="w-full max-w-xs text-center bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-xl font-bold font-mono outline-none focus:border-amber-400/50 focus:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all uppercase tracking-widest"
            placeholder="unscramble..."
          />

          {/* Action buttons */}
          <div className="flex gap-3">
            <motion.button onClick={handleHint} disabled={hints <= 0 || hintUsed}
              whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              className="px-5 py-2 rounded-xl text-xs font-bold border border-blue-400/30 text-blue-400 bg-blue-400/[0.07] disabled:opacity-30 disabled:cursor-not-allowed">
              💡 Hint ({hints})
            </motion.button>
            <motion.button onClick={handleSkip}
              whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              className="px-5 py-2 rounded-xl text-xs font-bold border border-red-400/30 text-red-400 bg-red-400/[0.07]">
              ⏭ Skip
            </motion.button>
          </div>
        </div>
      )}

      {/* Overlays */}
      <AnimatePresence>
        {status !== "playing" && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm gap-5">
            {status === "idle" && (
              <div className="text-center space-y-2">
                <div className="text-5xl">🔀</div>
                <p className="text-2xl font-black text-white">Word Scramble</p>
                <p className="text-gray-400 text-sm max-w-xs text-center">Unscramble as many words as you can in 60 seconds. Build combos for bonus points!</p>
                <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
                  <span>🔥 Streak bonus</span><span>💡 3 hints</span><span>⏭ Skip anytime</span>
                </div>
              </div>
            )}
            {status === "finished" && (
              <div className="text-center space-y-2">
                <div className="text-5xl">{score >= 15 ? "🏆" : score >= 8 ? "⭐" : "💪"}</div>
                <p className="text-3xl font-black text-white">Time's Up!</p>
                <p className="text-gray-300">Score: <span className="text-amber-400 font-bold text-2xl">{score}</span></p>
                <p className="text-gray-500 text-sm">{score >= 15 ? "Amazing! Real word wizard!" : score >= 8 ? "Great job! Keep practicing!" : "Good try! You'll get faster!"}</p>
              </div>
            )}
            <motion.button onClick={startGame}
              whileHover={{ scale:1.06 }} whileTap={{ scale:0.95 }}
              className="px-8 py-3 rounded-xl font-bold text-black text-sm"
              style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)", boxShadow:"0 0 24px rgba(245,158,11,0.4)" }}>
              {status === "idle" ? "Start Game" : "Play Again"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
