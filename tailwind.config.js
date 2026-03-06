/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './src/**/*.{js,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#06B6D4',
        'primary-dark': '#0891B2',
        'primary-light': '#CFFAFE',
        secondary: '#67E8F9',
        accent: '#06B6D4',
        danger: '#EF4444',
        warning: '#F59E0B',
        surface: '#FFFFFF',
        background: '#F8FAFC',
        'text-primary': '#0F172A',
        'text-secondary': '#475569',
        'text-muted': '#94A3B8',
        border: '#E2E8F0',
        'card-bg': '#FFFFFF',
        indigo: '#4338CA',
        violet: '#7C3AED',
        fuchsia: '#C026D3',
      },
      fontFamily: {
        sans: ['Manrope'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [],
};
