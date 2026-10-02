-- Proyek diperlakukan sebagai program / IP: di mana tayang, nama channel,
-- ritme tayang, dan target episode. Laporan jadi log episode lengkap dengan
-- bukti tayang. Perubahan ini hanya menambah kolom, kolom lama tidak dihapus.

alter table public.proyek
  add column if not exists kanal jsonb not null default '[]'::jsonb,
  add column if not exists jadwal_tayang text,
  add column if not exists target_episode int check (target_episode is null or target_episode > 0);

alter table public.laporan
  add column if not exists episode text,
  add column if not exists judul text,
  add column if not exists status text not null default 'tayang',
  add column if not exists platform text,
  add column if not exists link_tayang text,
  add column if not exists bukti_url text,
  add column if not exists catatan text;
alter table public.laporan alter column dikerjakan drop not null;
alter table public.laporan drop constraint if exists laporan_status_check;
alter table public.laporan add constraint laporan_status_check check (status in ('dikerjakan', 'tayang'));

-- Screenshot bukti tayang.
insert into storage.buckets (id, name, public)
values ('bukti-tayang', 'bukti-tayang', true)
on conflict (id) do nothing;

drop policy if exists "anggota unggah bukti" on storage.objects;
create policy "anggota unggah bukti" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'bukti-tayang' and public.is_anggota_studio());

drop policy if exists "anggota ubah bukti" on storage.objects;
create policy "anggota ubah bukti" on storage.objects
  for update to authenticated
  using (bucket_id = 'bukti-tayang' and public.is_anggota_studio());

drop policy if exists "anggota hapus bukti" on storage.objects;
create policy "anggota hapus bukti" on storage.objects
  for delete to authenticated
  using (bucket_id = 'bukti-tayang' and public.is_anggota_studio());
