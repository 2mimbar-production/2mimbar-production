"use client";

import { useMemo, useState } from "react";
import type { Karya } from "@/lib/produksi";
import KaryaCard from "./KaryaCard";

export default function KaryaGallery({ karya }: { karya: Karya[] }) {
  const kategori = useMemo(() => Array.from(new Set(karya.map((k) => k.kategori))), [karya]);
  const [aktif, setAktif] = useState<string | null>(null);
  const tampil = aktif ? karya.filter((k) => k.kategori === aktif) : karya;

  return (
    <div>
      {kategori.length > 1 && (
        <div className="mb-10 flex gap-6 overflow-x-auto border-b border-line" role="tablist">
          {[null, ...kategori].map((k) => {
            const on = aktif === k;
            const jumlah = k ? karya.filter((x) => x.kategori === k).length : karya.length;
            return (
              <button
                key={k ?? "semua"}
                role="tab"
                aria-selected={on}
                onClick={() => setAktif(k)}
                className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 pb-3 text-sm transition-colors ${
                  on ? "border-brand font-medium text-ink" : "border-transparent text-ink-3 hover:text-ink"
                }`}
              >
                {k ?? "Semua"}
                <span className={`font-mono text-xs ${on ? "text-brand" : "text-ink-4"}`}>{jumlah}</span>
              </button>
            );
          })}
        </div>
      )}
      <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {tampil.map((k) => (
          <KaryaCard key={k.id} karya={k} />
        ))}
      </div>
    </div>
  );
}
