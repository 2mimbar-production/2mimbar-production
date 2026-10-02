"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { type Kanal, type Proyek, PLATFORM, STATUS_PROYEK, hariIni } from "@/lib/produksi";
import { useSimpan } from "@/lib/useSimpan";
import { Input, Select, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Label, Modal, PesanError } from "./ui";

const KOSONG = {
  nama: "",
  klien: "",
  jenis: "",
  status: "ide",
  tanggal_mulai: "",
  tenggat: "",
  tanggal_selesai: "",
  pic: "",
  jadwal_tayang: "",
  target_episode: "",
  catatan: "",
};

const KANAL_BARU: Kanal = { platform: "YouTube", nama: "", link: "" };

export default function ProyekForm({ awal, onClose }: { awal?: Proyek; onClose: () => void }) {
  const [form, setForm] = useState<Record<string, string>>(() =>
    awal
      ? Object.fromEntries(Object.keys(KOSONG).map((k) => [k, String((awal as any)[k] ?? "")]))
      : { ...KOSONG }
  );
  const [kanal, setKanal] = useState<Kanal[]>(() => (awal?.kanal?.length ? awal.kanal : [{ ...KANAL_BARU }]));
  const { jalankan, loading, error } = useSimpan();
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const setKanalItem = (i: number, k: keyof Kanal, v: string) =>
    setKanal((list) => list.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const data: Record<string, unknown> = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim() === "" ? null : v.trim()])
    );
    data.target_episode = form.target_episode ? Number(form.target_episode) : null;
    data.kanal = kanal
      .map((x) => ({ platform: x.platform, nama: x.nama.trim(), link: x.link.trim() }))
      .filter((x) => x.nama || x.link);
    if (data.status === "selesai" && !data.tanggal_selesai) data.tanggal_selesai = hariIni();
    const supabase = createClient();
    const ok = await jalankan(() =>
      awal ? supabase.from("proyek").update(data).eq("id", awal.id) : supabase.from("proyek").insert(data)
    );
    if (ok) onClose();
  }

  return (
    <Modal judul={awal ? "Ubah program" : "Program baru"} onClose={onClose}>
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <Label teks="Nama program / proyek" className="col-span-2">
          <Input required value={form.nama} onChange={set("nama")} placeholder="Mis. Hikayat Podcast Season 2" />
        </Label>
        <Label teks="Pemilik IP / klien">
          <Input value={form.klien} onChange={set("klien")} placeholder="Duamimbar" />
        </Label>
        <Label teks="Format konten">
          <Input value={form.jenis} onChange={set("jenis")} placeholder="Podcast, series, short..." />
        </Label>
        <Label teks="Status">
          <Select value={form.status} onChange={set("status")}>
            {STATUS_PROYEK.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Label>
        <Label teks="PIC">
          <Input value={form.pic} onChange={set("pic")} />
        </Label>

        <fieldset className="col-span-2 space-y-2 rounded-xl border border-denim-100 p-3">
          <legend className="px-1 text-xs text-muted">Tayang di</legend>
          {kanal.map((k, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <Select
                value={k.platform}
                onChange={(e) => setKanalItem(i, "platform", e.target.value)}
                aria-label="Platform"
                className="!w-32 shrink-0"
              >
                {PLATFORM.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
              <Input
                value={k.nama}
                onChange={(e) => setKanalItem(i, "nama", e.target.value)}
                placeholder="Nama channel / akun"
                aria-label="Nama channel"
                className="min-w-0 flex-1"
              />
              <Input
                type="url"
                value={k.link}
                onChange={(e) => setKanalItem(i, "link", e.target.value)}
                placeholder="https://youtube.com/@..."
                aria-label="Link channel"
                className="order-last basis-full"
              />
              <button
                type="button"
                onClick={() => setKanal((list) => list.filter((_, j) => j !== i))}
                className="shrink-0 rounded-lg p-2 text-muted hover:bg-surface"
                aria-label="Hapus platform"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setKanal((list) => [...list, { ...KANAL_BARU, platform: list.length ? "Spotify" : "YouTube" }])}
            className="flex items-center gap-1 text-sm text-denim-500 hover:underline"
          >
            <Plus size={14} /> Tambah platform
          </button>
        </fieldset>

        <Label teks="Jadwal tayang">
          <Input value={form.jadwal_tayang} onChange={set("jadwal_tayang")} placeholder="Tiap Jumat, 19.00" />
        </Label>
        <Label teks="Target episode">
          <Input type="number" min={1} inputMode="numeric" value={form.target_episode} onChange={set("target_episode")} placeholder="12" />
        </Label>
        <Label teks="Mulai">
          <Input type="date" value={form.tanggal_mulai} onChange={set("tanggal_mulai")} />
        </Label>
        <Label teks="Tenggat">
          <Input type="date" value={form.tenggat} onChange={set("tenggat")} />
        </Label>
        {form.status === "selesai" && (
          <Label teks="Tanggal selesai" className="col-span-2">
            <Input type="date" value={form.tanggal_selesai} onChange={set("tanggal_selesai")} />
          </Label>
        )}
        <Label teks="Catatan / brief" className="col-span-2">
          <Textarea rows={3} value={form.catatan} onChange={set("catatan")} />
        </Label>
        <div className="col-span-2 space-y-3">
          <PesanError pesan={error} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
