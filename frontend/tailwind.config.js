/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bce0ff",
          300: "#8eccff",
          400: "#59aeff",
          500: "#338bff",
          600: "#1a6bf5",
          700: "#1355e1",
          800: "#1645b6",
          900: "#183d8f",
          950: "#132757",
        },
        medical: {
          50: "#effcf6",
          100: "#d8f7e8",
          200: "#b4edd5",
          300: "#80debb",
          400: "#4ac89d",
          500: "#28ad82",
          600: "#1a8c69",
          700: "#167056",
          800: "#155945",
          900: "#13493a",
          950: "#082921",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
