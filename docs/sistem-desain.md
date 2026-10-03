# Sistem desain Duamimbar Produksi

Bahasa visualnya diambil dari logo: bidang datar, sudut tegas, satu warna merek (denim), dan huruf condensed seperti papan slate produksi.

## Token

| Token | Nilai | Dipakai untuk |
| --- | --- | --- |
| `brand` | `#1A2E95` | Tombol utama, tautan, tab aktif, angka progres |
| `brand-900` | `#101A4F` | Sidebar Studio, header & footer situs |
| `ink`, `ink-2`, `ink-3`, `ink-4` | `#0E1433` → `#9A9EB0` | Teks utama → teks paling samar |
| `paper` | `#F4F2ED` | Latar halaman, kepala tabel |
| `line`, `line-strong` | `#E3E0D8`, `#CBC7BB` | Garis panel, border input |
| `signal` | `#E0352B` | Hanya episode tayang, lewat tenggat, dan hapus |

Radius maksimal 6px (`rounded-lg`). Tidak ada bayangan kecuali modal.

## Huruf

- **Judul**: `font-display` (Archivo condensed, tebal). Satu-satunya gaya judul. Ukuran membedakan level: halaman 44px, bagian 20px, angka readout 40px.
- **Isi**: Archivo lebar normal.
- **Metadata**: `label-meta` (IBM Plex Mono, huruf besar, 11px) untuk label form, kepala kolom, kicker di atas judul. Tanggal dan angka di tabel memakai `font-mono`.

## Hierarki halaman Studio

1. `PageHeader`: kicker (opsional), judul, satu aksi utama di kanan.
2. `Readout`: angka kunci dalam satu panel bergaris, kalau halaman punya angka penting.
3. `Section`: judul bagian + jumlah + tautan, isinya `Panel` atau tabel.

Komponen ada di `components/studio/ui.tsx`. Tombol di `components/ui/Button.tsx` (`kelasTombol()` untuk `<Link>`).

## Status

Status ditandai titik warna + teks, bukan pill berwarna. Petanya di `Badge` (`components/studio/ui.tsx`). Episode tayang memakai titik merah bulat ("on air"); status lain kotak kecil.
