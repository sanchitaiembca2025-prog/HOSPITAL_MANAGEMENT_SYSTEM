import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Primary — Yale Blue #1B4965 (authority text, sidebar, headers)
        primary: {
          50:  "#EEF8FF",   // Palest sky tint
          100: "#CAE9FF",   // Pale Sky Tint — table headers, field borders, row dividers
          200: "#EED0F4",   // Thistle Lilac — active sidebar indicator, selected tabs
          500: "#5FA8D3",   // Fresh Sky — links, dropdowns, secondary filters
          600: "#1B4965",   // Yale Blue — authority text, nav bar, branding
          700: "#143855",   // Deeper Yale — sidebar active bg
          900: "#0D2435",   // Darkest Yale — sidebar body bg
          DEFAULT: "#1B4965",
          foreground: "#FFFFFF",
        },
        // Accent — Blush Rose #C36187 (CTAs, urgent metrics)
        accent: {
          50:  "#FDF2F6",   // Near-white blush tint
          100: "#F5D0DF",   // Light rose bg
          400: "#D07B96",   // Rose hover
          500: "#C36187",   // Blush Rose — action buttons, urgent care badges
          700: "#9E4770",   // Deeper rose — pressed/focus states
          DEFAULT: "#C36187",
          foreground: "#FFFFFF",
        },
        // Neutral — white canvas, Yale Blue text, Pale Sky borders
        neutral: {
          50:  "#FFFFFF",   // Pure White — canvas, cards, sheets
          100: "#EEF8FF",   // Pale sky hover tint — table row hover, inactive fields
          200: "#CAE9FF",   // Pale Sky Tint — card borders, dividers, table headers
          300: "#A8D8F0",   // Mid sky border — table lines, separators
          400: "#6AABCC",   // Muted sky — placeholder icons, muted elements
          600: "#4A7A96",   // Secondary text — labels, captions
          800: "#1B4965",   // Yale Blue — body text, data grids
          900: "#0D2435",   // Deepest — critical headings
        },
        // Thistle Lilac scale — selected states, soft brand highlights
        lilac: {
          50:  "#FBF4FE",
          100: "#F4E3FA",
          300: "#EED0F4",   // Thistle Lilac — active tabs, selected nav items
          500: "#D9A0EA",   // Mid lilac — hover on selected
        },
        // Fresh Sky scale — interactive links, filters, secondary actions
        sky: {
          50:  "#EEF8FF",
          100: "#CAE9FF",
          300: "#5FA8D3",   // Fresh Sky — interactive elements
          500: "#3A8CB8",   // Deeper sky — hover
        },
        // Semantic Colours
        success: {
          50:  "#F0FDF4",
          100: "#DCFCE7",
          500: "#22C55E",
          700: "#15803D",
        },
        warning: {
          50:  "#FFFBEB",
          500: "#D97706",
          700: "#92400E",
        },
        danger: {
          50:  "#FFF1F2",
          500: "#EF4444",
          700: "#B91C1C",
        },
        info: {
          50:  "#EEF8FF",
          500: "#5FA8D3",   // Fresh Sky for info
          700: "#1B4965",
        },
        // shadcn/ui CSS variable references
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "Menlo", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
