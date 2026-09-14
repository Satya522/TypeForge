import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page Not Found | TypeForge',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#02050b] px-4 text-center">
      {/* Glow backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 45%, rgba(79,141,253,0.10) 0%, transparent 70%)',
        }}
      />

      {/* Error Code */}
      <h1
        className="relative select-none font-[var(--font-kinetic-display)] text-[clamp(7rem,20vw,14rem)] font-extrabold leading-none tracking-tighter"
        style={{
          background: 'linear-gradient(135deg, #4f8dfd 0%, #39d4bf 40%, #ffd21f 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 60px rgba(79,141,253,0.25))',
        }}
      >
        404
      </h1>

      {/* Message */}
      <p className="relative mt-2 text-sm font-bold uppercase tracking-[0.25em] text-white/50">
        Page Not Found
      </p>
      <p className="relative mt-4 max-w-md text-sm leading-relaxed text-white/30">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      {/* Actions */}
      <div className="relative mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white/80 ring-1 ring-white/[0.08] backdrop-blur-sm transition-all hover:bg-white/[0.10] hover:text-white hover:ring-white/[0.14]"
        >
          ← Home
        </Link>
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white/80 transition-all hover:text-white"
          style={{
            background: 'linear-gradient(135deg, rgba(79,141,253,0.15), rgba(57,212,191,0.10))',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 30px rgba(79,141,253,0.08)',
          }}
        >
          Start Typing →
        </Link>
      </div>

      {/* Subtle keyboard hint */}
      <p className="relative mt-16 font-mono text-[10px] uppercase tracking-[0.3em] text-white/15">
        Error 404 · TypeForge
      </p>
    </div>
  );
}
