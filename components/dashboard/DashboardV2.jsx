'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './DashboardV2.css';

// ============================================================================
// ANIMATED COUNTER HOOK — counts from 0 to target over duration (ms)
// ============================================================================
function useCounter(target, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (typeof target !== 'number' || target === 0) { setVal(target || 0); return; }
    let raf;
    let start;
    const animate = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(target * p));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

// ============================================================================
// CARD MOUSE-GLOW HOOK — tracks pointer for radial highlight
// ============================================================================
function useCardGlow(ref) {
  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--db2-mx', `${e.clientX - r.left}px`);
    ref.current.style.setProperty('--db2-my', `${e.clientY - r.top}px`);
  }, [ref]);
  return onMove;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ProgressCard({ data, delay }) {
  const ref = useRef(null);
  const onMove = useCardGlow(ref);
  return (
    <div className="db2-card" ref={ref} onMouseMove={onMove} style={{ '--db2-delay': delay }}>
      <div className="db2-label">
        <span className="db2-label-dot" />
        MOMENTUM
      </div>
      <h2 className="db2-heading">Progress Tracking</h2>
      <p className="db2-body">Streaks, milestones, and habit signals that keep your growth moving forward.</p>

      <div className="db2-streak-row">
        <div className="db2-streak-num">{data.streakDays}</div>
        <div className="db2-streak-meta">
          <div className="db2-label" style={{ marginBottom: 0 }}>{data.streakLabel}</div>
          <div className="db2-badge">
            <span>🏆</span> {data.topPercent}
          </div>
        </div>
      </div>

      <div className="db2-week-grid">
        {data.weekData.map((active, i) => {
          const isLast = i === data.weekData.length - 1;
          let cls = 'db2-day';
          if (active && !isLast) cls += ' db2-day--active';
          if (isLast && active) cls += ' db2-day--today';
          return <div key={i} className={cls} />;
        })}
      </div>
    </div>
  );
}

function AnalyticsCard({ data, delay }) {
  const ref = useRef(null);
  const onMove = useCardGlow(ref);
  const accVal = useCounter(Math.floor(data.accuracy), 800);
  const spdVal = useCounter(data.avgSpeed, 800);

  return (
    <div className="db2-card" ref={ref} onMouseMove={onMove} style={{ '--db2-delay': delay }}>
      <div className="db2-label">
        <span style={{ fontSize: '13px' }}>📊</span>
        PRECISION DATA
      </div>
      <h2 className="db2-heading">Analytics</h2>
      <p className="db2-body">See trends, weak zones, and measurable performance gains in every session.</p>

      <div className="db2-analytics-rows">
        <div className="db2-metric-row">
          <div className="db2-metric-col">
            <div className="db2-label" style={{ marginBottom: 0 }}>ACCURACY</div>
            <div className="db2-metric-big db2-metric-big--green">{accVal}%</div>
          </div>
          <div className="db2-change-pill">↑ {data.accuracyChange}</div>
        </div>

        <div className="db2-metric-row">
          <div className="db2-metric-col">
            <div className="db2-label" style={{ marginBottom: 0 }}>AVG SPEED</div>
            <div className="db2-metric-big db2-metric-big--cyan">{spdVal} WPM</div>
          </div>
          <div className="db2-change-pill">{data.speedChange}</div>
        </div>

        <div className="db2-weak-section">
          <div className="db2-label" style={{ marginBottom: 0 }}>WEAK KEYS</div>
          <div className="db2-weak-keys-row">
            {data.weakKeys.map((k) => (
              <div key={k} className="db2-weak-key">{k}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonsCard({ data, delay }) {
  const ref = useRef(null);
  const onMove = useCardGlow(ref);

  const dotIcon = (status) => {
    if (status === 'completed') return '✓';
    if (status === 'active') return '●';
    return '🔒';
  };

  const dotClass = (status) => {
    if (status === 'completed') return 'db2-dot db2-dot--done';
    if (status === 'active') return 'db2-dot db2-dot--active';
    return 'db2-dot db2-dot--locked';
  };

  return (
    <div className="db2-card" ref={ref} onMouseMove={onMove} style={{ '--db2-delay': delay }}>
      <div className="db2-label">
        <span style={{ fontSize: '13px' }}>📚</span>
        STRUCTURED LEARNING
      </div>
      <h2 className="db2-heading">Guided Lessons</h2>
      <p className="db2-body">Step-by-step paths that take you from fundamentals to precision-first mastery.</p>

      <div className="db2-timeline">
        <div className="db2-timeline-rail" />
        {data.steps.map((step, i) => (
          <div key={i} className="db2-timeline-step">
            <div className={dotClass(step.status)}>{dotIcon(step.status)}</div>
            <div className="db2-step-info">
              <div className={`db2-step-name ${step.status === 'locked' ? 'db2-step-name--dim' : ''}`}>
                {step.name}
              </div>
              {step.status === 'active' && step.percent != null && (
                <div className="db2-step-pct">{step.percent}% complete</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="db2-tags">
        {data.tags.map((t) => (
          <div key={t} className="db2-tag">{t}</div>
        ))}
      </div>
    </div>
  );
}

function RealtimeCard({ data, delay }) {
  const ref = useRef(null);
  const onMove = useCardGlow(ref);
  const wpmVal = useCounter(data.wpm, 700);
  const accVal = useCounter(data.acc, 700);

  return (
    <div className="db2-card" ref={ref} onMouseMove={onMove} style={{ '--db2-delay': delay }}>
      <div className="db2-label">
        <span className="db2-live-dot" />
        LIVE SIGNALS
      </div>
      <h2 className="db2-heading">Real-Time Feedback</h2>
      <p className="db2-body">WPM, accuracy, rhythm, and consistency update instantly as you type.</p>

      <div className="db2-rt-metrics">
        <div className="db2-rt-cell">
          <div className="db2-rt-num db2-rt-num--green">{wpmVal}</div>
          <div className="db2-rt-label">WPM</div>
        </div>
        <div className="db2-rt-cell">
          <div className="db2-rt-num db2-rt-num--cyan">{accVal}%</div>
          <div className="db2-rt-label">ACC</div>
        </div>
        <div className="db2-rt-cell">
          <div className="db2-rt-num db2-rt-num--rhythm">{data.rhythm}</div>
          <div className="db2-rt-label">Rhythm</div>
        </div>
      </div>

      <div className="db2-hud-bar">
        <div className="db2-hud-fill" style={{ width: `${data.rhythmScore}%` }}>
          <span className="db2-hud-tip" />
        </div>
      </div>
    </div>
  );
}

function PracticeCard({ data, delay }) {
  const ref = useRef(null);
  const onMove = useCardGlow(ref);

  return (
    <div className="db2-card" ref={ref} onMouseMove={onMove} style={{ '--db2-delay': delay }}>
      <div className="db2-label">
        <span style={{ fontSize: '13px' }}>⌨️</span>
        CUSTOM SESSIONS
      </div>
      <h2 className="db2-heading">Practice Modes</h2>
      <p className="db2-body">Train with custom text, code, AI prompts, dictation, races, and focused drills.</p>

      <div className="db2-modes">
        {data.modes.map((m) => (
          <div key={m.label} className={`db2-mode ${m.active ? 'db2-mode--on' : ''}`}>
            {m.label}
          </div>
        ))}
      </div>

      <div className="db2-input-wrap">
        <input
          type="text"
          className="db2-input"
          placeholder={data.inputPlaceholder}
          readOnly
        />
        <span className="db2-sparkle">✨</span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD V2
// ============================================================================
export default function DashboardV2({ progress, analytics, lessons, realtime, practice }) {
  return (
    <div className="dashboard-v2">
      {/* Ambient glow orbs */}
      <div className="db2-glow-orb db2-glow-orb--blue" />
      <div className="db2-glow-orb db2-glow-orb--purple" />
      <div className="db2-glow-orb db2-glow-orb--green" />

      <div className="db2-grid">
        {/* LEFT COLUMN: Progress + Analytics */}
        <div className="db2-col">
          <ProgressCard data={progress} delay="0s" />
          <AnalyticsCard data={analytics} delay="0.08s" />
        </div>

        {/* RIGHT COLUMN: Lessons + Realtime + Practice */}
        <div className="db2-col">
          <LessonsCard data={lessons} delay="0.16s" />
          <RealtimeCard data={realtime} delay="0.24s" />
          <PracticeCard data={practice} delay="0.32s" />
        </div>
      </div>
    </div>
  );
}
