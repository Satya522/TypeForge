"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { getCommunitySocket } from '@/lib/socket';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import TypingArea from '@/components/TypingArea';
import type { Socket } from 'socket.io-client';

interface RacePlayer {
  id: string;
  name: string;
  color: string;
  wpm: number;
  progress: number;
  finished: boolean;
}

interface RaceState {
  id: string;
  creatorId: string;
  status: string;
  sentence: string;
  players: RacePlayer[];
}

export default function RacePage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lobbyState, setLobbyState] = useState<'menu' | 'waiting' | 'countdown' | 'racing' | 'finished'>('menu');
  const [raceId, setRaceId] = useState('');
  const [joinId, setJoinId] = useState('');
  const [players, setPlayers] = useState<RacePlayer[]>([]);
  const [sentence, setSentence] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [winner, setWinner] = useState<RacePlayer | null>(null);

  const {
    handleKey,
    started: typingStarted,
    finished: typingFinished,
    typed,
    currentIndex,
    wpm,
    progress: typingProgress,
    restart,
  } = useTypingEngine(sentence);

  const prevProgressRef = useRef({ progress: 0, wpm: 0 });

  useEffect(() => {
    const s = getCommunitySocket();
    if (!s) return;
    
    // Attempt connection
    s.connect();
    
    // Authenticate / Join as guest
    s.emit('user:join', { name: 'Racer_' + Math.floor(Math.random() * 1000) });
    setSocket(s);

    s.on('race:created', (race: RaceState) => {
      setRaceId(race.id);
      setSentence(race.sentence);
      setPlayers(race.players);
      setLobbyState('waiting');
      setErrorMsg('');
    });

    s.on('race:updated', (race: RaceState) => {
      setPlayers(race.players);
    });

    s.on('race:countdown', ({ seconds }: { seconds: number }) => {
      setLobbyState('countdown');
      setCountdown(seconds);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) clearInterval(timer);
          return c - 1;
        });
      }, 1000);
    });

    s.on('race:started', (race: RaceState) => {
      setLobbyState('racing');
      restart(); // Reset typing engine
    });

    s.on('race:progress', ({ players }: { players: RacePlayer[] }) => {
      setPlayers(players);
    });

    s.on('race:finished', ({ results }: { results: RacePlayer[] }) => {
      setLobbyState('finished');
      setPlayers(results);
      if (results.length > 0) {
        setWinner(results[0]);
      }
    });

    s.on('error', (msg: string) => setErrorMsg(msg));

    return () => {
      s.off('race:created');
      s.off('race:updated');
      s.off('race:countdown');
      s.off('race:started');
      s.off('race:progress');
      s.off('race:finished');
      s.off('error');
    };
  }, [restart]);

  // Sync typing engine progress to server
  useEffect(() => {
    if (lobbyState !== 'racing' || !socket) return;
    
    const interval = setInterval(() => {
      const pRef = prevProgressRef.current;
      if (pRef.progress !== typingProgress || pRef.wpm !== wpm) {
        socket.emit('race:progress', {
          raceId,
          progress: typingProgress,
          wpm,
          intervals: [] // Dummy intervals for anti-cheat placeholder
        });
        prevProgressRef.current = { progress: typingProgress, wpm };
      }
    }, 500); // 2 updates per second

    return () => clearInterval(interval);
  }, [lobbyState, socket, raceId, typingProgress, wpm]);

  // Handle global keyboard input during race
  useEffect(() => {
    if (lobbyState !== 'racing' || typingFinished) return;
    
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length === 1 || e.key === 'Backspace') {
        e.preventDefault();
        handleKey(e.key);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lobbyState, typingFinished, handleKey]);


  const handleCreateRace = () => {
    socket?.emit('race:create', { maxPlayers: 4 });
  };

  const handleJoinRace = () => {
    if (!joinId.trim()) return;
    socket?.emit('race:join', joinId.trim());
    setRaceId(joinId.trim());
    setLobbyState('waiting');
  };

  const handleStartRace = () => {
    socket?.emit('race:start', raceId);
  };

  return (
    <div className="min-h-screen bg-[#02050b] flex flex-col font-sans">
      <div className="mx-auto max-w-4xl py-16 px-6 flex-1 w-full">
        <h1 className="text-4xl font-bold mb-8 text-white">Live Multiplayer Race</h1>
        
        {errorMsg && (
          <div className="bg-rose-500/20 border border-rose-500 text-rose-300 p-4 rounded-md mb-6">
            {errorMsg}
          </div>
        )}

        {lobbyState === 'menu' && (
          <div className="space-y-8 bg-surface-200/50 p-8 rounded-xl border border-surface-300">
            <div>
              <h2 className="text-xl text-white mb-4">Create a New Race</h2>
              <Button onClick={handleCreateRace} className="w-full sm:w-auto">Create Lobby</Button>
            </div>
            <div className="border-t border-surface-300 pt-8">
              <h2 className="text-xl text-white mb-4">Join an Existing Race</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter Race ID"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  className="bg-surface-300 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-200 w-full sm:w-64"
                />
                <Button onClick={handleJoinRace} variant="secondary">Join</Button>
              </div>
            </div>
          </div>
        )}

        {lobbyState === 'waiting' && (
          <div className="space-y-6">
            <div className="bg-surface-200/50 p-6 rounded-xl border border-surface-300 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Race ID (Share this with friends)</p>
                <p className="text-2xl font-mono text-white">{raceId}</p>
              </div>
              {players[0]?.id === socket?.id && (
                <Button onClick={handleStartRace} disabled={players.length < 1}>
                  Start Race
                </Button>
              )}
            </div>

            <div className="bg-surface-200/50 p-6 rounded-xl border border-surface-300">
              <h3 className="text-lg text-white mb-4">Players in Lobby ({players.length}/4)</h3>
              <div className="space-y-3">
                {players.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 bg-surface-300 p-3 rounded-md">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-white">{p.name} {p.id === socket?.id ? '(You)' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {lobbyState === 'countdown' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <h2 className="text-2xl text-gray-300">Get Ready!</h2>
            <div className="text-8xl font-bold text-accent-200 animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {(lobbyState === 'racing' || lobbyState === 'finished') && (
          <div className="space-y-8">
            <div className="bg-surface-200/50 p-6 rounded-xl border border-surface-300 space-y-6">
              {players.map((p) => (
                <div key={p.id} className="space-y-2 relative">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: p.color }} className="font-medium">
                      {p.name} {p.id === socket?.id ? '(You)' : ''}
                    </span>
                    <span className="text-gray-400">{p.wpm} WPM</span>
                  </div>
                  <div className="h-4 bg-surface-400 rounded-full overflow-hidden relative">
                    <div
                      className="h-full transition-all duration-300 ease-out"
                      style={{ width: `${p.progress}%`, backgroundColor: p.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {lobbyState === 'racing' ? (
              <div className="bg-surface-100 p-8 rounded-xl border border-surface-300 shadow-2xl mt-8">
                <TypingArea
                  text={sentence}
                  typed={typed}
                  currentIndex={currentIndex}
                  finished={typingFinished}
                />
              </div>
            ) : (
              <div className="bg-surface-200/50 p-8 rounded-xl border border-surface-300 text-center space-y-6 mt-8">
                <h2 className="text-3xl text-white font-bold">Race Finished!</h2>
                {winner && (
                  <div className="text-xl">
                    <span className="text-gray-400">Winner: </span>
                    <span style={{ color: winner.color }} className="font-bold">{winner.name}</span>
                    <span className="text-gray-400"> with {winner.wpm} WPM</span>
                  </div>
                )}
                <Button onClick={() => setLobbyState('menu')} className="mt-4">Back to Lobby</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}