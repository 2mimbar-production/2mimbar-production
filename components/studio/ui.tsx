"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

/*
 * Komponen dasar Studio. Hierarki per halaman selalu sama:
 *   PageHeader (judul halaman, aksi utama)
 *   Readout    (angka kunci, opsional)
 *   Section    (judul bagian + isi dalam Panel)
 * Judul halaman dan judul bagian sama-sama font-display, dibedakan ukuran.
 * Warna merek hanya untuk aksi dan status aktif, bukan untuk teks judul.
 */

export function PageHeader({
  kicker,
  judul,
  sub,
  aksi,
}: {
  kicker?: string;
  judul: string;
  sub?: string;
  aksi?: React.ReactNode;
}) {
  return (
    <header className="mb-8 border-b border-line pb-5 print:mb-4">
      {kicker && <p className="label-meta mb-2">{kicker}</p>}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="font-display text-[2.25rem] leading-[1.05] text-ink sm:text-[2.75rem]">{judul}</h1>
          {sub && <p className="mt-2 max-w-2xl text-sm text-ink-3">{sub}</p>}
        </div>
        {aksi && <div className="flex flex-wrap gap-2 print:hidden">{aksi}</div>}
      </div>
    </header>
  );
}

export function Section({
  judul,
  jumlah,
  aksi,
  className = "",
  children,
}: {
  judul: string;
  jumlah?: number;
  aksi?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={className}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl text-ink">
          {judul}
          {jumlah != null && <span className="ml-2 font-mono text-sm font-normal text-ink-4">{jumlah}</span>}
        </h2>
        {aksi && <div className="flex items-center gap-2 print:hidden">{aksi}</div>}
      </div>
      {children}
    </section>
  );
}

/** Tautan kecil di kanan judul bagian, mis. "Kalender →". */
export function TautanBagian({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-800">
      {children}
      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/** Tab bergaris bawah untuk menyaring isi satu halaman. */
export function Tabs<T extends string>({
  item,
  aktif,
  onPilih,
}: {
  item: { key: T; label: string; jumlah?: number }[];
  aktif: T;
  onPilih: (k: T) => void;
}) {
  return (
    <div className="mb-5 flex gap-5 overflow-x-auto border-b border-line" role="tablist">
      {item.map((x) => {
        const on = x.key === aktif;
        return (
          <button
            key={x.key}
            role="tab"
            aria-selected={on}
            onClick={() => onPilih(x.key)}
            className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 pb-2.5 pt-1 text-sm transition-colors ${
              on ? "border-brand font-medium text-ink" : "border-transparent text-ink-3 hover:text-ink"
            }`}
          >
            {x.label}
            {x.jumlah != null && <span className={`font-mono text-xs ${on ? "text-brand" : "text-ink-4"}`}>{x.jumlah}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Panel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`overflow-hidden rounded-md border border-line bg-white ${className}`}>{children}</div>;
}

/** Deretan angka kunci dalam satu panel, dipisah garis tipis. */
export function Readout({
  item,
}: {
  item: { n: number | string; label: string; href?: string; peringatan?: boolean }[];
}) {
  const kolom = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4", 5: "sm:grid-cols-5" }[item.length] ?? "sm:grid-cols-4";
  return (
    <div
      className={`grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line max-sm:[&>*:last-child:nth-child(odd)]:col-span-2 ${kolom}`}
    >
      {item.map((a) => {
        const isi = (
          <>
            <p className={`font-display text-[2rem] leading-none sm:text-[2.5rem] ${a.peringatan ? "text-signal" : "text-ink"}`}>{a.n}</p>
            <p className="label-meta mt-2.5">{a.label}</p>
          </>
        );
        return a.href ? (
          <Link key={a.label} href={a.href} className="bg-white p-4 transition-colors hover:bg-brand-50 print:p-2">
            {isi}
          </Link>
        ) : (
          <div key={a.label} className="bg-white p-4 print:p-2">
            {isi}
          </div>
        );
      })}
    </div>
  );
}

export function Modal({
  judul,
  onClose,
  children,
}: {
  judul: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-[2px] sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={judul}
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-lg bg-white shadow-2xl sm:max-w-lg sm:rounded-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="font-display text-xl text-ink">{judul}</h2>
          <button onClick={onClose} className="-mr-1.5 rounded p-1.5 text-ink-3 hover:bg-ink/5 hover:text-ink" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function Label({ teks, children, className = "" }: { teks: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="label-meta mb-1.5 block">{teks}</span>
      {children}
    </label>
  );
}

/** Warna titik status. Satu tempat untuk status program, jadwal, dan episode. */
const TITIK: Record<string, string> = {
  ide: "bg-ink-4",
  praproduksi: "bg-amber-500",
  produksi: "bg-brand",
  pascaproduksi: "bg-violet-500",
  selesai: "bg-emerald-600",
  batal: "bg-ink-4",
  terjadwal: "bg-brand",
  berjalan: "bg-amber-500",
  ditunda: "bg-signal",
  dikerjakan: "bg-amber-500",
  tayang: "bg-signal",
};

export function Badge({ nilai, label }: { nilai: string; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium ${
        nilai === "batal" ? "text-ink-4 line-through" : "text-ink-2"
      }`}
    >
      <span
        className={`h-2 w-2 shrink-0 ${nilai === "tayang" ? "rounded-full ring-2 ring-signal/20" : "rounded-sm"} ${
          TITIK[nilai] ?? "bg-ink-4"
        }`}
      />
      {label ?? nilai}
    </span>
  );
}

export function PesanError({ pesan }: { pesan: string | null }) {
  if (!pesan) return null;
  return <p className="rounded border-l-2 border-signal bg-signal/5 px-3 py-2 text-sm text-signal">{pesan}</p>;
}
