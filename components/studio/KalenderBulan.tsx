"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Jadwal, TAHAP_JADWAL, WARNA_TAHAP, hariIni, tambahHari } from "@/lib/produksi";
import JadwalForm, { type ProyekOpsi } from "./JadwalForm";

const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function geserBulan(bulan: string, n: number) {
  const [y, m] = bulan.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

export default function KalenderBulan({
  bulan,
  jadwal,
  proyek,
}: {
  bulan: string; // YYYY-MM
  jadwal: Jadwal[];
  proyek: ProyekOpsi[];
}) {
  const [edit, setEdit] = useState<Jadwal | null>(null);
  const [baru, setBaru] = useState<string | null>(null);
  const today = hariIni();

  const awal = `${bulan}-01`;
  const offset = (new Date(`${awal}T00:00:00Z`).getUTCDay() + 6) % 7; // Senin = 0
  const mulaiGrid = tambahHari(awal, -offset);
  const jumlahHari = new Date(Date.UTC(Number(bulan.slice(0, 4)), Number(bulan.slice(5, 7)), 0)).getUTCDate();
  const jumlahSel = Math.ceil((offset + jumlahHari) / 7) * 7;
  const sel = Array.from({ length: jumlahSel }, (_, i) => tambahHari(mulaiGrid, i));

  const perHari = (tgl: string) =>
    jadwal.filter((j) => j.tanggal <= tgl && (j.tanggal_akhir ?? j.tanggal) >= tgl);

  const judulBulan = new Date(`${awal}T00:00:00Z`).toLocaleDateString("id-ID", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="overflow-hidden rounded-md border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-display text-2xl capitalize text-ink">{judulBulan}</h2>
        <div className="flex items-center rounded border border-line-strong">
          <Link href={`/studio/jadwal?bulan=${geserBulan(bulan, -1)}`} className="p-1.5 text-ink-2 hover:bg-paper" aria-label="Bulan sebelumnya">
            <ChevronLeft size={18} />
          </Link>
          <Link href="/studio/jadwal" className="border-x border-line-strong px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper">
            Hari ini
          </Link>
          <Link href={`/studio/jadwal?bulan=${geserBulan(bulan, 1)}`} className="p-1.5 text-ink-2 hover:bg-paper" aria-label="Bulan berikutnya">
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-line bg-paper text-center">
        {HARI.map((h) => (
          <div key={h} className="label-meta py-2">
            {h}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {sel.map((tgl, i) => {
          const items = perHari(tgl);
          const diLuar = !tgl.startsWith(bulan);
          return (
            <div
              key={tgl}
              onClick={() => setBaru(tgl)}
              className={`min-h-[76px] cursor-pointer border-line p-1 transition-colors hover:bg-brand-50 sm:min-h-[108px] sm:p-1.5 ${
                i % 7 !== 6 ? "border-r" : ""
              } ${i < jumlahSel - 7 ? "border-b" : ""} ${diLuar ? "bg-paper/70" : ""}`}
            >
              <p
                className={`mb-1 flex h-6 min-w-6 items-center justify-center rounded-sm px-1 font-mono text-xs ${
                  tgl === today ? "bg-brand font-medium text-white" : diLuar ? "text-ink-4" : "text-ink-2"
                }`}
              >
                {Number(tgl.slice(8))}
              </p>
              <div className="space-y-0.5">
                {items.slice(0, 3).map((j) => (
                  <button
                    key={j.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEdit(j);
                    }}
                    title={j.judul}
                    className={`block w-full truncate rounded-sm px-1.5 py-0.5 text-left text-[10px] font-medium leading-tight text-white sm:text-[11px] ${
                      WARNA_TAHAP[j.tahap]
                    } ${j.status === "selesai" ? "opacity-50" : ""}`}
                  >
                    {j.judul}
                  </button>
                ))}
                {items.length > 3 && <p className="px-1 font-mono text-[10px] text-ink-3">+{items.length - 3} lagi</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-line px-4 py-3 text-xs text-ink-2">
        {TAHAP_JADWAL.map((t) => (
          <span key={t.value} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-sm ${WARNA_TAHAP[t.value]}`} /> {t.label}
          </span>
        ))}
      </div>

      {edit && <JadwalForm awal={edit} proyek={proyek} onClose={() => setEdit(null)} />}
      {baru && <JadwalForm proyek={proyek} bawaan={{ tanggal: baru }} onClose={() => setBaru(null)} />}
    </div>
  );
}
