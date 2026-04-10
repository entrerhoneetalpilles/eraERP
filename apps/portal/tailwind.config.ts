import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        garrigue: {
          DEFAULT: "#8C7566",
          50: "#f9f6f4",
          100: "#ede7e2",
          400: "#a68d7e",
          500: "#8C7566",
          700: "#655249",
          900: "#3d2e24",
        },
        lavande: {
          DEFAULT: "#A79BBE",
          400: "#A79BBE",
          500: "#9489ae",
        },
        argile: {
          DEFAULT: "#D6B8A8",
          300: "#D6B8A8",
        },
        calcaire: {
          DEFAULT: "#F4EFEA",
          50: "#fdfcfb",
          100: "#F4EFEA",
        },
        olivier: {
          DEFAULT: "#9BA88D",
          50: "#f2f4ef",
          400: "#9BA88D",
          500: "#879473",
          600: "#6b7760",
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
