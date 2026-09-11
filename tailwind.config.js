/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17221f",
        muted: "#64736e",
        mint: "#d9f4e9",
        forest: "#0f766e",
        saffron: "#f59e0b"
      },
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui"],
        display: ["Space Grotesk", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};
