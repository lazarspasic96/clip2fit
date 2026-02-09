/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
    './constants/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#09090b',
          secondary: '#18181b',
          tertiary: '#27272a',
          button: {
            primary: '#84cc16',
            secondary: '#27272a',
          },
          badge: {
            success: 'rgba(190,242,100,0.1)',
            error: 'rgba(248,113,113,0.1)',
            neutral: 'rgba(212,212,216,0.1)',
          },
        },
        content: {
          primary: '#fafafa',
          secondary: '#a1a1aa',
          tertiary: '#71717a',
          button: {
            primary: '#18181b',
          },
          badge: {
            success: '#bef264',
            error: '#f87171',
            info: '#0284c7',
          },
        },
        border: {
          primary: '#27272a',
          secondary: '#3f3f46',
        },
        brand: {
          logo: '#bef264',
          accent: '#84cc16',
        },
      },
      fontFamily: {
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
        onest: ['Onest_400Regular'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px', letterSpacing: '0.06em', fontWeight: 'normal' }],
        sm: ['14px', { lineHeight: '20px', letterSpacing: '0.02em', fontWeight: 'normal' }],
        base: ['16px', { lineHeight: '24px', letterSpacing: 'normal', fontWeight: 'normal' }],
        lg: ['18px', { lineHeight: '28px', letterSpacing: 'normal', fontWeight: 'normal' }],
        xl: ['20px', { lineHeight: '28px', letterSpacing: 'normal', fontWeight: 'normal' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: 'normal', fontWeight: 'normal' }],
        '3xl': ['30px', { lineHeight: '36px', letterSpacing: 'normal', fontWeight: 'normal' }],
        '4xl': ['36px', { lineHeight: '40px', letterSpacing: 'normal', fontWeight: 'normal' }],
        '5xl': [
          '48px',
          {
            lineHeight: '48px',
            letterSpacing: '-0.02em',
            fontWeight: 'normal',
          },
        ],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        DEFAULT: '8px',
        md: '8px',
        xl: '24px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0px 1px 2px 0px rgba(0,0,0,0.05)',
        ring: '0 0 0 1px #27272a',
        'badge-success': '0 0 0 3px rgba(190,242,100,0.1)',
        'badge-error': '0 0 0 3px rgba(248,113,113,0.1)',
      },
    },
  },
  plugins: [],
}
