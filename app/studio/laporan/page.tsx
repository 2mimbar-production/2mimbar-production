import { createClient } from "@/lib/supabase/server";
import { type Laporan, STATUS_EPISODE, hariIni, judulEpisode, labelDari } from "@/lib/produksi";
import FilterLaporan from "@/components/studio/FilterLaporan";
import LaporanList from "@/components/studio/LaporanList";
import TombolTambah from "@/components/studio/TombolTambah";
import { PageHeader } from "@/components/studio/ui";

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
        judul={`Laporan ${namaBulan}`}
        sub={namaFilter ? `Program: ${namaFilter}` : "Episode yang dikerjakan dan sudah tayang, per bulan."}
        aksi={
          <TombolTambah
            jenis="laporan"
            label="Catat episode"
            proyek={opsi}
            bawaan={proyekId ? { proyek_id: proyekId } : undefined}
          />
        }
      />
      <p className="-mt-4 mb-6 hidden text-sm text-muted print:block">Divisi Produksi Duamimbar</p>
      <FilterLaporan
        bulan={bulan}
        proyekId={proyekId}
        proyek={opsi}
        namaFile={`Laporan Produksi ${namaBulan}${namaFilter ? ` - ${namaFilter}` : ""}`}
        baris={baris}
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          [tayang.length, "episode tayang"],
          [laporan.length - tayang.length, "episode dikerjakan"],
          [rekap.size, "program"],
        ].map(([n, label]) => (
          <div key={label} className="rounded-2xl border border-denim-100 bg-white p-4 print:p-2">
            <p className="font-mono text-2xl text-denim-900">{n}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>
      {tanpaBukti > 0 && (
        <p className="-mt-2 mb-6 text-sm text-amber-700 print:hidden">
          {tanpaBukti} episode tayang belum punya bukti (link atau screenshot).
        </p>
      )}

      {rekapUrut.length > 1 && (
        <section className="mb-8 break-inside-avoid">
          <h2 className="mb-2 text-sm font-medium text-denim-700">Rekap per program</h2>
          <table className="cetak-tabel w-full overflow-hidden rounded-2xl border border-denim-100 bg-white text-left text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr>
                <th className="px-4 py-2 font-normal">Program</th>
                <th className="px-4 py-2 text-right font-normal">Tayang</th>
                <th className="px-4 py-2 text-right font-normal">Dikerjakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-denim-100">
              {rekapUrut.map(([nama, r]) => (
                <tr key={nama}>
                  <td className="px-4 py-2 text-denim-900">{nama}</td>
                  <td className="px-4 py-2 text-right font-mono">{r.tayang}</td>
                  <td className="px-4 py-2 text-right font-mono">{r.dikerjakan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <LaporanList laporan={laporan} proyek={opsi} kosong="Belum ada episode di bulan ini." />
    </>
  );
}
