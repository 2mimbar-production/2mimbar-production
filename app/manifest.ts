import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Duamimbar Studio Produksi",
    short_name: "Duamimbar",
    description: "Laporan, proyek, dan jadwal Divisi Produksi Duamimbar.",
    start_url: "/studio",
    display: "standalone",
    background_color: "#F4F2ED",
    theme_color: "#101A4F",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
