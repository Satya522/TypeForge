"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

type LineType = "system" | "user" | "error" | "success" | "dim" | "info" | "boot" | "ascii";
type Stage = "boot" | "idle" | "login_email" | "login_pw" | "signup_name" | "signup_email" | "signup_pw" | "signup_confirm" | "auth" | "done";

interface Line { text: string; type: LineType; }

const BOOT_LINES: Line[] = [
  { text: "[OK] Loading TypeForge kernel...", type: "boot" },
  { text: "[OK] Initializing typing engine...", type: "boot" },
  { text: "[OK] Neural pathways calibrated.", type: "boot" },
  { text: "[OK] Keystroke sensors online.", type: "boot" },
  { text: "", type: "dim" },
];

const ASCII_LOGO = `████████╗██╗   ██╗██████╗ ███████╗███████╗ ██████╗ ██████╗  ██████╗ ███████╗
╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
   ██║    ╚████╔╝ ██████╔╝█████╗  █████╗  ██║   ██║██████╔╝██║  ███╗█████╗
   ██║     ╚██╔╝  ██╔═══╝ ██╔══╝  ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝
   ██║      ██║   ██║     ███████╗██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
   ╚═╝      ╚═╝   ╚═╝     ╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝`;

const WELCOME_LINES: Line[] = [
  { text: "", type: "dim" },
  { text: "  System online. Ready for authentication.", type: "info" },
  { text: "", type: "dim" },
  { text: "  Available commands:", type: "dim" },
  { text: "    login    → Sign in with email & password", type: "system" },
  { text: "    signup   → Create a new account", type: "system" },
  { text: "    google   → Continue with Google", type: "system" },
  { text: "    github   → Continue with GitHub", type: "system" },
  { text: "    help     → Show all commands", type: "dim" },
  { text: "", type: "dim" },
];

const HELP_LINES: Line[] = [
  { text: "  Commands:", type: "info" },
  { text: "    login       Sign in with credentials", type: "system" },
  { text: "    signup      Create new account", type: "system" },
  { text: "    google      OAuth with Google", type: "system" },
  { text: "    github      OAuth with GitHub", type: "system" },
  { text: "    whoami      Who are you?", type: "dim" },
  { text: "    clear       Clear terminal", type: "dim" },
  { text: "    hack        Try to hack in", type: "dim" },
  { text: "    help        Show this message", type: "dim" },
  { text: "", type: "dim" },
];

function playSound(type: "key" | "enter" | "error" | "success") {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.03;
    if (type === "key") { osc.frequency.value = 800 + Math.random() * 200; gain.gain.value = 0.02; osc.start(); osc.stop(ctx.currentTime + 0.04); }
    else if (type === "enter") { osc.frequency.value = 600; osc.start(); osc.stop(ctx.currentTime + 0.08); }
    else if (type === "error") { osc.frequency.value = 200; osc.type = "sawtooth"; gain.gain.value = 0.04; osc.start(); osc.stop(ctx.currentTime + 0.15); }
    else if (type === "success") { osc.frequency.value = 523; osc.start(); setTimeout(() => { osc.frequency.value = 659; }, 100); setTimeout(() => { osc.frequency.value = 784; }, 200); osc.stop(ctx.currentTime + 0.35); }
  } catch {}
}

function getPrompt(stage: Stage): string {
  switch (stage) {
    case "login_email": return "email: ";
    case "login_pw": return "password: ";
    case "signup_name": return "name: ";
    case "signup_email": return "email: ";
    case "signup_pw": return "password: ";
    case "signup_confirm": return "confirm: ";
    default: return "$ ";
  }
}

function getPasswordStrength(pw: string): { label: string; color: string; bars: number } {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "WEAK", color: "#ef4444", bars: 1 };
  if (score <= 3) return { label: "MEDIUM", color: "#f59e0b", bars: 2 };
  return { label: "STRONG", color: "#10b981", bars: 3 };
}

const AUTOCOMPLETE: Record<string, string> = {
  l: "login", lo: "login", log: "login", logi: "login",
  s: "signup", si: "signup", sig: "signup", sign: "signup", signu: "signup",
  go: "google", goo: "google", goog: "google", googl: "google",
  gi: "github", git: "github", gith: "github", githu: "github",
  h: "help", he: "help", hel: "help",
  w: "whoami", wh: "whoami", who: "whoami",
  c: "clear", cl: "clear", cle: "clear", clea: "clear",
  ha: "hack", hac: "hack",
  su: "sudo login", sud: "sudo login", sudo: "sudo login",
};

export default function TerminalAuth({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState<Stage>("boot");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [soundOn, setSoundOn] = useState(true);
  const [startTime, setStartTime] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const formData = useRef({ name: "", email: "", password: "" });
  const [bootDone, setBootDone] = useState(false);

  const addLines = useCallback((newLines: Line[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const typeLines = useCallback(async (newLines: Line[], delay = 35) => {
    for (const line of newLines) {
      if (line.type === "ascii") {
        setLines((prev) => [...prev, line]);
        await new Promise((r) => setTimeout(r, 20));
        continue;
      }
      for (let i = 0; i <= line.text.length; i++) {
        const partial = line.text.slice(0, i);
        setLines((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.type === line.type && !last.text.includes("\n")) {
            copy[copy.length - 1] = { ...last, text: partial };
          } else {
            copy.push({ text: partial, type: line.type });
          }
          return copy;
        });
        await new Promise((r) => setTimeout(r, delay));
      }
      await new Promise((r) => setTimeout(r, 80));
    }
  }, []);

  useEffect(() => {
    if (bootDone) return;
    setBootDone(true);
    (async () => {
      for (const line of BOOT_LINES) {
        addLines([line]);
        await new Promise((r) => setTimeout(r, 200 + Math.random() * 150));
      }
      for (const asciiLine of ASCII_LOGO.split("\n")) {
        addLines([{ text: asciiLine, type: "ascii" }]);
        await new Promise((r) => setTimeout(r, 40));
      }
      await typeLines(WELCOME_LINES, 15);
      setStage("idle");
      if (mode === "register") {
        await new Promise((r) => setTimeout(r, 200));
        addLines([{ text: "  Hint: type signup to create your account", type: "dim" }, { text: "", type: "dim" }]);
      }
      inputRef.current?.focus();
    })();
  }, [bootDone, addLines, typeLines, mode]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  const getWPM = () => {
    if (!startTime || charCount < 5) return 0;
    const minutes = (Date.now() - startTime) / 60000;
    return Math.round((charCount / 5) / Math.max(minutes, 0.01));
  };

  const processCommand = useCallback(async (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();

    if (stage === "idle") {
      setHistory((h) => [cmd, ...h].slice(0, 20));
      setHistIdx(-1);

      if (trimmed === "login") {
        setStartTime(Date.now());
        setCharCount(0);
        addLines([{ text: "", type: "dim" }]);
        await typeLines([{ text: "  Enter your email address:", type: "info" }], 20);
        setStage("login_email");
      } else if (trimmed === "signup") {
        setStartTime(Date.now());
        setCharCount(0);
        addLines([{ text: "", type: "dim" }]);
        await typeLines([{ text: "  Let's create your account. Enter your name:", type: "info" }], 20);
        setStage("signup_name");
      } else if (trimmed === "google") {
        addLines([{ text: "", type: "dim" }]);
        await typeLines([{ text: "  Redirecting to Google OAuth...", type: "info" }], 25);
        if (soundOn) playSound("success");
        signIn("google", { callbackUrl: "/dashboard" });
      } else if (trimmed === "github") {
        addLines([{ text: "", type: "dim" }]);
        await typeLines([{ text: "  Redirecting to GitHub OAuth...", type: "info" }], 25);
        if (soundOn) playSound("success");
        signIn("github", { callbackUrl: "/dashboard" });
      } else if (trimmed === "help") {
        addLines([{ text: "", type: "dim" }, ...HELP_LINES]);
      } else if (trimmed === "whoami") {
        await typeLines([{ text: "  You're about to become a typing legend.", type: "info" }], 30);
        addLines([{ text: "", type: "dim" }]);
      } else if (trimmed === "clear") {
        setLines([]);
      } else if (trimmed === "hack") {
        const chars = "01アイウエオカキクケコ@#$%&";
        for (let i = 0; i < 6; i++) {
          const line = Array.from({ length: 60 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
          addLines([{ text: "  " + line, type: "dim" }]);
          await new Promise((r) => setTimeout(r, 100));
        }
        if (soundOn) playSound("error");
        await typeLines([{ text: "  ACCESS DENIED. Nice try 😏", type: "error" }], 30);
        addLines([{ text: "", type: "dim" }]);
      } else if (trimmed === "sudo login" || trimmed.startsWith("sudo")) {
        await typeLines([{ text: "  Permission granted. You're clearly a developer. 🧑‍💻", type: "success" }], 25);
        addLines([{ text: "  (Still need to type login though)", type: "dim" }, { text: "", type: "dim" }]);
      } else if (trimmed === "sound on") {
        setSoundOn(true);
        addLines([{ text: "  🔊 Sound enabled", type: "info" }, { text: "", type: "dim" }]);
      } else if (trimmed === "sound off") {
        setSoundOn(false);
        addLines([{ text: "  🔇 Sound disabled", type: "info" }, { text: "", type: "dim" }]);
      } else if (trimmed === "") {
        return;
      } else {
        if (soundOn) playSound("error");
        addLines([{ text: `  Command not found: ${trimmed}. Type help for options.`, type: "error" }, { text: "", type: "dim" }]);
      }
      return;
    }

    if (stage === "login_email") {
      formData.current.email = cmd.trim();
      await typeLines([{ text: "  Enter your password:", type: "info" }], 20);
      setStage("login_pw");
    } else if (stage === "login_pw") {
      formData.current.password = cmd;
      setStage("auth");
      await typeLines([{ text: "  Authenticating...", type: "dim" }], 30);
      const wpm = getWPM();
      const result = await signIn("credentials", { redirect: false, email: formData.current.email, password: formData.current.password, callbackUrl: "/dashboard" });
      if (result?.error) {
        if (soundOn) playSound("error");
        await typeLines([{ text: "  ✗ Authentication failed. Invalid credentials.", type: "error" }], 20);
        addLines([{ text: "  Type login to try again, or use google/github.", type: "dim" }, { text: "", type: "dim" }]);
        setStage("idle");
      } else {
        if (soundOn) playSound("success");
        await typeLines([
          { text: `  ✓ Authentication successful! ${wpm > 0 ? `@ ${wpm} WPM` : ""}`, type: "success" },
          { text: `  Welcome back. Redirecting to dashboard...`, type: "info" },
        ], 20);
        setStage("done");
        setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1500);
      }
    } else if (stage === "signup_name") {
      formData.current.name = cmd.trim();
      await typeLines([{ text: "  Enter your email:", type: "info" }], 20);
      setStage("signup_email");
    } else if (stage === "signup_email") {
      formData.current.email = cmd.trim();
      await typeLines([{ text: "  Choose a password (min 6 chars):", type: "info" }], 20);
      setStage("signup_pw");
    } else if (stage === "signup_pw") {
      formData.current.password = cmd;
      const strength = getPasswordStrength(cmd);
      const bar = "█".repeat(strength.bars * 4) + "░".repeat((3 - strength.bars) * 4);
      addLines([{ text: `  [${strength.label}] ${bar}`, type: strength.bars >= 3 ? "success" : strength.bars >= 2 ? "info" : "error" }]);
      await typeLines([{ text: "  Confirm your password:", type: "info" }], 20);
      setStage("signup_confirm");
    } else if (stage === "signup_confirm") {
      if (cmd !== formData.current.password) {
        if (soundOn) playSound("error");
        await typeLines([{ text: "  ✗ Passwords don't match. Try again:", type: "error" }], 20);
        return;
      }
      setStage("auth");
      await typeLines([{ text: "  Creating your account...", type: "dim" }], 30);
      const wpm = getWPM();
      try {
        const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: formData.current.name, email: formData.current.email, password: formData.current.password }) });
        const data = await res.json();
        if (!res.ok) { if (soundOn) playSound("error"); await typeLines([{ text: `  ✗ ${data.error || "Registration failed."}`, type: "error" }], 20); addLines([{ text: "", type: "dim" }]); setStage("idle"); return; }
        const loginResult = await signIn("credentials", { redirect: false, email: formData.current.email, password: formData.current.password, callbackUrl: "/dashboard" });
        if (loginResult?.error) { if (soundOn) playSound("error"); await typeLines([{ text: "  ✗ Account created but auto-login failed. Type login.", type: "error" }], 20); setStage("idle"); return; }
        if (soundOn) playSound("success");
        await typeLines([
          { text: "  ✓ Account created!", type: "success" },
          { text: "", type: "dim" },
          { text: "  ┌─── First Impression Score ───┐", type: "info" },
          { text: `  │  Speed:    ${wpm > 0 ? wpm + " WPM" : "--"}${" ".repeat(Math.max(0, 17 - (wpm > 0 ? String(wpm).length + 4 : 2)))}│`, type: "success" },
          { text: `  │  Archetype: ${wpm >= 80 ? "Speed Demon" : wpm >= 50 ? "Swift Starter" : "Steady Builder"}${" ".repeat(Math.max(0, 16 - (wpm >= 80 ? 11 : wpm >= 50 ? 13 : 14)))}│`, type: "success" },
          { text: "  └─────────────────────────────┘", type: "info" },
          { text: "", type: "dim" },
          { text: "  Redirecting to dashboard...", type: "info" },
        ], 25);
        setStage("done");
        setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 2000);
      } catch {
        if (soundOn) playSound("error");
        await typeLines([{ text: "  ✗ Something went wrong.", type: "error" }], 20);
        setStage("idle");
      }
    }
  }, [stage, addLines, typeLines, soundOn, router, getWPM]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (stage === "boot" || stage === "auth" || stage === "done") { e.preventDefault(); return; }
    if (e.key === "Enter") {
      if (soundOn) playSound("enter");
      const val = input;
      const isPassword = stage === "login_pw" || stage === "signup_pw" || stage === "signup_confirm";
      addLines([{ text: `${getPrompt(stage)}${isPassword ? "•".repeat(val.length) : val}`, type: "user" }]);
      setCharCount((c) => c + val.length);
      setInput("");
      processCommand(val);
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (stage === "idle" && input.length > 0) {
        const match = AUTOCOMPLETE[input.toLowerCase()];
        if (match) { setInput(match); if (soundOn) playSound("key"); }
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (stage === "idle" && history.length > 0) {
        const next = Math.min(histIdx + 1, history.length - 1);
        setHistIdx(next);
        setInput(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (stage === "idle") {
        const next = histIdx - 1;
        if (next < 0) { setHistIdx(-1); setInput(""); }
        else { setHistIdx(next); setInput(history[next]); }
      }
    } else {
      if (soundOn && e.key.length === 1) playSound("key");
    }
  };

  const isPassword = stage === "login_pw" || stage === "signup_pw" || stage === "signup_confirm";

  const colorMap: Record<LineType, string> = {
    system: "#7dd3fc",
    user: "#4ade80",
    error: "#f87171",
    success: "#34d399",
    dim: "#475569",
    info: "#818cf8",
    boot: "#22d3ee",
    ascii: "#4f8dfd",
  };

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden bg-[#030712]"
      style={{ height: "calc(100vh - 5rem)" }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(79,141,253,0.06),transparent)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4f8dfd]/30 to-transparent" />

      <div className="relative w-full max-w-[860px] px-4">
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1021]/95 shadow-[0_40px_120px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-4 flex-1 text-center text-[11px] font-medium tracking-wider text-white/20 uppercase">
              TypeForge Terminal — auth@typeforge
            </span>
            <button onClick={() => setSoundOn(!soundOn)} className="text-[11px] text-white/20 hover:text-white/50 transition-colors">
              {soundOn ? "🔊" : "🔇"}
            </button>
          </div>

          <div
            ref={scrollRef}
            className="overflow-y-auto p-5 font-mono text-[13px] leading-[1.8]"
            style={{ height: "min(60vh, 480px)" }}
          >
            {lines.map((line, i) => (
              <div key={i} style={{ color: colorMap[line.type] }} className={line.type === "ascii" ? "text-[9px] leading-[1.1] sm:text-[11px]" : ""}>
                {line.text || "\u00A0"}
              </div>
            ))}

            {stage !== "boot" && stage !== "done" && (
              <div className="flex items-center" style={{ color: stage === "idle" ? "#4ade80" : "#818cf8" }}>
                <span className="mr-1 select-none">{getPrompt(stage)}</span>
                <span>{isPassword ? "•".repeat(input.length) : input}</span>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="ml-px inline-block h-[16px] w-[8px] translate-y-[1px] bg-current"
                />
              </div>
            )}

            {stage === "idle" && input.length > 0 && AUTOCOMPLETE[input.toLowerCase()] && AUTOCOMPLETE[input.toLowerCase()] !== input.toLowerCase() && (
              <div className="pointer-events-none -mt-[1.8em] select-none" style={{ color: "#475569" }}>
                <span className="invisible">{getPrompt(stage)}{input}</span>
                <span>{AUTOCOMPLETE[input.toLowerCase()].slice(input.length)}</span>
                <span className="ml-2 text-[10px]">[Tab]</span>
              </div>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type={isPassword ? "password" : "text"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="sr-only"
          autoFocus
          aria-label="Terminal input"
        />
      </div>
    </div>
  );
}
