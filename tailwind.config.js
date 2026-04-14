/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#7dd3fc",
          DEFAULT: "#22d3ee",
          dark: "#0284c7",
        },
      },
      boxShadow: {
        brand: "0 8px 24px 0 rgba(34, 211, 238, 0.35)",
      },
    },
  },
  plugins: [],
};
