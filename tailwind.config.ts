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
          DEFAULT: "#0e0f0c",
          green: "#9fe870",
          "green-light": "#cdffad",
          "green-pale": "#e2f6d5",
          "green-dark": "#054d28"
        },
        surface: {
          DEFAULT: "#e8ebe6",
          subtle: "#f4f6f1",
          border: "#cfd5ca",
          divider: "#e8ebe6"
        },
        canvas: {
          DEFAULT: "#ffffff",
          soft: "#e8ebe6"
        },
        ink: {
          DEFAULT: "#0e0f0c",
          secondary: "#454745",
          muted: "#868685"
        },
        danger: {
          DEFAULT: "#a72027",
          light: "#fff1f2",
          lighter: "#fef2f2",
          border: "#fecaca"
        }
      },
      boxShadow: {
        soft: "0 10px 28px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
