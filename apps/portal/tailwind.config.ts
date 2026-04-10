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
          200: "#ddd4cc",
          400: "#a68d7e",
          500: "#8C7566",
          700: "#655249",
          900: "#2C1A0E",
        },
        lavande: {
          DEFAULT: "#A79BBE",
          400: "#A79BBE",
          500: "#9489ae",
        },
        argile: {
          DEFAULT: "#D6B8A8",
          200: "#EDD8CC",
          300: "#D6B8A8",
          400: "#C09A88",
        },
        calcaire: {
          DEFAULT: "#F4EFEA",
          50: "#fdfcfb",
          100: "#F4EFEA",
          200: "#EDE7E2",
        },
        olivier: {
          DEFAULT: "#9BA88D",
          50: "#f2f4ef",
          100: "#e5e9df",
          400: "#9BA88D",
          500: "#879473",
          600: "#6b7760",
          700: "#545f4b",
        },
        or: {
          DEFAULT: "#C9A84C",
          300: "#DFC078",
          400: "#C9A84C",
          500: "#B8943A",
          600: "#9A7A2A",
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
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "24px",
        "3xl": "32px",
      },
      boxShadow: {
        // Legacy (keep for compat)
        soft: "0 2px 20px rgba(44, 26, 14, 0.06)",
        card: "0 4px 30px rgba(44, 26, 14, 0.08)",
        hover: "0 8px 40px rgba(44, 26, 14, 0.12)",
        // New premium system
        "luxury": "0 1px 2px rgba(44,26,14,0.04), 0 4px 16px rgba(44,26,14,0.05), 0 12px 32px rgba(44,26,14,0.04)",
        "luxury-hover": "0 4px 8px rgba(44,26,14,0.06), 0 12px 32px rgba(44,26,14,0.09), 0 28px 56px rgba(44,26,14,0.06)",
        "luxury-card": "0 0 0 1px rgba(44,26,14,0.05), 0 2px 8px rgba(44,26,14,0.05), 0 8px 24px rgba(44,26,14,0.07)",
        "luxury-inset": "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(44,26,14,0.06)",
        "gold": "0 4px 24px rgba(201,168,76,0.25)",
      },
      spacing: {
        "safe-bottom": "calc(1rem + env(safe-area-inset-bottom, 0px))",
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #C9A84C 0%, #DFC078 50%, #C9A84C 100%)",
        "gradient-dark": "linear-gradient(145deg, #2C1A0E 0%, #3d2e24 100%)",
        "gradient-hero": "linear-gradient(160deg, #F4EFEA 0%, #EDE7E2 100%)",
      },
      keyframes: {
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "count-up": "count-up 0.5s cubic-bezier(0.4,0,0.2,1) forwards",
        "fade-up": "fade-up 0.4s cubic-bezier(0.4,0,0.2,1) forwards",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [animate],
}

export default config
