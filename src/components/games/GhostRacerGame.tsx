"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GHOST_WPM = 55; // Ghost typing speed

const PASSAGES = [
  "the quick brown fox jumps over the lazy dog and runs away into the forest",
  "speed and accuracy are the twin pillars of mastery in the art of typing",
  "every keystroke brings you closer to the finish line keep your fingers dancing",
  "practice makes perfect the more you type the faster your fingers will fly",
  "focus your mind clear your thoughts and let the words flow through your fingertips",
];

function calcWpm(chars: number, elapsedMs: number) {
  if (elapsedMs < 500) return 0;
  return Math.round((chars / 5) / (elapsedMs / 60000));
}

export default function GhostRacerGame() {
  const [status, setStatus] = useState<"idle"|"countdown"|"playing"|"finished">("idle");
  const [passageIdx, setPassageIdx] = useState(0);
  const [input, setInput] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [ghostPos, setGhostPos] = useState(0); // chars typed by ghost
  const [won, setWon] = useState(false);
  const [playerWpm, setPlayerWpm] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const ghostRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const passage = PASSAGES[passageIdx];
  const totalChars = passage.length;

  const startGame = useCallback(() => {
    setStatus("countdown");
    setCountdown(3);
    setInput("");
    setGhostPos(0);
    setElapsed(0);
    setWon(false);
    setPlayerWpm(0);
    let c = 3;
    const cdTimer = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(cdTimer);
        setStatus("playing");
        const t = Date.now();
        setStartTime(t);
        inputRef.current?.focus();
      }
    }, 1000);
  }, []);

  // Elapsed time tracker
  useEffect(() => {
    if (status !== "playing") { clearInterval(timerRef.current!); return; }
    timerRef.current = setInterval(() => setElapsed(Date.now() - startTime), 100);
    return () => clearInterval(timerRef.current!);
  }, [status, startTime]);

  // Ghost movement — types at GHOST_WPM chars/min
  const ghostCharsPerMs = (GHOST_WPM * 5) / 60000;
  useEffect(() => {
    if (status !== "playing") { clearInterval(ghostRef.current!); return; }
    ghostRef.current = setInterval(() => {
      setGhostPos(prev => {
        const next = Math.min(totalChars, prev + ghostCharsPerMs * 100);
        if (next >= totalChars) clearInterval(ghostRef.current!);
        return next;
      });
    }, 100);
    return () => clearInterval(ghostRef.current!);
  }, [status, totalChars, ghostCharsPerMs]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status !== "playing") return;
    const val = e.target.value;
    // Only allow correctly typed chars
    let valid = "";
    for (let i = 0; i < val.length; i++) {
      if (val[i] === passage[i]) valid += val[i];
      else { valid += val[i]; break; } // Allow typos but show red
    }
    setInput(val);
    const wpm = calcWpm(val.length, Date.now() - startTime);
    setPlayerWpm(wpm);

    if (val.length >= totalChars && val === passage) {
      clearInterval(timerRef.current!);
      clearInterval(ghostRef.current!);
      const playerAhead = val.length > ghostPos;
      setWon(playerAhead);
      setStatus("finished");
    }
  };

  const playerPos = input.length;
  const playerPct = Math.min(100, (playerPos / totalChars) * 100);
  const ghostPct = Math.min(100, (ghostPos / totalChars) * 100);
  const isAhead = playerPct >= ghostPct;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#050810]"
      style={{ backgroundImage:"radial-gradient(ellipse at 20% 50%, rgba(56,189,248,0.05), transparent 60%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-black/40 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <span className="text-lg">👻</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">Ghost Racer</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          {status === "playing" && <>
            <span>You: <span className="text-blue-400 font-bold">{playerWpm} WPM</span></span>
            <span>Ghost: <span className="text-purple-400 font-bold">{GHOST_WPM} WPM</span></span>
          </>}
        </div>
      </div>

      {/* Race track */}
      <div className="px-5 py-5 space-y-3">
        {/* You */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span className="text-blue-400 font-bold">YOU 🚗</span>
            <span>{Math.round(playerPct)}%</span>
          </div>
          <div className="relative h-8 bg-white/[0.03] rounded-full border border-blue-500/20 overflow-hidden">
            <motion.div className="absolute left-0 inset-y-0 rounded-full"
              style={{ width:`${playerPct}%`, background:"linear-gradient(90deg,#38bdf8,#0ea5e9)",
                boxShadow:"0 0 16px rgba(56,189,248,0.5)" }}
              transition={{ type:"spring", stiffness:200, damping:30 }}
            />
            <div className="absolute inset-y-0 flex items-center" style={{ left:`calc(${playerPct}% - 1.2rem)` }}>
              <span className="text-lg">🚗</span>
            </div>
          </div>
        </div>

        {/* Ghost */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span className="text-purple-400 font-bold">GHOST 👻</span>
            <span>{Math.round(ghostPct)}%</span>
          </div>
          <div className="relative h-8 bg-white/[0.03] rounded-full border border-purple-500/20 overflow-hidden">
            <motion.div className="absolute left-0 inset-y-0 rounded-full"
              style={{ width:`${ghostPct}%`, background:"linear-gradient(90deg,#a855f7,#9333ea)",
                boxShadow:"0 0 16px rgba(168,85,247,0.4)" }}
            />
            <div className="absolute inset-y-0 flex items-center" style={{ left:`calc(${ghostPct}% - 1.2rem)` }}>
              <span className="text-lg">👻</span>
            </div>
          </div>
        </div>

        {/* Status badge */}
        {status === "playing" && (
          <div className="flex justify-center">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${isAhead ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}>
              {isAhead ? "⚡ You're ahead!" : "👻 Ghost is ahead!"}
            </span>
          </div>
        )}

        {/* Passage */}
        <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] font-mono text-sm leading-7 min-h-[80px]">
          {passage.split("").map((ch, i) => {
            let color = "#4b5563"; // untyped gray
            if (i < input.length) {
              color = input[i] === ch ? "#ffffff" : "#ef4444";
            }
            if (i === input.length) color = "#38bdf8"; // cursor position highlight
            return (
              <span key={i} style={{ color, textShadow: i === input.length ? "0 0 8px #38bdf8" : "none" }}>
                {ch}
              </span>
            );
          })}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          value={input}
          onChange={handleInput}
          disabled={status !== "playing"}
          autoComplete="off" autoCorrect="off" spellCheck={false}
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono outline-none focus:border-blue-400/50 transition-all disabled:opacity-30"
          placeholder={status === "playing" ? "Start typing..." : ""}
        />
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {(status === "idle" || status === "countdown" || status === "finished") && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-5">
            {status === "idle" && (
              <>
                <div className="text-center space-y-2">
                  <span className="text-5xl">👻</span>
                  <p className="text-2xl font-black text-white">Ghost Racer</p>
                  <p className="text-gray-400 text-sm max-w-xs text-center">Race against the ghost typist at {GHOST_WPM} WPM. Beat it to win!</p>
                </div>
                <div className="flex gap-2">
                  {PASSAGES.map((_, i) => (
                    <button key={i} onClick={() => setPassageIdx(i)}
                      className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all ${i === passageIdx ? "bg-blue-500 text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"}`}>{i+1}</button>
                  ))}
                </div>
                <motion.button onClick={startGame}
                  whileHover={{ scale:1.06 }} whileTap={{ scale:0.95 }}
                  className="px-8 py-3 rounded-xl font-bold text-black text-sm"
                  style={{ background:"linear-gradient(135deg,#38bdf8,#0ea5e9)", boxShadow:"0 0 24px rgba(56,189,248,0.4)" }}>
                  Start Race 🏁
                </motion.button>
              </>
            )}
            {status === "countdown" && (
              <motion.div key={countdown} initial={{ scale:3, opacity:0 }} animate={{ scale:1, opacity:1 }}
                exit={{ scale:0.5, opacity:0 }} transition={{ duration:0.5 }}>
                <p className="text-8xl font-black text-white">{countdown > 0 ? countdown : "GO!"}</p>
              </motion.div>
            )}
            {status === "finished" && (
              <div className="text-center space-y-3">
                <div className="text-5xl">{won ? "🏆" : "😤"}</div>
                <p className="text-3xl font-black" style={{ color: won ? "#39ff14" : "#ef4444" }}>
                  {won ? "YOU WIN!" : "GHOST WINS!"}
                </p>
                <p className="text-gray-400">Your WPM: <span className="text-blue-400 font-bold">{playerWpm}</span> | Ghost: <span className="text-purple-400 font-bold">{GHOST_WPM}</span></p>
                <div className="flex gap-3 justify-center mt-4">
                  <motion.button onClick={startGame}
                    whileHover={{ scale:1.06 }} whileTap={{ scale:0.95 }}
                    className="px-6 py-2.5 rounded-xl font-bold text-black text-sm"
                    style={{ background:"linear-gradient(135deg,#38bdf8,#0ea5e9)" }}>
                    Race Again
                  </motion.button>
                  <motion.button onClick={() => { setPassageIdx((passageIdx+1)%PASSAGES.length); setStatus("idle"); }}
                    whileHover={{ scale:1.06 }} whileTap={{ scale:0.95 }}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white/10 text-white">
                    New Track
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
