"use client";

import { Trophy, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  {
    icon: Users,
    label: 'Learners',
    value: '25K+',
    description: 'trusted users honing their typing skills',
  },
  {
    icon: BookOpen,
    label: 'Lessons',
    value: '500+',
    description: 'structured exercises across all levels',
  },
  {
    icon: Trophy,
    label: 'Achievements',
    value: '100+',
    description: 'badges to unlock and milestones to reach',
  },
];

export default function StatsPreview() {
  return (
    <section className="section-space bg-surface-200/65">
      <div className="section-shell">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="panel relative overflow-hidden p-6 text-center sm:p-7"
            >
              <div className="absolute inset-x-6 top-0 h-1 bg-gradient-to-r from-transparent via-accent-300/90 to-transparent" />
              <stat.icon className="mx-auto h-8 w-8 text-accent-200" />
              <h3 className="mt-5 text-3xl font-bold text-gray-100 sm:text-4xl">{stat.value}</h3>
              <p className="mt-1 text-sm uppercase tracking-wider text-accent-100">{stat.label}</p>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-gray-400">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
