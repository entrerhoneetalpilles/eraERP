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
          500: "#8C7566",
          900: "#3d2e24",
        },
        lavande: {
          DEFAULT: "#A79BBE",
          500: "#A79BBE",
        },
        argile: {
          DEFAULT: "#D6B8A8",
          300: "#D6B8A8",
        },
        calcaire: {
          DEFAULT: "#F4EFEA",
          100: "#F4EFEA",
        },
        olivier: {
          DEFAULT: "#9BA88D",
          500: "#9BA88D",
          600: "#6b7660",
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
      },
      boxShadow: {
        soft: "0 2px 20px rgba(140, 117, 102, 0.08)",
        card: "0 4px 30px rgba(140, 117, 102, 0.10)",
      },
    },
  },
  plugins: [animate],
}

export default config
