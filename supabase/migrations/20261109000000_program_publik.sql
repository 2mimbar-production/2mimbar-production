-- Data publik untuk web portofolio program (repo 2mimbar-production/portofolio).
--
-- Tabel proyek & laporan tetap tertutup untuk publik (isinya catatan internal).
-- Web portofolio hanya membaca lewat dua fungsi di bawah, yang mengembalikan
-- kolom yang aman ditampilkan saja.
--
-- Aturan tampil:
--   * Program tampil kalau proyeknya terhubung ke karya (proyek.karya_id) yang
--     sudah "terbit", dan statusnya bukan "batal". Cover, ringkasan, deskripsi
--     dan video diambil dari karya itu, jadi cukup diatur di Studio → Portofolio.
--   * Episode tampil kalau statusnya "tayang" dan judulnya diisi (catatan kerja
--     harian format lama tidak ikut tampil).
--
-- Jalankan sekali di Supabase → SQL Editor. Aman dijalankan ulang.

create or replace function public.program_publik()
returns table (
  slug text,
  judul text,
  kategori text,
  klien text,
  tahun int,
  ringkasan text,
  deskripsi text,
  cover_url text,
  video_url text,
  link_url text,
  unggulan boolean,
  urutan int,
  status text,
  kanal jsonb,
  jadwal_tayang text,
  target_episode int,
  jumlah_episode int,
  episode_terakhir date
)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct on (k.id)
    k.slug, k.judul, k.kategori, k.klien, k.tahun, k.ringkasan, k.deskripsi,
    k.cover_url, k.video_url, k.link_url, k.unggulan, k.urutan,
    p.status, p.kanal, p.jadwal_tayang, p.target_episode,
    coalesce(e.jumlah, 0)::int, e.terakhir
  from public.karya k
  join public.proyek p on p.karya_id = k.id and p.status <> 'batal'
  left join lateral (
    select count(*) as jumlah, max(l.tanggal) as terakhir
    from public.laporan l
    where l.proyek_id = p.id and l.status = 'tayang' and nullif(trim(l.judul), '') is not null
  ) e on true
  where k.terbit
  order by k.id, p.updated_at desc;
$$;

create or replace function public.episode_publik(p_slug text)
returns table (
  episode text,
  judul text,
  tanggal date,
  platform text,
  link_tayang text
)
language sql
stable
security definer
set search_path = ''
as $$
  select l.episode, l.judul, l.tanggal, l.platform, l.link_tayang
  from public.karya k
  join public.proyek p on p.karya_id = k.id and p.status <> 'batal'
  join public.laporan l on l.proyek_id = p.id
  where k.terbit
    and k.slug = p_slug
    and l.status = 'tayang'
    and nullif(trim(l.judul), '') is not null
  order by l.tanggal desc, l.created_at desc;
$$;

revoke all on function public.program_publik() from public;
revoke all on function public.episode_publik(text) from public;
grant execute on function public.program_publik() to anon, authenticated;
grant execute on function public.episode_publik(text) to anon, authenticated;
