"use client";

import { motion } from 'framer-motion';
import { ActivitySquare, BarChart3, BookOpen, Keyboard, Target, CheckCircle2, TrendingUp } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function QuickValueStrip() {
  return (
    <section className="relative py-28 sm:py-32 overflow-hidden">
      {/* Background glow atmosphere */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[640px] w-[880px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.1),transparent_55%)] blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 top-20 -z-10 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.12),transparent_40%)] blur-[140px]" />
      <div className="pointer-events-none absolute left-1/4 top-[15rem] -z-10 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.14),transparent_40%)] blur-[120px]" />

      <div className="section-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="mb-16 md:mb-24 flex flex-col items-center text-center max-w-3xl mx-auto"
        >
          <motion.span variants={fadeIn} className="mb-4 inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-semibold tracking-widest text-[#38bdf8]">
            FEATURE SYSTEM
          </motion.span>
          <motion.h2 variants={fadeIn} className="mb-6 text-3xl font-semibold tracking-tight text-[#f8fafc] sm:text-4xl md:text-5xl">
            Everything you need to master the keyboard.
          </motion.h2>
          <motion.p variants={fadeIn} className="text-base text-[#94a3b8] sm:text-lg leading-relaxed max-w-2xl">
            From guided lessons to live analytics, TypeForge gives you a complete training system built for speed, precision, and long-term progress.
          </motion.p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid gap-8 sm:gap-10 lg:grid-cols-12 auto-rows-fr"
        >
          {/* Card 1: Guided Lessons (Col span 7) */}
          <motion.div variants={fadeIn} className="group relative col-span-1 lg:col-span-7 flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 p-8 sm:p-10 min-h-[460px] transition-all duration-500 hover:-translate-y-1 shadow-[0_20px_50px_rgba(15,23,42,0.25)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#38bdf8]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex-1">
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-white/[0.04] p-2.5 border border-white/[0.08] group-hover:border-[#38bdf8]/50 transition-colors duration-500">
                <BookOpen className="h-5 w-5 text-[#94a3b8] group-hover:text-[#38bdf8] transition-colors duration-500" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-3">Guided Lessons</h3>
              <p className="text-slate-300 text-base leading-relaxed max-w-2xl">Step-by-step paths that take you from fundamentals to precision-first mastery.</p>
              
              <div className="relative mt-8 mb-4 h-[140px] flex items-center justify-center">
                <div className="relative w-full max-w-xs flex flex-col items-start gap-4">
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#38bdf8] via-[#38bdf8]/40 to-white/[0.05]" />
                  
                  <div className="relative flex items-center gap-4">
                    <div className="h-5 w-5 rounded-full bg-[#38bdf8] flex items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.5)]">
                      <CheckCircle2 className="h-3 w-3 text-[#09090b]" />
                    </div>
                    <span className="text-sm font-medium text-[#f8fafc]">Beginner</span>
                  </div>
                  
                  <div className="relative flex items-center gap-4">
                    <div className="h-5 w-5 rounded-full bg-[#38bdf8] flex items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.5)]">
                      <CheckCircle2 className="h-3 w-3 text-[#09090b]" />
                    </div>
                    <span className="text-sm font-medium text-[#f8fafc]">Rhythm</span>
                  </div>
                  
                  <div className="relative flex items-center gap-4 group-hover:scale-105 transition-transform duration-500">
                    <div className="h-5 w-5 rounded-full bg-[#09090b] border-2 border-[#38bdf8] flex items-center justify-center shadow-[0_0_16px_rgba(56,189,248,0.6)]">
                      <div className="h-2 w-2 rounded-full bg-[#38bdf8] animate-pulse" />
                    </div>
                    <span className="text-sm font-bold text-[#38bdf8]">Accuracy (74%)</span>
                  </div>
                  
                  <div className="relative flex items-center gap-4 opacity-40">
                    <div className="h-5 w-5 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center" />
                    <span className="text-sm font-medium text-[#94a3b8]">Mastery</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-auto pt-4">
                <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold bg-white/[0.03] border border-white/[0.05] text-[#94a3b8] rounded-full">Adaptive</span>
                <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold bg-white/[0.03] border border-white/[0.05] text-[#94a3b8] rounded-full">Structured</span>
                <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold bg-white/[0.03] border border-white/[0.05] text-[#94a3b8] rounded-full">Trackable</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Real-Time Feedback (Col span 5) */}
          <motion.div variants={fadeIn} className="group relative col-span-1 lg:col-span-5 flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 p-8 sm:p-10 min-h-[420px] transition-all duration-500 hover:-translate-y-1 shadow-[0_20px_50px_rgba(15,23,42,0.25)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2dd4bf]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex-1 flex flex-col">
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-white/[0.04] p-2.5 border border-white/[0.08] group-hover:border-[#2dd4bf]/50 transition-colors duration-500">
                <ActivitySquare className="h-5 w-5 text-[#94a3b8] group-hover:text-[#2dd4bf] transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Real-Time Feedback</h3>
              <p className="text-slate-300 text-base leading-relaxed max-w-2xl">WPM, accuracy, rhythm, and consistency update instantly as you type.</p>
              
              <div className="relative mt-8 mb-2 flex flex-col gap-3 mt-auto">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] group-hover:bg-white/[0.04] group-hover:border-[#2dd4bf]/20 transition-colors duration-500">
                  <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Speed</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#2dd4bf]">92</span>
                    <span className="text-[10px] text-[#2dd4bf]/60">WPM</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-[#2dd4bf] animate-ping" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Precision</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#f8fafc]">98.4</span>
                    <span className="text-[10px] text-[#94a3b8]">%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Rhythm</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#f8fafc]">Perfect</span>
                    <div className="flex gap-0.5 items-end h-3">
                      <div className="w-1 h-3 bg-[#10b981] rounded-full group-hover:animate-pulse" />
                      <div className="w-1 h-4 bg-[#10b981] rounded-full group-hover:animate-pulse" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-2 bg-[#10b981] rounded-full group-hover:animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Practice Modes (Col span 5) */}
          <motion.div variants={fadeIn} className="group relative col-span-1 lg:col-span-5 flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 p-8 sm:p-10 min-h-[420px] transition-all duration-500 hover:-translate-y-1 shadow-[0_20px_50px_rgba(15,23,42,0.25)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex-1 flex flex-col">
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-white/[0.04] p-2.5 border border-white/[0.08] group-hover:border-[#a855f7]/50 transition-colors duration-500">
                <Keyboard className="h-5 w-5 text-[#94a3b8] group-hover:text-[#a855f7] transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Practice Modes</h3>
              <p className="text-slate-300 text-base leading-relaxed max-w-2xl">Train with custom text, code, AI prompts, dictation, races, and focused drills.</p>
              
              <div className="relative mt-8 mb-2 flex flex-col mt-auto">
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Code', 'AI Prompts', 'Dictation', 'Sprint', 'Focus'].map((mode, i) => (
                    <div key={mode} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-500 ${i === 1 ? 'bg-[#a855f7]/20 border border-[#a855f7]/50 text-[#d8b4fe] shadow-[0_0_12px_rgba(168,85,247,0.3)] scale-105' : 'bg-white/[0.03] border border-white/[0.05] text-[#94a3b8] group-hover:bg-white/[0.06]'}`}>
                      {mode}
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl border border-white/[0.05] bg-[#000000]/40 flex items-center justify-between group-hover:border-[#a855f7]/20 transition-colors duration-500">
                  <span className="text-xs font-mono text-[#a855f7] opacity-80">// Generate AI prompt</span>
                  <span className="h-5 w-5 flex items-center justify-center rounded-md bg-white/[0.1] text-[10px] text-white">↵</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Progress Tracking (Col span 4) */}
          <motion.div variants={fadeIn} className="group relative col-span-1 lg:col-span-4 flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 p-8 sm:p-10 min-h-[420px] transition-all duration-500 hover:-translate-y-1 shadow-[0_20px_50px_rgba(15,23,42,0.25)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex-1 flex flex-col">
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-white/[0.04] p-2.5 border border-white/[0.08] group-hover:border-[#f59e0b]/50 transition-colors duration-500">
                <Target className="h-5 w-5 text-[#94a3b8] group-hover:text-[#f59e0b] transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Progress Tracking</h3>
              <p className="text-slate-300 text-base leading-relaxed max-w-2xl">Streaks, milestones, and habit signals that keep your growth moving forward.</p>
              
              <div className="relative mt-8 mt-auto">
                <div className="flex items-end justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-4xl font-bold text-[#f59e0b] drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">12</span>
                    <span className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-semibold mt-1">Day Streak</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[10px] font-bold text-[#fbbf24] shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                    <TrendingUp className="w-3 h-3" />
                    Top 5%
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-16 w-full">
                  {[30, 45, 25, 60, 80, 50, 95].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors duration-500 relative overflow-hidden h-full">
                      <motion.div 
                        className={`absolute bottom-0 left-0 right-0 rounded-t-sm ${i === 6 ? 'bg-gradient-to-t from-[#f59e0b] to-[#fbbf24] shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-white/[0.15]'}`} 
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.08 * i, ease: "easeOut" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 5: Analytics (Col span 3) */}
          <motion.div variants={fadeIn} className="group relative col-span-1 lg:col-span-3 flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 p-8 sm:p-10 min-h-[420px] transition-all duration-500 hover:-translate-y-1 shadow-[0_20px_50px_rgba(15,23,42,0.25)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f43f5e]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex-1 flex flex-col">
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-white/[0.04] p-2.5 border border-white/[0.08] group-hover:border-[#f43f5e]/50 transition-colors duration-500">
                <BarChart3 className="h-5 w-5 text-[#94a3b8] group-hover:text-[#f43f5e] transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Analytics</h3>
              <p className="text-slate-300 text-base leading-relaxed max-w-2xl">See trends, weak zones, and measurable performance gains in every session.</p>
              
              <div className="relative mt-8 flex flex-col gap-2 mt-auto">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] group-hover:bg-white/[0.04] transition-colors duration-500">
                  <div className="text-[10px] uppercase tracking-widest text-[#94a3b8] mb-1">Accuracy</div>
                  <div className="flex items-end gap-2">
                    <span className="text-lg font-bold text-[#f8fafc]">96.2%</span>
                    <span className="text-xs font-semibold text-[#10b981]">+4.2%</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] group-hover:bg-white/[0.04] transition-colors duration-500">
                  <div className="text-[10px] uppercase tracking-widest text-[#94a3b8] mb-1">Avg Speed</div>
                  <div className="flex items-end gap-2">
                    <span className="text-lg font-bold text-[#f8fafc]">84</span>
                    <span className="text-xs font-semibold text-[#10b981]">+11 WPM</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] group-hover:bg-[#f43f5e]/10 group-hover:border-[#f43f5e]/30 transition-colors duration-500">
                  <div className="text-[10px] uppercase tracking-widest text-[#94a3b8] mb-1 group-hover:text-[#fb7185] transition-colors duration-500">Weak Keys</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold bg-white/[0.06] text-[#f8fafc] border border-white/[0.08]">X</span>
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold bg-[#f43f5e]/20 text-[#fb7185] border border-[#f43f5e]/40 shadow-[0_0_8px_rgba(244,63,94,0.4)]">C</span>
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold bg-white/[0.06] text-[#f8fafc] border border-white/[0.08]">P</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
        </motion.div>
      </div>
    </section>
  );
}
