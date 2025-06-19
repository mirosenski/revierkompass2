/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        police: {
          blue: '#004B87',
          green: '#7FB539',
          gray: '#6B7280'
        }
      }
    },
  },
  plugins: [],
}
