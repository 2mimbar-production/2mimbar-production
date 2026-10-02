"use client";

import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { type Laporan, PLATFORM, STATUS_EPISODE, hariIni } from "@/lib/produksi";
import { useSimpan } from "@/lib/useSimpan";
import { Input, Select, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Label, Modal, PesanError } from "./ui";
import { type ProyekOpsi, opsiTerpilih } from "./JadwalForm";

const FIELD = ["proyek_id", "status", "episode", "tanggal", "judul", "platform", "link_tayang", "bukti_url", "catatan"];

/** Platform program yang dipilih tampil paling atas di pilihan. */
function platformUntuk(p?: ProyekOpsi) {
  const milikProgram = (p?.kanal ?? []).map((k) => k.platform);
  return Array.from(new Set([...milikProgram, ...PLATFORM]));
}

export default function LaporanForm({
  awal,
  proyek,
  bawaan = {},
  onClose,
}: {
  awal?: Laporan;
  proyek: ProyekOpsi[];
  bawaan?: Partial<Record<string, string>>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Record<string, string>>(() => {
    const awalProyek = proyek.find((p) => p.id === (awal?.proyek_id ?? bawaan.proyek_id));
    const dasar: Record<string, string> = {
      tanggal: hariIni(),
      status: "tayang",
      platform: awalProyek?.kanal?.[0]?.platform ?? "YouTube",
      // Data format lama: baris pertama "dikerjakan" dipakai sebagai judul.
      judul: awal?.dikerjakan?.split("\n")[0] ?? "",
    };
    return Object.fromEntries(FIELD.map((k) => [k, String((awal as any)?.[k] ?? bawaan[k] ?? dasar[k] ?? "")]));
  });
  const [mengunggah, setMengunggah] = useState(false);
  const { jalankan, loading, error, setError } = useSimpan();
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const program = proyek.find((p) => p.id === form.proyek_id);
  const tayang = form.status === "tayang";

  function pilihProgram(e: React.ChangeEvent<HTMLSelectElement>) {
    const p = proyek.find((x) => x.id === e.target.value);
    setForm((f) => ({ ...f, proyek_id: e.target.value, platform: p?.kanal?.[0]?.platform ?? f.platform }));
  }

  async function unggahBukti(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5 MB.");
      return;
    }
    setMengunggah(true);
    setError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${form.proyek_id || "umum"}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("bukti-tayang").upload(path, file, { contentType: file.type });
    setMengunggah(false);
    if (error) {
      setError(`Gagal mengunggah: ${error.message}`);
      return;
    }
    const { data } = supabase.storage.from("bukti-tayang").getPublicUrl(path);
    setForm((f) => ({ ...f, bukti_url: data.publicUrl }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const data = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim() === "" ? null : v.trim()]));
    const supabase = createClient();
    const ok = await jalankan(() =>
      awal ? supabase.from("laporan").update(data).eq("id", awal.id) : supabase.from("laporan").insert(data)
    );
    if (ok) onClose();
  }

  async function hapus() {
    if (!awal || !confirm("Hapus episode ini dari laporan?")) return;
    const supabase = createClient();
    if (await jalankan(() => supabase.from("laporan").delete().eq("id", awal.id))) onClose();
  }

  return (
    <Modal judul={awal ? "Ubah episode" : "Catat episode"} onClose={onClose}>
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <Label teks="Program" className="col-span-2">
          <Select required value={form.proyek_id} onChange={pilihProgram}>
            <option value="" disabled>
              Pilih program
            </option>
            {opsiTerpilih(proyek, form.proyek_id).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </Select>
        </Label>
        <Label teks="Status">
          <Select value={form.status} onChange={set("status")}>
            {STATUS_EPISODE.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Label>
        <Label teks={tayang ? "Tanggal tayang" : "Tanggal dikerjakan"}>
          <Input type="date" required value={form.tanggal} onChange={set("tanggal")} />
        </Label>
        <Label teks="Episode">
          <Input value={form.episode} onChange={set("episode")} placeholder="Eps 12" />
        </Label>
        <Label teks="Platform">
          <Select value={form.platform} onChange={set("platform")}>
            {platformUntuk(program).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </Select>
        </Label>
        <Label teks="Judul episode" className="col-span-2">
          <Input required value={form.judul} onChange={set("judul")} placeholder="Mis. Kisah Para Perantau" />
        </Label>
        <Label teks={tayang ? "Link tayang (bukti)" : "Link draft / hasil render"} className="col-span-2">
          <Input type="url" value={form.link_tayang} onChange={set("link_tayang")} placeholder="https://youtu.be/..." />
        </Label>

        <div className="col-span-2">
          <span className="mb-1 block text-xs text-muted">Screenshot bukti tayang</span>
          {form.bukti_url ? (
            <div className="relative w-fit">
              <a href={form.bukti_url} target="_blank" rel="noreferrer">
                <img src={form.bukti_url} alt="Bukti tayang" className="max-h-40 rounded-lg border border-denim-100" />
              </a>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, bukti_url: "" }))}
                className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-muted shadow hover:text-red-600"
                aria-label="Hapus screenshot"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-denim-100 px-3 py-3 text-sm text-muted hover:border-denim-300">
              <ImagePlus size={16} />
              {mengunggah ? "Mengunggah..." : "Unggah gambar (maks. 5 MB)"}
              <input type="file" accept="image/*" className="hidden" onChange={unggahBukti} disabled={mengunggah} />
            </label>
          )}
        </div>

        <Label teks="Catatan" className="col-span-2">
          <Textarea rows={2} value={form.catatan} onChange={set("catatan")} placeholder="Opsional: views awal, kendala, kolaborator" />
        </Label>
        <div className="col-span-2 space-y-3">
          <PesanError pesan={error} />
          <div className="flex items-center gap-2">
            {awal && (
              <Button type="button" variant="danger" onClick={hapus} disabled={loading}>
                Hapus
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={onClose} className="ml-auto">
              Batal
            </Button>
            <Button type="submit" disabled={loading || mengunggah}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
