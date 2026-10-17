/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ms: {
          blue: {
            DEFAULT: '#0067b8',
            hover: '#005da6',
            light: '#e6f2fb',
            active: '#004e8c',
            fluent: '#0078d4'
          },
          dark: '#111827',
          gray: {
            25: '#faf9f8',
            50: '#f3f2f1',
            100: '#edebe9',
            200: '#e1dfdd',
            300: '#d2d0ce',
            400: '#a19f9d',
            500: '#797775',
            600: '#605e5c',
            700: '#484644',
            800: '#323130',
            900: '#201f1e',
            950: '#1b1a19'
          },
          green: {
            DEFAULT: '#107c10',
            light: '#dff6dd',
            dark: '#0e690e'
          },
          amber: {
            DEFAULT: '#d83b01',
            light: '#fed9cc'
          },
          yellow: {
            DEFAULT: '#797673',
            light: '#fff4ce'
          }
        }
      },
      fontFamily: {
        segoe: ['"Segoe UI"', '"Segoe UI Variable Text"', '-apple-system', 'BlinkMacSystemFont', 'Roboto', '"Helvetica Neue"', 'sans-serif'],
      },
      boxShadow: {
        'ms-card': '0 1.6px 3.6px 0 rgba(0,0,0,0.132), 0 0.3px 0.9px 0 rgba(0,0,0,0.108)',
        'ms-elevated': '0 6.4px 14.4px 0 rgba(0,0,0,0.132), 0 1.2px 3.6px 0 rgba(0,0,0,0.108)',
        'ms-dropdown': '0 12.8px 28.8px 0 rgba(0,0,0,0.22), 0 2.4px 7.2px 0 rgba(0,0,0,0.18)',
      }
    },
  },
  plugins: [],
}
