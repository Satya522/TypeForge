"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import {
  GithubLogo, TwitterLogo, YoutubeLogo, DiscordLogo,
  PaperPlaneTilt, CaretRight, Globe, ShieldCheck, Cpu,
  Lightning, Terminal, Keyboard, Trophy, Users, Code,
  ArrowRight, CheckCircle, Dot,
} from '@phosphor-icons/react';
import BrandLogo from '@/components/BrandLogo';

gsap.registerPlugin(ScrollTrigger);

/* ── Data ── */
const footerColumns = [
  {
    title: 'Product',
    icon: Cpu,
    color: '#39FF14',
    links: [
      { href: '/learn', label: 'Learning Paths', badge: '' },
      { href: '/practice', label: 'Practice Modes', badge: '' },
      { href: '/code-practice', label: 'Code Practice', badge: 'HOT' },
      { href: '/ai-practice', label: 'AI Practice', badge: 'NEW' },
    ],
  },
  {
    title: 'Explore',
    icon: Globe,
    color: '#a855f7',
    links: [
      { href: '/games', label: 'Games', badge: '' },
      { href: '/story-mode', label: 'Story Mode', badge: '' },
      { href: '/community', label: 'Community', badge: '' },
      { href: '/tournaments', label: 'Tournaments', badge: 'LIVE' },
    ],
  },
  {
    title: 'Resources',
    icon: Terminal,
    color: '#06b6d4',
    links: [
      { href: '/code-editor', label: 'Editor', badge: '' },
      { href: '/extension', label: 'Extension', badge: '' },
      { href: '/languages', label: 'Languages', badge: '' },
      { href: '/posture', label: 'Posture Guide', badge: '' },
    ],
  },
  {
    title: 'Legal',
    icon: ShieldCheck,
    color: '#39FF14',
    links: [
      { href: '/privacy', label: 'Privacy Policy', badge: '' },
      { href: '/terms', label: 'Terms of Service', badge: '' },
      { href: '/cookies', label: 'Cookie Policy', badge: '' },
    ],
  },
];

const socialLinks = [
  { icon: GithubLogo, href: 'https://github.com', label: 'GitHub', color: '#fff' },
  { icon: TwitterLogo, href: 'https://twitter.com', label: 'Twitter / X', color: '#1d9bf0' },
  { icon: DiscordLogo, href: 'https://discord.com', label: 'Discord', color: '#5865f2' },
  { icon: YoutubeLogo, href: 'https://youtube.com', label: 'YouTube', color: '#ff0000' },
];

const liveStats = [
  { icon: Users, value: '47,821', label: 'Active Typists', color: '#39FF14' },
  { icon: Lightning, value: '142 WPM', label: 'Avg Speed Today', color: '#a855f7' },
  { icon: Trophy, value: '3,290', label: 'Tournaments Run', color: '#f59e0b' },
  { icon: Code, value: '18 Langs', label: 'Code Supported', color: '#06b6d4' },
];

/* ── Canvas Neural Particle Network ── */
function FooterParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let animId: number;

    const particles: {
      x: number; y: number; vx: number; vy: number;
      alpha: number; radius: number; hue: number; pulse: number;
    }[] = [];

    const resize = () => {
      const w = canvas.parentElement?.offsetWidth || window.innerWidth;
      const h = canvas.parentElement?.offsetHeight || 400;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      particles.length = 0;
      const count = Math.floor((w * h) / 10000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25 - 0.05,
          alpha: 0.04 + Math.random() * 0.18,
          radius: 0.4 + Math.random() * 1.2,
          hue: Math.random() > 0.7 ? 280 : 110 + Math.random() * 20,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    let t = 0;
    const draw = () => {
      t += 0.008;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        const pulsedAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${pulsedAlpha})`;
        ctx.fill();
      }

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            const alpha = 0.07 * (1 - dist / 90);
            ctx.strokeStyle = particles[i].hue > 200
              ? `rgba(168,85,247,${alpha})`
              : `rgba(57,255,20,${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  );
}

/* ── Newsletter ── */
function NewsletterStrip() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-r from-[#0a120a] via-[#0e160d] to-[#0a0e12] p-8 md:p-10">
      {/* Accent top line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #39FF14, #a855f7, #06b6d4, transparent)' }} />
      {/* Glow orbs */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full blur-[60px]" style={{ background: 'rgba(57,255,20,0.05)' }} />
      <div className="pointer-events-none absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-[60px]" style={{ background: 'rgba(168,85,247,0.06)' }} />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#39FF14]/80">TypeForge Dispatch</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight mb-1">Stay in the loop.</h3>
          <p className="text-sm text-gray-500 max-w-sm">New features, tournaments, and elite typing strategies — delivered straight to your inbox.</p>
        </div>
        <div className="w-full md:w-auto">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] font-bold"
              >
                <CheckCircle weight="fill" className="w-5 h-5" />
                You're in. Welcome to the forge.
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1 md:w-72">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-[#39FF14]/40 focus:bg-[#39FF14]/[0.03] focus:shadow-[0_0_20px_rgba(57,255,20,0.08)]"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[#39FF14] px-5 py-3 text-black text-sm font-black tracking-wide uppercase hover:bg-white transition-colors hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]"
                >
                  <PaperPlaneTilt weight="fill" className="w-4 h-4" />
                  Subscribe
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── Live Stats Bar ── */
function LiveStatsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {liveStats.map(({ icon: Icon, value, label, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.6, ease: 'easeOut' }}
          className="group relative flex flex-col items-center gap-1.5 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 text-center hover:border-white/[0.1] transition-all duration-300 hover:bg-white/[0.04]"
          style={{ '--stat-color': color } as React.CSSProperties}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300" style={{ borderColor: `${color}20`, background: `${color}0f` }}>
            <Icon weight="duotone" className="w-4 h-4 transition-colors duration-300" style={{ color }} />
          </div>
          <div className="text-lg font-black text-white tracking-tight">{value}</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">{label}</div>
          {/* Pulse dot */}
          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        </motion.div>
      ))}
    </div>
  );
}


/* ── Main Footer ── */
export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.footer-brand',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: footerRef.current, start: 'top 90%', once: true } }
      );
      gsap.fromTo('.footer-col',
        { y: 45, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: footerRef.current, start: 'top 88%', once: true } }
      );
      gsap.fromTo('.footer-bottom',
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: bottomRef.current, start: 'top 95%', once: true } }
      );
    }, footerRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative mt-auto overflow-hidden" style={{ background: 'linear-gradient(180deg, #050704 0%, #030402 100%)' }}>

      {/* ── Particle canvas ── */}
      <FooterParticles />

      {/* ── Background layers ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Massive background wordmark */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[30%] select-none whitespace-nowrap text-[160px] md:text-[220px] font-black tracking-tighter leading-none"
          style={{ color: 'transparent', WebkitTextStroke: '1px rgba(57,255,20,0.05)' }}
          aria-hidden="true"
        >
          TYPEFORGE
        </div>
        {/* Core glow bloom */}
        <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(57,255,20,0.05) 0%, transparent 65%)' }}
        />
        {/* Left bloom */}
        <div className="absolute -left-40 top-1/2 w-[500px] h-[500px] -translate-y-1/2 rounded-full blur-[100px]"
          style={{ background: 'rgba(57,255,20,0.02)' }}
        />
        {/* Right bloom */}
        <div className="absolute -right-40 bottom-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'rgba(168,85,247,0.025)' }}
        />
        {/* Scanline overlay */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(57,255,20,0.15) 1px, rgba(57,255,20,0.15) 2px)', backgroundSize: '100% 4px' }}
        />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020301] to-transparent" />
      </div>

      {/* ── Top glow border ── */}
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(57,255,20,0.15) 20%, rgba(57,255,20,0.4) 50%, rgba(57,255,20,0.15) 80%, transparent 100%)' }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-8 blur-xl"
        style={{ background: 'rgba(57,255,20,0.12)' }}
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14 xl:px-20 pb-0 pt-16 sm:pt-20 lg:pt-24">

        {/* ── Stats Bar ── */}
        <div className="mb-14">
          <LiveStatsBar />
        </div>

        {/* ── Newsletter ── */}
        <div className="mb-16">
          <NewsletterStrip />
        </div>

        {/* ── Divider ── */}
        <div className="mb-14 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

        {/* ── Main grid: brand | columns ── */}
        <div className="grid gap-12 lg:grid-cols-[1.8fr_repeat(4,1fr)] lg:gap-8 xl:gap-12">

          {/* Brand Column */}
          <div className="footer-brand flex flex-col gap-7 opacity-0 lg:col-span-1">
            <BrandLogo size="sm" showTagline href="/" />
            <p className="max-w-[240px] text-sm leading-relaxed text-gray-400 font-medium">
              Zero latency. Absolute precision. The ultimate typing environment for elite developers and creators.
            </p>

            {/* Status badge */}
            <div className="inline-flex items-center gap-2 w-fit rounded-full border border-[#39FF14]/15 bg-[#39FF14]/[0.04] px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#39FF14]/80">All Systems Operational</span>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map(({ icon: Icon, href, label, color }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.93 }}
                  className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] transition-all duration-300"
                  style={{ ['--hover-color' as string]: color }}
                >
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `${color}12` }} />
                  <Icon weight="fill" className="h-4 w-4 text-gray-500 transition-colors duration-300 relative z-10" style={{ color: undefined }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = color)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                  />
                </motion.a>
              ))}
            </div>

            {/* Keyboard indicator */}
            <div className="flex items-center gap-1.5 mt-1">
              <Keyboard weight="duotone" className="w-3.5 h-3.5 text-gray-700" />
              <span className="text-[10px] font-bold tracking-wider text-gray-700">Built for the keyboard elite</span>
            </div>
          </div>

          {/* Nav Columns */}
          {footerColumns.map((col, ci) => {
            const ColIcon = col.icon;
            const isLegal = col.title === 'Legal';
            return (
              <div
                key={col.title}
                className="footer-col opacity-0"
              >
                {null}

                {/* Column heading */}
                <div className="mb-5 flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md"
                    style={{ background: `${col.color}12`, border: `1px solid ${col.color}20` }}
                  >
                    <ColIcon weight="duotone" className="h-3 w-3" style={{ color: col.color }} />
                  </div>
                  <h4 className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: `${col.color}cc` }}>
                    {col.title}
                  </h4>
                </div>

                {/* Links */}
                <ul className="space-y-2.5">
                  {col.links.map((link, li) => (
                    <li key={link.href}>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: ci * 0.05 + li * 0.05, duration: 0.4 }}
                      >
                        <Link
                          href={link.href}
                          className="group flex items-center justify-between gap-2 text-sm text-gray-500 transition-all duration-200 hover:text-white"
                        >
                          <span className="flex items-center gap-1.5">
                            <CaretRight weight="bold" className="h-2.5 w-2.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 flex-shrink-0"
                              style={{ color: col.color }}
                            />
                            {link.label}
                          </span>
                          {link.badge && (
                            <span
                              className="shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest"
                              style={{
                                background: link.badge === 'NEW' ? 'rgba(57,255,20,0.12)' : link.badge === 'HOT' ? 'rgba(249,115,22,0.12)' : 'rgba(239,68,68,0.12)',
                                color: link.badge === 'NEW' ? '#39FF14' : link.badge === 'HOT' ? '#f97316' : '#ef4444',
                                border: `1px solid ${link.badge === 'NEW' ? 'rgba(57,255,20,0.2)' : link.badge === 'HOT' ? 'rgba(249,115,22,0.2)' : 'rgba(239,68,68,0.2)'}`,
                              }}
                            >
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      </motion.div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* ── Bottom divider ── */}
        <div className="mt-16 mb-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(57,255,20,0.08) 30%, rgba(57,255,20,0.12) 50%, rgba(57,255,20,0.08) 70%, transparent)' }} />

        {/* ── Bottom bar ── */}
        <div
          ref={bottomRef}
          className="footer-bottom flex flex-col sm:flex-row items-center justify-between gap-4 py-5 opacity-0"
        >
          {/* Left: legal links */}
          <div className="flex items-center gap-1 flex-wrap justify-center sm:justify-start">
            {[
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms', label: 'Terms of Service' },
              { href: '/cookies', label: 'Cookie Policy' },
            ].map((link, i) => (
              <React.Fragment key={link.href}>
                {i > 0 && <Dot className="text-gray-800 w-3 h-3" />}
                <Link
                  href={link.href}
                  className="text-[11px] font-semibold tracking-wide text-gray-600 transition-colors duration-200 hover:text-[#39FF14]"
                >
                  {link.label}
                </Link>
              </React.Fragment>
            ))}
          </div>

          {/* Center: terminal prompt */}
          <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-gray-700">
            <span className="text-[#39FF14]/50">&gt;</span>
            <span>typeforge</span>
            <span className="text-[#39FF14]/50">--mode</span>
            <span className="text-[#39FF14]">beast</span>
            <span className="inline-block w-1.5 h-3.5 bg-[#39FF14]/50 animate-pulse rounded-sm ml-0.5" />
          </div>

          {/* Right: copyright */}
          <p className="text-[11px] font-medium tracking-wide leading-none text-gray-600">
            © {new Date().getFullYear()} TypeForge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
