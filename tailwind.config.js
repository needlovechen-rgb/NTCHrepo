/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        stage: {
          900: '#0b0f19',
          800: '#111827',
          700: '#1f2937',
          600: '#374151',
          500: '#4b5563',
          accent: '#38bdf8',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      }
    },
  },
  plugins: [],
};
