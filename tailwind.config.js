/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#18d1ce",
        "primary-hover": "#16beb8",
        background: "#fbf8f3"
      }
    },
  },
  plugins: [],
} 