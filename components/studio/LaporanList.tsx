"use client";

import { useState } from "react";
import { ExternalLink, Pencil } from "lucide-react";
import { type Laporan, STATUS_EPISODE, formatTanggal, judulEpisode, labelDari } from "@/lib/produksi";
import { EmptyState } from "@/components/ui/EmptyState";
import LaporanForm from "./LaporanForm";
import type { ProyekOpsi } from "./JadwalForm";
import { Badge } from "./ui";

/** "https://www.youtube.com/watch?v=..." -> "youtube.com", supaya kolom tidak melebar. */
function domain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Nomor episode (mono, abu) lalu judul. Data lama tanpa judul tetap tampil. */
function Judul({ l }: { l: Laporan }) {
  if (!l.judul) return <>{judulEpisode(l)}</>;
  return (
    <>
      {l.episode && <span className="mr-2 font-mono text-xs font-normal text-ink-3">{l.episode}</span>}
      {l.judul}
    </>
  );
}

function Bukti({ l }: { l: Laporan }) {
  if (!l.link_tayang && !l.bukti_url) return <span className="whitespace-nowrap font-mono text-xs text-ink-4">Belum ada bukti</span>;
  return (
    <div className="flex items-center gap-2">
      {l.bukti_url && (
        <a href={l.bukti_url} target="_blank" rel="noreferrer" className="shrink-0">
          <img src={l.bukti_url} alt="Screenshot bukti tayang" className="h-9 w-14 rounded-sm border border-line object-cover" />
        </a>
      )}
      {l.link_tayang && (
        <a
          href={l.link_tayang}
          title={l.link_tayang}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 items-center gap-1 font-mono text-xs text-brand hover:underline"
        >
          <ExternalLink size={12} className="shrink-0 print:hidden" />
          <span className="truncate print:hidden">{domain(l.link_tayang)}</span>
          <span className="hidden break-all print:inline">{l.link_tayang}</span>
        </a>
      )}
    </div>
  );
}

export default function LaporanList({
  laporan,
  proyek,
  kosong = "Belum ada episode yang dicatat.",
  tampilkanProyek = true,
}: {
  laporan: Laporan[];
  proyek: ProyekOpsi[];
  kosong?: string;
  tampilkanProyek?: boolean;
}) {
  const [edit, setEdit] = useState<Laporan | null>(null);
  const namaProyek = new Map(proyek.map((p) => [p.id, p.nama]));
  const program = (l: Laporan) => (l.proyek_id && namaProyek.get(l.proyek_id)) || "Umum";

  if (laporan.length === 0) return <EmptyState message={kosong} />;

  return (
    <>
      {/* HP: kartu */}
      <div className="space-y-3 sm:hidden print:hidden">
        {laporan.map((l) => (
          <article key={l.id} className="relative space-y-2 rounded-md border border-line bg-white p-4">
            <button
              onClick={() => setEdit(l)}
              className="absolute right-2.5 top-2.5 rounded p-1.5 text-ink-3 hover:bg-ink/5 hover:text-ink"
              aria-label="Ubah episode"
            >
              <Pencil size={14} />
            </button>
            {tampilkanProyek && (
              <p className="label-meta pr-8">{program(l)}</p>
            )}
            <p className="pr-8 font-medium text-ink"><Judul l={l} /></p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
              <Badge nilai={l.status} label={labelDari(STATUS_EPISODE, l.status)} />
              <span className="font-mono">{formatTanggal(l.tanggal)}</span>
              {l.platform && <span>· {l.platform}</span>}
            </div>
            <Bukti l={l} />
            {l.catatan && <p className="whitespace-pre-line text-sm text-ink-2">{l.catatan}</p>}
          </article>
        ))}
      </div>

      {/* iPad, desktop, dan cetak: tabel */}
      <div className="hidden overflow-x-auto rounded-md border border-line bg-white sm:block print:block print:rounded-none print:border-0">
        <table className="cetak-tabel w-full text-left text-sm">
          <thead className="label-meta border-b border-line bg-paper print:bg-transparent">
            <tr>
              <th className="px-3 py-2.5 font-normal first:pl-4 print:px-1.5">Tanggal</th>
              {tampilkanProyek && <th className="px-3 py-2.5 font-normal first:pl-4 print:px-1.5">Program</th>}
              <th className="px-3 py-2.5 font-normal first:pl-4 print:px-1.5">Episode</th>
              <th className="px-3 py-2.5 font-normal first:pl-4 print:px-1.5">Platform</th>
              <th className="px-3 py-2.5 font-normal first:pl-4 print:px-1.5">Status</th>
              <th className="px-3 py-2.5 font-normal first:pl-4 print:px-1.5">Bukti tayang</th>
              <th className="w-10 print:hidden" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {laporan.map((l) => (
              <tr key={l.id} className="break-inside-avoid align-top">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink-3 print:px-1.5">
                  {formatTanggal(l.tanggal)}
                </td>
                {tampilkanProyek && <td className="px-3 py-3 text-ink-2 print:px-1.5">{program(l)}</td>}
                <td className="min-w-[12rem] px-3 py-3 print:min-w-0 print:px-1.5">
                  <p className="font-medium text-ink"><Judul l={l} /></p>
                  {l.catatan && <p className="mt-0.5 whitespace-pre-line text-xs text-ink-3">{l.catatan}</p>}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-ink-2 print:px-1.5">{l.platform ?? "-"}</td>
                <td className="px-3 py-3 print:px-1.5">
                  <Badge nilai={l.status} label={labelDari(STATUS_EPISODE, l.status)} />
                </td>
                <td className="px-3 py-3 print:px-1.5">
                  <Bukti l={l} />
                </td>
                <td className="px-2 py-3 print:hidden">
                  <button
                    onClick={() => setEdit(l)}
                    className="rounded p-1.5 text-ink-3 hover:bg-ink/5 hover:text-ink"
                    aria-label="Ubah episode"
                  >
                    <Pencil size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && <LaporanForm awal={edit} proyek={proyek} onClose={() => setEdit(null)} />}
    </>
  );
}
