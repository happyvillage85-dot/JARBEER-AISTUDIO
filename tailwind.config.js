/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#020408',
          900: '#060c14',
          800: '#0d1824',
          700: '#1a2a3a',
          600: '#2a3d52',
          500: '#4a6070',
          400: '#6a8090',
          300: '#90a8b8',
        },
      },
      keyframes: {
        'live-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.85)' },
        },
      },
      animation: {
        'live-pulse': 'live-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
