/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#1e40af", light: "#3b82f6", dark: "#1e3a8a" },
        success: "#16a34a",
        warning: "#d97706",
        danger: "#dc2626",
        cmc: {
          teal: "#2DB6C4",
          "teal-dark": "#1F8A96",
          navy: "#0F2B30",
          "navy-light": "#1A3A3F",
          crimson: "#E0303D",
          sky: "#EAF6FA",
        },
      },
      backgroundImage: {
        "cmc-hero": "linear-gradient(135deg, #0F2B30 0%, #14343A 45%, #1A3A3F 100%)",
      },
    },
  },
  plugins: [],
};
