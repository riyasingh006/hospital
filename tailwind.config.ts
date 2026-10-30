import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        ink: "#16202E",
        paper: "#F7F8FA",
        primary: {
          50: "#EEF3FB",
          100: "#DCE6F5",
          200: "#B8CDEA",
          300: "#8AAAD9",
          400: "#5482C2",
          500: "#2E60A8",
          600: "#1D4A8C",
          700: "#173B70",
          800: "#122E57",
          900: "#0E2342",
          950: "#081729",
        },
        care: {
          50: "#EFF7FD",
          100: "#D9EDFA",
          200: "#B0DBF4",
          300: "#7CC3EA",
          400: "#43A5DA",
          500: "#1D6FB8",
          600: "#175C99",
          700: "#13497A",
        },
        saffron: {
          50: "#FFF7EC",
          100: "#FFECD3",
          200: "#FED6A4",
          300: "#FDBC71",
          400: "#FB9D3E",
          500: "#EA7A12",
          600: "#C25E0B",
          700: "#9A490C",
          800: "#7C3B0E",
          900: "#663310",
        },
        india: {
          50: "#EBFBF0",
          100: "#D3F6DE",
          200: "#A9EAC0",
          300: "#75D79C",
          400: "#43BE77",
          500: "#12813B",
          600: "#0E6A31",
          700: "#0B5527",
          800: "#094521",
          900: "#07381C",
        },
        status: {
          available: { fg: "#116932", bg: "#EAF7EE", border: "#BFE5CB" },
          limited: { fg: "#8A5300", bg: "#FFF6E6", border: "#F4DCA6" },
          unavailable: { fg: "#A11911", bg: "#FDEFEE", border: "#F5CBC7" },
          info: { fg: "#15448C", bg: "#EDF3FC", border: "#C4D6F2" },
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(14,35,66,0.05), 0 4px 16px rgba(14,35,66,0.06)",
        raised:
          "0 2px 4px rgba(14,35,66,0.06), 0 12px 32px rgba(14,35,66,0.10)",
        overlay: "0 24px 64px rgba(14,35,66,0.18)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        ticker: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.82)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.4s ease both",
        shimmer: "shimmer 1.6s linear infinite",
        ticker: "ticker 40s linear infinite",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        blink: "blink 1.1s steps(2,start) infinite",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        devanagari: ["var(--font-noto-dev)", "var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
