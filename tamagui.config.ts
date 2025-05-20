import { defaultConfig } from '@tamagui/config/v4'
import { createTamagui } from 'tamagui'
import { themes } from './themes'

// Tailwind CSS default scales
const customTokens = {
  // Spacing scale (and sizing alias)
  space: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    11: '44px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
    28: '112px',
    32: '128px',
    36: '144px',
    40: '160px',
    44: '176px',
    48: '192px',
    56: '224px',
    64: '256px',
  },
  size: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    11: '44px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
    28: '112px',
    32: '128px',
    36: '144px',
    40: '160px',
    44: '176px',
    48: '192px',
    56: '224px',
    64: '256px',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
    '7xl': '72px',
    '8xl': '96px',
    '9xl': '128px',
  },
  radius: {
    none: '0px',
    sm: '2px',
    DEFAULT: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
  },
}

export const config = createTamagui({
  ...defaultConfig,

  tokens: {
    ...defaultConfig.tokens,
    // Override categories with Tailwind scales
    space: {
      ...defaultConfig.tokens.space,
      ...customTokens.space,
    },
    size: {
      ...defaultConfig.tokens.size,
      ...customTokens.size,
    },
    fontSize: {
      ...defaultConfig.tokens.fontSize,
      ...customTokens.fontSize,
    },
    radius: {
      ...defaultConfig.tokens.radius,
      ...customTokens.radius,
    },
  },
  ...themes,
  // Global default styles for components
  defaultProps: {
    H1: { margin: 0, padding: 0 },
    H2: { margin: 0, padding: 0 },
    H3: { margin: 0, padding: 0 },
    H4: { margin: 0, padding: 0 },
    H5: { margin: 0, padding: 0 },
    H6: { margin: 0, padding: 0 },
    Paragraph: { margin: 0, padding: 0 },
  },
})

export default config
export type Conf = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
