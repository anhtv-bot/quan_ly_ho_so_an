/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'law-red': '#800000',
        'law-red-dark': '#600000',
        'law-gold': '#daa520',
        'law-gold-dark': '#b8860b',
        'law-navy': '#003366',
        'law-navy-dark': '#001f3f',
        'law-navy-light': '#003366',
        'law-gray': '#f8f9fa',
        'law-gray-light': '#f9fafb',
        'law-white': '#ffffff'
      }
    },
  },
  plugins: [],
}