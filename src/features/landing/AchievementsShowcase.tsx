"use client";

import { BadgeCheck, Star, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const achievements = [
  {
    icon: Star,
    title: 'Speedster',
    description: 'Reach 70 WPM in a single session',
  },
  {
    icon: Flame,
    title: 'Streak Master',
    description: 'Maintain a 7 day learning streak',
  },
  {
    icon: BadgeCheck,
    title: 'Perfectionist',
    description: 'Complete a lesson with 100% accuracy',
  },
];

export default function AchievementsShowcase() {
  return (
    <section className="section-space bg-surface-100">
      <div className="section-shell text-center">
        <div className="eyebrow">Rewards Layer</div>
        <h2 className="mt-5 text-3xl font-bold text-gray-100 sm:text-4xl">Celebrate your milestones</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
          Earn achievements and XP as you progress through lessons and practice. Keep your streak alive and level up your skills.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {achievements.map((ach, idx) => (
            <motion.div
              key={ach.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="panel p-6 sm:p-7"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-300/80 bg-surface-100/80">
                <ach.icon className="h-7 w-7 text-accent-200" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-100">{ach.title}</h3>
              <p className="mt-3 text-sm leading-7 text-gray-400">{ach.description}</p>
              <div className="mt-6 text-sm font-medium text-accent-100">XP unlocked</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
