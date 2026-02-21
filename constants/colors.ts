/**
 * Color tokens for use in style props and component color props
 * where NativeWind/Tailwind classes can't be used.
 *
 * Source of truth: global.css (@theme)
 */
export const Colors = {
  background: {
    primary: '#09090b',
    secondary: '#18181b',
    tertiary: '#27272a',
  },
  content: {
    primary: '#fafafa',
    secondary: '#a1a1aa',
    tertiary: '#71717a',
    buttonPrimary: '#18181b',
  },
  brand: {
    accent: '#84cc16',
    logo: '#bef264',
  },
  border: {
    primary: '#27272a',
    secondary: '#3f3f46',
  },
  badge: {
    success: {
      content: '#bef264',
      background: 'rgba(190,242,100,0.1)',
    },
    error: {
      content: '#f87171',
      background: 'rgba(248,113,113,0.1)',
    },
  },
  status: {
    completed: '#84cc16',
    skipped: '#f87171',
    active: '#fafafa',
    scheduled: '#bef264',
    future: '#a1a1aa',
    rest: '#0284c7',
  },
  difficulty: {
    beginner: '#22c55e',
    intermediate: '#eab308',
    advanced: '#ef4444',
    expert: '#ef4444',
  },
  level: {
    beginner: '#4ade80',
    intermediate: '#facc15',
    expert: '#f87171',
  },
  destructive: '#dc2626',
  chart: {
    lime: '#84cc16',
    cyan: '#22d3ee',
    blue: '#60a5fa',
    amber: '#f59e0b',
    pink: '#f472b6',
    purple: '#a78bfa',
  },
  heatmap: {
    chest: '#f97316',
    back: '#06b6d4',
    shoulders: '#8b5cf6',
    arms: '#ec4899',
    legs: '#3b82f6',
    core: '#eab308',
    fullBody: '#71717a',
  },
} as const
