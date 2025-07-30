import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roca: ["var(--font-roca)", "Roca", "sans-serif"],
      },
      fontWeight: {
        thin: "100",
        light: "300",
        normal: "400",
        bold: "700",
        heavy: "800",
        black: "900",
      },
    },
  },
  plugins: [],
};

export default config;
