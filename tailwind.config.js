import { fontFamily } from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Google Sans Text', 'Google Sans', 'Inter var', ...fontFamily.sans],
      },
      colors: {
        surface: {
          100: '#02040a',
          200: '#07101d',
          300: '#101a2c',
          400: '#1a2740',
        },
        accent: {
          100: '#dfe9ff',
          200: '#8bb6ff',
          300: '#4f8dfd',
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(({ addUtilities }) => {
      addUtilities({
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.05)',
          'backdrop-filter': 'blur(10px)',
        },
      });
    }),
  ],
};
