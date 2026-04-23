export const motionDurations = {
  fast: 0.16,
  medium: 0.24,
  base: 0.52,
  slow: 0.72,
  route: 0.42,
} as const

export const motionDistances = {
  xs: 4,
  sm: 8,
  md: 18,
  lg: 26,
} as const

export const motionEasing = {
  premium: [0.22, 1, 0.36, 1],
  micro: [0.16, 1, 0.3, 1],
} as const

export type MotionGroupName = 'default' | 'hero' | 'form' | 'list' | 'panel'

export const motionGroupStaggerMs: Record<MotionGroupName, number> = {
  default: 42,
  hero: 90,
  form: 38,
  list: 28,
  panel: 54,
}

export const motionGroupDistancesPx: Record<MotionGroupName, number> = {
  default: motionDistances.md,
  hero: motionDistances.lg,
  form: 12,
  list: 10,
  panel: 16,
}

export const motionCssVariables = {
  '--motion-distance-xs': `${motionDistances.xs}px`,
  '--motion-distance-sm': `${motionDistances.sm}px`,
  '--motion-distance-md': `${motionDistances.md}px`,
  '--motion-distance-lg': `${motionDistances.lg}px`,
  '--motion-duration-fast': `${motionDurations.fast}s`,
  '--motion-duration-medium': `${motionDurations.base}s`,
  '--motion-duration-route': `${motionDurations.route}s`,
  '--motion-duration-slow': `${motionDurations.slow}s`,
  '--motion-ease-micro': 'cubic-bezier(0.16, 1, 0.3, 1)',
  '--motion-ease-premium': 'cubic-bezier(0.22, 1, 0.36, 1)',
  '--motion-stagger-default': `${motionGroupStaggerMs.default}ms`,
  '--motion-stagger-hero': `${motionGroupStaggerMs.hero}ms`,
  '--motion-stagger-form': `${motionGroupStaggerMs.form}ms`,
  '--motion-stagger-list': `${motionGroupStaggerMs.list}ms`,
  '--motion-stagger-panel': `${motionGroupStaggerMs.panel}ms`,
} as const
