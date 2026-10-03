"use client";

import { useState } from "react";
import { MapPin, Users } from "lucide-react";
import { type Jadwal, STATUS_JADWAL, TAHAP_JADWAL, WARNA_TAHAP, formatTanggal, labelDari } from "@/lib/produksi";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "./ui";
import JadwalForm, { type ProyekOpsi } from "./JadwalForm";

export default function JadwalList({
  jadwal,
  proyek,
  kosong = "Belum ada jadwal.",
  tampilkanProyek = true,
}: {
  jadwal: Jadwal[];
  proyek: ProyekOpsi[];
  kosong?: string;
  tampilkanProyek?: boolean;
}) {
  const [edit, setEdit] = useState<Jadwal | null>(null);
  const namaProyek = new Map(proyek.map((p) => [p.id, p.nama]));

  if (jadwal.length === 0) return <EmptyState message={kosong} />;

  return (
    <>
      <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white">
        {jadwal.map((j) => (
          <li key={j.id}>
            <button onClick={() => setEdit(j)} className="flex w-full gap-4 px-4 py-3.5 text-left transition-colors hover:bg-paper">
              <div className="w-11 shrink-0 text-center">
                <p className="font-display text-[1.75rem] leading-none text-ink">
                  {formatTanggal(j.tanggal, { day: "numeric", month: undefined, year: undefined })}
                </p>
                <p className="label-meta mt-1">
                  {formatTanggal(j.tanggal, { day: undefined, month: "short", year: undefined, weekday: undefined })}
                </p>
              </div>
              <span className={`w-[3px] shrink-0 self-stretch ${WARNA_TAHAP[j.tahap]}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className={`font-medium text-ink ${j.status === "selesai" ? "text-ink-3 line-through" : ""}`}>
                    {j.judul}
                  </p>
                  <Badge nilai={j.status} label={labelDari(STATUS_JADWAL, j.status)} />
                </div>
                <p className="mt-0.5 text-xs text-ink-3">
                  <span className="font-mono">{formatTanggal(j.tanggal, { day: undefined, month: undefined, year: undefined, weekday: "long" })}</span>
                  {" · "}
                  {labelDari(TAHAP_JADWAL, j.tahap)}
                  {j.jam ? ` · ${j.jam}` : ""}
                  {j.tanggal_akhir && j.tanggal_akhir !== j.tanggal ? ` · s.d. ${formatTanggal(j.tanggal_akhir)}` : ""}
                  {tampilkanProyek && j.proyek_id && namaProyek.has(j.proyek_id) ? ` · ${namaProyek.get(j.proyek_id)}` : ""}
                </p>
                {(j.lokasi || j.kru) && (
                  <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-3">
                    {j.lokasi && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} /> {j.lokasi}
                      </span>
                    )}
                    {j.kru && (
                      <span className="inline-flex items-center gap-1">
                        <Users size={12} /> {j.kru}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
      {edit && <JadwalForm awal={edit} proyek={proyek} onClose={() => setEdit(null)} />}
    </>
  );
}

