"use client";

import { useRouter } from "next/navigation";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/FormField";
import type { ProyekOpsi } from "./JadwalForm";

function selCsv(v: string) {
  return /[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export default function FilterLaporan({
  bulan,
  proyekId,
  proyek,
  namaFile,
  baris,
}: {
  bulan: string;
  proyekId: string;
  proyek: ProyekOpsi[];
  /** Nama file unduhan tanpa ekstensi, mis. "Laporan Produksi Oktober 2026". */
  namaFile: string;
  /** Isi CSV: baris pertama header. */
  baris: string[][];
}) {
  const router = useRouter();

  function ke(b: string, p: string) {
    const q = new URLSearchParams();
    if (b) q.set("bulan", b);
    if (p) q.set("proyek", p);
    router.push(`/studio/laporan?${q}`);
  }

  function unduhPdf() {
    // Judul dokumen dipakai browser sebagai nama file PDF.
    const lama = document.title;
    document.title = namaFile;
    window.print();
    document.title = lama;
  }

  function unduhCsv() {
    const isi = baris.map((r) => r.map(selCsv).join(",")).join("\r\n");
    // BOM supaya Excel membaca huruf non-ASCII dengan benar.
    const blob = new Blob(["﻿" + isi], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${namaFile}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 print:hidden">
      <Input type="month" value={bulan} onChange={(e) => ke(e.target.value, proyekId)} className="!w-auto h-9 py-0" aria-label="Bulan" />
      <Select value={proyekId} onChange={(e) => ke(bulan, e.target.value)} className="!w-auto h-9 max-w-[16rem] py-0" aria-label="Program">
        <option value="">Semua program</option>
        {proyek.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nama}
          </option>
        ))}
      </Select>
      <div className="ml-auto flex gap-2">
        <Button variant="secondary" onClick={unduhCsv} disabled={baris.length < 2}>
          <FileSpreadsheet size={15} /> Excel (CSV)
        </Button>
        <Button variant="secondary" onClick={unduhPdf}>
          <FileText size={15} /> PDF
        </Button>
      </div>
    </div>
  );
}
