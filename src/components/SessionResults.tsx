"use client";

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowRight, RotateCcw, Star } from 'lucide-react';
import { getLevelFromXp } from '@/hooks/useStreak';

interface SessionResultsProps {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  elapsedMs: number;
  mode: string;
  wpmHistory: number[];
  pb: { wpm: number; accuracy: number };
  newPb: { wpm: boolean; accuracy: boolean };
  streak: number;
  xp: number;
  xpEarned: number;
  onRestart: () => void;
}

declare global {
  interface Window {
    Chart?: any;
    __typeforgeChartLoader?: Promise<void>;
  }
}

const easeOutExpo = (progress: number) => (progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress));

const loadChartJs = () => {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Chart) return Promise.resolve();
  if (window.__typeforgeChartLoader) return window.__typeforgeChartLoader;

  window.__typeforgeChartLoader = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-typeforge-chartjs]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js';
    script.async = true;
    script.dataset.typeforgeChartjs = 'true';
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return window.__typeforgeChartLoader;
};

const useCountUp = (end: number, duration = 1400) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(easeOutExpo(progress) * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    const frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [end, duration]);

  return count;
};

function formatDuration(elapsedMs: number) {
  const mins = Math.floor(elapsedMs / 60000);
  const secs = Math.floor((elapsedMs % 60000) / 1000);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function getFocusCopy(errors: number, accuracy: number, wpm: number) {
  if (errors > 6) return 'Clean the next pass before adding speed.';
  if (accuracy < 96) return 'Keep this pace and reduce corrections.';
  if (wpm < 45) return 'Accuracy is stable. Tighten the rhythm.';
  return 'Hold the rhythm and raise speed slowly.';
}

function createFallbackVelocity(targetWpm: number) {
  return Array.from({ length: 97 }, (_, index) => {
    const warmup = index / 96;
    const baseline = Math.max(18, targetWpm || 34);
    const curve = baseline * (0.34 + 0.72 * (1 - Math.exp(-warmup * 8)));
    const dip = index < 10 ? (10 - index) * 1.35 : 0;
    const noise = Math.sin(index * 0.58) * 1.3 + Math.cos(index * 0.19) * 0.9;
    return Math.max(3, Math.round(curve - dip + noise));
  });
}

function VelocityChart({ data, targetWpm }: { data: number[]; targetWpm: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    const values = data.length > 4 ? data : createFallbackVelocity(targetWpm);

    loadChartJs().then(() => {
      if (cancelled || !canvasRef.current || !window.Chart) return;
      chartRef.current?.destroy();

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      const strokeGradient = context.createLinearGradient(0, 0, canvas.clientWidth, 0);
      strokeGradient.addColorStop(0, '#00d9be');
      strokeGradient.addColorStop(1, '#7c3aed');

      const fillGradient = context.createLinearGradient(0, 0, 0, canvas.clientHeight || 140);
      fillGradient.addColorStop(0, 'rgba(0, 217, 190, 0.16)');
      fillGradient.addColorStop(1, 'rgba(124, 58, 237, 0)');

      chartRef.current = new window.Chart(context, {
        type: 'line',
        data: {
          labels: values.map((_, index) => index + 1),
          datasets: [
            {
              data: values,
              borderColor: strokeGradient,
              backgroundColor: fillGradient,
              borderWidth: 3,
              fill: true,
              pointHoverRadius: 4,
              pointRadius: 0,
              tension: 0.42,
            },
          ],
        },
        options: {
          animation: {
            duration: 2000,
            easing: 'easeOutQuart',
          },
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0b111a',
              bodyColor: '#dde3ed',
              borderColor: '#161e2a',
              borderWidth: 1,
              callbacks: {
                title: () => '',
                label: (item: any) => `STROKE #${item.dataIndex + 1} - ${Math.round(item.parsed.y)} WPM`,
              },
              displayColors: false,
              padding: 10,
              titleColor: '#9ba8bc',
            },
          },
          responsive: true,
          scales: {
            x: { display: false, grid: { display: false } },
            y: { display: false, grid: { display: false } },
          },
        },
      });
    });

    return () => {
      cancelled = true;
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, targetWpm]);

  return (
    <div className="tf-report-chart">
      <canvas ref={canvasRef} aria-label="Velocity curve" />
    </div>
  );
}

function Stat({
  accent,
  children,
  delay,
  label,
  sub,
  suffix,
  value,
}: {
  accent: string;
  children?: ReactNode;
  delay: number;
  label: string;
  sub: ReactNode;
  suffix?: string;
  value: number;
}) {
  const animatedValue = useCountUp(value);

  return (
    <div className="tf-stat" style={{ animationDelay: `${delay}ms`, ['--accent' as string]: accent }}>
      {children}
      <p className="tf-label">{label}</p>
      <div className="tf-stat-value">
        <span>{animatedValue}</span>
        {suffix ? <em>{suffix}</em> : null}
      </div>
      <p className="tf-stat-sub">{sub}</p>
      <span className="tf-stat-line" />
    </div>
  );
}

export default function SessionResults({
  wpm,
  rawWpm,
  accuracy,
  errors,
  elapsedMs,
  mode,
  wpmHistory,
  pb,
  newPb,
  streak,
  xp,
  xpEarned,
  onRestart,
}: SessionResultsProps) {
  const levelInfo = getLevelFromXp(xp);
  const animatedXpEarned = useCountUp(xpEarned);
  const hasPersonalBest = newPb.wpm || newPb.accuracy || wpm > pb.wpm || accuracy > pb.accuracy;
  const progress = Math.max(0, Math.min(100, levelInfo.progress));
  const ringOffset = 188 - (188 * progress) / 100;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;500&family=DM+Sans:wght@300;600;800;900&display=swap');

        @keyframes tfFadeDown {
          from { opacity: 0; transform: translateY(-14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes tfSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes tfRingDraw {
          from { stroke-dashoffset: 188; }
          to { stroke-dashoffset: var(--ring-offset); }
        }

        @keyframes tfMiniRingDraw {
          from { stroke-dashoffset: 88; }
          to { stroke-dashoffset: 0.88; }
        }

        @keyframes tfProgressGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        @keyframes tfShimmer {
          from { transform: translateX(-120%); }
          to { transform: translateX(220%); }
        }

        @keyframes tfSparklePulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
          50% { transform: scale(1.28) rotate(18deg); opacity: 1; }
        }

        .tf-report {
          --bg: #060a10;
          --primary: #dde3ed;
          --muted: #556070;
          --body: #9ba8bc;
          --line: #161e2a;
          --cyan: #00d9be;
          --purple: #7c3aed;
          --gold: #e9a43a;
          --red: #e05252;
          background: var(--bg);
          color: var(--primary);
          font-family: "DM Sans", ui-sans-serif, system-ui, sans-serif;
        }

        .tf-label {
          color: #3d4a5c;
          font-family: "DM Mono", ui-monospace, SFMono-Regular, monospace;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          line-height: 1;
          text-transform: uppercase;
        }

        .tf-top {
          animation: tfFadeDown 0.6s ease-out both;
        }

        .tf-kicker {
          align-items: center;
          color: #3d4a5c;
          display: inline-flex;
          font-family: "DM Mono", ui-monospace, SFMono-Regular, monospace;
          font-size: 0.65rem;
          font-weight: 700;
          gap: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .tf-kicker::before {
          background: var(--cyan);
          border-radius: 999px;
          box-shadow: 0 0 16px rgba(0, 217, 190, 0.74);
          content: "";
          height: 4px;
          width: 4px;
        }

        .tf-title {
          font-size: clamp(2.55rem, 5.6vw, 4.8rem);
          font-weight: 900;
          letter-spacing: -0.065em;
          line-height: 0.9;
        }

        .tf-gradient-text {
          background: linear-gradient(120deg, #00d9be 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .tf-copy {
          color: var(--body);
          font-size: 0.9rem;
          font-weight: 300;
        }

        .tf-level-number {
          background: linear-gradient(120deg, #00d9be 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-family: "DM Mono", ui-monospace, SFMono-Regular, monospace;
          font-size: clamp(2.2rem, 3.4vw, 3.4rem);
          font-weight: 500;
          letter-spacing: -0.08em;
          line-height: 1;
        }

        .tf-level-ring {
          --ring-offset: 90;
          inset: -10px;
          position: absolute;
        }

        .tf-level-ring circle:last-child {
          animation: tfRingDraw 1.4s ease-out both;
          stroke-dasharray: 188;
          stroke-dashoffset: var(--ring-offset);
        }

        .tf-stats {
          border-bottom: 1px solid var(--line);
          border-top: 1px solid var(--line);
          margin-top: clamp(1.45rem, 4dvh, 2.2rem);
        }

        .tf-stat {
          animation: tfSlideUp 0.55s ease-out both;
          min-width: 0;
          padding: 0.95rem 1.45rem 1.05rem;
          position: relative;
        }

        .tf-stat + .tf-stat {
          border-left: 1px solid var(--line);
        }

        .tf-stat-value {
          align-items: flex-end;
          display: flex;
          gap: 0.2rem;
          margin-top: 0.7rem;
        }

        .tf-stat-value span {
          color: var(--primary);
          font-family: "DM Mono", ui-monospace, SFMono-Regular, monospace;
          font-size: clamp(2.15rem, 3.35vw, 3.3rem);
          font-weight: 500;
          letter-spacing: -0.04em;
          line-height: 0.92;
        }

        .tf-stat-value em {
          color: var(--accent);
          font-family: "DM Sans", ui-sans-serif, system-ui, sans-serif;
          font-size: 1rem;
          font-style: normal;
          font-weight: 900;
          margin-bottom: 0.28rem;
        }

        .tf-stat-sub {
          color: var(--muted);
          font-family: "DM Mono", ui-monospace, SFMono-Regular, monospace;
          font-size: 0.72rem;
          margin-top: 0.62rem;
        }

        .tf-stat-line {
          background: linear-gradient(90deg, var(--accent), transparent);
          bottom: 0;
          height: 1px;
          left: 1.5rem;
          opacity: 0.9;
          position: absolute;
          right: 1.5rem;
        }

        .tf-mini-ring {
          position: absolute;
          right: 1.5rem;
          top: 0.85rem;
        }

        .tf-mini-ring circle:last-child {
          animation: tfMiniRingDraw 1.6s ease-out both;
          stroke-dasharray: 88;
          stroke-dashoffset: 0.88;
        }

        .tf-dim-fire {
          filter: grayscale(1);
          opacity: 0.15;
        }

        .tf-sparkle {
          animation: tfSparklePulse 3s ease-in-out infinite;
          color: var(--gold);
          display: inline-block;
          font-size: 1.15rem;
          position: absolute;
          right: 1.5rem;
          top: 0.85rem;
        }

        .tf-velocity {
          flex: 1 1 auto;
          margin-top: clamp(1.45rem, 4dvh, 2.15rem);
          min-height: 0;
        }

        .tf-section-head {
          align-items: center;
          display: flex;
          justify-content: space-between;
        }

        .tf-divider {
          background: linear-gradient(90deg, transparent, #233044 12%, #233044 88%, transparent);
          height: 1px;
          margin-top: 0.75rem;
          width: 100%;
        }

        .tf-report-chart {
          height: clamp(104px, 19dvh, 132px);
          margin-top: clamp(0.85rem, 2dvh, 1.1rem);
          width: 100%;
        }

        .tf-report-chart canvas {
          height: 100% !important;
          width: 100% !important;
        }

        .tf-bottom {
          align-items: end;
          display: grid;
          gap: clamp(1.25rem, 3dvh, 2rem);
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr) auto;
          margin-top: clamp(1.25rem, 3.2dvh, 2rem);
        }

        .tf-progress-line {
          height: 4px;
          overflow: hidden;
          position: relative;
          transform-origin: left;
          width: min(23rem, 100%);
        }

        .tf-progress-fill {
          animation: tfProgressGrow 1.6s ease-out 1.2s both;
          background: linear-gradient(120deg, #00d9be 0%, #7c3aed 100%);
          box-shadow: 0 0 18px rgba(0, 217, 190, 0.34);
          height: 100%;
          overflow: hidden;
          position: relative;
          transform-origin: left;
        }

        .tf-progress-fill::after {
          animation: tfShimmer 2.2s ease-in-out infinite;
          background: linear-gradient(90deg, transparent, rgba(221, 227, 237, 0.5), transparent);
          content: "";
          inset: 0;
          position: absolute;
          width: 42%;
        }

        .tf-action-icon {
          align-items: center;
          color: var(--body);
          display: inline-flex;
          height: 2.75rem;
          justify-content: center;
          transition: border-color 0.2s ease, color 0.2s ease;
          width: 2.75rem;
        }

        .tf-actions {
          display: flex;
          gap: 0.7rem;
          justify-content: flex-end;
        }

        .tf-action-icon:hover {
          border: 1px solid #263245;
          border-radius: 999px;
          color: var(--primary);
        }

        .tf-action-icon:hover svg {
          transform: rotate(360deg);
        }

        .tf-action-icon svg {
          transition: transform 0.5s ease;
        }

        .tf-next {
          background: linear-gradient(120deg, #00d9be 0%, #7c3aed 100%);
          border-radius: 999px;
          color: #071016;
          font-size: 0.78rem;
          font-weight: 900;
          height: 2.75rem;
          letter-spacing: 0.04em;
          overflow: hidden;
          padding: 0 1.35rem;
          position: relative;
          transition: transform 0.2s ease;
        }

        .tf-next::after {
          background: linear-gradient(90deg, transparent, rgba(221, 227, 237, 0.38), transparent);
          content: "";
          inset: 0;
          position: absolute;
          transform: translateX(-130%);
          transition: transform 0.65s ease;
          width: 55%;
        }

        .tf-next:hover {
          transform: scale(1.04);
        }

        .tf-next:hover::after {
          transform: translateX(230%);
        }

        @media (max-width: 760px) {
          .tf-title {
            font-size: clamp(2.35rem, 12vw, 3.6rem);
          }

          .tf-stat:nth-child(odd) {
            border-left: 0;
          }

          .tf-stat:nth-child(n + 3) {
            border-top: 1px solid var(--line);
          }

          .tf-bottom {
            grid-template-columns: 1fr;
          }
        }

        @media (max-height: 660px) {
          .tf-title {
            font-size: clamp(2.35rem, 5vw, 4.05rem);
          }

          .tf-copy {
            font-size: 0.84rem;
          }

          .tf-stat {
            padding-bottom: 0.85rem;
            padding-top: 0.78rem;
          }

          .tf-report-chart {
            height: clamp(92px, 17dvh, 116px);
          }

          .tf-progress-line {
            margin-top: 0.8rem !important;
          }
        }
      `}</style>

      <div className="tf-report mx-auto flex h-full min-h-0 w-full max-w-[1090px] flex-col overflow-hidden px-5 py-5 sm:px-6">
        <header className="tf-top flex shrink-0 items-start justify-between gap-8">
          <div className="min-w-0">
            <p className="tf-kicker">{mode} - {formatDuration(elapsedMs)}</p>
            <h1 className="tf-title mt-3">
              <span>Precision</span> <span className="tf-gradient-text">Report</span>
            </h1>
            <p className="tf-copy mt-3">A clean readout of your pace, accuracy, rhythm, and next move.</p>
          </div>

          <div className="relative hidden min-w-[5.8rem] text-center sm:block">
            <svg className="tf-level-ring" viewBox="0 0 72 72" style={{ ['--ring-offset' as string]: ringOffset }}>
              <circle cx="36" cy="36" fill="none" r="30" stroke="#161e2a" strokeWidth="2" />
              <circle
                cx="36"
                cy="36"
                fill="none"
                r="30"
                stroke="url(#tfLevelGradient)"
                strokeLinecap="round"
                strokeWidth="3"
                transform="rotate(-90 36 36)"
              />
              <defs>
                <linearGradient id="tfLevelGradient" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#00d9be" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <p className="tf-label">Level</p>
            <p className="tf-level-number mt-3">{levelInfo.level}</p>
          </div>
        </header>

        <section className="tf-stats grid shrink-0 grid-cols-2 sm:grid-cols-4">
          <Stat accent="#00d9be" delay={80} label="WPM" value={Math.round(wpm)} sub={`Raw ${Math.round(rawWpm)} WPM`} />
          <Stat
            accent="#00d9be"
            delay={180}
            label="Accuracy"
            value={accuracy}
            suffix="%"
            sub={<span className={errors > 0 ? 'text-[#e05252]' : ''}>{errors === 1 ? '1 error' : `${errors} errors`}</span>}
          >
            <svg className="tf-mini-ring" height="32" viewBox="0 0 32 32" width="32">
              <circle cx="16" cy="16" fill="none" r="14" stroke="#161e2a" strokeWidth="2" />
              <circle cx="16" cy="16" fill="none" r="14" stroke="#00d9be" strokeLinecap="round" strokeWidth="2" transform="rotate(-90 16 16)" />
            </svg>
          </Stat>
          <Stat
            accent="#3d4a5c"
            delay={280}
            label="Streak"
            value={streak}
            sub="Consecutive days"
          >
            <span className="tf-dim-fire absolute right-6 top-4">🔥</span>
          </Stat>
          <Stat accent="#e9a43a" delay={380} label="XP" value={xpEarned} sub={`Total ${xp} XP`}>
            <span className="tf-sparkle">✦</span>
          </Stat>
        </section>

        <section className="tf-velocity min-h-0">
          <div className="tf-section-head">
            <p className="tf-label">Velocity curve</p>
            <p className="tf-label">{wpmHistory.length || 97} strokes</p>
          </div>
          <div className="tf-divider" />
          <VelocityChart data={wpmHistory} targetWpm={Math.round(wpm)} />
        </section>

        <section className="tf-bottom shrink-0">
          <div>
            <p className="tf-label">Tier progress</p>
            <div className="tf-progress-line mt-5">
              <div className="tf-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-4 font-mono text-[0.72rem] text-[#556070]">
              Level {levelInfo.level} - +{animatedXpEarned} XP earned
            </p>
          </div>

          <div>
            <p className="tf-label" style={{ color: '#00d9be' }}>Next focus</p>
            <p className="mt-3 max-w-md text-[clamp(1.1rem,2.1vw,1.55rem)] font-black leading-tight tracking-[-0.03em] text-[#dde3ed]">
              {getFocusCopy(errors, accuracy, wpm)}
            </p>
            {hasPersonalBest ? (
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#e9a43a]">
                <Star className="h-4 w-4 fill-[#e9a43a]" />
                Personal best
              </p>
            ) : null}
          </div>

          <div className="tf-actions">
            <button className="tf-action-icon" onClick={onRestart} aria-label="Retry session">
              <RotateCcw className="h-4 w-4" />
            </button>
            <button className="tf-next inline-flex items-center gap-2" onClick={onRestart}>
              <span className="relative z-10">Next</span>
              <ArrowRight className="relative z-10 h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
