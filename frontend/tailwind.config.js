/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'taller-blue': '#1e40af', // Un azul profesional
        'taller-dark': '#1f2937',
      }
    },
  },
  plugins: [],
}