const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      colors: {
        accent: colors.emerald,
        main: colors.slate,
      },
      minWidth: {
        content: 'var(--min-content-width)',
      },
      maxWidth: {
        content: 'var(--max-content-width)',
      },
      boxShadow: {
        overlay: 'rgb(14 18 22 / 0.2) 0 6px 38px -10px, rgb(14 18 22 / 0.3) 0 8px 20px -15px',
      },
    },
  },

  plugins: [require('@tailwindcss/line-clamp'), require('tailwindcss-radix')()],
}
