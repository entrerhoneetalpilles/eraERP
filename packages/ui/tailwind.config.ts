import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        garrigue: {
          DEFAULT: "#8C7566",
          50: "#f9f6f4",
          100: "#ede7e2",
          200: "#d8ccc4",
          300: "#c0aa9e",
          400: "#a68d7e",
          500: "#8C7566",
          600: "#7a6358",
          700: "#655249",
          800: "#52423b",
          900: "#3d2e24",
        },
        lavande: {
          DEFAULT: "#A79BBE",
          50: "#f4f2f8",
          100: "#e3deee",
          200: "#c9bedd",
          300: "#b5a9cf",
          400: "#A79BBE",
          500: "#9489ae",
          600: "#7d7098",
          700: "#675b7f",
          800: "#524967",
          900: "#3d3057",
        },
        argile: {
          DEFAULT: "#D6B8A8",
          50: "#fdf9f7",
          100: "#f5e9e2",
          200: "#e8d0c4",
          300: "#D6B8A8",
          400: "#c49d8a",
          500: "#b2826e",
        },
        calcaire: {
          DEFAULT: "#F4EFEA",
          50: "#fdfcfb",
          100: "#F4EFEA",
          200: "#e8ddd5",
        },
        olivier: {
          DEFAULT: "#9BA88D",
          50: "#f4f5f2",
          100: "#e4e8df",
          200: "#cad2c3",
          300: "#b0bca6",
          400: "#9BA88D",
          500: "#879473",
          600: "#6b7660",
          700: "#57614e",
          800: "#434d3d",
          900: "#2d3228",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "6px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        soft: "0 2px 20px rgba(140, 117, 102, 0.08)",
        card: "0 4px 30px rgba(140, 117, 102, 0.10)",
        hover: "0 8px 40px rgba(140, 117, 102, 0.15)",
      },
    },
  },
  plugins: [animate],
}

export default config
