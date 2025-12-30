/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#0d59f2",
        "background-light": "#f5f6f8",
        "background-dark": "#101622", // Updated for Monitoring Page
        "card-dark": "#161b26",
        "border-dark": "#232936",
        "surface-dark": "#1e232e", // Updated for Monitoring Page
        "surface-dark-lighter": "#282e39", // New for Monitoring Page
        "surface-darker": "#111827",
        "success": "#10b981",
        "warning": "#f59e0b",
        "danger": "#ef4444",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
        "sans": ["Inter", "sans-serif"],
        "mono": ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
      borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.6) 100%)',
      },
    },
  },
  plugins: [],
}
