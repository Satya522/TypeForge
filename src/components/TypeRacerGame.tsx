"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Flag, Ghost, ShieldAlert, CarFront, Trophy, Timer, Crosshair, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMechanicalSound } from "@/hooks/useMechanicalSound";

const RACE_TEXTS = [
  "The quick brown fox jumps over the lazy dog in an incredible display of pure agility and speed.",
  "In the world of cyberpunk, neon-drenched streets reflect the constant hum of data flowing through the net.",
  "Racing against time is not just a test of speed, but a profound measure of unwavering focus and absolute precision.",
  "Deep in the mainframe, rogue processes fight for survival against security protocols that show no mercy.",
  "A true keyboard warrior knows that every keystroke represents an extension of their own physical being."
];

export default function TypeRacerGame() {
  const [status, setStatus] = useState<"idle" | "countdown" | "racing" | "finished">("idle");
  const [countdown, setCountdown] = useState(3);
  
  const [targetText, setTargetText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const [playerWpm, setPlayerWpm] = useState(0);
  const [botWpm] = useState(() => 60 + Math.floor(Math.random() * 40)); // Random bot 60-100 WPM
  const [botProgress, setBotProgress] = useState(0); // 0 to 100 percentage
  const [playerProgress, setPlayerProgress] = useState(0); // 0 to 100 percentage

  const [winner, setWinner] = useState<"player" | "bot" | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const playSound = useMechanicalSound(true);

  const initGame = () => {
    setTargetText(RACE_TEXTS[Math.floor(Math.random() * RACE_TEXTS.length)]);
    setTypedText("");
    setStartTime(null);
    setEndTime(null);
    setElapsed(0);
    setPlayerWpm(0);
    setBotProgress(0);
    setPlayerProgress(0);
    setWinner(null);
    setStatus("countdown");
    setCountdown(3);
  };

  // Countdown timer
  useEffect(() => {
    if (status === "countdown") {
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            playSound("space");
            setStatus("racing");
            setStartTime(Date.now());
            return 0;
          }
          playSound("normal");
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, playSound]);

  // Race Loop (Bot progress & Elapsed time)
  useEffect(() => {
    if (status === "racing" && startTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const diffInSeconds = (now - startTime) / 1000;
        setElapsed(diffInSeconds);

        // Bot Progress Calculation
        // Target length in characters. Bot types roughly 'botWpm' * 5 chars per minute.
        // Chars per second = (botWpm * 5) / 60
        const charsTypedByBot = ((botWpm * 5) / 60) * diffInSeconds;
        const currentBotProg = Math.min((charsTypedByBot / targetText.length) * 100, 100);
        setBotProgress(currentBotProg);

        if (currentBotProg >= 100 && !winner) {
          setWinner("bot");
          setStatus("finished");
          playSound("error");
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [status, startTime, botWpm, targetText.length, winner, playSound]);

  // Maintain Focus
  useEffect(() => {
    if (status === "racing") {
      const lockFocus = setInterval(() => {
        inputRef.current?.focus();
      }, 500);
      inputRef.current?.focus();
      return () => clearInterval(lockFocus);
    }
  }, [status]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status !== "racing") return;
    
    let val = e.target.value;
    // Don't allow typing past length
    if (val.length > targetText.length) val = val.slice(0, targetText.length);
    
    // Validate accuracy (strict mode: cannot type wrong char)
    const expectedChar = targetText[val.length - 1];
    const typedChar = val[val.length - 1];

    if (val.length > typedText.length) {
      if (typedChar !== expectedChar) {
        playSound('error');
        // Flash input background red slightly?
        return; // Reject bad input
      } else {
        playSound('normal');
      }
    } else {
       // Backspacing
       playSound('normal');
    }

    setTypedText(val);

    // Calculate progression
    const currentProg = (val.length / targetText.length) * 100;
    setPlayerProgress(currentProg);

    // Update WPM
    if (startTime) {
      const timeElapsedMinutes = (Date.now() - startTime) / 1000 / 60;
      const currentWpm = Math.round((val.length / 5) / (timeElapsedMinutes || 1)); // prevent Infinity
      setPlayerWpm(Math.max(0, currentWpm));
    }

    // Win condition
    if (val === targetText && !winner) {
      setWinner("player");
      setEndTime(Date.now());
      setStatus("finished");
      playSound("space"); // victory sound
    }
  };

  return (
    <div 
      className="relative w-full h-full bg-[#040814] overflow-hidden flex flex-col font-mono selection:bg-blue-500/30"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Dynamic Background Parallax Highway */}
      <div className="absolute inset-0 pointer-events-none perspective-[1000px] overflow-hidden">
         {/* Sky gradient */}
         <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-[#02040a] to-[#040814] z-0" />
         
         {/* Cyber Grid Ground */}
         <div className="absolute bottom-0 w-full h-1/2 bg-[#040a18] z-0 overflow-hidden" 
              style={{
                transform: "rotateX(75deg) scale(3) translateY(-10%)",
                transformOrigin: "top center",
                backgroundImage: `linear-gradient(rgba(56, 189, 248, 0.4) 2px, transparent 2px), linear-gradient(90deg, rgba(56, 189, 248, 0.2) 2px, transparent 2px)`,
                backgroundSize: "60px 60px",
                animation: status === "racing" ? "highwayDrive 0.4s linear infinite" : "none"
              }} 
         />
      </div>
      <style>{`
        @keyframes highwayDrive {
          from { background-position: 0 0; }
          to { background-position: 0 60px; }
        }
      `}</style>
      
      {/* Top HUD */}
      {status === "racing" && (
        <div className="absolute top-6 left-8 right-8 flex justify-between items-start z-30 pointer-events-none">
           <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex gap-6">
              <div className="bg-[#02040a]/80 backdrop-blur-xl border border-blue-500/30 px-6 py-4 rounded-xl flex flex-col shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                 <span className="text-[10px] text-blue-400/60 font-black tracking-[0.3em] uppercase mb-1">Your Velocity</span>
                 <div className="flex items-center gap-2 text-3xl font-black text-blue-400 drop-shadow-[0_0_10px_#3b82f6]">
                   <Zap className="w-6 h-6 fill-blue-400 shadow-blue-500" /> {playerWpm} <span className="text-sm">WPM</span>
                 </div>
              </div>
           </motion.div>

           <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex gap-6">
              <div className="bg-[#02040a]/80 backdrop-blur-xl border border-red-500/30 px-6 py-4 rounded-xl flex flex-col shadow-[0_0_20px_rgba(239,68,68,0.2)] items-end">
                 <span className="text-[10px] text-red-400/60 font-black tracking-[0.3em] uppercase mb-1 flex items-center gap-2">
                   Ghost Driver <Ghost className="w-3 h-3" />
                 </span>
                 <div className="flex items-center gap-2 text-3xl font-black text-red-500 drop-shadow-[0_0_10px_#ef4444]">
                   {botWpm} <span className="text-sm">WPM</span>
                 </div>
              </div>
           </motion.div>
        </div>
      )}

      {/* Main Track Container */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center pt-32 w-full max-w-6xl mx-auto px-10">
        
        {/* Race Track Lines */}
        {(status === "racing" || status === "countdown" || status === "finished") && (
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
             className="w-full flex flex-col gap-10 bg-black/40 backdrop-blur-lg border-y-4 border-blue-900/40 p-10 rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
             {/* Track separators */}
             <div className="absolute top-1/2 left-0 w-full h-1 border-t-2 border-dashed border-white/20 -translate-y-1/2" />
             <div className="absolute top-0 right-10 w-2 h-full bg-gradient-to-b from-transparent via-white to-transparent opacity-50 shadow-[0_0_15px_#ffffff]" />
             
             {/* Opponent Lane */}
             <div className="relative h-16 w-[calc(100%-3rem)] flex items-center">
                 <div className="absolute left-0 text-red-500/50 font-black tracking-widest text-xs uppercase bottom-full mb-1">Ghost Vector</div>
                 
                 {/* Progress Bar Backglow */}
                 <div className="absolute left-0 h-[2px] bg-red-900/30 w-full top-1/2 -translate-y-1/2 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-red-500/40 shadow-[0_0_10px_#ef4444]" style={{ width: `${botProgress}%` }} />
                 </div>

                 {/* Bot Car */}
                 <motion.div 
                   className="absolute flex items-center h-full drop-shadow-[0_0_15px_rgba(239,68,68,1)] z-10"
                   style={{ left: `calc(${botProgress}% - 2rem)` }} // Keeps icon somewhat centered on progress
                   transition={{ type: "tween", duration: 0.1 }}
                 >
                    <div className="w-16 h-8 bg-gradient-to-r from-transparent via-red-900 to-red-500 blur-sm absolute left-[-20px] opacity-80" />
                    <CarFront className="w-10 h-10 text-white fill-red-500 relative z-10 translate-x-4" />
                 </motion.div>
             </div>

             {/* Player Lane */}
             <div className="relative h-16 w-[calc(100%-3rem)] flex items-center mt-4">
                 <div className="absolute left-0 text-blue-400/80 font-black tracking-widest text-xs uppercase bottom-full mb-1">Player Target</div>
                 
                 {/* Progress Bar Backglow */}
                 <div className="absolute left-0 h-[2px] bg-blue-900/30 w-full top-1/2 -translate-y-1/2 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-blue-400/60 shadow-[0_0_15px_#3b82f6]" style={{ width: `${playerProgress}%` }} />
                 </div>

                 {/* Player Car */}
                 <motion.div 
                   className="absolute flex items-center h-full drop-shadow-[0_0_15px_rgba(56,189,248,1)] z-10"
                   style={{ left: `calc(${playerProgress}% - 2rem)` }}
                   transition={{ type: "tween", duration: 0.1 }}
                 >
                    <div className="w-20 h-10 bg-gradient-to-r from-transparent via-blue-900 to-blue-400 blur-sm absolute left-[-30px] opacity-80" />
                    <Zap className="w-12 h-12 text-white fill-blue-400 relative z-10 translate-x-4" />
                 </motion.div>
             </div>
          </motion.div>
        )}

      </div>

      {/* Typing Interface below track */}
      {status === "racing" && (
        <div className="relative z-30 pb-20 pt-10 px-10 max-w-5xl mx-auto w-full">
            
            <input 
              ref={inputRef}
              className="absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none -z-50"
              value={typedText}
              onChange={handleInput}
              autoFocus
              spellCheck={false}
            />

            <div className="bg-[#02040a]/80 backdrop-blur-3xl border border-blue-500/20 p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] text-3xl font-black leading-relaxed tracking-wider">
               {targetText.split("").map((char, index) => {
                  let colorClass = "text-gray-600";
                  let bgClass = "";
                  
                  if (index < typedText.length) {
                     colorClass = "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]";
                  } else if (index === typedText.length) {
                     colorClass = "text-blue-400 drop-shadow-[0_0_12px_#3b82f6]";
                     bgClass = "bg-blue-500/20";
                  }

                  return (
                    <span key={index} className={`relative transition-all duration-75 rounded-sm px-[1px] py-[2px] ${colorClass} ${bgClass}`}>
                       {char === " " ? "\u00A0" : char}
                       {index === typedText.length && (
                          <motion.span layoutId="race-cursor" className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-blue-400 shadow-[0_0_10px_#3b82f6]" />
                       )}
                    </span>
                  )
               })}
            </div>
        </div>
      )}

      {/* Overlays (Countdown, Modal) */}
      <AnimatePresence>
        {status === "countdown" && (
          <motion.div 
            key={countdown}
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-300 via-blue-500 to-cyan-400 drop-shadow-[0_0_80px_rgba(56,189,248,0.8)] filter"
          >
            {countdown}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(status === "idle" || status === "finished") && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#02040a]/80"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="text-center bg-[#0a1228]/80 border border-blue-500/30 p-8 md:p-12 lg:p-16 w-[90%] max-w-3xl rounded-[40px] shadow-[0_0_100px_rgba(59,130,246,0.15)] flex flex-col items-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 pointer-events-none" />
              
              {status === "idle" ? (
                <>
                  <div className="w-24 h-24 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-8 relative group">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-500/40 transition-colors" />
                    <Flag className="w-12 h-12 text-blue-400 relative z-10" />
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-black tracking-widest mb-4 text-transparent bg-clip-text bg-gradient-to-br from-blue-300 via-blue-400 to-cyan-300 filter drop-shadow-[0_0_30px_rgba(56,189,248,0.5)] leading-tight">
                    TYPE RACER<br/>PRO
                  </h1>
                  
                  <p className="text-blue-200/60 text-sm md:text-base font-bold mb-10 max-w-md leading-relaxed tracking-wider">
                    Compete in a high-octane drag race against a ghost driver. Absolute typing velocity determines the victor.
                  </p>
                  
                  <Button 
                    onClick={initGame} 
                    className="group relative w-full max-w-xs h-16 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black tracking-widest text-xl shadow-[0_0_40px_rgba(59,130,246,0.4)] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 shrink-0"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:200%_0,0_0] bg-no-repeat transition-[background-position_0s_ease] hover:bg-[position:-20%_0,0_0] hover:[transition-duration:1000ms]" />
                    <Zap className="w-6 h-6 mr-3 fill-current group-hover:scale-125 transition-transform duration-300" /> START ENGINE
                  </Button>
                </>
              ) : (
                <>
                  <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center mb-6 relative
                    ${winner === 'player' ? 'bg-amber-500/10 border-amber-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                    <div className={`absolute inset-0 blur-2xl 
                      ${winner === 'player' ? 'bg-amber-500/30' : 'bg-red-500/30'}`} />
                    {winner === 'player' ? (
                      <Trophy className="w-14 h-14 text-amber-400 relative z-10" />
                    ) : (
                      <Skull className="w-14 h-14 text-red-500 relative z-10" />
                    )}
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-[0.2em] mb-10 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] uppercase">
                    {winner === 'player' ? 'RACE WON!' : 'DEFEATED'}
                  </h2>
                  
                  <div className="flex gap-6 justify-center mb-10 w-full max-w-lg">
                    <div className="flex-1 bg-[#02040a]/80 border border-blue-500/30 px-6 py-6 rounded-2xl flex flex-col items-center">
                      <div className="text-blue-400/60 text-[10px] font-black tracking-widest uppercase mb-2">Final Velocity</div>
                      <div className="text-5xl font-black text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] tabular-nums">{playerWpm}</div>
                      <div className="text-blue-400/60 text-xs font-bold mt-1">WPM</div>
                    </div>
                    <div className="flex-1 bg-[#02040a]/80 border border-teal-500/30 px-6 py-6 rounded-2xl flex flex-col items-center">
                      <div className="text-teal-400/60 text-[10px] font-black tracking-widest uppercase mb-2">Race Time</div>
                      <div className="text-5xl font-black text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.6)] tabular-nums">{elapsed.toFixed(1)}</div>
                      <div className="text-teal-400/60 text-xs font-bold mt-1">SEC</div>
                    </div>
                  </div>

                  <Button 
                    onClick={initGame} 
                    className="w-full max-w-xs h-16 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/50 text-blue-300 hover:text-white font-black tracking-widest text-lg shadow-[0_0_20px_rgba(59,130,246,0.2)] rounded-2xl hover:scale-105 transition-all duration-300"
                  >
                    RACE AGAIN
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
