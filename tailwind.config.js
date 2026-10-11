/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f0ff',
          100: '#ede5ff',
          200: '#dccfff',
          300: '#c3a8ff',
          400: '#a575ff',
          500: '#8b3dff',
          600: '#7c1aff',
          700: '#6d0aeb',
          800: '#5c0dc5',
          900: '#4c0fa1',
          950: '#2d046e',
        },
      },
      animation: {
        'nebula-1': 'nebula1 22s ease-in-out infinite',
        'nebula-2': 'nebula2 28s ease-in-out infinite',
        'nebula-3': 'nebula3 18s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        nebula1: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)', opacity: '0.35' },
          '25%': { transform: 'translate(8%, -12%) scale(1.1)', opacity: '0.45' },
          '50%': { transform: 'translate(-5%, 8%) scale(0.95)', opacity: '0.3' },
          '75%': { transform: 'translate(12%, 5%) scale(1.08)', opacity: '0.4' },
        },
        nebula2: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)', opacity: '0.3' },
          '33%': { transform: 'translate(-10%, 15%) scale(1.12)', opacity: '0.4' },
          '66%': { transform: 'translate(8%, -8%) scale(0.9)', opacity: '0.25' },
        },
        nebula3: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)', opacity: '0.2' },
          '50%': { transform: 'translate(15%, -5%) scale(1.15)', opacity: '0.35' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
