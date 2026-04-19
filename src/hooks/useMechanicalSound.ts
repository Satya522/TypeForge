import { useEffect, useRef, useCallback } from 'react';

export function useMechanicalSound(enabled: boolean) {
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (enabled && typeof window !== 'undefined') {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    }
    return () => {
      // Keep it open for performance, or handle context cleanup if strictly needed
    };
  }, [enabled]);

  const playKeystroke = useCallback((type: 'normal' | 'space' | 'error' = 'normal') => {
    if (!enabled || !audioContext.current) return;
    const ctx = audioContext.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;
    
    // Randomize pitch slightly so it doesn't sound completely monotonic
    const detune = (Math.random() - 0.5) * 150;
    osc.detune.setValueAtTime(detune, now);

    if (type === 'normal') {
      // Crisp, sharp "tic" sound (high pitch, extremely short decay)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now); 
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, now);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      osc.start(now);
      osc.stop(now + 0.025);
    } else if (type === 'space') {
      // Slightly deeper, louder "tic" or "clack" for spacebar
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(500, now);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.start(now);
      osc.stop(now + 0.035);
    } else if (type === 'error') {
      // Dull "thud" for errors
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  }, [enabled]);

  return playKeystroke;
}
