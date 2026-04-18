"use client";

import { motion } from 'framer-motion';
import {
  GraduationCap,
  Keyboard,
  ActivitySquare,
  BarChart2,
  Medal,
  Users as UsersIcon,
} from 'lucide-react';

const features = [
  {
    icon: GraduationCap,
    title: 'Guided Courses',
    description: 'Structured lessons from beginner to advanced with progressive unlocking.',
  },
  {
    icon: Keyboard,
    title: 'Smart Practice',
    description: 'Practice words, sentences, paragraphs, numbers, punctuation and code.',
  },
  {
    icon: ActivitySquare,
    title: 'Real-time Feedback',
    description: 'Accurate WPM, raw WPM, accuracy, consistency and error tracking.',
  },
  {
    icon: BarChart2,
    title: 'Rich Analytics',
    description: 'Visualize progress, trends and key weaknesses across sessions.',
  },
  {
    icon: Medal,
    title: 'Achievements & XP',
    description: 'Earn badges, level up and maintain streaks with gamified rewards.',
  },
  {
    icon: UsersIcon,
    title: 'Competitive Leaderboard',
    description: 'Compare your performance with friends and the community.',
  },
];

export default function FeaturesGrid() {
  return (
    <section className="section-space bg-surface-100">
      <div className="section-shell">
        <div className="mb-10 text-center sm:mb-12">
          <div className="eyebrow">Core System</div>
          <h2 className="mt-5 text-3xl font-bold text-gray-100 sm:text-4xl">Everything you need to master typing</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            TypeForge combines a guided curriculum, versatile practice modes, live feedback and analytics into one cohesive platform.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="group panel relative overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-7"
            >
              <div className="absolute inset-y-6 left-0 w-1 rounded-full bg-accent-300/90" />
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-surface-300/80 bg-surface-100/70">
                <feature.icon className="h-6 w-6 text-accent-200" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-100">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-gray-400">{feature.description}</p>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-accent-100">
                <span className="h-2 w-2 rounded-full bg-accent-300 shadow-[0_0_12px_rgba(57,255,20,0.8)]" />
                Responsive by design
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
