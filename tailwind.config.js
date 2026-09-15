/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          dark: '#0b0f17',
          surface: '#151d2a',
          card: '#1e293b',
          border: '#334155',
          amber: '#f59e0b',
          orange: '#ea580c',
          steel: '#94a3b8'
        }
      }
    },
  },
  plugins: [],
}
