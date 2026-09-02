/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0284c7',
          600: '#0284c7',
          900: '#0c4a6e',
          emerald: '#10b981',
          cyan: '#06b6d4',
          slateDark: '#0b0f19',
          cardDark: '#111827',
        },
      },
    },
  },
  plugins: [],
};
