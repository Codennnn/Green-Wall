import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import plugin from 'tailwindcss/plugin'
import radix from 'tailwindcss-radix'

export default {
  content: ['./src/{app,components}/**/*.{ts,tsx}'],

  theme: {
    extend: {
      colors: {
        accent: colors.emerald,
        main: colors.slate,
        pageBg: colors.white,
      },
      minWidth: {
        content: 'var(--min-content-width)',
      },
      maxWidth: {
        content: 'var(--max-content-width)',
      },
      boxShadow: {
        overlay: 'rgb(14 18 22 / 0.2) 0 6px 38px -10px, rgb(14 18 22 / 0.3) 0 8px 20px -15px',
        tooltip:
          'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
      },

      keyframes: {
        // For radix tooltip
        'slide-up-fade': {
          '0%': { opacity: '0', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-right-fade': {
          '0%': { opacity: '0', transform: 'translateX(-2px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-down-fade': {
          '0%': { opacity: '0', transform: 'translateY(-2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-left-fade': {
          '0%': { opacity: '0', transform: 'translateX(2px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        // For radix tooltip
        'slide-up-fade': 'slide-up-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right-fade': 'slide-right-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down-fade': 'slide-down-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-left-fade': 'slide-left-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },

  plugins: [
    radix,
    plugin((api) => {
      api.addVariant('toggle-on', ['&[data-state=on]'])
    }),
  ],
} satisfies Config
