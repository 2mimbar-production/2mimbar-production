import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Isi lewat env var NEXT_PUBLIC_KONTAK_EMAIL & NEXT_PUBLIC_KONTAK_WA (nomor
// format 62xxx). Kalau kosong, barisnya tidak ditampilkan.
const EMAIL = process.env.NEXT_PUBLIC_KONTAK_EMAIL;
const WA = process.env.NEXT_PUBLIC_KONTAK_WA;

export default function SiteFooter() {
  return (
    <footer id="kontak" className="mt-28 bg-brand-900 text-white">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-10 sm:pt-24">
        <p className="font-mono text-meta uppercase text-white/60">Kerja sama produksi</p>
        <p className="font-display mt-4 max-w-4xl text-[2.75rem] leading-[0.95] sm:text-[4.5rem]">
          Punya cerita yang perlu diproduksi?
        </p>
        <p className="mt-6 max-w-xl text-white/70">
          Divisi Produksi Duamimbar mengerjakan video, dokumenter, iklan, podcast, dan konten media sosial, dari ide
          sampai tayang di kanal Anda.
        </p>
        {(EMAIL || WA) && (
          <div className="mt-10 flex flex-wrap gap-3">
            {WA && (
              <a
                href={`https://wa.me/${WA}`}
                className="inline-flex h-11 items-center gap-2 rounded bg-white px-5 font-medium text-brand-900 hover:bg-brand-50"
              >
                WhatsApp <ArrowUpRight size={16} />
              </a>
            )}
            {EMAIL && (
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex h-11 items-center gap-2 rounded border border-white/35 px-5 font-medium hover:border-white"
              >
                {EMAIL}
              </a>
            )}
          </div>
        )}
        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 font-mono text-xs text-white/50">
          <span className="flex items-center gap-3">
            <img src="/logo-white.png" alt="" className="h-5 w-auto opacity-70" />© {new Date().getFullYear()} Duamimbar
          </span>
          <Link href="/studio" className="hover:text-white">
            Masuk Studio
          </Link>
        </div>
      </div>
    </footer>
  );
}
