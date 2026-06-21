/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // soft pastel palette used across the UI
        blush: "#ffd9e8",
        petal: "#ffb3d1",
        cream: "#fff6ec",
        sky: "#cfeaff",
        mint: "#cdeede",
        lilac: "#e3d4ff",
        cocoa: "#7a5c54",
      },
      fontFamily: {
        hand: ["'Comic Sans MS'", "'Segoe Print'", "cursive"],
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(122, 92, 84, 0.35)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        floaty: "floaty 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
