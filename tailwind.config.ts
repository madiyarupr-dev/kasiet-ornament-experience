import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
  theme: {
    extend: {
      colors: {
        ink: "#120906",
        inkSoft: "#1c100b",
        inkCard: "#241410",
        gold: "#c9a86a",
        goldSoft: "#e3cda0",
        goldDim: "#8a7355",
        ember: "#8c2b1f",
        emberDeep: "#5e1c14",
        cream: "#f1e7d4",
        muted: "#9a8a78",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
