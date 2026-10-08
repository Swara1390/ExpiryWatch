/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: '#000000',
        paper: '#FFFFFF',
        canvas: '#E5E5E5',
        mist: '#F3F3F3',
        ash: '#C6C6C6',
        smoke: '#979797',
        slate: '#444444',
        graphite: '#2F2F2F',
        mint: '#D1FFCA',
        voltage: '#FFF100',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Bebas Neue"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
