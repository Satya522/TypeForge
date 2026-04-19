"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORDS_BY_LEVEL = [
  ["cat","dog","sun","hat","run","big","cup","let","map","far"],
  ["jump","fast","bold","glow","word","type","melt","flow","snap","drop"],
  ["speed","flame","cycle","brave","pixel","sharp","night","ghost","trail","blaze"],
  ["typing","mirror","impact","blazing","current","science","keyword","testing","compose","flowing"],
  ["keyboard","quickfire","typewrite","freestyle","benchmark","precision","automatic","challenge","lightning","supersonic"],
];

const COLORS = ["#39ff14","#38bdf8","#f59e0b","#a855f7","#ec4899"];

function getWord(level: number): string {
  const pool = WORDS_BY_LEVEL[Math.min(level, WORDS_BY_LEVEL.length - 1)];
  return pool[Math.floor(Math.random() * pool.length)];
}

type Particle = { id: number; x: number; y: number; color: string; angle: number; };
let pid = 0;

export default function SpeedTypingGame() {
  const [status, setStatus] = useState<"idle"|"playing"|"finished">("idle");
  const [level, setLevel] = useState(0);
  const [word, setWord] = useState("");
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [wordsCount, setWordsCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const loadWord = (lv: number) => {
    setWord(getWord(lv));
    setInput("");
  };

  const startGame = () => {
    setStatus("playing");
    setScore(0); setLevel(0); setWordsCount(0); setStreak(0); setBestStreak(0); setTimeLeft(60);
    loadWord(0);
    inputRef.current?.focus();
  };

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

  const spawnParticles = (correct: boolean) => {
    const color = correct ? COLORS[Math.floor(Math.random() * COLORS.length)] : "#ef4444";
    const ps: Particle[] = Array.from({ length: 8 }, (_, i) => ({
      id: ++pid, x: 50, y: 50, color, angle: (360 / 8) * i
    }));
    setParticles(prev => [...prev, ...ps]);
    setTimeout(() => setParticles(prev => prev.filter(p => !ps.find(x => x.id === p.id))), 700);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    setInput(val);
    if (val === word) {
      const newStreak = streak + 1;
      const newLevel = Math.min(Math.floor(wordsCount / 5), WORDS_BY_LEVEL.length - 1);
      const pts = (newLevel + 1) * (newStreak >= 5 ? 3 : newStreak >= 3 ? 2 : 1);
      setScore(s => s + pts);
      setWordsCount(w => w + 1);
      setStreak(newStreak);
      setBestStreak(b => Math.max(b, newStreak));
      setLevel(newLevel);
      spawnParticles(true);
      loadWord(newLevel);
    }
  };

  const timerPct = (timeLeft / 60) * 100;
  const timerColor = timerPct > 50 ? "#39ff14" : timerPct > 25 ? "#f59e0b" : "#ef4444";
  const accentColor = COLORS[level % COLORS.length];
  const levelLabel = ["EASY","MEDIUM","HARD","EXPERT","LEGEND"][Math.min(level, 4)];

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-white/10 bg-[#050805]">
      {/* Particles */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <AnimatePresence>
          {particles.map(p => (
            <motion.div key={p.id}
              initial={{ x:"50%", y:"45%", scale:1, opacity:1 }}
              animate={{
                x: `calc(50% + ${Math.cos(p.angle * Math.PI/180) * 80}px)`,
                y: `calc(45% + ${Math.sin(p.angle * Math.PI/180) * 80}px)`,
                scale:0, opacity:0
              }}
              transition={{ duration:0.6, ease:"easeOut" }}
              className="absolute w-2 h-2 rounded-full"
              style={{ background: p.color, boxShadow:`0 0 6px ${p.color}` }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 bg-gray-800">
        <motion.div className="h-full transition-all duration-1000"
          style={{ width:`${timerPct}%`, background:timerColor, boxShadow:`0 0 8px ${timerColor}` }} />
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-black/40 border-b border-white/[0.05]">
        <div className="flex items-center gap-4 text-xs">
          <span className="font-bold uppercase tracking-widest text-[11px]" style={{ color: accentColor }}>⚡ {levelLabel}</span>
          {streak >= 3 && <span className="text-orange-400 font-bold">🔥 ×{streak}</span>}
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>Words: <span className="text-white font-bold">{wordsCount}</span></span>
          <span>Score: <span className="font-bold" style={{ color: accentColor }}>{score}</span></span>
          <span className="font-bold text-sm" style={{ color: timerColor }}>{timeLeft}s</span>
        </div>
      </div>

      {/* Game area */}
      {status === "playing" && (
        <div className="flex flex-col items-center justify-center h-[calc(100%-3.5rem)] gap-6 px-6">
          {/* Level progress dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${i <= level ? "opacity-100" : "opacity-20 bg-gray-700"}`}
                style={{ background: i <= level ? accentColor : undefined, boxShadow: i === level ? `0 0 8px ${accentColor}` : "none" }} />
            ))}
          </div>

          {/* Word display */}
          <AnimatePresence mode="wait">
            <motion.div key={word}
              initial={{ opacity:0, y:30, scale:0.8 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:-30, scale:1.2 }}
              transition={{ type:"spring", stiffness:300, damping:20 }}
              className="text-5xl font-black font-mono tracking-widest"
            >
              {word.split("").map((ch, i) => {
                const t = input[i];
                const correct = t === ch;
                const typed = t !== undefined;
                const color = typed ? (correct ? accentColor : "#ef4444") : "#374151";
                return (
                  <span key={i} style={{ color, textShadow: typed && correct ? `0 0 15px ${accentColor}` : "none" }}>
                    {ch}
                  </span>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Input */}
          <input
            ref={inputRef}
            value={input}
            onChange={handleInput}
            autoComplete="off" autoCorrect="off" spellCheck={false}
            className="w-full max-w-sm text-center bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-3.5 text-white text-xl font-bold font-mono outline-none transition-all"
            style={{ caretColor: accentColor, borderColor: input.length > 0 ? `${accentColor}44` : "rgba(255,255,255,0.1)", boxShadow: input.length > 0 ? `0 0 20px ${accentColor}18` : "none" }}
            placeholder="type the word..."
          />

          <p className="text-[11px] text-gray-600">Words/min unlocks harder level every 5 words</p>
        </div>
      )}

      {/* Overlays */}
      <AnimatePresence>
        {status !== "playing" && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm gap-5">
            {status === "idle" && (
              <div className="text-center space-y-2">
                <div className="text-5xl">⚡</div>
                <p className="text-2xl font-black text-white">Speed Typing</p>
                <p className="text-gray-400 text-sm max-w-xs text-center">Type as many words as possible in 60 seconds. Words get harder as your level increases!</p>
                <div className="flex justify-center gap-3 mt-2">
                  {["EASY","MED","HARD","EXP","LEG"].map((l, i) => (
                    <span key={l} className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background:`${COLORS[i]}20`, color:COLORS[i] }}>{l}</span>
                  ))}
                </div>
              </div>
            )}
            {status === "finished" && (
              <div className="text-center space-y-2">
                <div className="text-4xl">{score >= 100 ? "🏆" : score >= 50 ? "⭐" : "💪"}</div>
                <p className="text-3xl font-black text-white">Game Over!</p>
                <div className="flex gap-6 justify-center mt-2">
                  <div className="text-center"><p className="text-2xl font-black text-green-400">{score}</p><p className="text-[11px] text-gray-500">Score</p></div>
                  <div className="text-center"><p className="text-2xl font-black text-blue-400">{wordsCount}</p><p className="text-[11px] text-gray-500">Words</p></div>
                  <div className="text-center"><p className="text-2xl font-black text-orange-400">{bestStreak}</p><p className="text-[11px] text-gray-500">Best Streak</p></div>
                </div>
                <p className="text-[11px] text-gray-500">Level reached: {levelLabel}</p>
              </div>
            )}
            <motion.button onClick={startGame}
              whileHover={{ scale:1.06 }} whileTap={{ scale:0.95 }}
              className="px-8 py-3 rounded-xl font-bold text-black text-sm mt-2"
              style={{ background:`linear-gradient(135deg,${accentColor},${COLORS[(level+1)%COLORS.length]})`, boxShadow:`0 0 24px ${accentColor}66` }}>
              {status === "idle" ? "Start Game ⚡" : "Play Again"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
