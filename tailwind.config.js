/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          black: '#0b0b0d',
          dark: '#141416',
          gold: '#c9a24b',
          cream: '#f5f1e8',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
