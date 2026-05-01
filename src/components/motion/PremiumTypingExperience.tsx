'use client';

import { useEffect, useRef, useState } from 'react';

// Web Audio API synth to simulate mechanical keyboard click
function playMechanicalClick(audioCtx: AudioContext) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'square';
  // Pitch down slightly for thocky sound
  osc.frequency.setValueAtTime(100 + Math.random() * 20, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.05);

  filter.type = 'highpass';
  filter.frequency.value = 1000;

  // Extremely subtle, short click to not be annoying
  gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
}

export function PremiumTypingExperience() {
  const [wpm, setWpm] = useState(0);
  const keyStrokesRef = useRef<number[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier combinations
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // ASMR Sound
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter' || e.key === 'Space') {
        playMechanicalClick(audioCtxRef.current);
      }

      // Gamification: WPM
      const now = Date.now();
      keyStrokesRef.current.push(now);
      
      keyStrokesRef.current = keyStrokesRef.current.filter(t => now - t < 5000);
      const calculatedWpm = Math.floor((keyStrokesRef.current.length * 12) / 5);
      setWpm(calculatedWpm);

      // Spawn Fire/Glow Particles if typing fast (80+ WPM)
      if (calculatedWpm > 80 && e.key.length === 1) {
        spawnParticle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const spawnParticle = () => {
    const particle = document.createElement('div');
    particle.className = 'pointer-events-none fixed z-[9999] w-1.5 h-1.5 rounded-full shadow-[0_0_12px_#3b82f6]';
    particle.style.background = '#60a5fa'; 
    
    // Random bottom edge position
    const x = (window.innerWidth / 2) + (Math.random() * 600 - 300);
    const y = window.innerHeight - 20;
    
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    document.body.appendChild(particle);

    setTimeout(() => {
      particle.style.transform = `translateY(-${Math.random() * 400 + 100}px) scale(0)`;
      particle.style.opacity = '0';
    }, 10);

    setTimeout(() => {
      particle.remove();
    }, 600);
  };

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-[100] transition-all duration-700"
      style={{
        boxShadow: wpm > 80 ? 'inset 0 0 120px rgba(59,130,246,0.1)' : 'none',
        opacity: wpm > 80 ? 1 : 0
      }}
    />
  );
}
