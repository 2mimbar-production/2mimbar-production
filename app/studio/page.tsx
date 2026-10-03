import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  type Jadwal,
  type Laporan,
  type Proyek,
  PROYEK_AKTIF,
  STATUS_PROYEK,
  formatTanggal,
  hariIni,
  labelDari,
  tambahHari,
} from "@/lib/produksi";
import JadwalList from "@/components/studio/JadwalList";
import LaporanList from "@/components/studio/LaporanList";
import TombolTambah from "@/components/studio/TombolTambah";
import { Badge, PageHeader, Panel, Readout, Section, TautanBagian } from "@/components/studio/ui";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function StudioHome() {
  const today = hariIni();
  const supabase = createClient();

  const [{ data: proyek }, { data: jadwal }, { data: laporan }, { count: laporanBulanIni }, { count: karyaTerbit }] =
    await Promise.all([
      supabase.from("proyek").select("*").order("tenggat", { ascending: true, nullsFirst: false }),
      supabase
        .from("jadwal")
        .select("*")
        .neq("status", "selesai")
        .gte("tanggal", today)
        .lte("tanggal", tambahHari(today, 7))
        .order("tanggal"),
      supabase.from("laporan").select("*").order("tanggal", { ascending: false }).order("created_at", { ascending: false }).limit(3),
      supabase
        .from("laporan")
        .select("id", { count: "exact", head: true })
        .eq("status", "tayang")
        .gte("tanggal", `${today.slice(0, 7)}-01`),
      supabase.from("karya").select("id", { count: "exact", head: true }).eq("terbit", true),
    ]);

  const semua = (proyek ?? []) as Proyek[];
  const aktif = semua.filter((p) => PROYEK_AKTIF.includes(p.status));
  const telat = aktif.filter((p) => p.tenggat && p.tenggat < today);
  const opsi = semua.map((p) => ({ id: p.id, nama: p.nama, status: p.status, kanal: p.kanal }));

  const angka = [
    { n: aktif.length, label: "Program berjalan", href: "/studio/proyek" },
    { n: telat.length, label: "Lewat tenggat", href: "/studio/proyek", peringatan: telat.length > 0 },
    { n: (jadwal ?? []).length, label: "Jadwal 7 hari", href: "/studio/jadwal" },
    { n: laporanBulanIni ?? 0, label: "Tayang bulan ini", href: "/studio/laporan" },
    { n: karyaTerbit ?? 0, label: "Karya di situs", href: "/studio/portofolio" },
  ];

  return (
    <>
      <PageHeader
        kicker={formatTanggal(today, { weekday: "long", month: "long" })}
        judul="Ringkasan"
        aksi={
          <>
            <TombolTambah jenis="jadwal" label="Jadwal" variant="secondary" proyek={opsi} />
            <TombolTambah jenis="laporan" label="Catat episode" proyek={opsi} />
          </>
        }
      />

      <Readout item={angka} />

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <Section judul="Minggu ini" jumlah={(jadwal ?? []).length} aksi={<TautanBagian href="/studio/jadwal">Kalender</TautanBagian>} className="lg:col-span-3">
          <JadwalList jadwal={(jadwal ?? []) as Jadwal[]} proyek={opsi} kosong="Tidak ada jadwal dalam 7 hari ke depan." />
        </Section>

        <Section judul="Program berjalan" jumlah={aktif.length} aksi={<TautanBagian href="/studio/proyek">Semua</TautanBagian>} className="lg:col-span-2">
          {aktif.length === 0 ? (
            <EmptyState message="Tidak ada program yang sedang berjalan." />
          ) : (
            <Panel>
              <ul className="divide-y divide-line">
                {aktif.slice(0, 6).map((p) => {
                  const lewat = Boolean(p.tenggat && p.tenggat < today);
                  return (
                    <li key={p.id}>
                      <Link href={`/studio/proyek/${p.id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-paper">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{p.nama}</p>
                          <p className={`mt-0.5 font-mono text-xs ${lewat ? "text-signal" : "text-ink-3"}`}>
                            {p.tenggat ? `${lewat ? "Lewat tenggat" : "Tenggat"} ${formatTanggal(p.tenggat)}` : "Tanpa tenggat"}
                          </p>
                        </div>
                        <Badge nilai={p.status} label={labelDari(STATUS_PROYEK, p.status)} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}
        </Section>
      </div>

      <Section judul="Episode terakhir" aksi={<TautanBagian href="/studio/laporan">Laporan bulanan</TautanBagian>} className="mt-10">
        <LaporanList laporan={(laporan ?? []) as Laporan[]} proyek={opsi} />
      </Section>
    </>
  );
}
