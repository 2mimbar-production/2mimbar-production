"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { type Karya, type Kru, KATEGORI_KARYA, STATUS_TAYANG, slugify, thumbnailDari } from "@/lib/produksi";
import { useSimpan } from "@/lib/useSimpan";
import { Input, Select, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Label, Modal, PesanError } from "./ui";

const TEKS = ["judul", "slug", "kategori", "klien", "tahun", "ringkasan", "deskripsi", "video_url", "link_url", "cover_url", "urutan", "apa", "mengapa", "siapa", "bagaimana"];

export default function KaryaForm({ awal, onClose }: { awal?: Karya; onClose: () => void }) {
  const [form, setForm] = useState<Record<string, string>>(() =>
    Object.fromEntries(TEKS.map((k) => [k, String((awal as any)?.[k] ?? (k === "kategori" ? "Video" : k === "urutan" ? "0" : ""))]))
  );
  const [terbit, setTerbit] = useState(awal?.terbit ?? false);
  const [statusTayang, setStatusTayang] = useState<string>(awal?.status_tayang ?? "");
  const [kru, setKru] = useState<Kru[]>(() => (awal?.kru?.length ? awal.kru : [{ nama: "", peran: "" }]));
  const setKruItem = (i: number, k: keyof Kru, v: string) =>
    setKru((list) => list.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const [unggulan, setUnggulan] = useState(awal?.unggulan ?? false);
  const [slugManual, setSlugManual] = useState(Boolean(awal));
  const [mengunggah, setMengunggah] = useState(false);
  const { jalankan, loading, error, setError } = useSimpan();
  const supabase = createClient();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v, ...(k === "judul" && !slugManual ? { slug: slugify(v) } : {}) }));
  };

  async function unggahCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5 MB.");
      return;
    }
    setMengunggah(true);
    setError(null);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `cover/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("portofolio").upload(path, file, { contentType: file.type });
    setMengunggah(false);
    if (error) {
      setError(`Gagal mengunggah: ${error.message}`);
      return;
    }
    const { data } = supabase.storage.from("portofolio").getPublicUrl(path);
    setForm((f) => ({ ...f, cover_url: data.publicUrl }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const slug = slugify(form.slug || form.judul);
    if (!slug) {
      setError("Slug tidak valid. Isi judul dengan huruf atau angka.");
      return;
    }
    const data = {
      ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim() === "" ? null : v.trim()])),
      slug,
      tahun: form.tahun ? Number(form.tahun) : null,
      urutan: Number(form.urutan) || 0,
      terbit,
      unggulan,
      status_tayang: statusTayang || null,
      kru: kru.map((x) => ({ nama: x.nama.trim(), peran: x.peran.trim() })).filter((x) => x.nama),
    };
    const ok = await jalankan(() =>
      awal ? supabase.from("karya").update(data).eq("id", awal.id) : supabase.from("karya").insert(data)
    );
    if (ok) onClose();
  }

  async function hapus() {
    if (!awal || !confirm(`Hapus "${awal.judul}" dari portofolio?`)) return;
    if (await jalankan(() => supabase.from("karya").delete().eq("id", awal.id))) onClose();
  }

  const preview = thumbnailDari({ cover_url: form.cover_url || null, video_url: form.video_url || null });

  return (
    <Modal judul={awal ? "Ubah karya" : "Karya baru"} onClose={onClose}>
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <Label teks="Judul" className="col-span-2">
          <Input required value={form.judul} onChange={set("judul")} />
        </Label>
        <Label teks="Alamat halaman (slug)" className="col-span-2">
          <Input
            value={form.slug}
            onChange={(e) => {
              setSlugManual(true);
              set("slug")(e);
            }}
            placeholder="otomatis dari judul"
          />
        </Label>
        <Label teks="Kategori">
          <Input list="kategori-karya" required value={form.kategori} onChange={set("kategori")} />
          <datalist id="kategori-karya">
            {KATEGORI_KARYA.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
        </Label>
        <Label teks="Tahun">
          <Input type="number" min={1990} max={2100} value={form.tahun} onChange={set("tahun")} />
        </Label>
        <Label teks="Klien" className="col-span-2">
          <Input value={form.klien} onChange={set("klien")} placeholder="Kosongkan untuk produksi internal" />
        </Label>
        <Label teks="Ringkasan (1-2 kalimat)" className="col-span-2">
          <Textarea rows={2} value={form.ringkasan} onChange={set("ringkasan")} />
        </Label>
        <Label teks="Cerita di balik karya" className="col-span-2">
          <Textarea rows={5} value={form.deskripsi} onChange={set("deskripsi")} placeholder="Brief, peran tim, tantangan produksi, hasil..." />
        </Label>
        <Label teks="Link video (YouTube/Vimeo, tampil sebagai pemutar)" className="col-span-2">
          <Input type="url" value={form.video_url} onChange={set("video_url")} placeholder="https://youtu.be/..." />
        </Label>
        <Label teks="Link lain (Instagram, Spotify, dll.)" className="col-span-2">
          <Input type="url" value={form.link_url} onChange={set("link_url")} />
        </Label>

        <Label teks="Status program di etalase" className="col-span-2">
          <Select value={statusTayang} onChange={(e) => setStatusTayang(e.target.value)}>
            <option value="">Otomatis (dari data program)</option>
            {STATUS_TAYANG.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Label>

        <fieldset className="col-span-2 space-y-2 rounded-xl border border-denim-100 p-3">
          <legend className="px-1 text-xs text-muted">Kru / credit (tampil di etalase)</legend>
          {kru.map((k, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={k.peran}
                onChange={(e) => setKruItem(i, "peran", e.target.value)}
                placeholder="Peran, mis. Host"
                aria-label="Peran"
                className="!w-36 shrink-0"
              />
              <Input
                value={k.nama}
                onChange={(e) => setKruItem(i, "nama", e.target.value)}
                placeholder="Nama"
                aria-label="Nama"
                className="min-w-0 flex-1"
              />
              <button
                type="button"
                onClick={() => setKru((list) => list.filter((_, j) => j !== i))}
                className="shrink-0 rounded-lg p-2 text-muted hover:bg-surface"
                aria-label="Hapus kru"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setKru((list) => [...list, { nama: "", peran: "" }])}
            className="flex items-center gap-1 text-sm text-denim-500 hover:underline"
          >
            <Plus size={14} /> Tambah kru
          </button>
          <p className="text-xs text-muted">Satu orang dengan beberapa peran: tulis di satu baris, mis. "Produser, Editor".</p>
        </fieldset>

        <fieldset className="col-span-2 space-y-3 rounded-xl border border-denim-100 p-3">
          <legend className="px-1 text-xs text-muted">5W2H untuk etalase program (opsional)</legend>
          <p className="text-xs text-muted">
            When, Where, dan How much terisi otomatis dari jadwal tayang, kanal, dan jumlah episode program.
          </p>
          <Label teks="What: program ini tentang apa?">
            <Textarea rows={2} value={form.apa} onChange={set("apa")} placeholder="Podcast kisah para nabi dengan sentuhan parenting" />
          </Label>
          <Label teks="Why: kenapa program ini dibuat?">
            <Textarea rows={2} value={form.mengapa} onChange={set("mengapa")} placeholder="Menghadirkan kisah Islam yang relevan untuk keluarga muda" />
          </Label>
          <Label teks="Who: untuk siapa, dan siapa pengisinya?">
            <Textarea rows={2} value={form.siapa} onChange={set("siapa")} placeholder="Orang tua muda 25-40 tahun; bersama Ustadz Budi Ashari" />
          </Label>
          <Label teks="How: formatnya seperti apa?">
            <Textarea rows={2} value={form.bagaimana} onChange={set("bagaimana")} placeholder="Video podcast 30-45 menit, dua narasumber" />
          </Label>
        </fieldset>

        <div className="col-span-2">
          <span className="mb-1 block text-xs text-muted">Cover</span>
          <div className="flex items-center gap-3">
            <div className="aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-denim-50">
              {preview && <img src={preview} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="space-y-1 text-sm">
              <input type="file" accept="image/*" onChange={unggahCover} disabled={mengunggah} className="text-xs" />
              <p className="text-xs text-muted">
                {mengunggah ? "Mengunggah..." : "Tanpa cover, thumbnail YouTube dipakai otomatis."}
              </p>
              {form.cover_url && (
                <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => setForm((f) => ({ ...f, cover_url: "" }))}>
                  Hapus cover
                </button>
              )}
            </div>
          </div>
        </div>

        <Label teks="Urutan tampil (kecil = duluan)">
          <Input type="number" value={form.urutan} onChange={set("urutan")} />
        </Label>
        <div className="flex flex-col justify-end gap-2 pb-1 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={terbit} onChange={(e) => setTerbit(e.target.checked)} /> Tampilkan di situs
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={unggulan} onChange={(e) => setUnggulan(e.target.checked)} /> Karya pilihan
          </label>
        </div>

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
