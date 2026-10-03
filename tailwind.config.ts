import type { Config } from "tailwindcss";

/**
 * Sistem desain Duamimbar Produksi.
 *
 * Bahasa visualnya diturunkan dari logo: bidang datar bersudut tegas, satu
 * warna merek (denim logo), dan huruf condensed yang terasa seperti papan
 * slate produksi. Lengkungan besar hanya dipakai sebagai aksen, bukan di
 * setiap kotak.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    // Radius sengaja kecil. Kotak membulat besar adalah ciri template generik.
    borderRadius: {
      none: "0",
      sm: "2px",
      DEFAULT: "3px",
      md: "4px",
      lg: "6px",
      full: "9999px",
    },
    extend: {
      colors: {
        // Denim dari logo (#1A2E95) dan turunannya.
        brand: {
          50: "#EEF0F9",
          100: "#DCE0F2",
          300: "#8F9AD4",
          500: "#3247B8",
          DEFAULT: "#1A2E95",
          700: "#1A2E95",
          800: "#15246F",
          900: "#101A4F",
        },
        // Tinta: teks utama dan bidang gelap (sidebar, footer).
        ink: {
          DEFAULT: "#0E1433",
          2: "#3D4361",
          3: "#6E7389",
          4: "#9A9EB0",
        },
        // Kertas: latar halaman, sedikit hangat supaya tidak terasa klinis.
        paper: "#F4F2ED",
        line: {
          DEFAULT: "#E3E0D8",
          strong: "#CBC7BB",
        },
        // Merah "on air": hanya untuk episode tayang dan aksi hapus.
        signal: "#E0352B",
      },
      fontFamily: {
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
        sans: ["var(--font-archivo)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Label metadata (mono, huruf besar): tanggal, status, kolom tabel.
        meta: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.03em" }],
      },
    },
  },
  plugins: [],
};
export default config;
