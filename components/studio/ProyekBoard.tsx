"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { type Proyek, PROYEK_AKTIF, STATUS_PROYEK, formatTanggal, hariIni, labelDari } from "@/lib/produksi";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge, PageHeader, Tabs } from "./ui";
import ProyekForm from "./ProyekForm";

const FILTER = [
  { key: "aktif", label: "Berjalan", cocok: (p: Proyek) => PROYEK_AKTIF.includes(p.status) },
  { key: "ide", label: "Ide", cocok: (p: Proyek) => p.status === "ide" },
  { key: "selesai", label: "Selesai", cocok: (p: Proyek) => p.status === "selesai" },
  { key: "semua", label: "Semua", cocok: () => true },
];

export default function ProyekBoard({ proyek }: { proyek: Proyek[] }) {
  const [filter, setFilter] = useState("aktif");
  const [formBuka, setFormBuka] = useState(false);
  const f = FILTER.find((x) => x.key === filter)!;
  const tampil = proyek.filter(f.cocok);
  const today = hariIni();

  return (
    <>
      <PageHeader
        judul="Program"
        sub="Program dan IP yang diproduksi, dari ide sampai selesai."
        aksi={
          <Button onClick={() => setFormBuka(true)}>
            <Plus size={16} /> Program baru
          </Button>
        }
      />

      <Tabs
        item={FILTER.map((x) => ({ key: x.key, label: x.label, jumlah: proyek.filter(x.cocok).length }))}
        aktif={filter}
        onPilih={setFilter}
      />

      {tampil.length === 0 ? (
        <EmptyState message="Belum ada program di kelompok ini." />
      ) : (
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <div className="label-meta hidden grid-cols-[1fr_11rem_8.5rem] gap-4 border-b border-line bg-paper px-4 py-2 sm:grid">
            <span>Program</span>
            <span>Tenggat</span>
            <span>Status</span>
          </div>
          <ul className="divide-y divide-line">
            {tampil.map((p) => {
              const telat = Boolean(p.tenggat && p.tenggat < today && PROYEK_AKTIF.includes(p.status));
              const kanal = Array.from(new Set((p.kanal ?? []).map((k) => k.platform))).join(", ");
              return (
                <li key={p.id}>
                  <Link
                    href={`/studio/proyek/${p.id}`}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3.5 transition-colors hover:bg-paper sm:grid-cols-[1fr_11rem_8.5rem]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{p.nama}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-3">
                        {[p.jenis, kanal].filter(Boolean).join("  ·  ") || "Belum ada format dan kanal"}
                      </p>
                    </div>
                    <p className={`order-3 col-span-2 font-mono text-xs sm:order-none sm:col-span-1 ${telat ? "text-signal" : "text-ink-3"}`}>
                      {p.status === "selesai"
                        ? `Selesai ${formatTanggal(p.tanggal_selesai)}`
                        : p.tenggat
                          ? `${telat ? "Lewat " : ""}${formatTanggal(p.tenggat)}`
                          : "-"}
                    </p>
                    <Badge nilai={p.status} label={labelDari(STATUS_PROYEK, p.status)} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {formBuka && <ProyekForm onClose={() => setFormBuka(false)} />}
    </>
  );
}
