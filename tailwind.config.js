/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff9e6',
          100: '#fef3cc',
          200: '#fee799',
          300: '#fddb66',
          400: '#fccf33',
          500: '#FFB81C',
          600: '#cc9316',
          700: '#996e11',
          800: '#664a0b',
          900: '#332506',
        },
        secondary: {
          50: '#e6f2ec',
          100: '#cce5d9',
          200: '#99ccb3',
          300: '#66b28d',
          400: '#339967',
          500: '#046A38',
          600: '#03552d',
          700: '#024022',
          800: '#022a16',
          900: '#01150b',
        },
        accent: {
          50: '#fceae9',
          100: '#f9d5d4',
          200: '#f3aba8',
          300: '#ed817d',
          400: '#e75751',
          500: '#BE3A34',
          600: '#982e2a',
          700: '#72231f',
          800: '#4c1715',
          900: '#260c0a',
        },
        lithuanian: {
          yellow: '#FFB81C',
          green: '#046A38',
          red: '#BE3A34',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
