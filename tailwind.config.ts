import type { Config } from "tailwindcss";

// Dizayn tokenlari: "ustaxona stoli" — sovuq grafit fon, amber quvvat LED'i, firuza "mos", qizil "xato"
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bench: "#161B26",   // asosiy fon
        panel: "#1E2533",   // kartalar, panellar
        rail: "#2A3345",    // chegaralar
        steel: "#8A94A8",   // ikkinchi darajali matn
        ink: "#E7EAF1",     // asosiy matn
        amber: { DEFAULT: "#F2A93B", soft: "#F2A93B22" },  // asosiy urg'u, tugmalar
        ok: "#42C6B8",
        bad: "#F0596B",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: { chip: "6px", card: "14px" },
      maxWidth: { page: "1240px" },
    },
  },
  plugins: [],
} satisfies Config;
