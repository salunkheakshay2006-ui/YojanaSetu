/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        india: {
          saffron: '#FF9933',
          green: '#138808',
          blue: '#000080',
        }
      }
    },
  },
  plugins: [],
}
