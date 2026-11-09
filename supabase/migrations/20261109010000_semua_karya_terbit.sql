-- Etalase menampilkan SEMUA karya yang terbit. Proyek (program) yang
-- terhubung lewat proyek.karya_id hanya menambah data tayang: status, kanal,
-- jadwal, dan episode. Karya tanpa program dianggap sudah tamat.
-- Karya yang programnya berstatus "batal" tetap disembunyikan.

create or replace function public.program_publik()
returns table (
  slug text, judul text, kategori text, klien text, tahun int, ringkasan text, deskripsi text,
  cover_url text, video_url text, link_url text, unggulan boolean, urutan int, status text,
  kanal jsonb, jadwal_tayang text, target_episode int, jumlah_episode int, episode_terakhir date
)
language sql stable security definer set search_path = ''
as $$
  select distinct on (k.id)
    k.slug, k.judul, k.kategori, k.klien, k.tahun, k.ringkasan, k.deskripsi,
    k.cover_url, k.video_url, k.link_url, k.unggulan, k.urutan,
    p.status, coalesce(p.kanal, '[]'::jsonb), p.jadwal_tayang, p.target_episode,
    coalesce(e.jumlah, 0)::int, e.terakhir
  from public.karya k
  left join public.proyek p on p.karya_id = k.id
  left join lateral (
    select count(*) as jumlah, max(l.tanggal) as terakhir
    from public.laporan l
    where l.proyek_id = p.id and l.status = 'tayang' and nullif(trim(l.judul), '') is not null
  ) e on true
  where k.terbit and p.status is distinct from 'batal'
  order by k.id, p.updated_at desc nulls last;
$$;
