"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

const WordRainGame   = dynamic(() => import("@/components/games/WordRainGame"),       { ssr: false });
const TerminalHacker = dynamic(() => import("@/components/games/TerminalHackerGame"), { ssr: false });
const BombDefuse     = dynamic(() => import("@/components/games/BombDefuseGame"),     { ssr: false });
const GhostRacer     = dynamic(() => import("@/components/games/GhostRacerGame"),     { ssr: false });
const WordScramble   = dynamic(() => import("@/components/games/WordScrambleGame"),   { ssr: false });
const SpeedTyping    = dynamic(() => import("@/components/games/SpeedTypingGame"),    { ssr: false });

const GAMES = [
  {
    id: "speed-typing",
    name: "Speed Typing",
    emoji: "⚡",
    tagline: "Race against the clock",
    description: "Type words as fast as possible. Difficulty scales automatically through 5 levels — Easy to Legend.",
    color: "#39ff14",
    glow: "rgba(57,255,20,0.25)",
    tags: ["Reflex", "Solo", "Levels"],
    component: SpeedTyping,
  },
  {
    id: "word-rain",
    name: "Word Rain",
    emoji: "🌧️",
    tagline: "Destroy falling words",
    description: "Words fall from the sky — type them before they hit the ground. Miss 3 and it's game over. Build combos!",
    color: "#38bdf8",
    glow: "rgba(56,189,248,0.25)",
    tags: ["Action", "Combo", "Reflex"],
    component: WordRainGame,
  },
  {
    id: "terminal-hacker",
    name: "Terminal Hacker",
    emoji: "💻",
    tagline: "Breach the mainframe",
    description: "Type hacking commands exactly as shown before the countdown ends. 10 escalating levels of cyber intensity.",
    color: "#39ff14",
    glow: "rgba(57,255,20,0.2)",
    tags: ["Precision", "Hacker", "Timer"],
    component: TerminalHacker,
  },
  {
    id: "bomb-defuse",
    name: "Bomb Defuse",
    emoji: "💣",
    tagline: "Type or explode",
    description: "Defuse bombs by typing the exact disarm codes under pressure. 5 escalating levels. One mistake is all it takes.",
    color: "#ef4444",
    glow: "rgba(239,68,68,0.2)",
    tags: ["Pressure", "Accuracy", "Timer"],
    component: BombDefuse,
  },
  {
    id: "ghost-racer",
    name: "Ghost Racer",
    emoji: "👻",
    tagline: "Beat the ghost typist",
    description: "Race against a ghost typing at 55 WPM. Complete the passage first to win. Choose from 5 different tracks.",
    color: "#a855f7",
    glow: "rgba(168,85,247,0.2)",
    tags: ["Race", "WPM", "Ghost"],
    component: GhostRacer,
  },
  {
    id: "word-scramble",
    name: "Word Scramble",
    emoji: "🔀",
    tagline: "Unscramble the chaos",
    description: "Unscramble as many words as you can in 60 seconds. Build streaks for bonus points. 3 hints per round.",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.2)",
    tags: ["Puzzle", "Streaks", "60s"],
    component: WordScramble,
  },
];

export default function GamesHubClient() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeGame = GAMES.find((g) => g.id === activeId);
  const GameComponent = activeGame?.component ?? null;

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen pt-20 pb-16"
        style={{
          background: "#050805",
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(57,255,20,0.04) 0%, transparent 60%)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ── Hero header ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="pt-10 pb-8 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/[0.06] px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-green-400">
                6 Typing Games
              </span>
            </div>
            <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
              Game{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #39ff14 0%, #00cc44 50%, #38bdf8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Zone
              </span>
            </h1>
            <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
              Premium typing games to sharpen your reflexes, accuracy, and speed.
              Pick any game and play instantly — no setup required.
            </p>
          </motion.div>

          {/* ── Content area ── */}
          <AnimatePresence mode="wait">
            {/* ── Games Grid ── */}
            {!activeId && (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {GAMES.map((game, i) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.07,
                      duration: 0.45,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    onClick={() => setActiveId(game.id)}
                    className="relative cursor-pointer rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 overflow-hidden group transition-all duration-300"
                    style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.35)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 60px ${game.glow}, 0 4px 20px rgba(0,0,0,0.5)`;
                      (e.currentTarget as HTMLDivElement).style.borderColor = `${game.color}30`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 30px rgba(0,0,0,0.35)";
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                    }}
                  >
                    {/* Ambient glow top-right */}
                    <div
                      className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                      style={{ background: game.color }}
                    />

                    {/* Top accent line */}
                    <div
                      className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${game.color}80, transparent)`,
                      }}
                    />

                    {/* Emoji */}
                    <motion.span
                      className="text-4xl mb-4 block"
                      whileHover={{ scale: 1.25, rotate: 8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      {game.emoji}
                    </motion.span>

                    {/* Title + tagline */}
                    <h2 className="text-base font-bold text-white mb-0.5">
                      {game.name}
                    </h2>
                    <p className="text-[12px] font-semibold mb-3" style={{ color: game.color }}>
                      {game.tagline}
                    </p>

                    {/* Description */}
                    <p className="text-gray-500 text-[13px] leading-relaxed mb-4">
                      {game.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {game.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border"
                          style={{
                            color: game.color,
                            borderColor: `${game.color}25`,
                            background: `${game.color}08`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-black transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${game.color}, ${game.color}bb)`,
                        boxShadow: `0 0 20px ${game.glow}`,
                      }}
                    >
                      ▶ Play Now
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ── Active Game ── */}
            {activeId && (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                {/* Top bar */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <motion.button
                      onClick={() => setActiveId(null)}
                      whileHover={{ x: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-medium"
                    >
                      ← All Games
                    </motion.button>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{activeGame?.emoji}</span>
                      <div>
                        <p className="text-white font-bold text-sm leading-tight">
                          {activeGame?.name}
                        </p>
                        <p
                          className="text-[11px] font-medium"
                          style={{ color: activeGame?.color }}
                        >
                          {activeGame?.tagline}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick switch to other games */}
                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest mr-1">
                      Switch:
                    </span>
                    {GAMES.filter((g) => g.id !== activeId).map((g) => (
                      <motion.button
                        key={g.id}
                        onClick={() => setActiveId(g.id)}
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.92 }}
                        title={g.name}
                        className="w-9 h-9 rounded-xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-base hover:border-white/20 hover:bg-white/[0.06] transition-all"
                      >
                        {g.emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Render game */}
                {GameComponent && <GameComponent />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  );
}
