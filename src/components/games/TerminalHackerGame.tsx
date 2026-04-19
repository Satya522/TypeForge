"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CHALLENGES = [
  { cmd: "decrypt_payload", hint: "Decrypt the payload to proceed", difficulty: 1 },
  { cmd: "bypass_firewall", hint: "Bypass the security firewall", difficulty: 1 },
  { cmd: "inject_rootkit", hint: "Inject the rootkit module", difficulty: 2 },
  { cmd: "crack_password", hint: "Crack the target password hash", difficulty: 2 },
  { cmd: "spoof_identity", hint: "Spoof network identity packet", difficulty: 2 },
  { cmd: "override_system", hint: "Override master system controls", difficulty: 3 },
  { cmd: "exfiltrate_data", hint: "Exfiltrate classified data", difficulty: 3 },
  { cmd: "nuke_mainframe", hint: "Execute mainframe shutdown sequence", difficulty: 3 },
  { cmd: "ghost_protocol_activate", hint: "Activate ghost protocol layer", difficulty: 4 },
  { cmd: "quantum_encryption_break", hint: "Break quantum encryption barrier", difficulty: 4 },
];

type LogLine = { id: number; text: string; color: string };
let logId = 0;

export default function TerminalHackerGame() {
  const [status, setStatus] = useState<"idle"|"playing"|"gameover"|"win">("idle");
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [typos, setTypos] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const logsRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const challenge = CHALLENGES[challengeIdx];
  const totalTime = challenge ? 5 + (5 - challenge.difficulty) * 3 : 10;

  const addLog = useCallback((text: string, color = "#39ff14") => {
    setLogs(prev => [...prev.slice(-30), { id: ++logId, text, color }]);
  }, []);

  const startGame = () => {
    setStatus("playing");
    setChallengeIdx(0);
    setInput("");
    setScore(0);
    setTypos(0);
    setAccuracy(100);
    setLogs([]);
    addLog("█ SYSTEM BREACH INITIATED █", "#f59e0b");
    addLog("Target: TypeForge Mainframe", "#9ca3af");
    addLog("Connection established... [ONLINE]", "#39ff14");
    addLog("──────────────────────────────", "#374151");
    setTimeout(() => {
      addLog(`> CMD [1/${CHALLENGES.length}]: Type the command to proceed`, "#38bdf8");
      inputRef.current?.focus();
    }, 600);
  };

  // Timer per challenge
  useEffect(() => {
    if (status !== "playing") return;
    const t = 5 + (5 - (challenge?.difficulty || 1)) * 3;
    setTimeLeft(t);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          addLog("✗ TIMEOUT — CONNECTION TERMINATED", "#ef4444");
          setStatus("gameover");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeIdx, status]);

  // Auto scroll logs
  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logs]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const target = challenge?.cmd || "";
    // Count typos (chars that don't match)
    let t = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== target[i]) t++;
    }
    setTypos(t);
    const acc = val.length > 0 ? Math.round(((val.length - t) / val.length) * 100) : 100;
    setAccuracy(acc);
    setInput(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const typed = input.trim();
    if (typed === challenge.cmd) {
      clearInterval(timerRef.current!);
      addLog(`✓ ${challenge.cmd} [EXECUTED]`, "#39ff14");
      addLog(`  → ${challenge.hint} ✓`, "#4ade80");
      setScore(s => s + Math.ceil(timeLeft * 10));
      setInput("");
      if (challengeIdx + 1 >= CHALLENGES.length) {
        addLog("──────────────────────────────", "#374151");
        addLog("█ MAINFRAME COMPROMISED █", "#f59e0b");
        addLog("All systems breached. Mission complete.", "#39ff14");
        setStatus("win");
      } else {
        const next = challengeIdx + 1;
        setChallengeIdx(next);
        addLog("──────────────────────────────", "#374151");
        addLog(`> CMD [${next+1}/${CHALLENGES.length}]: Next command loading...`, "#38bdf8");
      }
    } else {
      addLog(`✗ INVALID: "${typed}" — try again`, "#ef4444");
      setInput("");
    }
  };

  const current = challenge;
  const target = current?.cmd || "";
  const timerPct = (timeLeft / totalTime) * 100;
  const timerColor = timerPct > 60 ? "#39ff14" : timerPct > 30 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-green-500/20 bg-[#020a02] font-mono"
      style={{ boxShadow:"0 0 60px rgba(57,255,20,0.07)" }}>
      {/* CRT scanlines overlay */}
      <div className="pointer-events-none absolute inset-0 z-10" style={{
        backgroundImage:"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)"
      }} />

      {/* Header bar */}
      <div className="relative z-20 flex items-center justify-between px-4 py-2 bg-black/60 border-b border-green-500/20">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[11px] text-green-400 uppercase tracking-widest">TypeForge Terminal v2.0</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-gray-500">
          <span>Score: <span className="text-green-400 font-bold">{score}</span></span>
          <span>ACC: <span className="text-yellow-400">{accuracy}%</span></span>
          {status === "playing" && (
            <span className="font-bold" style={{ color: timerColor }}>{timeLeft}s</span>
          )}
        </div>
      </div>

      {/* Timer bar */}
      {status === "playing" && (
        <div className="relative z-20 h-1 bg-gray-800">
          <motion.div
            className="h-full transition-all duration-1000"
            style={{ width: `${timerPct}%`, background: timerColor, boxShadow:`0 0 8px ${timerColor}` }}
          />
        </div>
      )}

      {/* Log terminal */}
      <div ref={logsRef} className="relative z-20 h-[300px] overflow-y-auto px-4 py-3 space-y-0.5">
        {logs.map(l => (
          <div key={l.id} className="text-[12px] leading-5" style={{ color: l.color }}>
            {l.text}
          </div>
        ))}
        {status === "playing" && (
          <div className="mt-2">
            <div className="text-[11px] text-gray-500 mb-1">{current.hint}</div>
            <div className="flex gap-0 text-[13px] font-bold">
              {target.split("").map((ch, i) => {
                const typed = input[i];
                const color = typed === undefined ? "#4b5563" : typed === ch ? "#39ff14" : "#ef4444";
                return <span key={i} style={{ color }}>{ch}</span>;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      {status === "playing" && (
        <div className="relative z-20 border-t border-green-500/20 flex items-center gap-2 px-4 py-3 bg-black/40">
          <span className="text-green-400 text-sm">{">"}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            autoComplete="off" autoCorrect="off" spellCheck={false}
            className="flex-1 bg-transparent outline-none text-green-300 text-sm caret-green-400"
            placeholder="type command and press Enter..."
          />
          <span className="text-[10px] text-gray-600">{challengeIdx+1}/{CHALLENGES.length}</span>
        </div>
      )}

      {/* Idle/gameover/win overlay */}
      <AnimatePresence>
        {status !== "playing" && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm">
            {status === "idle" && (
              <div className="text-center space-y-3 mb-6">
                <p className="text-2xl font-black text-green-400 tracking-widest">TERMINAL HACKER</p>
                <p className="text-gray-400 text-sm max-w-xs">Type hacking commands exactly as shown within the time limit. 10 levels stand between you and mainframe control.</p>
              </div>
            )}
            {status === "gameover" && (
              <div className="text-center space-y-2 mb-6">
                <p className="text-4xl font-black text-red-500">ACCESS DENIED</p>
                <p className="text-gray-400">Score: <span className="text-green-400 font-bold">{score}</span> | Level: {challengeIdx+1}</p>
              </div>
            )}
            {status === "win" && (
              <div className="text-center space-y-2 mb-6">
                <p className="text-4xl font-black text-yellow-400 animate-pulse">HACKED ✓</p>
                <p className="text-gray-300">Final Score: <span className="text-green-400 font-bold">{score}</span></p>
                <p className="text-gray-500 text-sm">Accuracy: {accuracy}%</p>
              </div>
            )}
            <motion.button onClick={startGame}
              whileHover={{ scale:1.06 }} whileTap={{ scale:0.95 }}
              className="px-8 py-3 rounded-xl font-bold text-black text-sm border border-green-400"
              style={{ background:"linear-gradient(135deg,#39ff14,#00cc44)", boxShadow:"0 0 24px rgba(57,255,20,0.35)" }}
            >
              {status === "idle" ? "INITIATE BREACH" : "RETRY MISSION"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
