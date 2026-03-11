import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        primaryDark: "#2563EB",
        background: "#F1F5F9",
        border: "#E5E7EB",
        textMain: "#0F172A",
        textSecondary: "#64748B",
        card: "#FFFFFF"
      }
    },
  },
  plugins: [],
};

export default config;
