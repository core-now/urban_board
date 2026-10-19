/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#ff8000',
          hover: '#e67300',
          active: '#cc6600',
          subtle: 'rgba(255, 128, 0, 0.12)',
          border: 'rgba(255, 128, 0, 0.35)',
        },
        anthrazit: {
          50: '#f6f7f9',
          100: '#eceef1',
          200: '#d5d9df',
          300: '#b1b9c4',
          400: '#8693a3',
          500: '#647283',
          600: '#4e5a6a',
          700: '#3c4552',
          800: '#252a32',
          850: '#1d2127',
          900: '#16191e',
          950: '#0f1114',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
      },
      boxShadow: {
        'accent-sm': '0 0 10px rgba(255, 128, 0, 0.2)',
        'panel': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
