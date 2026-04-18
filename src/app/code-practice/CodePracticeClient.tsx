"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Files, Search, GitBranch, LayoutGrid, Settings, X, Terminal as TerminalIcon,
  Play, RotateCcw, ChevronRight, ChevronDown, Braces, FileJson, FileCode2,
  Flame, Zap, Trophy, Target, Clock, Hash, Gauge, BarChart3, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Syntax Highlighting Tokens ───
const TS_KEYWORDS = new Set([
  'import','from','export','default','const','let','var','function','return',
  'if','else','for','while','do','switch','case','break','continue','new',
  'typeof','instanceof','in','of','class','extends','implements','interface',
  'type','enum','async','await','try','catch','finally','throw','void',
  'null','undefined','true','false','this','super','static','public','private',
  'protected','readonly','abstract','as','is','keyof','never','unknown','any',
  'number','string','boolean','object','symbol','bigint','Promise',
]);

const PYTHON_KEYWORDS = new Set([
  'def','class','return','if','elif','else','for','while','import','from',
  'as','try','except','finally','raise','with','yield','lambda','pass',
  'break','continue','and','or','not','in','is','True','False','None',
  'self','print','range','len','list','dict','set','tuple','int','str','float',
  'async','await','global','nonlocal',
]);

const RUST_KEYWORDS = new Set([
  'fn','let','mut','const','struct','enum','impl','trait','pub','use','mod',
  'crate','self','super','return','if','else','for','while','loop','match',
  'break','continue','as','in','ref','move','async','await','dyn','where',
  'type','true','false','i32','u32','i64','u64','f32','f64','bool','String',
  'Vec','Option','Result','Some','None','Ok','Err','println','format',
]);

type LangId = 'typescript' | 'python' | 'rust' | 'json';

function getKeywordSet(lang: LangId): Set<string> {
  if (lang === 'python') return PYTHON_KEYWORDS;
  if (lang === 'rust') return RUST_KEYWORDS;
  return TS_KEYWORDS;
}

// Tokenize a line for syntax highlighting
interface Token { text: string; type: 'keyword'|'string'|'number'|'comment'|'type'|'bracket'|'operator'|'punctuation'|'normal' }

function tokenizeLine(line: string, lang: LangId): Token[] {
  if (lang === 'json') {
    // Simplified JSON tokenizer
    const tokens: Token[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        let j = i + 1;
        while (j < line.length && line[j] !== '"') { if (line[j] === '\\') j++; j++; }
        j++; // closing quote
        const str = line.slice(i, j);
        // Check if it's a key (followed by :)
        const rest = line.slice(j).trimStart();
        tokens.push({ text: str, type: rest.startsWith(':') ? 'type' : 'string' });
        i = j;
      } else if (/[0-9]/.test(line[i])) {
        let j = i;
        while (j < line.length && /[0-9.]/.test(line[j])) j++;
        tokens.push({ text: line.slice(i, j), type: 'number' });
        i = j;
      } else if (line.slice(i, i + 4) === 'true' || line.slice(i, i + 5) === 'false' || line.slice(i, i + 4) === 'null') {
        const word = line.slice(i).match(/^(true|false|null)/)![0];
        tokens.push({ text: word, type: 'keyword' });
        i += word.length;
      } else if ('[]{},: '.includes(line[i])) {
        tokens.push({ text: line[i], type: line[i] === ':' ? 'operator' : 'bracket' });
        i++;
      } else {
        tokens.push({ text: line[i], type: 'normal' });
        i++;
      }
    }
    return tokens;
  }

  const keywords = getKeywordSet(lang);
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // Comments
    if (line.slice(i, i + 2) === '//' || (lang === 'python' && line[i] === '#')) {
      tokens.push({ text: line.slice(i), type: 'comment' });
      break;
    }
    // Strings
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const q = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== q) { if (line[j] === '\\') j++; j++; }
      j++; // closing quote
      tokens.push({ text: line.slice(i, j), type: 'string' });
      i = j;
      continue;
    }
    // Numbers
    if (/[0-9]/.test(line[i]) && (i === 0 || !/[a-zA-Z_$]/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[0-9.xXaAbBcCdDeEfF_]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), type: 'number' });
      i = j;
      continue;
    }
    // Identifiers / keywords
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      if (keywords.has(word)) {
        tokens.push({ text: word, type: 'keyword' });
      } else if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
        tokens.push({ text: word, type: 'type' });
      } else {
        tokens.push({ text: word, type: 'normal' });
      }
      i = j;
      continue;
    }
    // Brackets
    if ('(){}[]<>'.includes(line[i])) {
      tokens.push({ text: line[i], type: 'bracket' });
      i++;
      continue;
    }
    // Operators
    if ('=>+-*/%!&|^~?:'.includes(line[i])) {
      // Grab multi-char operators
      let j = i + 1;
      while (j < line.length && '=>+-*/%!&|^~?:'.includes(line[j])) j++;
      tokens.push({ text: line.slice(i, j), type: 'operator' });
      i = j;
      continue;
    }
    // Punctuation
    if (',;.@#$'.includes(line[i])) {
      tokens.push({ text: line[i], type: 'punctuation' });
      i++;
      continue;
    }
    // Spaces and anything else
    tokens.push({ text: line[i], type: 'normal' });
    i++;
  }

  return tokens;
}

function getTokenColor(type: Token['type']): string {
  switch (type) {
    case 'keyword':     return '#c586c0'; // purple-pink (VS Code theme)
    case 'string':      return '#ce9178'; // warm orange
    case 'number':      return '#b5cea8'; // light green
    case 'comment':     return '#6a9955'; // forest green
    case 'type':        return '#4ec9b0'; // teal
    case 'bracket':     return '#ffd700'; // gold
    case 'operator':    return '#d4d4d4'; // white
    case 'punctuation': return '#808080'; // gray
    default:            return '#9cdcfe'; // light blue (variables)
  }
}

// ─── Code Snippets Library ───
interface CodeFile {
  id: string;
  name: string;
  language: LangId;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Elite';
  content: string;
}

const CODE_FILES: CodeFile[] = [
  {
    id: 'utils.ts',
    name: 'utils.ts',
    language: 'typescript',
    difficulty: 'Easy',
    content: `export const calculateWPM = (
  chars: number,
  timeMs: number
): number => {
  const words = chars / 5;
  const minutes = timeMs / 60000;
  return Math.round(words / minutes);
};

export const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};`
  },
  {
    id: 'App.tsx',
    name: 'App.tsx',
    language: 'typescript',
    difficulty: 'Medium',
    content: `import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}`
  },
  {
    id: 'server.py',
    name: 'server.py',
    language: 'python',
    difficulty: 'Medium',
    content: `from flask import Flask, jsonify, request

app = Flask(__name__)
users = []

@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify(users)

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    user = {
        'id': len(users) + 1,
        'name': data['name'],
        'email': data['email']
    }
    users.append(user)
    return jsonify(user), 201

if __name__ == '__main__':
    app.run(debug=True, port=8000)`
  },
  {
    id: 'main.rs',
    name: 'main.rs',
    language: 'rust',
    difficulty: 'Hard',
    content: `use std::collections::HashMap;

fn word_frequency(text: &str) -> HashMap<&str, u32> {
    let mut map = HashMap::new();
    for word in text.split_whitespace() {
        let count = map.entry(word).or_insert(0);
        *count += 1;
    }
    map
}

fn main() {
    let text = "the quick brown fox jumps over the lazy dog";
    let freq = word_frequency(text);
    for (word, count) in &freq {
        println!("{}: {}", word, count);
    }
}`
  },
  {
    id: 'tsconfig.json',
    name: 'tsconfig.json',
    language: 'json',
    difficulty: 'Easy',
    content: `{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve"
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}`
  },
  {
    id: 'hooks.ts',
    name: 'hooks.ts',
    language: 'typescript',
    difficulty: 'Hard',
    content: `import { useState, useEffect, useCallback, useRef } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}`
  },
];

const LANG_ICONS: Record<LangId, { icon: React.ReactNode; color: string; label: string }> = {
  typescript: { icon: <Braces className="w-4 h-4" />, color: '#3178c6', label: 'TypeScript' },
  python:     { icon: <FileCode2 className="w-4 h-4" />, color: '#3776ab', label: 'Python' },
  rust:       { icon: <Hash className="w-4 h-4" />, color: '#dea584', label: 'Rust' },
  json:       { icon: <FileJson className="w-4 h-4" />, color: '#cbcb41', label: 'JSON' },
};

const DIFF_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Easy:  { bg: 'rgba(57,255,20,0.08)', border: 'rgba(57,255,20,0.3)', text: '#39FF14' },
  Medium:{ bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.3)', text: '#06b6d4' },
  Hard:  { bg: 'rgba(168,85,247,0.08)',border: 'rgba(168,85,247,0.3)',text: '#a855f7' },
  Elite: { bg: 'rgba(255,165,0,0.08)', border: 'rgba(255,165,0,0.3)', text: '#ffa500' },
};

// ─── Particle System ───
interface Particle { id: number; x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }

function ParticleCanvas({ particles }: { particles: Particle[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  particlesRef.current = particles;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particlesRef.current) {
        if (p.life <= 0) continue;
        ctx.globalAlpha = Math.min(p.life / 30, 1);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.life--;
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      frameRef.current = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-30" />;
}

// ─── Main Component ───
export default function CodePracticeClient() {
  const [activeFileId, setActiveFileId] = useState(CODE_FILES[0].id);
  const activeFile = CODE_FILES.find(f => f.id === activeFileId) || CODE_FILES[0];

  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [errors, setErrors] = useState(0);
  const [totalKeys, setTotalKeys] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showTerminal, setShowTerminal] = useState(true);
  const [terminalLines, setTerminalLines] = useState<string[]>(['$ typeforge compile --watch', '⚡ Watching for changes...']);
  const [liveWPM, setLiveWPM] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const particleIdRef = useRef(0);

  // Focus management
  useEffect(() => {
    const handleClick = () => inputRef.current?.focus();
    document.addEventListener('click', handleClick);
    inputRef.current?.focus();
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Live WPM ticker
  useEffect(() => {
    if (!startTime || isFinished) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 60000;
      if (elapsed > 0) {
        setLiveWPM(Math.round((typed.length / 5) / elapsed));
      }
    }, 300);
    return () => clearInterval(interval);
  }, [startTime, typed.length, isFinished]);

  const reset = useCallback(() => {
    setTyped('');
    setStartTime(null);
    setIsFinished(false);
    setErrors(0);
    setTotalKeys(0);
    setCombo(0);
    setMaxCombo(0);
    setParticles([]);
    setLiveWPM(0);
    setTerminalLines(['$ typeforge compile --watch', '⚡ Watching for changes...']);
    inputRef.current?.focus();
  }, []);

  useEffect(() => { reset(); }, [activeFileId, reset]);

  const spawnParticles = useCallback((correct: boolean) => {
    if (!editorRef.current) return;
    // Find caret position from DOM
    const caret = editorRef.current.querySelector('[data-caret="true"]');
    if (!caret) return;
    const rect = caret.getBoundingClientRect();
    const containerRect = editorRef.current.getBoundingClientRect();
    const cx = rect.left - containerRect.left + rect.width / 2;
    const cy = rect.top - containerRect.top + rect.height / 2;

    const count = correct ? (combo > 20 ? 12 : combo > 10 ? 8 : 5) : 3;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * (correct ? 6 : 3),
        vy: (Math.random() - 1) * (correct ? 5 : 2),
        life: 25 + Math.random() * 15,
        color: correct
          ? (combo > 20 ? '#ffd700' : combo > 10 ? '#ff6b35' : '#39FF14')
          : '#ff4d6d',
        size: correct ? 1.5 + Math.random() * 2.5 : 1 + Math.random(),
      });
    }
    setParticles(prev => [...prev.filter(p => p.life > 0), ...newParticles]);
  }, [combo]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') { e.preventDefault(); return; }
    if (isFinished) { if (e.key === 'Escape') reset(); return; }

    if (e.key === 'Backspace') {
      setTyped(prev => prev.slice(0, -1));
      setCombo(0);
      return;
    }

    if (e.key === 'Enter') {
      const expected = activeFile.content[typed.length];
      if (expected === '\n') {
        setTyped(prev => prev + '\n');
        setTotalKeys(prev => prev + 1);
        setCombo(prev => { const n = prev + 1; if (n > maxCombo) setMaxCombo(n); return n; });
        spawnParticles(true);

        // Terminal feedback
        if (combo > 0 && combo % 10 === 9) {
          setTerminalLines(prev => [...prev, `🔥 ${combo + 1}x COMBO! Keep going!`]);
        }
      }
      return;
    }

    if (e.key.length !== 1) return;

    if (!startTime) {
      setStartTime(Date.now());
      setTerminalLines(prev => [...prev, '▶ Execution started...']);
    }

    const expected = activeFile.content[typed.length];
    const isCorrect = e.key === expected;

    setTotalKeys(prev => prev + 1);

    if (isCorrect) {
      const newTyped = typed + e.key;
      setTyped(newTyped);
      setCombo(prev => { const n = prev + 1; if (n > maxCombo) setMaxCombo(n); return n; });
      spawnParticles(true);

      // Combo milestones
      if ((combo + 1) % 25 === 0) {
        setTerminalLines(prev => [...prev, `🏆 ${combo + 1}x COMBO MILESTONE!`]);
      }

      // Check finish
      if (newTyped.length === activeFile.content.length) {
        setIsFinished(true);
        const duration = Date.now() - (startTime || Date.now());
        const wpm = Math.round((newTyped.length / 5) / (duration / 60000));
        const accuracy = totalKeys > 0 ? Math.round(((totalKeys + 1 - errors) / (totalKeys + 1)) * 100) : 100;
        setLiveWPM(wpm);
        setTerminalLines(prev => [
          ...prev,
          '',
          '══════════════════════════════════',
          `✅ BUILD SUCCESSFUL`,
          `   Speed:    ${wpm} WPM`,
          `   Accuracy: ${accuracy}%`,
          `   Time:     ${(duration / 1000).toFixed(1)}s`,
          `   Max Combo: ${Math.max(maxCombo, combo + 1)}x`,
          '══════════════════════════════════',
          '',
          '$ _'
        ]);
      }
    } else {
      setErrors(prev => prev + 1);
      setCombo(0);
      spawnParticles(false);
      setTerminalLines(prev => [...prev, `⚠ TypeError: Expected '${expected}' but received '${e.key}'`]);
    }
  };

  // Computed stats
  const accuracy = totalKeys > 0 ? Math.round(((totalKeys - errors) / totalKeys) * 100) : 100;
  const progress = activeFile.content.length > 0 ? Math.round((typed.length / activeFile.content.length) * 100) : 0;
  const lines = activeFile.content.split('\n');

  // Compute current line/col
  const currentLine = typed.split('\n').length;
  const currentCol = (typed.split('\n').pop() || '').length + 1;

  // Tokenize all lines for syntax highlighting
  const tokenizedLines = useMemo(() => lines.map(l => tokenizeLine(l, activeFile.language)), [lines, activeFile.language]);

  // Cumulative indices for each line
  const lineStarts = useMemo(() => {
    const starts: number[] = [];
    let idx = 0;
    for (const line of lines) {
      starts.push(idx);
      idx += line.length + 1;
    }
    return starts;
  }, [lines]);

  const langInfo = LANG_ICONS[activeFile.language];
  const diffColors = DIFF_COLORS[activeFile.difficulty];

  // Combo tier label
  const comboTier = combo >= 50 ? 'LEGENDARY' : combo >= 25 ? 'UNSTOPPABLE' : combo >= 15 ? 'ON FIRE' : combo >= 10 ? 'GREAT' : combo >= 5 ? 'NICE' : '';
  const comboColor = combo >= 50 ? '#ffd700' : combo >= 25 ? '#ff6b35' : combo >= 15 ? '#ff4d6d' : combo >= 10 ? '#06b6d4' : '#39FF14';

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#1e1e1e] text-[#cccccc] shadow-[0_0_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)] font-sans relative">

      {/* ── Live HUD Overlay ── */}
      {startTime && !isFinished && (
        <div className="absolute top-3 right-3 z-40 flex items-center gap-3">
          {/* Combo */}
          <AnimatePresence>
            {combo >= 5 && (
              <motion.div
                key="combo"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
                style={{ background: `${comboColor}15`, border: `1px solid ${comboColor}40` }}
              >
                <Flame className="w-4 h-4" style={{ color: comboColor }} />
                <span className="text-sm font-black" style={{ color: comboColor }}>{combo}x</span>
                {comboTier && <span className="text-[9px] font-black tracking-widest uppercase" style={{ color: comboColor }}>{comboTier}</span>}
              </motion.div>
            )}
          </AnimatePresence>
          {/* WPM */}
          <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-1.5">
            <Gauge className="w-4 h-4 text-accent-300" />
            <span className="text-sm font-black text-accent-300">{liveWPM}</span>
            <span className="text-[10px] text-gray-500">WPM</span>
          </div>
          {/* Accuracy */}
          <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-1.5">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-sm font-black text-cyan-400">{accuracy}%</span>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-sm font-black text-purple-400">{progress}%</span>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* ── Activity Bar (Left) ── */}
        <div className="flex w-12 flex-col items-center border-r border-[#2d2d2d] bg-[#181818] py-3 shrink-0">
          <div className="flex flex-col gap-5 w-full items-center">
            <div className="relative group cursor-pointer text-white">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white rounded-r" />
              <Files className="w-[22px] h-[22px] stroke-[1.5]" />
            </div>
            <Search className="w-[22px] h-[22px] stroke-[1.5] text-[#858585] hover:text-white cursor-pointer transition-colors" />
            <GitBranch className="w-[22px] h-[22px] stroke-[1.5] text-[#858585] hover:text-white cursor-pointer transition-colors" />
            <LayoutGrid className="w-[22px] h-[22px] stroke-[1.5] text-[#858585] hover:text-white cursor-pointer transition-colors" />
          </div>
          <div className="mt-auto flex flex-col gap-5 w-full items-center">
            <Settings className="w-[22px] h-[22px] stroke-[1.5] text-[#858585] hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>

        {/* ── Sidebar (Explorer) ── */}
        <div className="w-60 border-r border-[#2d2d2d] bg-[#181818] flex flex-col shrink-0 overflow-y-auto">
          <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#bbbbbb]">
            Explorer
          </div>
          <div className="px-2">
            <div className="flex items-center gap-1 px-1.5 py-1 text-[12px] font-bold text-[#cccccc]">
              <ChevronDown className="w-4 h-4" /> TYPEFORGE
            </div>
            <div className="mt-0.5 flex flex-col">
              {CODE_FILES.map(file => {
                const isActive = file.id === activeFileId;
                const li = LANG_ICONS[file.language];
                const dc = DIFF_COLORS[file.difficulty];
                return (
                  <div
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={cn(
                      "flex items-center gap-2 pl-7 pr-2 py-[5px] cursor-pointer text-[13px] transition-all duration-150 rounded-sm",
                      isActive ? "bg-[#37373d] text-white" : "text-[#cccccc] hover:bg-[#2a2d2e]"
                    )}
                  >
                    <span style={{ color: li.color }}>{li.icon}</span>
                    <span className="flex-1 truncate">{file.name}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm" style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}>
                      {file.difficulty}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Main Editor Area ── */}
        <div className="flex flex-1 flex-col min-w-0 relative">

          {/* Editor Tabs */}
          <div className="flex h-[35px] bg-[#252526] overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
            {CODE_FILES.map(file => {
              const isActive = file.id === activeFileId;
              const li = LANG_ICONS[file.language];
              return (
                <div
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 cursor-pointer min-w-fit transition-all duration-150 text-[13px] border-r border-[#252526]",
                    isActive
                      ? "bg-[#1e1e1e] text-white"
                      : "bg-[#2d2d2d] text-[#969696] hover:bg-[#2d2d2d]"
                  )}
                  style={isActive ? { borderTop: `2px solid ${li.color}` } : { borderTop: '2px solid transparent' }}
                >
                  <span style={{ color: li.color }}>{li.icon}</span>
                  <span>{file.name}</span>
                  <X className={cn("w-3.5 h-3.5 ml-1 rounded-sm hover:bg-white/10 transition-colors", isActive ? "text-[#969696]" : "text-transparent")} />
                </div>
              );
            })}
            <div className="flex-1 bg-[#252526]" />
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center h-[22px] px-4 text-[12px] text-[#969696] bg-[#1e1e1e] border-b border-[#2d2d2d] shrink-0">
            <span>TypeForge</span>
            <ChevronRight className="w-3 h-3 mx-1 text-[#585858]" />
            <span>src</span>
            <ChevronRight className="w-3 h-3 mx-1 text-[#585858]" />
            <span style={{ color: langInfo.color }}>{activeFile.name}</span>
            <span className="ml-auto text-[10px] text-[#585858]">Click anywhere to focus</span>
          </div>

          {/* Hidden Input for capturing keystrokes */}
          <input
            ref={inputRef}
            className="absolute opacity-0 -z-10 w-0 h-0"
            onKeyDown={handleKeyDown}
            autoFocus
            aria-label="Code typing input"
          />

          {/* ── Code Editor + Minimap ── */}
          <div className="flex flex-1 min-h-0 relative">
            {/* Editor */}
            <div ref={editorRef} className="flex-1 overflow-y-auto overflow-x-auto py-2 relative" style={{ fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace", fontSize: '14px', lineHeight: '1.65', scrollbarWidth: 'thin', scrollbarColor: '#424242 transparent' }}>

              {/* Particle canvas */}
              <ParticleCanvas particles={particles} />

              {/* Finish overlay */}
              <AnimatePresence>
                {isFinished && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute inset-x-0 bottom-8 z-40 mx-auto max-w-md rounded-2xl border border-accent-300/20 bg-[#0d0d0d]/95 p-8 shadow-[0_0_60px_rgba(57,255,20,0.12),0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
                  >
                    <div className="text-center mb-6">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                        <Sparkles className="w-10 h-10 text-accent-300 mx-auto mb-3" />
                      </motion.div>
                      <h3 className="text-2xl font-black text-white">Build Successful</h3>
                      <p className="text-sm text-gray-500 mt-1">Zero errors. Ship it.</p>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {[
                        { label: 'SPEED', value: `${liveWPM}`, unit: 'WPM', color: '#39FF14', icon: <Gauge className="w-4 h-4" /> },
                        { label: 'ACCURACY', value: `${accuracy}`, unit: '%', color: '#06b6d4', icon: <Target className="w-4 h-4" /> },
                        { label: 'TIME', value: `${((Date.now() - (startTime || Date.now())) / 1000).toFixed(1)}`, unit: 's', color: '#a855f7', icon: <Clock className="w-4 h-4" /> },
                        { label: 'MAX COMBO', value: `${Math.max(maxCombo, combo)}`, unit: 'x', color: '#ffd700', icon: <Flame className="w-4 h-4" /> },
                      ].map(stat => (
                        <div key={stat.label} className="text-center rounded-xl p-3" style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}20` }}>
                          <div className="flex justify-center mb-1" style={{ color: stat.color }}>{stat.icon}</div>
                          <p className="text-[9px] font-bold tracking-widest text-gray-600 uppercase">{stat.label}</p>
                          <p className="text-xl font-black mt-0.5" style={{ color: stat.color }}>
                            {stat.value}<span className="text-[10px] text-gray-500 ml-0.5">{stat.unit}</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={reset}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-300 py-3 text-sm font-black text-black transition-all hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] active:scale-95"
                    >
                      <RotateCcw className="h-4 w-4" /> Run Again
                      <span className="text-xs font-medium opacity-60 ml-1">(Esc)</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Syntax-highlighted code lines */}
              <table className="w-full border-spacing-0 border-collapse">
                <tbody>
                  {tokenizedLines.map((tokens, lineIdx) => {
                    const lineStart = lineStarts[lineIdx];
                    const lineEnd = lineStart + lines[lineIdx].length;
                    const isCurrentLine = typed.length >= lineStart && typed.length <= lineEnd;
                    const isCompletedLine = typed.length > lineEnd;

                    return (
                      <tr key={lineIdx} className={cn("transition-colors duration-100", isCurrentLine ? "bg-[#282828]" : "hover:bg-[#2a2d2e]/50")}>
                        {/* Line numbers */}
                        <td className="w-[60px] text-right pr-5 select-none align-top" style={{ paddingTop: '0px' }}>
                          <span className={cn(
                            "text-[13px] transition-colors tabular-nums",
                            isCurrentLine ? "text-[#c6c6c6]" : "text-[#858585]"
                          )}>
                            {lineIdx + 1}
                          </span>
                        </td>

                        {/* Code content */}
                        <td className="whitespace-pre relative">
                          {/* Current line highlight bar */}
                          {isCurrentLine && (
                            <div className="absolute left-[-60px] top-0 bottom-0 w-[2px] bg-accent-300/60" />
                          )}
                          {(() => {
                            let charOffset = 0;
                            return tokens.map((token, tIdx) => {
                              const chars = token.text.split('').map((char, cIdx) => {
                                const globalIdx = lineStart + charOffset + cIdx;
                                const isTypedChar = globalIdx < typed.length;
                                const isCorrectChar = isTypedChar && typed[globalIdx] === char;
                                const isWrongChar = isTypedChar && typed[globalIdx] !== char;
                                const isCaretChar = globalIdx === typed.length && !isFinished;

                                let color: string;
                                let bg = 'transparent';
                                let shadow = 'none';

                                if (isCorrectChar) {
                                  color = getTokenColor(token.type); // Show actual syntax color when correct!
                                  shadow = `0 0 8px ${getTokenColor(token.type)}40`;
                                } else if (isWrongChar) {
                                  color = '#ff4d6d';
                                  bg = 'rgba(255,77,109,0.15)';
                                } else if (!isTypedChar) {
                                  color = '#3e3e3e'; // Dimmed ghost text
                                } else {
                                  color = '#d4d4d4';
                                }

                                return (
                                  <span key={cIdx} className="relative" style={{ display: 'inline' }}>
                                    {isCaretChar && (
                                      <motion.span
                                        data-caret="true"
                                        className="absolute left-0 top-[1px] bottom-[1px] w-[2px] rounded-full pointer-events-none z-20"
                                        style={{
                                          background: 'linear-gradient(180deg, #39FF14, #00cc00)',
                                          boxShadow: '0 0 8px #39FF14, 0 0 20px rgba(57,255,20,0.4)',
                                        }}
                                        animate={{ opacity: [1, 0.2, 1] }}
                                        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                                      />
                                    )}
                                    <span
                                      style={{ color, backgroundColor: bg, textShadow: shadow }}
                                      className="relative z-10 transition-colors duration-75"
                                    >
                                      {char}
                                    </span>
                                  </span>
                                );
                              });
                              charOffset += token.text.length;
                              return <span key={tIdx}>{chars}</span>;
                            });
                          })()}

                          {/* Enter symbol at line end */}
                          {lineIdx < lines.length - 1 && (
                            <span className="relative inline-block ml-0.5">
                              {typed.length === lineStart + lines[lineIdx].length && !isFinished && (
                                <motion.span
                                  data-caret="true"
                                  className="absolute left-0 top-[1px] bottom-[1px] w-[2px] rounded-full pointer-events-none z-20"
                                  style={{
                                    background: 'linear-gradient(180deg, #39FF14, #00cc00)',
                                    boxShadow: '0 0 8px #39FF14, 0 0 20px rgba(57,255,20,0.4)',
                                  }}
                                  animate={{ opacity: [1, 0.2, 1] }}
                                  transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                                />
                              )}
                              <span className={cn(
                                "text-[10px]",
                                typed.length > lineStart + lines[lineIdx].length
                                  ? "text-accent-300/30"
                                  : "text-[#3e3e3e]"
                              )}>
                                ↵
                              </span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Minimap (Right) ── */}
            <div className="w-[80px] border-l border-[#2d2d2d] bg-[#1e1e1e] overflow-hidden shrink-0 relative hidden lg:block">
              <div className="p-2 opacity-60" style={{ fontSize: '2px', lineHeight: '3px', fontFamily: 'monospace' }}>
                {lines.map((line, i) => {
                  const ls = lineStarts[i];
                  const lineComplete = typed.length > ls + line.length;
                  return (
                    <div key={i} className="whitespace-pre overflow-hidden" style={{ color: lineComplete ? '#39FF1440' : '#ffffff15', maxHeight: '3px' }}>
                      {line || ' '}
                    </div>
                  );
                })}
              </div>
              {/* Viewport indicator */}
              <div className="absolute right-0 w-full bg-white/[0.05] border border-white/[0.08] rounded-sm" style={{ top: '8px', height: '40px' }} />
            </div>
          </div>

          {/* ── Terminal Panel ── */}
          {showTerminal && (
            <div className="h-36 border-t border-[#2d2d2d] bg-[#1e1e1e] flex flex-col shrink-0">
              <div className="flex items-center h-[30px] bg-[#252526] px-3 text-[12px] border-b border-[#2d2d2d] gap-4 shrink-0">
                <span className="flex items-center gap-1.5 text-white font-medium border-b border-white pb-0.5 -mb-[1px]">
                  <TerminalIcon className="w-3.5 h-3.5" /> TERMINAL
                </span>
                <span className="text-[#969696] cursor-pointer hover:text-white transition-colors">OUTPUT</span>
                <span className="text-[#969696] cursor-pointer hover:text-white transition-colors">PROBLEMS</span>
                <div className="ml-auto flex items-center gap-2">
                  <X className="w-3.5 h-3.5 text-[#969696] hover:text-white cursor-pointer transition-colors" onClick={() => setShowTerminal(false)} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-[12px] leading-relaxed" style={{ scrollbarWidth: 'thin', scrollbarColor: '#424242 transparent' }}>
                {terminalLines.map((line, i) => (
                  <div key={i} className={cn(
                    line.startsWith('✅') ? 'text-accent-300 font-bold' :
                    line.startsWith('⚠') ? 'text-red-400' :
                    line.startsWith('🔥') || line.startsWith('🏆') ? 'text-yellow-400 font-bold' :
                    line.startsWith('▶') ? 'text-cyan-400' :
                    line.startsWith('═') ? 'text-[#585858]' :
                    'text-[#cccccc]'
                  )}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Status Bar (Bottom) ── */}
      <div className="flex h-[22px] items-center bg-[#007acc] px-3 text-[11px] text-white shrink-0 z-10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 cursor-pointer hover:bg-white/20 px-1 rounded transition-colors"><GitBranch className="w-3 h-3" /> main*</span>
          <span className="flex items-center gap-1 cursor-pointer hover:bg-white/20 px-1 rounded transition-colors"><X className="w-3 h-3" /> {errors} <span className="text-yellow-300">⚠</span> 0</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded transition-colors">Ln {currentLine}, Col {currentCol}</span>
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded transition-colors">Spaces: 2</span>
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded transition-colors">UTF-8</span>
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded transition-colors" style={{ color: langInfo.color }}>{langInfo.label}</span>
          {!showTerminal && (
            <span className="cursor-pointer hover:bg-white/20 px-1 rounded transition-colors flex items-center gap-1" onClick={() => setShowTerminal(true)}>
              <TerminalIcon className="w-3 h-3" /> Terminal
            </span>
          )}
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded transition-colors flex items-center gap-1"><Play className="w-3 h-3" /> Prettier</span>
        </div>
      </div>

      {/* ── Progress bar (Top edge) ── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-50">
        <motion.div
          className="h-full"
          style={{ background: 'linear-gradient(90deg, #39FF14, #06b6d4, #a855f7)', width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.15 }}
        />
      </div>
    </div>
  );
}
