/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        green: { DEFAULT: '#58cc02', dark: '#46a302', light: '#d7ffb8' },
        blue: { DEFAULT: '#1cb0f6', dark: '#0a9fdf', light: '#ddf4ff' },
        red: { DEFAULT: '#ff4b4b', dark: '#ea2b2b', light: '#ffdfe0' },
        yellow: { DEFAULT: '#ffc800', dark: '#e5b400', light: '#fff3b3' },
        purple: { DEFAULT: '#ce82ff', dark: '#b463f5', light: '#f4dcff' },
        orange: { DEFAULT: '#ff9600', dark: '#e58700', light: '#ffe5b3' },
        gray: {
          50: '#f7f7f7', 100: '#e5e5e5', 200: '#d1d1d1',
          300: '#b8b8b8', 400: '#9e9e9e', 500: '#808080',
          600: '#5e5e5e', 700: '#3c3c3c', 800: '#2c2c2c', 900: '#1a1a1a',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-once': 'bounce 0.5s ease-in-out 1',
        'shake': 'shake 0.4s ease-in-out',
        'pop': 'pop 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '75%': { transform: 'translateX(8px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
