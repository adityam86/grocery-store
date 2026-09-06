/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fffbf5',
          100: '#fff3e0',
          500: '#ff9933', // Traditional Saffron
          600: '#e67e22',
          700: '#d35400',
        },
        cardamom: {
          50: '#f4faf6',
          100: '#e8f5e9',
          500: '#2e7d32', // Rich Cardamom Green
          600: '#1b5e20',
        },
        curry: {
          50: '#fffdf0',
          100: '#fffde7',
          500: '#ffc107', // Curry Gold
          600: '#ffb300',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
