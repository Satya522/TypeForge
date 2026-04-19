"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Trophy, ShieldAlert, Skull, Zap, Heart } from "lucide-react";

/* ─── CONSTANTS ──────────────────────────────────────── */
const CORE_HP = 100;
const WAVE_COOLDOWN = 3000; // ms between waves
const BASE_ENEMY_SPEED = 0.3;
const SPAWN_RADIUS_FACTOR = 0.48; // fraction of min(W,H)

const WORD_POOL_EASY = [
  "hack", "byte", "node", "ping", "sync", "data", "port", "link",
  "code", "root", "exec", "scan", "wire", "lock", "void", "grid",
  "bash", "core", "chip", "loop", "heap", "flag", "sudo", "null",
];
const WORD_POOL_MED = [
  "cipher", "kernel", "daemon", "packet", "inject", "breach",
  "shield", "socket", "thread", "binary", "decode", "access",
  "vector", "filter", "tunnel", "module", "proxy", "buffer",
  "script", "render", "deploy", "signal", "cypher", "matrix",
];
const WORD_POOL_HARD = [
  "firewall", "protocol", "compiler", "overflow", "rootkit",
  "firmware", "deadlock", "debugger", "malware", "exploit",
  "backdoor", "endpoint", "traverse", "allocate", "dispatch",
  "sequence", "compress", "decrypts", "terminal", "interlock",
];

/* ─── TYPES ──────────────────────────────────────────── */
interface Enemy {
  id: number;
  word: string;
  angle: number; // radians
  dist: number;  // distance from center (starts at spawnRadius, approaches 0)
  speed: number;
  hp: number;
  color: string; // hsl string
  typed: number; // how many chars typed
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
}

interface LaserBeam {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  life: number;
  color: string;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  color: string;
}

interface AmbientStar {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
}

/* ─── HELPERS ────────────────────────────────────────── */
function pickWord(wave: number, usedWords: Set<string>): string {
  let pool: string[];
  if (wave <= 3) pool = WORD_POOL_EASY;
  else if (wave <= 7) pool = [...WORD_POOL_EASY, ...WORD_POOL_MED];
  else pool = [...WORD_POOL_EASY, ...WORD_POOL_MED, ...WORD_POOL_HARD];

  const available = pool.filter(w => !usedWords.has(w));
  const src = available.length > 0 ? available : pool;
  return src[Math.floor(Math.random() * src.length)];
}

function enemiesForWave(wave: number): number {
  return Math.min(3 + wave * 2, 20);
}

function speedForWave(wave: number): number {
  return BASE_ENEMY_SPEED + wave * 0.04;
}

const ENEMY_COLORS = [
  "0, 255, 255",    // cyan
  "255, 0, 128",    // hot pink
  "255, 170, 0",    // amber
  "128, 0, 255",    // purple
  "0, 255, 128",    // mint
  "255, 80, 80",    // coral
];

/* ─── COMPONENT ──────────────────────────────────────── */
export default function CyberDefendGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [status, setStatus] = useState<"idle" | "countdown" | "playing" | "waveBreak" | "gameover">("idle");
  const [countdown, setCountdown] = useState(3);
  const [wave, setWave] = useState(1);
  const [coreHp, setCoreHp] = useState(CORE_HP);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [typed, setTyped] = useState("");
  const [kills, setKills] = useState(0);
  const [totalWords, setTotalWords] = useState(0);

  // Engine refs (not in state for perf)
  const engine = useRef({
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    lasers: [] as LaserBeam[],
    shockwaves: [] as Shockwave[],
    ambientStars: [] as AmbientStar[],
    width: 800,
    height: 600,
    coreX: 400,
    coreY: 300,
    spawnRadius: 350,
    coreHp: CORE_HP,
    score: 0,
    combo: 0,
    bestCombo: 0,
    kills: 0,
    wave: 1,
    enemyIdCounter: 0,
    enemiesToSpawn: 0,
    spawnTimer: 0,
    coreRotation: 0,
    corePulse: 0,
    damageFlash: 0,
    killFlash: 0,
    activeTargetId: null as number | null,
    typed: "",
    usedWords: new Set<string>(),
    rafId: 0,
    status: "idle" as string,
  });

  /* ─── AUDIO ────────────────────────────────────────── */
  const playSound = useCallback((type: "kill" | "hit" | "type" | "fail" | "wave" | "launch") => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === "kill") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
      } else if (type === "hit") {
        osc.type = "square";
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
      } else if (type === "type") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(500 + Math.random() * 300, now);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now); osc.stop(now + 0.04);
      } else if (type === "fail") {
        osc.type = "square";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
        osc.start(now); osc.stop(now + 0.12);
      } else if (type === "wave") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
      } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.6);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.6);
        osc.start(now); osc.stop(now + 0.6);
      }
    } catch {}
  }, []);

  /* ─── RESIZE ───────────────────────────────────────── */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    engine.current.width = w;
    engine.current.height = h;
    engine.current.coreX = w / 2;
    engine.current.coreY = h / 2;
    engine.current.spawnRadius = Math.min(w, h) * SPAWN_RADIUS_FACTOR;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  /* ─── SPAWN ENEMY ──────────────────────────────────── */
  const spawnEnemy = useCallback(() => {
    const eng = engine.current;
    const angle = Math.random() * Math.PI * 2;
    const word = pickWord(eng.wave, eng.usedWords);
    eng.usedWords.add(word);
    const color = ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)];

    eng.enemies.push({
      id: ++eng.enemyIdCounter,
      word,
      angle,
      dist: eng.spawnRadius + 40,
      speed: speedForWave(eng.wave) + Math.random() * 0.15,
      hp: 1,
      color,
      typed: 0,
    });
  }, []);

  /* ─── KILL ENEMY ───────────────────────────────────── */
  const killEnemy = useCallback((enemy: Enemy) => {
    const eng = engine.current;
    const ex = eng.coreX + Math.cos(enemy.angle) * enemy.dist;
    const ey = eng.coreY + Math.sin(enemy.angle) * enemy.dist;

    // Spawn explosion particles
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 5;
      eng.particles.push({
        x: ex, y: ey,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 40 + Math.random() * 30,
        maxLife: 70,
        radius: 1.5 + Math.random() * 3.5,
        color: enemy.color,
      });
    }

    // Shockwave ring
    eng.shockwaves.push({
      x: ex, y: ey,
      radius: 5,
      maxRadius: 80 + enemy.word.length * 8,
      life: 1,
      color: enemy.color,
    });

    // Laser beam from core to enemy
    eng.lasers.push({
      fromX: eng.coreX, fromY: eng.coreY,
      toX: ex, toY: ey,
      life: 12,
      color: enemy.color,
    });

    eng.killFlash = 8;
    eng.combo++;
    if (eng.combo > eng.bestCombo) eng.bestCombo = eng.combo;
    eng.kills++;

    // Score: base + combo bonus + wave bonus
    const pts = Math.round((enemy.word.length * 15 + eng.combo * 10) * (1 + eng.wave * 0.1));
    eng.score += pts;

    // Remove enemy
    eng.enemies = eng.enemies.filter(e => e.id !== enemy.id);
    eng.activeTargetId = null;
    eng.typed = "";

    // Sync state
    setCombo(eng.combo);
    setBestCombo(eng.bestCombo);
    setScore(eng.score);
    setKills(eng.kills);
    setTyped("");

    playSound("kill");
  }, [playSound]);

  /* ─── CORE HIT ─────────────────────────────────────── */
  const coreHit = useCallback((damage: number) => {
    const eng = engine.current;
    eng.coreHp = Math.max(0, eng.coreHp - damage);
    eng.damageFlash = 15;
    eng.combo = 0;
    setCombo(0);
    setCoreHp(eng.coreHp);
    playSound("hit");

    if (eng.coreHp <= 0) {
      eng.status = "gameover";
      setStatus("gameover");
    }
  }, [playSound]);

  /* ─── START WAVE ───────────────────────────────────── */
  const startWave = useCallback((waveNum: number) => {
    const eng = engine.current;
    eng.wave = waveNum;
    eng.enemiesToSpawn = enemiesForWave(waveNum);
    eng.spawnTimer = 0;
    eng.usedWords.clear();
    eng.status = "playing";
    setWave(waveNum);
    setStatus("playing");
    setTotalWords(prev => prev + 0); // keep total
    playSound("wave");
  }, [playSound]);

  /* ─── INIT GAME ────────────────────────────────────── */
  const initGame = useCallback(() => {
    const eng = engine.current;
    eng.enemies = [];
    eng.particles = [];
    eng.lasers = [];
    eng.shockwaves = [];
    eng.coreHp = CORE_HP;
    eng.score = 0;
    eng.combo = 0;
    eng.bestCombo = 0;
    eng.kills = 0;
    eng.wave = 1;
    eng.enemyIdCounter = 0;
    eng.enemiesToSpawn = 0;
    eng.activeTargetId = null;
    eng.typed = "";
    eng.damageFlash = 0;
    eng.killFlash = 0;
    eng.usedWords.clear();

    setCoreHp(CORE_HP);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setKills(0);
    setTotalWords(0);
    setTyped("");

    setStatus("countdown");
    setCountdown(3);
  }, []);

  /* ─── COUNTDOWN ────────────────────────────────────── */
  useEffect(() => {
    if (status !== "countdown") return;
    if (countdown > 0) {
      playSound("normal");
      const t = setTimeout(() => setCountdown(c => c - 1), 800);
      return () => clearTimeout(t);
    } else {
      playSound("launch");
      startWave(1);
    }
  }, [status, countdown, playSound, startWave]);

  /* ─── WAVE BREAK ───────────────────────────────────── */
  useEffect(() => {
    if (status !== "waveBreak") return;
    const t = setTimeout(() => {
      startWave(wave + 1);
    }, WAVE_COOLDOWN);
    return () => clearTimeout(t);
  }, [status, wave, startWave]);

  /* ─── FOCUS MANAGEMENT ─────────────────────────────── */
  useEffect(() => {
    if (status !== "playing") return;
    const t = setInterval(() => inputRef.current?.focus(), 500);
    return () => clearInterval(t);
  }, [status]);

  /* ─── INPUT HANDLER ────────────────────────────────── */
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const eng = engine.current;
    if (eng.status !== "playing") return;

    const val = e.target.value.toLowerCase();
    
    // If backspace/delete
    if (val.length < eng.typed.length) {
      eng.typed = val;
      setTyped(val);
      // Recalculate target
      if (val.length === 0) {
        eng.activeTargetId = null;
        // Reset all typed progress
        eng.enemies.forEach(e => e.typed = 0);
      } else if (eng.activeTargetId !== null) {
        const target = eng.enemies.find(e => e.id === eng.activeTargetId);
        if (target && target.word.startsWith(val)) {
          target.typed = val.length;
        } else {
          eng.activeTargetId = null;
          eng.enemies.forEach(e => e.typed = 0);
        }
      }
      return;
    }

    const newChar = val[val.length - 1];
    if (!newChar) return;

    // If no target, find one
    if (eng.activeTargetId === null) {
      // Find closest enemy whose word starts with the typed string
      const matchingEnemies = eng.enemies
        .filter(e => e.word.startsWith(val))
        .sort((a, b) => a.dist - b.dist); // closest first

      if (matchingEnemies.length > 0) {
        const target = matchingEnemies[0];
        eng.activeTargetId = target.id;
        target.typed = val.length;
        eng.typed = val;
        setTyped(val);
        playSound("normal");
      } else {
        // Wrong key
        playSound("fail");
        eng.combo = 0;
        setCombo(0);
        return;
      }
    } else {
      // We have a target, validate
      const target = eng.enemies.find(e => e.id === eng.activeTargetId);
      if (!target) {
        eng.activeTargetId = null;
        eng.typed = "";
        setTyped("");
        return;
      }

      if (target.word.startsWith(val)) {
        target.typed = val.length;
        eng.typed = val;
        setTyped(val);
        playSound("normal");

        // Check if word completed
        if (val === target.word) {
          setTotalWords(prev => prev + 1);
          killEnemy(target);
          if (inputRef.current) inputRef.current.value = "";
          return;
        }
      } else {
        // Wrong key
        playSound("fail");
        eng.combo = 0;
        setCombo(0);
        return;
      }
    }
  }, [killEnemy, playSound]);

  /* ─── RENDER ENGINE ────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf: number;
    let frameCount = 0;

    const loop = () => {
      const eng = engine.current;
      const W = eng.width;
      const H = eng.height;
      const CX = eng.coreX;
      const CY = eng.coreY;
      const time = performance.now() * 0.001;
      frameCount++;

      // Clear with subtle trail
      ctx.fillStyle = "rgba(2, 1, 8, 0.35)";
      ctx.fillRect(0, 0, W, H);

      // ── Init Ambient Stars (once) ──
      if (eng.ambientStars.length === 0) {
        for (let i = 0; i < 80; i++) {
          eng.ambientStars.push({
            x: Math.random() * W,
            y: Math.random() * H,
            radius: 0.4 + Math.random() * 1.2,
            alpha: 0.1 + Math.random() * 0.4,
            speed: 0.05 + Math.random() * 0.15,
          });
        }
      }

      // ── Ambient Stars ──
      for (const star of eng.ambientStars) {
        star.alpha = 0.15 + Math.sin(time * star.speed * 10 + star.x) * 0.15;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 200, 255, ${star.alpha})`;
        ctx.fill();
      }

      // ── Radar Concentric Rings ──
      const radarRings = 5;
      for (let r = 1; r <= radarRings; r++) {
        const ringR = (eng.spawnRadius / radarRings) * r;
        const ringAlpha = 0.02 + (r === radarRings ? 0.06 : 0);
        ctx.beginPath();
        ctx.arc(CX, CY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 255, ${ringAlpha})`;
        ctx.lineWidth = r === radarRings ? 1.5 : 0.5;
        ctx.stroke();
      }

      // ── Radar Sweep ──
      const sweepAngle = time * 0.8;
      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(sweepAngle);
      const sweepGrad = ctx.createLinearGradient(0, 0, eng.spawnRadius, 0);
      sweepGrad.addColorStop(0, "rgba(0, 255, 255, 0.08)");
      sweepGrad.addColorStop(1, "transparent");
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, eng.spawnRadius, -0.15, 0.15);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // ── Background Radial Pulse ──
      const pulseAlpha = 0.03 + Math.sin(time * 1.5) * 0.015;
      const bgGlow = ctx.createRadialGradient(CX, CY, 0, CX, CY, eng.spawnRadius);
      bgGlow.addColorStop(0, `rgba(0, 255, 255, ${pulseAlpha})`);
      bgGlow.addColorStop(0.5, `rgba(128, 0, 255, ${pulseAlpha * 0.5})`);
      bgGlow.addColorStop(1, "transparent");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, W, H);

      // ── Core Defense Rings ──
      eng.coreRotation += 0.008;
      const ringCount = 3;
      for (let r = 0; r < ringCount; r++) {
        const ringRadius = 30 + r * 24;
        const rotation = eng.coreRotation * (r % 2 === 0 ? 1 : -1) * (1 + r * 0.3);
        const segments = 6 + r * 2;
        const hpFrac = eng.coreHp / CORE_HP;
        
        ctx.save();
        ctx.translate(CX, CY);
        ctx.rotate(rotation);
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.15 + hpFrac * 0.2})`;
        ctx.lineWidth = 1.5;
        
        // Draw segmented ring
        for (let s = 0; s < segments; s++) {
          const startAngle = (s / segments) * Math.PI * 2;
          const endAngle = startAngle + (Math.PI * 2 / segments) * 0.7;
          ctx.beginPath();
          ctx.arc(0, 0, ringRadius, startAngle, endAngle);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ── Core Center ──
      eng.corePulse = Math.sin(time * 3) * 0.3 + 0.7;
      const coreRadius = 16 + eng.corePulse * 4;
      const hpRatio = eng.coreHp / CORE_HP;
      
      // Core glow
      const coreGlow = ctx.createRadialGradient(CX, CY, 0, CX, CY, coreRadius * 4);
      if (hpRatio > 0.5) {
        coreGlow.addColorStop(0, `rgba(0, 255, 255, ${0.4 * eng.corePulse})`);
        coreGlow.addColorStop(1, "transparent");
      } else if (hpRatio > 0.25) {
        coreGlow.addColorStop(0, `rgba(255, 170, 0, ${0.4 * eng.corePulse})`);
        coreGlow.addColorStop(1, "transparent");
      } else {
        coreGlow.addColorStop(0, `rgba(255, 50, 50, ${0.5 * eng.corePulse})`);
        coreGlow.addColorStop(1, "transparent");
      }
      ctx.fillStyle = coreGlow;
      ctx.fillRect(CX - coreRadius * 4, CY - coreRadius * 4, coreRadius * 8, coreRadius * 8);

      // Core body (hexagon)
      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(eng.coreRotation * 0.5);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const hx = Math.cos(a) * coreRadius;
        const hy = Math.sin(a) * coreRadius;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fillStyle = hpRatio > 0.5 ? "#0a1a2a" : hpRatio > 0.25 ? "#1a1500" : "#1a0505";
      ctx.fill();
      ctx.strokeStyle = hpRatio > 0.5 ? `rgba(0,255,255,${0.7 + eng.corePulse * 0.3})` : hpRatio > 0.25 ? `rgba(255,170,0,${0.7 + eng.corePulse * 0.3})` : `rgba(255,50,50,${0.7 + eng.corePulse * 0.3})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // ── Damage Flash ──
      if (eng.damageFlash > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${eng.damageFlash / 30})`;
        ctx.fillRect(0, 0, W, H);
        eng.damageFlash -= 0.5;
      }

      // ── Kill Flash ──
      if (eng.killFlash > 0) {
        ctx.fillStyle = `rgba(0, 255, 255, ${eng.killFlash / 60})`;
        ctx.fillRect(0, 0, W, H);
        eng.killFlash -= 0.5;
      }

      // ── Spawn Enemies ──
      if (eng.status === "playing" && eng.enemiesToSpawn > 0) {
        eng.spawnTimer++;
        const spawnInterval = Math.max(20, 60 - eng.wave * 3);
        if (eng.spawnTimer >= spawnInterval) {
          eng.spawnTimer = 0;
          eng.enemiesToSpawn--;
          // Spawn
          const angle = Math.random() * Math.PI * 2;
          const word = pickWord(eng.wave, eng.usedWords);
          eng.usedWords.add(word);
          const color = ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)];
          eng.enemies.push({
            id: ++eng.enemyIdCounter,
            word, angle,
            dist: eng.spawnRadius + 40,
            speed: speedForWave(eng.wave) + Math.random() * 0.15,
            hp: 1, color, typed: 0,
          });
        }
      }

      // ── Update & Render Enemies ──
      const deadEnemies: number[] = [];
      for (const enemy of eng.enemies) {
        // Move toward center
        enemy.dist -= enemy.speed;

        const ex = CX + Math.cos(enemy.angle) * enemy.dist;
        const ey = CY + Math.sin(enemy.angle) * enemy.dist;

        // Hit core check
        if (enemy.dist <= 28) {
          deadEnemies.push(enemy.id);
          coreHit(10 + Math.floor(eng.wave * 1.5));
          // Damage particles
          for (let p = 0; p < 12; p++) {
            const a = Math.random() * Math.PI * 2;
            eng.particles.push({
              x: CX, y: CY,
              vx: Math.cos(a) * 3, vy: Math.sin(a) * 3,
              life: 25, maxLife: 25,
              radius: 2, color: "255, 50, 50",
            });
          }
          continue;
        }

        const isActive = eng.activeTargetId === enemy.id;

        // Enemy body - glowing orb
        const orbRadius = 10 + enemy.word.length * 1.5;
        const orbGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, orbRadius * 2.5);
        orbGlow.addColorStop(0, `rgba(${enemy.color}, ${isActive ? 0.5 : 0.2})`);
        orbGlow.addColorStop(1, "transparent");
        ctx.fillStyle = orbGlow;
        ctx.fillRect(ex - orbRadius * 3, ey - orbRadius * 3, orbRadius * 6, orbRadius * 6);

        // Orb body
        ctx.beginPath();
        ctx.arc(ex, ey, orbRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${enemy.color}, ${isActive ? 0.25 : 0.12})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${enemy.color}, ${isActive ? 1 : 0.6})`;
        ctx.lineWidth = isActive ? 2.5 : 1.5;
        if (isActive) {
          ctx.shadowColor = `rgba(${enemy.color}, 1)`;
          ctx.shadowBlur = 15;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Distance indicator ring (how close to core)
        const dangerRatio = 1 - (enemy.dist / eng.spawnRadius);
        if (dangerRatio > 0.6) {
          ctx.beginPath();
          ctx.arc(ex, ey, orbRadius + 5, 0, Math.PI * 2 * dangerRatio);
          ctx.strokeStyle = `rgba(255, ${Math.floor(255 * (1 - dangerRatio))}, 0, 0.6)`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Word label
        ctx.font = `bold ${isActive ? 15 : 13}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Render each character
        const word = enemy.word;
        const charWidth = ctx.measureText("M").width;
        const totalWidth = word.length * charWidth;
        const startX = ex - totalWidth / 2 + charWidth / 2;

        for (let ci = 0; ci < word.length; ci++) {
          const cx = startX + ci * charWidth;
          const cy2 = ey - orbRadius - 14;
          
          if (ci < enemy.typed) {
            // Typed - bright
            ctx.fillStyle = `rgba(${enemy.color}, 1)`;
            ctx.shadowColor = `rgba(${enemy.color}, 1)`;
            ctx.shadowBlur = 8;
          } else {
            // Untyped
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.shadowBlur = 0;
          }
          ctx.fillText(word[ci], cx, cy2);
          ctx.shadowBlur = 0;
        }

        // Lock-on reticle for active target
        if (isActive) {
          ctx.save();
          ctx.translate(ex, ey);
          ctx.rotate(time * 2);
          ctx.strokeStyle = `rgba(${enemy.color}, 0.7)`;
          ctx.lineWidth = 1.5;
          const reticleR = orbRadius + 12;
          for (let s = 0; s < 4; s++) {
            const sa = (s / 4) * Math.PI * 2;
            const ea = sa + Math.PI / 6;
            ctx.beginPath();
            ctx.arc(0, 0, reticleR, sa, ea);
            ctx.stroke();
          }
          ctx.restore();

          // Lock-on line from core to target
          ctx.beginPath();
          ctx.moveTo(CX, CY);
          ctx.lineTo(ex, ey);
          ctx.strokeStyle = `rgba(${enemy.color}, 0.15)`;
          ctx.lineWidth = 1;
          ctx.setLineDash([8, 12]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Remove dead enemies
      if (deadEnemies.length > 0) {
        eng.enemies = eng.enemies.filter(e => !deadEnemies.includes(e.id));
        if (eng.activeTargetId !== null && deadEnemies.includes(eng.activeTargetId)) {
          eng.activeTargetId = null;
          eng.typed = "";
          setTyped("");
          if (inputRef.current) inputRef.current.value = "";
        }
      }

      // ── Check Wave End ──
      if (eng.status === "playing" && eng.enemiesToSpawn <= 0 && eng.enemies.length === 0) {
        eng.status = "waveBreak";
        setStatus("waveBreak");
      }

      // ── Laser Beams ──
      eng.lasers = eng.lasers.filter(l => l.life > 0);
      for (const laser of eng.lasers) {
        const alpha = laser.life / 12;
        ctx.beginPath();
        ctx.moveTo(laser.fromX, laser.fromY);
        ctx.lineTo(laser.toX, laser.toY);
        ctx.strokeStyle = `rgba(${laser.color}, ${alpha})`;
        ctx.lineWidth = 3 * alpha;
        ctx.shadowColor = `rgba(${laser.color}, 1)`;
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
        laser.life -= 0.6;
      }

      // ── Particles ──
      eng.particles = eng.particles.filter(p => p.life > 0);
      for (const p of eng.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.life--;
        const alpha = Math.min(1, p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.fill();
      }

      // ── Shockwaves ──
      eng.shockwaves = eng.shockwaves.filter(s => s.life > 0);
      for (const sw of eng.shockwaves) {
        sw.radius += (sw.maxRadius - sw.radius) * 0.12;
        sw.life -= 0.025;
        const alpha = Math.max(0, sw.life);
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${sw.color}, ${alpha * 0.6})`;
        ctx.lineWidth = 2.5 * alpha;
        ctx.shadowColor = `rgba(${sw.color}, ${alpha})`;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // ── Edge Warning Arrows for dangerous enemies ──
      for (const enemy of eng.enemies) {
        const dangerRatio = 1 - (enemy.dist / eng.spawnRadius);
        if (dangerRatio > 0.65) {
          const ex = CX + Math.cos(enemy.angle) * enemy.dist;
          const ey = CY + Math.sin(enemy.angle) * enemy.dist;
          // Draw a pulsing warning line from edge toward enemy
          const edgeX = CX + Math.cos(enemy.angle) * (eng.spawnRadius + 20);
          const edgeY = CY + Math.sin(enemy.angle) * (eng.spawnRadius + 20);
          const warnAlpha = 0.2 + Math.sin(time * 8) * 0.15;
          ctx.beginPath();
          ctx.moveTo(edgeX, edgeY);
          ctx.lineTo(ex, ey);
          ctx.strokeStyle = `rgba(255, ${Math.floor(100 * (1 - dangerRatio))}, 0, ${warnAlpha})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 8]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // ── Scanlines ──
      ctx.fillStyle = "rgba(0,0,0,0.03)";
      for (let y = 0; y < H; y += 3) {
        ctx.fillRect(0, y, W, 1);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status, coreHit]);

  /* ─── KEYBOARD SHORTCUT ────────────────────────────── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((status === "idle" || status === "gameover") && e.key === "Enter") {
        e.preventDefault();
        initGame();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [status, initGame]);

  /* ─── RENDER ───────────────────────────────────────── */
  const hpPercent = Math.round((coreHp / CORE_HP) * 100);
  const hpColor = hpPercent > 50 ? "text-cyan-400" : hpPercent > 25 ? "text-amber-400" : "text-red-500";
  const hpBarColor = hpPercent > 50 ? "bg-cyan-400" : hpPercent > 25 ? "bg-amber-400" : "bg-red-500";
  const hpBarGlow = hpPercent > 50 ? "shadow-[0_0_15px_rgba(0,255,255,0.5)]" : hpPercent > 25 ? "shadow-[0_0_15px_rgba(255,170,0,0.5)]" : "shadow-[0_0_15px_rgba(255,50,50,0.5)]";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#020108] overflow-hidden flex flex-col items-center justify-center font-mono"
      onClick={() => inputRef.current?.focus()}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Hidden Input */}
      {(status === "playing" || status === "waveBreak") && (
        <input
          ref={inputRef}
          className="fixed top-0 left-0 w-px h-px opacity-0 pointer-events-none -z-50"
          value={typed}
          onChange={handleInput}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      )}

      {/* CRT Overlay */}
      <div className="pointer-events-none absolute inset-0 z-[100] opacity-20 mix-blend-overlay" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)"
      }}></div>

      {/* ─── PLAYING HUD ──────────────────────────────── */}
      {(status === "playing" || status === "waveBreak") && (
        <>
          {/* Top Bar */}
          <div className="absolute top-6 w-full max-w-5xl px-8 flex justify-between items-start z-20">
            {/* Core HP */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${hpColor} ${hpPercent <= 25 ? 'animate-pulse' : ''}`} />
                <span className="text-gray-400 text-[10px] font-black tracking-[0.3em] uppercase">Core Integrity</span>
              </div>
              <div className="w-48 h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full ${hpBarColor} ${hpBarGlow} rounded-full transition-all duration-300`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              <span className={`text-sm font-black ${hpColor}`}>{hpPercent}%</span>
            </div>

            {/* Wave */}
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-[10px] font-black tracking-[0.3em] uppercase">Wave</span>
              <span className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{wave}</span>
            </div>

            {/* Score + Combo */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-gray-500 text-[10px] font-black tracking-[0.3em] uppercase">Score</span>
              <span className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{score}</span>
              {combo >= 3 && (
                <div className={`flex items-center gap-1 px-3 py-0.5 rounded-sm border ${combo >= 10 ? 'border-[#39FF14] text-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.3)]' : combo >= 6 ? 'border-cyan-400 text-cyan-400' : 'border-purple-400 text-purple-400'}`}>
                  <Zap className="w-3 h-3 fill-current" />
                  <span className="text-xs font-black tracking-widest">{combo}x CHAIN</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom typing indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-3 bg-[#020108]/80 backdrop-blur-md border border-white/10 px-6 py-3 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <span className="text-gray-400 text-sm font-bold tracking-widest uppercase">
                {typed ? (
                  <span className="text-cyan-400">{typed}<span className="animate-pulse text-white">|</span></span>
                ) : (
                  "Type to lock on..."
                )}
              </span>
            </div>
            <div className="flex justify-center gap-6 mt-3 text-[10px] font-black tracking-widest text-gray-500 uppercase">
              <span>Kills {kills}</span>
              <span>Best Chain {bestCombo}x</span>
            </div>
          </div>

          {/* Wave Break Overlay */}
          {status === "waveBreak" && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#020108]/40 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-xl font-black tracking-[0.4em] text-cyan-400 uppercase mb-3 drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]">
                  Wave {wave} Cleared
                </div>
                <div className="text-gray-400 text-sm tracking-widest uppercase animate-pulse">
                  Next wave incoming...
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── IDLE / GAME OVER ─────────────────────────── */}
      {(status === "idle" || status === "gameover") && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#020108]/80 backdrop-blur-sm">
          <div className="text-center">
            {status === "idle" ? (
              <>
                <div className="w-24 h-24 mx-auto mb-6 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,0,0,0.15)]">
                  <ShieldAlert className="w-12 h-12 text-red-400" />
                </div>
                <h1 className="text-6xl font-black text-white tracking-[0.2em] mb-4">
                  Cyber<span className="text-red-400">Defend</span>
                </h1>
                <p className="text-gray-400 text-sm tracking-widest uppercase mb-4">Orbital Core Defense System</p>
                <p className="text-gray-500 text-xs tracking-wide max-w-md mx-auto mb-12 leading-relaxed">
                  Enemies approach your reactor from all directions. Type their codes to neutralize them before they breach the core.
                </p>
                <Button
                  onClick={initGame}
                  variant="primary"
                  size="lg"
                  className="w-64 h-16 bg-red-600 hover:bg-red-500 text-white font-black tracking-widest text-lg shadow-[0_0_30px_rgba(255,0,0,0.3)]"
                >
                  <Play className="w-6 h-6 mr-2 fill-current" /> DEFEND CORE
                </Button>
              </>
            ) : (
              <>
                <Skull className="w-24 h-24 mx-auto mb-6 text-red-500 drop-shadow-[0_0_40px_rgba(255,0,0,0.5)]" />
                <h2 className="text-4xl font-black text-white tracking-[0.2em] mb-2">CORE BREACHED</h2>
                <p className="text-gray-400 text-sm tracking-widest uppercase mb-8">System shutdown at wave {wave}</p>

                <div className="flex gap-6 justify-center mb-12">
                  <div className="bg-black/50 border border-white/10 px-6 py-5 rounded-2xl">
                    <div className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-2">Score</div>
                    <div className="text-4xl font-black text-cyan-400 drop-shadow-[0_0_15px_cyan]">{score}</div>
                  </div>
                  <div className="bg-black/50 border border-white/10 px-6 py-5 rounded-2xl">
                    <div className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-2">Kills</div>
                    <div className="text-4xl font-black text-[#39FF14]">{kills}</div>
                  </div>
                  <div className="bg-black/50 border border-white/10 px-6 py-5 rounded-2xl">
                    <div className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-2">Best Chain</div>
                    <div className="text-4xl font-black text-purple-400">{bestCombo}x</div>
                  </div>
                  <div className="bg-black/50 border border-white/10 px-6 py-5 rounded-2xl">
                    <div className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-2">Wave</div>
                    <div className="text-4xl font-black text-amber-400">{wave}</div>
                  </div>
                </div>

                <Button
                  onClick={initGame}
                  variant="primary"
                  size="lg"
                  className="w-64 h-16 bg-red-600 hover:bg-red-500 text-white font-black tracking-widest text-lg shadow-[0_0_30px_rgba(255,0,0,0.3)]"
                >
                  RETRY DEFENSE
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── COUNTDOWN ────────────────────────────────── */}
      {status === "countdown" && (
        <div className="z-50 flex flex-col items-center">
          <div className="text-gray-400 text-sm font-black tracking-[0.4em] uppercase mb-4">Initializing Defense Grid</div>
          <div className="text-[12rem] font-black text-white drop-shadow-[0_0_50px_white] leading-none">
            {countdown}
          </div>
        </div>
      )}
    </div>
  );
}
