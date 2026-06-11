/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soccer-green': '#2d5a27',
        'soccer-gold': '#d4af37',
      }
    },
  },
  plugins: [],
}
