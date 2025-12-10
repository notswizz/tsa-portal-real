/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sa: {
          pink: "#ff2f92",
          pinkLight: "#ffe6f4",
          navy: "#111827",
          slate: "#6b7280",
          background: "#f5f5fb",
          card: "#ffffff",
        },
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)",
      },
      fontFamily: {
        display: ['"Playfair Display"', "ui-serif", "Georgia", "serif"],
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"Inter"',
          '"Segoe UI"',
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;


