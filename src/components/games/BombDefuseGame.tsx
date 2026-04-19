"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOMB_PHRASES = [
  "deactivate", "circuit", "override", "disable", "defuse", "trigger",
  "protocol", "sequence", "quantum", "voltage", "wiring", "junction",
  "explosion", "failsafe", "critical", "lockdown", "shutdown", "emergency",
  "override_core", "system_abort", "meltdown_stop", "blast_shield",
  "primary_circuit", "emergency_halt", "dark_matter_off"
];

const LEVELS = [
  { time: 20, words: 3, label: "LEVEL 1 — EASY" },
  { time: 16, words: 4, label: "LEVEL 2 — MEDIUM" },
  { time: 12, words: 5, label: "LEVEL 3 — HARD" },
  { time: 9,  words: 6, label: "LEVEL 4 — INSANE" },
  { time: 7,  words: 7, label: "LEVEL 5 — DEATH" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function BombDefuseGame() {
  const [status, setStatus] = useState<"idle"|"playing"|"exploded"|"defused">("idle");
  const [levelIdx, setLevelIdx] = useState(0);
  const [queue, setQueue] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const level = LEVELS[levelIdx];

  const startRound = (lIdx: number) => {
    const lvl = LEVELS[lIdx];
    const words = shuffle(BOMB_PHRASES).slice(0, lvl.words);
    setQueue(words.slice(1));
    setCurrentWord(words[0]);
    setInput("");
    setTimeLeft(lvl.time);
    setStatus("playing");
    inputRef.current?.focus();
  };

  const startGame = () => {
    setScore(0);
    setLevelIdx(0);
    startRound(0);
  };

  // Timer
  useEffect(() => {
    if (status !== "playing") { clearInterval(timerRef.current!); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setShake(true);
          setTimeout(() => setShake(false), 800);
          setStatus("exploded");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [status, currentWord]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val.trim() === currentWord) {
      // Correct!
      setScore(s => s + Math.ceil(timeLeft * 5));
      setInput("");
      if (queue.length === 0) {
        // Level complete
        clearInterval(timerRef.current!);
        if (levelIdx + 1 >= LEVELS.length) {
          setStatus("defused");
        } else {
          const next = levelIdx + 1;
          setLevelIdx(next);
          setTimeout(() => startRound(next), 800);
        }
      } else {
        setCurrentWord(queue[0]);
        setQueue(q => q.slice(1));
        setTimeLeft(level.time); // Reset timer for next word
      }
    }
  };

  const timerPct = (timeLeft / level.time) * 100;
  const timerColor = timerPct > 50 ? "#39ff14" : timerPct > 25 ? "#f59e0b" : "#ef4444";
  const wordsDone = level.words - queue.length - 1;

  return (
    <div className={`relative w-full h-[520px] rounded-2xl overflow-hidden border bg-[#080508] ${shake ? "animate-bounce" : ""}`}
      style={{ borderColor: timerPct < 25 ? "#ef4444" : "#ffffff15",
        boxShadow: timerPct < 25 ? "0 0 40px rgba(239,68,68,0.3)" : "0 0 40px rgba(0,0,0,0.5)" }}>

      {/* Header */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-3 bg-black/50 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💣</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-red-400">Bomb Defuse</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>Score: <span className="text-white font-bold">{score}</span></span>
          {status === "playing" && <span className="text-gray-500 text-[11px]">{level.label}</span>}
        </div>
      </div>

      {/* Game content */}
      {status === "playing" && (
        <div className="absolute inset-0 pt-14 flex flex-col items-center justify-center gap-6 px-6">
          {/* Timer ring */}
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1a1a1a" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                stroke={timerColor}
                strokeDasharray={`${2*Math.PI*42}`}
                strokeDashoffset={`${2*Math.PI*42 * (1 - timerPct/100)}`}
                strokeLinecap="round"
                style={{ transition:"stroke-dashoffset 1s linear, stroke 0.5s", filter:`drop-shadow(0 0 6px ${timerColor})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black" style={{ color: timerColor }}>{timeLeft}</span>
              <span className="text-[9px] text-gray-500 uppercase tracking-widest">seconds</span>
            </div>
          </div>

          {/* Word progress */}
          <div className="flex gap-2">
            {Array.from({ length: level.words }).map((_, i) => (
              <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-300 ${i < wordsDone ? "bg-green-400" : i === wordsDone ? "bg-yellow-400 animate-pulse" : "bg-gray-700"}`} />
            ))}
          </div>

          {/* Current word */}
          <div className="text-center">
            <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-2">Type to defuse:</p>
            <div className="flex gap-0 justify-center">
              {currentWord.split("").map((ch, i) => {
                const t = input[i];
                const color = t === undefined ? "#6b7280" : t === ch ? "#39ff14" : "#ef4444";
                return (
                  <span key={i} className="text-2xl font-black font-mono" style={{ color, textShadow: t === ch ? `0 0 8px ${color}` : "none" }}>{ch}</span>
                );
              })}
            </div>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            value={input}
            onChange={handleInput}
            autoComplete="off" autoCorrect="off" spellCheck={false}
            className="w-full max-w-sm text-center bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono outline-none focus:border-red-400/50 focus:shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all"
            placeholder="Type the word..."
          />
        </div>
      )}

      {/* Overlays */}
      <AnimatePresence>
        {status !== "playing" && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-black/85 backdrop-blur-sm">
            {status === "idle" && (
              <div className="text-center space-y-2">
                <div className="text-6xl mb-2">💣</div>
                <p className="text-2xl font-black text-white">Bomb Defuse</p>
                <p className="text-gray-400 text-sm max-w-xs text-center">Type the exact words before the timer runs out. 5 escalating levels. One wrong delay and it's over!</p>
              </div>
            )}
            {status === "exploded" && (
              <div className="text-center space-y-2">
                <div className="text-6xl mb-2 animate-bounce">💥</div>
                <p className="text-4xl font-black text-red-500">BOOM!</p>
                <p className="text-gray-400">Score: <span className="text-white font-bold">{score}</span> | Level {levelIdx+1}</p>
              </div>
            )}
            {status === "defused" && (
              <div className="text-center space-y-2">
                <div className="text-6xl mb-2">✅</div>
                <p className="text-4xl font-black text-green-400">DEFUSED!</p>
                <p className="text-gray-300">Final Score: <span className="text-green-400 font-bold">{score}</span></p>
              </div>
            )}
            <motion.button onClick={startGame}
              whileHover={{ scale:1.06 }} whileTap={{ scale:0.95 }}
              className="px-8 py-3 rounded-xl font-bold text-black text-sm"
              style={{ background:status==="defused"?"linear-gradient(135deg,#39ff14,#00cc44)":"linear-gradient(135deg,#ef4444,#b91c1c)", boxShadow:"0 0 24px rgba(239,68,68,0.3)" }}
            >
              {status === "idle" ? "Start Mission" : status==="defused"?"Play Again 🏆":"Try Again 💣"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
