"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudLightning, Gauge, ShieldAlert, Terminal, Leaf, 
  Crosshair, Zap, BrainCircuit, Headphones, Command,
  Gamepad2, X
} from 'lucide-react';
import LetterGame from '@/components/LetterGame';
import NeonSprintGame from '@/components/NeonSprintGame';
import CyberDefendGame from '@/components/CyberDefendGame';
import CodeBreakerGame from '@/components/CodeBreakerGame';
import TerminalHackerGame from '@/components/TerminalHackerGame';
import ZenGardenGame from '@/components/ZenGardenGame';
import SyntaxShooterGame from '@/components/SyntaxShooterGame';
import MemoryMatrixGame from '@/components/MemoryMatrixGame';
import TypeRacerGame from '@/components/TypeRacerGame';

const GAMES = [
  {
    id: 'letter-rain',
    title: 'Letter Rain',
    description: 'Typing reflex minigame. Letters fall fast, destroy them by typing the correct keys.',
    icon: CloudLightning,
    image: '/media/games/letter%20rain.png',
    status: 'online',
    color: 'text-[#39FF14]',
    bg: 'bg-[#39FF14]/10',
    border: 'hover:border-[#39FF14]/30'
  },
  {
    id: 'neon-sprint',
    title: 'Neon Sprint',
    description: 'Type consecutive phrases to fuel your synthwave motorcycle and race against the clock.',
    icon: Gauge,
    image: '/media/games/neon%20sprint.png',
    status: 'online',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'hover:border-cyan-400/30'
  },
  {
    id: 'cyber-defend',
    title: 'Cyber Defend',
    description: 'Stop incoming network attacks by typing their encrypted sequences accurately.',
    icon: ShieldAlert,
    image: '/media/games/cyber%20defend.png',
    status: 'online',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'hover:border-red-500/30'
  },
  {
    id: 'code-breaker',
    title: 'Code Breaker',
    description: 'Reverse engineer scrambled strings of code. Precision is mandatory.',
    icon: Terminal,
    image: '/media/games/code%20breaker.png',
    status: 'online',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'hover:border-purple-400/30'
  },
  {
    id: 'zen-garden',
    title: 'Zen Garden',
    description: 'Relaxing environment with no timer. Focus purely on hitting 100% accuracy.',
    icon: Leaf,
    image: '/media/games/zen%20garden.png',
    status: 'online',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'hover:border-emerald-400/30'
  },
  {
    id: 'syntax-shooter',
    title: 'Syntax Shooter',
    description: 'Target semicolons, brackets, and logical operators in an Asteroids-style shooter.',
    icon: Crosshair,
    image: '/media/games/syntax%20shooter.png',
    status: 'online',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'hover:border-amber-400/30'
  },
  {
    id: 'type-racer',
    title: 'Type Racer Pro',
    description: 'Compete in live drag races against other players using pure WPM velocity.',
    icon: Zap,
    image: '/media/games/type%20racer%20pro.png',
    status: 'online',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'hover:border-blue-400/30'
  },
  {
    id: 'memory-matrix',
    title: 'Memory Matrix',
    description: 'A 10-character code flashes for a brief moment. Recall and type it quickly.',
    icon: BrainCircuit,
    image: '/media/games/memory%20matrix.png',
    status: 'online',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'hover:border-pink-400/30'
  },
  {
    id: 'rhythm-typer',
    title: 'Rhythm Typer',
    description: 'Sync your keystrokes to an energetic EDM beat. Get combo multipliers.',
    icon: Headphones,
    image: '/media/games/rhythm%20typer.png',
    status: 'coming_soon',
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-400/10',
    border: 'hover:border-fuchsia-400/30'
  },
  {
    id: 'terminal-hacker',
    title: 'Terminal Hacker',
    description: 'Simulated mainframe penetration. Execute bash commands fast enough to slip through.',
    icon: Command,
    image: '/media/games/terminal%20haker.png',
    status: 'online',
    color: 'text-teal-400',
    bg: 'bg-teal-400/10',
    border: 'hover:border-teal-400/30'
  }
];

export default function GamesHubClient() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  if (activeGame) {
    return (
      <div className="fixed inset-0 z-[100] w-screen h-screen bg-[#030403] animate-in fade-in zoom-in-95 duration-500 overflow-hidden flex flex-col">
        {/* Top Floating Nav (Center Auto-hiding) */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex opacity-30 hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => setActiveGame(null)}
            className="pointer-events-auto flex items-center justify-center p-3 rounded-full bg-black/80 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] text-gray-400 transition-all backdrop-blur-md group"
            title="Exit to Hub"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
        
        {/* Full Screen Game Container */}
        <div className="flex-1 w-full h-full relative">
          {activeGame === 'letter-rain' ? (
            <LetterGame />
          ) : activeGame === 'neon-sprint' ? (
            <NeonSprintGame />
          ) : activeGame === 'cyber-defend' ? (
            <CyberDefendGame />
          ) : activeGame === 'code-breaker' ? (
            <CodeBreakerGame />
          ) : activeGame === 'terminal-hacker' ? (
            <TerminalHackerGame />
          ) : activeGame === 'zen-garden' ? (
            <ZenGardenGame />
          ) : activeGame === 'syntax-shooter' ? (
            <SyntaxShooterGame />
          ) : activeGame === 'memory-matrix' ? (
            <MemoryMatrixGame />
          ) : activeGame === 'type-racer' ? (
            <TypeRacerGame />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl text-white font-bold mb-2">Game Not Found</h2>
                <p>This game is currently offline or still in development.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {GAMES.map((game, idx) => {
        const Icon = game.icon;
        const isOnline = game.status === 'online';
        return (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => isOnline ? setActiveGame(game.id) : null}
            className={`
              relative flex flex-col p-6 rounded-2xl border transition-all duration-300 backdrop-blur-sm
              ${isOnline ? 'cursor-pointer bg-black/40 border-white/5 overflow-hidden group hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.8)] hover:bg-black/60 ' + game.border : 'bg-black/40 border-white/5 opacity-60 select-none'}
            `}
          >
            {/* Online Pulse */}
            {isOnline && (
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[#39FF14]`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 bg-[#39FF14]`} />
                </span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#39FF14]">Live</span>
              </div>
            )}
            
            {!isOnline && (
              <div className="absolute top-4 right-4 text-[9px] uppercase tracking-widest font-bold text-gray-500">
                Coming Soon
              </div>
            )}

            <div className={`mb-5 w-14 h-14 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white/10 ${game.bg} ${game.color} ${isOnline ? 'group-hover:scale-110 group-hover:ring-current transition-all duration-300 shadow-lg' : ''}`}>
               {game.image ? (
                  <img src={game.image} alt={game.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
               ) : null}
               <Icon className={`w-6 h-6 ${game.image ? 'hidden' : ''}`} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed flex-1">
              {game.description}
            </p>
            
            {isOnline && (
              <div className="mt-6 text-[11px] uppercase tracking-[0.2em] font-bold text-gray-500 group-hover:text-white transition-colors flex items-center gap-2">
                Play Now <Gamepad2 className="w-3.5 h-3.5" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
