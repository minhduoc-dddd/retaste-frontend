import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
    path.join(__dirname, '../index.html'),
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './retaste-frontend/index.html',
    './retaste-frontend/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: '#1E40AF',
        'primary-dark': '#1E3A8A',
        secondary: '#F59E0B',
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'glow': '0 10px 25px -5px rgba(30, 64, 175, 0.38)',
        'amber-glow': '0 10px 25px -5px rgba(245, 158, 11, 0.35)',
      }
    },
  },
  plugins: [],
}