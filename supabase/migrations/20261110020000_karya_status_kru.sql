-- Status program di etalase (null = otomatis dari data proyek) dan credit kru.
alter table public.karya
  add column if not exists status_tayang text check (status_tayang in ('berjalan', 'segera', 'tamat')),
  add column if not exists kru jsonb not null default '[]'::jsonb;
