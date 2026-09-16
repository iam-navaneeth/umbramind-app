import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cyanGlow: "#06b6d4",
        skyGlow: "#0284c7",
        umbrellaAccent: "#8b5cf6",
      },
      animation: {
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "rain-drop": "rainDrop 1.5s linear infinite",
        "float": "float 4s ease-in-out infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", filter: "blur(20px)" },
          "50%": { opacity: "0.8", filter: "blur(25px)" },
        },
        rainDrop: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(40px)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
