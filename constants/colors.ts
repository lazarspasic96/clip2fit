/**
 * Color tokens for use in style props and component color props
 * where NativeWind/Tailwind classes can't be used.
 *
 * Source of truth: tailwind.config.js
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
  },
  brand: {
    accent: '#84cc16',
    logo: '#bef264',
  },
  border: {
    primary: '#27272a',
    secondary: '#3f3f46',
  },
} as const
