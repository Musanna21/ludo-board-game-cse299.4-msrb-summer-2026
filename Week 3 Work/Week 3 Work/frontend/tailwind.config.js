/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Baloo 2"', 'cursive'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        board: {
          bg: '#161a3a',
          panel: '#1f2354',
          cream: '#f3ecd8',
          line: '#33397a',
        },
        ludo: {
          red: '#e0483e',
          green: '#3fae5a',
          yellow: '#f4b53e',
          blue: '#3f7dd9',
        },
      },
      boxShadow: {
        panel: '0 8px 30px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
