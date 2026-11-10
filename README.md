# Studio Duamimbar

Web kerja Divisi Produksi Duamimbar (wajib login). Portofolio publik ada di web
**etalase** terpisah: repo `2mimbar-production/portofolio`
(https://2mimbar-portofolio.vercel.app), yang membaca data dari Studio ini.

`/` diarahkan ke `/studio`; link lama `/karya/[slug]` diteruskan ke
`/program/[slug]` di etalase (atur alamatnya lewat `NEXT_PUBLIC_ETALASE_URL`).

- **Studio** (`/studio`): alat kerja manajer produksi.
  - Ringkasan: proyek berjalan, jadwal 7 hari ke depan, laporan terakhir.
  - Proyek: status dari ide sampai selesai, tenggat, PIC, brief.
  - Jadwal: kalender bulanan per tahap (praproduksi, shooting, editing, review, rilis).
  - Laporan: catatan kerja harian per proyek, bisa difilter per bulan/proyek dan dicetak ke PDF.
  - Portofolio: tambah/ubah karya, unggah cover, status, kru, 5W2H, dan atur mana yang tampil di etalase.

## Setup

1. Skema database. Untuk project `qkoulearrmscqeykwviv` skema ini sudah terpasang.
   Untuk project Supabase baru, buka SQL Editor lalu jalankan isi
   `supabase/migrations/20261002000000_produksi.sql`.
2. Daftarkan email yang boleh masuk Studio:
   ```sql
   insert into public.anggota_studio (email, nama) values ('email@kamu.com', 'Nama');
   ```
   Akun login-nya dibuat di Authentication → Users → Add user.
3. Matikan pendaftaran umum: Authentication → Sign In / Providers → nonaktifkan "Allow new users to sign up".
4. Env var (Vercel / `.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   NEXT_PUBLIC_ETALASE_URL=    # opsional, default https://2mimbar-portofolio.vercel.app
   ```
   Env var Google Sheets (`SHEET_ID_*`, `GOOGLE_*`) dan `SUPABASE_SERVICE_ROLE_KEY` tidak dipakai lagi.

Etalase men-cache data 60 detik, jadi perubahan dari Studio muncul di etalase paling lambat semenit kemudian.

## Deploy ke Vercel

1. Di vercel.com, pilih Add New → Project, lalu import repo
   `2mimbar-production/2mimbar-production`. Vercel otomatis mengenali Next.js,
   jadi build command dan output tidak perlu diubah.
2. Di Environment Variables, isi `NEXT_PUBLIC_SUPABASE_URL` dan
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (lihat `.env.example`). Kuncinya ada di
   Supabase → Project Settings → API Keys.
3. Klik Deploy.
4. Setelah dapat domain (misalnya `xxx.vercel.app`), buka Supabase →
   Authentication → URL Configuration. Isi Site URL dengan domain itu dan
   tambahkan `https://xxx.vercel.app/**` ke Redirect URLs. Tanpa ini, link
   reset password akan mengarah ke localhost.

## Pengembangan

```
npm install
npm run dev
```
