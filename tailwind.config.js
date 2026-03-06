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
        primary: '#007bff',
        'primary-dark': '#0056b3',
        'primary-light': '#e6f0ff',
        secondary: '#6c757d',
        accent: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        surface: '#ffffff',
        background: '#f8f9fa',
        'text-primary': '#1a1a2e',
        'text-secondary': '#6c757d',
        'text-muted': '#adb5bd',
        border: '#e0e0e0',
        'card-bg': '#ffffff',
      },
      fontFamily: {
        sans: ['Manrope'],
        manrope: ['Manrope'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [],
};
