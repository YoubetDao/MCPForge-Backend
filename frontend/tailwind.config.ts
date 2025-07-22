import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Inter", "monospace"],
      },
      colors: {
        // Binance Brand Colors
        binance: {
          yellow: "#F5A623", // 品牌黄色
          black: "#222222",  // 品牌黑色（正文）
          "black-emphasis": "#000000", // 品牌黑色（强调）
          green: "#00C853",  // 语义绿色（成功）
          red: "#D32F2F",    // 语义红色（错误/警告）
        },
        // Shadcn/ui compatible colors
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Binance 4pt grid system spacing
      spacing: {
        '1': '4px',   // 4*1
        '2': '8px',   // 4*2
        '3': '12px',  // 4*3
        '4': '16px',  // 4*4
        '5': '20px',  // 4*5
        '6': '24px',  // 4*6
        '7': '28px',  // 4*7
        '8': '32px',  // 4*8
        '9': '36px',  // 4*9
        '10': '40px', // 4*10
        '11': '44px', // 4*11
        '12': '48px', // 4*12
      },
      // Binance unified border radius
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'full': '9999px',
      },
      // Binance shadows
      boxShadow: {
        'card': '0 2px 4px -2px rgba(0,0,0,0.06)',
        'popup': '0 8px 24px -8px rgba(0,0,0,0.12)',
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
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;
