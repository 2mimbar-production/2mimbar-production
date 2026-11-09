-- 5W2H program untuk web etalase. When/Where/How much diambil dari data
-- proyek (jadwal tayang, kanal, episode), jadi yang disimpan hanya 4 kolom ini.
-- Etalase membaca kolom ini langsung dari tabel karya (RLS "publik baca karya terbit").
alter table public.karya
  add column if not exists apa text,
  add column if not exists mengapa text,
  add column if not exists siapa text,
  add column if not exists bagaimana text;
