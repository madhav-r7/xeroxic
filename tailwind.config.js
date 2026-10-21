/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aubergine-ink': '#1b0624',
        'espresso': '#160f0c',
        'warm-ash': '#766a7c',
        'graphite': '#444444',
        'stone': '#898683',
        'paper-white': '#ffffff',
        'linen': '#f7f7f5',
        'bone': '#edece7',
        'status-queued': '#d83b01',
        'status-printing': '#0078d4',
        'status-ready': '#107c41',
        'status-completed': '#605e5c',
        'surface': '#f9f9f7',
        'surface-dim': '#dadad8',
        'surface-container': '#eeeeec',
        'surface-container-high': '#e8e8e6',
        'on-surface': '#1a1c1b',
        'on-surface-variant': '#4b454c',
        'secondary-container': '#efdfda',
        'on-secondary-container': '#6d625e',
        'outline': '#7d747d',
        'outline-variant': '#cec3cc',
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
