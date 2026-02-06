import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ember: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#C41E3A', // Primary - Ember Red
          600: '#b91c36',
          700: '#9f1a30',
          800: '#861729',
          900: '#6d1422',
        },
        char: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#4A4A4A', // Smoke Gray
          600: '#3d3d3d',
          700: '#2d2d2d',
          800: '#1A1A1A', // Char Black
          900: '#0f0f0f',
          black: '#1A1A1A',
        },
        ash: '#F5F5F0',
        'ash-white': '#F5F5F0',
        copper: '#B87333',
        'copper-glow': '#B87333',
        mesquite: '#5D3A1A',
        'mesquite-brown': '#5D3A1A',
        success: '#2D5A27',
        warning: '#D4A574',
        error: '#8B2635',
        'ember-red': '#C41E3A',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-source-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        button: '12px',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
