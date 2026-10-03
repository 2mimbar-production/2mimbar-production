import Link from "next/link";
import { Play } from "lucide-react";
import { type Karya, thumbnailDari } from "@/lib/produksi";

export default function KaryaCard({ karya, besar = false }: { karya: Karya; besar?: boolean }) {
  const thumb = thumbnailDari(karya);
  return (
    <Link href={`/karya/${karya.slug}`} className="group block">
      <div className={`relative overflow-hidden rounded-sm bg-brand-900 ${besar ? "aspect-[16/10]" : "aspect-video"}`}>
        {thumb ? (
          <img
            src={thumb}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] group-hover:opacity-90"
          />
        ) : (
          <div className="font-display flex h-full items-center justify-center text-6xl text-white/20">
            {karya.judul.slice(0, 1)}
          </div>
        )}
        {karya.video_url && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-sm bg-white px-2 py-1 font-mono text-meta uppercase text-ink">
            <Play size={10} fill="currentColor" /> Video
          </span>
        )}
      </div>
      <p className="label-meta mt-4">{[karya.kategori, karya.tahun].filter(Boolean).join("  /  ")}</p>
      <h3
        className={`font-display mt-1.5 leading-tight text-ink transition-colors group-hover:text-brand ${
          besar ? "text-3xl sm:text-4xl" : "text-2xl"
        }`}
      >
        {karya.judul}
      </h3>
      {besar && karya.ringkasan ? (
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-2">{karya.ringkasan}</p>
      ) : (
        karya.klien && <p className="mt-1 text-sm text-ink-3">{karya.klien}</p>
      )}
    </Link>
  );
}
