"use client";

import { motion } from 'framer-motion';

// Reusable card component
const CardContainer = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 32, scale: 0.96 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4, transition: { duration: 0.25 } }}
    className={`rounded-3xl border border-white/[8%] bg-[#0E111A] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl ${className}`}
  >
    {children}
  </motion.div>
);

export default function PremiumFeatureSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-24 md:px-8">
      {/* Section Intro */}
      <div className="mb-12 text-center">
        <p className="text-xs uppercase tracking-wider text-blue-500">Feature System</p>
        <h2 className="mt-2 text-4xl font-bold text-white md:text-5xl">
          Everything you need to master the keyboard
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-[#A3AFC6] md:text-base">
          From guided lessons to live analytics, TypeForge offers a complete training system built for speed, precision and measurable progress.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Guided Lessons (Large Card) */}
        <div className="col-span-12 md:col-span-7 md:row-span-2">
          <CardContainer className="flex flex-col justify-between h-full">
            <div>
              <p className="text-[0.65rem] uppercase tracking-wide text-blue-400">Structured Learning</p>
              <h3 className="mt-1 text-2xl font-semibold text-white">Guided Lessons</h3>
              <p className="mt-2 max-w-sm text-xs text-[#96A2C0]">
                Step‑by‑step paths that take you from fundamentals to precision‑first mastery.
              </p>
            </div>
            {/* Lesson Roadmap */}
            <div className="mt-6 space-y-3">
              {['Beginner', 'Rhythm', 'Accuracy (74%)', 'Mastery'].map((step, idx) => (
                <div key={step} className="relative flex items-center gap-3 pl-3">
                  {/* Connector line */}
                  {idx < 3 && (
                    <span className="absolute left-3 top-3 h-full w-px bg-[#3F4C77]"></span>
                  )}
                  {/* Node */}
                  <span
                    className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full border ${
                      idx < 2
                        ? 'border-blue-500 bg-blue-500'
                        : idx === 2
                        ? 'border-blue-400 bg-[#0E111A]'
                        : 'border-[#3F4C77] bg-transparent'
                    }`}
                  >
                    {idx === 2 && (
                      <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                    )}
                  </span>
                  {/* Label */}
                  <span
                    className={`text-sm ${
                      idx < 2
                        ? 'text-blue-200'
                        : idx === 2
                        ? 'font-semibold text-blue-300'
                        : 'text-[#525F7A]'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
            {/* Tags */}
            <div className="mt-6 flex gap-2">
              {['Adaptive', 'Structured', 'Trackable'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-500/10 px-3 py-1 text-[0.65rem] text-blue-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardContainer>
        </div>

        {/* Real-Time Feedback (Medium Card) */}
        <div className="col-span-12 md:col-span-5">
          <CardContainer>
            <p className="text-[0.65rem] uppercase tracking-wide text-blue-400">Live Signals</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Real‑Time Feedback</h3>
            <p className="mt-2 text-xs text-[#96A2C0]">
              WPM, accuracy, rhythm, and consistency update instantly as you type.
            </p>

            {/* Metrics Grid */}
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'WPM', value: '92', color: 'text-green-400' },
                { label: 'ACC', value: '98%', color: 'text-blue-400' },
                { label: 'Rhythm', value: 'Good', color: 'text-yellow-400' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="mt-1 text-[0.6rem] text-[#6A78A0]">{label}</p>
                </div>
              ))}
            </div>

            {/* Pulsing Progress Bar */}
            <motion.div
              animate={{ scaleX: [0.15, 0.8, 0.35] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="mx-auto mt-4 h-1 w-full origin-left rounded-full bg-[#243155]"
            >
              <motion.div
                animate={{ width: ['20%', '70%', '35%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="h-full rounded-full bg-green-400"
              ></motion.div>
            </motion.div>
          </CardContainer>
        </div>

        {/* Practice Modes (Medium Card) */}
        <div className="col-span-12 md:col-span-5">
          <CardContainer>
            <p className="text-[0.65rem] uppercase tracking-wide text-purple-400">Custom Sessions</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Practice Modes</h3>
            <p className="mt-2 text-xs text-[#96A2C0]">
              Train with custom text, code, AI prompts, dictation, races and focused drills.
            </p>
            {/* Mode pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              {['Code', 'AI Prompts', 'Dictation', 'Sprint', 'Focus'].map((m) => (
                <span
                  key={m}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-[0.65rem] ${
                    m === 'AI Prompts'
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#1F2439] text-[#7B87AA]'
                  }`}
                >
                  {m}
                </span>
              ))}
            </div>
            {/* Mini Prompt Preview */}
            <div className="mt-4 rounded-lg bg-[#161B2D] p-3 text-[0.7rem] font-mono text-purple-300">
              <span className="text-purple-500">//</span> Generate AI prompt
            </div>
          </CardContainer>
        </div>

        {/* Progress Tracking (Medium Card) */}
        <div className="col-span-12 md:col-span-4">
          <CardContainer>
            <p className="text-[0.65rem] uppercase tracking-wide text-yellow-400">Momentum</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Progress Tracking</h3>
            <p className="mt-2 text-xs text-[#96A2C0]">
              Streaks, milestones, and habit signals that keep your growth moving forward.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <p className="text-4xl font-bold text-yellow-400">12</p>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#676F8C]">Day Streak</p>
                <span className="mt-1 flex items-center gap-1 rounded-full bg-[#392E17] px-2 py-1 text-[0.6rem] text-yellow-300">
                  <svg
                    className="h-3 w-3 text-yellow-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 12l6 6L21 3" />
                  </svg>
                  Top 5%
                </span>
              </div>
            </div>
            {/* Streak Bars */}
            <div className="mt-4 flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((day, idx) => (
                <div
                  key={day}
                  className={`flex-1 rounded-md ${
                    idx === 6 ? 'h-14 bg-yellow-400' : 'h-10 bg-[#1F2439]'
                  }`}
                ></div>
              ))}
            </div>
          </CardContainer>
        </div>

        {/* Analytics (Medium Card) */}
        <div className="col-span-12 md:col-span-3">
          <CardContainer className="border-pink-600/20 bg-gradient-to-br from-[#1A0D17] to-[#120814]">
            <p className="text-[0.65rem] uppercase tracking-wide text-pink-400">Precision Data</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Analytics</h3>
            <p className="mt-2 text-xs text-[#96A2C0]">
              See trends, weak zones and measurable performance gains in every session.
            </p>
            {/* Mini Stats */}
            <div className="mt-6 space-y-3">
              {[
                { label: 'Accuracy', value: '96.2%', change: '+4.2%', color: 'text-green-400' },
                { label: 'Avg Speed', value: '84 WPM', change: '+11 WPM', color: 'text-green-400' },
              ].map(({ label, value, change, color }) => (
                <div
                  key={label}
                  className="flex flex-col rounded-lg bg-[#1F2439] px-3 py-2 text-sm text-white"
                >
                  <p className="text-[0.6rem] uppercase tracking-wide text-[#7C879F]">{label}</p>
                  <span className="flex items-center justify-between">
                    <span className={`text-xl font-bold ${color}`}>{value}</span>
                    <span className="text-[0.6rem] font-medium text-green-400">{change}</span>
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 rounded-lg bg-[#1F2439] px-3 py-2">
                <p className="flex-1 text-[0.6rem] uppercase tracking-wide text-[#7C879F]">
                  Weak Keys
                </p>
                {['X', 'C', 'P'].map((key) => (
                  <span
                    key={key}
                    className="rounded-full bg-pink-600 px-2 py-1 text-[0.6rem] font-medium text-white"
                  >
                    {key}
                  </span>
                ))}
              </div>
            </div>
          </CardContainer>
        </div>
      </div>
    </section>
  );
}
