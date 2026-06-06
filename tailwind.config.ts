import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        brand: {
          DEFAULT: "rgb(var(--color-brand) / <alpha-value>)",
          green: "rgb(var(--color-brand-green) / <alpha-value>)",
          "green-light": "rgb(var(--color-brand-green-light) / <alpha-value>)",
          "green-pale": "rgb(var(--color-brand-green-pale) / <alpha-value>)",
          "green-dark": "rgb(var(--color-brand-green-dark) / <alpha-value>)"
        },
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          subtle: "rgb(var(--color-surface-subtle) / <alpha-value>)",
          border: "rgb(var(--color-surface-border) / <alpha-value>)",
          divider: "rgb(var(--color-surface-divider) / <alpha-value>)"
        },
        canvas: {
          DEFAULT: "rgb(var(--color-canvas) / <alpha-value>)",
          soft: "rgb(var(--color-canvas-soft) / <alpha-value>)"
        },
        ink: {
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          secondary: "rgb(var(--color-ink-secondary) / <alpha-value>)",
          muted: "rgb(var(--color-ink-muted) / <alpha-value>)"
        },
        danger: {
          DEFAULT: "rgb(var(--color-danger) / <alpha-value>)",
          light: "rgb(var(--color-danger-light) / <alpha-value>)",
          lighter: "rgb(var(--color-danger-lighter) / <alpha-value>)",
          border: "rgb(var(--color-danger-border) / <alpha-value>)",
          deep: "rgb(var(--color-danger-deep) / <alpha-value>)"
        }
      },
      boxShadow: {
        soft: "var(--shadow-soft)"
      }
    }
  },
  plugins: []
};

export default config;
