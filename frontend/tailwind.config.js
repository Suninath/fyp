/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        marquee: "marquee 25s linear infinite",
        marquee2: "marquee2 25s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        marquee2: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
    },
    colors: {
      black: "#000000",
      white: "#FFFFFF",
      purple: "#624BFF",
      green: "#00b300",
      blue: "#0096FF",
      sideNav: "#212B36",
      "light-bg": "#EEF1FB",
      card: "#050B20",
      gray: {
        100: "#fafafa",
        200: "#f5f5f5",
        300: "#e9e9e9",
        400: "#dcdcdc",
        500: "#999",
        600: "#666",
        700: "#444",
        800: "#292929",
        900: "#1b1b1b",
      },
      red: "#e50000",
    },
  },
  plugins: [],
};
