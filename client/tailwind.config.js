/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        taka: {
          green: '#1a7a4a', light: '#22c55e', earth: '#92400e',
          sky: '#0ea5e9', gold: '#f59e0b', dark: '#0f1f14',
        }
      },
      borderWidth: { 3: '3px' },
    },
  },
  plugins: [],
};
