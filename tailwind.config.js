/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aubergine-ink': 'rgb(var(--color-aubergine-ink) / <alpha-value>)',
        'espresso': 'rgb(var(--color-espresso) / <alpha-value>)',
        'warm-ash': 'rgb(var(--color-warm-ash) / <alpha-value>)',
        'graphite': 'rgb(var(--color-graphite) / <alpha-value>)',
        'stone': 'rgb(var(--color-stone) / <alpha-value>)',
        'paper-white': 'rgb(var(--color-paper-white) / <alpha-value>)',
        'linen': 'rgb(var(--color-linen) / <alpha-value>)',
        'bone': 'rgb(var(--color-bone) / <alpha-value>)',
        'status-queued': 'rgb(var(--color-status-queued) / <alpha-value>)',
        'status-printing': 'rgb(var(--color-status-printing) / <alpha-value>)',
        'status-ready': 'rgb(var(--color-status-ready) / <alpha-value>)',
        'status-completed': 'rgb(var(--color-status-completed) / <alpha-value>)',
        'surface': 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-dim': 'rgb(var(--color-surface-dim) / <alpha-value>)',
        'surface-container': 'rgb(var(--color-surface-container) / <alpha-value>)',
        'surface-container-high': 'rgb(var(--color-surface-container-high) / <alpha-value>)',
        'on-surface': 'rgb(var(--color-on-surface) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--color-on-surface-variant) / <alpha-value>)',
        'secondary-container': 'rgb(var(--color-secondary-container) / <alpha-value>)',
        'on-secondary-container': 'rgb(var(--color-on-secondary-container) / <alpha-value>)',
        'outline': 'rgb(var(--color-outline) / <alpha-value>)',
        'outline-variant': 'rgb(var(--color-outline-variant) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'DEFAULT': '1rem',
        'sm': '0.5rem',
        'md': '1.5rem',
        'lg': '2rem',
        'xl': '3rem',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 1px 4px rgba(27,6,36,0.06)',
        'elevated': '0 4px 16px rgba(27,6,36,0.08)',
      }
    },
  },
  plugins: [],
}
