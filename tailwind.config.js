/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f5fa",
          100: "#dae5f3",
          200: "#baceeb",
          300: "#8fabdd",
          400: "#5c80cc",
          500: "#3a5bb0",
          600: "#2d4998",
          700: "#253a7c",
          800: "#1e2d5a",
          900: "#172442",
        },
        primary: {
          50: "#f0f5fa",
          100: "#dae5f3",
          200: "#baceeb",
          300: "#8fabdd",
          400: "#5c80cc",
          500: "#3a5bb0",
          600: "#2d4998",
          700: "#253a7c",
          800: "#1e2d5a",
          900: "#172442",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
