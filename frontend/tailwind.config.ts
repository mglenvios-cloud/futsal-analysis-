import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          black: "#0a0a0a",
          dark: "#1a1a1a",
          gray: "#2d2d2d",
          light: "#3d3d3d",
        },
        neon: {
          red: "#ff1744",
          reddark: "#d50000",
          redlight: "#ff5252",
          glow: "rgba(255, 23, 68, 0.4)",
        },
        white: {
          pure: "#ffffff",
          off: "#f5f5f5",
          dim: "#e0e0e0",
        },
        accent: {
          green: "#00e676",
          blue: "#2979ff",
          yellow: "#ffea00",
          orange: "#ff9100",
          purple: "#d500f9",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-neon": "pulseNeon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        pulseNeon: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      boxShadow: {
        "neon-red": "0 0 10px rgba(255, 23, 68, 0.3), 0 0 20px rgba(255, 23, 68, 0.1)",
        card: "0 2px 8px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 4px 16px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
