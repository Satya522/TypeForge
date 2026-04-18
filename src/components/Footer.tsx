"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { GithubLogo, TwitterLogo, YoutubeLogo, Lightning, PaperPlaneTilt, CheckCircle, CaretRight, Globe, ShieldCheck, Cpu } from '@phosphor-icons/react';
import BrandLogo from '@/components/BrandLogo';

gsap.registerPlugin(ScrollTrigger);

/* ── Footer nav data ── */
const footerColumns: { title: string; icon: React.ElementType; links: { href: string; label: string }[] }[] = [
  {
    title: 'Product',
    icon: Cpu,
    links: [
      { href: '/learn', label: 'Learning Paths' },
      { href: '/practice', label: 'Practice Modes' },
      { href: '/code-practice', label: 'Code Practice' },
      { href: '/ai-practice', label: 'AI Practice' },
    ],
  },
  {
    title: 'Explore',
    icon: Globe,
    links: [
      { href: '/games', label: 'Games' },
      { href: '/story-mode', label: 'Story Mode' },
      { href: '/community', label: 'Community' },
      { href: '/tournaments', label: 'Tournaments' },
    ],
  },
  {
    title: 'Resources',
    icon: PaperPlaneTilt,
    links: [
      { href: '/code-editor', label: 'Editor' },
      { href: '/extension', label: 'Extension' },
      { href: '/languages', label: 'Languages' },
      { href: '/posture', label: 'Posture' },
    ],
  },
  {
    title: 'Legal',
    icon: ShieldCheck,
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/cookies', label: 'Cookie Policy' },
    ],
  },
];

const socialLinks = [
  { icon: GithubLogo, href: 'https://github.com', label: 'GitHub' },
  { icon: TwitterLogo, href: 'https://twitter.com', label: 'Twitter / X' },
  { icon: YoutubeLogo, href: 'https://youtube.com', label: 'YouTube' },
];



/* ── Canvas Particle System ── */
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
      alpha: number; radius: number; hue: number;
    }[] = [];

    const resize = () => {
      const w = canvas.parentElement?.offsetWidth || window.innerWidth;
      const h = canvas.parentElement?.offsetHeight || 400;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      // Regenerate with proper positions
      particles.length = 0;
      const count = Math.floor((w * h) / 14000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3 - 0.1,
          alpha: 0.05 + Math.random() * 0.25,
          radius: 0.5 + Math.random() * 1.5,
          hue: 110 + Math.random() * 30,
        });
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const draw = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 58%, ${p.alpha})`;
        ctx.fill();
      }

      // Connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(57,255,20,${0.06 * (1 - dist / 80)})`;
            ctx.lineWidth = 0.5;
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


/* ── Main Footer ── */
export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // GSAP scroll-triggered reveal
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Wordmark / brand column
      gsap.fromTo(
        '.footer-brand',
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: footerRef.current, start: 'top 90%', once: true },
        }
      );

      // Column headings stagger
      gsap.fromTo(
        '.footer-col',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: footerRef.current, start: 'top 88%', once: true },
        }
      );



      // Bottom bar
      gsap.fromTo(
        '.footer-bottom',
        { opacity: 0 },
        {
          opacity: 1, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: bottomRef.current, start: 'top 95%', once: true },
        }
      );

    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative mt-auto overflow-hidden bg-[#050704]">
      {/* ── Particle canvas ── */}
      <FooterParticles />

      {/* ── Background layers ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Core neon glow bloom */}
        <div
          className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(57,255,20,0.06) 0%, transparent 65%)' }}
        />
        {/* Grid fabric */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
          }}
        />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#030402] to-transparent" />
      </div>



      <div className="section-shell relative z-10 pb-0 pt-16 sm:pt-20 lg:pt-24">



        {/* ── Main grid: brand | columns ── */}
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(4,1fr)] lg:gap-8 xl:gap-14">

          {/* Brand Column */}
          <div className="footer-brand flex flex-col gap-6 opacity-0 lg:col-span-1">
            <BrandLogo size="sm" showTagline href="/" />
            <p className="max-w-[240px] text-sm leading-relaxed text-gray-400 font-medium">
              Zero latency. Absolute precision. The ultimate typing environment for elite developers.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.93 }}
                  className="group flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] transition-all duration-200 hover:border-[#39ff14]/30 hover:bg-[#39ff14]/[0.06]"
                >
                  <Icon weight="bold" className="h-4 w-4 text-gray-500 transition-colors duration-200 group-hover:text-[#39ff14]" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Nav Columns */}
          {footerColumns.map((col, ci) => {
            const ColIcon = col.icon;
            return (
              <div key={col.title} className="footer-col opacity-0">
                <div className="mb-5 flex items-center gap-2">
                  <ColIcon weight="duotone" className="h-3.5 w-3.5 text-[#39ff14]/70" />
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#39ff14]/80">
                    {col.title}
                  </h4>
                </div>
                <ul className="space-y-3">
                  {col.links.map((link, li) => (
                    <li key={link.href}>
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: ci * 0.06 + li * 0.05, duration: 0.5 }}
                      >
                        <Link
                          href={link.href}
                          className="group inline-flex items-center gap-1.5 text-sm text-gray-400 transition-all duration-200 hover:text-[#39ff14]"
                        >
                          <CaretRight weight="bold" className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                          {link.label}
                        </Link>
                      </motion.div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}


        </div>

        {/* ── Divider ── */}
        <div className="neon-divider mt-6 mb-3 opacity-40" />

        {/* ── Bottom bar ── */}
        <div
          ref={bottomRef}
          className="footer-bottom flex items-center justify-end pb-3 opacity-0"
        >
          <p className="text-xs font-medium tracking-wide leading-none text-gray-500/90">
            © {new Date().getFullYear()} TypeForge
          </p>




        </div>
      </div>
    </footer>
  );
}
