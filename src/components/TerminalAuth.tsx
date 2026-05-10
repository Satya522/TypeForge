"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Medal,
  Terminal,
  Volume2,
  VolumeX,
} from "lucide-react";
import TypeForgeTerminalLogo from "@/components/terminal-auth/TypeForgeTerminalLogo";

type LineType = "boot" | "dim" | "error" | "info" | "logo" | "success" | "system" | "user";
type Stage =
  | "auth"
  | "await_go"
  | "boot"
  | "done"
  | "idle"
  | "login_email"
  | "login_method"
  | "login_pw"
  | "signup_confirm"
  | "signup_email"
  | "signup_name"
  | "signup_pw"
  | "speed_test";
type ThemeName = "matrix" | "cyan" | "violet" | "amber" | "rose";
type FontName = "fira" | "jetbrains" | "geist" | "ibm" | "space";
type SoundProfile = "mech" | "soft" | "synth";
type MissionKey = "command" | "identity" | "baseline" | "dashboard";
type AchievementId = "clean_auth" | "first_command" | "oauth_launch" | "speed_runner" | "terminal_auth" | "theme_switch" | "tone_shaper";
type OsFamily = "android" | "ios" | "linux" | "macos" | "unknown" | "windows";

interface NeofetchStat {
  label: string;
  labelColor: string;
  value: string;
  valueColor: string;
}

interface NeofetchPanel {
  logoAlt: string;
  logoFilter?: string;
  logoSrc: string;
  logoTitle: string;
  stats: NeofetchStat[];
}

interface BrowserDetails {
  engine: string;
  name: string;
  source: string;
  version?: string;
}

interface Line {
  neofetch?: NeofetchPanel;
  segments?: Array<{
    color?: string;
    text: string;
    type?: LineType;
    weight?: number;
  }>;
  text: string;
  type: LineType;
}

const SPEED_SENTENCES = [
  "precision creates speed when every keystroke lands clean",
  "a quiet terminal speaks louder than a noisy interface",
  "focus on the rhythm and the speed will follow naturally",
  "clean code always reads like well written prose",
  "the best developers type with intent and clear vision",
  "muscle memory builds the foundation of true velocity",
  "every master was once a beginner who never gave up"
];
const DASHBOARD_PATH = "/dashboard";
const TERMINAL_THEME_KEY = "typeforge.terminal.theme";
const TERMINAL_SOUND_KEY = "typeforge.terminal.sound";
const TERMINAL_SOUND_PROFILE_KEY = "typeforge.terminal.soundProfile";

const DEFAULT_LIVE_STATS = {
  accuracy: 100,
  backspaces: 0,
  chars: 0,
  wpm: 0,
};

const OS_LABELS: Record<OsFamily, string> = {
  android: "Android",
  ios: "iOS",
  linux: "Linux",
  macos: "macOS",
  unknown: "Unknown OS",
  windows: "Windows",
};

const OS_LOGOS: Record<OsFamily, string> = {
  android: "/neofetch/android.svg",
  ios: "/neofetch/macos.svg",
  linux: "/neofetch/linux.svg",
  macos: "/neofetch/macos.svg",
  unknown: "/neofetch/unknown.svg",
  windows: "/neofetch/windows.svg",
};

interface SystemProbe {
  architecture?: string;
  family: OsFamily;
  os: string;
  platform?: string;
  source: string;
}

function getOsFamily(value: string): OsFamily {
  const normalized = value.toLowerCase();
  if (normalized.includes("android")) return "android";
  if (normalized.includes("iphone") || normalized.includes("ipad") || normalized.includes("ios")) return "ios";
  if (normalized.includes("win")) return "windows";
  if (normalized.includes("mac")) return "macos";
  if (normalized.includes("linux") || normalized.includes("x11") || normalized.includes("ubuntu")) return "linux";
  return "unknown";
}

function getReadableOs(family: OsFamily, platform?: string) {
  if (platform && family !== "unknown") return platform;
  return OS_LABELS[family];
}

function getOsLogoFilter(family: OsFamily, glow: string) {
  const glowFilter = `drop-shadow(0 0 22px ${glow})`;
  if (family === "macos" || family === "ios") return `invert(1) brightness(1.12) ${glowFilter}`;
  if (family === "unknown") return `brightness(1.18) ${glowFilter}`;
  return glowFilter;
}

function getVersionFromUa(userAgent: string, pattern: RegExp) {
  return userAgent.match(pattern)?.[1]?.split(".").slice(0, 2).join(".");
}

function formatBrowserName(name: string, version?: string) {
  return version ? `${name} ${version}` : name;
}

function getDisplaySummary() {
  const width = Math.round(window.screen.width);
  const height = Math.round(window.screen.height);
  const longEdge = Math.max(width, height);
  const shortEdge = Math.min(width, height);
  const isMobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);

  if (isMobile) {
    const mobileClass = shortEdge >= 700 ? "tablet" : "phone";
    return `${width}x${height} px (${mobileClass})`;
  }

  let sizeLabel = "~14 inch";
  if (longEdge >= 2560 || shortEdge >= 1440) sizeLabel = "24+ inch desktop";
  else if (longEdge >= 1920 || shortEdge >= 1080) sizeLabel = "~24 inch";
  else if (longEdge >= 1680) sizeLabel = "~16 inch";
  else if (longEdge >= 1440) sizeLabel = "~15 inch";

  return `${width}x${height} px (${sizeLabel})`;
}

async function getBrowserDetails(): Promise<BrowserDetails> {
  const userAgent = navigator.userAgent;
  const navWithBrowserData = navigator as unknown as {
    brave?: { isBrave?: () => Promise<boolean> };
    userAgentData?: {
      brands?: Array<{ brand: string; version: string }>;
      getHighEntropyValues?: (hints: string[]) => Promise<{
        fullVersionList?: Array<{ brand: string; version: string }>;
      }>;
    };
  };

  let brands = navWithBrowserData.userAgentData?.brands ?? [];
  try {
    const highEntropy = await navWithBrowserData.userAgentData?.getHighEntropyValues?.(["fullVersionList"]);
    if (highEntropy?.fullVersionList?.length) brands = highEntropy.fullVersionList;
  } catch {
    // Browser brand hints are optional.
  }

  const brandVersion = (brandName: string) =>
    brands
      .find((brand) => brand.brand.toLowerCase().includes(brandName.toLowerCase()))
      ?.version.split(".")
      .slice(0, 2)
      .join(".");

  const hasBrand = (brandName: string) => brands.some((brand) => brand.brand.toLowerCase().includes(brandName.toLowerCase()));

  try {
    if (await navWithBrowserData.brave?.isBrave?.()) {
      return { engine: "Blink", name: formatBrowserName("Brave", brandVersion("Chromium")), source: "Brave API" };
    }
  } catch {
    // Brave private detection can be unavailable.
  }

  if (/EdgA?\//.test(userAgent) || /EdgiOS\//.test(userAgent) || hasBrand("Microsoft Edge")) {
    const version = getVersionFromUa(userAgent, /EdgA?\/([\d.]+)/) ?? getVersionFromUa(userAgent, /EdgiOS\/([\d.]+)/) ?? brandVersion("Microsoft Edge");
    return { engine: /EdgiOS\//.test(userAgent) ? "WebKit" : "Blink", name: formatBrowserName("Microsoft Edge", version), source: hasBrand("Microsoft Edge") ? "Browser brands" : "User agent" };
  }

  if (/OPR\/|Opera|OPT\//.test(userAgent) || hasBrand("Opera")) {
    const version = getVersionFromUa(userAgent, /(?:OPR|OPT)\/([\d.]+)/) ?? brandVersion("Opera");
    return { engine: "Blink", name: formatBrowserName("Opera", version), source: hasBrand("Opera") ? "Browser brands" : "User agent" };
  }

  if (/SamsungBrowser\//.test(userAgent)) {
    return { engine: "Blink", name: formatBrowserName("Samsung Internet", getVersionFromUa(userAgent, /SamsungBrowser\/([\d.]+)/)), source: "User agent" };
  }

  if (/Vivaldi\//.test(userAgent)) {
    return { engine: "Blink", name: formatBrowserName("Vivaldi", getVersionFromUa(userAgent, /Vivaldi\/([\d.]+)/)), source: "User agent" };
  }

  if (/Firefox\//.test(userAgent) || /FxiOS\//.test(userAgent)) {
    const isIos = /FxiOS\//.test(userAgent);
    const version = getVersionFromUa(userAgent, isIos ? /FxiOS\/([\d.]+)/ : /Firefox\/([\d.]+)/);
    return { engine: isIos ? "WebKit" : "Gecko", name: formatBrowserName(isIos ? "Firefox iOS" : "Firefox", version), source: "User agent" };
  }

  if (/CriOS\//.test(userAgent)) {
    return { engine: "WebKit", name: formatBrowserName("Chrome iOS", getVersionFromUa(userAgent, /CriOS\/([\d.]+)/)), source: "User agent" };
  }

  if (hasBrand("Google Chrome") || /Chrome\//.test(userAgent)) {
    const version = getVersionFromUa(userAgent, /Chrome\/([\d.]+)/) ?? brandVersion("Google Chrome");
    return { engine: "Blink", name: formatBrowserName("Google Chrome", version), source: hasBrand("Google Chrome") ? "Browser brands" : "User agent" };
  }

  if (hasBrand("Chromium") || /Chromium\//.test(userAgent)) {
    const version = getVersionFromUa(userAgent, /Chromium\/([\d.]+)/) ?? brandVersion("Chromium");
    return { engine: "Blink", name: formatBrowserName("Chromium", version), source: hasBrand("Chromium") ? "Browser brands" : "User agent" };
  }

  if (/Safari\//.test(userAgent)) {
    return { engine: "WebKit", name: formatBrowserName("Safari", getVersionFromUa(userAgent, /Version\/([\d.]+)/)), source: "User agent" };
  }

  return { engine: "Unknown", name: "Unknown Browser", source: brands.length ? "Browser brands" : "User agent" };
}

async function getBrowserSystemProbe(): Promise<SystemProbe> {
  const navWithUa = navigator as unknown as {
    userAgentData?: {
      getHighEntropyValues?: (hints: string[]) => Promise<{
        architecture?: string;
        platform?: string;
        platformVersion?: string;
      }>;
      platform?: string;
    };
  };
  const basicPlatform = navWithUa.userAgentData?.platform || navigator.platform || "";
  let architecture: string | undefined;
  let platform = basicPlatform;

  try {
    const highEntropy = await navWithUa.userAgentData?.getHighEntropyValues?.(["architecture", "platform", "platformVersion"]);
    architecture = highEntropy?.architecture;
    platform = highEntropy?.platform || platform;
  } catch {
    // Browser high entropy hints are optional.
  }

  const family = getOsFamily(`${platform} ${navigator.platform} ${navigator.userAgent}`);
  return {
    architecture,
    family,
    os: getReadableOs(family, platform),
    platform,
    source: "browser",
  };
}

async function getNetworkSystemProbe(): Promise<SystemProbe> {
  try {
    const response = await fetch("/api/system/os", { cache: "no-store" });
    if (!response.ok) throw new Error("OS probe failed");
    const payload = (await response.json()) as Partial<SystemProbe>;
    const family = getOsFamily(`${payload.family ?? ""} ${payload.os ?? ""} ${payload.platform ?? ""}`);
    return {
      architecture: payload.architecture,
      family,
      os: payload.os || OS_LABELS[family],
      platform: payload.platform,
      source: payload.source || "network",
    };
  } catch {
    return {
      family: "unknown",
      os: "Unknown OS",
      source: "network-unavailable",
    };
  }
}

const SOUND_PROFILES: Record<SoundProfile, { detail: string; name: string }> = {
  mech: { detail: "crisp keyboard clicks", name: "Mechanical" },
  soft: { detail: "low-volume glass taps", name: "Soft" },
  synth: { detail: "retro terminal tones", name: "Synth" },
};

const ACHIEVEMENTS: Record<AchievementId, { detail: string; id: AchievementId; title: string }> = {
  clean_auth: {
    detail: "No backspace auth run.",
    id: "clean_auth",
    title: "Clean entry",
  },
  first_command: {
    detail: "First terminal command executed.",
    id: "first_command",
    title: "Console awake",
  },
  oauth_launch: {
    detail: "Provider handoff started.",
    id: "oauth_launch",
    title: "OAuth bridge",
  },
  speed_runner: {
    detail: "Baseline typing test completed.",
    id: "speed_runner",
    title: "Baseline captured",
  },
  terminal_auth: {
    detail: "Signed in through the terminal.",
    id: "terminal_auth",
    title: "Access granted",
  },
  theme_switch: {
    detail: "Terminal palette customized.",
    id: "theme_switch",
    title: "Theme tuned",
  },
  tone_shaper: {
    detail: "Audio profile customized.",
    id: "tone_shaper",
    title: "Sound shaped",
  },
};

const MISSION_STEPS: Array<{ detail: string; key: MissionKey; title: string }> = [
  { detail: "Run any command", key: "command", title: "Wake console" },
  { detail: "Pick login, signup, or OAuth", key: "identity", title: "Choose identity" },
  { detail: "Run speed for a quick baseline", key: "baseline", title: "Capture baseline" },
  { detail: 'Type "go" after success', key: "dashboard", title: "Enter dashboard" },
];

const STORAGE_THEME = "tf_terminal_theme";
const STORAGE_SOUND = "tf_terminal_sound";
const STORAGE_SOUND_PROFILE = "tf_terminal_sound_profile";
const STORAGE_FONT = "tf_terminal_font";

const FONTS: Record<FontName, { family: string; name: string; url: string }> = {
  fira: {
    name: "Fira Code",
    family: "'Fira Code', monospace",
    url: "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap",
  },
  jetbrains: {
    name: "JetBrains Mono",
    family: "'JetBrains Mono', monospace",
    url: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap",
  },
  geist: {
    name: "Geist Mono",
    family: "'Geist Mono', monospace",
    url: "https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-mono/style.css",
  },
  ibm: {
    name: "IBM Plex Mono",
    family: "'IBM Plex Mono', monospace",
    url: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap",
  },
  space: {
    name: "Space Mono",
    family: "'Space Mono', monospace",
    url: "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap",
  },
};

function isFontName(v: string | null | undefined): v is FontName {
  return v === "fira" || v === "jetbrains" || v === "geist" || v === "ibm" || v === "space";
}

const THEMES: Record<ThemeName, { accent: string; accentSoft: string; glow: string; name: string; secondary: string }> = {
  matrix: {
    accent: "#22c55e",                    // vivid green
    accentSoft: "rgba(34,197,94,0.12)",
    glow: "rgba(34,197,94,0.35)",
    name: "Terminal Green",
    secondary: "#4ade80",                    // lighter green — still on-theme but distinct
  },
  cyan: {
    accent: "#0ea5e9",                    // sky blue
    accentSoft: "rgba(14,165,233,0.12)",
    glow: "rgba(14,165,233,0.35)",
    name: "Cyber Cyan",
    secondary: "#67e8f9",                    // bright cyan — high contrast vs deep blue
  },
  violet: {
    accent: "#8b5cf6",                    // mid-purple
    accentSoft: "rgba(139,92,246,0.15)",
    glow: "rgba(139,92,246,0.35)",
    name: "Deep Violet",
    secondary: "#38bdf8",                    // sky blue — strong contrast vs purple
  },
  amber: {
    accent: "#f59e0b",                    // golden amber
    accentSoft: "rgba(245,158,11,0.15)",
    glow: "rgba(245,158,11,0.35)",
    name: "Gold Forge",
    secondary: "#34d399",                    // emerald green — complementary to amber
  },
  rose: {
    accent: "#f43f5e",                    // vivid rose red
    accentSoft: "rgba(244,63,94,0.15)",
    glow: "rgba(244,63,94,0.35)",
    name: "Cherry Blossom",
    secondary: "#a78bfa",                    // violet — cool contrast vs warm rose
  },
};

const BOOT_LINES: Line[] = [
  { text: "[OK] Loading TypeForge kernel...", type: "boot" },
  { text: "[OK] Mounting typing engine...", type: "boot" },
  { text: "[OK] Calibrating neural keymap...", type: "boot" },
  { text: "[OK] Auth terminal ready.", type: "boot" },
  { text: "", type: "dim" },
];

const WELCOME_LINES: Line[] = [
  { text: "", type: "dim" },
  { text: "> Welcome to TypeForge Terminal v1.0", type: "info" },
  { text: "> Type a command to continue.", type: "dim" },
  { text: "", type: "dim" },
  { text: "  login    -> Choose email, Google, or GitHub", type: "system" },
  { text: "  signup   -> Create new account", type: "system" },
  { text: "  mission  -> Show starter quest", type: "system" },
  { text: "  neofetch -> Run system identity scan", type: "system" },
  { text: "  speed    -> Quick typing baseline", type: "system" },
  { text: "  help     -> Show all commands", type: "dim" },
  { text: "", type: "dim" },
];

const HELP_LINES: Line[] = [
  { text: "  Core Commands", type: "info" },
  { text: "    login            choose email, Google, or GitHub", type: "system" },
  { text: "    signup           create a new TypeForge account", type: "system" },
  { text: "    google           open Google OAuth", type: "system" },
  { text: "    github           open GitHub OAuth", type: "system" },
  { text: "    speed            run a 1-line typing test", type: "system" },
  { text: "    retry            restart the typing test", type: "system" },
  { text: "    palette          show command shortcuts", type: "system" },
  { text: "    mission          show onboarding mission", type: "system" },
  { text: "    osprobe          detect OS from browser + network hints", type: "system" },
  { text: "", type: "dim" },
  { text: "  System & Network (Easter Eggs)", type: "info" },
  { text: "    neofetch         show system hardware info", type: "dim" },
  { text: "    top / htop       show active processes", type: "dim" },
  { text: "    nmap [host]      run a port scan", type: "dim" },
  { text: "    netstat          show network connections", type: "dim" },
  { text: "    ping             ping neural engine servers", type: "dim" },
  { text: "    traceroute       trace path to typeforge.dev", type: "dim" },
  { text: "    curl / wget      download payload binaries", type: "dim" },
  { text: "    ls / cd / cat    navigate file system", type: "dim" },
  { text: "    coffee / brew    brew a fresh cup", type: "dim" },
  { text: "    hack             try the forbidden route", type: "dim" },
  { text: "", type: "dim" },
  { text: "  Settings", type: "info" },
  { text: "    theme matrix     Terminal Green (Authentic)", type: "dim" },
  { text: "    theme cyan       Cyber Cyan (Neon Blue)", type: "dim" },
  { text: "    theme violet     Deep Violet (Dark Purple)", type: "dim" },
  { text: "    theme amber      Gold Forge (Premium Amber)", type: "dim" },
  { text: "    theme rose       Cherry Blossom (Rose Pink)", type: "dim" },
  { text: "    sound on/off     toggle keyboard sounds", type: "dim" },
  { text: "    sound mech       crisp mechanical profile", type: "dim" },
  { text: "    sound soft       quiet premium profile", type: "dim" },
  { text: "    sound synth      retro terminal profile", type: "dim" },
  { text: "    font fira        Fira Code — classic hacker", type: "dim" },
  { text: "    font jetbrains   JetBrains Mono — IDE grade", type: "dim" },
  { text: "    font geist       Geist Mono — Vercel's font", type: "dim" },
  { text: "    font ibm         IBM Plex Mono — corporate", type: "dim" },
  { text: "    font space       Space Mono — retro future", type: "dim" },
  { text: "    clear / cls      clear terminal", type: "dim" },
  { text: "", type: "dim" },
];

const AUTOCOMPLETE: Record<string, string> = {
  c: "clear",
  cl: "clear",
  cle: "clear",
  clea: "clear",
  g: "google",
  gi: "github",
  git: "github",
  gith: "github",
  githu: "github",
  go: "google",
  goo: "google",
  goog: "google",
  googl: "google",
  h: "help",
  ha: "hack",
  hac: "hack",
  he: "help",
  hel: "help",
  l: "login",
  lo: "login",
  log: "login",
  logi: "login",
  m: "mission",
  mi: "mission",
  mis: "mission",
  n: "neofetch",
  ne: "neofetch",
  neo: "neofetch",
  neof: "neofetch",
  neofe: "neofetch",
  neofet: "neofetch",
  neofetc: "neofetch",
  o: "osprobe",
  os: "osprobe",
  osp: "osprobe",
  ospr: "osprobe",
  ospro: "osprobe",
  osprob: "osprobe",
  p: "palette",
  pa: "palette",
  pal: "palette",
  s: "signup",
  si: "signup",
  sig: "signup",
  sign: "signup",
  signu: "signup",
  sp: "speed",
  spe: "speed",
  spee: "speed",
  su: "sudo login",
  sud: "sudo login",
  sudo: "sudo login",
  t: "theme matrix",
  th: "theme matrix",
  the: "theme matrix",
  w: "whoami",
  wh: "whoami",
  who: "whoami",
};

const LOGIN_METHOD_AUTOCOMPLETE: Record<string, string> = {
  e: "email",
  em: "email",
  ema: "email",
  emai: "email",
  g: "google",
  gi: "github",
  git: "github",
  gith: "github",
  githu: "github",
  go: "google",
  goo: "google",
  goog: "google",
  googl: "google",
};

function isThemeName(value: string | null | undefined): value is ThemeName {
  return value === "matrix" || value === "cyan" || value === "violet" || value === "amber" || value === "rose";
}

function isSoundProfile(value: string | null | undefined): value is SoundProfile {
  return value === "mech" || value === "soft" || value === "synth";
}

function getPrompt(stage: Stage) {
  if (stage === "login_method") return "login: ";
  if (stage === "login_email" || stage === "signup_email") return "email: ";
  if (stage === "login_pw" || stage === "signup_pw" || stage === "signup_confirm") return "password: ";
  if (stage === "signup_name") return "name: ";
  if (stage === "speed_test") return "speed: ";
  return "$ ";
}

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 1) return { bars: 1, color: "#ef4444", label: "WEAK" };
  if (score <= 3) return { bars: 2, color: "#f59e0b", label: "SOLID" };
  return { bars: 3, color: "#39d353", label: "STRONG" };
}

function scoreAccuracy(target: string, typed: string) {
  const length = Math.max(target.length, typed.length, 1);
  let correct = 0;
  for (let i = 0; i < length; i += 1) {
    if (target[i] === typed[i]) correct += 1;
  }
  return Math.max(0, Math.round((correct / length) * 100));
}

function createTone(type: "enter" | "error" | "key" | "success", profile: SoundProfile) {
  try {
    const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;

    const ctx = new AudioCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (profile === "soft") {
      osc.type = "sine";
      gain.gain.value = type === "error" ? 0.022 : 0.012;
    } else if (profile === "synth") {
      osc.type = "triangle";
      gain.gain.value = type === "error" ? 0.03 : 0.02;
    }

    if (type === "key") {
      osc.frequency.value = profile === "synth" ? 420 + Math.random() * 180 : 820 + Math.random() * 180;
      if (profile === "mech") gain.gain.value = 0.018;
      osc.stop(ctx.currentTime + (profile === "soft" ? 0.026 : 0.035));
    } else if (type === "enter") {
      osc.frequency.value = profile === "synth" ? 360 : 520;
      if (profile === "mech") gain.gain.value = 0.026;
      osc.stop(ctx.currentTime + 0.07);
    } else if (type === "error") {
      osc.frequency.value = 160;
      osc.type = "sawtooth";
      if (profile === "mech") gain.gain.value = 0.035;
      osc.stop(ctx.currentTime + 0.16);
    } else {
      osc.frequency.value = 523;
      if (profile === "mech") gain.gain.value = 0.03;
      osc.start();
      setTimeout(() => {
        osc.frequency.value = 659;
      }, 90);
      setTimeout(() => {
        osc.frequency.value = 784;
      }, 180);
      osc.stop(ctx.currentTime + 0.32);
      return;
    }

    osc.start();
  } catch {
    // Audio is optional.
  }
}

export default function TerminalAuth({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState<Stage>("boot");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [soundOn, setSoundOn] = useState(true);
  const [soundProfile, setSoundProfile] = useState<SoundProfile>("mech");
  const [theme, setTheme] = useState<ThemeName>("matrix");
  const [font, setFont] = useState<FontName>("jetbrains");
  const [lastWpm, setLastWpm] = useState(0);
  const [lastAccuracy, setLastAccuracy] = useState(100);
  const [storageReady, setStorageReady] = useState(false);
  const [liveStats, setLiveStats] = useState(DEFAULT_LIVE_STATS);
  const [mission, setMission] = useState<Record<MissionKey, boolean>>({
    baseline: false,
    command: false,
    dashboard: false,
    identity: false,
  });
  const [achievements, setAchievements] = useState<Array<{ detail: string; id: AchievementId; title: string }>>([]);
  const [achievementToast, setAchievementToast] = useState<{ detail: string; id: AchievementId; title: string } | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [sessionSummary, setSessionSummary] = useState<{
    accuracy: number;
    archetype: string;
    mode: "login" | "signup";
    wpm: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const formData = useRef({ email: "", name: "", password: "" });
  const authStartedAt = useRef(0);
  const authChars = useRef(0);
  const authBackspaces = useRef(0);
  const errorCountRef = useRef(0);
  const liveBackspaces = useRef(0);
  const liveStartedAt = useRef(0);
  const speedStartedAt = useRef(0);
  const unlockedAchievements = useRef(new Set<AchievementId>());
  const activeSpeedSentence = useRef("");

  const palette = THEMES[theme];
  const isPassword = stage === "login_pw" || stage === "signup_pw" || stage === "signup_confirm";
  const passwordStrength = isPassword && input ? getPasswordStrength(input) : null;
  const suggestion =
    input.length > 0
      ? stage === "idle"
        ? AUTOCOMPLETE[input.toLowerCase()]
        : stage === "login_method"
          ? LOGIN_METHOD_AUTOCOMPLETE[input.toLowerCase()]
          : undefined
      : undefined;
  const missionComplete = MISSION_STEPS.filter((step) => mission[step.key]).length;
  const missionPercent = Math.round((missionComplete / MISSION_STEPS.length) * 100);

  const lineColors = useMemo<Record<LineType, string>>(
    () => ({
      boot: "#94a3b8",        // slate — neutral across all themes
      dim: "#4b5563",        // always muted grey
      error: "#f87171",        // always red-ish (readable on any bg)
      info: palette.secondary, // theme secondary = clear visual split from accent
      logo: palette.accent,
      success: palette.accent,   // theme primary accent
      system: "#e2e8f0",        // near-white — always legible
      user: palette.accent,   // prompt input = accent
    }),
    [palette.accent, palette.secondary],
  );

  const focusTerminalInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const playSound = useCallback(
    (type: "enter" | "error" | "key" | "success") => {
      if (soundOn) createTone(type, soundProfile);
    },
    [soundOn, soundProfile],
  );

  const addLines = useCallback((nextLines: Line[]) => {
    setLines((previous) => [...previous, ...nextLines]);
  }, []);

  const typeLines = useCallback(async (nextLines: Line[], delay = 18) => {
    for (const line of nextLines) {
      if (line.neofetch || line.segments || line.text.length === 0 || line.type === "logo") {
        setLines((previous) => [...previous, line]);
        await new Promise((resolve) => setTimeout(resolve, 40));
        continue;
      }

      setLines((previous) => [...previous, { text: "", type: line.type }]);
      for (let i = 1; i <= line.text.length; i += 1) {
        const partial = line.text.slice(0, i);
        setLines((previous) => {
          const copy = [...previous];
          copy[copy.length - 1] = { text: partial, type: line.type };
          return copy;
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      await new Promise((resolve) => setTimeout(resolve, 70));
    }
  }, []);

  const markMission = useCallback((key: MissionKey) => {
    setMission((previous) => (previous[key] ? previous : { ...previous, [key]: true }));
  }, []);

  const unlockAchievement = useCallback(
    (id: AchievementId) => {
      if (unlockedAchievements.current.has(id)) return;
      unlockedAchievements.current.add(id);
      const achievement = ACHIEVEMENTS[id];
      setAchievements((previous) => [achievement, ...previous].slice(0, 5));
      setAchievementToast(achievement);
      addLines([{ text: `[UNLOCK] ${achievement.title} - ${achievement.detail}`, type: "success" }]);
    },
    [addLines],
  );

  const registerError = useCallback(() => {
    errorCountRef.current += 1;
    setErrorCount(errorCountRef.current);
    return errorCountRef.current;
  }, []);

  const recoveryHint = useCallback(
    (): Line[] =>
      errorCountRef.current >= 2
        ? [{ text: "> Recovery hint: use help, clear, google, github, or press Tab for autocomplete.", type: "info" }]
        : [],
    [],
  );

  const resetLiveInput = useCallback(() => {
    liveBackspaces.current = 0;
    liveStartedAt.current = 0;
    setLiveStats(DEFAULT_LIVE_STATS);
  }, []);

  const updateLiveStats = useCallback((value: string) => {
    if (value.length > 0 && liveStartedAt.current === 0) {
      liveStartedAt.current = Date.now();
    }

    if (value.length === 0) {
      setLiveStats({
        accuracy: liveBackspaces.current > 0 ? Math.max(0, Math.round((1 / (liveBackspaces.current + 1)) * 100)) : 100,
        backspaces: liveBackspaces.current,
        chars: 0,
        wpm: 0,
      });
      return;
    }

    const minutes = Math.max((Date.now() - liveStartedAt.current) / 60000, 0.01);
    const wpm = Math.round(value.length / 5 / minutes);
    const accuracy = Math.round((value.length / Math.max(value.length + liveBackspaces.current, 1)) * 100);
    setLiveStats({
      accuracy,
      backspaces: liveBackspaces.current,
      chars: value.length,
      wpm,
    });
  }, []);

  const resetAuthMetrics = useCallback(() => {
    authStartedAt.current = Date.now();
    authChars.current = 0;
    authBackspaces.current = 0;
    setSessionSummary(null);
    setLastWpm(0);
    setLastAccuracy(100);
  }, []);

  const getAuthStats = useCallback(() => {
    const minutes = Math.max((Date.now() - authStartedAt.current) / 60000, 0.01);
    const wpm = Math.round(authChars.current / 5 / minutes);
    const accuracy = Math.round((authChars.current / Math.max(authChars.current + authBackspaces.current, 1)) * 100);
    setLastWpm(wpm);
    setLastAccuracy(accuracy);
    return { accuracy, wpm };
  }, []);

  const openDashboard = useCallback(async () => {
    markMission("dashboard");
    setStage("done");
    await typeLines([{ text: "> Redirecting to dashboard...", type: "info" }], 16);
    router.push(DASHBOARD_PATH);
    router.refresh();
  }, [markMission, router, typeLines]);

  const processCommand = useCallback(
    async (command: string) => {
      const raw = command.trim();
      const trimmed = raw.toLowerCase();
      const [commandName, commandArg] = trimmed.split(/\s+/);

      if (
        trimmed === "esc" &&
        (stage === "login_email" ||
          stage === "login_method" ||
          stage === "login_pw" ||
          stage === "signup_name" ||
          stage === "signup_email" ||
          stage === "signup_pw" ||
          stage === "signup_confirm" ||
          stage === "speed_test")
      ) {
        playSound("error");
        await typeLines([{ text: "> Process aborted.", type: "dim" }, { text: "", type: "dim" }], 16);
        setStage("idle");
        return;
      }

      if (stage === "await_go") {
        if (trimmed === "go" || trimmed === "dashboard" || trimmed === "enter") {
          await openDashboard();
          return;
        }
        playSound("error");
        await typeLines([{ text: '> Type "go" to enter your dashboard.', type: "error" }], 16);
        return;
      }

      if (stage === "login_method") {
        if (trimmed === "email" || trimmed === "mail" || trimmed === "password" || trimmed === "credentials") {
          resetAuthMetrics();
          markMission("identity");
          await typeLines([{ text: "> Enter your email (press ESC to cancel):", type: "info" }], 16);
          setStage("login_email");
          return;
        }

        if (trimmed === "google") {
          markMission("identity");
          unlockAchievement("oauth_launch");
          await typeLines(
            [
              { text: "> OAuth bridge: Google", type: "info" },
              { text: "> Checking secure provider handshake...", type: "dim" },
              { text: "> Redirect issued. Keep speed command ready for your baseline.", type: "success" },
            ],
            14,
          );
          playSound("success");
          signIn("google", { callbackUrl: DASHBOARD_PATH });
          return;
        }

        if (trimmed === "github") {
          markMission("identity");
          unlockAchievement("oauth_launch");
          await typeLines(
            [
              { text: "> OAuth bridge: GitHub", type: "info" },
              { text: "> Checking secure provider handshake...", type: "dim" },
              { text: "> Redirect issued. Keep speed command ready for your baseline.", type: "success" },
            ],
            14,
          );
          playSound("success");
          signIn("github", { callbackUrl: DASHBOARD_PATH });
          return;
        }

        playSound("error");
        registerError();
        await typeLines(
          [
            { text: "> Choose one: email, google, or github.", type: "error" },
            { text: "    email    -> Sign in with email/password", type: "system" },
            { text: "    google   -> Continue with Google", type: "system" },
            { text: "    github   -> Continue with GitHub", type: "system" },
          ],
          14,
        );
        return;
      }

      if (stage === "speed_test") {
        const minutes = Math.max((Date.now() - speedStartedAt.current) / 60000, 0.01);
        const wpm = Math.round(command.length / 5 / minutes);
        const accuracy = scoreAccuracy(activeSpeedSentence.current, command.trim().toLowerCase());
        setLastWpm(wpm);
        setLastAccuracy(accuracy);
        markMission("baseline");
        unlockAchievement("speed_runner");
        playSound("success");
        const wpmText = `${wpm}`;
        const accText = `${accuracy}%`;
        const evalText = accuracy >= 94 ? "Clean opener" : "Needs accuracy";
        await typeLines(
          [
            { text: "  ┌── BASELINE CAPTURED ────────────────┐", type: "success" },
            { text: `  │  WPM       : ${wpmText.padEnd(23)}│`, type: "success" },
            { text: `  │  Accuracy  : ${accText.padEnd(23)}│`, type: "success" },
            { text: `  │  Evaluation: ${evalText.padEnd(23)}│`, type: "info" },
            { text: "  └─────────────────────────────────────┘", type: "success" },
            { text: "", type: "dim" },
          ],
          12,
        );
        setStage("idle");
        return;
      }

      if (stage === "idle") {
        if (raw) {
          setHistory((previous) => [raw, ...previous.filter((item) => item !== raw)].slice(0, 20));
          setHistoryIndex(-1);
          markMission("command");
          unlockAchievement("first_command");
        }

        if (trimmed === "") return;

        if (trimmed === "login") {
          await typeLines(
            [
              { text: "> Which login method?", type: "info" },
              { text: "    email    -> Sign in with email/password", type: "system" },
              { text: "    google   -> Continue with Google", type: "system" },
              { text: "    github   -> Continue with GitHub", type: "system" },
              { text: "    esc      -> Cancel", type: "dim" },
            ],
            14,
          );
          setStage("login_method");
          return;
        }

        if (trimmed === "signup") {
          resetAuthMetrics();
          markMission("identity");
          await typeLines([{ text: "> New account sequence. Enter your name (press ESC to cancel):", type: "info" }], 16);
          setStage("signup_name");
          return;
        }

        if (trimmed === "google") {
          markMission("identity");
          unlockAchievement("oauth_launch");
          await typeLines(
            [
              { text: "> OAuth bridge: Google", type: "info" },
              { text: "> Checking secure provider handshake...", type: "dim" },
              { text: "> Redirect issued. Keep speed command ready for your baseline.", type: "success" },
            ],
            14,
          );
          playSound("success");
          signIn("google", { callbackUrl: DASHBOARD_PATH });
          return;
        }

        if (trimmed === "github") {
          markMission("identity");
          unlockAchievement("oauth_launch");
          await typeLines(
            [
              { text: "> OAuth bridge: GitHub", type: "info" },
              { text: "> Checking secure provider handshake...", type: "dim" },
              { text: "> Redirect issued. Keep speed command ready for your baseline.", type: "success" },
            ],
            14,
          );
          playSound("success");
          signIn("github", { callbackUrl: DASHBOARD_PATH });
          return;
        }

        if (trimmed === "speed" || trimmed === "retry" || trimmed === "try again") {
          activeSpeedSentence.current = SPEED_SENTENCES[Math.floor(Math.random() * SPEED_SENTENCES.length)];
          speedStartedAt.current = Date.now();
          await typeLines(
            [
              { text: "> Type this sentence exactly (press ESC to cancel):", type: "info" },
              { text: `  ${activeSpeedSentence.current}`, type: "system" },
            ],
            14,
          );
          setStage("speed_test");
          return;
        }

        if (trimmed === "palette" || trimmed === "cmd") {
          await typeLines(
            [
              { text: "  Command palette", type: "info" },
              { text: "    Tab        autocomplete current command", type: "system" },
              { text: "    Up/Down    cycle command history", type: "system" },
              { text: "    login      choose email / Google / GitHub", type: "system" },
              { text: "    signup     account creation flow", type: "system" },
              { text: "    speed      quick baseline before dashboard", type: "system" },
              { text: "    theme      matrix / cyan / violet / amber / rose", type: "dim" },
              { text: "    sound      on / off / mech / soft / synth", type: "dim" },
              { text: "", type: "dim" },
            ],
            12,
          );
          return;
        }

        if (trimmed === "mission") {
          await typeLines(
            [
              { text: `  Mission progress: ${missionPercent}%`, type: "info" },
              ...MISSION_STEPS.map((step) => ({
                text: `    ${mission[step.key] ? "[OK]" : "[--]"} ${step.title} - ${step.detail}`,
                type: mission[step.key] ? "success" : "dim",
              }) satisfies Line),
              { text: "", type: "dim" },
            ],
            12,
          );
          return;
        }

        if (trimmed === "help") {
          addLines([{ text: "", type: "dim" }, ...HELP_LINES]);
          return;
        }

        if (trimmed === "clear" || trimmed === "cls") {
          setLines(WELCOME_LINES);
          return;
        }
        if (trimmed.startsWith("sudo ")) {
          playSound("error");
          await typeLines([{ text: "> [ERROR] user is not in the sudoers file. This incident will be reported.", type: "error" }, { text: "", type: "dim" }], 18);
          return;
        }

        if (trimmed === "coffee" || trimmed === "brew") {
          await typeLines(
            [
              { text: "    ( (", type: "system" },
              { text: "     ) )", type: "system" },
              { text: "  ........", type: "system" },
              { text: "  |      | ]", type: "system" },
              { text: "  \\      /", type: "system" },
              { text: "   `----'", type: "system" },
              { text: "> Brewing a fresh cup of caffeine... ☕", type: "success" },
              { text: "", type: "dim" },
            ],
            16,
          );
          return;
        }

        if (trimmed === "ping") {
          await typeLines(
            [
              { text: "> Pinging TypeForge neural engine...", type: "dim" },
              { text: "> Reply from 127.0.0.1: time<1ms TTL=64", type: "info" },
              { text: "> Connection optimal. Ready for lightning-fast keystrokes.", type: "success" },
              { text: "", type: "dim" },
            ],
            20,
          );
          return;
        }
        if (trimmed === "osprobe" || trimmed === "probe os") {
          const browserProbe = await getBrowserSystemProbe();
          const networkProbe = await getNetworkSystemProbe();
          const browserDetails = await getBrowserDetails();
          const bestProbe = browserProbe.family !== "unknown" ? browserProbe : networkProbe;
          await typeLines(
            [
              { text: "> OS probe started...", type: "dim" },
              { text: `> Browser hint  -> ${browserProbe.os}`, type: browserProbe.family === "unknown" ? "dim" : "info" },
              { text: `> Network hint  -> ${networkProbe.os}`, type: networkProbe.family === "unknown" ? "dim" : "info" },
              { text: `> Browser app   -> ${browserDetails.name}`, type: browserDetails.name === "Unknown Browser" ? "dim" : "info" },
              { text: `> Engine        -> ${browserDetails.engine}`, type: browserDetails.engine === "Unknown" ? "dim" : "info" },
              { text: `> Selected logo -> ${OS_LABELS[bestProbe.family]}`, type: "success" },
              { text: "", type: "dim" },
            ],
            12,
          );
          return;
        }
        if (trimmed === "neofetch" || trimmed === "sysinfo") {
          const browserProbe = await getBrowserSystemProbe();
          const networkProbe = await getNetworkSystemProbe();
          const browserDetails = await getBrowserDetails();
          const osFamily = browserProbe.family !== "unknown" ? browserProbe.family : networkProbe.family;
          const os = browserProbe.family !== "unknown" ? browserProbe.os : networkProbe.os;
          const cores = navigator.hardwareConcurrency || "Unknown";
          const ram = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory}GB+` : "Unknown";
          const screenRes = getDisplaySummary();

          // Generate a believable CPU string based on logical cores and OS
          const isMac = osFamily === "macos";
          const arch = browserProbe.architecture || (navigator.userAgent.includes("Win64") || navigator.userAgent.includes("x86_64") ? "x86_64" : "ARM64");
          const cpuName = isMac && typeof cores === "number" && cores >= 4 ? `Apple Silicon (M-Series) ${cores}-Core` : `Intel/AMD ${arch} ${cores}-Core Processor`;

          const isMobileDevice = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
          const themeStatColors = {
            browser: theme === "rose" ? "#fecdd3" : "#fda4af",
            cpu: theme === "violet" ? "#e9d5ff" : "#ddd6fe",
            device: theme === "cyan" ? "#a5f3fc" : "#bae6fd",
            display: theme === "amber" ? "#fef3c7" : "#fde68a",
            memory: theme === "matrix" ? "#bbf7d0" : "#86efac",
            os: theme === "cyan" ? "#bae6fd" : "#93c5fd",
          };
          const statRows: NeofetchStat[] = [
            { label: "OS", value: os, labelColor: palette.secondary, valueColor: themeStatColors.os },
            { label: "Device", value: isMobileDevice ? "Mobile terminal" : "Desktop terminal", labelColor: "#22d3ee", valueColor: themeStatColors.device },
            { label: "CPU", value: cpuName, labelColor: "#a78bfa", valueColor: themeStatColors.cpu },
            { label: "Memory", value: `~${ram}`, labelColor: "#34d399", valueColor: themeStatColors.memory },
            { label: "Display", value: screenRes, labelColor: "#f59e0b", valueColor: themeStatColors.display },
            { label: "Browser", value: browserDetails.name, labelColor: "#fb7185", valueColor: themeStatColors.browser },
            { label: "Engine", value: browserDetails.engine, labelColor: "#22d3ee", valueColor: themeStatColors.device },
            { label: "Source", value: browserDetails.source, labelColor: "#64748b", valueColor: "#94a3b8" },
            { label: "Terminal", value: "TypeForge Web", labelColor: palette.accent, valueColor: palette.secondary },
          ];

          await typeLines(
            [
              { text: "  SYSTEM IDENTITY", type: "info" },
              { text: "", type: "dim" },
              {
                neofetch: {
                  logoAlt: `${OS_LABELS[osFamily]} logo`,
                  logoFilter: getOsLogoFilter(osFamily, palette.glow),
                  logoSrc: OS_LOGOS[osFamily],
                  logoTitle: OS_LABELS[osFamily],
                  stats: statRows,
                },
                text: "neofetch system panel",
                type: "system",
              },
              { text: "", type: "dim" }
            ],
            12
          );
          return;
        }

        if (trimmed.startsWith("nmap ")) {
          const target = trimmed.split(" ")[1] || "localhost";
          await typeLines([
            { text: `> Starting Nmap 7.93 ( https://nmap.org ) at ${new Date().toLocaleTimeString()}`, type: "dim" },
            { text: `> Nmap scan report for ${target}`, type: "info" },
            { text: "Host is up (0.013s latency).", type: "system" },
            { text: "Not shown: 996 closed tcp ports", type: "dim" },
            { text: "PORT     STATE SERVICE", type: "info" },
            { text: "22/tcp   open  ssh", type: "success" },
            { text: "80/tcp   open  http", type: "success" },
            { text: "443/tcp  open  https", type: "success" },
            { text: "3000/tcp open  react-dev", type: "success" },
            { text: "", type: "dim" },
            { text: "> Nmap done: 1 IP address (1 host up) scanned in 0.42 seconds", type: "system" },
            { text: "", type: "dim" }
          ], 40);
          return;
        }

        if (trimmed === "netstat") {
          await typeLines([
            { text: "Active Internet connections (w/o servers)", type: "info" },
            { text: "Proto Recv-Q Send-Q Local Address           Foreign Address         State      ", type: "dim" },
            { text: "tcp        0      0 192.168.1.14:54321      104.21.84.1:443         ESTABLISHED", type: "system" },
            { text: "tcp        0      0 192.168.1.14:54322      104.21.84.1:443         ESTABLISHED", type: "system" },
            { text: "tcp        0      0 127.0.0.1:3000          127.0.0.1:54325         TIME_WAIT  ", type: "dim" },
            { text: "udp        0      0 0.0.0.0:68              0.0.0.0:*                          ", type: "dim" },
            { text: "", type: "dim" }
          ], 16);
          return;
        }

        if (trimmed === "top" || trimmed === "htop") {
          await typeLines(
            [
              { text: "PID    USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND", type: "info" },
              { text: "1337   root      20   0   16.4g   8.2g   2.1g R  99.9  64.2  13:37.00 typing-engine", type: "error" },
              { text: "1402   user      20   0   2.1g    1.1g   0.8g S  12.5  10.1   4:20.12 ui-thread", type: "system" },
              { text: "42     root      20   0   0.0g    0.0g   0.0g S   0.1   0.1 999:99.99 system-idle", type: "dim" },
              { text: "", type: "dim" }
            ],
            16
          );
          return;
        }

        if (trimmed.startsWith("traceroute ") || trimmed === "traceroute") {
          const target = trimmed.split(" ")[1] || "typeforge.dev";
          await typeLines(
            [
              { text: `> traceroute to ${target} (104.21.84.1), 30 hops max`, type: "dim" },
              { text: "  1  neural-gateway.local (192.168.1.1)  0.112 ms", type: "system" },
              { text: "  2  isp-node-01.net (10.42.0.1)  4.231 ms", type: "system" },
              { text: "  3  core-router-x.ix.net (172.16.4.2)  12.045 ms", type: "system" },
              { text: `  4  ${target} (104.21.84.1)  14.331 ms`, type: "success" },
              { text: "> Trace complete.", type: "success" },
              { text: "", type: "dim" }
            ],
            40
          );
          return;
        }

        if (trimmed.startsWith("curl ") || trimmed.startsWith("wget ")) {
          const file = trimmed.split(" ")[1] || "payload.bin";
          await typeLines(
            [
              { text: `> Fetching ${file}...`, type: "dim" },
              { text: "  [=================>           ] 64%", type: "info" },
              { text: "  [============================>] 100%", type: "success" },
              { text: `> Successfully downloaded ${file}.`, type: "success" },
              { text: "", type: "dim" }
            ],
            40
          );
          return;
        }

        if (trimmed === "uptime") {
          await typeLines([
            { text: "> 13:37:00 up 1337 days, 4:20, 1 user, load average: 0.01, 0.05, 0.15", type: "info" },
            { text: "", type: "dim" }
          ], 16);
          return;
        }

        if (trimmed === "ls" || trimmed === "dir") {
          await typeLines(
            [
              { text: "total 42", type: "dim" },
              { text: "drwxr-xr-x   4 root  root    4096 May 09 13:37 core/", type: "info" },
              { text: "drwxr-xr-x   2 root  root    4096 May 09 13:37 auth/", type: "info" },
              { text: "drwx------   2 root  root    4096 May 09 13:37 secret/", type: "error" },
              { text: "-rw-r--r--   1 root  root     133 May 09 13:37 readme.md", type: "system" },
              { text: "", type: "dim" }
            ],
            16
          );
          return;
        }

        if (trimmed.startsWith("cd ")) {
          playSound("error");
          await typeLines([
            { text: "> [RESTRICTED] Directory navigation is locked during auth sequence.", type: "error" },
            { text: "", type: "dim" }
          ], 16);
          return;
        }

        if (trimmed.startsWith("cat ")) {
          const file = trimmed.split(" ")[1] || "";
          if (file === "readme.md") {
            await typeLines(
              [
                { text: "> # TypeForge v1.0", type: "success" },
                { text: "> Welcome to the future of typing.", type: "system" },
                { text: "> Type 'login' or 'signup' to enter the matrix.", type: "system" },
                { text: "", type: "dim" }
              ],
              16
            );
          } else {
            playSound("error");
            await typeLines([
              { text: `> cat: ${file}: Permission denied`, type: "error" },
              { text: "", type: "dim" }
            ], 16);
          }
          return;
        }

        if (trimmed === "ipconfig" || trimmed === "ifconfig") {
          await typeLines(
            [
              { text: "Neural Network Adapter (eth0):", type: "info" },
              { text: "   Connection-specific DNS Suffix . : typeforge.local", type: "dim" },
              { text: "   IPv4 Address. . . . . . . . . . . : 192.168.13.37", type: "system" },
              { text: "   Subnet Mask . . . . . . . . . . . : 255.255.255.0", type: "system" },
              { text: "   Default Gateway . . . . . . . . . : 192.168.13.1", type: "system" },
              { text: "", type: "dim" }
            ],
            16
          );
          return;
        }

        if (trimmed === "reboot" || trimmed === "restart") {
          setLines([]);
          setStage("boot");
          return;
        }

        if (trimmed === "whoami") {
          await typeLines([{ text: "> You are one clean session away from a sharper typing baseline.", type: "info" }, { text: "", type: "dim" }], 18);
          return;
        }

        if (trimmed === "hack") {
          const chars = "01";
          const hackSteps = [
            "[*] Initiating brute-force attack...",
            "[*] Bypassing 256-bit encryption...",
            "[*] Injecting binary payload...",
            "[*] Overriding system variables...",
            "[*] Dumping memory buffers...",
          ];

          // Add a random hacking step first
          const randomStep = hackSteps[Math.floor(Math.random() * hackSteps.length)];
          addLines([{ text: `  ${randomStep}`, type: "success" }]);
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Generate random binary dumps
          for (let i = 0; i < 10 + Math.random() * 8; i += 1) {
            const binaryDump = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * 2)]).join("")).join(" ");

            addLines([{ text: `  ${binaryDump}`, type: "success" }]);
            await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 30));
          }

          playSound("error");
          await typeLines([
            { text: "> CRITICAL ALERT: SYSTEM BREACH DETECTED.", type: "error" },
            { text: "> TRACING IP ADDRESS... TRACE COMPLETE.", type: "error" },
            { text: "> ACCESS DENIED. Terminal locked.", type: "error" },
            { text: "", type: "dim" }
          ], 16);
          return;
        }

        if (trimmed === "matrix") {
          setTheme("matrix");
          unlockAchievement("theme_switch");
          const chars = "01TYPEFORGE";
          for (let i = 0; i < 5; i += 1) {
            addLines([{ text: "  " + Array.from({ length: 48 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""), type: "success" }]);
            await new Promise((resolve) => setTimeout(resolve, 60));
          }
          await typeLines([{ text: "> Matrix palette locked.", type: "success" }, { text: "", type: "dim" }], 12);
          return;
        }

        if (trimmed === "coffee") {
          await typeLines([{ text: "> Caffeine module simulated. Fingers stay responsible.", type: "info" }, { text: "", type: "dim" }], 16);
          return;
        }

        if (trimmed === "vim") {
          await typeLines([{ text: "> Insert mode already enabled. Escape is optional here.", type: "info" }, { text: "", type: "dim" }], 16);
          return;
        }

        if (trimmed === "exit") {
          await typeLines([{ text: "> Terminal session preserved. Type clear if you want a fresh screen.", type: "dim" }, { text: "", type: "dim" }], 16);
          return;
        }

        if (trimmed === "rm -rf" || trimmed.startsWith("rm -rf ")) {
          playSound("error");
          await typeLines([{ text: "> Protected route. No project files were touched.", type: "error" }, { text: "", type: "dim" }], 16);
          return;
        }

        if (trimmed === "sudo login" || trimmed === "sudo su" || trimmed.startsWith("sudo")) {
          await typeLines([{ text: "> Permission granted. Developer energy detected.", type: "success" }, { text: "> Still type login like everyone else.", type: "dim" }, { text: "", type: "dim" }], 16);
          return;
        }

        if (trimmed === "sound on" || trimmed === "sound off") {
          const nextSound = trimmed.endsWith("on");
          setSoundOn(nextSound);
          await typeLines([{ text: `> Sound ${nextSound ? "enabled" : "disabled"}.`, type: "info" }, { text: "", type: "dim" }], 16);
          return;
        }

        if (trimmed.startsWith("sound ")) {
          const nextProfile = trimmed.split(/\s+/)[1];
          if (isSoundProfile(nextProfile)) {
            setSoundOn(true);
            setSoundProfile(nextProfile);
            unlockAchievement("tone_shaper");
            await typeLines(
              [
                { text: `> Audio profile set to ${SOUND_PROFILES[nextProfile].name}.`, type: "success" },
                { text: `> ${SOUND_PROFILES[nextProfile].detail}.`, type: "dim" },
                { text: "", type: "dim" },
              ],
              14,
            );
          } else {
            playSound("error");
            registerError();
            await typeLines([{ text: "> Available sound profiles: mech, soft, synth.", type: "error" }, ...recoveryHint(), { text: "", type: "dim" }], 16);
          }
          return;
        }

        if (commandName === "theme" || commandName === "themes") {
          const nextTheme = commandArg as ThemeName | undefined;
          if (nextTheme && THEMES[nextTheme]) {
            if (nextTheme === theme) {
              await typeLines([{ text: `> Already on ${THEMES[nextTheme].name}. No change.`, type: "info" }, { text: "", type: "dim" }], 16);
            } else {
              setTheme(nextTheme);
              unlockAchievement("theme_switch");
              await typeLines([{ text: `> Theme set to ${THEMES[nextTheme].name}.`, type: "success" }, { text: "", type: "dim" }], 16);
            }
          } else {
            playSound("error");
            const allThemes = (Object.keys(THEMES) as ThemeName[]).map(
              (t) => `  ${t === theme ? "[active]" : "        "} theme ${t.padEnd(8)} ${THEMES[t].name}`
            );
            await typeLines([
              { text: "> Select a theme:", type: "info" },
              ...allThemes.map((t) => ({ text: t, type: (t.includes("[active]") ? "success" : "dim") as LineType })),
              { text: "", type: "dim" },
            ], 16);
          }
          return;
        }

        if (commandName === "font" || commandName === "fonts") {
          const nextFont = commandArg as FontName | undefined;
          if (nextFont && FONTS[nextFont]) {
            if (nextFont === font) {
              await typeLines([{ text: `> Already using ${FONTS[nextFont].name}. No change.`, type: "info" }, { text: "", type: "dim" }], 16);
            } else {
              setFont(nextFont);
              await typeLines([{ text: `> Font switched to ${FONTS[nextFont].name}.`, type: "success" }, { text: "", type: "dim" }], 16);
            }
          } else {
            playSound("error");
            const allFonts = (Object.keys(FONTS) as FontName[]).map(
              (f) => `  ${f === font ? "[active]" : "        "} font ${f.padEnd(12)} ${FONTS[f].name}`
            );
            await typeLines([
              { text: "> Select a font:", type: "info" },
              ...allFonts.map((f) => ({ text: f, type: (f.includes("[active]") ? "success" : "dim") as LineType })),
              { text: "", type: "dim" },
            ], 16);
          }
          return;
        }

        playSound("error");
        registerError();
        await typeLines([{ text: `> Command not found: ${raw}. Type help.`, type: "error" }, ...recoveryHint(), { text: "", type: "dim" }], 16);
        return;
      }

      if (stage === "login_email") {
        if (!/^\S+@\S+\.\S+$/.test(raw)) {
          playSound("error");
          registerError();
          await typeLines([{ text: "> Invalid email format. Try again:", type: "error" }, ...recoveryHint()], 14);
          return;
        }
        formData.current.email = raw;
        await typeLines([{ text: "> Enter your password:", type: "info" }], 16);
        setStage("login_pw");
        return;
      }

      if (stage === "login_pw") {
        formData.current.password = command;
        setStage("auth");
        await typeLines(
          [
            { text: "> Authenticating credentials...", type: "dim" },
            { text: "> Sealing password payload...", type: "dim" },
            { text: "> Preparing dashboard handoff...", type: "dim" },
          ],
          14,
        );
        const result = await signIn("credentials", {
          callbackUrl: DASHBOARD_PATH,
          email: formData.current.email,
          password: formData.current.password,
          redirect: false,
        });

        if (result?.error) {
          playSound("error");
          registerError();
          await typeLines([{ text: "> Authentication failed. Check email/password.", type: "error" }, { text: "> Type login to try again, or google/github.", type: "dim" }, ...recoveryHint(), { text: "", type: "dim" }], 16);
          setStage("idle");
          return;
        }

        const stats = getAuthStats();
        const archetype = stats.wpm >= 80 ? "Velocity return" : stats.wpm >= 52 ? "Sharp return" : "Steady return";
        setSessionSummary({ accuracy: stats.accuracy, archetype, mode: "login", wpm: stats.wpm });
        unlockAchievement("terminal_auth");
        if (stats.accuracy === 100) unlockAchievement("clean_auth");
        playSound("success");
        await typeLines(
          [
            { text: `> Authentication successful in terminal mode.`, type: "success" },
            { text: `> Login pace: ${stats.wpm} WPM @ ${stats.accuracy}% input accuracy.`, type: "info" },
            { text: '> Type "go" to enter your dashboard.', type: "system" },
            { text: "", type: "dim" },
          ],
          16,
        );
        setStage("await_go");
        return;
      }

      if (stage === "signup_name") {
        if (raw.length < 2) {
          playSound("error");
          registerError();
          await typeLines([{ text: "> Name is too short. Try again:", type: "error" }, ...recoveryHint()], 14);
          return;
        }
        formData.current.name = raw;
        await typeLines([{ text: "> Enter your email:", type: "info" }], 16);
        setStage("signup_email");
        return;
      }

      if (stage === "signup_email") {
        if (!/^\S+@\S+\.\S+$/.test(raw)) {
          playSound("error");
          registerError();
          await typeLines([{ text: "> Invalid email format. Try again:", type: "error" }, ...recoveryHint()], 14);
          return;
        }
        formData.current.email = raw;
        await typeLines([{ text: "> Choose a password (minimum 8 chars):", type: "info" }], 16);
        setStage("signup_pw");
        return;
      }

      if (stage === "signup_pw") {
        if (command.length < 8) {
          playSound("error");
          registerError();
          await typeLines([{ text: "> Password needs at least 8 characters:", type: "error" }, ...recoveryHint()], 14);
          return;
        }
        formData.current.password = command;
        const strength = getPasswordStrength(command);
        await typeLines([{ text: `> [${strength.label}] ${"█".repeat(strength.bars * 4)}${"░".repeat((3 - strength.bars) * 4)}`, type: strength.bars >= 3 ? "success" : "info" }, { text: "> Confirm your password:", type: "info" }], 14);
        setStage("signup_confirm");
        return;
      }

      if (stage === "signup_confirm") {
        if (command !== formData.current.password) {
          playSound("error");
          registerError();
          await typeLines([{ text: "> Passwords do not match. Confirm again:", type: "error" }, ...recoveryHint()], 14);
          return;
        }

        setStage("auth");
        await typeLines(
          [
            { text: "> Creating account...", type: "dim" },
            { text: "> Reserving TypeForge profile...", type: "dim" },
            { text: "> Preparing first dashboard session...", type: "dim" },
          ],
          14,
        );
        const stats = getAuthStats();

        try {
          const response = await fetch("/api/auth/register", {
            body: JSON.stringify({
              email: formData.current.email,
              name: formData.current.name,
              password: formData.current.password,
            }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });
          const payload = await response.json();

          if (!response.ok) {
            playSound("error");
            registerError();
            await typeLines([{ text: `> ${payload.error || "Registration failed."}`, type: "error" }, { text: "> Type signup to try again.", type: "dim" }, ...recoveryHint(), { text: "", type: "dim" }], 16);
            setStage("idle");
            return;
          }

          const loginResult = await signIn("credentials", {
            callbackUrl: DASHBOARD_PATH,
            email: formData.current.email,
            password: formData.current.password,
            redirect: false,
          });

          if (loginResult?.error) {
            playSound("error");
            registerError();
            await typeLines([{ text: "> Account created, but auto-login failed. Type login.", type: "error" }, ...recoveryHint(), { text: "", type: "dim" }], 16);
            setStage("idle");
            return;
          }

          const archetype = stats.wpm >= 80 ? "Speed Demon" : stats.wpm >= 52 ? "Swift Starter" : "Steady Builder";
          setSessionSummary({ accuracy: stats.accuracy, archetype, mode: "signup", wpm: stats.wpm });
          unlockAchievement("terminal_auth");
          if (stats.accuracy === 100) unlockAchievement("clean_auth");
          playSound("success");
          await typeLines(
            [
              { text: "> Account created.", type: "success" },
              { text: "", type: "dim" },
              { text: "  First Impression Score", type: "info" },
              { text: `  Speed     ${stats.wpm || "--"} WPM`, type: "success" },
              { text: `  Accuracy  ${stats.accuracy}%`, type: "success" },
              { text: `  Archetype ${archetype}`, type: "success" },
              { text: "", type: "dim" },
              { text: '> Type "go" to enter your dashboard.', type: "system" },
              { text: "", type: "dim" },
            ],
            16,
          );
          setStage("await_go");
        } catch {
          playSound("error");
          registerError();
          await typeLines([{ text: "> Network error. Try again.", type: "error" }, ...recoveryHint(), { text: "", type: "dim" }], 16);
          setStage("idle");
        }
      }
    },
    [addLines, font, getAuthStats, markMission, mission, missionPercent, openDashboard, playSound, recoveryHint, registerError, resetAuthMetrics, stage, theme, typeLines, unlockAchievement],
  );

  const submitInput = useCallback(() => {
    const value = input;
    const prompt = getPrompt(stage);
    const maskedValue = isPassword ? "•".repeat(value.length) : value;
    addLines([{ text: `${prompt}${maskedValue}`, type: "user" }]);
    authChars.current += value.length;
    setInput("");
    resetLiveInput();
    processCommand(value);
  }, [addLines, input, isPassword, processCommand, resetLiveInput, stage]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setInput(nextValue);
      updateLiveStats(nextValue);
    },
    [updateLiveStats],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (stage === "auth" || stage === "boot" || stage === "done") {
      event.preventDefault();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      if (
        stage === "login_email" ||
        stage === "login_method" ||
        stage === "login_pw" ||
        stage === "signup_name" ||
        stage === "signup_email" ||
        stage === "signup_pw" ||
        stage === "signup_confirm" ||
        stage === "speed_test"
      ) {
        playSound("error");
        addLines([{ text: "> Process aborted.", type: "dim" }, { text: "", type: "dim" }]);
        setStage("idle");
        setInput("");
        resetLiveInput();
      }
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      playSound("enter");
      submitInput();
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      if (suggestion && suggestion !== input.toLowerCase()) {
        setInput(suggestion);
        updateLiveStats(suggestion);
        playSound("key");
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (stage === "idle" && history.length > 0) {
        const nextIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
        updateLiveStats(history[nextIndex]);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (stage === "idle") {
        const nextIndex = historyIndex - 1;
        if (nextIndex < 0) {
          setHistoryIndex(-1);
          setInput("");
          resetLiveInput();
        } else {
          setHistoryIndex(nextIndex);
          setInput(history[nextIndex]);
          updateLiveStats(history[nextIndex]);
        }
      }
      return;
    }

    if (event.key === "Backspace" && input.length > 0) {
      authBackspaces.current += 1;
      liveBackspaces.current += 1;
      window.setTimeout(() => updateLiveStats(inputRef.current?.value ?? ""), 0);
      return;
    }

    if (event.key.length === 1) {
      playSound("key");
    }
  };

  useEffect(() => {
    let cancelled = false;

    setStage("boot");
    setLines([
      ...BOOT_LINES,
      { text: "", type: "logo" },
      ...WELCOME_LINES,
      ...(mode === "register"
        ? [
          { text: "> Hint: type signup to create your account.", type: "dim" } satisfies Line,
          { text: "", type: "dim" } satisfies Line,
        ]
        : []),
    ]);

    const readyTimer = window.setTimeout(() => {
      if (cancelled) return;
      setStage("idle");
      focusTerminalInput();
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(readyTimer);
    };
  }, [focusTerminalInput, mode]);

  useEffect(() => {
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      const terminalInput = inputRef.current;
      if (!terminalInput || event.defaultPrevented || document.activeElement === terminalInput) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const isEditableTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        Boolean(target?.isContentEditable);

      if (isEditableTarget && target !== terminalInput) {
        return;
      }

      if (event.key !== " " && event.code !== "Space") {
        return;
      }

      event.preventDefault();
      focusTerminalInput();

      if (stage === "auth" || stage === "boot" || stage === "done") {
        return;
      }

      setInput((previous) => {
        const nextValue = `${previous} `;
        updateLiveStats(nextValue);
        return nextValue;
      });
      playSound("key");
    };

    document.addEventListener("keydown", handleDocumentKeyDown, true);
    return () => document.removeEventListener("keydown", handleDocumentKeyDown, true);
  }, [focusTerminalInput, playSound, stage, updateLiveStats]);

  // Load persisted preferences on mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(STORAGE_THEME);
      const storedSound = localStorage.getItem(STORAGE_SOUND);
      const storedSoundProfile = localStorage.getItem(STORAGE_SOUND_PROFILE);
      const storedFont = localStorage.getItem(STORAGE_FONT);

      if (isThemeName(storedTheme)) setTheme(storedTheme);
      if (storedSound === "on" || storedSound === "off") setSoundOn(storedSound === "on");
      if (isSoundProfile(storedSoundProfile)) setSoundProfile(storedSoundProfile);
      if (isFontName(storedFont)) setFont(storedFont);
    } catch {
      // Local persistence is optional.
    } finally {
      setStorageReady(true);
    }
  }, []);

  // Persist preferences whenever they change
  useEffect(() => {
    if (!storageReady) return;
    try {
      localStorage.setItem(STORAGE_THEME, theme);
      localStorage.setItem(STORAGE_SOUND, soundOn ? "on" : "off");
      localStorage.setItem(STORAGE_SOUND_PROFILE, soundProfile);
      localStorage.setItem(STORAGE_FONT, font);
    } catch {
      // Local persistence is optional.
    }
  }, [font, soundOn, soundProfile, storageReady, theme]);

  // Dynamically inject Google Font link tag when font changes
  useEffect(() => {
    const fontData = FONTS[font];
    const linkId = "tf-font-link";
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = fontData.url;
  }, [font]);

  useEffect(() => {
    if (!achievementToast) return undefined;
    const timeout = window.setTimeout(() => setAchievementToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [achievementToast]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, input]);

  return (
    <div
      data-typeforge-auth="true"
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#050608] text-white"
      onClick={focusTerminalInput}
      style={{
        backgroundImage:
          `radial-gradient(circle at 50% -10%, ${palette.glow}, transparent 38%), radial-gradient(circle at 82% 20%, rgba(56,189,248,0.08), transparent 30%), linear-gradient(180deg, #050608 0%, #07090d 100%)`,
      }}
    >
      <style>{`
        body:has([data-typeforge-auth="true"]) header {
          display: none !important;
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.24) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.24) 1px, transparent 1px)",
        backgroundSize: "42px 42px",
      }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${palette.accent}, transparent)` }} />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex h-[100dvh] w-full"
      >
        {achievementToast && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="pointer-events-none absolute right-4 top-4 z-20 hidden rounded-2xl border border-[#30363d] bg-[#161b22]/95 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.45)] md:block"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0d1117]" style={{ color: palette.accent }}>
                <Medal className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-[#7d8590]">Achievement</span>
                <span className="block font-mono text-sm font-black text-white">{achievementToast.title}</span>
              </span>
            </div>
          </motion.div>
        )}
        <div className="flex min-h-0 w-full flex-col overflow-hidden border-none bg-[#0d1117]/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl">
          <div className="flex items-center gap-2 border-b border-[#30363d]/70 bg-[#161b22]/75 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <div className="ml-4 flex min-w-0 flex-1 items-center gap-2">
              <Terminal className="h-4 w-4 shrink-0" style={{ color: palette.accent }} />
              <span className="truncate font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#8b949e]">
                TypeForge Terminal v1.0 / auth@typeforge
              </span>
            </div>
          </div>

          <div
            ref={scrollRef}
            data-lenis-prevent=""
            data-lenis-prevent-wheel=""
            data-native-scroll=""
            className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-4 py-5 text-[12px] leading-[1.72] sm:px-6 sm:text-[13px] sm:leading-[1.78] lg:px-8"
            style={{ fontFamily: FONTS[font].family }}
          >
            {lines.map((line, index) => {
              if (line.type === "logo") {
                return <TypeForgeTerminalLogo key={`${index}-${line.type}`} font={font} theme={theme} />;
              }

              if (line.neofetch) {
                return (
                  <div
                    key={`${index}-${line.type}`}
                    className="my-3 flex max-w-[760px] flex-col gap-3 bg-transparent p-0 sm:flex-row sm:items-center"
                  >
                    <div className="flex shrink-0 items-center justify-center sm:w-[176px]">
                      <span className="grid h-28 w-28 place-items-center bg-transparent sm:h-36 sm:w-36">
                        <img
                          alt={line.neofetch.logoAlt}
                          className="h-24 w-24 object-contain sm:h-32 sm:w-32"
                          draggable={false}
                          src={line.neofetch.logoSrc}
                          style={{ filter: line.neofetch.logoFilter }}
                        />
                      </span>
                    </div>
                    <div className="grid min-w-0 flex-1 gap-1.5">
                      {line.neofetch.stats.map((stat) => (
                        <div
                          key={stat.label}
                          className="grid min-w-0 grid-cols-[66px_18px_minmax(0,1fr)] items-baseline gap-1.5 text-[11px] sm:grid-cols-[88px_28px_minmax(0,1fr)] sm:gap-2 sm:text-[13px]"
                        >
                          <span className="font-black" style={{ color: stat.labelColor }}>
                            {stat.label}
                          </span>
                          <span className="text-[#64748b]">-&gt;</span>
                          <span className="min-w-0 break-words font-bold" style={{ color: stat.valueColor }}>
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`${index}-${line.type}`}
                  className="whitespace-pre-wrap break-words"
                  style={{ color: lineColors[line.type] }}
                >
                  {line.segments
                    ? line.segments.map((segment, segmentIndex) => (
                      <span
                        key={`${index}-${segmentIndex}`}
                        style={{
                          color: segment.color ?? (segment.type ? lineColors[segment.type] : "inherit"),
                          fontWeight: segment.weight,
                        }}
                      >
                        {segment.text}
                      </span>
                    ))
                    : line.text || "\u00A0"}
                </div>
              );
            })}

            {stage !== "boot" && stage !== "done" && (
              <div className="relative mt-1 flex items-center" style={{ color: stage === "idle" || stage === "await_go" ? palette.accent : palette.secondary }}>
                <span className="mr-1 select-none">{getPrompt(stage)}</span>
                <span>
                  {stage === "speed_test" ? (
                    input.split("").map((char, i) => {
                      const isCorrect = char.toLowerCase() === activeSpeedSentence.current[i]?.toLowerCase();
                      return (
                        <span
                          key={i}
                          style={{
                            color: isCorrect ? palette.accent : "#fb7185",
                            backgroundColor: isCorrect ? "transparent" : "rgba(251,113,133,0.15)",
                            textDecoration: isCorrect ? "none" : "underline",
                          }}
                        >
                          {char}
                        </span>
                      );
                    })
                  ) : (
                    isPassword ? "•".repeat(input.length) : input
                  )}
                </span>
                <motion.span
                  animate={{ opacity: [1, 0.12, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  className="mx-[1px] inline-block h-[17px] w-[8px] translate-y-[1px] shrink-0 bg-current"
                />
                {suggestion && suggestion !== input.toLowerCase() && (
                  <span className="pointer-events-none ml-0.5 select-none font-mono text-[#64748b]">
                    <span>{suggestion.slice(input.length)}</span>
                    <span className="ml-2 text-[10px] uppercase tracking-[0.14em]">tab</span>
                  </span>
                )}
              </div>
            )}

            {passwordStrength && (
              <div className="mt-2 flex max-w-sm items-center gap-3 rounded-2xl border border-[#30363d]/70 bg-[#161b22]/75 px-3 py-2">
                <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
                <div className="flex flex-1 gap-1">
                  {[0, 1, 2].map((bar) => (
                    <span
                      key={bar}
                      className="h-1.5 flex-1 rounded-full"
                      style={{ backgroundColor: bar < passwordStrength.bars ? passwordStrength.color : "rgba(148,163,184,0.16)" }}
                    />
                  ))}
                </div>
              </div>
            )}

            {stage === "await_go" && sessionSummary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 max-w-xl overflow-hidden rounded-3xl border border-[#30363d] bg-[#161b22]/80 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.35)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#7d8590]">Access summary</p>
                    <h3 className="mt-1 text-xl font-black text-white">
                      {sessionSummary.mode === "signup" ? "Account created" : "Welcome back"}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-[#8b949e]">{sessionSummary.archetype} profile ready.</p>
                  </div>
                  <span className="rounded-full border border-[#30363d] px-3 py-1 font-mono text-xs font-black" style={{ color: palette.accent }}>
                    type go
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    ["Pace", `${sessionSummary.wpm || "--"} WPM`],
                    ["Accuracy", `${sessionSummary.accuracy}%`],
                    ["Next", "Dashboard"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-[#30363d]/70 bg-[#0d1117]/75 p-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#7d8590]">{label}</p>
                      <p className="mt-1 truncate font-mono text-sm font-black text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          aria-label="TypeForge terminal input"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          autoFocus
          className="sr-only"
          enterKeyHint="send"
          inputMode="text"
          onBlur={() => {
            window.setTimeout(focusTerminalInput, 0);
          }}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          type={isPassword ? "password" : "text"}
          value={input}
        />
      </motion.div>
    </div>
  );
}
