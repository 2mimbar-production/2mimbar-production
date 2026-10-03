import { createClient } from "@/lib/supabase/server";
import { type Laporan, STATUS_EPISODE, hariIni, judulEpisode, labelDari } from "@/lib/produksi";
import FilterLaporan from "@/components/studio/FilterLaporan";
import LaporanList from "@/components/studio/LaporanList";
import TombolTambah from "@/components/studio/TombolTambah";
import { PageHeader, Readout, Section } from "@/components/studio/ui";

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: { bulan?: string; proyek?: string };
}) {
  const bulan = /^\d{4}-(0[1-9]|1[0-2])$/.test(searchParams.bulan ?? "") ? searchParams.bulan! : hariIni().slice(0, 7);
  const [y, m] = bulan.split("-").map(Number);
  const akhir = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  const proyekId = searchParams.proyek ?? "";

  const supabase = createClient();
  let query = supabase
    .from("laporan")
    .select("*")
    .gte("tanggal", `${bulan}-01`)
    .lte("tanggal", akhir)
    .order("tanggal", { ascending: true })
    .order("created_at", { ascending: true });
  if (proyekId) query = query.eq("proyek_id", proyekId);

  const [{ data }, { data: proyek }] = await Promise.all([
    query,
    supabase.from("proyek").select("id, nama, status, kanal").order("nama"),
  ]);
  const laporan = (data ?? []) as Laporan[];
  const opsi = proyek ?? [];
  const namaProyek = new Map(opsi.map((p) => [p.id, p.nama]));
  const program = (l: Laporan) => (l.proyek_id && namaProyek.get(l.proyek_id)) || "Umum";

  const tayang = laporan.filter((l) => l.status === "tayang");
  const tanpaBukti = tayang.filter((l) => !l.link_tayang && !l.bukti_url).length;
  const namaBulan = new Date(`${bulan}-01T00:00:00Z`).toLocaleDateString("id-ID", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
  const namaFilter = opsi.find((p) => p.id === proyekId)?.nama;

  // Rekap per program, urut dari yang paling banyak tayang.
  const rekap = new Map<string, { tayang: number; dikerjakan: number }>();
  for (const l of laporan) {
    const r = rekap.get(program(l)) ?? { tayang: 0, dikerjakan: 0 };
    r[l.status === "tayang" ? "tayang" : "dikerjakan"]++;
    rekap.set(program(l), r);
  }
  const rekapUrut = Array.from(rekap).sort((a, b) => b[1].tayang - a[1].tayang);

  const baris = [
    ["Tanggal", "Program", "Episode", "Judul", "Platform", "Status", "Link tayang", "Screenshot bukti", "Catatan"],
    ...laporan.map((l) => [
      l.tanggal,
      program(l),
      l.episode ?? "",
      l.judul ?? judulEpisode(l),
      l.platform ?? "",
      labelDari(STATUS_EPISODE, l.status),
      l.link_tayang ?? "",
      l.bukti_url ?? "",
      l.catatan ?? "",
    ]),
  ];

  return (
    <>
      <PageHeader
        kicker={namaFilter ? `Laporan bulanan  /  ${namaFilter}` : "Laporan bulanan"}
        judul={namaBulan}
        sub="Episode yang dikerjakan dan sudah tayang. Unduh sebagai PDF atau Excel untuk laporan bulanan."
        aksi={
          <TombolTambah
            jenis="laporan"
            label="Catat episode"
            proyek={opsi}
            bawaan={proyekId ? { proyek_id: proyekId } : undefined}
          />
        }
      />
      <FilterLaporan
        bulan={bulan}
        proyekId={proyekId}
        proyek={opsi}
        namaFile={`Laporan Produksi ${namaBulan}${namaFilter ? ` - ${namaFilter}` : ""}`}
        baris={baris}
      />

      <Readout
        item={[
          { n: tayang.length, label: "Episode tayang" },
          { n: laporan.length - tayang.length, label: "Sedang dikerjakan" },
          { n: rekap.size, label: "Program" },
          { n: tanpaBukti, label: "Tayang tanpa bukti", peringatan: tanpaBukti > 0 },
        ]}
      />

      {rekapUrut.length > 1 && (
        <Section judul="Rekap per program" className="mt-10 break-inside-avoid">
          <div className="overflow-hidden rounded-md border border-line bg-white">
            <table className="cetak-tabel w-full text-left text-sm">
              <thead className="label-meta border-b border-line bg-paper">
                <tr>
                  <th className="px-4 py-2.5 font-normal">Program</th>
                  <th className="w-28 px-4 py-2.5 text-right font-normal">Tayang</th>
                  <th className="w-28 px-4 py-2.5 text-right font-normal">Dikerjakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rekapUrut.map(([nama, r]) => (
                  <tr key={nama}>
                    <td className="px-4 py-2.5 font-medium text-ink">{nama}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-ink">{r.tayang}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-ink-3">{r.dikerjakan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <Section judul="Daftar episode" jumlah={laporan.length} className="mt-10">
        <LaporanList laporan={laporan} proyek={opsi} kosong="Belum ada episode di bulan ini." />
      </Section>
    </>
  );
}
