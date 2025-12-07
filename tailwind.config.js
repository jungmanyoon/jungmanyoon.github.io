/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bread': {
          50: '#FFF8DC',
          100: '#FAEBD7',
          200: '#F5DEB3',
          300: '#DEB887',
          400: '#D2691E',
          500: '#8B4513',
          600: '#654321',
          700: '#3E2723',
          800: '#2E1A1A',
          900: '#1A0F0F',
        }
      },
      fontFamily: {
        'sans': ['Pretendard', 'Noto Sans KR', 'sans-serif'],
      }
    },
  },
  plugins: [],
}