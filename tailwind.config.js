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
          50: '#fef9e7',
          100: '#fef3cf',
          200: '#fde79f',
          300: '#fddb6f',
          400: '#fccf3f',
          500: '#FDB913',
          600: '#ca940f',
          700: '#986f0b',
          800: '#654a08',
          900: '#332504',
        },
        secondary: {
          50: '#e6f4ef',
          100: '#cce9df',
          200: '#99d3bf',
          300: '#66bd9f',
          400: '#33a77f',
          500: '#006A44',
          600: '#005536',
          700: '#004029',
          800: '#002a1b',
          900: '#00150e',
        },
        accent: {
          50: '#fce8ec',
          100: '#f9d1d9',
          200: '#f3a3b3',
          300: '#ed758d',
          400: '#e74767',
          500: '#C1272D',
          600: '#9a1f24',
          700: '#74171b',
          800: '#4d1012',
          900: '#270809',
        },
      },
    },
  },
  plugins: [],
}
