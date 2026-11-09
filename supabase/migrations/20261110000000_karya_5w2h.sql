-- 5W2H program untuk web etalase. When/Where/How much diambil dari data
-- proyek (jadwal tayang, kanal, episode), jadi yang disimpan hanya 4 kolom ini.
alter table public.karya
  add column if not exists apa text,
  add column if not exists mengapa text,
  add column if not exists siapa text,
  add column if not exists bagaimana text;

-- Fungsi publik ikut mengirim 5W2H. Return type berubah, jadi drop dulu.
drop function if exists public.program_publik();
create function public.program_publik()
returns table (
  slug text, judul text, kategori text, klien text, tahun int, ringkasan text, deskripsi text,
  cover_url text, video_url text, link_url text, unggulan boolean, urutan int, status text,
  kanal jsonb, jadwal_tayang text, target_episode int, jumlah_episode int, episode_terakhir date,
  apa text, mengapa text, siapa text, bagaimana text
)
language sql stable security definer set search_path = ''
as $$
  select distinct on (k.id)
    k.slug, k.judul, k.kategori, k.klien, k.tahun, k.ringkasan, k.deskripsi,
    k.cover_url, k.video_url, k.link_url, k.unggulan, k.urutan,
    p.status, coalesce(p.kanal, '[]'::jsonb), p.jadwal_tayang, p.target_episode,
    coalesce(e.jumlah, 0)::int, e.terakhir,
    k.apa, k.mengapa, k.siapa, k.bagaimana
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

revoke all on function public.program_publik() from public;
grant execute on function public.program_publik() to anon, authenticated;
