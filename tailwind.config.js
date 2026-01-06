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
          DEFAULT: '#8b7355',
          dark: '#7a654a',
          light: '#a89078',
        },
        background: {
          DEFAULT: '#fdfaf1',
          secondary: '#F8F3E0',
        },
        text: {
          primary: '#5c4033',
          secondary: '#8b7355',
        },
      },
      animation: {
        'in': 'fadeIn 200ms ease-in',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
