"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = [
  "forge","type","speed","code","key","flow","word","beat",
  "fast","skill","mind","sharp","neon","dash","pulse","wave",
  "zone","burn","lock","fire","grid","sync","loop","data",
  "hack","byte","core","apex","flux","node","bolt","pixel",
  "storm","swift","click","press","drop","spin","race","aim",
  "hit","run","win","push","trail","pixel","ghost","phase"
];

type FallingWord = {
  id: number;
  word: string;
  x: number; // percent
  y: number; // percent
  speed: number;
  color: string;
};

const COLORS = ["#39ff14","#38bdf8","#f59e0b","#a855f7","#ec4899","#22d3ee"];

let idCounter = 0;

export default function WordRainGame() {
  const [status, setStatus] = useState<"idle"|"playing"|"gameover">("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [input, setInput] = useState("");
  const [words, setWords] = useState<FallingWord[]>([]);
  const [destroyed, setDestroyed] = useState<number[]>([]);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const fallRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const spawnWord = useCallback(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    setWords(prev => [...prev, {
      id: ++idCounter,
      word,
      x: 5 + Math.random() * 82,
      y: 0,
      speed: 0.3 + level * 0.12,
      color,
    }]);
  }, [level]);

  const startGame = () => {
    setStatus("playing");
    setScore(0); setLives(3); setWords([]); setCombo(0); setLevel(1); setInput("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (status !== "playing") return;
    intervalRef.current = setInterval(spawnWord, Math.max(600, 1800 - level * 150));
    return () => clearInterval(intervalRef.current!);
  }, [status, spawnWord, level]);

  // Move words down
  useEffect(() => {
    if (status !== "playing") return;
    fallRef.current = setInterval(() => {
      setWords(prev => {
        const next: FallingWord[] = [];
        let missed = 0;
        for (const w of prev) {
          const ny = w.y + w.speed;
          if (ny >= 92) { missed++; }
          else { next.push({ ...w, y: ny }); }
        }
        if (missed > 0) {
          setLives(l => {
            const nl = l - missed;
            if (nl <= 0) { setStatus("gameover"); return 0; }
            return nl;
          });
        }
        return next;
      });
    }, 80);
    return () => clearInterval(fallRef.current!);
  }, [status]);

  // Level up
  useEffect(() => {
    if (score > 0 && score % 10 === 0) setLevel(l => Math.min(l + 1, 8));
  }, [score]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    const trimmed = val.trim().toLowerCase();
    const match = words.find(w => w.word === trimmed);
    if (match) {
      setDestroyed(d => [...d, match.id]);
      setWords(prev => prev.filter(w => w.id !== match.id));
      setInput("");
      setScore(s => s + 1 + combo);
      setCombo(c => c + 1);
      setTimeout(() => setDestroyed(d => d.filter(id => id !== match.id)), 400);
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-white/10 bg-[#050805] select-none"
      style={{ backgroundImage:"radial-gradient(ellipse at 50% 0%, rgba(57,255,20,0.06), transparent 60%)" }}
    >
      {/* Header */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-3 bg-black/40 backdrop-blur-sm border-b border-white/[0.05]">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-green-400">Word Rain</span>
          <span className="text-xs text-gray-400">Lv.{level}</span>
          {combo > 1 && <span className="text-xs font-bold text-yellow-400 animate-pulse">×{combo} COMBO!</span>}
        </div>
        <div className="flex items-center gap-5">
          <span className="text-sm font-bold text-white">Score: <span className="text-green-400">{score}</span></span>
          <div className="flex gap-1">
            {[1,2,3].map(i => (
              <span key={i} className={`text-lg ${lives >= i ? "text-red-500" : "text-gray-700"}`}>♥</span>
            ))}
          </div>
        </div>
      </div>

      {/* Game area */}
      <div className="absolute inset-0 pt-12">
        <AnimatePresence>
          {words.map(w => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5, y: -20 }}
              style={{ left: `${w.x}%`, top: `${w.y}%`, color: w.color, position:"absolute" }}
              className="text-sm font-bold font-mono px-2 py-0.5 rounded border"
              css-border-color={w.color}
              // @ts-ignore
              style={{ left: `${w.x}%`, top: `${w.y}%`, color: w.color, position:"absolute", borderColor: `${w.color}44`, background: `${w.color}10` }}
            >
              {w.word}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Idle / Gameover overlay */}
      {status !== "playing" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          {status === "gameover" && (
            <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
              className="text-center mb-6">
              <p className="text-5xl font-black text-red-500 mb-2">GAME OVER</p>
              <p className="text-gray-400 text-lg">Final Score: <span className="text-green-400 font-bold">{score}</span></p>
            </motion.div>
          )}
          {status === "idle" && (
            <div className="text-center mb-6">
              <p className="text-3xl font-black text-white mb-2">Word Rain</p>
              <p className="text-gray-400 text-sm max-w-xs text-center">Type the falling words before they hit the ground. Miss 3 and it's game over!</p>
            </div>
          )}
          <motion.button
            onClick={startGame}
            whileHover={{ scale:1.08 }} whileTap={{ scale:0.95 }}
            className="mt-4 px-8 py-3 rounded-2xl font-bold text-black text-sm"
            style={{ background:"linear-gradient(135deg,#39ff14,#00cc44)", boxShadow:"0 0 30px rgba(57,255,20,0.4)" }}
          >
            {status === "gameover" ? "Play Again" : "Start Game"} ▶
          </motion.button>
        </div>
      )}

      {/* Input */}
      {status === "playing" && (
        <div className="absolute bottom-0 inset-x-0 z-20 px-5 py-3 bg-black/50 backdrop-blur-sm border-t border-white/[0.05]">
          <input
            ref={inputRef}
            value={input}
            onChange={handleInput}
            placeholder="Type the falling word..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full bg-transparent outline-none text-white text-sm font-mono placeholder-gray-600 caret-green-400"
          />
        </div>
      )}
    </div>
  );
}
