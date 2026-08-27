/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        ink: '#172126',
        moss: '#17312c',
        coral: '#e85d3f',
        paper: '#f6f8f4',
        teal: '#167d78',
      },
      boxShadow: { panel: '0 14px 40px rgba(23,49,44,.08)' },
    },
  },
  plugins: [],
}
