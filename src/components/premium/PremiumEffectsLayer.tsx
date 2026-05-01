'use client';

import dynamic from 'next/dynamic';
import '../premium/premium-effects.css';

/* ── Dynamically import heavy visual components (no SSR) ── */
const CursorGlow = dynamic(() => import('./CursorGlow'), { ssr: false });
const AuroraBackground = dynamic(() => import('./AuroraBackground'), { ssr: false });
const GrainOverlay = dynamic(() => import('./GrainOverlay'), { ssr: false });
const VignetteOverlay = dynamic(() => import('./VignetteOverlay'), { ssr: false });
const FloatingParticlesCanvas = dynamic(() => import('./FloatingParticlesCanvas'), { ssr: false });
const SmoothScroll = dynamic(() => import('./SmoothScroll'), { ssr: false });
const MeshGradientHero = dynamic(() => import('./MeshGradientHero'), { ssr: false });

/**
 * PremiumEffectsLayer — Master orchestrator for all premium visual effects.
 *
 * Drop this single component into your layout/providers and it handles:
 * - Cursor glow trail (follows mouse with smooth lerp)
 * - Aurora ambient background (flowing color gradients)
 * - Mesh gradient hero (morphing organic color blobs)
 * - Film grain texture (tactile noise overlay)
 * - Cinematic vignette (darkened viewport edges)
 * - Interactive floating particles (canvas-based with connections)
 * - Ultra-smooth scroll (Lenis inertia scrolling)
 *
 * All effects are:
 * ✅ Client-only (no SSR)
 * ✅ Lazy-loaded (code splitting)
 * ✅ Respects prefers-reduced-motion
 * ✅ Touch device aware
 * ✅ Zero interference with existing components
 */
export default function PremiumEffectsLayer() {
  return (
    <>
      <SmoothScroll />
      <AuroraBackground />
      <MeshGradientHero />
      <FloatingParticlesCanvas />
      <CursorGlow />
      <GrainOverlay />
      <VignetteOverlay />
    </>
  );
}

