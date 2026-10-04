export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0b1a27",
          navy: "#183B4E",
          "navy-dark": "#07131e",
          "navy-card": "rgba(13, 27, 42, 0.65)",
          blue: "#27548A",
          "blue-700": "#1f4777",
          "blue-persib": "#0e74f1",
          gold: "#DDA853",
          "gold-light": "#f5c563",
          "gold-old": "#906d35",
          text: "#f1f5f9",
          "text-dark": "#152a3b",
          "text-light": "#f8fafc",
          muted: "#94a3b8",
          surface: "rgba(13, 27, 42, 0.65)",
          "surface-2": "rgba(255, 255, 255, 0.05)",
          "surface-3": "rgba(16, 32, 50, 0.70)",
          border: "rgba(255, 255, 255, 0.12)",
          "border-strong": "rgba(255, 255, 255, 0.28)",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        glass: "0 10px 30px 0 rgba(0, 0, 0, 0.35)",
        "glass-lg": "0 20px 45px -10px rgba(0, 0, 0, 0.45)",
        "glass-gold": "0 8px 32px 0 rgba(221, 168, 83, 0.25)",
      },
      maxWidth: {
        container: "1160px",
      },
    },
  },
  plugins: [],
}
