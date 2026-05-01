"use client";

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ActivitySquare, BarChart3, BookOpen, Keyboard, Target } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const valueItems = [
  {
    icon: BookOpen,
    title: 'Guided Lessons',
    description: 'Structured paths from fundamentals to advanced precision.',
    gradient: 'from-accent-300/20 to-blue-500/20',
  },
  {
    icon: ActivitySquare,
    title: 'Real-Time Feedback',
    description: 'WPM, accuracy, and consistency update as you type.',
    gradient: 'from-blue-400/20 to-cyan-500/20',
  },
  {
    icon: Keyboard,
    title: 'Practice Modes',
    description: 'Custom text, code, AI prompts, dictation, and races.',
    gradient: 'from-cyan-500/20 to-[#7b61ff]/20',
  },
  {
    icon: Target,
    title: 'Progress Tracking',
    description: 'Streaks, milestones, and habits improving your flow.',
    gradient: 'from-cyan-500/20 to-accent-300/20',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Trends, weak zones, and performance gains per session.',
    gradient: 'from-accent-200/20 to-accent-300/20',
  },
] as const;

export default function QuickValueStrip() {
  const stripRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!stripRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.value-item',
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.7, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: stripRef.current, start: 'top 85%', once: true },
        }
      );
    }, stripRef.current);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={stripRef} className="relative py-6 sm:py-10">
      {/* Divider glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-300/20 to-transparent" />

      <div className="section-shell">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {valueItems.map((item) => (
            <motion.div
              key={item.title}
              className="value-item group relative cursor-default overflow-hidden rounded-2xl border border-white/[0.04] p-5 transition-all duration-500 hover:border-accent-300/15"
              style={{ opacity: 0 }}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {/* Hover gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

              {/* Top glow line on hover */}
              <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-accent-300/0 to-transparent transition-all duration-500 group-hover:via-accent-300/30" />

              <div className="relative">
                <div className="mb-4 inline-flex">
                  <item.icon className="h-5 w-5 text-gray-500 transition-colors duration-300 group-hover:text-accent-300" />
                </div>
                <h3 className="text-sm font-semibold text-gray-200 transition-colors duration-300 group-hover:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-gray-500 transition-colors duration-300 group-hover:text-gray-400">
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
