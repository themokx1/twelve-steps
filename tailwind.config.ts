import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./styles/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        parchment: "#f7efe5",
        blush: "#efd9cb",
        clay: "#bb6d4d",
        cedar: "#2f564c",
        ink: "#322620",
        pine: "#47645b",
        oat: "#dcc7b2",
        gold: "#d2a56d"
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at top left, rgba(187,109,77,0.14), transparent 38%), radial-gradient(circle at top right, rgba(71,100,91,0.18), transparent 34%), linear-gradient(180deg, #f8f1e7 0%, #f1e4d5 42%, #ede1d4 100%)"
      },
      boxShadow: {
        card: "0 24px 60px rgba(63, 39, 28, 0.10)",
        soft: "0 14px 40px rgba(77, 48, 33, 0.08)"
      },
      fontFamily: {
        display: [
          "Iowan Old Style",
          "Palatino Linotype",
          "Book Antiqua",
          "Georgia",
          "serif"
        ],
        body: ["Avenir Next", "Segoe UI", "Helvetica Neue", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;

