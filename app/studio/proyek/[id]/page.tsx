import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { type Jadwal, type Laporan, type Proyek, STATUS_PROYEK, formatTanggal, labelDari } from "@/lib/produksi";
import ProyekAksi from "@/components/studio/ProyekAksi";
import JadwalList from "@/components/studio/JadwalList";
import LaporanList from "@/components/studio/LaporanList";
import TombolTambah from "@/components/studio/TombolTambah";
import { PageHeader, Section } from "@/components/studio/ui";

export default async function ProyekDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data } = await supabase.from("proyek").select("*").eq("id", params.id).maybeSingle();
  if (!data) notFound();
  const proyek = data as Proyek;

  const [{ data: jadwal }, { data: laporan }] = await Promise.all([
    supabase.from("jadwal").select("*").eq("proyek_id", proyek.id).order("tanggal"),
    supabase
      .from("laporan")
      .select("*")
      .eq("proyek_id", proyek.id)
      .order("tanggal", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);
  const opsi = [{ id: proyek.id, nama: proyek.nama, kanal: proyek.kanal }];
  const episode = (laporan ?? []) as Laporan[];
  // Satu episode bisa tayang di beberapa platform; hitung episodenya, bukan barisnya.
  const jumlahTayang = new Set(
    episode.filter((l) => l.status === "tayang").map((l) => (l.episode || l.judul || l.id).trim().toLowerCase())
  ).size;
  const persen = proyek.target_episode ? Math.min(100, Math.round((jumlahTayang / proyek.target_episode) * 100)) : null;
  const bawaan = { proyek_id: proyek.id };

  const info = [
    ["Pemilik IP / klien", proyek.klien],
    ["PIC", proyek.pic],
    ["Jadwal tayang", proyek.jadwal_tayang],
    ["Mulai", proyek.tanggal_mulai && formatTanggal(proyek.tanggal_mulai)],
    ["Tenggat", proyek.tenggat && formatTanggal(proyek.tenggat)],
    ["Selesai", proyek.tanggal_selesai && formatTanggal(proyek.tanggal_selesai)],
  ].filter(([, v]) => v);

  return (
    <>
      <Link href="/studio/proyek" className="label-meta mb-4 inline-flex items-center gap-1.5 hover:text-ink">
        <ArrowLeft size={13} /> Semua program
      </Link>

      <PageHeader
        kicker={[proyek.jenis, labelDari(STATUS_PROYEK, proyek.status)].filter(Boolean).join("  /  ")}
        judul={proyek.nama}
        aksi={<ProyekAksi proyek={proyek} />}
      />

      <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line lg:grid-cols-[1.1fr_2fr]">
        <div className="bg-white p-5">
          <p className="label-meta">Episode tayang</p>
          <p className="font-display mt-2 text-[3.5rem] leading-none text-ink">
            {jumlahTayang}
            {proyek.target_episode && <span className="text-ink-4"> / {proyek.target_episode}</span>}
          </p>
          {persen != null && (
            <div className="mt-4">
              <div className="h-1.5 bg-line">
                <div className="h-full bg-brand" style={{ width: `${persen}%` }} />
              </div>
              <p className="mt-1.5 font-mono text-xs text-ink-3">{persen}% dari target</p>
            </div>
          )}
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 bg-white p-5 sm:grid-cols-3">
          {info.map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="label-meta">{k}</dt>
              <dd className="mt-1 text-sm text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {proyek.kanal?.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="label-meta mr-1">Tayang di</span>
          {proyek.kanal.map((k, i) => {
            const isi = (
              <>
                <span className="font-semibold">{k.platform}</span>
                {k.nama && <span className="text-ink-3">{k.nama}</span>}
                {k.link && <ArrowUpRight size={14} className="text-ink-3" />}
              </>
            );
            const kelas = "flex items-center gap-1.5 rounded border border-line-strong bg-white px-2.5 py-1.5 text-sm text-ink";
            return k.link ? (
              <a key={i} href={k.link} target="_blank" rel="noreferrer" className={`${kelas} transition-colors hover:border-brand`}>
                {isi}
              </a>
            ) : (
              <span key={i} className={kelas}>
                {isi}
              </span>
            );
          })}
        </div>
      )}
      {proyek.catatan && (
        <p className="mt-6 max-w-3xl whitespace-pre-line border-l-2 border-brand pl-4 text-sm leading-relaxed text-ink-2">
          {proyek.catatan}
        </p>
      )}

      <Section
        judul="Episode"
        jumlah={episode.length}
        aksi={<TombolTambah jenis="laporan" label="Catat episode" proyek={opsi} bawaan={bawaan} />}
        className="mt-12"
      >
        <LaporanList laporan={episode} proyek={opsi} tampilkanProyek={false} kosong="Belum ada episode yang dicatat untuk program ini." />
      </Section>

      <Section
        judul="Jadwal produksi"
        jumlah={(jadwal ?? []).length}
        aksi={<TombolTambah jenis="jadwal" label="Jadwal" variant="secondary" proyek={opsi} bawaan={bawaan} />}
        className="mt-12"
      >
        <JadwalList jadwal={(jadwal ?? []) as Jadwal[]} proyek={opsi} tampilkanProyek={false} kosong="Belum ada jadwal untuk program ini." />
      </Section>
    </>
  );
}
