import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

// Satu keluarga untuk judul dan isi: Archivo variabel dengan sumbu lebar
// (wdth). Judul memakai versi condensed (lihat .font-display), isi memakai
// lebar normal.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
});
// Metadata: tanggal, nomor episode, status.
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Duamimbar Produksi",
  description: "Portofolio karya media Divisi Produksi Duamimbar.",
};

export const viewport: Viewport = {
  themeColor: "#101A4F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${archivo.variable} ${mono.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
