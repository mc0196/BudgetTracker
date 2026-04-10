/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          300: '#a5b4fc',
          400: '#818cf8', // lighter – used in dark mode
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        // Semantic income / expense
        income: {
          subtle: 'rgba(52,211,153,0.12)', // dark mode bg
          light: '#dcfce7',                // light mode bg
          DEFAULT: '#16a34a',
          bright: '#34d399',               // dark mode text
          dark: '#15803d',
        },
        expense: {
          subtle: 'rgba(248,113,113,0.12)', // dark mode bg
          light: '#fee2e2',                  // light mode bg
          DEFAULT: '#dc2626',
          bright: '#f87171',                 // dark mode text
          dark: '#b91c1c',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      screens: {
        xs: '375px', // iPhone SE
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
