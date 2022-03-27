module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        alfa: ["Alfa Slab One", "cursive"],
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0,0,.58,1) infinite",
      },
      screens: {
        "can-hover": { raw: "(hover: hover)" },
      },
    },
  },
  plugins: [],
};
