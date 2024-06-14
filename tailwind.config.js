module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        'xxs': '0.5rem',     // 8px
        'xxxs': '0.375rem',  // 6px
        'smallest': '0.25rem' // 4px
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}