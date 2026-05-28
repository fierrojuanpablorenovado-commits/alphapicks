import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      colors: {
        brand:   '#6366F1',
        'brand-light': '#818CF8',
        surface: '#080D18',
        card:    '#0A0F1A',
        border:  'rgba(255,255,255,0.06)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'shimmer':    'shimmer 1.8s ease-in-out infinite',
        'live-pulse': 'live-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'live-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.35' },
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        'gradient-dark':  'linear-gradient(180deg, #080D18 0%, #04080F 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 0 1px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.5)',
        'brand-glow': '0 0 20px rgba(99,102,241,0.25)',
        'green-glow': '0 0 20px rgba(16,185,129,0.2)',
        'red-glow':   '0 0 20px rgba(239,68,68,0.2)',
      },
    },
  },
  plugins: [],
};
export default config;
