"use client";

import { useEffect, useCallback, useRef } from 'react';

export type SoundTheme = 'mechanical' | 'typewriter' | 'soft' | 'silent';

/* ── Lazy AudioContext getter ── */
function getCtx(ref: { current: AudioContext | null }): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ref.current) {
    try {
      ref.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch { return null; }
  }
  if (ref.current.state === 'suspended') ref.current.resume().catch(() => {});
  return ref.current;
}

export function useTypingSounds(theme: SoundTheme = 'mechanical') {
  const ctxRef = useRef<AudioContext | null>(null);

  /* ────────────────────────────────────────────────
     CORRECT → satisfying key-click sound
  ──────────────────────────────────────────────── */
  const playCorrect = useCallback(() => {
    if (theme === 'silent') return;
    const ctx = getCtx(ctxRef);
    if (!ctx) return;
    const t = ctx.currentTime;

    if (theme === 'mechanical') {
      /* White-noise snap (key mechanism) */
      const samples = Math.floor(ctx.sampleRate * 0.018);
      const buf = ctx.createBuffer(1, samples, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < samples; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / samples);
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 4200; bp.Q.value = 0.8;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.3, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
      noise.connect(bp); bp.connect(ng); ng.connect(ctx.destination);
      noise.start(t); noise.stop(t + 0.02);

      /* High "tick" tone */
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1800, t);
      osc.frequency.exponentialRampToValueAtTime(900, t + 0.012);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.07, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.012);
      osc.connect(og); og.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.015);
    }

    if (theme === 'typewriter') {
      /* Sharp clack + triangle ding */
      const samples = Math.floor(ctx.sampleRate * 0.025);
      const buf = ctx.createBuffer(1, samples, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < samples; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / samples, 1.5);
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 2800;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.45, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      noise.connect(hp); hp.connect(ng); ng.connect(ctx.destination);
      noise.start(t); noise.stop(t + 0.03);

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2200, t);
      osc.frequency.exponentialRampToValueAtTime(1100, t + 0.02);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.1, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      osc.connect(og); og.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.022);
    }

    if (theme === 'soft') {
      /* Gentle sine tap */
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.04);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0, t);
      og.gain.linearRampToValueAtTime(0.09, t + 0.005);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
      osc.connect(og); og.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.06);
    }
  }, [theme]);

  /* ────────────────────────────────────────────────
     WRONG → two-note descending boop (E4 → C4)
  ──────────────────────────────────────────────── */
  const playWrong = useCallback(() => {
    if (theme === 'silent') return;
    const ctx = getCtx(ctxRef);
    if (!ctx) return;
    const t = ctx.currentTime;

    if (theme === 'mechanical' || theme === 'typewriter') {
      /* Musical descending two-note "nope" */
      [330, 262].forEach((freq, i) => {
        const start = t + i * 0.075;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.linearRampToValueAtTime(freq * 0.97, start + 0.06);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.2, start + 0.008);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(start); osc.stop(start + 0.12);
      });
    }

    if (theme === 'soft') {
      /* Soft descending hum */
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, t);
      osc.frequency.exponentialRampToValueAtTime(240, t + 0.12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.13);
    }
  }, [theme]);

  /* Cleanup on unmount */
  useEffect(() => () => { ctxRef.current?.close().catch(() => {}); }, []);

  return { playCorrect, playWrong };
}
