import type { Config } from "tailwindcss";

export default {
  darkMode: ["class", "media"],
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#FFFFFF",
        foreground: "#031716",
        primary: {
          DEFAULT: "#0A7075",
          foreground: "#FFFFFF",
          50: "#E6F7F8",
          100: "#B3E5E7",
          200: "#80D3D6",
          300: "#4DC1C5",
          400: "#1AAFB4",
          500: "#0A7075",
          600: "#085A5E",
          700: "#064347",
          800: "#042C2F",
          900: "#021516",
        },
        secondary: {
          DEFAULT: "#032F30",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#0C989C",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#68A3BE",
          foreground: "#031716",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#031716",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#031716",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;