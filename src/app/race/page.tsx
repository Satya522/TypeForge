"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flag, Gauge, Trophy, Zap, Target, Clock, Users, RotateCcw,
  ChevronRight, Crown, Medal, Flame, Sparkles, Timer
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

// ── Race texts ──
const RACE_TEXTS = [
  "The fastest typists focus on accuracy before speed. Precision builds neural pathways that raw speed cannot. Keep your fingers anchored on the home row and let the keys come to you.",
  "In the world of competitive typing, every millisecond counts. The best racers develop a rhythm that flows naturally from word to word. They do not rush; they glide across the keyboard with practiced ease.",
  "Programming requires a unique kind of typing skill. Brackets, semicolons, and special characters demand finger reaches that prose typists never encounter. Mastering these symbols is what separates a coder from a true developer.",
  "TypeForge was built to transform how people interact with their keyboards. From beginners learning the home row to elite typists chasing records, every feature is designed to make practice feel like play.",
  "The quick brown fox jumps over the lazy dog. This classic pangram uses every letter of the English alphabet at least once. Typists have used it for over a century to test their speed and accuracy.",
];

// ── Simulated opponent profiles ──
const OPPONENTS = [
  { name: 'NeonWraith', avatar: '👻', baseWpm: 65, color: '#ff6b35', rank: 'Gold' },
  { name: 'ByteStorm', avatar: '⚡', baseWpm: 55, color: '#06b6d4', rank: 'Silver' },
  { name: 'TypeNinja', avatar: '🥷', baseWpm: 75, color: '#a855f7', rank: 'Platinum' },
  { name: 'KeyPhantom', avatar: '🔮', baseWpm: 45, color: '#fbbf24', rank: 'Bronze' },
];

type RacePhase = 'lobby' | 'countdown' | 'racing' | 'finished';

interface Racer {
  id: string;
  name: string;
  avatar: string;
  color: string;
  rank: string;
  progress: number; // 0-100
  wpm: number;
  finished: boolean;
  finishTime?: number;
  isPlayer: boolean;
}

export default function RacePage() {
  const [phase, setPhase] = useState<RacePhase>('lobby');
  const [countdown, setCountdown] = useState(3);
  const [raceText, setRaceText] = useState('');
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [totalKeys, setTotalKeys] = useState(0);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [finishOrder, setFinishOrder] = useState<string[]>([]);
  const [liveWPM, setLiveWPM] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // ── Join & start race ──
  const joinRace = useCallback(() => {
    const text = RACE_TEXTS[Math.floor(Math.random() * RACE_TEXTS.length)];
    setRaceText(text);
    setTyped('');
    setErrors(0);
    setTotalKeys(0);
    setLiveWPM(0);
    setStartTime(null);
    setFinishOrder([]);

    // Build racer list
    const selected = OPPONENTS.sort(() => Math.random() - 0.5).slice(0, 3);
    const playerRacer: Racer = {
      id: 'player',
      name: 'You',
      avatar: '🚀',
      color: '#39FF14',
      rank: 'Challenger',
      progress: 0,
      wpm: 0,
      finished: false,
      isPlayer: true,
    };
    const opponentRacers: Racer[] = selected.map((o, i) => ({
      id: `opp-${i}`,
      name: o.name,
      avatar: o.avatar,
      color: o.color,
      rank: o.rank,
      progress: 0,
      wpm: 0,
      finished: false,
      isPlayer: false,
      baseWpm: o.baseWpm,
    }));

    setRacers([playerRacer, ...opponentRacers]);
    setPhase('countdown');
    setCountdown(3);
  }, []);

  // ── Countdown Timer ──
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('racing');
      setStartTime(Date.now());
      inputRef.current?.focus();
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  // ── AI Opponent Simulation ──
  useEffect(() => {
    if (phase !== 'racing') return;
    const interval = setInterval(() => {
      setRacers(prev => prev.map(r => {
        if (r.isPlayer || r.finished) return r;
        const baseWpm = (r as any).baseWpm || 50;
        const variation = (Math.random() - 0.3) * 8;
        const wpm = baseWpm + variation;
        // chars per second from WPM
        const cps = (wpm * 5) / 60;
        // progress is based on total characters
        const charsTyped = (r.progress / 100) * raceText.length + cps * 0.2;
        const newProgress = Math.min((charsTyped / raceText.length) * 100, 100);
        const justFinished = newProgress >= 100 && !r.finished;

        if (justFinished) {
          setFinishOrder(prev => [...prev, r.id]);
        }

        return {
          ...r,
          progress: newProgress,
          wpm: Math.round(wpm),
          finished: newProgress >= 100,
          finishTime: justFinished ? Date.now() : r.finishTime,
        };
      }));
    }, 200);
    return () => clearInterval(interval);
  }, [phase, raceText]);

  // ── Live WPM computation ──
  useEffect(() => {
    if (!startTime || phase !== 'racing') return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 60000;
      if (elapsed > 0 && typed.length > 0) {
        const wpm = Math.round((typed.length / 5) / elapsed);
        setLiveWPM(wpm);
        // Update player racer
        setRacers(prev => prev.map(r =>
          r.isPlayer ? { ...r, wpm, progress: (typed.length / raceText.length) * 100 } : r
        ));
      }
    }, 200);
    return () => clearInterval(interval);
  }, [startTime, typed, phase, raceText]);

  // ── Typing handler ──
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (phase !== 'racing') return;
    if (e.key === 'Tab') { e.preventDefault(); return; }

    const playerRacer = racers.find(r => r.isPlayer);
    if (playerRacer?.finished) return;

    if (e.key === 'Backspace') {
      setTyped(prev => prev.slice(0, -1));
      return;
    }

    if (e.key.length !== 1) return;

    setTotalKeys(prev => prev + 1);
    const expected = raceText[typed.length];

    if (e.key === expected) {
      const newTyped = typed + e.key;
      setTyped(newTyped);

      // Check if player finished
      if (newTyped.length === raceText.length) {
        setFinishOrder(prev => [...prev, 'player']);
        setRacers(prev => prev.map(r =>
          r.isPlayer ? { ...r, finished: true, finishTime: Date.now(), progress: 100 } : r
        ));
        // Check if all done
        const allDone = racers.every(r => r.isPlayer ? true : r.finished);
        if (allDone) setPhase('finished');
        else setTimeout(() => setPhase('finished'), 3000); // Wait for stragglers
      }
    } else {
      setErrors(prev => prev + 1);
    }
  };

  // Auto scroll text
  useEffect(() => {
    if (!textContainerRef.current) return;
    const caretEl = textContainerRef.current.querySelector('[data-caret="true"]');
    if (caretEl) {
      caretEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
  }, [typed]);

  // ── Finish check ──
  useEffect(() => {
    if (phase !== 'racing') return;
    const allDone = racers.every(r => r.finished);
    if (allDone) setPhase('finished');
  }, [racers, phase]);

  const accuracy = totalKeys > 0 ? Math.round(((totalKeys - errors) / totalKeys) * 100) : 100;
  const playerRank = finishOrder.indexOf('player') + 1;
  const elapsed = startTime ? ((phase === 'finished' ? (racers.find(r => r.isPlayer)?.finishTime || Date.now()) : Date.now()) - startTime) / 1000 : 0;

  // Sort racers by progress for display
  const sortedRacers = useMemo(() => [...racers].sort((a, b) => b.progress - a.progress), [racers]);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <main className="flex-1 w-full pt-28 pb-10 px-4 sm:px-8 mx-auto max-w-[1200px]">

        {/* ── LOBBY ── */}
        {phase === 'lobby' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            {/* Hero */}
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-accent-300/10 blur-[100px] rounded-full" />
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative text-8xl"
              >
                🏎️
              </motion.div>
            </div>

            <h1 className="text-5xl font-black text-white tracking-tight mb-3">
              Typing <span className="text-accent-300">Race</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md mb-10">
              Compete against AI opponents in a real-time typing race. Type fast, type clean. First to finish wins.
            </p>

            {/* Stats preview */}
            <div className="flex gap-4 mb-10 flex-wrap justify-center">
              {[
                { icon: <Users className="w-4 h-4" />, label: '4 Players', color: '#39FF14' },
                { icon: <Timer className="w-4 h-4" />, label: 'Real-time', color: '#06b6d4' },
                { icon: <Trophy className="w-4 h-4" />, label: 'Rankings', color: '#fbbf24' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <span style={{ color: item.color }}>{item.icon}</span>
                  <span className="text-sm font-bold text-gray-300">{item.label}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={joinRace}
              className="flex items-center gap-3 rounded-2xl bg-accent-300 px-10 py-4 text-lg font-black text-black shadow-[0_0_40px_rgba(57,255,20,0.3)] transition-all hover:shadow-[0_0_60px_rgba(57,255,20,0.5)]"
            >
              <Flag className="w-5 h-5" /> Start Race
            </motion.button>
          </motion.div>
        )}

        {/* ── COUNTDOWN ── */}
        {phase === 'countdown' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'backOut' }}
                className="relative"
              >
                {countdown > 0 ? (
                  <span className="text-[120px] font-black text-accent-300" style={{ textShadow: '0 0 60px rgba(57,255,20,0.5)' }}>
                    {countdown}
                  </span>
                ) : (
                  <span className="text-6xl font-black text-accent-300 tracking-widest" style={{ textShadow: '0 0 60px rgba(57,255,20,0.5)' }}>
                    GO!
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
            <p className="text-gray-500 text-sm mt-6 uppercase tracking-widest font-bold">Get Ready...</p>
          </div>
        )}

        {/* ── RACING ── */}
        {(phase === 'racing' || phase === 'finished') && (
          <div className="space-y-6">
            {/* Live HUD */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                {[
                  { icon: <Gauge className="w-4 h-4" />, value: `${liveWPM}`, unit: 'WPM', color: '#39FF14' },
                  { icon: <Target className="w-4 h-4" />, value: `${accuracy}`, unit: '%', color: '#06b6d4' },
                  { icon: <Clock className="w-4 h-4" />, value: `${elapsed.toFixed(1)}`, unit: 's', color: '#a855f7' },
                ].map(stat => (
                  <div key={stat.unit} className="flex items-center gap-2 rounded-xl px-3 py-2 border border-white/[0.06] bg-white/[0.02]">
                    <span style={{ color: stat.color }}>{stat.icon}</span>
                    <span className="text-lg font-black text-white tabular-nums">{stat.value}</span>
                    <span className="text-[10px] text-gray-500 font-bold">{stat.unit}</span>
                  </div>
                ))}
              </div>
              {phase === 'finished' && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={joinRace}
                  className="flex items-center gap-2 rounded-xl bg-accent-300 px-5 py-2.5 text-sm font-black text-black"
                >
                  <RotateCcw className="w-4 h-4" /> Race Again
                </motion.button>
              )}
            </div>

            {/* ── Race Track ── */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0d0b] p-6 space-y-4 relative overflow-hidden">
              <div className="absolute -top-20 right-0 w-64 h-64 rounded-full bg-accent-300/5 blur-[80px] pointer-events-none" />

              {sortedRacers.map((racer, i) => {
                const isPlayer = racer.isPlayer;
                const position = finishOrder.indexOf(racer.id) + 1;
                const positionIcon = position === 1 ? <Crown className="w-4 h-4 text-yellow-400" /> 
                  : position === 2 ? <Medal className="w-4 h-4 text-gray-300" /> 
                  : position === 3 ? <Medal className="w-4 h-4 text-amber-600" />
                  : null;

                return (
                  <div key={racer.id} className="relative">
                    {/* Racer info */}
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xl">{racer.avatar}</span>
                      <span className={cn("text-sm font-bold", isPlayer ? "text-accent-300" : "text-gray-300")}>
                        {racer.name}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border" style={{ borderColor: `${racer.color}40`, color: racer.color, background: `${racer.color}10` }}>
                        {racer.rank}
                      </span>
                      {positionIcon && (
                        <span className="ml-1">{positionIcon}</span>
                      )}
                      <span className="ml-auto text-xs font-bold tabular-nums" style={{ color: racer.color }}>
                        {racer.wpm} WPM
                      </span>
                    </div>

                    {/* Track */}
                    <div className="relative h-8 rounded-full bg-white/[0.03] border border-white/[0.05] overflow-hidden">
                      {/* Finish line markers */}
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/[0.05] to-transparent z-10 flex items-center justify-center">
                        <Flag className="w-3.5 h-3.5 text-gray-600" />
                      </div>

                      {/* Progress bar */}
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${racer.color}30, ${racer.color}80)`,
                          boxShadow: `0 0 20px ${racer.color}30`,
                        }}
                        animate={{ width: `${racer.progress}%` }}
                        transition={{ duration: 0.3, ease: 'linear' }}
                      />

                      {/* Car/avatar indicator */}
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-7 rounded-full text-sm"
                        style={{
                          background: `${racer.color}`,
                          boxShadow: `0 0 12px ${racer.color}60`,
                        }}
                        animate={{ left: `calc(${Math.min(racer.progress, 96)}% - 14px)` }}
                        transition={{ duration: 0.3, ease: 'linear' }}
                      >
                        {racer.avatar}
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Typing Area ── */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0d0b] p-6 relative overflow-hidden">
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent-300/5 blur-[80px] pointer-events-none" />

              {/* Hidden input */}
              <input
                ref={inputRef}
                className="absolute opacity-0 -z-10 w-0 h-0"
                onKeyDown={handleKeyDown}
                autoFocus
                aria-label="Race typing input"
              />

              {/* Text display */}
              <div
                ref={textContainerRef}
                className="relative font-mono text-[16px] leading-[2] select-none max-h-[200px] overflow-y-auto"
                style={{ fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace", scrollbarWidth: 'none' }}
                onClick={() => inputRef.current?.focus()}
              >
                {raceText.split('').map((char, idx) => {
                  const isTyped = idx < typed.length;
                  const isCorrect = isTyped && typed[idx] === char;
                  const isWrong = isTyped && typed[idx] !== char;
                  const isCaret = idx === typed.length && phase === 'racing';

                  let color = '#3a3a3a';
                  let bg = 'transparent';
                  let shadow = 'none';

                  if (isCorrect) {
                    color = '#39FF14';
                    shadow = '0 0 6px rgba(57,255,20,0.3)';
                  } else if (isWrong) {
                    color = '#ff4d6d';
                    bg = 'rgba(255,77,109,0.15)';
                  }

                  return (
                    <span key={idx} className="relative inline">
                      {isCaret && (
                        <motion.span
                          data-caret="true"
                          className="absolute left-0 top-[3px] bottom-[3px] w-[2.5px] rounded-full pointer-events-none z-20"
                          style={{
                            background: 'linear-gradient(180deg, #39FF14, #00cc00)',
                            boxShadow: '0 0 8px #39FF14, 0 0 20px rgba(57,255,20,0.4)',
                          }}
                          animate={{ opacity: [1, 0.2, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                      <span style={{ color, backgroundColor: bg, textShadow: shadow }} className="transition-colors duration-75">
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    </span>
                  );
                })}
              </div>

              {/* Click to focus hint */}
              {phase === 'racing' && typed.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl cursor-pointer" onClick={() => inputRef.current?.focus()}>
                  <p className="text-gray-400 text-sm font-bold animate-pulse">Click here to start typing...</p>
                </div>
              )}
            </div>

            {/* ── Finish Results ── */}
            <AnimatePresence>
              {phase === 'finished' && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-accent-300/20 bg-[#0a0d0b] p-8 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-300/5 via-transparent to-purple-500/5 pointer-events-none" />
                  
                  <div className="text-center mb-8 relative">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                      {playerRank === 1 ? (
                        <div className="text-6xl mb-3">🏆</div>
                      ) : playerRank === 2 ? (
                        <div className="text-6xl mb-3">🥈</div>
                      ) : playerRank === 3 ? (
                        <div className="text-6xl mb-3">🥉</div>
                      ) : (
                        <div className="text-6xl mb-3">🏁</div>
                      )}
                    </motion.div>
                    <h2 className="text-3xl font-black text-white">
                      {playerRank === 1 ? 'Victory!' : playerRank === 2 ? 'Great Race!' : playerRank === 3 ? 'Nice Effort!' : 'Race Complete!'}
                    </h2>
                    <p className="text-gray-500 mt-1">You finished in <strong className="text-accent-300">#{playerRank || '?'}</strong> place</p>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-4 gap-3 mb-8 max-w-lg mx-auto">
                    {[
                      { label: 'SPEED', value: `${liveWPM}`, unit: 'WPM', color: '#39FF14' },
                      { label: 'ACCURACY', value: `${accuracy}`, unit: '%', color: '#06b6d4' },
                      { label: 'TIME', value: `${elapsed.toFixed(1)}`, unit: 's', color: '#a855f7' },
                      { label: 'RANK', value: `#${playerRank || '?'}`, unit: '', color: '#fbbf24' },
                    ].map(stat => (
                      <div key={stat.label} className="text-center rounded-xl p-3" style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}20` }}>
                        <p className="text-[9px] font-bold tracking-widest text-gray-600 uppercase">{stat.label}</p>
                        <p className="text-2xl font-black mt-1" style={{ color: stat.color }}>
                          {stat.value}<span className="text-[10px] text-gray-500 ml-0.5">{stat.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Final standings */}
                  <div className="max-w-lg mx-auto space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">Final Standings</p>
                    {finishOrder.map((id, i) => {
                      const racer = racers.find(r => r.id === id);
                      if (!racer) return null;
                      return (
                        <motion.div
                          key={id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-4 py-3 border transition-all",
                            racer.isPlayer 
                              ? "border-accent-300/20 bg-accent-300/[0.05]" 
                              : "border-white/[0.05] bg-white/[0.02]"
                          )}
                        >
                          <span className="text-lg font-black text-gray-500 w-6 tabular-nums">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                          </span>
                          <span className="text-xl">{racer.avatar}</span>
                          <span className={cn("text-sm font-bold flex-1", racer.isPlayer ? "text-accent-300" : "text-gray-300")}>
                            {racer.name}
                          </span>
                          <span className="text-sm font-bold tabular-nums" style={{ color: racer.color }}>
                            {racer.wpm} WPM
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Race again */}
                  <div className="text-center mt-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={joinRace}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent-300 px-8 py-3 text-sm font-black text-black shadow-[0_0_30px_rgba(57,255,20,0.3)]"
                    >
                      <RotateCcw className="w-4 h-4" /> Race Again
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}