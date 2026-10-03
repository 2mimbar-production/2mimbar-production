"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { type Karya, thumbnailDari } from "@/lib/produksi";
import { useSimpan } from "@/lib/useSimpan";
import { Button, kelasTombol } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader, PesanError } from "./ui";
import KaryaForm from "./KaryaForm";

export default function PortofolioBoard({ karya }: { karya: Karya[] }) {
  const [edit, setEdit] = useState<Karya | "baru" | null>(null);
  const { jalankan, loading, error } = useSimpan();
  const terbit = karya.filter((k) => k.terbit).length;

  function toggle(k: Karya, kolom: "terbit" | "unggulan") {
    const supabase = createClient();
    jalankan(() => supabase.from("karya").update({ [kolom]: !k[kolom] }).eq("id", k.id));
  }

  return (
    <>
      <PageHeader
        judul="Portofolio"
        sub={`${terbit} dari ${karya.length} karya tampil di situs publik. Karya bertanda bintang muncul di bagian Pilihan.`}
        aksi={
          <>
            <Link href="/" target="_blank" className={kelasTombol("secondary")}>
              Lihat situs <ArrowUpRight size={15} />
            </Link>
            <Button onClick={() => setEdit("baru")}>
              <Plus size={16} /> Karya baru
            </Button>
          </>
        }
      />
      <PesanError pesan={error} />

      {karya.length === 0 ? (
        <EmptyState message="Belum ada karya. Tambahkan produk media pertama untuk ditampilkan di situs." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {karya.map((k) => {
            const thumb = thumbnailDari(k);
            return (
              <article key={k.id} className="group overflow-hidden rounded-md border border-line bg-white">
                <button onClick={() => setEdit(k)} className="block w-full text-left">
                  <div className="relative aspect-video bg-brand-50">
                    {thumb && (
                      <img src={thumb} alt="" className={`h-full w-full object-cover ${k.terbit ? "" : "opacity-40 grayscale"}`} />
                    )}
                    <span
                      className={`absolute left-2.5 top-2.5 rounded-sm px-1.5 py-0.5 font-mono text-meta uppercase ${
                        k.terbit ? "bg-white text-ink" : "bg-ink text-white"
                      }`}
                    >
                      {k.terbit ? "Tampil" : "Draf"}
                    </span>
                  </div>
                  <div className="px-3.5 pb-3 pt-3">
                    <p className="label-meta">{[k.kategori, k.tahun].filter(Boolean).join("  /  ")}</p>
                    <p className="mt-1 truncate font-medium text-ink group-hover:text-brand">{k.judul}</p>
                    <p className="truncate text-xs text-ink-3">{k.klien ?? "Produksi internal"}</p>
                  </div>
                </button>
                <div className="flex items-center justify-between border-t border-line px-3.5 py-2 text-xs text-ink-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={k.terbit}
                      disabled={loading}
                      onChange={() => toggle(k, "terbit")}
                      className="h-3.5 w-3.5 accent-brand"
                    />
                    Tampilkan di situs
                  </label>
                  <button
                    onClick={() => toggle(k, "unggulan")}
                    disabled={loading}
                    aria-pressed={k.unggulan}
                    className={`flex items-center gap-1 rounded px-1.5 py-1 hover:bg-ink/5 ${k.unggulan ? "text-ink" : "text-ink-3"}`}
                  >
                    <Star size={14} fill={k.unggulan ? "currentColor" : "none"} className={k.unggulan ? "text-signal" : ""} /> Pilihan
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {edit && <KaryaForm awal={edit === "baru" ? undefined : edit} onClose={() => setEdit(null)} />}
    </>
  );
}
