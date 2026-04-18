"use client";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pulse, ChartBar, BookOpen, Keyboard, Target } from '@phosphor-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const valueItems = [
  {
    icon: BookOpen,
    title: 'Guided Lessons',
    description: 'Structured paths from fundamentals to advanced precision.',
    color: '#39FF14',
    glow: 'rgba(57,255,20,0.15)',
    border: 'rgba(57,255,20,0.15)',
    number: '01',
  },
  {
    icon: Pulse,
    title: 'Real-Time Feedback',
    description: 'WPM, accuracy, and consistency update as you type.',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.15)',
    border: 'rgba(52,211,153,0.15)',
    number: '02',
  },
  {
    icon: Keyboard,
    title: 'Practice Modes',
    description: 'Custom text, code, AI prompts, dictation, and races.',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.15)',
    border: 'rgba(6,182,212,0.15)',
    number: '03',
  },
  {
    icon: Target,
    title: 'Progress Tracking',
    description: 'Streaks, milestones, and habits improving your flow.',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.15)',
    border: 'rgba(168,85,247,0.15)',
    number: '04',
  },
  {
    icon: ChartBar,
    title: 'Analytics',
    description: 'Trends, weak zones, and performance gains per session.',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.15)',
    number: '05',
  },
] as const;

export default function QuickValueStrip() {
  const stripRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    if (!stripRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.value-item',
        { y: 50, opacity: 0, scale: 0.93 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.75, stagger: 0.09, ease: 'power3.out',
          scrollTrigger: { trigger: stripRef.current, start: 'top 85%', once: true },
        }
      );
    }, stripRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={stripRef} className="relative py-12 sm:py-16">
      {/* Divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {valueItems.map((item, i) => (
            <motion.div
              key={item.title}
              className="value-item group relative cursor-default overflow-hidden rounded-2xl border border-white/[0.04] p-5 transition-all duration-500"
              style={{ opacity: 0 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            >
              {/* Glow background on hover */}
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle at 50% 0%, ${item.glow}, transparent 70%)` }}
              />
              {/* Top line */}
              <motion.div
                className="absolute inset-x-0 top-0 h-[2px] rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }}
                animate={{ opacity: hovered === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
              {/* Hover border */}
              <motion.div
                className="absolute inset-0 rounded-2xl border transition-all duration-500"
                animate={{ borderColor: hovered === i ? item.border : 'rgba(255,255,255,0.04)' }}
              />

              <div className="relative z-10">
                {/* Number + Icon row */}
                <div className="mb-4 flex items-center justify-between">
                  <motion.div
                    className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300"
                    style={{ background: hovered === i ? `${item.color}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${hovered === i ? item.color + '30' : 'rgba(255,255,255,0.05)'}` }}
                    animate={hovered === i ? { rotate: [0, -5, 5, 0], scale: 1.1 } : { rotate: 0, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <item.icon weight="duotone" className="h-6 w-6 transition-colors duration-300" style={{ color: hovered === i ? item.color : '#888' }} />
                  </motion.div>
                  <span className="font-black text-[11px]" style={{ color: hovered === i ? item.color + '60' : 'rgba(255,255,255,0.06)' }}>{item.number}</span>
                </div>
                <h3 className="mb-2 text-sm font-bold text-gray-300 transition-colors duration-300 group-hover:text-white">
                  {item.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-400">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
